import { useState } from "react";
import { C } from "./primitives";
import { useI18n } from "@/lib/i18n";
import type { Notification } from "@/lib/data";

const BellIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;

interface HeaderProps {
  title: string;
  notifications: Notification[];
  onNotifClick: () => void;
  searchQuery: string;
  onSearch: (q: string) => void;
  onLogout?: () => void;
}

export default function Header({ title, notifications, onNotifClick, searchQuery, onSearch, onLogout }: HeaderProps) {
  const { t } = useI18n();
  const unread = notifications.filter((n) => !n.read).length;
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header style={{
      padding: "0 28px", height: 68, borderBottom: `1px solid ${C.g100}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: C.w, flexShrink: 0,
    }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Search */}
        {showSearch ? (
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g300, display: "flex" }}><SearchIcon /></span>
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onBlur={() => { if (!searchQuery) setShowSearch(false); }}
              placeholder={t.search_tasks}
              data-testid="header-search-input"
              style={{
                padding: "8px 12px 8px 34px", border: `1px solid ${C.g200}`,
                borderRadius: 8, fontSize: 13, fontFamily: "inherit",
                outline: "none", background: C.g50, width: 220,
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            data-testid="header-search-btn"
            style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, display: "flex", padding: 8 }}
          >
            <SearchIcon />
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onNotifClick}
          data-testid="header-notif-btn"
          style={{
            position: "relative", background: "none", border: "none",
            cursor: "pointer", color: C.g500, display: "flex", padding: 8, borderRadius: 8,
          }}
        >
          <BellIcon />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 4, right: 4, width: 14, height: 14,
              borderRadius: "50%", background: "#EF4444", color: "#fff",
              fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {unread}
            </span>
          )}
        </button>

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            data-testid="header-logout-btn"
            style={{ background: C.g100, border: "none", cursor: "pointer", color: C.g500, fontSize: 12, fontWeight: 600, padding: "6px 12px", borderRadius: 8, fontFamily: "inherit" }}
          >
            {t.login_signout}
          </button>
        )}
      </div>
    </header>
  );
}
