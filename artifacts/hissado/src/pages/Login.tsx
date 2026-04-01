import { useState } from "react";
import { C, SH, Btn, Inp } from "@/components/primitives";
import { useI18n, type Lang } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/lib/data";

const GlobeIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface LoginProps {
  users: User[];
  onLogin: (u: User) => void;
}

const FEATURES = [
  "Real-time project tracking across all teams",
  "Executive dashboards with live analytics",
  "Multilingual enterprise workspace support",
];

export default function Login({ users, onLogin }: LoginProps) {
  const { t, lang, setLang } = useI18n();
  const isMobile = useIsMobile();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const u = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!u) { setError(t.login_error); return; }
    if (u.password && password && u.password !== password) {
      setError(t.login_wrong_password || "Incorrect password. Please try again.");
      return;
    }
    onLogin(u);
    setError("");
  };

  const nextLang: Lang = lang === "en" ? "fr" : "en";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row",
      background: isMobile
        ? `linear-gradient(160deg, ${C.navy} 0%, ${C.navyM} 40%, #0A1425 100%)`
        : C.bg,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* Mobile: compact brand header */}
      {isMobile && (
        <div style={{ padding: "32px 24px 28px", position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{
                width: 38, height: 38,
                background: `linear-gradient(145deg,${C.gold} 0%,${C.goldD} 100%)`,
                borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 16px ${C.gold}45`,
              }}>
                <span style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 20, lineHeight: 1 }}>H</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: ".13em", fontFamily: "'DM Sans',sans-serif" }}>HISSADO</div>
                <div style={{ fontSize: 8.5, fontWeight: 600, color: `${C.gold}CC`, letterSpacing: ".22em", textTransform: "uppercase", fontFamily: "'DM Sans',sans-serif" }}>PROJECT</div>
              </div>
            </div>
            <button
              onClick={() => setLang(nextLang)}
              data-testid="login-lang-btn"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.15)",
                borderRadius: 8, padding: "6px 12px", cursor: "pointer",
                color: "rgba(255,255,255,.8)", fontSize: 12, fontWeight: 700,
                fontFamily: "inherit",
              }}
            >
              <GlobeIcon />
              {lang === "en" ? "FR" : "EN"}
            </button>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 600, color: "#fff",
            fontFamily: "'Playfair Display',serif",
            lineHeight: 1.25, margin: "22px 0 0",
            letterSpacing: "-.01em",
          }}>
            Where great projects<br />
            <span style={{ color: C.gold }}>come to life.</span>
          </h1>
        </div>
      )}

      {/* LEFT: Brand Panel (desktop only) */}
      {!isMobile && <div style={{
        width: "42%", minHeight: "100vh", flexShrink: 0,
        background: `linear-gradient(160deg, ${C.navy} 0%, ${C.navyM} 50%, #0A1425 100%)`,
        display: "flex", flexDirection: "column",
        padding: "48px 52px",
        position: "relative", overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: "-80px", right: "-80px", width: 320, height: 320, borderRadius: "50%", border: `1px solid rgba(201,169,110,.06)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: 200, height: 200, borderRadius: "50%", border: `1px solid rgba(201,169,110,.08)`, pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "60px", left: "-100px", width: 400, height: 400, borderRadius: "50%", background: `${C.gold}04`, filter: "blur(60px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "30%", right: "10%", width: 160, height: 160, borderRadius: "50%", background: `${C.gold}03`, filter: "blur(40px)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: "auto" }}>
          <div style={{
            width: 46, height: 46,
            background: `linear-gradient(145deg,${C.gold} 0%,${C.goldD} 100%)`,
            borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 6px 20px ${C.gold}45, inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(0,0,0,.15)`,
            flexShrink: 0,
          }}>
            <span style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 24, lineHeight: 1, letterSpacing: "-.01em" }}>H</span>
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: ".13em", fontFamily: "'DM Sans',sans-serif" }}>HISSADO</div>
            <div style={{ fontSize: 9.5, fontWeight: 600, color: `${C.gold}CC`, letterSpacing: ".22em", textTransform: "uppercase", marginTop: 4, fontFamily: "'DM Sans',sans-serif" }}>PROJECT</div>
          </div>
        </div>

        {/* Main message */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 40 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 20,
            background: `${C.gold}15`, border: `1px solid ${C.gold}30`,
            color: C.goldL, fontSize: 11, fontWeight: 700,
            letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 24,
            width: "fit-content",
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold }} />
            Enterprise Platform
          </div>

          <h1 style={{
            fontSize: 38, fontWeight: 600, color: "#fff",
            fontFamily: "'Playfair Display',serif",
            lineHeight: 1.2, margin: "0 0 20px",
            letterSpacing: "-.01em",
          }}>
            Where great projects<br />
            <span style={{ color: C.gold }}>come to life.</span>
          </h1>

          <p style={{
            fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.7,
            margin: "0 0 40px", maxWidth: 340,
          }}>
            A unified workspace for teams that demand clarity, accountability, and results at every level.
          </p>

          {/* Feature list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                  background: `${C.gold}20`, border: `1px solid ${C.gold}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: C.goldL,
                }}>
                  <CheckIcon />
                </div>
                <span style={{ fontSize: 13.5, color: "rgba(255,255,255,.6)", lineHeight: 1.4 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stat strip */}
        <div style={{
          display: "flex", gap: 32, paddingTop: 28,
          borderTop: "1px solid rgba(255,255,255,.07)",
        }}>
          {[["98%", "Uptime SLA"], ["500+", "Enterprise clients"], ["12M+", "Tasks delivered"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.goldL, fontFamily: "'Playfair Display',serif" }}>{val}</div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,.35)", marginTop: 2, letterSpacing: ".05em" }}>{lbl}</div>
            </div>
          ))}
        </div>
      </div>}

      {/* RIGHT: Form Panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: isMobile ? "flex-start" : "center",
        padding: isMobile ? "24px 20px 40px" : "48px 60px",
        position: "relative",
        background: isMobile ? C.w : "transparent",
        borderRadius: isMobile ? "20px 20px 0 0" : 0,
        minHeight: isMobile ? "auto" : undefined,
      }}>
        {/* Language toggle (desktop only — mobile shows it in brand header) */}
        {!isMobile && <button
          onClick={() => setLang(nextLang)}
          data-testid="login-lang-btn"
          style={{
            position: "absolute", top: 28, right: 28,
            display: "flex", alignItems: "center", gap: 6,
            background: C.w, border: `1px solid ${C.g200}`,
            borderRadius: 8, padding: "6px 14px", cursor: "pointer",
            color: C.g600, fontSize: 12, fontWeight: 700,
            fontFamily: "inherit", boxShadow: SH.xs,
            transition: "all .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.goldD; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g600; }}
        >
          <GlobeIcon />
          {lang === "en" ? "FR" : "EN"}
        </button>}

        <div className="scale-in" style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{
              fontSize: 28, fontWeight: 700, color: C.navy,
              fontFamily: "'Playfair Display',serif", margin: "0 0 8px",
              letterSpacing: "-.01em",
            }}>
              {t.login_title}
            </h2>
            <p style={{ fontSize: 14, color: C.g400, margin: 0 }}>
              Enter your credentials to access your workspace.
            </p>
          </div>

          {error && (
            <div style={{
              padding: "12px 16px", borderRadius: 10,
              background: C.errL, color: C.errD,
              fontSize: 13, marginBottom: 20,
              border: `1px solid #FECACA`,
              display: "flex", alignItems: "center", gap: 8,
            }} data-testid="login-error">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
            <Inp label={t.login_email} value={email} onChange={setEmail} ph="your@email.com" type="email" autoComplete="email" />
            <Inp label={t.login_password} value={password} onChange={setPassword} ph="••••••••" type="password" autoComplete="current-password" />

            <Btn
              onClick={handleLogin}
              data-testid="login-submit-btn"
              sz="lg"
              icon={<ArrowIcon />}
              style={{ width: "100%", justifyContent: "center", marginTop: 4, borderRadius: 12 }}
            >
              {t.login_submit}
            </Btn>
          </form>

        </div>
      </div>
    </div>
  );
}
