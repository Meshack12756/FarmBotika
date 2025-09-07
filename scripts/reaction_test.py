import os
import sys

# 1) Bootstrap Django
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "farmbotika_hub.settings")
import django; django.setup()

from forum.models import Reaction, Comment
from django.contrib.auth import get_user_model

User = get_user_model()
u, _ = User.objects.get_or_create(username="alice")
comment1 = Comment.objects.first()
react = Reaction.objects.create(comment=comment1, user=u, reaction_type='upvote')
print(comment1.reactions.count())