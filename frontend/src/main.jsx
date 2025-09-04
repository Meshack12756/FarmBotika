import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n/i18n";

import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

// Register service worker
registerSW({
  onNeedRefresh() {
    console.log("🔄 Refresh needed");
  },
  onOfflineReady() {
    console.log("📡 Offline ready");
  },
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPrompt = e;
  localStorage.setItem("showA2HS", "true");
});

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("❌ No #root found");
}
