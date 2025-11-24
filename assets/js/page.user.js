import PageBase from './page.base.js';
import AuthApi from './authApi.js';
import SessionStore from './session.js';
import { Config } from './config.js';

class UserPage extends PageBase {
  constructor() {
    super('user-root');
    this.api = new AuthApi();
    this.selectedFile = null;
    this.profile = null;
    this.isOverLimit = false;
  }

  init() {
    if (!this.root) return;
    this.render();
    this.setupClassifier();
    this.loadUsage();
    this.loadClassifications();
    this.mountEvents();
  }

  render() {
    this.root.innerHTML = `
      <section>
        <div class="row g-4">
          <div class="col-12 col-lg-4">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h2 class="h5 mb-3">Your API Usage</h2>
                <div id="user-usage" class="usage-box">
                  <em class="text-muted">Loading API usage...</em>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-8">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h2 class="h5 mb-3">AI Garbage Classifier</h2>
                <div id="dropZone" class="drop-zone">
                  <p class="mb-0">
                    Drag & drop an image here, or click to select
                  </p>
                  <input type="file" id="fileInput" accept="image/*" hidden />
                  <img id="preview" class="preview-img d-none" />
                </div>
                <div class="text-center mt-3">
                  <button id="classifyBtn" class="btn btn-primary btn-lg px-4" disabled>
                    Classify Image
                  </button>
                </div>
                <div id="resultBox" class="text-center mt-4 d-none">
                  <h5>Prediction Result</h5>
                  <p id="resultText" class="fw-bold fs-5 text-success"></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-4 mt-1">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h5 mb-3">Your Classifications</h2>
                <div class="table-responsive">
                  <table class="table table-sm" id="classifications-table">
                    <thead>
                      <tr><th>ID</th><th>Result</th><th>Status</th><th class="text-end">Actions</th></tr>
                    </thead>
                    <tbody id="classifications-body">
                      <tr><td colspan="4" class="text-center text-muted">Loading...</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  async loadUsage() {
    const usageBox = document.getElementById('user-usage');
    try {
      const data = await this.api.me();
      this.profile = data;
      if (data && data.usage) {
        const { used, limit } = data.usage;
        this.isOverLimit = used >= limit;
        const pct = Math.round((used / limit) * 100);
        usageBox.innerHTML = `
          <div class="mb-2"><strong>User:</strong> ${data.firstName || 'N/A'} (${data.email})</div>
          <div class="usage-header">
            <div class="usage-text">API Calls: ${used} / ${limit}</div>
            <div class="usage-badges">
              <span class="usage-badge ${this.isOverLimit ? 'warning' : 'success'}">${pct}%</span>
              ${this.isOverLimit ? '<span class="usage-badge danger">⚠</span>' : ''}
            </div>
          </div>
          <div class="usage-progress-bar">
            <div class="usage-progress-fill ${this.isOverLimit ? 'warning' : 'success'}" style="width:${Math.min(pct,100)}%"></div>
          </div>
          ${data.warning ? `<div class="usage-alert">${data.warning}</div>` : ''}
        `;
      } else {
        usageBox.innerHTML = '<em class="text-muted">Usage data unavailable</em>';
      }
      this.updateClassifyButton();
    } catch (err) {
      console.error('Failed to load usage:', err);
      usageBox.innerHTML = '<em class="text-danger">Failed to load usage data</em>';
    }
  }

  updateClassifyButton() {
    const btn = document.getElementById('classifyBtn');
    if (!btn) return;
    if (!this.selectedFile) {
      btn.disabled = true;
      btn.classList.remove('btn-warning');
      btn.classList.add('btn-primary');
      btn.textContent = 'Classify Image';
      return;
    }
    btn.disabled = false;
    if (this.isOverLimit) {
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-warning');
      btn.textContent = 'Classify Image (over quota)';
    } else {
      btn.classList.remove('btn-warning');
      btn.classList.add('btn-primary');
      btn.textContent = 'Classify Image';
    }
  }

  setupClassifier() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const classifyBtn = document.getElementById('classifyBtn');
    const resultText = document.getElementById('resultText');
    const resultBox = document.getElementById('resultBox');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.handleFile(e.target.files[0]));
    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      this.handleFile(e.dataTransfer.files[0]);
    });

    classifyBtn.addEventListener('click', async () => {
      if (!this.selectedFile) return;
      classifyBtn.disabled = true;
      classifyBtn.textContent = 'Classifying...';

      const token = SessionStore.getToken() || localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', this.selectedFile);

      try {
        const response = await fetch(`${Config.apiBaseUrl}/api/ml/classify`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        const raw = await response.text();
        let data;
        try { data = JSON.parse(raw); } catch { data = null; }

        if (!response.ok) {
          const msg = data?.error || raw || `HTTP ${response.status}`;
          throw new Error(msg);
        }

        await this.loadUsage();

        // Normalize predictions from various shapes/strings
        let preds = data?.model_output ?? data?.predictions ?? null;
        if (typeof preds === 'string') {
          // HF Space sometimes returns single-quoted JSON
          const cleaned = preds.replace(/'/g, '"');
          try { preds = JSON.parse(cleaned); } catch { preds = cleaned; }
        }

        let label = null;
        let confidence = null;

        if (Array.isArray(preds)) {
          const first = preds[0];
          if (first?.label) {
            label = first.label;
            confidence = Number(first.confidence) || 0;
          } else if (first && typeof first === 'object') {
            const entry = Object.entries(first)[0] || [];
            label = entry[0] || null;
            confidence = Number(entry[1]) || 0;
          } else if (typeof first === 'string') {
            label = first;
            confidence = 0;
          }
        } else if (preds && typeof preds === 'object') {
          const entry = Object.entries(preds)[0] || [];
          label = entry[0] || null;
          confidence = Number(entry[1]) || 0;
        } else if (typeof preds === 'string') {
          // string fallback like "[{'label': 'paper', 'confidence': 0.9}]"
          const matchLabel = preds.match(/label['"]?:\s*['"]([^'"]+)['"]/i);
          const matchConf = preds.match(/confidence['"]?:\s*([0-9.]+)/i);
          label = matchLabel ? matchLabel[1] : null;
          confidence = matchConf ? Number(matchConf[1]) : 0;
        }

        if (label) {
          resultText.textContent = `${label} (${(confidence * 100).toFixed(1)}%)`;
          resultText.classList.remove('text-danger');
          resultText.classList.add('text-success');
        } else if (data?.classification_id) {
          resultText.textContent = 'Classification saved.';
          resultText.classList.remove('text-danger');
          resultText.classList.add('text-success');
        } else {
          resultText.textContent = raw || 'Unknown response.';
          resultText.classList.add('text-danger');
        }
        resultBox.classList.remove('d-none');
      } catch (err) {
        resultText.textContent = `Server error: ${err.message}`;
        resultText.classList.add('text-danger');
        resultBox.classList.remove('d-none');
      } finally {
        classifyBtn.disabled = false;
        this.updateClassifyButton();
      }
    });
  }

  async loadClassifications() {
    const body = document.getElementById('classifications-body');
    if (!body) return;
    body.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Loading...</td></tr>';
    try {
      const rows = await this.api.listClassifications();
      if (!rows || rows.length === 0) {
        body.innerHTML = '<tr><td colspan="4" class="text-center">No classifications yet.</td></tr>';
        return;
      }
      body.innerHTML = rows.map((r) => `
        <tr>
          <td>${r.id}</td>
          <td>${r.result_json ? JSON.stringify(r.result_json) : 'N/A'}</td>
          <td>${r.status}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-2" data-id="${r.id}" data-action="mark-reviewed">Mark Reviewed</button>
            <button class="btn btn-sm btn-outline-danger" data-id="${r.id}" data-action="delete">Delete</button>
          </td>
        </tr>
      `).join('');
    } catch (err) {
      console.error('Failed to load classifications:', err);
      body.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Failed to load classifications</td></tr>';
    }
  }

  mountClassificationsEvents() {
    const table = document.getElementById('classifications-table');
    if (table) {
      table.addEventListener('click', async (e) => {
        const btn = e.target.closest('button[data-id]');
        if (!btn) return;
        const id = btn.getAttribute('data-id');
        const action = btn.getAttribute('data-action');
        try {
          if (action === 'delete') {
            await this.api.deleteClassification(id);
          } else if (action === 'mark-reviewed') {
            await this.api.updateClassification(id, { status: 'reviewed' });
          }
          await this.loadClassifications();
        } catch (err) {
          console.error('Update/delete failed:', err);
        }
      });
    }
  }

  handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    this.selectedFile = new File([file], file.name, { type: file.type });
    const preview = document.getElementById('preview');
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.classList.remove('d-none');
    };
    reader.readAsDataURL(file);
    this.updateClassifyButton();
  }

  mountEvents() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        try { await this.api.logout(); } catch {}
        window.location.href = 'login.html';
      });
    }
    this.mountClassificationsEvents();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new UserPage().init();
});

export default UserPage;
