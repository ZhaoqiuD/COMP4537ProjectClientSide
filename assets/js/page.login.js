import AuthApi from './authApi.js';
import SessionStore from './session.js';

class LoginPage {
  constructor() {
    this.api = new AuthApi();
    this.form = document.getElementById('loginForm');
    this.errorEl = document.getElementById('error');
    this.btn = document.getElementById('btnLogin');
  }

  init() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this.onSubmit(e));
  }

  async onSubmit(e) {
    e.preventDefault();
    this.setError('');
    this.setBusy(true);

    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value ?? '';

    if (!email || !password) {
      this.setError('Please enter email and password.');
      this.setBusy(false);
      return;
    }

    try {
      await this.api.login(email, password);
      const me = await this.api.me();
      SessionStore.setRole(me?.role || 'user');
      window.location.href = me?.role === 'admin' ? 'admin.html' : 'user.html';
    } catch (err) {
      this.setError(err?.message || 'Login failed');
    }

    this.setBusy(false);
  }

  setError(msg) {
    if (!this.errorEl) return;
    this.errorEl.textContent = msg;
    this.errorEl.classList.toggle('d-none', !msg);
  }

  setBusy(busy) {
    if (this.btn) {
      this.btn.disabled = !!busy;
      this.btn.innerText = busy ? 'Signing in…' : 'Login';
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new LoginPage();
  page.init();
});

export default LoginPage;
