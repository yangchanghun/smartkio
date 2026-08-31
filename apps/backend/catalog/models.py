from django.conf import settings
from django.db import models
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=80, unique=True)
    sort_order = models.PositiveIntegerField(default=0)
    class Meta: ordering = ["sort_order", "name"]
    def __str__(self): return self.name

class Product(models.Model):
    category = models.ForeignKey(Category, related_name="products", on_delete=models.PROTECT)
    name = models.CharField(max_length=120)
    price = models.PositiveIntegerField()
    is_available = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)
    class Meta: ordering = ["category", "name"]
    def __str__(self): return self.name

class Order(models.Model):
    STATUS = [("PAID", "결제완료"), ("CANCELLED", "취소")]
    items = models.JSONField(default=list)
    total_amount = models.PositiveIntegerField()
    status = models.CharField(max_length=12, choices=STATUS, default="PAID")
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta: ordering = ["-created_at"]

class KioskAccount(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="kiosk_account")
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    last_login_at = models.DateTimeField(null=True, blank=True)
    def __str__(self): return f"{self.user.username} ({self.expires_at:%Y-%m-%d})"


class PracticeSession(models.Model):
    SERVICE_CHOICES = [
        ("DELIVERY", "배달의민족"),
        ("KAKAOTALK", "카카오톡"),
        ("TAXI", "카카오T"),
        ("COUPANG_SIGNUP", "쿠팡 회원가입"),
        ("COUPANG_SHOPPING", "쿠팡 상품구매"),
    ]
    STATUS_CHOICES = [
        ("IN_PROGRESS", "진행 중"),
        ("COMPLETED", "완료"),
        ("FAILED", "실패"),
    ]
    account = models.ForeignKey(KioskAccount, related_name="practice_sessions", on_delete=models.CASCADE)
    service = models.CharField(max_length=24, choices=SERVICE_CHOICES)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default="IN_PROGRESS")
    started_at = models.DateTimeField(auto_now_add=True)
    last_activity_at = models.DateTimeField(default=timezone.now)
    finished_at = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    failure_reason = models.CharField(max_length=32, blank=True)

    class Meta:
        ordering = ["-started_at"]
        indexes = [
            models.Index(fields=["account", "service", "started_at"]),
            models.Index(fields=["status", "started_at"]),
        ]

    def finish(self, status, failure_reason=""):
        if self.status != "IN_PROGRESS":
            return False
        now = timezone.now()
        self.status = status
        self.finished_at = now
        self.duration_seconds = max(0, int((now - self.started_at).total_seconds()))
        self.failure_reason = failure_reason
        self.save(update_fields=["status", "finished_at", "duration_seconds", "failure_reason"])
        return True
