from .models import User, Image, SensorData
from django.http import JsonResponse, HttpResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
import json
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login


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

def login_view(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']
        user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
        else:
            return HttpResponse('Invalid login credentials')
    return render(request, 'login.html')


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
        data = json.loads(request.body)
        sensor_value = data.get('sensor_value')
        SensorData.objects.create(sensor_value=sensor_value)
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'failed'}, status=400)