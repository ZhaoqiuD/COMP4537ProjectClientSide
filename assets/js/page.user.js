import PageBase from './page.base.js';
import AuthApi from './authApi.js';

class UserPage extends PageBase {
  constructor() {
    super('user-root');
    this.api = new AuthApi();
  }

  init() {
    if (!this.root) return;
    this.root.innerHTML = `
      <section>
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h4 mb-0">Welcome</h1>
        </div>
        <div class="row mt-3 g-3">
          <div class="col-12 col-lg-8">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">Your API Usage</h2>
                <div id="user-usage" class="usage-box mt-2">
                  <em class="text-muted">API usage will appear here.</em>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">Quick Links</h2>
                <p class="mb-2"><a href="#" class="link-secondary">Upload an image (coming soon)</a></p>
                <p class="mb-0 text-muted">Your teammate can wire ML here.</p>
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
  const page = new UserPage();
  page.init();
});

export default UserPage;
// moved to client/
