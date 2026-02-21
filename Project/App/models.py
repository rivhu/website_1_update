from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid

# Create your models here.


class UserProfile(models.Model):
    """
    Enhanced user profile to store OTP and phone verification details.
    Based on tutorial approach for better OTP management.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=20, unique=True)
    otp = models.CharField(max_length=10, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    uid = models.UUIDField(unique=True, default=uuid.uuid4)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} ({self.phone_number})"

    class Meta:
        verbose_name = "User Profile"
        verbose_name_plural = "User Profiles"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """Signal to create UserProfile when User is created"""
    if created:
        UserProfile.objects.get_or_create(user=instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Signal to save UserProfile when User is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


class Medicine(models.Model):
    name = models.CharField(max_length=200)
    image = models.ImageField(upload_to='medicines/')
    description = models.TextField()
    stock_quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Doctor(models.Model):
    name = models.CharField(max_length=100)
    specialty = models.CharField(max_length=100)
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"Dr. {self.name} ({self.specialty})"

class OTP(models.Model):
    phone_number = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=6)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"OTP for {self.phone_number}"

class Appointment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    customer_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    date = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)

class SaleRecord(models.Model):
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    quantity_sold = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp'] # Latest sales first

class Customer(models.Model):
    phone_number = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.name} ({self.phone_number})"