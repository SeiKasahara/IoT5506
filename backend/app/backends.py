from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()

class EmailBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        email = kwargs.get('email')
        if email is None:
            return None
        try:
            user = User.objects.get(email=email)
            #print(f"User found: {user.email}")  
        except User.DoesNotExist:
            #print(f"User with email {email} does not exist")  
            return None
        if user.check_password(password):
            return user
        return None