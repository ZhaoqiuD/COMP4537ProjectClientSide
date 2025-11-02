class SessionStore {
  static setToken(token) {
    if (!token) return;
    sessionStorage.setItem('token', token);
  }

  static getToken() {
    return sessionStorage.getItem('token');
  }

  static setRole(role) {
    if (!role) return;
    sessionStorage.setItem('role', role);
  }

  static getRole() {
    return sessionStorage.getItem('role');
  }

  static clear() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('role');
  }
}

export default SessionStore;
// moved to client/
