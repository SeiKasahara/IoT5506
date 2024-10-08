import base64
from datetime import timedelta
import os
import random

import json
import string

from threading import Timer


from django.conf import settings
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

import cv2
import torch
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms
from torchvision import models as tmodels


from .models import EmailVerificationCode, ImagePrediction, Threshold, User, Image, SensorData, Device
from django.http import FileResponse, Http404, JsonResponse
from .serializers import ThresholdSerializer, UserSerializer, ChangePasswordSerializer, ChangeDeviceNameSerializer

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from rest_framework_simplejwt.authentication import JWTAuthentication # type: ignore

from django.views.decorators.csrf import csrf_exempt
from django.db import IntegrityError, transaction, models
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth import authenticate, login
from django.utils import timezone
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

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

            Please enter this code in the verification field to complete your email updation.

            Best regards,
            Smart Fridge Program Team

            ---

            This is an automated message, please do not reply.
            """
            from_email = 'test@test.com'
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
    
class SetThresholdView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ThresholdSerializer

    def get_object(self):
        threshold, created = Threshold.objects.get_or_create(user=self.request.user)
        return threshold

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)
    
    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

def check_thresholds_and_alert(latest_data):
    device = Device.objects.get(fire_beetle_mac_address=latest_data.deviceMAC)
    user = device.devicename  # Get the user associated with the device

    # Get all thresholds for this user
    thresholds = Threshold.objects.filter(user=user)
    now = timezone.now()

    for threshold in thresholds:
        if (float(latest_data.sensor_temperature) > threshold.temperature or
            float(latest_data.sensor_humidity) > threshold.humidity or
            float(latest_data.sensor_gas) > threshold.gas_concentration):
            
            if threshold.user.mail_alert:
                if not threshold.user.last_alert_sent or (now - threshold.user.last_alert_sent) > timedelta(minutes=30):
                    send_alert_email(threshold.user.email, latest_data)
                    threshold.user.last_alert_sent = now
                    threshold.user.save()

def send_alert_email(email, data):
    subject = 'Alert: Threshold Exceeded'
    message = f'Temperature: {data.sensor_temperature}°C\nHumidity: {data.sensor_humidity}%\nGas Concentration: {data.sensor_gas} ppm'
    send_mail(subject, message, 'test@test.com', [email])

def check_freshness(latest_data):
    all_predictions = ImagePrediction.objects.all()
    now = timezone.now()

    for elem in all_predictions:
        if elem.freshness == 'Spoiled' and elem.device_id:
            device = Device.objects.filter(id=elem.device_id).first()
            if device:
                user = User.objects.filter(devicename=device.devicename).first()
                if user and user.mail_alert:
                    #if not user.last_alert_sent or (now - user.last_alert_sent) > timedelta(minutes=30):
                    send_alert_email_food(user.email, latest_data)
                        #user.last_alert_sent = now
                    #user.save()

def send_alert_email_food(email):
    subject = 'Alert: Food decayed'
    message = f"""Dear User,

            Please check your food status, it's almost spoiled.

            (The model has accuracy to identify freshness, the wrong information may provided)

            Best regards,
            Smart Fridge Program Team

            ---

            This is an automated message, please do not reply."""
    send_mail(subject, message, 'test@test.com', [email])

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


# Dictionary to keep track of timers for each device
device_timers = {}

def reset_device_status(device):
    device.is_fire_beetle_active = 0
    device.save()

def reset_xiao_status(device):
    device.is_xiao_active = 0
    device.save()

#####################
# MACHINE LEARNING #
#####################

class Model(nn.Module):
    def __init__(self):
        super(Model, self).__init__()
        self.alpha = 0.7

        self.base = tmodels.resnet18()
        for param in list(self.base.parameters())[:-15]:
            param.requires_grad = False
                    
        self.base.classifier = nn.Sequential()
        self.base.fc = nn.Sequential()
            
        self.block1 = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
        )
        
        
        self.block2 = nn.Sequential(
            nn.Linear(128, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 9)
        )
        
        self.block3 = nn.Sequential(
            nn.Linear(128, 32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, 2)
        )
    
    def forward(self, x):
        x = self.base(x)
        x = self.block1(x)
        y1, y2 = self.block2(x), self.block3(x)
        return y1, y2

DEVICE = "cpu"
MODEL = Model()
MODEL_PATH = os.path.join(settings.MEDIA_ROOT, 'parameters/FreshnessDetector.pt')
MODEL.load_state_dict(torch.load(MODEL_PATH, map_location=torch.device(DEVICE)), strict=True)
MODEL.to(DEVICE)
MODEL.eval()

def image_transform(img, p=0.5, training=True):
    if training:
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(p=p),
            transforms.GaussianBlur(3, sigma=(0.1, 2.0)),
            transforms.RandomAdjustSharpness(3, p=p),
            transforms.Normalize(mean=0, std=1)
        ])
    else:
        transform = transforms.Compose([
            transforms.ToTensor(),
            transforms.Resize((224, 224)),
            transforms.Normalize(mean=0, std=1)
        ])
    return transform(img)

def draw_label(image, text, pos, bg_color):
    font_face = cv2.FONT_HERSHEY_SIMPLEX
    scale = 0.6
    color = (255, 255, 255)
    thickness = 1
    margin = 2
    size, baseline = cv2.getTextSize(text, font_face, scale, thickness)
    end_x = pos + size + margin
    end_y = pos + size + margin

    cv2.rectangle(image, pos, (end_x, end_y), bg_color, cv2.FILLED)
    cv2.putText(image, text, (pos, pos + size), font_face, scale, color, thickness, cv2.LINE_AA)

def predict(image_path, model, device):
    # Read and preprocess the image
    img = cv2.imread(image_path)
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img_as_tensor = image_transform(img, training=False)
    
    # Model inference
    model.eval()
    with torch.no_grad():
        img_as_tensor = img_as_tensor.unsqueeze(0).to(device)
        out1, out2 = model(img_as_tensor)
    
    # Calculate probabilities
    softmax = nn.Softmax(dim=1)
    fruit_probs = softmax(out1)
    fresh_probs = softmax(out2)
    
    # Get prediction results
    fruit_class = torch.argmax(fruit_probs, dim=1).item()
    fresh_class = torch.argmax(fresh_probs, dim=1).item()
    
    # Define class names
    fruit_classes = ['apples', 'banana', 'bitterground', 'capsicum', 'cucumber', 'okra', 'oranges', 'potato', 'tomato']
    fresh_classes = ['Fresh', 'Spoiled']
    
    # Get class names and freshness percentage
    fruit_name = fruit_classes[fruit_class]
    fresh_name = fresh_classes[fresh_class]
    fresh_percent = fresh_probs[0, fresh_class].item() * 100  # Ensure correct indexing
    
    # Draw rectangle and labels on the image
    #height, width, _ = img.shape  # Access individual dimensions
    #cv2.rectangle(img, (50, 50), (width - 50, height - 50), (0, 255, 0), 2)
    #draw_label(img, f'{fruit_name}: {fresh_name} ({fresh_percent:.2f}%)', (60, 60), (0, 255, 0))

    #output_path = 'output_image.jpg'
    #full_path = os.path.join('path_to_media_root', output_path)  # Replace 'path_to_media_root' with your actual path
    #cv2.imwrite(full_path, img)
    return fresh_percent, fruit_name, fresh_name


@csrf_exempt
def upload_image(request):
    if request.method == 'POST':
        try:
            # Parse the JSON body of the request
            data = json.loads(request.body)
            image_data = data.get('image_data')
            timestamp = data.get('timestamp')
            deviceMAC = data.get('deviceMAC')

            # Retrieve device based on MAC address
            device = Device.objects.filter(xiao_mac_address=deviceMAC).first()
            if not device:
                return JsonResponse({'status': 'failed', 'message': 'Unauthorized MAC address'}, status=403)

            device.is_xiao_active = 1
            device.save()

            # Cancel any existing timer for this device
            if deviceMAC in device_timers:
                device_timers[deviceMAC].cancel()

            # Set a new timer to reset is_xiao_active to 0 after 2 minutes
            timer = Timer(120, reset_xiao_status, [device])
            timer.start()
            device_timers[deviceMAC] = timer

            if image_data and timestamp:
                # Decode the Base64 encoded image data
                image_data = base64.b64decode(image_data)
                
                # Generate a filename using the timestamp
                unique_filename = f"{timestamp}.jpg"
                
                # Save the image data to the MEDIA_ROOT directory
                path = default_storage.save(unique_filename, ContentFile(image_data))
                
                # Get the full path to the saved file
                full_path = os.path.join(settings.MEDIA_ROOT, path)

                # Call your prediction function to make predictions on the saved image
                prediction, food, freshness  = predict(full_path, MODEL, DEVICE)
                
                # Store the image path, prediction, and timestamp in the ImagePrediction model
                latest_data = ImagePrediction.objects.create(
                    device=device,
                    image_path=path,  # Save relative path to the image
                    prediction=prediction,
                    timestamp=timezone.now(),  # or use the provided timestamp
                    food=food,
                    freshness=freshness
                )

                check_freshness(latest_data)

                return JsonResponse({'message': 'File uploaded successfully', 'file_path': full_path, 'prediction': prediction})
            else:
                return JsonResponse({'message': 'No image data or timestamp found in request'}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'message': 'Invalid JSON'}, status=400)
        except base64.binascii.Error:
            return JsonResponse({'message': 'Invalid Base64 data'}, status=400)
    return JsonResponse({'message': 'Invalid request method'}, status=405)


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

            latest_data = SensorData.objects.create(
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

            check_thresholds_and_alert(latest_data)

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
        try:
            latest_prediction = ImagePrediction.objects.latest('id')
            latest_image_path = latest_prediction.image_path
            prediction_value = latest_prediction.prediction
            timestamp_value = latest_prediction.timestamp
            food_value = latest_prediction.food
            freshness_value = latest_prediction.freshness

            media_path = Path(settings.MEDIA_ROOT) / latest_image_path

            if media_path.exists():
                with open(media_path, 'rb') as image_file:
                    image_data = image_file.read()
                    encoded_image = base64.b64encode(image_data).decode('utf-8')
                    response_data = {
                        'image': encoded_image,
                        'prediction': prediction_value,
                        'timestamp': timestamp_value.isoformat(),
                        'food_v': food_value,
                        'freshness_v': freshness_value
                    }
                    return JsonResponse(response_data)
            else:
                return JsonResponse({'error': 'Image not found'}, status=404)
        except ImagePrediction.DoesNotExist:
            return JsonResponse({'error': 'No images found'}, status=404)