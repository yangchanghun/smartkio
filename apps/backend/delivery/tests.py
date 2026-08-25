import json
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.test import override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from catalog.models import KioskAccount


@override_settings(NAVER_MAPS_CLIENT_ID="test-id", NAVER_MAPS_CLIENT_SECRET="test-secret")
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

