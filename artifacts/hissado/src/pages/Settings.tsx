import { useState } from "react";
import { C, Av, Btn, Inp, Bdg } from "@/components/primitives";
import type { User } from "@/lib/data";

interface SettingsProps {
  currentUser: User;
  onUpdateUser: (u: Partial<User>) => void;
}

export default function Settings({ currentUser, onUpdateUser }: SettingsProps) {
  const [tab, setTab] = useState<"profile" | "notifications" | "appearance" | "security">("profile");
  const [name, setName] = useState(currentUser.name);
  const [title, setTitle] = useState(currentUser.title || "");
  const [email, setEmail] = useState(currentUser.email);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ tasks: true, chat: true, projects: true, reports: false });
  const [theme, setTheme] = useState("light");

  const save = () => {
    onUpdateUser({ name, email, title });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS = [
    { k: "profile", l: "Profile" },
    { k: "notifications", l: "Notifications" },
    { k: "appearance", l: "Appearance" },
    { k: "security", l: "Security" },
  ] as const;

  return (
    <div className="fade-in" style={{ padding: 28, maxWidth: 840 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>Settings</h2>
        <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>Manage your account and preferences</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 24 }}>
        {/* Tab sidebar */}
        <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, padding: 8, height: "fit-content" }}>
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              data-testid={`settings-tab-${t.k}`}
              style={{
                width: "100%", padding: "10px 14px", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer", textAlign: "left", transition: "all .15s", marginBottom: 2,
                background: tab === t.k ? `${C.gold}12` : "transparent",
                color: tab === t.k ? C.gold : C.g500,
              }}
            >
              {t.l}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, padding: 28 }}>
          {tab === "profile" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Profile Information</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: 16, background: C.g50, borderRadius: 12 }}>
                <Av ini={currentUser.av} size={56} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{currentUser.name}</div>
                  <div style={{ fontSize: 12, color: C.g400, marginTop: 3 }}>{currentUser.email}</div>
                  <div style={{ marginTop: 8 }}>
                    <Bdg v={currentUser.role === "admin" ? "danger" : currentUser.role === "manager" ? "gold" : "info"}>{currentUser.role}</Bdg>
                  </div>
                </div>
              </div>
              <Inp label="Full Name" value={name} onChange={setName} />
              <Inp label="Email" value={email} onChange={setEmail} type="email" />
              <Inp label="Title" value={title} onChange={setTitle} ph="e.g., Senior Designer" />
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Btn onClick={save} data-testid="settings-save-btn">Save Changes</Btn>
                {saved && <span style={{ fontSize: 13, color: C.ok, fontWeight: 600 }}>✓ Saved successfully</span>}
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Notification Preferences</h3>
              {[
                { k: "tasks" as const, l: "Task Updates", d: "Notify me when tasks are assigned or updated" },
                { k: "chat" as const, l: "Messages", d: "Notify me on new messages" },
                { k: "projects" as const, l: "Project Updates", d: "Notify me on project status changes" },
                { k: "reports" as const, l: "Weekly Reports", d: "Receive weekly performance summary" },
              ].map((n) => (
                <div key={n.k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.g50}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{n.l}</div>
                    <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{n.d}</div>
                  </div>
                  <button
                    onClick={() => setNotifs((prev) => ({ ...prev, [n.k]: !prev[n.k] }))}
                    data-testid={`notif-toggle-${n.k}`}
                    style={{ width: 44, height: 24, borderRadius: 12, border: "none", cursor: "pointer", transition: "all .2s", background: notifs[n.k] ? C.gold : C.g200, position: "relative" }}
                  >
                    <div style={{ position: "absolute", top: 2, left: notifs[n.k] ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .2s", boxShadow: "0 1px 3px rgba(0,0,0,.2)" }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === "appearance" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Appearance</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.g500, textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 12 }}>Theme</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {[{ k: "light", l: "Light" }, { k: "dark", l: "Dark" }, { k: "system", l: "System" }].map((t) => (
                    <button
                      key={t.k}
                      onClick={() => setTheme(t.k)}
                      data-testid={`theme-${t.k}`}
                      style={{
                        padding: "10px 20px", border: `2px solid ${theme === t.k ? C.gold : C.g200}`, borderRadius: 10, background: theme === t.k ? `${C.gold}10` : C.w,
                        cursor: "pointer", fontSize: 13, fontWeight: theme === t.k ? 700 : 400, color: theme === t.k ? C.gold : C.g500, fontFamily: "inherit",
                      }}
                    >
                      {t.l}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: C.g400, marginTop: 8 }}>
                  {theme === "system" ? "Follows your device settings" : `Using ${theme} mode`}
                </p>
              </div>
            </div>
          )}

          {tab === "security" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 20 }}>Security</h3>
              <div style={{ padding: "16px 20px", background: `${C.gold}08`, borderRadius: 12, border: `1px solid ${C.gold}20`, marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Account Protected</div>
                <div style={{ fontSize: 12, color: C.g500 }}>Your account is secured with standard authentication.</div>
              </div>
              {[
                { l: "Change Password", d: "Update your login password" },
                { l: "Two-Factor Authentication", d: "Add an extra layer of security" },
                { l: "Active Sessions", d: "Manage your logged-in devices" },
              ].map((s) => (
                <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.g50}` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{s.l}</div>
                    <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{s.d}</div>
                  </div>
                  <Btn v="secondary" sz="sm">Manage</Btn>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
