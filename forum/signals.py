import re
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Comment, Tag, Notification 
from django.contrib.auth import get_user_model
import logging
from django.contrib.contenttypes.models import ContentType

logger = logging.getLogger(__name__)
hashtag_pattern = re.compile(r'#(\w+)')
mention_pattern = re.compile(r"@(\w+)")
User = get_user_model()


def extract_hashtags(sender, instance, created, **kwargs):
    if created and instance.content:
        hashtags = hashtag_pattern.findall(instance.content)
        for tag in hashtags:
            tag_obj, _ = Tag.objects.get_or_create(name=tag.lower())
            instance.tags.add(tag_obj)

@receiver(post_save, sender=Comment)
def extract_mentions(sender, instance, created, **kwargs):
    logger.info(f"Signal triggered for comment {instance.id}, created: {created}")
    if not created or not instance.content:
        logger.info(f"Skipping - not a new comment or empty content")

    mentions = mention_pattern.findall(instance.content)
    logger.info(f"found mentions: {mentions}")

    for username in mentions:
        try:
            mentioned_user = User.objects.get(username__iexact=username)
            logger.info(f"Creating notification for {mentioned_user.username}")

            Notification.objects.create(
                sender=instance.user, #if instance.user else None, 
                recipient=mentioned_user,
                message=f"{instance.user.username} mentioned you in a comment",
                content_type=ContentType.objects.get_for_model(Comment),
                object_id=instance.id,
            )
        except User.DoesNotExist:
            logger.warning(f"Mentioned user {username} does not exist")
            continue

