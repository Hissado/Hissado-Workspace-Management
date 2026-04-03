import { useEffect, useRef } from "react";
import { C, Av } from "./primitives";

/* ─── Outgoing ring tone (Web Audio API) ─────────────────────── */
function startRing(ctx: AudioContext): () => void {
  let active = true;

  function playTone() {
    if (!active) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.01);
    gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.0);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.1);
    if (active) setTimeout(playTone, 3000);
  }

  playTone();
  return () => { active = false; };
}

/* ─── Icons ─────────────────────────────────────────────────── */
const PhoneOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 4.26" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ─── Component ──────────────────────────────────────────────── */
interface OutgoingCallProps {
  targetName: string;
  targetColor?: string;
  videoEnabled: boolean;
  onCancel: () => void;
}

export default function OutgoingCall({
  targetName, targetColor, videoEnabled, onCancel,
}: OutgoingCallProps) {
  const stopRingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    stopRingRef.current = startRing(ctx);
    return () => {
      stopRingRef.current?.();
      ctx.close().catch(() => {});
    };
  }, []);

  const initials = targetName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 10100,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#0A1020 0%,#070D1A 60%,#0A0D18 100%)",
    }}>
      <style>{`
        @keyframes oc-wave {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
        @keyframes oc-dot {
          0%,80%,100% { opacity: .3; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>

      {/* Pulsing avatar */}
      <div style={{
        marginBottom: 36,
        animation: "oc-wave 1.8s ease-in-out infinite",
      }}>
        <Av ini={initials} size={96} color={targetColor} />
      </div>

      {/* Call type */}
      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase",
        color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif", marginBottom: 10,
      }}>
        {videoEnabled ? "Video Call" : "Audio Call"}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 32, fontWeight: 800, color: "#fff",
        fontFamily: "'Playfair Display',serif", marginBottom: 10, textAlign: "center",
        padding: "0 24px",
      }}>
        {targetName}
      </div>

      {/* Ringing dots */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 64 }}>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif" }}>
          Ringing
        </span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              width: 5, height: 5, borderRadius: "50%",
              background: C.gold, display: "inline-block",
              animation: `oc-dot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Cancel */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <button
          onClick={onCancel}
          style={{
            width: 68, height: 68, borderRadius: "50%",
            background: "#EF4444",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff",
            boxShadow: "0 6px 28px rgba(239,68,68,.4)",
            transition: "transform .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.07)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <PhoneOffIcon />
        </button>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif" }}>
          Cancel
        </span>
      </div>
    </div>
  );
}
