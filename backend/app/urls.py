from django.urls import path
from .views import ChangeAlertView, LatestImageView, UserDeviceInfo, UserRegistrationView, VerifyEmailCodeView, check_unique, sensor_data, upload_image, login_view, SensorDataGet, xiao_verify_token, poll_xiao_verify, poll_firebeetle_verify, firebeetle_verify_token, GenerateTokensView, ChangeDeviceNameView,  UserDetailView, UpdateUserEmailView, ChangePasswordView


urlpatterns = [
    path('signup/', UserRegistrationView.as_view(), name='signup'),
    path('login/', login_view, name='login'),
    path('check-unique/', check_unique, name='check-unique'),
    path('iot/sensor_data/', sensor_data, name='sensor_data'),
    path('api/sensor_data/', SensorDataGet.as_view(), name='sensor_data_get'),
    path('iot/upload_image/', upload_image, name='upload_image'),
    path('api/user/', UserDetailView.as_view(), name='user-detail'),
    path('api/user/update-email/', UpdateUserEmailView.as_view(), name='user-update-email'),
    path('api/user/verify-email-code/', VerifyEmailCodeView.as_view(), name='verify_email_code'),
    path('api/user/update-active/', ChangeAlertView.as_view(), name='update-active'),
    path('api/user/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('api/user/change-devicename/', ChangeDeviceNameView.as_view(), name='change-devicename'),
    path('api/generate-tokens/', GenerateTokensView.as_view(), name='generate_tokens'),
    path('iot/XIAOESP32Camera-verify/', xiao_verify_token, name="xiao-verify"),
    path('iot/FireBeetleESP32-verify/', firebeetle_verify_token, name="firebeetle-verify"),
    path('api/poll_xiao_verify/', poll_xiao_verify, name="polling-xiao-verify"),
    path('api/poll_firebeetle_verify/', poll_firebeetle_verify, name="polling-firebeetle-verify"),
    path('api/user-device-info/', UserDeviceInfo.as_view(), name='user-device-info'),
    path('api/latest-image/', LatestImageView.as_view(), name='latest-image'),
]
