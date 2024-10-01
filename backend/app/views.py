from datetime import timedelta
import os
import random

import json
import string

from threading import Timer

from django.conf import settings
from pathlib import Path

from django.shortcuts import render
from dotenv import load_dotenv

from app.upload_handlers import CustomUploadHandler
load_dotenv()

from .models import EmailVerificationCode, User, Image, SensorData, Device
from django.http import FileResponse, Http404, JsonResponse
from .serializers import UserSerializer, ChangePasswordSerializer, ChangeDeviceNameSerializer

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from rest_framework_simplejwt.authentication import JWTAuthentication # type: ignore
from rest_framework.decorators import authentication_classes, permission_classes


from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError, transaction, models
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth import authenticate, login
from django.utils import timezone

##########################################################################################
# djangorestframework-simplejwt version 5.3.1 and before 
# is vulnerable to information disclosure. 
# A user can access web application resources even after their account has been disabled
# due to missing user validation checks via the for_user method.
##########################################################################################

BACKEND_URL = os.environ.get("BACKEND_URL")

def generate_token_for_user(user):
    if not user.is_active:
        raise ValueError("User account is disabled")
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class UserRegistrationView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserDetailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
class UpdateUserEmailView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user = self.request.user
        email = request.data.get('email')
        if email:
            code = str(random.randint(100000, 999999))
            EmailVerificationCode.objects.create(user=user, code=code)
            subject = 'Email Verification Code'
            message = f"""
            Dear User,

            Thank you for registering with our Smart Fridge Program.

            Your verification code is: {code}

            Please enter this code in the verification field to complete your registration.

            Best regards,
            Smart Fridge Program Team

            ---

            This is an automated message, please do not reply.
            """
            from_email = 'your_email@example.com'
            recipient_list = [email]
            send_mail(
                subject,
                message,
                from_email,
                recipient_list,
                fail_silently=False,
            )

            return Response({'status': 'verification code sent'}, status=status.HTTP_200_OK)
        return Response({'error': 'email not provided'}, status=status.HTTP_400_BAD_REQUEST)
    
