import { type CSSProperties, type ReactNode } from "react";
import { FILE_TYPES, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/data";

// ── Color constants ──
export const C = {
  navy: "#0F1A2E",
  navyL: "#162240",
  navyM: "#1C2D4A",
  gold: "#C8A45C",
  goldL: "#D4B87A",
  goldD: "#A8883E",
  w: "#FFF",
  g50: "#F8F9FC",
  g100: "#F0F2F7",
  g200: "#E2E5EE",
  g300: "#C8CDD8",
  g400: "#9BA3B5",
  g500: "#6B7489",
  g600: "#4A5268",
  g700: "#343B4F",
  ok: "#22C55E",
  warn: "#F59E0B",
  err: "#EF4444",
  info: "#3B82F6",
};

// ── Avatar ──
export function Av({ ini, size = 32, color = C.gold }: { ini: string; size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(135deg,${color},${color}CC)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: size * 0.38, fontWeight: 600, flexShrink: 0,
      }}
    >
      {ini}
    </div>
  );
}

// ── Badge ──
type BdgVariant = "default" | "gold" | "success" | "warning" | "danger" | "info";
const BDG_VARIANTS: Record<BdgVariant, { bg: string; c: string }> = {
  default: { bg: C.g200, c: C.g600 },
  gold: { bg: `${C.gold}18`, c: C.goldD },
  success: { bg: "#D1FAE5", c: "#065F46" },
  warning: { bg: "#FEF3C7", c: "#92400E" },
  danger: { bg: "#FEE2E2", c: "#991B1B" },
  info: { bg: "#DBEAFE", c: "#1E40AF" },
};

export function Bdg({ children, v = "default", style = {} }: { children: ReactNode; v?: BdgVariant; style?: CSSProperties }) {
  const m = BDG_VARIANTS[v];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 10px",
      borderRadius: 12, fontSize: 11, fontWeight: 600,
      background: m.bg, color: m.c, letterSpacing: ".03em", textTransform: "uppercase", ...style
    }}>
      {children}
    </span>
  );
}

// ── Button ──
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "navy";
type BtnSize = "sm" | "md" | "lg";

const BTN_VARIANTS: Record<BtnVariant, CSSProperties> = {
  primary: { background: `linear-gradient(135deg,${C.gold},${C.goldD})`, color: "#fff", boxShadow: "0 2px 8px rgba(200,164,92,.3)" },
  secondary: { background: C.w, color: C.g700, border: `1px solid ${C.g200}` },
  ghost: { background: "transparent", color: C.g500 },
  danger: { background: "#FEE2E2", color: "#DC2626" },
  navy: { background: C.navy, color: "#fff" },
};

const BTN_SIZES: Record<BtnSize, CSSProperties> = {
  sm: { padding: "6px 12px", fontSize: 12 },
  md: { padding: "8px 18px", fontSize: 13 },
  lg: { padding: "12px 24px", fontSize: 14 },
};

export function Btn({
  children, v = "primary", sz = "md", onClick, style = {}, disabled, icon,
  type = "button", "data-testid": testId,
}: {
  children?: ReactNode; v?: BtnVariant; sz?: BtnSize;
  onClick?: () => void; style?: CSSProperties; disabled?: boolean;
  icon?: ReactNode; type?: "button" | "submit";
  "data-testid"?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      style={{
        border: "none", cursor: disabled ? "not-allowed" : "pointer",
        borderRadius: 8, fontFamily: "inherit", fontWeight: 600,
        display: "inline-flex", alignItems: "center", gap: 6,
        transition: "all .15s", opacity: disabled ? 0.5 : 1,
        ...BTN_SIZES[sz], ...BTN_VARIANTS[v], ...style,
      }}
    >
      {icon && <span style={{ display: "flex" }}>{icon}</span>}
      {children}
    </button>
  );
}

// ── Input / Select / Textarea ──
export function Inp({
  label, value, onChange, type = "text", ph, style = {}, ta, opts,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  type?: string; ph?: string; style?: CSSProperties; ta?: boolean;
  opts?: { v: string; l: string }[];
}) {
  const is: CSSProperties = {
    width: "100%", padding: "10px 14px", border: `1px solid ${C.g200}`,
    borderRadius: 8, fontSize: 13, fontFamily: "inherit",
    color: C.g700, background: C.w, outline: "none", ...style,
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && (
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g500, marginBottom: 6, textTransform: "uppercase", letterSpacing: ".05em" }}>
          {label}
        </label>
      )}
      {opts ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...is, cursor: "pointer" }}>
          {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : ta ? (
        <textarea
          value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph}
          rows={3} style={{ ...is, resize: "vertical" }}
        />
      ) : (
        <input
          type={type} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={ph} style={is}
          onFocus={(e) => (e.target.style.borderColor = C.gold)}
          onBlur={(e) => (e.target.style.borderColor = C.g200)}
        />
      )}
    </div>
  );
}

