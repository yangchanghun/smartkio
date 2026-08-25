from django.contrib import admin
from .models import Category, KioskAccount, Order, Product

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Order)

@admin.register(KioskAccount)
class KioskAccountAdmin(admin.ModelAdmin):
    list_display = ("user", "expires_at", "is_active", "last_login_at")
    list_filter = ("is_active",)
    search_fields = ("user__username",)
