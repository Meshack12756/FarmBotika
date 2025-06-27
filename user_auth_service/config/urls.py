"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from accounts.views import (
    PasswordResetRequestView, 
    PasswordResetVerifyView, 
    LogoutView,
    UserListView,
    UserDetailView,
    )

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtainer_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/', include('accounts.urls')), #Endpoint for 'accounts'
    path('api/auth/password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('api/auth/password-reset/verify/', PasswordResetVerifyView.as_view(), name='password_reset_verify'),
    path('api/auth/logout/', LogoutView.as_view(), name='logout'),
    path('api/auth/users/', UserListView.as_view(), name= 'user-list'),
    path('api/auth/users/<int:pk>/', UserDetailView.as_view(), name= 'user-detail'),

]
