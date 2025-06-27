from django.urls import path
from .views import RegisterView, ProtectedView, VerifyEmailView, LoginHistoryView ### More to be imported later during development

# accounts/urls.py
from .views import (
    RegisterView,
    ProfileView,
    VerifyEmailView,
    LoginHistoryView,
    ProtectedView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('logins/', LoginHistoryView.as_view(), name='login-history'),
    path('protected/', ProtectedView.as_view(), name='protected'),
]
