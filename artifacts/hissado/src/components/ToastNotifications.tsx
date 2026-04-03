import { useEffect, useState, useCallback } from "react";
import { C, Av } from "./primitives";

export interface Toast {
  id: string;
  type: "message" | "call-missed";
  title: string;
  body: string;
  avatar?: string;
  color?: string;
  onPress?: () => void;
}

let _setToasts: React.Dispatch<React.SetStateAction<Toast[]>> | null = null;

export function pushToast(toast: Omit<Toast, "id">) {
  if (!_setToasts) return;
  const id = Math.random().toString(36).slice(2, 10);
  _setToasts((prev) => [...prev.slice(-2), { ...toast, id }]);
}

/* ─── Icons ─────────────────────────────────────────────────── */
const MessageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const MissedCallIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 4.26" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const XIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── Single toast item ─────────────────────────────────────── */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 350); }, 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isMissed = toast.type === "call-missed";

  return (
    <div
      onClick={toast.onPress}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        background: C.navy,
        border: `1px solid ${isMissed ? "#EF444430" : "rgba(255,255,255,.1)"}`,
        borderRadius: 16,
        padding: "12px 14px",
        boxShadow: "0 8px 32px rgba(0,0,0,.45)",
        minWidth: 280, maxWidth: 360,
        cursor: toast.onPress ? "pointer" : "default",
        transform: visible ? "translateY(0)" : "translateY(-20px)",
        opacity: visible ? 1 : 0,
        transition: "transform .3s cubic-bezier(.34,1.56,.64,1), opacity .3s ease",
        userSelect: "none",
      }}
    >
      {/* Left avatar or icon */}
      {toast.avatar || toast.color ? (
        <Av ini={toast.title.slice(0, 2)} size={38} color={toast.color} />
      ) : (
        <div style={{
          width: 38, height: 38, borderRadius: 10, flexShrink: 0,
          background: isMissed ? "#EF444418" : `${C.gold}18`,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: isMissed ? "#EF4444" : C.gold,
          border: `1px solid ${isMissed ? "#EF444430" : `${C.gold}30`}`,
        }}>
          {isMissed ? <MissedCallIcon /> : <MessageIcon />}
        </div>
      )}

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "#fff",
          fontFamily: "'DM Sans',sans-serif",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {toast.title}
        </div>
        <div style={{
          fontSize: 12, color: "rgba(255,255,255,.5)", fontFamily: "'DM Sans',sans-serif",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2,
        }}>
          {toast.body}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false); setTimeout(onDismiss, 350); }}
        style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0,
          background: "rgba(255,255,255,.08)", border: "none",
          cursor: "pointer", color: "rgba(255,255,255,.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <XIcon />
      </button>
    </div>
  );
}

/* ─── Container ─────────────────────────────────────────────── */
export default function ToastNotifications() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    _setToasts = setToasts;
    return () => { _setToasts = null; };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed", top: 16, right: 16, zIndex: 10050,
      display: "flex", flexDirection: "column", gap: 10,
      pointerEvents: "none",
    }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <ToastItem toast={toast} onDismiss={() => dismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
}
