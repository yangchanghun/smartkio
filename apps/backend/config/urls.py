from django.contrib import admin
from django.urls import include, path
from catalog.views import health

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/delivery/", include("delivery.urls")),
    path("api/taxi/", include("taxi.urls")),
    path("api/", include("catalog.urls")),
]
