#admin.py
from django.contrib import admin
from .models import CustomUser, Content

# Register your models here.
admin.site.register(CustomUser)
admin.site.register(Content)
