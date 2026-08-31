import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("catalog", "0004_model_ordering")]
    operations = [
        migrations.AddField(
            model_name="practicesession",
            name="last_activity_at",
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
