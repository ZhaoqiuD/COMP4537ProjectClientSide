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
<<<<<<< HEAD

    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value ?? '';

=======
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const email = emailInput?.value?.trim();
    const password = passInput?.value ?? '';
>>>>>>> 6b6718be37d294293ae5a03b0cad3ecd5b4e8a2d
    if (!email || !password) {
      this.setError('Please enter email and password.');
      this.setBusy(false);
      return;
    }
<<<<<<< HEAD

    try {
      // login request
      const loginRes = await this.api.login(email, password);

      // 🔥🔥 SAVE TOKEN — REQUIRED!
      localStorage.setItem("token", loginRes.token);

      // fetch user info
      const me = await this.api.me();
      SessionStore.setRole(me?.role || 'user');

      // redirect based on role
      if (me.role === 'admin') {
=======
    try {
      await this.api.login(email, password);
      const me = await this.api.me();
      SessionStore.setRole(me?.role || 'user');
      if (me && me.role === 'admin') {
>>>>>>> 6b6718be37d294293ae5a03b0cad3ecd5b4e8a2d
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'user.html';
      }
    } catch (err) {
      this.setError(err?.message || 'Login failed');
    }
<<<<<<< HEAD

=======
>>>>>>> 6b6718be37d294293ae5a03b0cad3ecd5b4e8a2d
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
<<<<<<< HEAD
    if (this.btn) {
      this.btn.disabled = !!busy;
      this.btn.innerText = busy ? 'Signing in…' : 'Login';
    }
=======
    if (!this.btn) return;
    this.btn.disabled = !!busy;
    this.btn.innerText = busy ? 'Signing in…' : 'Login';
>>>>>>> 6b6718be37d294293ae5a03b0cad3ecd5b4e8a2d
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = new LoginPage();
  page.init();
});

export default LoginPage;
<<<<<<< HEAD
=======
// moved to client/
>>>>>>> 6b6718be37d294293ae5a03b0cad3ecd5b4e8a2d
