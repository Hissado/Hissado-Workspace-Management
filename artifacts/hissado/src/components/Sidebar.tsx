import { useState } from "react";
import { C, Av, Logo } from "./primitives";
import type { Page } from "@/lib/store";
import type { Project } from "@/lib/data";
import { useI18n, type Lang } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";

const HomeIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const ServiceIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
const FolderIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const CheckIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
const UsersIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const CalIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const ChartIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const GearIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
const ChatIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const FileIcon2 = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const ChevRight = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const ChevLeft = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const GlobeIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>;

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  projects: Project[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: string;
  userName?: string;
  userAv?: string;
  userPhoto?: string;
  unread?: number;
  onProjectClick?: (p: Project) => void;
  permissions?: Set<string>;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

function NavItem({
  k, icon, label, active, collapsed, onClick, badge,
}: {
  k: string; icon: React.ReactNode; label: string; active: boolean;
  collapsed: boolean; onClick: () => void; badge?: number;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      data-testid={`nav-${k}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        padding: collapsed ? "10px 0" : "9px 14px",
        border: "none", borderRadius: 10, cursor: "pointer",
        display: "flex", alignItems: "center",
        gap: 11,
        justifyContent: collapsed ? "center" : "flex-start",
        background: active
          ? `linear-gradient(90deg,${C.gold}22 0%,${C.gold}08 100%)`
          : hov ? "rgba(255,255,255,.05)" : "transparent",
        color: active ? C.goldL : hov ? "rgba(255,255,255,.75)" : "rgba(255,255,255,.42)",
        fontSize: 13, fontWeight: active ? 600 : 400,
        fontFamily: "'DM Sans', sans-serif",
        transition: "all .15s cubic-bezier(.4,0,.2,1)",
        marginBottom: 2, position: "relative",
        letterSpacing: ".01em",
      }}
    >
      {active && (
        <div style={{
          position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
          width: 3, height: 18, borderRadius: "0 3px 3px 0",
          background: `linear-gradient(180deg,${C.gold},${C.goldD})`,
          boxShadow: `0 0 8px ${C.gold}60`,
        }} />
      )}
      <span style={{ position: "relative", display: "flex", flexShrink: 0 }}>
        {icon}
        {badge && badge > 0 ? (
          <span style={{
            position: "absolute", top: -5, right: -7, width: 15, height: 15,
            borderRadius: "50%", background: "#EF4444", color: "#fff",
            fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            border: `2px solid ${C.navy}`,
          }}>{badge > 9 ? "9+" : badge}</span>
        ) : null}
      </span>
      {!collapsed && <span style={{ flex: 1, textAlign: "left" }}>{label}</span>}
    </button>
  );
}

const NAV_PERM: Partial<Record<Page, string>> = {
  dashboard: "view_dashboard",
  projects: "view_projects",
  tasks: "view_tasks",
  chat: "view_chat",
  files: "view_files",
  calendar: "view_calendar",
  reports: "view_reports",
  team: "view_team",
  services: undefined,
};

const XIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const BuildingIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><rect x="9" y="12" width="6" height="9"/><circle cx="5" cy="20" r="0"/><path d="M9 22v-6h6v6"/><path d="M21 22H3"/><path d="M9 12h6"/></svg>;

export default function Sidebar({
  page, onNavigate, projects, collapsed, onToggleCollapse,
  userRole, userName, userAv, userPhoto, unread = 0, onProjectClick, permissions,
  mobileOpen = false, onMobileClose,
}: SidebarProps) {
  const { t, lang, setLang } = useI18n();
  const [langHov, setLangHov] = useState(false);
  const isMobile = useIsMobile();
  const isAdmin = userRole === "admin" || userRole === "manager";
  const isCollapsed = !isMobile && collapsed;

  const ALL_NAV: { k: Page; icon: React.ReactNode; l: string; badge?: number; adminOnly?: boolean }[] = [
    { k: "dashboard", icon: <HomeIcon />, l: t.nav_dashboard },
    { k: "services", icon: <ServiceIcon />, l: t.nav_services },
    { k: "projects", icon: <FolderIcon />, l: t.nav_projects },
    { k: "chat", icon: <ChatIcon />, l: t.nav_chat, badge: unread },
    { k: "tasks", icon: <CheckIcon />, l: t.nav_tasks },
    { k: "files", icon: <FileIcon2 />, l: t.nav_files },
    { k: "calendar", icon: <CalIcon />, l: t.nav_calendar },
    { k: "reports", icon: <ChartIcon />, l: t.nav_reports },
    { k: "team", icon: <UsersIcon />, l: t.nav_team },
    { k: "clients", icon: <BuildingIcon />, l: t.nav_clients, adminOnly: true },
  ];

  const NAV_ITEMS = ALL_NAV.filter((n) => {
    if (n.adminOnly && !isAdmin) return false;
    if (!permissions) return true;
    const perm = NAV_PERM[n.k as keyof typeof NAV_PERM];
    return !perm || permissions.has(perm);
  });

  const nextLang: Lang = lang === "en" ? "fr" : "en";

  return (
    <aside style={{
      ...(isMobile ? {
        position: "fixed" as const, top: 0, left: 0, bottom: 0, zIndex: 1050,
        width: 272, height: "100dvh",
        transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
        overflowY: "auto" as const,
        transition: "transform .28s cubic-bezier(.4,0,.2,1)",
      } : {
        position: "relative" as const,
        width: isCollapsed ? 64 : 256,
        minHeight: "100vh",
        transition: "width .25s cubic-bezier(.4,0,.2,1)",
      }),
      background: `linear-gradient(180deg,${C.navy} 0%,${C.navyD} 100%)`,
      display: "flex", flexDirection: "column",
      flexShrink: 0,
      borderRight: "1px solid rgba(255,255,255,.04)",
    }}>
      {/* Subtle grid pattern overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden",
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,.025) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
        maskImage: "linear-gradient(180deg, transparent, rgba(0,0,0,.5) 40%, rgba(0,0,0,.5) 60%, transparent)",
      }} />

      {/* Logo + collapse */}
      <div style={{
        padding: isCollapsed ? "18px 0" : "18px 18px",
        borderBottom: "1px solid rgba(255,255,255,.05)",
        display: "flex", alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        minHeight: 68, position: "relative",
      }}>
        {!isCollapsed && <Logo />}
        {isMobile ? (
          <button
            onClick={onMobileClose}
            data-testid="sidebar-close-btn"
            style={{
              background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 8, width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,.5)", flexShrink: 0,
              transition: "all .15s",
            }}
          >
            <XIcon />
          </button>
        ) : (
          <button
            onClick={onToggleCollapse}
            data-testid="sidebar-collapse-btn"
            style={{
              background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.06)",
              borderRadius: 8, width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,.3)", flexShrink: 0,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}18`; e.currentTarget.style.color = C.goldL; e.currentTarget.style.borderColor = `${C.gold}30`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.3)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.06)"; }}
          >
            {isCollapsed ? <ChevRight /> : <ChevLeft />}
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ padding: isCollapsed ? "12px 8px" : "12px 10px", flex: 1, position: "relative" }}>
        {NAV_ITEMS.map((n) => {
          const active = page === n.k
            || (n.k === "projects" && page === "pdetail")
            || (n.k === "services" && page === "sdetail");
          return (
            <NavItem
              key={n.k}
              k={n.k}
              icon={n.icon}
              label={n.l}
              active={active}
              collapsed={isCollapsed}
              onClick={() => onNavigate(n.k)}
              badge={n.badge}
            />
          );
        })}

        {/* Active projects */}
        {!isCollapsed && projects.filter((p) => p.status === "active").length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,.05)" }}>
            <div style={{
              fontSize: 9.5, fontWeight: 800, color: "rgba(255,255,255,.2)",
              letterSpacing: ".16em", textTransform: "uppercase", padding: "0 14px", marginBottom: 8,
            }}>
              {t.nav_projects_label}
            </div>
            {projects.filter((p) => p.status === "active").map((p) => (
              <button
                key={p.id}
                onClick={() => { if (onProjectClick) onProjectClick(p); onNavigate("pdetail"); }}
                data-testid={`sidebar-project-${p.id}`}
                style={{
                  width: "100%", padding: "7px 14px", border: "none", borderRadius: 8,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  background: "transparent",
                  color: "rgba(255,255,255,.38)",
                  fontSize: 12, fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                  transition: "all .12s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,.05)"; e.currentTarget.style.color = "rgba(255,255,255,.65)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,.38)"; }}
              >
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: p.color, flexShrink: 0,
                  boxShadow: `0 0 6px ${p.color}80`,
                }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Settings */}
        {isAdmin && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.05)" }}>
            <NavItem
              k="settings"
              icon={<GearIcon />}
              label={t.nav_settings}
              active={page === "settings"}
              collapsed={isCollapsed}
              onClick={() => onNavigate("settings")}
            />
          </div>
        )}
      </nav>

      {/* Bottom: Language + User */}
      <div style={{
        padding: isCollapsed ? "12px 8px" : "12px 14px",
        borderTop: "1px solid rgba(255,255,255,.05)",
        position: "relative",
      }}>
        {/* Language toggle */}
        <button
          onClick={() => setLang(nextLang)}
          data-testid="lang-toggle-btn"
          title={lang === "en" ? "Passer en français" : "Switch to English"}
          onMouseEnter={() => setLangHov(true)}
          onMouseLeave={() => setLangHov(false)}
          style={{
            width: "100%",
            marginBottom: isCollapsed ? 8 : 12,
            padding: isCollapsed ? 10 : "7px 12px",
            border: `1px solid ${langHov ? `${C.gold}35` : "rgba(255,255,255,.08)"}`,
            borderRadius: 9, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            justifyContent: isCollapsed ? "center" : "flex-start",
            background: langHov ? `${C.gold}12` : "rgba(255,255,255,.03)",
            color: langHov ? C.goldL : "rgba(255,255,255,.38)",
            fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            transition: "all .15s",
          }}
        >
          <GlobeIcon />
          {!isCollapsed && (
            <span>
              {lang === "en" ? (
                <><span style={{ fontWeight: 800, color: C.goldL }}>EN</span><span style={{ opacity: 0.35 }}> / FR</span></>
              ) : (
                <><span style={{ opacity: 0.35 }}>EN / </span><span style={{ fontWeight: 800, color: C.goldL }}>FR</span></>
              )}
            </span>
          )}
        </button>

        {/* User info */}
        {!isCollapsed && userName && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 10px", borderRadius: 10,
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.06)",
          }}>
            <Av ini={userAv || "??"} photo={userPhoto} size={32} color={C.gold} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,.85)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{userName}</div>
              <div style={{
                fontSize: 10.5, color: "rgba(255,255,255,.3)",
                textTransform: "capitalize", marginTop: 1, letterSpacing: ".02em",
              }}>{userRole}</div>
            </div>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10B981", flexShrink: 0 }} />
          </div>
        )}
        {isCollapsed && userAv && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <Av ini={userAv} photo={userPhoto} size={34} color={C.gold} />
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#10B981", border: `2px solid ${C.navy}` }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
