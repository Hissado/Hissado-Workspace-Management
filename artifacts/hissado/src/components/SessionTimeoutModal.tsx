import type { Lang } from "@/lib/i18n";

interface SessionTimeoutModalProps {
  countdown: number;
  lang: Lang;
  onSignOut: () => void;
  onStayActive: () => void;
}

export default function SessionTimeoutModal({
  countdown, lang, onSignOut, onStayActive,
}: SessionTimeoutModalProps) {
  const isFr = lang === "fr";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(7,13,26,0.72)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{
        background: "#ffffff", borderRadius: 20,
        padding: "40px 36px", maxWidth: 400, width: "100%",
        boxShadow: "0 24px 80px rgba(7,13,26,0.4)",
        textAlign: "center", fontFamily: "'DM Sans', sans-serif",
      }}>
        {/* Clock icon */}
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "linear-gradient(135deg,rgba(201,169,110,0.18),rgba(201,169,110,0.06))",
          border: "2px solid rgba(201,169,110,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        <h2 style={{ color: "#070D1A", fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>
          {isFr ? "Toujours là ?" : "Still there?"}
        </h2>
        <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.65, margin: "0 0 8px" }}>
          {isFr
            ? "Vous avez été inactif(ve) pendant 55 minutes."
            : "You've been inactive for 55 minutes."}
        </p>
        <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.65, margin: "0 0 28px" }}>
          {isFr ? "Déconnexion automatique dans" : "You'll be signed out automatically in"}
        </p>

        {/* Countdown timer */}
        <div style={{
          fontSize: 44, fontWeight: 800,
          color: countdown <= 60 ? "#DC2626" : "#C9A96E",
          margin: "0 0 28px", letterSpacing: "-0.02em",
          transition: "color 0.3s",
        }}>
          {String(Math.floor(countdown / 60)).padStart(2, "0")}
          :{String(countdown % 60).padStart(2, "0")}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onSignOut}
            style={{
              flex: 1, padding: "12px 0",
              border: "1.5px solid #E5E7EB", borderRadius: 10,
              background: "#ffffff", cursor: "pointer",
              fontSize: 14, fontWeight: 600, color: "#6B7280",
              fontFamily: "inherit",
            }}
          >
            {isFr ? "Se déconnecter" : "Sign Out"}
          </button>
          <button
            onClick={onStayActive}
            style={{
              flex: 2, padding: "12px 0", border: "none", borderRadius: 10,
              background: "linear-gradient(135deg,#C9A96E,#a87e4a)",
              cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#ffffff",
              fontFamily: "inherit",
              boxShadow: "0 4px 14px rgba(201,169,110,0.35)",
            }}
          >
            {isFr ? "Rester connecté(e)" : "Stay Signed In"}
          </button>
        </div>
      </div>
    </div>
  );
}
