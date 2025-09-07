from django.urls import path
from .views import detect_view

urlpatterns = [
    path('detect/', detect_view, name='detect'),
]