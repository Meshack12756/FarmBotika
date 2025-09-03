# advisory/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('wizard/', views.advisory_wizard, name='advisory_wizard'),
]
