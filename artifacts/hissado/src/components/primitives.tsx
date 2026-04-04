import { type CSSProperties, type ReactNode, useState, useEffect } from "react";
import { FILE_TYPES, STATUS_COLORS, PRIORITY_COLORS, type TaskStatus, type TaskPriority } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";

// ── Premium Color System ──
export const C = {
  // Deep Navy (sidebar, overlays)
  navy: "#070D1A",
  navyL: "#0C1627",
  navyM: "#111E35",
  navyD: "#040810",

  // Gold (brand accent)
  gold: "#C9A96E",
  goldL: "#DFBf84",
  goldD: "#A8834A",
  goldPale: "#FBF6EC",

  // Application background
  bg: "#EFF2F8",

  // Surfaces
  w: "#FFFFFF",
  g50: "#F7F9FC",
  g100: "#EDF1F8",
  g200: "#DDE3EF",
  g300: "#C2CCDF",
  g400: "#96A3BC",
  g500: "#6B7A99",
  g600: "#4A5670",
  g700: "#2D3650",
  g800: "#18223A",

  // Semantic
  ok: "#059669",
  okL: "#ECFDF5",
  okD: "#047857",
  warn: "#D97706",
  warnL: "#FFFBEB",
  warnD: "#B45309",
  err: "#DC2626",
  errL: "#FEF2F2",
  errD: "#B91C1C",
  info: "#2563EB",
  infoL: "#EFF6FF",
  infoD: "#1D4ED8",
};

// ── Shadow System ──
export const SH = {
  xs: "0 1px 2px rgba(7,13,26,.06)",
  sm: "0 1px 4px rgba(7,13,26,.07), 0 2px 8px rgba(7,13,26,.04)",
  md: "0 4px 12px rgba(7,13,26,.09), 0 2px 6px rgba(7,13,26,.05)",
  lg: "0 8px 24px rgba(7,13,26,.11), 0 4px 10px rgba(7,13,26,.06)",
  xl: "0 20px 48px rgba(7,13,26,.14), 0 8px 20px rgba(7,13,26,.08)",
  modal: "0 32px 80px rgba(7,13,26,.20), 0 12px 32px rgba(7,13,26,.10)",
  gold: "0 4px 20px rgba(201,169,110,.30)",
  inset: "inset 0 1px 0 rgba(255,255,255,.8), inset 0 -1px 0 rgba(7,13,26,.04)",
};

