from django.urls import path

from .views import address_search

urlpatterns = [path("addresses/search/", address_search, name="delivery-address-search")]

