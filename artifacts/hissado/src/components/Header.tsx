import { useState } from "react";
import { C, SH } from "./primitives";
import { useI18n } from "@/lib/i18n";
import type { Notification } from "@/lib/data";

const BellIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const LogoutIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;

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
  const [searchFocused, setSearchFocused] = useState(false);
  const [bellHov, setBellHov] = useState(false);
  const [logoutHov, setLogoutHov] = useState(false);

  return (
    <header style={{
      padding: "0 32px", height: 68,
      borderBottom: `1px solid ${C.g100}`,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: C.w, flexShrink: 0,
      boxShadow: "0 1px 0 rgba(7,13,26,.04)",
    }}>
      <h1 style={{
        fontSize: 19, fontWeight: 700, color: C.navy,
        fontFamily: "'Playfair Display', serif",
        letterSpacing: "-.01em", margin: 0,
      }}>{title}</h1>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Search */}
        {showSearch ? (
          <div style={{ position: "relative" }}>
            <span style={{
              position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
              color: searchFocused ? C.gold : C.g300, display: "flex", transition: "color .15s",
            }}>
              <SearchIcon />
            </span>
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => { setSearchFocused(false); if (!searchQuery) setShowSearch(false); }}
              placeholder={t.search_tasks}
              data-testid="header-search-input"
              style={{
                padding: "8px 14px 8px 34px",
                border: `1.5px solid ${searchFocused ? C.gold : C.g200}`,
                borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                outline: "none", background: searchFocused ? "#FEFCF8" : C.g50,
                width: 230, transition: "all .18s",
                color: C.g700,
                boxShadow: searchFocused ? `0 0 0 3px ${C.gold}15` : "none",
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            data-testid="header-search-btn"
            style={{
              background: C.g50, border: `1px solid ${C.g100}`,
              borderRadius: 9, cursor: "pointer",
              display: "flex", padding: "8px 14px",
              alignItems: "center", gap: 8,
              fontSize: 12.5, fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500, color: C.g400,
              transition: "all .15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g600; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = C.g50; e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.color = C.g400; }}
          >
            <SearchIcon />
            <span style={{ color: "inherit" }}>{t.search_tasks}</span>
            <span style={{
              background: C.g100, borderRadius: 5, padding: "1px 6px",
              fontSize: 10, fontWeight: 700, color: C.g400, letterSpacing: ".04em",
            }}>⌘K</span>
          </button>
        )}

        {/* Notifications */}
        <button
          onClick={onNotifClick}
          data-testid="header-notif-btn"
          onMouseEnter={() => setBellHov(true)}
          onMouseLeave={() => setBellHov(false)}
          style={{
            position: "relative", background: bellHov ? C.g50 : "transparent",
            border: `1px solid ${bellHov ? C.g200 : "transparent"}`,
            borderRadius: 9, cursor: "pointer",
            color: bellHov ? C.g700 : C.g400,
            display: "flex", padding: "8px 9px",
            transition: "all .15s",
          }}
        >
          <BellIcon />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 5, right: 5, width: 16, height: 16,
              borderRadius: "50%",
              background: `linear-gradient(145deg,#F87171,#EF4444)`,
              color: "#fff", fontSize: 9, fontWeight: 800,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: `2px solid ${C.w}`,
              boxShadow: "0 2px 4px rgba(239,68,68,.4)",
            }}>
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: C.g100, margin: "0 4px" }} />

        {/* Logout */}
        {onLogout && (
          <button
            onClick={onLogout}
            data-testid="header-logout-btn"
            onMouseEnter={() => setLogoutHov(true)}
            onMouseLeave={() => setLogoutHov(false)}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              background: logoutHov ? C.errL : "transparent",
              border: `1px solid ${logoutHov ? "#FECACA" : "transparent"}`,
              borderRadius: 9, cursor: "pointer",
              color: logoutHov ? C.errD : C.g400,
              fontSize: 12.5, fontWeight: 600, padding: "7px 14px",
              fontFamily: "'DM Sans', sans-serif",
              transition: "all .15s",
            }}
          >
            <LogoutIcon />
            {t.login_signout}
          </button>
        )}
      </div>
    </header>
  );
}
