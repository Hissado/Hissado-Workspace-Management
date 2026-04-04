import type { Notification } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import { C } from "@/components/primitives";

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export default function NotificationPanel({ notifications, onClose, onMarkAllRead }: NotificationPanelProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  return (
    <>
      {/* Click-away backdrop */}
      <div style={{ position: "fixed", inset: 0, zIndex: 498 }} onClick={onClose} />

      <div style={{
        position: "fixed", top: 74,
        right: isMobile ? 8 : 20,
        width: isMobile ? "calc(100vw - 16px)" : 340,
        background: C.w, borderRadius: 16,
        border: `1px solid ${C.g100}`,
        boxShadow: "0 8px 30px rgba(0,0,0,.12)",
        zIndex: 499, overflow: "hidden",
      }}>
        {/* Panel header */}
        <div style={{
          padding: "14px 16px",
          borderBottom: `1px solid ${C.g100}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: 0 }}>
            {t.notif_title}
          </h3>
          <button
            onClick={onMarkAllRead}
            style={{
              fontSize: 11, color: C.gold, background: "none", border: "none",
              cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
            }}
          >
            {t.notif_mark_read}
          </button>
        </div>

        {/* Notification list */}
        <div style={{ maxHeight: 380, overflow: "auto" }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 32, textAlign: "center", color: C.g400, fontSize: 13 }}>
              {t.notif_empty}
            </div>
          ) : notifications.map((n) => (
            <div
              key={n.id}
              style={{
                padding: "12px 16px",
                borderBottom: `1px solid ${C.g50}`,
                background: n.read ? "transparent" : `${C.gold}06`,
                display: "flex", gap: 10, alignItems: "flex-start",
              }}
            >
              {!n.read && (
                <div style={{
                  width: 6, height: 6, borderRadius: "50%", background: C.gold,
                  marginTop: 5, flexShrink: 0,
                }} />
              )}
              <div style={{ flex: 1, marginLeft: n.read ? 16 : 0 }}>
                <div style={{ fontSize: 13, color: C.g700 }}>{n.text}</div>
                <div style={{ fontSize: 11, color: C.g400, marginTop: 3 }}>
                  {n.date ? new Date(n.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
