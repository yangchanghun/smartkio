from rest_framework import serializers
from django.contrib.auth.models import User
from django.db import transaction
from .models import Category, PracticeSession, Product, Order
from .models import KioskAccount

class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = "__all__"
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    class Meta: model = Product; fields = ["id", "category", "category_name", "name", "price", "is_available", "image_url"]
class OrderSerializer(serializers.ModelSerializer):
    class Meta: model = Order; fields = "__all__"; read_only_fields = ["created_at"]

class KioskAccountSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", max_length=150)
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    class Meta:
        model = KioskAccount
        fields = ["id", "user", "username", "password", "expires_at", "is_active", "last_login_at"]
        read_only_fields = ["user", "last_login_at"]

    def validate_username(self, value):
        queryset = User.objects.filter(username=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.user_id)
        if queryset.exists():
            raise serializers.ValidationError("이미 사용 중인 아이디입니다.")
        return value

    @transaction.atomic
    def create(self, validated_data):
        user_data = validated_data.pop("user")
        password = validated_data.pop("password", "")
        if not password:
            raise serializers.ValidationError({"password": "비밀번호를 입력해 주세요."})
        user = User.objects.create_user(
            username=user_data["username"],
            password=password,
        )
        return KioskAccount.objects.create(user=user, **validated_data)

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", None)
        password = validated_data.pop("password", None)
        if user_data and user_data.get("username") != instance.user.username:
            instance.user.username = user_data["username"]
            instance.user.save(update_fields=["username"])
        if password:
            instance.user.set_password(password)
            instance.user.save(update_fields=["password"])
        return super().update(instance, validated_data)


class PracticeSessionSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="account.user.username", read_only=True)
    service_name = serializers.CharField(source="get_service_display", read_only=True)

    class Meta:
        model = PracticeSession
        fields = ["id", "username", "service", "service_name", "status", "started_at", "last_activity_at", "finished_at", "duration_seconds", "failure_reason"]
        read_only_fields = fields
