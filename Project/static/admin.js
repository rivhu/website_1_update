// ========== Admin Dashboard JavaScript ==========

// State management
let currentEditData = null;
let currentEditEndpoint = null;
let currentDeleteId = null;
let currentDeleteEndpoint = null;
let authToken = localStorage.getItem('adminAuthToken');
let isAuthenticated = !!authToken;

// API Base URL
const API_BASE = '/api';

// ========== Authentication State Management ==========
function setAuthToken(token) {
    authToken = token;
    isAuthenticated = true;
    localStorage.setItem('adminAuthToken', token);
    updateAuthLink();
}

function clearAuthToken() {
    authToken = null;
    isAuthenticated = false;
    localStorage.removeItem('adminAuthToken');
    updateAuthLink();
}

function updateAuthLink() {
    const authLink = document.getElementById('authLink');
    const adminContent = document.getElementById('adminContent');
    const authRequiredNotice = document.getElementById('authRequiredNotice');
    
    if (isAuthenticated) {
        authLink.textContent = 'Logout';
        authLink.onclick = function(e) {
            e.preventDefault();
            performLogout();
        };
        // Show admin content
        if (adminContent) adminContent.style.display = 'block';
        if (authRequiredNotice) authRequiredNotice.style.display = 'none';
    } else {
        authLink.textContent = 'Login';
        authLink.onclick = function(e) {
            e.preventDefault();
            toggleAuthModal(e);
        };
        // Hide admin content
        if (adminContent) adminContent.style.display = 'none';
        if (authRequiredNotice) authRequiredNotice.style.display = 'block';
    }
}

function performLogout() {
    fetch(`${API_BASE}/logout/`, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${authToken}`,
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        clearAuthToken();
        showNotification('Logged out successfully', 'success');
        location.reload();
    })
    .catch(error => {
        console.error('Logout error:', error);
        clearAuthToken();
        location.reload();
    });
}

// ========== Authentication Modal Functions ==========
function toggleAuthModal(event) {
    event.preventDefault();
    if (document.getElementById('authModal').classList.contains('show')) {
        closeAuthModal();
    } else {
        document.getElementById('authModal').classList.add('show');
    }
}

function closeAuthModal() {
    document.getElementById('authModal').classList.remove('show');
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
}

function switchAuthTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.auth-tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active from all buttons
    const buttons = document.querySelectorAll('.auth-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}

function submitLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Login failed');
        }
        return response.json();
    })
    .then(data => {
        setAuthToken(data.token);
        closeAuthModal();
        showNotification('Logged in successfully!', 'success');
    })
    .catch(error => {
        console.error('Login error:', error);
        showNotification('Invalid username or password', 'error');
    });
}

function submitRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (password !== passwordConfirm) {
        showNotification('Passwords do not match', 'error');
        return;
    }

    fetch(`${API_BASE}/register/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed');
        }
        return response.json();
    })
    .then(data => {
        setAuthToken(data.token);
        closeAuthModal();
        showNotification('Account created and logged in successfully!', 'success');
    })
    .catch(error => {
        console.error('Registration error:', error);
        showNotification('Registration failed. Username may already exist.', 'error');
    });
}

// ========== Permission Check ==========
function checkEditDeletePermission() {
    if (!isAuthenticated) {
        showNotification('You must login to edit or delete items', 'error');
        document.getElementById('authModal').classList.add('show');
        return false;
    }
    return true;
}

// ========== Tab Switching ==========
function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');

    // Load data for the selected tab
    if (tabName === 'medicines') {
        loadAllMedicines();
    } else if (tabName === 'doctors') {
        loadAllDoctors();
    } else if (tabName === 'appointments') {
        loadAllAppointments();
    }
}

