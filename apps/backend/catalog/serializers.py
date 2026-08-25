from rest_framework import serializers
from .models import Category, Product, Order
from .models import KioskAccount

class CategorySerializer(serializers.ModelSerializer):
    class Meta: model = Category; fields = "__all__"
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    class Meta: model = Product; fields = ["id", "category", "category_name", "name", "price", "is_available", "image_url"]
class OrderSerializer(serializers.ModelSerializer):
    class Meta: model = Order; fields = "__all__"; read_only_fields = ["created_at"]

class KioskAccountSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = KioskAccount
        fields = ["id", "user", "username", "password", "expires_at", "is_active", "last_login_at"]
        read_only_fields = ["user", "last_login_at"]
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            instance.user.set_password(password)
            instance.user.save(update_fields=["password"])
        return super().update(instance, validated_data)
