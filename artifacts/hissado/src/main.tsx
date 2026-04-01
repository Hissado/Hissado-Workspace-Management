import { createRoot } from "react-dom/client";
import { I18nProvider } from "@/lib/i18n";
import App from "./App";
import Install from "./pages/Install";
import "./index.css";

// Register service worker for PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err) => console.warn("SW registration failed:", err));
  });
}

const isInstallPage = window.location.pathname.startsWith("/install");

createRoot(document.getElementById("root")!).render(
  isInstallPage ? (
    <Install />
  ) : (
    <I18nProvider>
      <App />
    </I18nProvider>
  )
);
