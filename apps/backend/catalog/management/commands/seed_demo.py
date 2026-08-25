from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from catalog.models import Category, KioskAccount, Product

class Command(BaseCommand):
    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(username="admin", defaults={"is_staff": True, "is_superuser": True})
        if not admin.check_password("admin1234!"):
            admin.set_password("admin1234!")
            admin.save()
        coffee, _ = Category.objects.get_or_create(name="커피", defaults={"sort_order": 1})
        Category.objects.get_or_create(name="디저트", defaults={"sort_order": 2})
        Product.objects.get_or_create(category=coffee, name="아메리카노", defaults={"price": 3000})
        Product.objects.get_or_create(category=coffee, name="카페라떼", defaults={"price": 4000})
        kiosk_user, _ = User.objects.get_or_create(username="sp1")
        if not kiosk_user.check_password("1234"):
            kiosk_user.set_password("1234")
            kiosk_user.save()
        KioskAccount.objects.get_or_create(user=kiosk_user, defaults={"expires_at": timezone.now() + timedelta(days=30)})
