from .models import User, Image, SensorData
from django.http import JsonResponse, HttpResponse
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer, ChangePasswordSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from django.contrib.auth import authenticate, login


##########################################################################################
# djangorestframework-simplejwt version 5.3.1 and before 
# is vulnerable to information disclosure. 
# A user can access web application resources even after their account has been disabled
# due to missing user validation checks via the for_user method.
##########################################################################################

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
    
class UpdateUserView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
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
    if request.method == 'POST' and request.FILES['image']:
        image = request.FILES['image']
        Image.objects.create(image=image)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'failed'}, status=400)

@csrf_exempt
def sensor_data(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            devicename = data.get('devicename')
            sensor_humidity = data.get('sensor_humidity')
            sensor_temperature = data.get('sensor_temperature')
            sensor_gas = data.get('sensor_gas')

            if not all([devicename, sensor_humidity, sensor_temperature, sensor_gas]):
                return JsonResponse({'status': 'failed', 'message': 'Missing fields'}, status=400)

            SensorData.objects.create(
                devicename=devicename,
                sensor_humidity=sensor_humidity,
                sensor_temperature=sensor_temperature,
                sensor_gas=sensor_gas
            )
            return JsonResponse({'status': 'success'})
        except json.JSONDecodeError:
            return JsonResponse({'status': 'failed', 'message': 'Invalid JSON'}, status=400)
    return JsonResponse({'status': 'failed', 'message': 'Invalid request method'}, status=400)