#urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('upload-content/', views.upload_content, name='upload-content'),
    path('host-contents/<str:host_id>/', views.get_host_contents, name='host-contents'),
    path('available-contents/', views.get_available_contents, name='available-contents'),
] 