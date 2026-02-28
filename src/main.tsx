// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";
import "./i18n/config";

// 只在生产环境注册 PWA
if (import.meta.env.PROD) {
  const updateSW = registerSW({
    immediate: false,

    onNeedRefresh() {
      if (confirm("发现新版本，是否刷新页面以获取最新内容？")) {
        updateSW(true);
      }
    },

    onOfflineReady() {
      const toast = document.createElement("div");
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        z-index: 99999;
        font-family: system-ui;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      `;
      toast.textContent = "✅ 应用已支持离线访问";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    },

    // 🔴 加上类型
    onRegisteredSW(
      _swUrl: string | undefined,
      registration: ServiceWorkerRegistration | undefined,
    ) {
      if (registration) {
        // 每小时检查一次更新
        setInterval(
          () => {
            registration.update();
          },
          60 * 60 * 1000,
        );

        // 页面可见时检查更新
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") {
            registration.update();
          }
        });
      }
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
