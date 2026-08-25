import json
import re
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from catalog.views import KioskSessionPermission

NAVER_GEOCODE_URL = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode"
NAVER_LOCAL_SEARCH_URL = "https://naverapihub.apigw.ntruss.com/search/v1/local"


def _naver_request(url, client_id, client_secret):
    upstream_request = Request(
        url,
        headers={
            "x-ncp-apigw-api-key-id": client_id,
            "x-ncp-apigw-api-key": client_secret,
            "Accept": "application/json",
        },
    )
    with urlopen(upstream_request, timeout=6) as response:
        return json.loads(response.read().decode("utf-8"))


def _plain_text(value):
    return re.sub(r"<[^>]+>", "", value or "").strip()


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

    geocode_url = f"{NAVER_GEOCODE_URL}?{urlencode({'query': query, 'count': 10})}"
    local_url = f"{NAVER_LOCAL_SEARCH_URL}?{urlencode({'query': query, 'display': 5, 'start': 1, 'sort': 'random', 'format': 'json'})}"
    geocode_payload = {}
    local_payload = {}
    upstream_errors = []
    for source, url in (("local", local_url), ("geocode", geocode_url)):
        try:
            payload = _naver_request(url, client_id, client_secret)
            if source == "local":
                local_payload = payload
            else:
                geocode_payload = payload
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            upstream_errors.append(error)

    # 지역검색 상품이 활성화되지 않았더라도 기존 주소검색은 계속 사용할 수 있다.
    if not geocode_payload and not local_payload and upstream_errors:
        error = upstream_errors[0]
        if isinstance(error, HTTPError) and error.code in (401, 403):
            detail = "네이버 API 인증 설정을 확인해 주세요."
        elif isinstance(error, HTTPError) and error.code == 429:
            detail = "주소 검색 사용량을 초과했습니다. 잠시 후 다시 시도해 주세요."
        else:
            detail = "주소 검색 서버에 연결하지 못했습니다."
        return Response({"detail": detail}, status=status.HTTP_502_BAD_GATEWAY)

    results = []
    seen = set()
    for item in local_payload.get("items", []):
        road_address = item.get("roadAddress", "")
        jibun_address = item.get("address", "")
        key = (road_address or jibun_address).strip()
        if not key or key in seen:
            continue
        seen.add(key)
        results.append(
            {
                "name": _plain_text(item.get("title")),
                "category": item.get("category", ""),
                "roadAddress": road_address,
                "jibunAddress": jibun_address,
                "englishAddress": "",
                "x": item.get("mapx", ""),
                "y": item.get("mapy", ""),
                "source": "local",
            }
        )

    for item in geocode_payload.get("addresses", []):
        road_address = item.get("roadAddress", "")
        jibun_address = item.get("jibunAddress", "")
        key = (road_address or jibun_address).strip()
        if not key or key in seen:
            continue
        seen.add(key)
        results.append(
            {
                "name": "",
                "category": "",
                "roadAddress": road_address,
                "jibunAddress": jibun_address,
                "englishAddress": item.get("englishAddress", ""),
                "x": item.get("x", ""),
                "y": item.get("y", ""),
                "source": "geocode",
            }
        )

    return Response({"results": results, "total": len(results)})
