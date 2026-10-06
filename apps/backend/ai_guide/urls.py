from django.urls import path

from .views import kakao_t_home_voice

urlpatterns = [
    path("kakao-t-home/", kakao_t_home_voice, name="kakao-t-home-voice"),
]
