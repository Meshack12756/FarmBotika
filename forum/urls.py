from django.urls import path
from .views import post_comment
from . import views

urlpatterns = [
    path('', views.thread_list, name='thread_list'),               # GET / → list threads
    path('thread/<int:thread_id>/', views.thread_detail, name='thread_detail'),
    path('comment/post/', post_comment, name='post_comment')

]
