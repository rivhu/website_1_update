from django.shortcuts import render, redirect
from django.db.models import Sum
from App.models import Medicine, Doctor, Appointment, SaleRecord
from datetime import datetime

def home(request):
    # Get top 5 medicines by sales quantity
    top_medicines = Medicine.objects.annotate(
        total_sold=Sum('salerecord__quantity_sold')
    ).order_by('-total_sold')[:5]
    
    # Get available doctors
    available_doctors = Doctor.objects.filter(is_available=True)
    
    context = {
        'medicines': Medicine.objects.all(),
        'top_medicines': top_medicines,
        'doctors': available_doctors,
    }
    return render(request, 'home.html', context)

def book_appointment(request):
    if request.method == 'POST':
        doctor_id = request.POST.get('doctor_id')
        customer_name = request.POST.get('customer_name')
        appointment_date = request.POST.get('appointment_date')
        
        doctor = Doctor.objects.get(id=doctor_id)
        appointment = Appointment(
            doctor=doctor,
            customer_name=customer_name,
            date=appointment_date
        )
        appointment.save()
        return redirect('home')
    
    doctors = Doctor.objects.filter(is_available=True)
    return render(request, 'book_appointment.html', {'doctors': doctors})

def admin_dashboard(request):
    """Admin dashboard for managing medicines, doctors, and appointments"""
    return render(request, 'admin_dashboard.html')