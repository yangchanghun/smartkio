from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [("catalog", "0002_kioskaccount")]
    operations = [
        migrations.CreateModel(
            name="PracticeSession",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("service", models.CharField(choices=[("DELIVERY", "배달의민족"), ("KAKAOTALK", "카카오톡"), ("TAXI", "카카오T"), ("COUPANG_SIGNUP", "쿠팡 회원가입"), ("COUPANG_SHOPPING", "쿠팡 상품구매")], max_length=24)),
                ("status", models.CharField(choices=[("IN_PROGRESS", "진행 중"), ("COMPLETED", "완료"), ("FAILED", "실패")], default="IN_PROGRESS", max_length=12)),
                ("started_at", models.DateTimeField(auto_now_add=True)),
                ("finished_at", models.DateTimeField(blank=True, null=True)),
                ("duration_seconds", models.PositiveIntegerField(blank=True, null=True)),
                ("failure_reason", models.CharField(blank=True, max_length=32)),
                ("account", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="practice_sessions", to="catalog.kioskaccount")),
            ],
            options={"ordering": ["-started_at"]},
        ),
        migrations.AddIndex(model_name="practicesession", index=models.Index(fields=["account", "service", "started_at"], name="catalog_pra_account_c639f4_idx")),
        migrations.AddIndex(model_name="practicesession", index=models.Index(fields=["status", "started_at"], name="catalog_pra_status_9fe467_idx")),
    ]
