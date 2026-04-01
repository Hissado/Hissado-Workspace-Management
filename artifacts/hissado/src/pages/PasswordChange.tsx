import { useState } from "react";
import { C, SH } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/lib/data";

const EyeIcon = ({ show }: { show: boolean }) => show ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const LockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

interface PasswordChangeProps {
  user: User;
  onComplete: (newPassword: string) => void;
}

function strengthScore(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

const STRENGTH_LABELS = ["Too short", "Weak", "Fair", "Strong", "Very strong"];
const STRENGTH_COLORS = [C.err, C.err, "#F59E0B", "#10B981", "#059669"] as string[];

export default function PasswordChange({ user, onComplete }: PasswordChangeProps) {
  const { t } = useI18n();
  const [current, setCurrent] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const score = strengthScore(newPw);
  const mismatch = confirm.length > 0 && newPw !== confirm;

  const handleSubmit = () => {
    setError("");
    if (user.mustChangePassword && current !== user.password) {
      setError("Current password is incorrect.");
      return;
    }
    if (newPw.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPw !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (score < 2) {
      setError("Please choose a stronger password.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onComplete(newPw);
    }, 600);
  };

  const inputStyle = (hasError = false): React.CSSProperties => ({
    width: "100%", padding: "11px 14px", fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    border: `1.5px solid ${hasError ? C.err : C.g200}`,
    borderRadius: 10, outline: "none", boxSizing: "border-box",
    background: C.w, color: C.navy, fontWeight: 500,
    transition: "border-color .15s",
  });

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: C.bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: C.w, borderRadius: 24, boxShadow: SH.modal,
        maxWidth: 440, width: "100%", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${C.navy} 0%, #0F1E35 100%)`,
          padding: "32px 36px 28px", textAlign: "center",
        }}>
          <div style={{
            width: 60, height: 60, borderRadius: 16,
            background: `${C.gold}20`, border: `1.5px solid ${C.gold}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", color: C.gold,
          }}>
            <LockIcon />
          </div>
          <h2 style={{
            color: "#fff", fontSize: 20, fontWeight: 700, margin: "0 0 6px",
            fontFamily: "'Playfair Display',serif",
          }}>
            {t.pw_change_title || "Set Your Password"}
          </h2>
          <p style={{ color: "#9BA3B5", fontSize: 13, margin: 0 }}>
            {t.pw_change_desc || "For security, you must set a new password before continuing."}
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: "32px 36px" }}>
          {/* Current password (only if they have one set already) */}
          {user.password && (
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: C.g600, display: "block", marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>
                {t.pw_current || "Current (Temporary) Password"}
              </label>
              <input
                type="password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                placeholder="Enter your temporary password"
                style={inputStyle()}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.g200; }}
              />
            </div>
          )}

          {/* New password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.g600, display: "block", marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>
              {t.pw_new || "New Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Minimum 8 characters"
                style={{ ...inputStyle(), paddingRight: 44 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = C.g200; }}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.g400, padding: 2,
                }}
              >
                <EyeIcon show={showNew} />
              </button>
            </div>
            {/* Strength bar */}
            {newPw.length > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: i < score ? STRENGTH_COLORS[score] : C.g100,
                      transition: "background .2s",
                    }} />
                  ))}
                </div>
                <span style={{
                  fontSize: 11.5, fontWeight: 600,
                  color: STRENGTH_COLORS[score] || C.g400,
                }}>{STRENGTH_LABELS[score]}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: C.g600, display: "block", marginBottom: 6, letterSpacing: ".04em", textTransform: "uppercase" }}>
              {t.pw_confirm || "Confirm New Password"}
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your new password"
                style={{ ...inputStyle(mismatch), paddingRight: 44 }}
                onFocus={(e) => { e.currentTarget.style.borderColor = mismatch ? C.err : C.gold; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = mismatch ? C.err : C.g200; }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: C.g400, padding: 2,
                }}
              >
                <EyeIcon show={showConfirm} />
              </button>
            </div>
            {mismatch && <p style={{ fontSize: 12, color: C.err, marginTop: 5, fontWeight: 500 }}>Passwords do not match</p>}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "#FEF2F2", border: `1px solid #FECACA`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 18,
              fontSize: 13, color: C.err, fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            data-testid="set-password-btn"
            style={{
              width: "100%", padding: "13px",
              background: `linear-gradient(135deg, ${C.gold}, #B8934A)`,
              border: "none", borderRadius: 11, cursor: loading ? "not-allowed" : "pointer",
              color: "#fff", fontSize: 15, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
              opacity: loading ? .7 : 1,
              transition: "opacity .15s",
            }}
          >
            {loading ? "Setting password…" : (t.pw_set_btn || "Set Password & Continue")}
          </button>

          <p style={{ fontSize: 12, color: C.g400, textAlign: "center", marginTop: 16, lineHeight: 1.5 }}>
            Your password is encrypted and stored securely. You can change it anytime in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
