from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
import re

class CustomUser(AbstractUser):
    USER_TYPE_CHOICES = (
        ('user', 'User'),
        ('host', 'Host'),
    )
    
    email = models.EmailField(unique=True)
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default='user')
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    mongodb_id = models.CharField(max_length=24, null=True, blank=True)  # To store MongoDB _id

    class Meta:
        db_table = 'auth_user'

    def clean(self):
        # Email validation
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, self.email):
            raise ValidationError('Invalid email format')

        # Username validation
        if len(self.username) < 3:
            raise ValidationError('Username must be at least 3 characters long')
        if not re.match(r'^[a-zA-Z0-9_]+$', self.username):
            raise ValidationError('Username can only contain letters, numbers, and underscores')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

class Content(models.Model):
    heading = models.CharField(max_length=200)
    description = models.TextField()
    host = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='contents')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    mongodb_id = models.CharField(max_length=24, null=True, blank=True)

    class Meta:
        db_table = 'contents'
        ordering = ['-uploaded_at']

    def __str__(self):
        return self.heading
