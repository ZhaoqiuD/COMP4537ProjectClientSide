import PageBase from './page.base.js';
import AuthApi from './authApi.js';

class UserPage extends PageBase {
  constructor() {
    super('user-root');
    this.api = new AuthApi();
    this.selectedFile = null;
    this.isOverLimit = false;
  }

  init() {
    if (!this.root) return;

    this.root.innerHTML = `
      <section>
        <div class="row g-4">
          <!-- LEFT CARD -->
          <div class="col-12 col-lg-5">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h2 class="h5 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-graph-up" viewBox="0 0 16 16" style="margin-bottom: 3px;">
                    <path fill-rule="evenodd" d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z"/>
                  </svg>
                  Your API Usage
                </h2>
                <div id="user-usage" class="usage-box">
                  <em class="text-muted">Loading API usage...</em>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT CARD -->
          <div class="col-12 col-lg-7">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <h2 class="h5 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-cpu" viewBox="0 0 16 16" style="margin-bottom: 3px;">
                    <path d="M5 0a.5.5 0 0 1 .5.5V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2h1V.5a.5.5 0 0 1 1 0V2A2.5 2.5 0 0 1 14 4.5h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14v1h1.5a.5.5 0 0 1 0 1H14a2.5 2.5 0 0 1-2.5 2.5v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14h-1v1.5a.5.5 0 0 1-1 0V14A2.5 2.5 0 0 1 2 11.5H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2v-1H.5a.5.5 0 0 1 0-1H2A2.5 2.5 0 0 1 4.5 2V.5A.5.5 0 0 1 5 0zm-.5 3A1.5 1.5 0 0 0 3 4.5v7A1.5 1.5 0 0 0 4.5 13h7a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 11.5 3h-7zM5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3zM6.5 6a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                  </svg>
                  AI Garbage Classifier
                </h2>

                <div id="dropZone" class="drop-zone">
                  <p class="mb-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-cloud-arrow-up mb-2" viewBox="0 0 16 16">
                      <path fill-rule="evenodd" d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2z"/>
                      <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
                    </svg>
                    <br />
                    Drag & drop an image here, or click to select
                  </p>
                  <input type="file" id="fileInput" accept="image/*" hidden />
                  <img id="preview" class="preview-img d-none" />
                </div>

                <div class="text-center mt-3">
                  <button id="classifyBtn" class="btn btn-primary btn-lg px-4" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16" style="margin-bottom: 2px;">
                      <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
                    </svg>
                    Classify Image
                  </button>
                </div>

                <div id="resultBox" class="text-center mt-4 d-none">
                  <h5>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-check-circle-fill" viewBox="0 0 16 16" style="margin-bottom: 2px;">
                      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                    </svg>
                    Prediction Result
                  </h5>
                  <p id="resultText" class="fw-bold fs-5 text-success"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.setupClassifier();
    this.loadUsage();
    this.mountEvents();
  }

  async loadUsage() {
    const usageBox = document.getElementById('user-usage');
    try {
      const data = await this.api.me();
      if (data && data.usage) {
        const { used, limit } = data.usage;
        const percentage = Math.round((used / limit) * 100);
        const isOverLimit = used >= limit;
        
        // Store the limit state
        this.isOverLimit = isOverLimit;
        
        usageBox.innerHTML = `
          <div class="usage-header">
            <div class="usage-text">API Calls: ${used} / ${limit}</div>
            <div class="usage-badges">
              <span class="usage-badge ${isOverLimit ? 'warning' : 'success'}">${percentage}%</span>
              ${isOverLimit ? '<span class="usage-badge danger">⚠</span>' : ''}
            </div>
          </div>
          <div class="usage-progress-bar">
            <div class="usage-progress-fill ${isOverLimit ? 'warning' : 'success'}" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          ${isOverLimit ? '<div class="usage-alert"><strong>⚠️ Quota Reached:</strong> Free API limit reached.</div>' : ''}
          ${data.warning ? `<div class="usage-alert">${data.warning}</div>` : ''}
        `;
        
        // Update button state
        this.updateClassifyButton();
      } else {
        usageBox.innerHTML = '<em class="text-muted">Usage data unavailable</em>';
      }
    } catch (err) {
      console.error('Failed to load usage:', err);
      usageBox.innerHTML = '<em class="text-danger">Failed to load usage data</em>';
    }
  }
  
  updateClassifyButton() {
    const classifyBtn = document.getElementById('classifyBtn');
    if (classifyBtn) {
      if (this.isOverLimit) {
        classifyBtn.disabled = true;
        classifyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle-fill" viewBox="0 0 16 16" style="margin-bottom: 2px;">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
          Quota Reached
        `;
      } else if (!this.selectedFile) {
        classifyBtn.disabled = true;
        classifyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16" style="margin-bottom: 2px;">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
          </svg>
          Classify Image
        `;
      } else {
        classifyBtn.disabled = false;
        classifyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-lightning-charge-fill" viewBox="0 0 16 16" style="margin-bottom: 2px;">
            <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
          </svg>
          Classify Image
        `;
      }
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

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      this.handleFile(e.dataTransfer.files[0]);
    });

    // CLASSIFY IMAGE
    classifyBtn.addEventListener('click', async () => {
      if (!this.selectedFile || this.isOverLimit) return;
      
      classifyBtn.disabled = true;
      classifyBtn.textContent = 'Classifying...';

      const token = localStorage.getItem("token");
      if (!token) {
        resultText.textContent = "⚠ Please log in again — token expired.";
        resultBox.classList.remove("d-none");
        this.updateClassifyButton();
        return;
      }

      const formData = new FormData();
      formData.append('image', this.selectedFile);

      try {
        const response = await fetch(
          "https://comp4537-projectserverside-e4hpapemggghh9ba.canadacentral-01.azurewebsites.net/api/ml/classify",
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData
          }
        );

        const data = await response.json();
        console.log("🔍 RAW ML RESPONSE:", data);

        // 🔄 Refresh usage counter after classification
        await this.loadUsage();

        // 🛡 Robust Parsing (Fixes ANY format)
        if (data.model_output && Array.isArray(data.model_output)) {
          let rawStr = data.model_output[0];

          // NORMALIZE THE STRING
          rawStr = rawStr.trim();
          rawStr = rawStr.replace(/'/g, '"');         // single → double quotes
          rawStr = rawStr.replace(/,\s*}/g, '}');     // remove trailing comma before }
          rawStr = rawStr.replace(/,\s*]/g, ']');     // remove trailing comma before ]
          rawStr = rawStr.replace(/\n/g, '');         // remove newlines

          console.log("🧹 CLEANED STRING:", rawStr);

          try {
            const parsed = JSON.parse(rawStr);

            if (Array.isArray(parsed) && parsed.length > 0) {
              // Get BEST prediction
              const best = parsed.reduce((a, b) => (a.confidence > b.confidence ? a : b));

              resultText.textContent = `${best.label} (${(best.confidence * 100).toFixed(1)}%)`;
            } else {
              resultText.textContent = "⚠ Could not understand model output.";
            }
          } catch (err) {
            console.error("FINAL PARSE ERROR:", err);
            resultText.textContent = "⚠ Could not parse model output.";
          }

        } else {
          resultText.textContent = "❌ No prediction returned.";
        }

        resultBox.classList.remove("d-none");
      } catch (err) {
        resultText.textContent = `Server error: ${err.message}`;
        resultBox.classList.remove("d-none");
      }

      this.updateClassifyButton();
    });

  }

handleFile(file) {
  if (!file || !file.type.startsWith("image/")) return;

  this.selectedFile = new File([file], file.name, { type: file.type }); // <--- MAKE STABLE COPY

  const preview = document.getElementById('preview');
  const reader = new FileReader();
  reader.onload = e => {
    preview.src = e.target.result;
    preview.classList.remove('d-none');
  };
  reader.readAsDataURL(file);

  // Update button state based on usage limit
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new UserPage().init();
});

export default UserPage;
