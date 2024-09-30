from django.urls import path
from .views import UserRegistrationView, check_unique, sensor_data, upload_image, login_view, UserDetailView, UpdateUserEmailView, ChangePasswordView


urlpatterns = [
    path('signup/', UserRegistrationView.as_view(), name='signup'),
    path('login/', login_view, name='login'),
    path('check-unique/', check_unique, name='check-unique'),
    path('iot/sensor_data/', sensor_data, name='sensor_data'),
    path('iot/upload_image/', upload_image, name='upload_image'),
    path('api/user/', UserDetailView.as_view(), name='user-detail'),
    path('api/user/update-email/', UpdateUserEmailView.as_view(), name='user-update-email'),
    path('api/user/change-password/', ChangePasswordView.as_view(), name='change-password'),
]
