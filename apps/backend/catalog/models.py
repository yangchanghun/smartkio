from django.conf import settings
from django.db import models

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
