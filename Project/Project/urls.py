"""
URL configuration for Project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""



"""from django.contrib import admin
from django.urls import path

urlpatterns = [
    path('admin/', admin.site.urls),
]"""




from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from App.views import *
from . import views

router = DefaultRouter()
router.register(r'medicines', MedicineViewSet)
router.register(r'doctors', DoctorViewSet)
router.register(r'appointments', AppointmentViewSet)
router.register(r'sales-feed', RecentSalesViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/send-otp/', send_otp, name='send_otp'),
    path('api/verify-otp/', verify_otp, name='verify_otp'),
    path('api/create-appointment/', create_appointment, name='create_appointment'),
    path('', views.home, name='home'),
    path('book-appointment/', views.book_appointment, name='book_appointment'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)