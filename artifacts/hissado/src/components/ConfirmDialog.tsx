import { C, SH, Btn } from "@/components/primitives";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const WarnIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function ConfirmDialog({
  open, title, message, confirmLabel = "Delete", cancelLabel = "Cancel",
  danger = true, onConfirm, onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(7,13,26,.55)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{
        background: C.w, borderRadius: 20, padding: "36px 32px 28px",
        maxWidth: 420, width: "100%", boxShadow: SH.modal,
        textAlign: "center",
      }}>
        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: danger ? "#FEF2F2" : "#EFF6FF",
          border: `1.5px solid ${danger ? "#FECACA" : "#BFDBFE"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          color: danger ? C.err : "#3B82F6",
        }}>
          <WarnIcon />
        </div>

        <h3 style={{
          fontSize: 18, fontWeight: 700, color: C.navy,
          fontFamily: "'Playfair Display',serif", margin: "0 0 10px",
        }}>{title}</h3>

        <p style={{
          fontSize: 14, color: C.g500, lineHeight: 1.6,
          margin: "0 0 28px",
        }}>{message}</p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px 20px", border: `1px solid ${C.g200}`,
              borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif", background: C.w, color: C.g600,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.g50; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.w; }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            data-testid="confirm-delete-btn"
            style={{
              flex: 1, padding: "11px 20px", border: "none",
              borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              background: danger ? C.err : "#3B82F6",
              color: "#fff",
              transition: "opacity .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = ".88"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
