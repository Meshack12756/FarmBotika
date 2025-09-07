from django.db import models
from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.db.models.signals import post_save
import re

# Create your models here.
class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('expert', 'Expert'),
        ('moderator', 'Moderator'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='farmer')
    region = models.CharField(max_length=50, blank=True)
    farm_type = models.CharField(max_length=100, blank=True)
    experience_years = models.PositiveIntegerField(default=0)
    points = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} Profile"
    
class Thread(models.Model): 
    title = models.CharField(max_length=200)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="threads")
    created_at = models.DateTimeField(auto_now_add=True)
    comments = GenericRelation('Comment')

    def __str__(self):
        return self.title

class Comment(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    author_name = models.CharField(max_length=100, blank=True, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    parent = models.ForeignKey('self', null=True, on_delete=models.CASCADE, related_name='children')
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    image = models.ImageField(upload_to='comments/images/', blank=True, null=True)
    video = models.FileField(upload_to='comments/videos/', blank=True, null=True)
    audio = models.FileField(upload_to='comments/audio/', blank=True, null=True)
    latitude = models.DecimalField(max_digits=8, decimal_places=5, blank=True, null=True)
    longitude = models.DecimalField(max_digits=8, decimal_places=5, blank=True, null=True)
    
    def __str__(self):
        author = self.author_name or (self.user.username if self.user else 'Anonymous')
        return f"comment by {author} on {self.created_at}"
    
    def get_children(self):
        return Comment.objects.filter(parent=self)

class Reaction(models.Model):
    comment = models.ForeignKey(Comment, related_name='reactions', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reaction_type = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    comments = models.ManyToManyField(Comment, related_name='tags')

    def __str__(self):
        return self.name #Subject to change based on requirements

class Notification(models.Model):
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='sent_notifications'
    )
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='received_notifications'
    )
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return f"Notification for {self.recipient.username}"