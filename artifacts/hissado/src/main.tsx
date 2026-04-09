import { createRoot } from "react-dom/client";
import { I18nProvider } from "@/lib/i18n";
import App from "./App";
import Install from "./pages/Install";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./index.css";

// Register service worker for PWA (best-effort; never blocks the app).
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
    <ErrorBoundary>
      <Install />
    </ErrorBoundary>
  ) : (
    <ErrorBoundary>
      <I18nProvider>
        <App />
      </I18nProvider>
    </ErrorBoundary>
  ),
);
