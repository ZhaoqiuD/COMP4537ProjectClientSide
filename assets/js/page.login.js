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
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const email = emailInput?.value?.trim();
    const password = passInput?.value ?? '';
    if (!email || !password) {
      this.setError('Please enter email and password.');
      this.setBusy(false);
      return;
    }
    try {
      await this.api.login(email, password);
      const me = await this.api.me();
      SessionStore.setRole(me?.role || 'user');
      if (me && me.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'user.html';
      }
    } catch (err) {
      this.setError(err?.message || 'Login failed');
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
    this.btn.innerText = busy ? 'Signing in…' : 'Login';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new LoginPage();
  page.init();
});

export default LoginPage;
// moved to client/
