from rest_framework.pagination import CursorPagination


class PracticeSessionPagination(CursorPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200
    ordering = "-started_at"

