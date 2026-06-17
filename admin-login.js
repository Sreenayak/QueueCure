function initAdminLogin() {
  const adminLoginSubmit = document.getElementById('adminLoginSubmit');
  const messageEl = document.getElementById('adminAuthMessage');
  const emailInput = document.getElementById('adminLoginEmail');
  const passwordInput = document.getElementById('adminLoginPassword');

  if (adminLoginSubmit) {
    adminLoginSubmit.addEventListener('click', () => {
      const error = loginUser(emailInput.value, passwordInput.value);
      if (error) {
        messageEl.textContent = error;
        messageEl.className = 'form-message error';
      } else {
        const session = getSession();
        if (session && session.role === 'admin') {
          messageEl.textContent = 'Admin login successful. Redirecting...';
          messageEl.className = 'form-message success';
          setTimeout(() => {
            window.location.href = 'admin.html';
          }, 900);
        } else {
          messageEl.textContent = 'Only admin users can access this page.';
          messageEl.className = 'form-message error';
          localStorage.removeItem('queueCureSession');
        }
      }
    });

    passwordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        adminLoginSubmit.click();
      }
    });
  }
}

if (document.body.id === 'admin-login') {
  document.addEventListener('DOMContentLoaded', initAdminLogin);
}
