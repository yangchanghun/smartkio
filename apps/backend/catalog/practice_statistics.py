from datetime import timedelta

from django.db.models import Avg, Count, Max, Q
from django.utils import timezone

from .models import PracticeSession
from .serializers import PracticeSessionSerializer


def range_queryset(range_value):
    queryset = PracticeSession.objects.all()
    if range_value in {"7", "30"}:
        queryset = queryset.filter(
            started_at__gte=timezone.now() - timedelta(days=int(range_value)),
        )
    return queryset


def dashboard_statistics(range_value):
    queryset = range_queryset(range_value)
    summary = queryset.aggregate(
        total=Count("id"),
        completed=Count("id", filter=Q(status="COMPLETED")),
        failed=Count("id", filter=Q(status="FAILED")),
        progress=Count("id", filter=Q(status="IN_PROGRESS")),
        average=Avg("duration_seconds", filter=Q(status="COMPLETED")),
    )
    summary["average"] = round(summary["average"]) if summary["average"] is not None else None
    summary["rate"] = round(summary["completed"] / summary["total"] * 100) if summary["total"] else 0

    services = list(
        queryset.values("service")
        .annotate(
            total=Count("id"),
            completed=Count("id", filter=Q(status="COMPLETED")),
            average=Avg("duration_seconds", filter=Q(status="COMPLETED")),
        )
        .order_by("-total")
    )
    service_names = dict(PracticeSession.SERVICE_CHOICES)
    for row in services:
        row["name"] = service_names.get(row["service"], row["service"])
        row["average"] = round(row["average"]) if row["average"] is not None else None

    accounts = list(
        queryset.values("account_id", "account__user__username")
        .annotate(
            total=Count("id"),
            completed=Count("id", filter=Q(status="COMPLETED")),
            failed=Count("id", filter=Q(status="FAILED")),
            last=Max("started_at"),
        )
        .order_by("-last")
    )
    for row in accounts:
        row["username"] = row.pop("account__user__username")
        row["rate"] = round(row["completed"] / row["total"] * 100) if row["total"] else 0

    recent = queryset.select_related("account__user").order_by("-started_at")[:30]
    return {
        "summary": summary,
        "by_service": services,
        "by_account": accounts,
        "recent": PracticeSessionSerializer(recent, many=True).data,
    }


def account_statistics(account):
    result = PracticeSession.objects.filter(account=account).aggregate(
        total=Count("id"),
        completed=Count("id", filter=Q(status="COMPLETED")),
        failed=Count("id", filter=Q(status="FAILED")),
        progress=Count("id", filter=Q(status="IN_PROGRESS")),
        average=Avg("duration_seconds", filter=Q(status="COMPLETED")),
    )
    result["average"] = round(result["average"]) if result["average"] is not None else None
    result["rate"] = round(result["completed"] / result["total"] * 100) if result["total"] else 0
    return result

