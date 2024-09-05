from django.urls import path
from .views import UserRegistrationView, check_unique

urlpatterns = [
    path('signup/', UserRegistrationView.as_view(), name='signup'),
    path('check-unique/', check_unique, name='check-unique'),
]
