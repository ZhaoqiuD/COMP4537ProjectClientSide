import PageBase from './page.base.js';
import AuthApi from './authApi.js';

class UserPage extends PageBase {
  constructor() {
    super('user-root');
    this.api = new AuthApi();
    this.selectedFile = null;
  }

  init() {
    if (!this.root) return;

    this.root.innerHTML = `
      <section>
        <div class="d-flex align-items-center justify-content-between">
          <h1 class="h4 mb-0">Welcome</h1>
          <button id="btnLogout" class="btn btn-outline-danger btn-sm">Logout</button>
        </div>

        <div class="row mt-4 g-3">
          <!-- LEFT CARD -->
          <div class="col-12 col-lg-5">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">Your API Usage</h2>
                <div id="user-usage" class="usage-box mt-2">
                  <em class="text-muted">API usage will appear here.</em>
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT CARD -->
          <div class="col-12 col-lg-7">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">AI Garbage Classifier</h2>

                <div id="dropZone" class="drop-zone">
                  <p class="mb-0">Drag & drop an image here, or click to select</p>
                  <input type="file" id="fileInput" accept="image/*" hidden />
                  <img id="preview" class="preview-img d-none" />
                </div>

                <div class="text-center mt-3">
                  <button id="classifyBtn" class="btn btn-primary" disabled>Classify Image</button>
                </div>

                <div id="resultBox" class="text-center mt-4 d-none">
                  <h5>Prediction:</h5>
                  <p id="resultText" class="fw-bold fs-5 text-success"></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;

    this.setupClassifier();
    this.mountEvents();
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
// CLASSIFY IMAGE
classifyBtn.addEventListener('click', async () => {
  if (!this.selectedFile) return;
  classifyBtn.disabled = true;
  classifyBtn.textContent = 'Classifying...';

  const token = localStorage.getItem("token");
  if (!token) {
    resultText.textContent = "⚠ Please log in again — token expired.";
    resultBox.classList.remove("d-none");
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

}
 else {
      resultText.textContent = "❌ No prediction returned.";
    }

    resultBox.classList.remove("d-none");
  } catch (err) {
    resultText.textContent = `Server error: ${err.message}`;
    resultBox.classList.remove("d-none");
  }

  classifyBtn.disabled = false;
  classifyBtn.textContent = 'Classify Image';
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

  document.getElementById('classifyBtn').disabled = false;
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
