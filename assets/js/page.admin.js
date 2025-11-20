import PageBase from './page.base.js';
import AuthApi from './authApi.js';

class AdminPage extends PageBase {
  constructor() {
    super('admin-root');
    this.api = new AuthApi();
  }

  init() {
    if (!this.root) return;
    this.root.innerHTML = `
      <section>
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h4 mb-0">Admin Dashboard</h1>
        </div>
        <div class="row mt-3 g-3">
          <div class="col-12 col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">Usage Overview</h2>
                <div id="admin-usage" class="usage-box mt-2">
                  <em class="text-muted">Usage metrics will appear here.</em>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">Users</h2>
                <p class="text-muted mb-0">TODO: Your teammate can list users here.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.mountEvents();
  }

  mountEvents() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        try { await this.api.logout(); } catch {}
        window.location.href = 'login.html';
      });
    }
  }
}

// Bootstrap page
document.addEventListener('DOMContentLoaded', () => {
  const page = new AdminPage();
  page.init();
});

export default AdminPage;
// moved to client/
