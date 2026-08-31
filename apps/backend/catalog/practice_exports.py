from urllib.parse import quote
from xml.sax.saxutils import escape

from django.db.models import Count, Q
from django.http import StreamingHttpResponse
from django.utils import timezone

from .models import PracticeSession


STATUS_LABEL = {"COMPLETED": "성공", "FAILED": "실패", "IN_PROGRESS": "진행 중"}
WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"]
EXCEL_ROW_LIMIT = 1_048_570


def _cell(value, style="Center", merge=0, number=False):
    merge_attribute = f' ss:MergeAcross="{merge}"' if merge else ""
    value_type = "Number" if number else "String"
    return f'<Cell ss:StyleID="{style}"{merge_attribute}><Data ss:Type="{value_type}">{escape(str(value))}</Data></Cell>'


def _duration(seconds):
    if seconds is None:
        return "-"
    minutes, rest = divmod(seconds, 60)
    return f"{minutes}분 {rest}초" if minutes else f"{rest}초"


def _date(value):
    local = timezone.localtime(value)
    return f"{local:%Y/%m/%d %H:%M:%S} ({WEEKDAYS[local.weekday()]})"


def _header(account, summary):
    styles = """<Styles>
    <Style ss:ID="Default"><Alignment ss:Vertical="Center"/><Font ss:FontName="맑은 고딕" ss:Size="11"/></Style>
    <Style ss:ID="Border"><Alignment ss:Horizontal="Center" ss:Vertical="Center"/><Borders><Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1"/><Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1"/></Borders></Style>
    <Style ss:ID="Title" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="12" ss:Bold="1"/><Interior ss:Color="#E2F0D9" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Header" ss:Parent="Border"><Font ss:FontName="맑은 고딕" ss:Size="11" ss:Bold="1"/><Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/></Style>
    <Style ss:ID="Center" ss:Parent="Border"/><Style ss:ID="Success" ss:Parent="Border"><Font ss:Bold="1" ss:Color="#008000"/></Style><Style ss:ID="Failure" ss:Parent="Border"><Font ss:Bold="1" ss:Color="#C00000"/></Style><Style ss:ID="Progress" ss:Parent="Border"><Font ss:Bold="1" ss:Color="#0070C0"/></Style>
    </Styles>"""
    rate = round(summary["completed"] / summary["total"] * 100) if summary["total"] else 0
    return f'''<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel">{styles}<Worksheet ss:Name="연습 통계"><Table><Column ss:Width="45"/><Column ss:Width="250"/><Column ss:Width="120"/><Column ss:Width="110"/><Column ss:Width="95"/><Row ss:Height="28">{_cell(f"{account.user.username}의 키오스크", "Title", 1)}{_cell("진행", "Title")}{_cell("성공/실패", "Title")}{_cell("성공률", "Title")}</Row><Row ss:Height="28">{_cell("전체성공률", "Title", 1)}{_cell(f"{summary['total']}회", "Title")}{_cell(f"{summary['completed']}회/{summary['failed']}회", "Title")}{_cell(f"{rate}%", "Title")}</Row><Row ss:Height="12"><Cell/></Row><Row ss:Height="25">{_cell("N", "Header")}{_cell("날짜", "Header")}{_cell("섹션", "Header")}{_cell("소요시간", "Header")}{_cell("결과", "Header")}</Row>'''


def practice_export_response(account):
    queryset = PracticeSession.objects.filter(account=account).order_by("-started_at")
    summary = queryset.aggregate(
        total=Count("id"),
        completed=Count("id", filter=Q(status="COMPLETED")),
        failed=Count("id", filter=Q(status="FAILED")),
    )

    def rows():
        yield _header(account, summary)
        for index, item in enumerate(queryset[:EXCEL_ROW_LIMIT].iterator(chunk_size=2000), start=1):
            style = "Success" if item.status == "COMPLETED" else "Failure" if item.status == "FAILED" else "Progress"
            yield f'<Row ss:Height="24">{_cell(index, number=True)}{_cell(_date(item.started_at))}{_cell(item.get_service_display())}{_cell(_duration(item.duration_seconds))}{_cell(STATUS_LABEL[item.status], style)}</Row>'
        yield '</Table><WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel"><Selected/><FreezePanes/><FrozenNoSplit/><SplitHorizontal>4</SplitHorizontal><TopRowBottomPane>4</TopRowBottomPane><PageSetup><Layout x:Orientation="Landscape"/></PageSetup></WorksheetOptions></Worksheet></Workbook>'

    response = StreamingHttpResponse(rows(), content_type="application/vnd.ms-excel; charset=utf-8")
    filename = quote(f"{account.user.username}_연습통계_{timezone.localdate():%Y-%m-%d}.xls")
    response["Content-Disposition"] = f"attachment; filename*=UTF-8''{filename}"
    response["X-Accel-Buffering"] = "no"
    return response
