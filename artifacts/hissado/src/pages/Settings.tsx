import { useState } from "react";
import { C, Av, Btn, Inp } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/lib/data";

interface SettingsProps {
  currentUser: User;
  onUpdateUser: (u: Partial<User>) => void;
}

export default function Settings({ currentUser, onUpdateUser }: SettingsProps) {
  const { t } = useI18n();

  const TABS = [
    { k: "profile", l: t.set_profile },
    { k: "notifications", l: t.set_notifications },
    { k: "appearance", l: t.set_appearance },
    { k: "security", l: t.set_security },
  ];

  const [tab, setTab] = useState("profile");
  const [name, setName] = useState(currentUser.name);
  const [saved, setSaved] = useState(false);
  const [notifTasks, setNotifTasks] = useState(true);
  const [notifChat, setNotifChat] = useState(true);
  const [notifProjects, setNotifProjects] = useState(false);
  const [notifReports, setNotifReports] = useState(false);
  const [theme, setTheme] = useState("dark");

  const saveProfile = () => {
    onUpdateUser({ name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const THEME_OPTS = [
    { k: "light", l: t.set_theme_light },
    { k: "dark", l: t.set_theme_dark },
    { k: "system", l: t.set_theme_system },
  ];

  return (
    <div style={{ padding: "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.set_title}</h2>
        <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>{t.set_subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28 }}>
        {/* Sidebar tabs */}
        <div style={{ background: C.w, borderRadius: 16, padding: "12px", border: `1px solid ${C.g100}`, height: "fit-content" }}>
          {TABS.map((tb) => (
            <button
              key={tb.k}
              onClick={() => setTab(tb.k)}
              data-testid={`settings-tab-${tb.k}`}
              style={{
                width: "100%", padding: "10px 14px", border: "none", borderRadius: 8,
                cursor: "pointer", textAlign: "left", fontFamily: "inherit", fontSize: 13,
                background: tab === tb.k ? `${C.navy}08` : "transparent",
                color: tab === tb.k ? C.navy : C.g500, fontWeight: tab === tb.k ? 600 : 400,
              }}
            >
              {tb.l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: C.w, borderRadius: 16, padding: 28, border: `1px solid ${C.g100}` }}>
          {tab === "profile" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 24 }}>{t.set_profile_info}</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                <Av ini={currentUser.av} size={64} />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{currentUser.name}</div>
                  <div style={{ fontSize: 13, color: C.g400, marginTop: 2 }}>{currentUser.email}</div>
                  <div style={{ fontSize: 12, color: C.g300, marginTop: 2 }}>{currentUser.dept}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 520 }}>
                <Inp label={t.set_full_name} value={name} onChange={setName} ph="John Smith" />
                <Inp label={t.set_email} value={currentUser.email} onChange={() => {}} ph="Email" type="email" />
              </div>
              <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 12 }}>
                <Btn onClick={saveProfile} data-testid="save-profile-btn">{t.set_save}</Btn>
                {saved && <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 600 }}>{t.set_saved}</span>}
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 24 }}>{t.set_notif_prefs}</h3>
              {[
                { k: "tasks", label: t.set_notif_tasks, desc: t.set_notif_tasks_desc, val: notifTasks, set: setNotifTasks },
                { k: "chat", label: t.set_notif_chat, desc: t.set_notif_chat_desc, val: notifChat, set: setNotifChat },
                { k: "projects", label: t.set_notif_projects, desc: t.set_notif_projects_desc, val: notifProjects, set: setNotifProjects },
                { k: "reports", label: t.set_notif_reports, desc: t.set_notif_reports_desc, val: notifReports, set: setNotifReports },
              ].map((item) => (
                <div key={item.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "16px 0", borderBottom: `1px solid ${C.g50}` }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: C.g400, marginTop: 3 }}>{item.desc}</div>
                  </div>
                  <button
                    onClick={() => item.set(!item.val)}
                    data-testid={`toggle-${item.k}`}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", background: item.val ? C.gold : C.g200, position: "relative", transition: "background .2s", flexShrink: 0, marginLeft: 16 }}
                  >
                    <div style={{ position: "absolute", top: 3, left: item.val ? 22 : 3, width: 18, height: 18, borderRadius: "50%", background: C.w, transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "appearance" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 24 }}>{t.set_theme}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, maxWidth: 400 }}>
                {THEME_OPTS.map((th) => (
                  <button
                    key={th.k}
                    onClick={() => setTheme(th.k)}
                    data-testid={`theme-${th.k}`}
                    style={{ padding: "16px 12px", border: `2px solid ${theme === th.k ? C.gold : C.g200}`, borderRadius: 12, cursor: "pointer", background: theme === th.k ? `${C.gold}10` : C.w, fontFamily: "inherit", transition: "all .15s" }}
                  >
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{th.k === "light" ? "☀️" : th.k === "dark" ? "🌙" : "💻"}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: theme === th.k ? C.gold : C.navy }}>{th.l}</div>
                  </button>
                ))}
              </div>
              {theme === "system" && <p style={{ fontSize: 12, color: C.g400, marginTop: 14 }}>{t.set_theme_system_desc}</p>}
            </div>
          )}

          {tab === "security" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 24 }}>{t.set_sec_title}</h3>
              <div style={{ padding: "14px 16px", borderRadius: 10, background: "#F0FDF4", border: "1px solid #A7F3D0", display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20 }}>
                <span style={{ fontSize: 18 }}>🔒</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#065F46" }}>{t.set_sec_protected}</div>
                  <div style={{ fontSize: 12, color: "#047857", marginTop: 2 }}>{t.set_sec_protected_desc}</div>
                </div>
              </div>
              {[
                { title: t.set_change_password, desc: t.set_change_password_desc },
                { title: t.set_2fa, desc: t.set_2fa_desc },
                { title: t.set_sessions, desc: t.set_sessions_desc },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.g50}` }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.navy }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{item.desc}</div>
                  </div>
                  <Btn style={{ background: C.g100, color: C.navy, boxShadow: "none", fontSize: 12, padding: "6px 14px" }} onClick={() => {}}>
                    {t.set_manage}
                  </Btn>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
