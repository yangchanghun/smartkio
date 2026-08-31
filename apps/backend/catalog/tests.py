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

    def test_admin_can_create_kiosk_account(self):
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save(update_fields=["is_staff", "is_superuser"])
        client = APIClient()
        token = client.post("/api/auth/login/", {"username": "admin", "password": "password"}, format="json").data["token"]
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        response = client.post(
            "/api/kiosk-accounts/",
            {
                "username": "practice01",
                "password": "1234",
                "expires_at": (timezone.now() + timedelta(days=30)).isoformat(),
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.get(username="practice01").check_password("1234"))
        self.assertTrue(KioskAccount.objects.filter(user__username="practice01").exists())

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

    def test_stale_heartbeat_marks_force_closed_practice_as_failed(self):
        client = self.authenticated_kiosk()
        started = client.post("/api/practice-sessions/start/", {"service": "DELIVERY"}, format="json")
        PracticeSession.objects.filter(pk=started.data["id"]).update(
            last_activity_at=timezone.now() - timedelta(seconds=46),
        )
        client.get("/api/practice-sessions/")
        session = PracticeSession.objects.get(pk=started.data["id"])
        self.assertEqual(session.status, "FAILED")
        self.assertEqual(session.failure_reason, "APP_TERMINATED")

    def test_heartbeat_keeps_active_practice_in_progress(self):
        client = self.authenticated_kiosk()
        started = client.post("/api/practice-sessions/start/", {"service": "DELIVERY"}, format="json")
        PracticeSession.objects.filter(pk=started.data["id"]).update(
            last_activity_at=timezone.now() - timedelta(seconds=40),
        )
        response = client.post(f"/api/practice-sessions/{started.data['id']}/heartbeat/", {}, format="json")
        self.assertEqual(response.data["status"], "IN_PROGRESS")
        session = PracticeSession.objects.get(pk=started.data["id"])
        self.assertGreater(session.last_activity_at, timezone.now() - timedelta(seconds=5))

    def authenticated_admin(self):
        self.user.is_staff = True
        self.user.is_superuser = True
        self.user.save(update_fields=["is_staff", "is_superuser"])
        client = APIClient()
        token = client.post("/api/auth/login/", {"username": "admin", "password": "password"}, format="json").data["token"]
        client.credentials(HTTP_AUTHORIZATION=f"Token {token}")
        return client

    def test_practice_list_is_paginated_and_filterable_by_account(self):
        account = self.user.kiosk_account
        PracticeSession.objects.create(account=account, service="DELIVERY", status="COMPLETED")
        client = self.authenticated_admin()
        response = client.get(f"/api/practice-sessions/?account_id={account.id}&page_size=1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertIn("next", response.data)

    def test_statistics_are_aggregated_in_database(self):
        account = self.user.kiosk_account
        PracticeSession.objects.create(account=account, service="DELIVERY", status="COMPLETED", duration_seconds=60)
        PracticeSession.objects.create(account=account, service="DELIVERY", status="FAILED", duration_seconds=30)
        client = self.authenticated_admin()
        response = client.get("/api/practice-sessions/statistics/?range=all")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["summary"]["total"], 2)
        self.assertEqual(response.data["summary"]["completed"], 1)
        self.assertEqual(response.data["summary"]["failed"], 1)
        self.assertEqual(response.data["summary"]["rate"], 50)
        self.assertEqual(len(response.data["recent"]), 2)

    def test_account_statistics_only_include_requested_account(self):
        account = self.user.kiosk_account
        PracticeSession.objects.create(account=account, service="TAXI", status="COMPLETED", duration_seconds=90)
        other_user = User.objects.create_user("other", password="password")
        other_account = KioskAccount.objects.create(user=other_user, expires_at=timezone.now() + timedelta(days=1))
        PracticeSession.objects.create(account=other_account, service="TAXI", status="FAILED")
        client = self.authenticated_admin()
        response = client.get(f"/api/practice-sessions/account-statistics/?account_id={account.id}")
        self.assertEqual(response.data["total"], 1)
        self.assertEqual(response.data["completed"], 1)
        self.assertEqual(response.data["failed"], 0)

    def test_admin_can_stream_account_excel(self):
        account = self.user.kiosk_account
        PracticeSession.objects.create(account=account, service="DELIVERY", status="COMPLETED", duration_seconds=60)
        client = self.authenticated_admin()
        response = client.get(f"/api/practice-sessions/export/?account_id={account.id}")
        body = b"".join(response.streaming_content).decode("utf-8")
        self.assertEqual(response.status_code, 200)
        self.assertIn("application/vnd.ms-excel", response["Content-Type"])
        self.assertIn("연습 통계", body)
        self.assertIn("배달의민족", body)
