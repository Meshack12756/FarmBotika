from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # 🛠️ Admin Dashboard
    path("admin/", admin.site.urls),

    # 🔐 JWT Token Endpoints
    path("api/auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # 👥 Auth-Related Endpoints
    path("api/auth/", include("accounts.urls")),
    path('pestscan/', include('pestscan.urls')),
]