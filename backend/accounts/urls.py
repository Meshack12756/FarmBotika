from django.urls import path
from .views import (
    RegisterView,
    VerifyEmailView,
    LogoutView,
    ProtectedView,
    ProfileView,
    LoginHistoryView,
    PasswordResetRequestView,
    PasswordResetVerifyView,
    AdminOnlyView,
)

urlpatterns = [
    # 🔐 Authentication & Session
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("protected/", ProtectedView.as_view(), name="protected"),

    # 👤 User Profile & Activity
    path("profile/", ProfileView.as_view(), name="profile"),
    path("logins/", LoginHistoryView.as_view(), name="login-history"),

    # 🔑 Password Reset Flow
    path("password-reset/request/", PasswordResetRequestView.as_view(), name="password_reset_request"),
    path("password-reset/verify/", PasswordResetVerifyView.as_view(), name="password_reset_verify"),

    # 🛡️ Admin Access Test
    path("admin-only/", AdminOnlyView.as_view(), name="admin-only"),
]