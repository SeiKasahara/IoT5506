from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    first_name = None
    last_name = None
    username = models.CharField(max_length=150)
    devicename = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    mail_alert = models.BooleanField(null=True, blank=True)
    last_alert_sent = models.DateTimeField(null=True, blank=True)

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

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'devicename']

class Threshold(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    temperature = models.FloatField(null=True, blank=True)
    humidity = models.FloatField(null=True, blank=True)
    gas_concentration = models.FloatField(null=True, blank=True)

class EmailVerificationCode(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

class Device(models.Model):
    devicename = models.ForeignKey(User, to_field='devicename', on_delete=models.CASCADE)
    xiao_token = models.CharField(max_length=32, unique=True)
    fire_beetle_token = models.CharField(max_length=32, unique=True)
    xiao_mac_address = models.CharField(max_length=17, unique=True, null=True, blank=True)
    fire_beetle_mac_address = models.CharField(max_length=17, unique=True, null=True, blank=True)
    is_xiao_active = models.IntegerField(null=True, blank=True)
    is_fire_beetle_active = models.IntegerField(null=True, blank=True)

class SensorData(models.Model):
    deviceMAC = models.ForeignKey(Device, to_field='fire_beetle_mac_address', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    sensor_humidity = models.FloatField()
    sensor_temperature = models.FloatField()
    sensor_gas = models.FloatField()

    def __str__(self):
        return f"{self.timestamp}: {self.sensor_humidity}, {self.sensor_temperature}"
    
class Image(models.Model):
    devicename = models.ForeignKey(User, to_field='devicename', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='images/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

