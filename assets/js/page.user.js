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

          <div class="col-12 col-lg-7">
            <div class="card shadow-sm">
              <div class="card-body">
                <h2 class="h6">AI Garbage Classifier</h2>
                <p class="text-muted">Drop or select an image to classify.</p>

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
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const preview   = document.getElementById("preview");
    const classifyBtn = document.getElementById("classifyBtn");

    dropZone.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", e => this.handleFile(e.target.files[0]));

    dropZone.addEventListener("dragover", e => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", e => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      this.handleFile(e.dataTransfer.files[0]);
    });

    // 🚀 CLASSIFY BUTTON
    classifyBtn.addEventListener("click", async () => {
      if (!this.selectedFile) return;
      classifyBtn.disabled = true;
      classifyBtn.textContent = "Classifying...";

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("image", this.selectedFile);

      try {
        console.log("📤 Sending file to server ML API...");
        const response = await fetch("http://localhost:3000/api/ml/classify", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
          credentials: "include",
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        console.log("📥 ML RESPONSE:", data);

        if (!data.model_output) {
          return this.showResult("No prediction returned.", false);
        }

        // 🔥 CONVERT PYTHON FORMAT → VALID JSON
let raw = data.model_output[0];
let cleanJson = raw.replace(/'/g, '"');        // ' → "
let parsedArray = JSON.parse(cleanJson);       // 🔥 NOW valid JS array
let result = parsedArray[0];                   // take FIRST element

// 👌 NOW result = { label: "cardboard", confidence: 0.98 }
this.showResult(
  `${result.label} (${(result.confidence * 100).toFixed(1)}%)`,
  true
);

      } catch (err) {
        console.error("❌ ERROR:", err);
        this.showResult(`Server error: ${err.message}`, false);
      } finally {
        classifyBtn.disabled = false;
        classifyBtn.textContent = "Classify Image";
      }
    });
  }

  handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      alert("Please upload an image.");
      return;
    }

    const preview = document.getElementById("preview");
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.classList.remove("d-none");
    };
    reader.readAsDataURL(file);

    this.selectedFile = file;
    document.getElementById("classifyBtn").disabled = false;
    console.log("📸 Selected File:", file);
  }

  showResult(message, success = true) {
    const resultText = document.getElementById("resultText");
    const resultBox = document.getElementById("resultBox");

    resultText.textContent = message;
    resultText.classList.toggle("text-success", success);
    resultText.classList.toggle("text-danger", !success);

    resultBox.classList.remove("d-none");
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
  const page = new UserPage();
  page.init();
});

export default UserPage;
