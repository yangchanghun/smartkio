import base64
import io
import json
import math
import re
import subprocess
import wave
from array import array
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response

from catalog.views import KioskSessionPermission


MAX_AUDIO_BYTES = 4 * 1024 * 1024
VALID_TARGETS = {"destination_search", "taxi_service"}

SCENARIOS = {
    "call_taxi_now": {
        "answer": "택시를 호출하려면 어디로 갈까요 버튼을 눌러 출발지와 목적지를 입력해 주세요. 아래의 택시 버튼을 눌러도 같은 연습을 시작할 수 있어요.",
        "target_ids": ["destination_search", "taxi_service"],
    },
    "vague_start_help": {
        "answer": "택시 호출 연습을 시작하려면 어디로 갈까요 또는 택시 버튼을 눌러주세요.",
        "target_ids": ["destination_search", "taxi_service"],
    },
    "ask_destination_search": {
        "answer": "어디로 갈까요 버튼을 누르면 출발지와 목적지를 정하는 화면으로 이동해요.",
        "target_ids": ["destination_search"],
    },
    "ask_taxi_service": {
        "answer": "택시 버튼을 누르면 택시 호출 연습을 시작할 수 있어요.",
        "target_ids": ["taxi_service"],
    },
    "ask_taxi_reservation": {
        "answer": "택시예약 기능은 현재 연습에서 지원하지 않아요. 지금 택시를 부르는 연습은 어디로 갈까요 또는 택시 버튼을 눌러 시작해 주세요.",
        "target_ids": ["destination_search", "taxi_service"],
    },
    "ask_inactive_service": {
        "answer": "그 기능은 현재 연습에서 지원하지 않아요. 이 화면에서는 어디로 갈까요 또는 택시 버튼으로 택시 호출을 연습할 수 있어요.",
        "target_ids": ["destination_search", "taxi_service"],
    },
    "explain_app": {
        "answer": "스마트키오는 스마트폰 앱 사용법을 안전하게 연습하는 교육용 앱이에요. 이 화면에서는 실제 택시를 부르지 않고 카카오T 택시 호출 과정을 연습할 수 있어요.",
        "target_ids": [],
    },
    "ask_cost_or_eta": {
        "answer": "요금과 예상 시간은 목적지를 정한 다음 확인할 수 있어요. 먼저 어디로 갈까요 버튼을 눌러주세요.",
        "target_ids": ["destination_search"],
    },
    "greeting": {
        "answer": "안녕하세요. 카카오T 택시 호출 연습을 도와드릴게요. 궁금한 점을 말씀해 주세요.",
        "target_ids": [],
    },
    "unrelated_or_unsupported": {
        "answer": "현재는 카카오T 택시 호출 연습과 관련된 질문만 안내해 드릴 수 있어요. 택시를 부르려면 어디로 갈까요 또는 택시 버튼을 눌러주세요.",
        "target_ids": ["destination_search", "taxi_service"],
    },
}

FALLBACK = {
    "answer": "질문을 정확히 이해하지 못했어요. 택시를 부르는 방법처럼 이 화면에서 궁금한 내용을 다시 말씀해 주세요.",
    "target_ids": ["destination_search", "taxi_service"],
}

MINIMUM_MEAN_VOLUME_DB = -50.0


def _has_audible_signal(audio_bytes, mime_type):
    """Reject silence before Gemini gets a chance to invent a transcript."""
    if mime_type in {"audio/wav", "audio/x-wav", "audio/wave"}:
        try:
            with wave.open(io.BytesIO(audio_bytes), "rb") as wav_file:
                if wav_file.getsampwidth() != 2:
                    return None
                samples = array("h", wav_file.readframes(wav_file.getnframes()))
                if not samples:
                    return False
                mean_square = sum(sample * sample for sample in samples) / len(samples)
                rms = math.sqrt(mean_square)
                mean_volume_db = 20 * math.log10(max(rms, 1) / 32768)
                return mean_volume_db > MINIMUM_MEAN_VOLUME_DB
        except (EOFError, wave.Error):
            return None

    try:
        completed = subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-nostdin",
                "-i",
                "pipe:0",
                "-af",
                "volumedetect",
                "-f",
                "null",
                "-",
            ],
            input=audio_bytes,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            timeout=10,
            check=False,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return None
    match = re.search(rb"mean_volume:\s*(-?\d+(?:\.\d+)?)\s*dB", completed.stderr)
    if not match:
        return None
    return float(match.group(1)) > MINIMUM_MEAN_VOLUME_DB

CLASSIFIER_PROMPT = """
당신은 교육용 SmartKio 앱의 카카오T 첫 화면 음성 안내 분류기입니다.
첨부된 한국어 음성을 정확히 받아쓰고, 아래 의도 중 정확히 하나로 분류하세요.

- call_taxi_now: 지금 택시를 호출하거나 특정 장소로 가고 싶다
- vague_start_help: 무엇을 눌러야 하는지, 어떻게 시작하는지 막연하게 묻는다
- ask_destination_search: '어디로 갈까요', 출발지 또는 목적지 입력 방법을 묻는다
- ask_taxi_service: 택시 버튼의 기능을 묻는다
- ask_taxi_reservation: 택시 예약 또는 미리 부르기를 묻는다
- ask_inactive_service: 렌터카, 바이크, 기차, 버스 등 지원하지 않는 기능을 묻는다
- explain_app: SmartKio 또는 이 연습 앱의 기능과 목적을 묻는다
- ask_cost_or_eta: 택시 요금, 도착 시간 또는 소요 시간을 묻는다
- greeting: 인사하거나 질문 가능한지 묻는다
- unrelated_or_unsupported: 현재 카카오T 택시 호출 연습과 관련 없는 질문이다

먼저 실제 사람의 알아들을 수 있는 말소리가 있는지 판정하세요.
무음, 잡음, 기계음, 앱 안내음만 있거나 사람의 말을 확실히 알아들을 수 없다면
has_speech를 false로, transcript를 빈 문자열로 반환하세요. 절대로 문장을 추측하거나 만들어내지 마세요.
사람의 질문이 명확히 들릴 때만 has_speech를 true로 반환하고 의도를 분류하세요.
출력은 제공된 JSON 스키마를 반드시 따르세요.
""".strip()


