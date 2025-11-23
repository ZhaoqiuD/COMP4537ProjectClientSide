import AuthApi from './authApi.js';
import SessionStore from './session.js';
import { Messages } from './messages.js';

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
      this.setError(Messages.loginMissing);
      this.setBusy(false);
      return;
    }

    try {
      // 1️⃣ Capture login response 👇
      const data = await this.api.login(email, password);

      // 2️⃣ Store token properly 👇
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }

      // 3️⃣ GET USER ROLE
      const me = await this.api.me();
      SessionStore.setRole(me?.role || 'user');

      // 4️⃣ REDIRECT BASED ON ROLE
      window.location.href = me?.role === 'admin'
        ? 'admin.html'
        : 'user.html';

      } catch (err) {
        this.setError(err?.message || Messages.loginFailed);
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
  new LoginPage().init();
});

export default LoginPage;
