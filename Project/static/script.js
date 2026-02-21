
// ========== Modal Functions ==========
function openAppointmentModal(doctorId, doctorName) {
    const modal = document.getElementById('appointmentModal');
    const doctorIdInput = document.getElementById('doctorId');
    const doctorNameInput = document.getElementById('doctorName');
    
    doctorIdInput.value = doctorId;
    doctorNameInput.value = doctorName;
    
    modal.classList.add('show');
}

function closeAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    modal.classList.remove('show');
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('appointmentModal');
    if (event.target === modal) {
        closeAppointmentModal();
    }
}

// ========== Cart Functions ==========
function addToCart(medicineName, price) {
    //showNotification(`${medicineName} added to cart - ₹${price.toFixed(2)}`);
    showNotification(` We are not receiving orders for ${medicineName} right now. Please call us at +91 9230130888 to place your order. Thank you!`);
    
    // You can expand this to store items in localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push({
        name: medicineName,
        price: price,
        timestamp: new Date().getTime()
    });
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showNotification(message) {
    const notification = document.getElementById('cartNotification');
    const text = document.getElementById('notificationText');
    
    text.textContent = message;
    notification.classList.add('show');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========== Form Validation ==========
document.addEventListener('DOMContentLoaded', function() {
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            const customerName = document.getElementById('customerName').value.trim();
            const appointmentDate = document.getElementById('appointmentDate').value;
            
            if (!customerName) {
                e.preventDefault();
                alert('Please enter your name');
                return false;
            }
            
            if (!appointmentDate) {
                e.preventDefault();
                alert('Please select an appointment date and time');
                return false;
            }
            
            // Optionally show success notification
            showNotification('Appointment booked successfully!');
        });
    }
});

// ========== Smooth Scrolling for Navigation Links ==========
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// ========== Set Minimum Date for Appointment ==========
document.addEventListener('DOMContentLoaded', function() {
    const appointmentInput = document.getElementById('appointmentDate');
    if (appointmentInput) {
        // Set minimum date to today + 1 hour
        const now = new Date();
        now.setHours(now.getHours() + 1);
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        appointmentInput.min = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
});

async function submitAppointment(payload) {
    const res = await fetch(`${API_BASE}appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if(res.ok) alert("Appointment Booked Successfully!");
}

// Initialization
searchMedicine();
loadDoctors();
setInterval(updateSalesFeed, 5000); // Live updates