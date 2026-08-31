from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from .models import Category, KioskAccount, PracticeSession, Product

class ApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("admin", password="password")
        category = Category.objects.create(name="커피")
        Product.objects.create(category=category, name="아메리카노", price=3000)
        KioskAccount.objects.create(user=self.user, expires_at=timezone.now() + timedelta(days=1))

    def test_kiosk_can_read_products_and_create_order(self):
        client = APIClient()
        token = client.post("/api/kiosk/auth/login/", {"username": "admin", "password": "password"}, format="json").data["token"]
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        self.assertEqual(client.get("/api/products/").status_code, 200)
        self.assertEqual(client.post("/api/orders/", {"items": [], "total_amount": 3000, "status": "PAID"}, format="json").status_code, 201)

    def test_second_login_invalidates_first_device(self):
        client = APIClient()
        first = client.post("/api/kiosk/auth/login/", {"username": "admin", "password": "password"}, format="json").data["token"]
        second = client.post("/api/kiosk/auth/login/", {"username": "admin", "password": "password"}, format="json").data["token"]
        self.assertNotEqual(first, second)
        client.credentials(HTTP_AUTHORIZATION=f"Token {first}")
        self.assertEqual(client.get("/api/products/").status_code, 401)

    def test_admin_login(self):
        client = APIClient()
        self.assertEqual(client.post("/api/auth/login/", {"username": "admin", "password": "password"}, format="json").status_code, 200)

    def authenticated_kiosk(self):
        client = APIClient()
        token = client.post("/api/kiosk/auth/login/", {"username": "admin", "password": "password"}, format="json").data["token"]
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        return client

    def test_practice_session_records_completion_and_duration(self):
        client = self.authenticated_kiosk()
        started = client.post("/api/practice-sessions/start/", {"service": "DELIVERY"}, format="json")
        self.assertEqual(started.status_code, 201)
        completed = client.post(f"/api/practice-sessions/{started.data['id']}/complete/", {}, format="json")
        self.assertEqual(completed.status_code, 200)
        self.assertEqual(completed.data["status"], "COMPLETED")
        self.assertIsNotNone(completed.data["duration_seconds"])

    def test_starting_new_practice_fails_unfinished_session(self):
        client = self.authenticated_kiosk()
        first = client.post("/api/practice-sessions/start/", {"service": "DELIVERY"}, format="json")
        client.post("/api/practice-sessions/start/", {"service": "TAXI"}, format="json")
        previous = PracticeSession.objects.get(pk=first.data["id"])
        self.assertEqual(previous.status, "FAILED")
        self.assertEqual(previous.failure_reason, "INTERRUPTED")
        self.assertIsNotNone(previous.duration_seconds)

    def test_abandon_marks_practice_as_failed(self):
        client = self.authenticated_kiosk()
        started = client.post("/api/practice-sessions/start/", {"service": "DELIVERY"}, format="json")
        abandoned = client.post(f"/api/practice-sessions/{started.data['id']}/abandon/", {"reason": "USER_EXIT"}, format="json")
        self.assertEqual(abandoned.data["status"], "FAILED")
        self.assertEqual(abandoned.data["failure_reason"], "USER_EXIT")

    def test_next_login_fails_session_left_by_closed_app(self):
        client = self.authenticated_kiosk()
        started = client.post("/api/practice-sessions/start/", {"service": "DELIVERY"}, format="json")
        client.post("/api/kiosk/auth/login/", {"username": "admin", "password": "password"}, format="json")
        previous = PracticeSession.objects.get(pk=started.data["id"])
        self.assertEqual(previous.status, "FAILED")
        self.assertEqual(previous.failure_reason, "LOGIN_REPLACED")
