#forum/routing.py

from django.urls import re_path
from .consumers import CommentConsumer

websocket_urlpatters = [
    re_path(r'ws/comments/$', CommentConsumer.as_asgi()),
]