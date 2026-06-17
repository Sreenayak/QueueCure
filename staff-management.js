function renderStaffList() {
  const staffData = loadStaff();
  const staffListEl = document.getElementById('staffList');
  
  if (staffData.staff.length === 0) {
    staffListEl.innerHTML = '<p class="muted">No staff members added yet.</p>';
    return;
  }
  
  staffListEl.innerHTML = staffData.staff
    .map(staff => `
      <div class="staff-card">
        <div class="staff-header">
          <div class="staff-name">${staff.name}</div>
          <button class="remove-btn" data-staff-id="${staff.id}" title="Remove staff">×</button>
        </div>
        <div class="staff-info">
          <div><strong>Role:</strong> ${staff.role}</div>
          <div><strong>Department:</strong> ${staff.department}</div>
          <div><strong>Phone:</strong> ${staff.phone}</div>
          <div><strong>Joined:</strong> ${new Date(staff.joinDate).toLocaleDateString()}</div>
        </div>
      </div>
    `)
    .join('');
  
  // Add event listeners for remove buttons
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const staffId = parseInt(e.target.dataset.staffId);
      if (confirm('Are you sure you want to remove this staff member?')) {
        removeStaffMember(staffId);
        renderStaffList();
      }
    });
  });
}

function initStaffManagement() {
  const addStaffBtn = document.getElementById('addStaffBtn');
  const staffNameInput = document.getElementById('staffName');
  const staffRoleSelect = document.getElementById('staffRole');
  const staffDeptSelect = document.getElementById('staffDept');
  const staffPhoneInput = document.getElementById('staffPhone');
  const staffMessage = document.getElementById('staffMessage');
  
  addStaffBtn.addEventListener('click', () => {
    const name = staffNameInput.value.trim();
    const role = staffRoleSelect.value.trim();
    const dept = staffDeptSelect.value.trim();
    const phone = staffPhoneInput.value.trim();
    
    if (!name || !role || !dept || !phone) {
      staffMessage.textContent = 'Please fill in all fields.';
      staffMessage.className = 'form-message error';
      return;
    }
    
    addStaffMember(name, role, dept, phone);
    
    staffNameInput.value = '';
    staffRoleSelect.value = '';
    staffDeptSelect.value = '';
    staffPhoneInput.value = '';
    
    staffMessage.textContent = `${name} added successfully!`;
    staffMessage.className = 'form-message success';
    
    setTimeout(() => {
      staffMessage.textContent = '';
      staffMessage.className = 'form-message muted';
    }, 3000);
    
    renderStaffList();
  });
  
  renderStaffList();
}

if (document.body.id === 'staff-management') {
  document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();
    if (!session || session.role !== 'admin') {
      window.location.href = 'index.html';
      return;
    }
    initStaffManagement();
  });
}
