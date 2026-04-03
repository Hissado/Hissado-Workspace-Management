import { useCallback, useEffect } from "react";

export function useDesktopNotifications() {
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const send = useCallback((title: string, body: string, options?: { icon?: string; tag?: string }) => {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") new Notification(title, { body, silent: false, ...options });
      }).catch(() => {});
      return;
    }
    try {
      const n = new Notification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        silent: false,
        ...options,
      });
      n.onclick = () => { window.focus(); n.close(); };
      setTimeout(() => n.close(), 6000);
    } catch { /* ignore */ }
  }, []);

  return { send };
}
