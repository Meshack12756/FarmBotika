from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

# 🔐 Custom user model for flexible auth and role-based access
class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('STAFF', 'Staff'),
        ('FARMER', 'Farmer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='FARMER')
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    language = models.CharField(
        max_length=12,
        choices=(('en', 'English'), ('swa', 'Swahili')),
        default='en'
    )
    email_verified = models.BooleanField(default=False)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.username


# 🧠 Login history for analytics, security, and audit trails
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
        return f"{self.user.username} @ {self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}"


# 🔁 One-time password reset codes with expiry logic
class PasswordResetCode(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(blank=True)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=15)
        super().save(*args, **kwargs)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.code} for {self.user.username} (expires @ {self.expires_at.strftime('%H:%M')})"