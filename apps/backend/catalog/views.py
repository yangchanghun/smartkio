from django.contrib.auth import authenticate
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Category, KioskAccount, Product, Order
from .serializers import CategorySerializer, KioskAccountSerializer, ProductSerializer, OrderSerializer

class HasKioskKey(permissions.BasePermission):
    def has_permission(self, request, view):
        from django.conf import settings
        return bool(settings.KIOSK_API_KEY) and request.headers.get("X-Kiosk-Key") == settings.KIOSK_API_KEY

@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health(request): return Response({"status": "ok", "service": "smartkio-api"})

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login(request):
    user = authenticate(username=request.data.get("username", ""), password=request.data.get("password", ""))
    if not user: return Response({"detail": "아이디 또는 비밀번호가 올바르지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({"token": token.key, "username": user.username, "is_superuser": user.is_superuser})

@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def kiosk_login(request):
    user = authenticate(username=request.data.get("username", ""), password=request.data.get("password", ""))
    account = getattr(user, "kiosk_account", None) if user else None
    if not account or not account.is_active or timezone.now() >= account.expires_at:
        return Response({"detail": "계정 정보 또는 이용 기간을 확인해주세요."}, status=status.HTTP_401_UNAUTHORIZED)
    Token.objects.filter(user=user).delete()
    token = Token.objects.create(user=user)
    account.last_login_at = timezone.now()
    account.save(update_fields=["last_login_at"])
    return Response({"token": token.key, "username": user.username, "expires_at": account.expires_at})

class KioskSessionPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        account = getattr(request.user, "kiosk_account", None)
        return bool(request.user and request.user.is_authenticated and account and account.is_active and timezone.now() < account.expires_at)

class KioskOrAdminPermission(KioskSessionPermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff) or super().has_permission(request, view)

class CategoryViewSet(viewsets.ModelViewSet): queryset = Category.objects.all(); serializer_class = CategorySerializer
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related("category")
    serializer_class = ProductSerializer
    def get_permissions(self):
        return [KioskOrAdminPermission()] if self.action == "list" else [permissions.IsAuthenticated()]

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    http_method_names = ["get", "post"]
    def get_permissions(self):
        return [KioskSessionPermission()] if self.action == "create" else [permissions.IsAuthenticated()]

class KioskAccountViewSet(viewsets.ModelViewSet):
    queryset = KioskAccount.objects.select_related("user").all().order_by("user__username")
    serializer_class = KioskAccountSerializer
    permission_classes = [permissions.IsAdminUser]
