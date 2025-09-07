# scripts/test_comments.py
import os
import sys

# 1) Bootstrap Django
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "farmbotika_hub.settings")
import django; django.setup()

from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from forum.models import Thread, Comment

User = get_user_model()

# 2) Ensure a test user exists
u, _ = User.objects.get_or_create(username="alice")

# 3) Create (or get) a Thread to comment on
thread, _ = Thread.objects.get_or_create(
    title="Test Discussion Thread",
    defaults={"created_by": u}
)

# 4) Fetch the ContentType for Thread
ct = ContentType.objects.get_for_model(Thread)

# 5) Create a root comment attached to the thread
root = Comment.objects.create(
    user=u,
    content_type=ct,
    object_id=thread.pk,
    content="Root comment for threading test"
)

# 6) Create a reply to that comment
reply = Comment.objects.create(
    user=u,
    content_type=ct,
    object_id=thread.pk,
    content="Reply to root",
    parent=root
)

# 7) Verify the threading
print("Thread:", thread.title)
print("Root comment ID:", root.pk)
print("Replies to root:", root.get_children().count())  # expect 1
