from django.urls import path

from .views import route_preview

urlpatterns = [path("route-preview/", route_preview, name="taxi-route-preview")]