// ── Modal ──
export function Modal({ open, onClose, title, children, w = 520 }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; w?: number;
}) {
  if (!open) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div style={{ position: "fixed", inset: 0, background: "rgba(15,26,46,.6)", backdropFilter: "blur(4px)" }} />
      <div
        className="scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.w, borderRadius: 16, width: "100%", maxWidth: w,
          maxHeight: "85vh", overflow: "auto", position: "relative",
          boxShadow: "0 25px 60px rgba(0,0,0,.2)",
        }}
      >
        <div style={{
          padding: "20px 24px", borderBottom: `1px solid ${C.g100}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: C.w, zIndex: 1, borderRadius: "16px 16px 0 0",
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ──
export function Empty({ icon, title, desc, action }: { icon: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: `${C.gold}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: C.gold }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 600, color: C.navy, marginBottom: 8 }}>{title}</h3>
      <p style={{ fontSize: 13, color: C.g400, maxWidth: 320, margin: "0 auto 20px" }}>{desc}</p>
      {action}
    </div>
  );
}

// ── Progress Bar ──
export function PBar({ value, h = 6, color = C.gold }: { value: number; h?: number; color?: string }) {
  return (
    <div style={{ height: h, borderRadius: h, background: C.g100, overflow: "hidden", width: "100%" }}>
      <div style={{ height: "100%", width: `${Math.min(100, value)}%`, borderRadius: h, background: `linear-gradient(90deg,${color},${C.goldL})`, transition: "width .4s" }} />
    </div>
  );
}

// ── Tabs ──
export function Tabs({ tabs, active, onChange }: { tabs: { k: string; l: string; icon?: ReactNode }[]; active: string; onChange: (k: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 2, background: C.g100, borderRadius: 10, padding: 3 }}>
      {tabs.map((t) => (
        <button
          key={t.k}
          onClick={() => onChange(t.k)}
          style={{
            padding: "7px 16px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600,
            fontFamily: "inherit", cursor: "pointer", transition: "all .15s",
            background: active === t.k ? C.w : "transparent",
            color: active === t.k ? C.navy : C.g400,
            boxShadow: active === t.k ? "0 1px 4px rgba(0,0,0,.08)" : "none",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          {t.icon} {t.l}
        </button>
      ))}
    </div>
  );
}

// ── Logo ──
export function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 24, height: 24, background: `linear-gradient(135deg,${C.gold},${C.goldD})`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 14.4, lineHeight: 1 }}>H</span>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", letterSpacing: ".08em", lineHeight: 1 }}>HISSADO</div>
        <div style={{ fontSize: 7.7, fontWeight: 500, color: C.goldL, letterSpacing: ".2em", textTransform: "uppercase", marginTop: 1 }}>PROJECT</div>
      </div>
    </div>
  );
}

// ── File Icon ──
export function FileIcon({ type, size = 40 }: { type: string; size?: number }) {
  const ft = FILE_TYPES[type] || { c: C.g400, l: type?.toUpperCase() || "FILE" };
  return (
    <div style={{
      width: size, height: size * 1.2, borderRadius: 6,
      background: `${ft.c}12`, border: `1px solid ${ft.c}25`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <span style={{ fontSize: size * 0.25, fontWeight: 800, color: ft.c, textTransform: "uppercase" }}>{ft.l}</span>
    </div>
  );
}

// ── Status Badge ──
export function StatusBadge({ status }: { status: string }) {
  const sc = STATUS_COLORS[status] || { bg: C.g200, t: C.g600, a: C.g400 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.t }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.a }} />
      {status}
    </span>
  );
}

// ── Priority Badge ──
export function PriorityBadge({ pri }: { pri: string }) {
  const pc = PRIORITY_COLORS[pri] || { bg: C.g200, t: C.g600, d: C.g400 };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: pc.bg, color: pc.t }}>
      {pri}
    </span>
  );
}
