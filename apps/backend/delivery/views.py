import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from catalog.views import KioskSessionPermission

NAVER_GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode"


@api_view(["GET"])
@permission_classes([KioskSessionPermission])
def address_search(request):
    query = request.query_params.get("q", "").strip()
    if len(query) < 2:
        return Response(
            {"detail": "검색어를 두 글자 이상 입력해 주세요."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(query) > 100:
        return Response(
            {"detail": "검색어가 너무 깁니다."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    client_id = settings.NAVER_MAPS_CLIENT_ID
    client_secret = settings.NAVER_MAPS_CLIENT_SECRET
    if not client_id or not client_secret:
        return Response(
            {"detail": "주소 검색 서비스가 아직 설정되지 않았습니다."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    url = f"{NAVER_GEOCODE_URL}?{urlencode({'query': query, 'count': 10})}"
    upstream_request = Request(
        url,
        headers={
            "x-ncp-apigw-api-key-id": client_id,
            "x-ncp-apigw-api-key": client_secret,
            "Accept": "application/json",
        },
    )

    try:
        with urlopen(upstream_request, timeout=6) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        if error.code in (401, 403):
            detail = "네이버 지도 API 인증 설정을 확인해 주세요."
        elif error.code == 429:
            detail = "주소 검색 사용량을 초과했습니다. 잠시 후 다시 시도해 주세요."
        else:
            detail = "주소 검색 서비스가 응답하지 않습니다."
        return Response({"detail": detail}, status=status.HTTP_502_BAD_GATEWAY)
    except (URLError, TimeoutError, json.JSONDecodeError):
        return Response(
            {"detail": "주소 검색 서버에 연결하지 못했습니다."},
            status=status.HTTP_502_BAD_GATEWAY,
        )

    addresses = payload.get("addresses", [])
    results = [
        {
            "roadAddress": item.get("roadAddress", ""),
            "jibunAddress": item.get("jibunAddress", ""),
            "englishAddress": item.get("englishAddress", ""),
            "x": item.get("x", ""),
            "y": item.get("y", ""),
        }
        for item in addresses
        if item.get("roadAddress") or item.get("jibunAddress")
    ]
    return Response({"results": results, "total": len(results)})

