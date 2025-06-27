from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, SAFE_METHODS
from .permissions import IsAdmin, IsOwnerOrAdmin, IsStaffOrOwner
from rest_framework import generics, status, views
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.urls import reverse
import random, string 
from django.conf import settings
from django.db.models import Q 
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .models import PasswordResetCode
from .serializers import (
    RegisterSerializer, 
    UserSerializer, 
    LoginHistorySerializer, 
    PasswordResetRequestSerializer, 
    PasswordResetVerifySerializer, 
    LogoutSerializer,
    )

# Create your views here.
User = get_user_model() 

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({"detail": "Hello, {}".format(request.user.username)})
    
class AdminOnlyView(APIView):
    permission_classes = [IsAdmin]
    def get(self, request):
        return Response({"detail": "Admins only"})
    
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny] # Allows anyone to register
    def perform_create(self, serializer):
        user = serializer.save()
        token = default_token_generator.make_token(user)
        verify_path = reverse('verify-email')
        verify_url = self.request.build_absolute_uri(f"{verify_path}?uid={user.id}&token={token}")
        send_mail(
            subject="Verify your FarmBotika account",
            message=(
                f"Hi {user.username},\n\n"
                "Thanks for registering at FarmBotika!\n"
                "Please verify your email by clicking the link below:\n\n"
                f"{verify_url}\n\n"
                "If you did not sign up, you can ignore this email."
            ),
            from_email="no-reply@farmbotika.local",
            recipient_list=[user.email],
            fail_silently=False,
        )

class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    def get_object(self):
        return self.request.user

class VerifyEmailView(APIView):
    permission_classes = []
    def get(self, request):
        uid = request.GET.get('uid')
        uid = request.GET.get('uid')
        token = request.GET.get('token')
        try:
            user = User.objects.get(pk=uid)
        except User.DoesNotExist:
            return Response({'detail': 'Invalid user.'},status=status.HTTP_400_BAD_REQUEST)
        if default_token_generator.check_token(user, token):
            user.email_verified = True
            user.save()
            return Response({'detail': 'Email verified successfully.'})
        return Response({'detail': 'Invalid or expired token.'}, status=status.HTTP_400_BAD_REQUEST)

class LoginHistoryView(generics.ListAPIView):
    serializer_class = LoginHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return self.request.user.logins.all().order_by('-timestamp')

class PasswordResetRequestView(views.APIView): ## Generates a code and sends it to the users email.
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']
        try:
            user = User.objects.get(Q(email=identifier) | Q(phone=identifier))
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        code = ''.join(random.choices(string.digits, k=6))
        expires_at = timezone.now() + timezone.timedelta(minutes=30)
        PasswordResetCode.objects.create(user=user, code=code, expires_at=expires_at)

        # Send reset code via email
        send_mail(
            subject='Your Password Reset Code',
            message=f'Your password reset code is: {code}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False
        )
        return Response({"detail": "Reset code sent."}, status=200)

class PasswordResetVerifyView(views.APIView): ## It validates/invalidate the code sent; Successful validation allows for updating the password.
    permission_classes = [AllowAny] 
    def post(self, request):
        serializer = PasswordResetVerifySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        identifier = serializer.validated_data['identifier']
        code = serializer.validated_data['code']
        new_password = serializer.validated_data['new_password']

        try:
            user = User.objects.get(Q(email=identifier) | Q(phone=identifier))
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        try:
            reset_code = PasswordResetCode.objects.filter(user=user, code=code).latest('created_at')
        except PasswordResetCode.DoesNotExist:
            return Response({"detail": "Invalid code."}, status=400)

        if reset_code.is_expired():
            return Response({"detail": "Code expired."}, status=400)

        user.set_password(new_password)
        user.save()
        reset_code.delete()

        return Response({"detail": "Password reset successful."}, status=200)

class LogoutView(views.APIView): ## Blacklists the refresh token to log out the user.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token_str = serializer.validated_data['refresh']
        try:
            token = RefreshToken(token_str)
            token.blacklist()
        except Exception:
            return Response({"detail": "Invalid token."}, status=400)

        return Response({"detail": "Logout successful."}, status=200)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.request.method in SAFE_METHODS:
            return [IsStaffOrOwner()]
        if self.request.method in ['PUT', 'PATCH']:
            return [IsOwnerOrAdmin()]
        if self.request.method == 'DELETE':
            return [IsAdmin()]
        return super().get_permissions()
    

