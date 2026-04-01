import { useState } from "react";
import { C, Av, Btn, Inp } from "@/components/primitives";
import type { User } from "@/lib/data";

interface LoginProps {
  users: User[];
  onLogin: (u: User) => void;
}

export default function Login({ users, onLogin }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const u = users.find((u) => u.email === email);
    if (u) { onLogin(u); setError(""); }
    else setError("Invalid credentials. Try: issa@hissado.com");
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: `linear-gradient(135deg,${C.navy} 0%,${C.navyL} 50%,${C.navyM} 100%)`, padding: 20,
    }}>
      {/* Glow effects */}
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 300, height: 300, borderRadius: "50%", background: `${C.gold}06`, filter: "blur(80px)" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: `${C.gold}04`, filter: "blur(100px)" }} />
      </div>

      <div
        className="scale-in"
        style={{
          background: C.w, borderRadius: 20, width: "100%", maxWidth: 420,
          padding: "48px 40px", boxShadow: "0 30px 60px rgba(0,0,0,.25)", position: "relative",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, background: `linear-gradient(135deg,${C.gold},${C.goldD})`,
            borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <span style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 32, lineHeight: 1 }}>H</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", letterSpacing: ".06em" }}>HISSADO PROJECT</h1>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 6 }}>Sign in to your workspace</p>
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: 10, background: "#FEE2E2", color: "#DC2626", fontSize: 12, marginBottom: 16 }} data-testid="login-error">
            {error}
          </div>
        )}

        <Inp label="Email" value={email} onChange={setEmail} ph="your@email.com" type="email" />
        <Inp label="Password" value={password} onChange={setPassword} ph="••••••••" type="password" />

        <Btn
          onClick={handleLogin}
          data-testid="login-submit-btn"
          style={{ width: "100%", padding: "12px", justifyContent: "center", fontSize: 14, borderRadius: 10 }}
        >
          Sign In
        </Btn>

        {/* Quick login */}
        <div style={{ marginTop: 24, padding: 16, background: C.g50, borderRadius: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: C.g400, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Quick Login</div>
          {users.filter((u) => u.status === "active").slice(0, 4).map((u) => (
            <button
              key={u.id}
              onClick={() => onLogin(u)}
              data-testid={`quick-login-${u.id}`}
              style={{
                width: "100%", padding: "8px 12px", border: "none", borderRadius: 8,
                background: "transparent", cursor: "pointer", display: "flex",
                alignItems: "center", gap: 10, fontFamily: "inherit", marginBottom: 2, transition: "background .1s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = C.g100)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Av ini={u.av} size={28} />
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.g700 }}>{u.name}</div>
                <div style={{ fontSize: 10, color: C.g400 }}>{u.email} · {u.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
