import json
from datetime import timedelta
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from django.test import override_settings
from django.utils import timezone
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from catalog.models import KioskAccount


@override_settings(KAKAO_REST_API_KEY="test-rest-key")
class RoutePreviewTests(APITestCase):
    def setUp(self):
        user = User.objects.create_user(username="taxi-kiosk", password="test")
        KioskAccount.objects.create(user=user, expires_at=timezone.now() + timedelta(days=1))
        token = Token.objects.create(user=user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    def test_rejects_invalid_coordinates(self):
        response = self.client.get("/api/taxi/route-preview/?origin_longitude=nope")
        self.assertEqual(response.status_code, 400)

    @patch("taxi.views.urlopen")
    def test_returns_sanitized_route_summary(self, mocked_urlopen):
        upstream = MagicMock()
        upstream.read.return_value = json.dumps(
            {
                "routes": [
                    {
                        "result_code": 0,
                        "summary": {
                            "distance": 8420,
                            "duration": 1090,
                            "fare": {"taxi": 12700, "toll": 0},
                        },
                        "sections": [
                            {
                                "roads": [
                                    {
                                        "vertexes": [
                                            126.8909,
                                            37.5774,
                                            126.9200,
                                            37.5700,
                                            126.9707,
                                            37.5547,
                                        ]
                                    }
                                ]
                            }
                        ],
                    }
                ]
            }
        ).encode()
        mocked_urlopen.return_value.__enter__.return_value = upstream

        response = self.client.get(
            "/api/taxi/route-preview/?origin_longitude=126.8909&origin_latitude=37.5774&destination_longitude=126.9707&destination_latitude=37.5547"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["distance_meters"], 8420)
        self.assertEqual(response.data["duration_seconds"], 1090)
        self.assertEqual(response.data["taxi_fare"], 12700)
        self.assertEqual(len(response.data["path"]), 3)
        self.assertEqual(response.data["path"][0]["longitude"], 126.8909)
        self.assertEqual(response.data["path"][-1]["latitude"], 37.5547)
        self.assertNotIn("routes", response.data)
