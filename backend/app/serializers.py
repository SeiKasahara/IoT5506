from rest_framework import serializers
from .models import Threshold, User
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'devicename', 'mail_alert']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def validate_devicename(self, value):
        if User.objects.filter(devicename=value).exists():
            raise serializers.ValidationError('Devicename already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Email already exists')
        return value
    

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

class ChangeDeviceNameSerializer(serializers.Serializer):
    new_devicename = serializers.CharField(max_length=150)

class ThresholdSerializer(serializers.ModelSerializer):
    class Meta:
        model = Threshold
        fields = ['temperature', 'humidity', 'gas_concentration']