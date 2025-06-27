from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone

# Custom user model
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
        ('FARMER', 'Farmer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='FARMER')
    phone = models.CharField(max_length=15, blank=True, null=True, unique=True)
    language = models.CharField(
        max_length=12,
        choices=(('en', 'English'), ('swa', 'Swahili')),
        default='en'
    )
    email_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.username

# Records each successful login for analytics
class LoginHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='logins'
    )
    timestamp = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.user.username} at {self.timestamp}"

# Stores one-time password reset codes
class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_expired(self):
        return timezone.now() > self.expires_at
