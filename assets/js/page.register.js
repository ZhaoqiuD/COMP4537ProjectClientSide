import AuthApi from './authApi.js';

class RegisterPage {
  constructor() {
    this.api = new AuthApi();
    this.form = document.getElementById('registerForm');
    this.errorEl = document.getElementById('error');
    this.btn = document.getElementById('btnRegister');
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.onSubmit(e));
  }

  async onSubmit(e) {
    e.preventDefault();
    this.setError('');
    this.setBusy(true);
    const firstInput = document.getElementById('firstName');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const firstName = firstInput?.value?.trim();
    const email = emailInput?.value?.trim();
    const password = passInput?.value ?? '';
    if (!firstName || !email || !password) {
      this.setError('Please enter first name, email and password.');
      this.setBusy(false);
      return;
    }
    try {
      await this.api.register(firstName, email, password);
      // After successful registration, go to login
      window.location.href = 'login.html';
    } catch (err) {
      this.setError(err?.message || 'Registration failed');
    }
    this.setBusy(false);
  }

  setError(msg) {
    if (!this.errorEl) return;
    if (!msg) {
      this.errorEl.classList.add('d-none');
      this.errorEl.textContent = '';
      return;
    }
    this.errorEl.textContent = msg;
    this.errorEl.classList.remove('d-none');
  }

  setBusy(busy) {
    if (!this.btn) return;
    this.btn.disabled = !!busy;
    this.btn.innerText = busy ? 'Creating…' : 'Create Account';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new RegisterPage();
  page.init();
});

export default RegisterPage;
// moved to client/
