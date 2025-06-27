from rest_framework import serializers
from django.contrib.auth import get_user_model
from accounts.models import LoginHistory
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'phone', 'first_name','last_name', 'role', 'language', 'bio', 'email_verified']
        read_only_fields = ['id', 'email_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'phone', 'role']

    def validate(self, attrs):
        if not attrs.get('email') and not attrs.get('phone'):
            raise serializers.ValidationError("Provide email or phone.")
        return attrs

    def create(self, validated_data):
        email = validated_data.get('email')
        if isinstance(email, (list, tuple)):
            email = email[0]
        username=validated_data['username']
        password=validated_data['password']
        email=validated_data.get('email')
        phone=validated_data.get('phone', '')
        role=validated_data.get('role', 'FARMER')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            phone=phone,
            role=role
        )                 
        return user

class LoginHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LoginHistory
        fields = ['timestamp', 'ip_address', 'user_agent']

class PasswordResetRequestSerializer(serializers.Serializer):
    identifier = serializers.CharField() ## It allows for email or phone number from the user 

class PasswordResetVerifySerializer(serializers.Serializer):
    identifier = serializers.CharField()
    code = serializers.CharField()
    new_password = serializers.CharField(min_length=6)

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


