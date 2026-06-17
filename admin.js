function renderAdminPage() {
  const session = getSession();
  const auth = loadAuth();
  const currentUser = document.getElementById('adminCurrentUser');
  const summary = document.getElementById('adminSummary');
  const userList = document.getElementById('userList');

  if (!session || session.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  currentUser.innerHTML = `<strong>Signed in as:</strong> ${session.name} <span class="admin-role">(${session.role.toUpperCase()})</span>`;
  summary.innerHTML = `The admin dashboard allows secure role management for receptionists and administrators.`;

  if (!auth.users || auth.users.length === 0) {
    userList.innerHTML = '<p class="muted">No registered users found.</p>';
    return;
  }

  userList.innerHTML = auth.users
    .map(user => `
      <div class="user-card">
        <div>
          <div class="user-name">${user.name}</div>
          <div class="user-email">${user.email}</div>
        </div>
        <div class="user-role">${user.role ? user.role : 'receptionist'}</div>
      </div>
    `)
    .join('');
}

if (document.body.id === 'admin-dashboard') {
  document.addEventListener('DOMContentLoaded', renderAdminPage);
}
