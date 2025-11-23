import PageBase from './page.base.js';
import AuthApi from './authApi.js';
import { Config } from './config.js';  // FIX 1: Import Config with capital C

class AdminPage extends PageBase {
  constructor() {
    super('admin-root');
    console.log('AdminPage constructor called');
    this.api = new AuthApi();
    // FIX 2: Use Config.apiBaseUrl
    this.API_URL = Config.apiBaseUrl || 'http://localhost:3000';
    console.log('API URL:', this.API_URL);
  }

  async init() {
    console.log('AdminPage init called');
    console.log('Root element:', this.root);
    
    if (!this.root) {
      console.error('No root element found! Looking for element with id="admin-root"');
      return;
    }
    
    try {
      // Render the dashboard structure FIRST
      console.log('Rendering dashboard...');
      this.renderDashboard();
      
      // Then load statistics
      console.log('Loading statistics...');
      await this.loadStatistics();
      
      // Mount events
      this.mountEvents();
    } catch (error) {
      console.error('Error in init:', error);
      // Even if there's an error, at least show something
      this.root.innerHTML = `
        <div class="alert alert-danger">
          Error loading admin dashboard: ${error.message}
        </div>
      `;
    }
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
          <th>Token</th>
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
      console.log('Fetching endpoint stats from:', `${this.API_URL}/api/admin/stats`);
      const endpointResponse = await fetch(`${this.API_URL}/api/admin/stats`, {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('Endpoint stats response:', endpointResponse.status);

      if (endpointResponse.ok) {
        const data = await endpointResponse.json();
        console.log('Endpoint stats data:', data);
        this.displayEndpointStats(data.endpoints || []);
      } else {
        console.error('Failed to load endpoint stats:', endpointResponse.status);
        document.getElementById('endpoint-stats').innerHTML = 
          '<tr><td colspan="3" class="text-center text-danger">Failed to load statistics (HTTP ' + endpointResponse.status + ')</td></tr>';
      }
    } catch (error) {
      console.error('Error loading endpoint stats:', error);
      document.getElementById('endpoint-stats').innerHTML = 
        '<tr><td colspan="3" class="text-center text-danger">Error: ' + error.message + '</td></tr>';
    }

    // Load user statistics
    try {
      console.log('Fetching user stats from:', `${this.API_URL}/api/admin/users`);
      const userResponse = await fetch(`${this.API_URL}/api/admin/users`, {
        method: 'GET',
        credentials: 'include'
      });
      
      console.log('User stats response:', userResponse.status);

      if (userResponse.ok) {
        const data = await userResponse.json();
        console.log('User stats data:', data);
        this.displayUserStats(data.users || []);
      } else {
        console.error('Failed to load user stats:', userResponse.status);
        document.getElementById('user-stats').innerHTML = 
          '<tr><td colspan="3" class="text-center text-danger">Failed to load user statistics (HTTP ' + userResponse.status + ')</td></tr>';
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
      document.getElementById('user-stats').innerHTML = 
        '<tr><td colspan="3" class="text-center text-danger">Error: ' + error.message + '</td></tr>';
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
        <td>${user.firstName || 'N/A'}</td>
        <td>${user.email}</td>
        <td>${user.token || 'N/A'}</td>
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

// Bootstrap page - FIX 3: Make sure init() is actually called
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired for admin page');
  const page = new AdminPage();
  page.init();  // Make sure we call init()!
});

export default AdminPage;
