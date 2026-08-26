import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from catalog.views import KioskSessionPermission

KAKAO_DIRECTIONS_URL = "https://apis-navi.kakaomobility.com/v1/directions"


def _coordinate(request, prefix):
    try:
        longitude = float(request.query_params[f"{prefix}_longitude"])
        latitude = float(request.query_params[f"{prefix}_latitude"])
    except (KeyError, TypeError, ValueError):
        raise ValueError("출발지와 도착지 좌표를 확인해 주세요.")
    if not (-180 <= longitude <= 180 and -90 <= latitude <= 90):
        raise ValueError("출발지와 도착지 좌표를 확인해 주세요.")
    return longitude, latitude


@api_view(["GET"])
@permission_classes([KioskSessionPermission])
def route_preview(request):
    try:
        origin = _coordinate(request, "origin")
        destination = _coordinate(request, "destination")
    except ValueError as error:
        return Response({"detail": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    api_key = settings.KAKAO_REST_API_KEY
    if not api_key:
        return Response(
            {"detail": "택시 예상 요금 서비스가 아직 설정되지 않았습니다."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    query = urlencode(
        {
            "origin": f"{origin[0]},{origin[1]}",
            "destination": f"{destination[0]},{destination[1]}",
            "priority": "RECOMMEND",
            "summary": "true",
        }
    )
    upstream_request = Request(
        f"{KAKAO_DIRECTIONS_URL}?{query}",
        headers={"Authorization": f"KakaoAK {api_key}", "Accept": "application/json"},
    )
    try:
        with urlopen(upstream_request, timeout=8) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code in (401, 403):
            detail = "카카오 REST API 키 또는 서버 허용 IP를 확인해 주세요."
        elif error.code == 429:
            detail = "길찾기 무료 사용량을 초과했습니다. 잠시 후 다시 시도해 주세요."
        else:
            detail = "카카오 길찾기 요청을 처리하지 못했습니다."
        return Response({"detail": detail}, status=status.HTTP_502_BAD_GATEWAY)
    except (URLError, TimeoutError, json.JSONDecodeError):
        return Response(
            {"detail": "카카오 길찾기 서버에 연결하지 못했습니다."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    routes = payload.get("routes") or []
    summary = routes[0].get("summary", {}) if routes else {}
    if not summary or routes[0].get("result_code", 0) != 0:
        return Response(
            {"detail": routes[0].get("result_msg", "선택한 위치의 경로를 찾지 못했습니다.") if routes else "선택한 위치의 경로를 찾지 못했습니다."},
            status=status.HTTP_422_UNPROCESSABLE_ENTITY,
        )

    fare = summary.get("fare") or {}
    return Response(
        {
            "distance_meters": int(summary.get("distance") or 0),
            "duration_seconds": int(summary.get("duration") or 0),
            "taxi_fare": int(fare.get("taxi") or 0),
            "toll_fare": int(fare.get("toll") or 0),
        }
    )
