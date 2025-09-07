from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.models import LoginHistory

User = get_user_model()

# 👤 User profile serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'phone',
            'first_name', 'last_name', 'role',
            'language', 'bio', 'email_verified'
        ]
        read_only_fields = ['id', 'email_verified']

# 📝 Registration serializer
class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'password', 'email', 'phone', 'role']

    def validate(self, attrs):
        email = attrs.get('email')
        phone = attrs.get('phone')
        if not email and not phone:
            raise serializers.ValidationError({
                "email": "Provide either an email or phone number.",
                "phone": "Provide either an email or phone number."
            })
        return attrs

    def create(self, validated_data):
        username = validated_data.get('username')
        password = validated_data.get('password')
        email = validated_data.get('email')
        phone = validated_data.get('phone', '')
        role = validated_data.get('role', 'FARMER')

        # Split full name into first and last name
        full_name = validated_data.get('full_name', '')
        first_name, *rest = full_name.strip().split(' ')
        last_name = ' '.join(rest) if rest else ''

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            phone=phone,
            role=role,
            first_name=first_name,
            last_name=last_name
        )
        return user

# 🕵🏾‍♂️ Login history serializer
class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = ['timestamp', 'ip_address', 'user_agent']

# 🔁 Password reset request serializer
class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField(
        help_text="Enter your email or phone number associated with your account."
    )

# 🔑 Password reset verification + update serializer
class PasswordResetVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()
    code = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

# 🚪 Logout serializer
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate_refresh(self, value):
        try:
            RefreshToken(value)
        except Exception:
            raise serializers.ValidationError("Invalid refresh token.")
        return value