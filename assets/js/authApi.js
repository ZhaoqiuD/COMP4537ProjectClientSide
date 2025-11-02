import { Config } from './config.js';
import SessionStore from './session.js';

class AuthApi {
  constructor(baseUrl = Config.apiBaseUrl) {
    this.baseUrl = baseUrl;
  }

  async #fetchJson(path, options = {}) {
    const headers = options.headers ? { ...options.headers } : {};
    const token = SessionStore.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
      const res = await fetch(`${this.baseUrl}${path}`, { ...options, headers });
      return this.#handle(res);
    } catch (err) {
      throw new Error(`Network error. Cannot reach API at ${this.baseUrl}. Is the server running and CORS configured?`);
    }
  }

  async register(email, password) {
    return this.#fetchJson('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
  }

  async login(email, password) {
    const data = await this.#fetchJson('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    if (data && data.token) {
      SessionStore.setToken(data.token);
    }
    return data;
  }

  async me() {
    return this.#fetchJson('/auth/me', {
      method: 'GET',
      credentials: 'include'
    });
  }

  async logout() {
    const res = await this.#fetchJson('/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    SessionStore.clear();
    return res;
  }

  async #handle(res) {
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const data = await res.json();
        if (data && data.error) message = data.error;
      } catch {}
      throw new Error(message);
    }
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return res.json();
    return null;
  }
}

export default AuthApi;
// moved to client/
