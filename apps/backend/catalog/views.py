from django.contrib.auth import authenticate
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
from rest_framework import permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Category, KioskAccount, PracticeSession, Product, Order
from .serializers import CategorySerializer, KioskAccountSerializer, PracticeSessionSerializer, ProductSerializer, OrderSerializer

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
    for session in PracticeSession.objects.filter(account=account, status="IN_PROGRESS"):
        session.finish("FAILED", "LOGIN_REPLACED")
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


class PracticeSessionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PracticeSession.objects.select_related("account__user")
    serializer_class = PracticeSessionSerializer

    def get_queryset(self):
        cutoff = timezone.now() - timedelta(seconds=45)
        with transaction.atomic():
            stale_sessions = PracticeSession.objects.select_for_update().filter(
                status="IN_PROGRESS",
                last_activity_at__lt=cutoff,
            )
            for session in stale_sessions:
                session.finish("FAILED", "APP_TERMINATED")
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        account = getattr(self.request.user, "kiosk_account", None)
        return queryset.filter(account=account) if account else queryset.none()

    @transaction.atomic
    @action(detail=False, methods=["post"])
    def start(self, request):
        account = getattr(request.user, "kiosk_account", None)
        if not account:
            return Response({"detail": "키오스크 계정이 필요합니다."}, status=status.HTTP_403_FORBIDDEN)
        service = request.data.get("service", "")
        valid_services = {value for value, _ in PracticeSession.SERVICE_CHOICES}
        if service not in valid_services:
            return Response({"detail": "연습 서비스 값을 확인해 주세요."}, status=status.HTTP_400_BAD_REQUEST)
        previous = PracticeSession.objects.select_for_update().filter(account=account, status="IN_PROGRESS")
        for session in previous:
            session.finish("FAILED", "INTERRUPTED")
        session = PracticeSession.objects.create(account=account, service=service)
        return Response(self.get_serializer(session).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        session = self.get_object()
        if session.status == "IN_PROGRESS":
            session.finish("COMPLETED")
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=["post"])
    def heartbeat(self, request, pk=None):
        session = self.get_object()
        if session.status == "IN_PROGRESS":
            session.last_activity_at = timezone.now()
            session.save(update_fields=["last_activity_at"])
        return Response(self.get_serializer(session).data)

    @action(detail=True, methods=["post"])
    def abandon(self, request, pk=None):
        session = self.get_object()
        if session.status == "IN_PROGRESS":
            session.finish("FAILED", request.data.get("reason", "USER_EXIT")[:32])
        return Response(self.get_serializer(session).data)
