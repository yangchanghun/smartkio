import json
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.test import override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from catalog.models import KioskAccount


@override_settings(
    NAVER_MAPS_CLIENT_ID="test-maps-id",
    NAVER_MAPS_CLIENT_SECRET="test-maps-secret",
    NAVER_API_HUB_CLIENT_ID="test-hub-id",
    NAVER_API_HUB_CLIENT_SECRET="test-hub-secret",
)
class AddressSearchTests(APITestCase):
    def setUp(self):
        user = User.objects.create_user(username="kiosk", password="test")
        KioskAccount.objects.create(user=user, expires_at=timezone.now() + timedelta(days=1))
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_short_query_is_rejected(self):
        response = self.client.get("/api/delivery/addresses/search/?q=a")
        self.assertEqual(response.status_code, 400)

    @patch("delivery.views.urlopen")
    def test_returns_sanitized_results(self, mocked_urlopen):
        upstream = MagicMock()
        upstream.read.return_value = json.dumps(
            {
                "addresses": [
                    {
                        "roadAddress": "경기도 성남시 분당구 불정로 6",
                        "jibunAddress": "경기도 성남시 분당구 정자동 178-1",
                        "englishAddress": "6, Buljeong-ro",
                        "x": "127.1",
                        "y": "37.3",
                        "unused": "not exposed",
                    }
                ]
            }
        ).encode()
        mocked_urlopen.return_value.__enter__.return_value = upstream

        response = self.client.get("/api/delivery/addresses/search/?q=불정로")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 1)
        self.assertNotIn("unused", response.data["results"][0])

    @patch("delivery.views.urlopen")
    def test_combines_local_places_before_geocoded_addresses(self, mocked_urlopen):
        local_response = MagicMock()
        local_response.read.return_value = json.dumps(
            {
                "items": [
                    {
                        "title": "<b>서울역</b>",
                        "category": "교통,수송>기차역",
                        "address": "서울특별시 용산구 동자동 43-205",
                        "roadAddress": "서울특별시 용산구 한강대로 405",
                        "mapx": "126.9707",
                        "mapy": "37.5547",
                    }
                ]
            }
        ).encode()
        geocode_response = MagicMock()
        geocode_response.read.return_value = json.dumps(
            {
                "addresses": [
                    {
                        "roadAddress": "서울특별시",
                        "jibunAddress": "서울특별시",
                        "englishAddress": "Seoul",
                        "x": "126.9783",
                        "y": "37.5666",
                    }
                ]
            }
        ).encode()
        mocked_urlopen.return_value.__enter__.side_effect = [local_response, geocode_response]

        response = self.client.get("/api/delivery/addresses/search/?q=서울")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total"], 2)
        self.assertEqual(response.data["results"][0]["name"], "서울역")
        self.assertEqual(response.data["results"][0]["source"], "local")
        self.assertEqual(response.data["results"][1]["source"], "geocode")
