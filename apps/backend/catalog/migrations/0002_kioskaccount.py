from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):
    dependencies = [("catalog", "0001_initial"), migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [migrations.CreateModel(name="KioskAccount", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("expires_at", models.DateTimeField()), ("is_active", models.BooleanField(default=True)), ("last_login_at", models.DateTimeField(blank=True, null=True)), ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="kiosk_account", to=settings.AUTH_USER_MODEL))])]