// ── Avatar ──
function getLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function Av({ ini, photo, size = 32, color = C.gold }: { ini: string; photo?: string; size?: number; color?: string }) {
  if (photo) {
    return (
      <div style={{
        width: size, height: size, borderRadius: "50%", overflow: "hidden",
        flexShrink: 0, boxShadow: `0 2px 8px rgba(0,0,0,0.18)`,
        border: "2px solid rgba(255,255,255,0.15)",
      }}>
        <img src={photo} alt={ini} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    );
  }
  const textColor = getLuminance(color) > 0.55 ? C.navy : "#fff";
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: `linear-gradient(145deg,${color} 0%,${color}CC 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: textColor, fontSize: size * 0.37, fontWeight: 700, flexShrink: 0,
        boxShadow: `0 2px 8px ${color}40, inset 0 1px 0 rgba(255,255,255,.25)`,
        fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.01em",
      }}
    >
      {ini}
    </div>
  );
}

// ── Badge ──
type BdgVariant = "default" | "gold" | "success" | "warning" | "danger" | "info" | "navy";
const BDG_VARIANTS: Record<BdgVariant, { bg: string; c: string; border: string }> = {
  default: { bg: C.g100, c: C.g600, border: `${C.g200}` },
  gold: { bg: `${C.goldPale}`, c: C.goldD, border: `${C.gold}40` },
  success: { bg: "#ECFDF5", c: "#065F46", border: "#A7F3D0" },
  warning: { bg: "#FFFBEB", c: "#92400E", border: "#FDE68A" },
  danger: { bg: "#FEF2F2", c: "#991B1B", border: "#FECACA" },
  info: { bg: "#EFF6FF", c: "#1E40AF", border: "#BFDBFE" },
  navy: { bg: `${C.navy}`, c: "#fff", border: "transparent" },
};

export function Bdg({ children, v = "default", style = {} }: { children: ReactNode; v?: BdgVariant; style?: CSSProperties }) {
  const m = BDG_VARIANTS[v];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 9px",
      borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: m.bg, color: m.c, letterSpacing: ".04em", textTransform: "uppercase",
      border: `1px solid ${m.border}`, ...style,
    }}>
      {children}
    </span>
  );
}

// ── Button ──
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "navy" | "outline";
type BtnSize = "sm" | "md" | "lg";

const BTN_BASE: CSSProperties = {
  border: "none", cursor: "pointer", borderRadius: 10,
  fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
  display: "inline-flex", alignItems: "center", gap: 7,
  transition: "all .18s cubic-bezier(.4,0,.2,1)",
  letterSpacing: ".01em", position: "relative",
};

const BTN_VARIANTS: Record<BtnVariant, CSSProperties> = {
  primary: {
    background: `linear-gradient(145deg,${C.gold} 0%,${C.goldD} 100%)`,
    color: "#fff",
    boxShadow: `${SH.sm}, ${SH.gold}`,
  },
  secondary: {
    background: C.w,
    color: C.g700,
    border: `1px solid ${C.g200}`,
    boxShadow: SH.xs,
  },
  outline: {
    background: "transparent",
    color: C.g600,
    border: `1px solid ${C.g300}`,
  },
  ghost: { background: "transparent", color: C.g500 },
  danger: {
    background: "#FEF2F2",
    color: "#DC2626",
    border: `1px solid #FECACA`,
  },
  navy: {
    background: `linear-gradient(145deg,${C.navyM} 0%,${C.navy} 100%)`,
    color: "#fff",
    boxShadow: SH.sm,
  },
};

const BTN_SIZES: Record<BtnSize, CSSProperties> = {
  sm: { padding: "6px 14px", fontSize: 12 },
  md: { padding: "9px 20px", fontSize: 13 },
  lg: { padding: "13px 28px", fontSize: 14 },
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
  const [hov, setHov] = useState(false);
  const baseStyle: CSSProperties = {
    ...BTN_BASE,
    ...BTN_SIZES[sz],
    ...BTN_VARIANTS[v],
    opacity: disabled ? 0.45 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    transform: hov && !disabled ? "translateY(-1px)" : "translateY(0)",
    ...style,
  };

  if (hov && !disabled) {
    if (v === "primary") baseStyle.boxShadow = `${SH.md}, 0 8px 28px rgba(201,169,110,.35)`;
    if (v === "secondary") baseStyle.boxShadow = SH.sm;
    if (v === "navy") baseStyle.boxShadow = SH.md;
    if (v === "danger") baseStyle.background = "#FEE2E2";
  }

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-testid={testId}
      style={baseStyle}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </button>
  );
}

// ── Input / Select / Textarea ──
export function Inp({
  label, value, onChange, type = "text", ph, style = {}, ta, opts, autoComplete,
}: {
  label?: string; value: string; onChange: (v: string) => void;
  type?: string; ph?: string; style?: CSSProperties; ta?: boolean;
  opts?: { v: string; l: string }[]; autoComplete?: string;
}) {
  const [focused, setFocused] = useState(false);

  const is: CSSProperties = {
    width: "100%", padding: "10px 14px",
    border: `1.5px solid ${focused ? C.gold : C.g200}`,
    borderRadius: 10, fontSize: 13.5, fontFamily: "'DM Sans', sans-serif",
    color: C.g700, backgroundColor: focused ? "#FEFCF8" : C.w,
    outline: "none", transition: "all .18s",
    boxShadow: focused ? `0 0 0 3px ${C.gold}18` : "none",
    ...style,
  };

  return (
    <div style={{ marginBottom: 18 }}>
      {label && (
        <label style={{
          display: "block", fontSize: 11.5, fontWeight: 700, color: focused ? C.goldD : C.g500,
          marginBottom: 6, textTransform: "uppercase", letterSpacing: ".07em", transition: "color .18s",
        }}>
          {label}
        </label>
      )}
      {opts ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ ...is, cursor: "pointer", appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7A99' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
            paddingRight: 36,
          }}
        >
          {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      ) : ta ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={3}
          style={{ ...is, resize: "vertical" }}
        />
      ) : (
        <input
          type={type} value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={ph}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={is}
        />
      )}
    </div>
  );
}

