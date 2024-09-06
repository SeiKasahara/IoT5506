from django.urls import path
from .views import UserRegistrationView, check_unique, sensor_data, upload_image, login_view

urlpatterns = [
    path('signup/', UserRegistrationView.as_view(), name='signup'),
    path('login/', login_view, name='login'),
    path('check-unique/', check_unique, name='check-unique'),
    path('iot/sensor_data/', sensor_data, name='sensor_data'),
    path('iot/upload_image/', upload_image, name='upload_image'),
]
