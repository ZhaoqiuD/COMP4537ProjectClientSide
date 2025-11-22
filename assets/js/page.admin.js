import PageBase from './page.base.js';
import AuthApi from './authApi.js';
import config from './config.js';

class AdminPage extends PageBase {
  constructor() {
    super('admin-root');
    this.api = new AuthApi();
    // Use your actual server URL
    this.API_URL = config.API_URL || 'http://localhost:3000';
  }

  async init() {
    if (!this.root) return;
    
    // Render the dashboard structure
    this.renderDashboard();
    
    // Load and display the data
    await this.loadStatistics();
    
    // Mount logout button
    this.mountEvents();
  }

  renderDashboard() {
    this.root.innerHTML = `
      <section>
        <h1 class="h4 mb-4">Admin Dashboard</h1>
        
        <!-- Table 1: API Endpoint Statistics -->
        <div class="card mb-4">
          <div class="card-header bg-primary text-white">
            <h2 class="h5 mb-0">API Endpoint Statistics</h2>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody id="endpoint-stats">
                <tr>
                  <td colspan="3" class="text-center">Loading...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Table 2: User API Consumption -->
        <div class="card">
          <div class="card-header bg-success text-white">
            <h2 class="h5 mb-0">User API Consumption</h2>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Total Requests</th>
                </tr>
              </thead>
              <tbody id="user-stats">
                <tr>
                  <td colspan="3" class="text-center">Loading...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  async loadStatistics() {
    // Load endpoint statistics
    try {
      const endpointResponse = await fetch(`${this.API_URL}/api/admin/stats`, {
        method: 'GET',
        credentials: 'include'
      });

      if (endpointResponse.ok) {
        const data = await endpointResponse.json();
        this.displayEndpointStats(data.endpoints || []);
      } else {
        console.error('Failed to load endpoint stats');
        document.getElementById('endpoint-stats').innerHTML = 
          '<tr><td colspan="3" class="text-center text-danger">Failed to load statistics</td></tr>';
      }
    } catch (error) {
      console.error('Error loading endpoint stats:', error);
    }

    // Load user statistics
    try {
      const userResponse = await fetch(`${this.API_URL}/api/admin/users`, {
        method: 'GET',
        credentials: 'include'
      });

      if (userResponse.ok) {
        const data = await userResponse.json();
        this.displayUserStats(data.users || []);
      } else {
        console.error('Failed to load user stats');
        document.getElementById('user-stats').innerHTML = 
          '<tr><td colspan="3" class="text-center text-danger">Failed to load user statistics</td></tr>';
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }

  displayEndpointStats(endpoints) {
    const tbody = document.getElementById('endpoint-stats');
    
    if (endpoints.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No API calls recorded yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = endpoints.map(stat => `
      <tr>
        <td><span class="badge bg-primary">${stat.method}</span></td>
        <td><code>${stat.endpoint}</code></td>
        <td>${stat.requests}</td>
      </tr>
    `).join('');
  }

  displayUserStats(users) {
    const tbody = document.getElementById('user-stats');
    
    if (users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="text-center">No users registered yet</td></tr>';
      return;
    }
    
    tbody.innerHTML = users.map(user => `
      <tr>
        <td>${user.username || 'N/A'}</td>
        <td>${user.email}</td>
        <td>${user.totalRequests || 0}</td>
      </tr>
    `).join('');
  }

  mountEvents() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        try { 
          await this.api.logout(); 
        } catch (e) {
          console.error('Logout error:', e);
        }
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