// ── Modal ──
export function Modal({ open, onClose, title, children, w = 540 }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; w?: number;
}) {
  const isMobile = useIsMobile();
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: isMobile ? 12 : 20,
      }}
      onClick={onClose}
    >
      <div style={{
        position: "fixed", inset: 0,
        background: "rgba(7,13,26,.65)", backdropFilter: "blur(8px)",
      }} />
      <div
        className="scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.w, borderRadius: isMobile ? 16 : 20, width: "100%", maxWidth: w,
          maxHeight: isMobile ? "92vh" : "88vh", overflow: "auto", position: "relative",
          boxShadow: SH.modal,
          border: `1px solid ${C.g100}`,
        }}
      >
        <div style={{
          padding: isMobile ? "16px 18px" : "22px 28px",
          borderBottom: `1px solid ${C.g100}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, background: C.w, zIndex: 1,
          borderRadius: isMobile ? "16px 16px 0 0" : "20px 20px 0 0",
        }}>
          <div>
            <h3 style={{
              fontSize: 17, fontWeight: 700, color: C.navy,
              fontFamily: "'Playfair Display', serif", letterSpacing: ".01em",
            }}>{title}</h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: C.g100, border: "none", cursor: "pointer", color: C.g400,
              display: "flex", borderRadius: 8, padding: 6, transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.g200; e.currentTarget.style.color = C.g600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.g100; e.currentTarget.style.color = C.g400; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: isMobile ? "16px 18px" : "24px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ──
export function Empty({ icon, title, desc, action }: { icon: ReactNode; title: string; desc: string; action?: ReactNode }) {
  return (
    <div style={{ textAlign: "center", padding: "72px 20px" }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: `linear-gradient(145deg,${C.goldPale},${C.g50})`,
        border: `1px solid ${C.gold}25`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", color: C.gold,
        boxShadow: `0 4px 16px ${C.gold}15`,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 8, fontFamily: "'Playfair Display',serif" }}>{title}</h3>
      <p style={{ fontSize: 13, color: C.g400, maxWidth: 280, margin: "0 auto 24px", lineHeight: 1.6 }}>{desc}</p>
      {action}
    </div>
  );
}

// ── Progress Bar ──
export function PBar({ value, h = 6, color = C.gold }: { value: number; h?: number; color?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div style={{
      height: h, borderRadius: h, background: `${color}18`,
      overflow: "hidden", width: "100%", position: "relative",
    }}>
      <div style={{
        height: "100%", width: `${pct}%`, borderRadius: h,
        background: `linear-gradient(90deg,${color}CC,${color})`,
        transition: "width .5s cubic-bezier(.4,0,.2,1)",
        position: "relative",
      }}>
        {pct > 8 && (
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: 2,
            borderRadius: h, background: "rgba(255,255,255,.6)",
          }} />
        )}
      </div>
    </div>
  );
}

// ── Tabs ──
export function Tabs({ tabs, active, onChange }: {
  tabs: { k: string; l: string; icon?: ReactNode }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div style={{
      display: "flex", gap: 2, background: C.g100,
      borderRadius: 12, padding: 3,
      border: `1px solid ${C.g200}`,
    }}>
      {tabs.map((t) => (
        <button
          key={t.k}
          onClick={() => onChange(t.k)}
          style={{
            padding: "7px 16px", border: "none", borderRadius: 10,
            fontSize: 12.5, fontWeight: 600,
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            transition: "all .18s cubic-bezier(.4,0,.2,1)",
            background: active === t.k ? C.w : "transparent",
            color: active === t.k ? C.navy : C.g400,
            boxShadow: active === t.k ? SH.sm : "none",
            display: "flex", alignItems: "center", gap: 6,
            letterSpacing: ".01em",
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
    <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
      <div style={{
        width: 34, height: 34,
        background: `linear-gradient(145deg,${C.gold} 0%,${C.goldD} 100%)`,
        borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: `0 3px 12px ${C.gold}55, inset 0 1px 0 rgba(255,255,255,.3), inset 0 -1px 0 rgba(0,0,0,.15)`,
        flexShrink: 0,
      }}>
        <span style={{ color: "#fff", fontFamily: "'Playfair Display',serif", fontWeight: 700, fontSize: 18, lineHeight: 1, letterSpacing: "-.01em" }}>H</span>
      </div>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: ".12em", fontFamily: "'DM Sans',sans-serif" }}>HISSADO</div>
        <div style={{ fontSize: 8.5, fontWeight: 600, color: `${C.gold}BB`, letterSpacing: ".2em", textTransform: "uppercase", marginTop: 3, fontFamily: "'DM Sans',sans-serif" }}>CLIENT</div>
      </div>
    </div>
  );
}

// ── File Icon ──
export function FileIcon({ type, size = 40 }: { type: string; size?: number }) {
  const ft = FILE_TYPES[type] || { c: C.g400, l: type?.toUpperCase() || "FILE" };
  return (
    <div style={{
      width: size, height: size * 1.25, borderRadius: 8,
      background: `${ft.c}10`, border: `1.5px solid ${ft.c}22`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      boxShadow: `0 2px 6px ${ft.c}15`,
    }}>
      <span style={{ fontSize: size * 0.24, fontWeight: 800, color: ft.c, textTransform: "uppercase", letterSpacing: "-.01em" }}>{ft.l}</span>
    </div>
  );
}

// ── Status Badge ──
export function StatusBadge({ status }: { status: string }) {
  const sc = STATUS_COLORS[status as TaskStatus] || { bg: C.g100, t: C.g600, a: C.g400 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 11.5, fontWeight: 600,
      background: sc.bg, color: sc.t,
      border: `1px solid ${sc.a}30`,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: sc.a, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ── Priority Badge ──
export function PriorityBadge({ pri }: { pri: string }) {
  const pc = PRIORITY_COLORS[pri as TaskPriority] || { bg: C.g100, t: C.g600, d: C.g400 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 9px", borderRadius: 6, fontSize: 11, fontWeight: 700,
      background: pc.bg, color: pc.t,
      border: `1px solid ${pc.d}25`,
      letterSpacing: ".03em", textTransform: "uppercase",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: pc.d, flexShrink: 0 }} />
      {pri}
    </span>
  );
}

// ── Card ──
export function Card({ children, style = {}, onClick, hoverable = false }: {
  children: ReactNode; style?: CSSProperties; onClick?: () => void; hoverable?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={hoverable ? () => setHov(true) : undefined}
      onMouseLeave={hoverable ? () => setHov(false) : undefined}
      style={{
        background: C.w, borderRadius: 16,
        border: `1px solid ${C.g100}`,
        boxShadow: hov ? SH.md : SH.sm,
        transition: "box-shadow .2s, transform .2s",
        transform: hov && hoverable ? "translateY(-1px)" : "translateY(0)",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Section Header ──
export function SectionHeader({ title, action, sub }: { title: string; action?: ReactNode; sub?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", letterSpacing: ".01em", margin: 0 }}>{title}</h3>
        {sub && <p style={{ fontSize: 12, color: C.g400, margin: "3px 0 0", fontWeight: 400 }}>{sub}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
