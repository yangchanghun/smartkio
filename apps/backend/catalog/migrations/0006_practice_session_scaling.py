from django.db import migrations, models
from django.db.models import Q
from django.utils import timezone


def resolve_duplicate_active_sessions(apps, schema_editor):
    PracticeSession = apps.get_model("catalog", "PracticeSession")
    active_account_ids = (
        PracticeSession.objects.filter(status="IN_PROGRESS")
        .order_by()
        .values_list("account_id", flat=True)
        .distinct()
    )
    now = timezone.now()
    for account_id in active_account_ids.iterator():
        sessions = PracticeSession.objects.filter(
            account_id=account_id,
            status="IN_PROGRESS",
        ).order_by("-started_at")
        keep_id = sessions.values_list("id", flat=True).first()
        sessions.exclude(id=keep_id).update(
            status="FAILED",
            finished_at=now,
            failure_reason="DUPLICATE_CLEANUP",
        )


class Migration(migrations.Migration):
    dependencies = [("catalog", "0005_practicesession_last_activity_at")]

    operations = [
        migrations.RunPython(resolve_duplicate_active_sessions, migrations.RunPython.noop),
        migrations.AddIndex(
            model_name="practicesession",
            index=models.Index(fields=["-started_at"], name="practice_started_idx"),
        ),
        migrations.AddIndex(
            model_name="practicesession",
            index=models.Index(fields=["account", "-started_at"], name="practice_acct_started_idx"),
        ),
        migrations.AddIndex(
            model_name="practicesession",
            index=models.Index(
                condition=Q(status="IN_PROGRESS"),
                fields=["last_activity_at"],
                name="practice_active_beat_idx",
            ),
        ),
        migrations.AddConstraint(
            model_name="practicesession",
            constraint=models.UniqueConstraint(
                condition=Q(status="IN_PROGRESS"),
                fields=("account",),
                name="one_active_practice_per_account",
            ),
        ),
    ]
