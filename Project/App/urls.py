from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MedicineViewSet, DoctorViewSet, AppointmentViewSet, RecentSalesViewSet,
    register, login, logout, send_otp, verify_otp, create_appointment,
    customer_send_otp, customer_verify_otp, customer_logout, customer_appointments
)

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'sales-feed', RecentSalesViewSet)

urlpatterns = [
    # Authentication endpoints
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('logout/', logout, name='logout'),
    # Customer authentication endpoints
    path('customer/send-otp/', customer_send_otp, name='customer_send_otp'),
    path('customer/verify-otp/', customer_verify_otp, name='customer_verify_otp'),
    path('customer/logout/', customer_logout, name='customer_logout'),
    path('customer/appointments/', customer_appointments, name='customer_appointments'),
    # OTP endpoints
    path('send-otp/', send_otp, name='send_otp'),
    path('verify-otp/', verify_otp, name='verify_otp'),
    path('create-appointment/', create_appointment, name='create_appointment'),
    # This includes all the routes registered above
    path('', include(router.urls)),
]