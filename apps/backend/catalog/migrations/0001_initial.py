import django.db.models.deletion
from django.db import migrations, models

class Migration(migrations.Migration):
    initial = True
    dependencies = []
    operations = [
        migrations.CreateModel(name="Category", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("name", models.CharField(max_length=80, unique=True)), ("sort_order", models.PositiveIntegerField(default=0))]),
        migrations.CreateModel(name="Order", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("items", models.JSONField(default=list)), ("total_amount", models.PositiveIntegerField()), ("status", models.CharField(choices=[("PAID", "결제완료"), ("CANCELLED", "취소")], default="PAID", max_length=12)), ("created_at", models.DateTimeField(auto_now_add=True))]),
        migrations.CreateModel(name="Product", fields=[("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")), ("name", models.CharField(max_length=120)), ("price", models.PositiveIntegerField()), ("is_available", models.BooleanField(default=True)), ("image_url", models.URLField(blank=True)), ("category", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="products", to="catalog.category"))]),
    ]
