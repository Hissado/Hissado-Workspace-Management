import { useEffect, useRef } from "react";
import { C, Av } from "./primitives";
import type { CallSignal } from "@/hooks/useRealtime";

/* ─── Ring tone (Web Audio API) ─────────────────────────────── */
function startRing(ctx: AudioContext): () => void {
  let active = true;

  function playPulse() {
    if (!active) return;
    const tones = [
      { freq: 480, start: 0,    dur: 0.14 },
      { freq: 360, start: 0.16, dur: 0.14 },
    ];
    tones.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.28, ctx.currentTime + start + 0.015);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + start + dur - 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + start + dur);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.01);
    });
    if (active) setTimeout(playPulse, 2200);
  }

  playPulse();
  return () => { active = false; };
}

/* ─── Icons ─────────────────────────────────────────────────── */
const PhoneOffIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.42 19.42 0 0 1 4.26 4.26" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.1a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.26h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l1.81-1.81a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const VideoIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" />
  </svg>
);

/* ─── Component ──────────────────────────────────────────────── */
export default function IncomingCall({
  signal,
  onAccept,
  onDecline,
}: {
  signal: CallSignal;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const stopRingRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const ctx = new AudioContext();
    stopRingRef.current = startRing(ctx);
    const timeout = setTimeout(onDecline, 30000);

    return () => {
      stopRingRef.current?.();
      ctx.close().catch(() => {});
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initials = signal.callerName
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
        @keyframes ic-pulse {
          0% { transform: scale(1); opacity: .7; }
          70% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ic-pulse2 {
          0% { transform: scale(1); opacity: .4; }
          70% { transform: scale(2.1); opacity: 0; }
          100% { transform: scale(2.1); opacity: 0; }
        }
      `}</style>

      {/* Ripple rings */}
      <div style={{ position: "relative", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          position: "absolute", width: 96, height: 96, borderRadius: "50%",
          background: `${C.gold}25`,
          animation: "ic-pulse 2s cubic-bezier(.4,0,.2,1) infinite",
        }} />
        <div style={{
          position: "absolute", width: 96, height: 96, borderRadius: "50%",
          background: `${C.gold}15`,
          animation: "ic-pulse2 2s cubic-bezier(.4,0,.2,1) .4s infinite",
        }} />
        <Av ini={initials} size={96} color={signal.callerColor} />
      </div>

      {/* Call type label */}
      <div style={{
        fontSize: 12, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase",
        color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif", marginBottom: 10,
      }}>
        {signal.videoEnabled ? "Incoming Video Call" : "Incoming Audio Call"}
      </div>

      {/* Caller name */}
      <div style={{
        fontSize: 32, fontWeight: 800, color: "#fff",
        fontFamily: "'Playfair Display',serif", marginBottom: 6, textAlign: "center",
        padding: "0 24px",
      }}>
        {signal.callerName}
      </div>

      {/* Ringing label */}
      <div style={{
        fontSize: 13, color: "rgba(255,255,255,.35)", fontFamily: "'DM Sans',sans-serif",
        marginBottom: 60,
      }}>
        Calling you...
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 48, alignItems: "center" }}>

        {/* Decline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button
            onClick={onDecline}
            style={{
              width: 68, height: 68, borderRadius: "50%",
              background: "#EF4444",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", transition: "transform .15s, box-shadow .15s",
              boxShadow: "0 6px 28px rgba(239,68,68,.45)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <PhoneOffIcon />
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif" }}>
            Decline
          </span>
        </div>

        {/* Accept */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <button
            onClick={onAccept}
            style={{
              width: 68, height: 68, borderRadius: "50%",
              background: "#22C55E",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", transition: "transform .15s, box-shadow .15s",
              boxShadow: "0 6px 28px rgba(34,197,94,.45)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.07)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {signal.videoEnabled ? <VideoIcon /> : <PhoneIcon />}
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,.4)", fontFamily: "'DM Sans',sans-serif" }}>
            Accept
          </span>
        </div>
      </div>
    </div>
  );
}
