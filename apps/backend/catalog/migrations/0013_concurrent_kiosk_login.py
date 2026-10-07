from django.db import migrations, models
from django.db.models import Q


class Migration(migrations.Migration):
    dependencies = [("catalog", "0012_kioskaccount_manager_phone_kioskaccount_nickname_and_more")]

    operations = [
        migrations.AddField(
            model_name="kioskaccount",
            name="allow_concurrent_login",
            field=models.BooleanField(default=False, verbose_name="중복 접속 허용"),
        ),
        migrations.AddField(
            model_name="practicesession",
            name="concurrent_login",
            field=models.BooleanField(default=False),
        ),
        migrations.RemoveConstraint(
            model_name="practicesession",
            name="one_active_practice_per_account",
        ),
        migrations.AddConstraint(
            model_name="practicesession",
            constraint=models.UniqueConstraint(
                fields=("account",),
                condition=Q(status="IN_PROGRESS", concurrent_login=False),
                name="one_exclusive_active_practice_per_account",
            ),
        ),
    ]
