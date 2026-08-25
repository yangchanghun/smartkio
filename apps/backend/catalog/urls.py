from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, KioskAccountViewSet, ProductViewSet, OrderViewSet, kiosk_login, login
router = DefaultRouter()
router.register("categories", CategoryViewSet)
router.register("products", ProductViewSet)
router.register("orders", OrderViewSet)
router.register("kiosk-accounts", KioskAccountViewSet)
urlpatterns = [path("auth/login/", login), path("kiosk/auth/login/", kiosk_login), path("", include(router.urls))]
