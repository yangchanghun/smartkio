from django.contrib import admin
from .models import Category, KioskAccount, Order, PracticeSession, Product

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)

@admin.register(KioskAccount)
class KioskAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "expires_at", "is_active", "last_login_at")
    list_filter = ("is_active",)
    search_fields = ("user__username",)


@admin.register(PracticeSession)
class PracticeSessionAdmin(admin.ModelAdmin):
    list_display = ("account", "service", "status", "started_at", "duration_seconds")
    list_filter = ("service", "status")
    search_fields = ("account__user__username",)
    readonly_fields = ("started_at", "finished_at", "duration_seconds")
