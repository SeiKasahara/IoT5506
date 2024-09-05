from .models import User
from django.http import JsonResponse
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken


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


def check_unique(request):
    try:
        email = request.GET.get('email')
        username = request.GET.get('username')
        data = {
            'email_taken': False,
            'username_taken': False,
        }

        # print(f"Received email: {email}")
        # print(f"Received username: {username}")

        if email and User.objects.filter(email__iexact=email).exists():
            data['email_taken'] = True
            data['email_error_message'] = 'Email address has been registered, please enter another email'

        if username and User.objects.filter(username__iexact=username).exists():
            data['username_taken'] = True
            data['username_error_message'] = 'Username has been registered, please enter another username'

        return JsonResponse(data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