def _gemini_result(audio_bytes, mime_type):
    model = settings.GEMINI_MODEL
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    transcription_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": (
                            "You are a strict audio transcription detector. Ignore all app context. "
                            "If no clearly intelligible human words are audible, return exactly SILENCE. "
                            "Never guess or invent words. Otherwise return only the exact spoken transcript."
                        )
                    },
                    {
                        "inlineData": {
                            "mimeType": mime_type,
                            "data": base64.b64encode(audio_bytes).decode("ascii"),
                        }
                    },
                ],
            }
        ],
        "generationConfig": {"temperature": 0},
    }
    transcription_request = Request(
        url,
        data=json.dumps(transcription_payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": settings.GEMINI_API_KEY,
        },
        method="POST",
    )
    with urlopen(transcription_request, timeout=20) as upstream_response:
        transcription_result = json.loads(upstream_response.read().decode("utf-8"))
    transcript = transcription_result["candidates"][0]["content"]["parts"][0]["text"].strip()
    if not transcript or transcript.upper() == "SILENCE":
        return {"has_speech": False, "transcript": "", "intent": "unrelated_or_unsupported"}

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": f"{CLASSIFIER_PROMPT}\n\n사용자 음성의 정확한 전사문:\n{transcript}"},
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0,
            "responseMimeType": "application/json",
            "responseJsonSchema": {
                "type": "object",
                "properties": {
                    "intent": {"type": "string", "enum": list(SCENARIOS.keys())},
                },
                "required": ["intent"],
                "additionalProperties": False,
            },
        },
    }
    upstream_request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-goog-api-key": settings.GEMINI_API_KEY,
        },
        method="POST",
    )
    with urlopen(upstream_request, timeout=20) as upstream_response:
        result = json.loads(upstream_response.read().decode("utf-8"))
    text = result["candidates"][0]["content"]["parts"][0]["text"]
    classified = json.loads(text)
    return {"has_speech": True, "transcript": transcript, "intent": classified["intent"]}


@api_view(["POST"])
@permission_classes([KioskSessionPermission])
@parser_classes([MultiPartParser])
def kakao_t_home_voice(request):
    if not settings.GEMINI_API_KEY:
        return Response(
            {"detail": "Gemini API 키가 아직 설정되지 않았습니다."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    audio = request.FILES.get("audio")
    if not audio:
        return Response({"detail": "음성 파일이 필요합니다."}, status=status.HTTP_400_BAD_REQUEST)
    if audio.size > MAX_AUDIO_BYTES:
        return Response({"detail": "음성 질문은 4MB 이하로 녹음해 주세요."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

    mime_type = audio.content_type or "audio/mp4"
    if not mime_type.startswith("audio/"):
        return Response({"detail": "지원하지 않는 음성 파일입니다."}, status=status.HTTP_400_BAD_REQUEST)

    audio_bytes = audio.read()
    if _has_audible_signal(audio_bytes, mime_type) is False:
        return Response(
            {
                "transcript": "",
                "intent": "no_speech",
                "answer": "목소리가 들리지 않았어요. 마이크 가까이에서 다시 말씀해 주세요.",
                "targetIds": [],
            }
        )

    try:
        classified = _gemini_result(audio_bytes, mime_type)
    except HTTPError as error:
        if error.code in (401, 403):
            detail = "Gemini API 키 또는 결제 설정을 확인해 주세요."
        elif error.code == 429:
            detail = "Gemini 사용 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
        else:
            detail = "Gemini가 음성 질문을 처리하지 못했습니다."
        return Response({"detail": detail}, status=status.HTTP_502_BAD_GATEWAY)
    except (URLError, TimeoutError, KeyError, IndexError, TypeError, ValueError, json.JSONDecodeError):
        return Response(
            {"detail": "음성 인식 서버에 연결하지 못했습니다."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    transcript = str(classified.get("transcript", "")).strip()
    if not classified.get("has_speech") or not transcript:
        return Response(
            {
                "transcript": "",
                "intent": "no_speech",
                "answer": "목소리가 들리지 않았어요. 마이크 가까이에서 다시 말씀해 주세요.",
                "targetIds": [],
            }
        )

    intent = classified.get("intent", "unrelated_or_unsupported")
    scenario = SCENARIOS.get(intent, FALLBACK)
    target_ids = [target for target in scenario["target_ids"] if target in VALID_TARGETS]
    return Response(
        {
            "transcript": transcript,
            "intent": intent if intent in SCENARIOS else "fallback",
            "answer": scenario["answer"],
            "targetIds": target_ids,
        }
    )