// ========== Notification ==========
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// ========== Medicines Functions ==========
function searchMedicines() {
    const searchTerm = document.getElementById('medicineSearch').value.trim();
    
    if (!searchTerm) {
        loadAllMedicines();
        return;
    }

    showLoading('medicinesResults');

    fetch(`${API_BASE}/medicines/?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            displayMedicines(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to search medicines', 'error');
            document.getElementById('medicinesResults').innerHTML = 
                '<div class="empty-state"><p>Error loading medicines</p></div>';
        });
}

function loadAllMedicines() {
    showLoading('medicinesResults');

    fetch(`${API_BASE}/medicines/`)
        .then(response => response.json())
        .then(data => {
            displayMedicines(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to load medicines', 'error');
            document.getElementById('medicinesResults').innerHTML = 
                '<div class="empty-state"><p>Error loading medicines</p></div>';
        });
}

function displayMedicines(medicines) {
    const container = document.getElementById('medicinesResults');

    if (medicines.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No medicines found</p></div>';
        return;
    }

    let html = '';
    medicines.forEach(medicine => {
        html += `
            <div class="result-card">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(medicine.name)}</h3>
                    <span class="card-id">ID: ${medicine.id}</span>
                </div>
                <div class="card-content">
                    <div class="field-group">
                        <div class="field-label">Description</div>
                        <div class="field-value">${escapeHtml(medicine.description)}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Price</div>
                        <div class="field-value">€${medicine.price}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Stock Quantity</div>
                        <div class="field-value">${medicine.stock_quantity}</div>
                    </div>
                    ${medicine.image ? `
                    <div class="field-group">
                        <div class="field-label">Image URL</div>
                        <div class="field-value">${escapeHtml(medicine.image)}</div>
                    </div>
                    ` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="openEditModal('medicines', ${medicine.id}, 'medicine')">Edit</button>
                    <button class="btn-delete" onclick="openDeleteModal(${medicine.id}, 'medicines')">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ========== Doctors Functions ==========
function searchDoctors() {
    const searchTerm = document.getElementById('doctorSearch').value.trim();

    if (!searchTerm) {
        loadAllDoctors();
        return;
    }

    showLoading('doctorsResults');

    fetch(`${API_BASE}/doctors/?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            displayDoctors(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to search doctors', 'error');
            document.getElementById('doctorsResults').innerHTML = 
                '<div class="empty-state"><p>Error loading doctors</p></div>';
        });
}

function loadAllDoctors() {
    showLoading('doctorsResults');

    fetch(`${API_BASE}/doctors/`)
        .then(response => response.json())
        .then(data => {
            displayDoctors(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to load doctors', 'error');
            document.getElementById('doctorsResults').innerHTML = 
                '<div class="empty-state"><p>Error loading doctors</p></div>';
        });
}

function displayDoctors(doctors) {
    const container = document.getElementById('doctorsResults');

    if (doctors.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No doctors found</p></div>';
        return;
    }

    let html = '';
    doctors.forEach(doctor => {
        html += `
            <div class="result-card">
                <div class="card-header">
                    <h3 class="card-title">Dr. ${escapeHtml(doctor.name)}</h3>
                    <span class="card-id">ID: ${doctor.id}</span>
                </div>
                <div class="card-content">
                    <div class="field-group">
                        <div class="field-label">Specialty</div>
                        <div class="field-value">${escapeHtml(doctor.specialty)}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Availability</div>
                        <div class="field-value">${doctor.is_available ? '✅ Available' : '❌ Not Available'}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="openEditModal('doctors', ${doctor.id}, 'doctor')">Edit</button>
                    <button class="btn-delete" onclick="openDeleteModal(${doctor.id}, 'doctors')">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ========== Appointments Functions ==========
function searchAppointments() {
    const searchTerm = document.getElementById('appointmentSearch').value.trim();

    if (!searchTerm) {
        loadAllAppointments();
        return;
    }

    showLoading('appointmentsResults');

    fetch(`${API_BASE}/appointments/`)
        .then(response => response.json())
        .then(data => {
            // Filter appointments by customer name on client side
            const filtered = data.filter(apt => 
                apt.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            displayAppointments(filtered);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to search appointments', 'error');
            document.getElementById('appointmentsResults').innerHTML = 
                '<div class="empty-state"><p>Error loading appointments</p></div>';
        });
}

function loadAllAppointments() {
    showLoading('appointmentsResults');

    fetch(`${API_BASE}/appointments/`)
        .then(response => response.json())
        .then(data => {
            displayAppointments(data);
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to load appointments', 'error');
            document.getElementById('appointmentsResults').innerHTML = 
                '<div class="empty-state"><p>Error loading appointments</p></div>';
        });
}

function displayAppointments(appointments) {
    const container = document.getElementById('appointmentsResults');

    if (appointments.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No appointments found</p></div>';
        return;
    }

    let html = '';
    appointments.forEach(appointment => {
        const appointmentDate = new Date(appointment.date).toLocaleString();
        html += `
            <div class="result-card">
                <div class="card-header">
                    <h3 class="card-title">${escapeHtml(appointment.customer_name)}</h3>
                    <span class="card-id">ID: ${appointment.id}</span>
                </div>
                <div class="card-content">
                    <div class="field-group">
                        <div class="field-label">Doctor ID</div>
                        <div class="field-value">${appointment.doctor}</div>
                    </div>
                    <div class="field-group">
                        <div class="field-label">Appointment Date & Time</div>
                        <div class="field-value">${appointmentDate}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="openEditModal('appointments', ${appointment.id}, 'appointment')">Edit</button>
                    <button class="btn-delete" onclick="openDeleteModal(${appointment.id}, 'appointments')">Delete</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ========== Edit Modal Functions ==========
function openEditModal(endpoint, id, type) {
    if (!checkEditDeletePermission()) {
        return;
    }
    
    currentEditEndpoint = endpoint;
    
    fetch(`${API_BASE}/${endpoint}/${id}/`)
        .then(response => response.json())
        .then(data => {
            currentEditData = { ...data };
            displayEditForm(data, type);
            document.getElementById('editModal').classList.add('show');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Failed to load item details', 'error');
        });
}

function displayEditForm(data, type) {
    const fieldsContainer = document.getElementById('editFormFields');
    let html = '';

    if (type === 'medicine') {
        html = `
            <div class="form-group">
                <label>Medicine Name</label>
                <input type="text" name="name" value="${escapeHtml(data.name)}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea name="description" required>${escapeHtml(data.description)}</textarea>
            </div>
            <div class="form-group">
                <label>Price</label>
                <input type="number" name="price" value="${data.price}" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Stock Quantity</label>
                <input type="number" name="stock_quantity" value="${data.stock_quantity}" required>
            </div>
            <div class="form-group">
                <label>Image URL</label>
                <input type="text" name="image" value="${escapeHtml(data.image || '')}">
            </div>
        `;
        document.getElementById('editModalTitle').textContent = `Edit Medicine - ${escapeHtml(data.name)}`;
    } else if (type === 'doctor') {
        html = `
            <div class="form-group">
                <label>Doctor Name</label>
                <input type="text" name="name" value="${escapeHtml(data.name)}" required>
            </div>
            <div class="form-group">
                <label>Specialty</label>
                <input type="text" name="specialty" value="${escapeHtml(data.specialty)}" required>
            </div>
            <div class="form-group">
                <label>Available</label>
                <select name="is_available" required>
                    <option value="true" ${data.is_available ? 'selected' : ''}>Yes</option>
                    <option value="false" ${!data.is_available ? 'selected' : ''}>No</option>
                </select>
            </div>
        `;
        document.getElementById('editModalTitle').textContent = `Edit Doctor - Dr. ${escapeHtml(data.name)}`;
    } else if (type === 'appointment') {
        html = `
            <div class="form-group">
                <label>Customer Name</label>
                <input type="text" name="customer_name" value="${escapeHtml(data.customer_name)}" required>
            </div>
            <div class="form-group">
                <label>Doctor ID</label>
                <input type="number" name="doctor" value="${data.doctor}" required>
            </div>
            <div class="form-group">
                <label>Appointment Date & Time</label>
                <input type="datetime-local" name="date" value="${data.date.replace('Z', '')}" required>
            </div>
        `;
        document.getElementById('editModalTitle').textContent = `Edit Appointment - ${escapeHtml(data.customer_name)}`;
    }

    fieldsContainer.innerHTML = html;
}

function submitEdit(event) {
    event.preventDefault();
    
    const formData = new FormData(document.getElementById('editForm'));
    const data = Object.fromEntries(formData);

    // Convert string booleans to actual booleans
    if (data.is_available) {
        data.is_available = data.is_available === 'true';
    }

    const id = currentEditData.id;

    fetch(`${API_BASE}/${currentEditEndpoint}/${id}/`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
            'Authorization': `Token ${authToken}`
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            throw new Error('Update failed');
        }
        return response.json();
    })
    .then(data => {
        showNotification('Item updated successfully!', 'success');
        closeEditModal();
        
        // Reload the current tab
        if (currentEditEndpoint === 'medicines') {
            loadAllMedicines();
        } else if (currentEditEndpoint === 'doctors') {
            loadAllDoctors();
        } else if (currentEditEndpoint === 'appointments') {
            loadAllAppointments();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to update item: ' + error.message, 'error');
    });
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    document.getElementById('editForm').reset();
    currentEditData = null;
    currentEditEndpoint = null;
}

// ========== Delete Modal Functions ==========
function openDeleteModal(id, endpoint) {
    if (!checkEditDeletePermission()) {
        return;
    }
    
    currentDeleteId = id;
    currentDeleteEndpoint = endpoint;
    document.getElementById('deleteModal').classList.add('show');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('show');
    currentDeleteId = null;
    currentDeleteEndpoint = null;
}

function confirmDelete() {
    if (!currentDeleteId || !currentDeleteEndpoint) return;

    fetch(`${API_BASE}/${currentDeleteEndpoint}/${currentDeleteId}/`, {
        method: 'DELETE',
        headers: {
            'X-CSRFToken': getCookie('csrftoken'),
            'Authorization': `Token ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Unauthorized. Please login again.');
            }
            throw new Error('Delete failed');
        }
        showNotification('Item deleted successfully!', 'success');
        closeDeleteModal();
        
        // Reload the current tab
        if (currentDeleteEndpoint === 'medicines') {
            loadAllMedicines();
        } else if (currentDeleteEndpoint === 'doctors') {
            loadAllDoctors();
        } else if (currentDeleteEndpoint === 'appointments') {
            loadAllAppointments();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to delete item: ' + error.message, 'error');
    });
}

// ========== Utility Functions ==========
function showLoading(containerId) {
    document.getElementById(containerId).innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// ========== Close modal when clicking outside ==========
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    const authModal = document.getElementById('authModal');
    
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
    if (event.target === authModal) {
        closeAuthModal();
    }
}

// ========== Load on page load ==========
window.addEventListener('load', function() {
    updateAuthLink();
    
    // Only load data if authenticated
    if (isAuthenticated) {
        loadAllMedicines();
    }
});
