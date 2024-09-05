from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission


class User(AbstractUser):
    first_name = None
    last_name = None
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)

    groups = models.ManyToManyField(
        Group,
        blank=True,
        related_name="custom_user_groups",
        related_query_name="user",
        verbose_name='groups',
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
    )
    user_permissions = models.ManyToManyField(
        Permission,
        blank=True,
        related_name="custom_user_permissions",
        related_query_name="user",
        verbose_name='user permissions',
        help_text='Specific permissions for this user.',
    )
