import { C, Av, Logo } from "./primitives";
import type { Page } from "@/lib/store";
import type { Project } from "@/lib/data";

const HomeIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
const FolderIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
const UsersIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const CalIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const ChartIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const GearIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><line x1="12" y1="1" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="6.34" y2="6.34" /><line x1="17.66" y1="17.66" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="6.34" y2="17.66" /><line x1="17.66" y1="6.34" x2="19.78" y2="4.22" /></svg>;
const ChatIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
const FileIcon2 = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
const ChevRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;
const ChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;

const NAV_ITEMS: { k: Page; icon: React.ReactNode; l: string }[] = [
  { k: "dashboard", icon: <HomeIcon />, l: "Dashboard" },
  { k: "projects", icon: <FolderIcon />, l: "Projects" },
  { k: "tasks", icon: <CheckIcon />, l: "My Tasks" },
  { k: "chat", icon: <ChatIcon />, l: "Messages" },
  { k: "files", icon: <FileIcon2 />, l: "Files" },
  { k: "calendar", icon: <CalIcon />, l: "Calendar" },
  { k: "reports", icon: <ChartIcon />, l: "Reports" },
  { k: "team", icon: <UsersIcon />, l: "Team" },
];

interface SidebarProps {
  page: Page;
  onNavigate: (p: Page) => void;
  projects: Project[];
  collapsed: boolean;
  onToggleCollapse: () => void;
  userRole?: string;
  userName?: string;
  userAv?: string;
  unread?: number;
  onProjectClick?: (p: Project) => void;
}

export default function Sidebar({
  page, onNavigate, projects, collapsed, onToggleCollapse,
  userRole, userName, userAv, unread = 0, onProjectClick,
}: SidebarProps) {
  const isAdmin = userRole === "admin" || userRole === "manager";

  return (
    <aside
      style={{
        width: collapsed ? 64 : 260,
        minHeight: "100vh",
        background: `linear-gradient(180deg,${C.navy} 0%,${C.navyL} 100%)`,
        display: "flex", flexDirection: "column",
        transition: "width .25s", flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,.06)",
      }}
    >
      {/* Logo + collapse */}
      <div style={{
        padding: collapsed ? "20px 12px" : "20px 20px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        minHeight: 68,
      }}>
        {!collapsed && <Logo />}
        <button
          onClick={onToggleCollapse}
          data-testid="sidebar-collapse-btn"
          style={{
            background: "rgba(255,255,255,.06)", border: "none", borderRadius: 8,
            width: 28, height: 28, display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer", color: C.g400, flexShrink: 0,
          }}
        >
          {collapsed ? <ChevRight /> : <ChevLeft />}
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ padding: collapsed ? "12px 8px" : "12px", flex: 1 }}>
        {NAV_ITEMS.map((n) => {
          const active = page === n.k || (n.k === "projects" && page === "pdetail");
          return (
            <button
              key={n.k}
              onClick={() => onNavigate(n.k)}
              data-testid={`nav-${n.k}`}
              style={{
                width: "100%", padding: collapsed ? "10px" : "10px 14px",
                border: "none", borderRadius: 10, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? "rgba(200,164,92,.12)" : "transparent",
                color: active ? C.gold : "rgba(255,255,255,.5)",
                fontSize: 13, fontWeight: active ? 600 : 400,
                fontFamily: "inherit", transition: "all .15s", marginBottom: 2,
                position: "relative",
              }}
            >
              {active && (
                <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 20, borderRadius: 2, background: C.gold }} />
              )}
              <span style={{ position: "relative", display: "flex" }}>
                {n.icon}
                {n.k === "chat" && unread > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -6, width: 14, height: 14, borderRadius: "50%", background: C.err, color: "#fff", fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>
                )}
              </span>
              {!collapsed && <span>{n.l}</span>}
            </button>
          );
        })}

        {/* Active projects list */}
        {!collapsed && projects.filter((p) => p.status === "active").length > 0 && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,.25)", letterSpacing: ".12em", textTransform: "uppercase", padding: "0 14px", marginBottom: 10 }}>
              Projects
            </div>
            {projects.filter((p) => p.status === "active").map((p) => (
              <button
                key={p.id}
                onClick={() => { if (onProjectClick) onProjectClick(p); onNavigate("pdetail"); }}
                data-testid={`sidebar-project-${p.id}`}
                style={{
                  width: "100%", padding: "8px 14px", border: "none", borderRadius: 8,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
                  background: "transparent", color: "rgba(255,255,255,.45)",
                  fontSize: 12, fontFamily: "inherit", textAlign: "left",
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Settings */}
        {isAdmin && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <button
              onClick={() => onNavigate("settings")}
              data-testid="nav-settings"
              style={{
                width: "100%", padding: collapsed ? "10px" : "10px 14px",
                border: "none", borderRadius: 10, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                justifyContent: collapsed ? "center" : "flex-start",
                background: page === "settings" ? "rgba(200,164,92,.12)" : "transparent",
                color: page === "settings" ? C.gold : "rgba(255,255,255,.5)",
                fontSize: 13, fontWeight: page === "settings" ? 600 : 400,
                fontFamily: "inherit",
              }}
            >
              <GearIcon />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>
        )}
      </nav>

      {/* User */}
      {!collapsed && userName && (
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
          <Av ini={userAv || "??"} size={32} color={C.gold} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,.85)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "capitalize" }}>{userRole}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