class VerifyEmailCodeView(generics.GenericAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def post(self, request, *args, **kwargs):
        user = self.request.user
        code = request.data.get('code')
        email = request.data.get('email')
        if code and email:
            try:
                verification_code = EmailVerificationCode.objects.get(user=user, code=code)
                if timezone.now() - verification_code.created_at > timedelta(minutes=10):
                    return Response({'error': 'verification code expired'}, status=status.HTTP_400_BAD_REQUEST)
                
                user.email = email
                user.save()
                verification_code.delete()
                return Response({'status': 'email updated'}, status=status.HTTP_200_OK)
            except EmailVerificationCode.DoesNotExist:
                return Response({'error': 'invalid verification code'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'error': 'code or email not provided'}, status=status.HTTP_400_BAD_REQUEST)

class ChangeAlertView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
    def get(self, request, *args, **kwargs):
        user = self.get_object()
        return Response({'mail_alert': user.mail_alert}, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)

        if serializer.is_valid():
            new_active_statement = serializer.validated_data.get("mail_alert")
            if isinstance(new_active_statement, bool):
                user.mail_alert = new_active_statement
                user.save()
                return Response({'status': 'mail_alert updated successfully'}, status=status.HTTP_200_OK)
            else:
                print(new_active_statement)
                return Response({'error': 'Invalid mail_alert value'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)

            # Set new password
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"detail": "Password updated successfully."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangeDeviceNameView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangeDeviceNameSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Set new device name
            new_devicename = serializer.validated_data.get("new_devicename")
            old_devicename = user.devicename
            try:
                with transaction.atomic():
                    user.devicename = new_devicename
                    user.save()
                    Device.objects.filter(devicename=old_devicename).update(devicename=new_devicename)
                    Image.objects.filter(devicename=old_devicename).update(devicename=new_devicename)
            except IntegrityError:
                return Response({"detail": "Failed to update table"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response({"detail": "Devicename updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

        if email is None or password is None:
            return JsonResponse({'error': 'Email and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            refresh = RefreshToken.for_user(user)
            return JsonResponse({
                'message': 'Login successful',
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }, status=status.HTTP_200_OK)
        else:
            return JsonResponse({'error': 'Invalid login credentials'}, status=status.HTTP_400_BAD_REQUEST)
    return JsonResponse({'error': 'Invalid request method'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@csrf_exempt
def check_unique(request):
    try:
        email = request.GET.get('email')
        devicename = request.GET.get('devicename')
        data = {
            'email_taken': False,
            'devicename_taken': False,
        }

        # print(f"Received email: {email}")
        # print(f"Received username: {username}")

        if email and User.objects.filter(email__iexact=email).exists():
            data['email_taken'] = True
            data['email_error_message'] = 'Email address has been registered, please enter another email'

        if devicename and User.objects.filter(devicename__iexact=devicename).exists():
            data['devicename_taken'] = True
            data['devicename_error_message'] = 'Device name has been registered, please enter another device name'

        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def upload_image(request):
    request.upload_handlers.insert(0, CustomUploadHandler(request))
    if request.method == 'POST':
        file = request.FILES.get('file')
        if file:
            return JsonResponse({'message': 'File uploaded successfully'})
        else:
            return JsonResponse({'message': 'No file found in request'}, status=400)
    return JsonResponse({'message': 'Invalid request method'}, status=405)

# Dictionary to keep track of timers for each device
device_timers = {}

def reset_device_status(device):
    device.is_fire_beetle_active = 0
    device.save()

@csrf_exempt
def sensor_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sensor_humidity = data.get('sensor_humidity')
            sensor_temperature = data.get('sensor_temperature')
            sensor_gas = data.get('sensor_gas_ch4')
            deviceMAC = data.get('deviceMAC')

            if not all([sensor_humidity, sensor_temperature, sensor_gas, deviceMAC]):
                return JsonResponse({'status': 'failed', 'message': 'Missing fields'}, status=400)

            device = Device.objects.filter(fire_beetle_mac_address=deviceMAC).first()
            if not device:
                return JsonResponse({'status': 'failed', 'message': 'Unauthorized MAC address'}, status=403)

            SensorData.objects.create(
                sensor_humidity=sensor_humidity,
                sensor_temperature=sensor_temperature,
                sensor_gas=sensor_gas,
                deviceMAC=device
            )

            # Set is_fire_beetle_active to 1
            device.is_fire_beetle_active = 1
            device.save()

            # Cancel any existing timer for this device
            if deviceMAC in device_timers:
                device_timers[deviceMAC].cancel()

            # Set a new timer to reset is_fire_beetle_active to 0 after 2 minutes
            timer = Timer(120, reset_device_status, [device])
            timer.start()
            device_timers[deviceMAC] = timer

            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'failed', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'}, status=400)
class SensorDataGet(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        devicename = user.devicename
        device = Device.objects.filter(devicename=devicename).first()

        if not device:
            return JsonResponse({'status': 'failed', 'message': 'Unauthorized device'}, status=403)

        data = SensorData.objects.filter(deviceMAC=device).values('timestamp', 'sensor_humidity', 'sensor_temperature', 'sensor_gas')
        return JsonResponse(list(data), safe=False)

def generate_token():
    return ''.join(random.choices(string.ascii_letters + string.digits, k=32))

def create_ino_content(device_name, token):
    ino_content = f"""
    #include <WiFi.h>
    #include <HTTPClient.h>
    #include <EEPROM.h>

    const char* ssid = "ssid"; // Enter your Wi-Fi name
    const char* password = "password"; // Enter your Wi-Fi password
    const char* serverName = "{BACKEND_URL}/iot/{device_name}-verify/";
    const int tokenAddress = 0; // EEPROM address to store the token

    void setup() {{
        Serial.begin(115200);
        WiFi.begin(ssid, password);

        while (WiFi.status() != WL_CONNECTED) {{
            delay(1000);
            Serial.println("Connecting to WiFi...");
        }}

        Serial.println("Connected to WiFi");

        // Store token in EEPROM if not already stored
        /*
        if (EEPROM.read(tokenAddress) != '{token}') {{
            EEPROM.begin(512);
            for (int i = 0; i < strlen("{token}"); i++) {{
                EEPROM.write(tokenAddress + i, '{token}'[i]);
            }}
            EEPROM.commit();
        }}*/

        // Send data to backend
        sendData();
    }}

    void loop() {{
        // Continuously send data every 10-20 seconds
        sendData();
        delay(10000); // Adjust the delay as needed (10000 ms = 10 seconds)
    }}

    void sendData() {{
        if (WiFi.status() == WL_CONNECTED) {{
            HTTPClient http;
            http.begin(serverName);
            http.addHeader("Content-Type", "application/json");

            String postData = "{{\\"mac_address\\":\\"" + WiFi.macAddress() + "\\", \\"token\\":\\"" + "{token}" + "\\"}}";

            int httpResponseCode = http.POST(postData);

            if (httpResponseCode == 200) {{
                String response = http.getString();
                Serial.println(httpResponseCode);
                Serial.println(response);
                if (httpResponseCode == 200) {{
                    Serial.println("HTTP POST successful, disconnecting WiFi...");
                    WiFi.disconnect();
                }}
            }} else {{
                Serial.print("Error on sending POST: ");
                Serial.println(httpResponseCode);
            }}

            http.end();
        }}
    }}
    """
    return ino_content
class GenerateTokensView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        firebeetle_token = generate_token()
        xiao_token = generate_token()

        user = request.user

        # Ensure that devicename is a User instance
        device, created = Device.objects.update_or_create(
            devicename=user,  # Pass the User instance here
            defaults={
                "fire_beetle_token": firebeetle_token,
                "xiao_token": xiao_token
            }
        )

        firebeetle_ino = create_ino_content("FireBeetleESP32", firebeetle_token)
        xiao_ino = create_ino_content("XIAOESP32Camera", xiao_token)

        response_data = {
            "firebeetle_token": firebeetle_token,
            "xiao_token": xiao_token,
            "firebeetle_ino": firebeetle_ino,
            "xiao_ino": xiao_ino,
        }

        return Response(response_data, status=status.HTTP_200_OK)



@csrf_exempt
def xiao_verify_token(request):
    try:
        data = json.loads(request.body)
        mac_address = data.get('mac_address')
        token = data.get('token')

        if not token:
            return JsonResponse({"error": "Token is required"}, status=400)

        device = Device.objects.filter(xiao_token=token).first()

        if device:
            device.xiao_mac_address = mac_address
            device.save()
            message = {"message": "Xiao bound successfully"}
        else:
            return JsonResponse({"error": "Invalid token"}, status=400)

        cache.set(f'xiao_verify_{token}', message, timeout=300)

        return JsonResponse(message, status=200 if device else 400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

@csrf_exempt
def firebeetle_verify_token(request):
    try:
        data = json.loads(request.body)
        mac_address = data.get('mac_address')
        token = data.get('token')

        if not token:
            return JsonResponse({"error": "Token is required"}, status=400)

        device = Device.objects.filter(fire_beetle_token=token).first()

        if device:
            device.fire_beetle_mac_address = mac_address
            device.save()
            message = {"message": "FireBeetle bound successfully"}
        else:
            return JsonResponse({"error": "Invalid token"}, status=400)

        cache.set(f'firebeetle_verify_{token}', message, timeout=300)

        return JsonResponse(message, status=200 if device else 400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

def poll_xiao_verify(request):
    token = request.GET.get('token')
    if not token:
        return JsonResponse({"error": "Token is required"}, status=400)
    
    result = cache.get(f'xiao_verify_{token}')
    if result:
        return JsonResponse(result)
    else:
        return JsonResponse({"error": "Pending"}, status=202)

def poll_firebeetle_verify(request):
    token = request.GET.get('token')
    if not token:
        return JsonResponse({"error": "Token is required"}, status=400)
    
    result = cache.get(f'firebeetle_verify_{token}')
    if result:
        return JsonResponse(result)
    else:
        return JsonResponse({"error": "Pending"}, status=202)

class UserDeviceInfo(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        devicename = user.devicename
        device = Device.objects.filter(devicename=devicename).first()

        if not device:
            return Response({'status': 'failed', 'message': 'Device not found'}, status=404)

        data = {
            'username': user.username,
            'devicename': devicename,
            'fire_beetle_mac_address': device.fire_beetle_mac_address,
            'xiao_mac_address': device.xiao_mac_address,
            'is_fire_beetle_active': device.is_fire_beetle_active,
            'is_xiao_active': device.is_xiao_active,
        }

        return Response(data)

class LatestImageView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
            media_path = Path(settings.MEDIA_ROOT)
            images = list(media_path.glob('*.jpg')) + list(media_path.glob('*.png'))  # Adjust the extensions as needed
            latest_image = max(images, key=os.path.getctime) if images else None

            if latest_image:
                try:
                    return FileResponse(open(latest_image, 'rb'), content_type='image/jpeg')
                except FileNotFoundError:
                    raise Http404("Image not found")
            else:
                return JsonResponse({'error': 'No images found'}, status=404)