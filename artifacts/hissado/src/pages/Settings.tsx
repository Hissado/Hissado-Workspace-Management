import { useState, useRef, useCallback } from "react";
import { C, Av, Btn, Inp } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@/lib/data";
import AdminPanel from "@/pages/AdminPanel";

interface SettingsProps {
  currentUser: User;
  onUpdateUser: (u: Partial<User>) => void;
}

// ── Image processing: crop to square and resize to 300×300 JPEG ──
function processImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("File too large (max 5 MB)"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 300;
        const canvas = document.createElement("canvas");
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext("2d")!;
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;
        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, SIZE, SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => reject(new Error("Could not load image"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

// ── PhotoUploader ──
function PhotoUploader({
  user,
  onPhotoChange,
}: {
  user: User;
  onPhotoChange: (photo: string | undefined) => void;
}) {
  const { t } = useI18n();
  const [processing, setProcessing] = useState(false);
  const [hover, setHover] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setError("");
    setProcessing(true);
    try {
      const dataUrl = await processImage(file);
      onPhotoChange(dataUrl);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setProcessing(false);
    }
  }, [onPhotoChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) handleFile(file);
  }, [handleFile]);

  const SIZE = 88;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
      {/* Clickable avatar with camera overlay */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div
          onClick={() => !processing && inputRef.current?.click()}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            width: SIZE, height: SIZE, borderRadius: "50%",
            cursor: processing ? "wait" : "pointer",
            position: "relative", overflow: "hidden",
            boxShadow: hover ? `0 0 0 3px ${C.gold}60` : `0 2px 10px rgba(0,0,0,0.1)`,
            transition: "box-shadow 0.2s",
          }}
        >
          <Av ini={user.av} photo={user.photo} size={SIZE} color={C.gold} />

          {/* Overlay */}
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            background: processing
              ? "rgba(0,0,0,0.45)"
              : hover
              ? "rgba(0,0,0,0.38)"
              : "transparent",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}>
            {processing ? (
              <div style={{
                width: 20, height: 20, border: `2.5px solid rgba(255,255,255,.3)`,
                borderTop: `2.5px solid #fff`, borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
            ) : hover && (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, marginTop: 3, letterSpacing: ".04em" }}>
                  {user.photo ? t.set_photo_change : t.set_photo_upload}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Remove button */}
        {user.photo && !processing && (
          <button
            onClick={() => onPhotoChange(undefined)}
            title={t.set_photo_remove}
            style={{
              position: "absolute", top: -4, right: -4,
              width: 22, height: 22, borderRadius: "50%",
              background: "#EF4444", border: "2px solid #fff",
              color: "#fff", fontSize: 12, fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
            }}
          >
            ×
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleChange}
        />
      </div>

      {/* Info + actions */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{user.name}</div>
        <div style={{ fontSize: 13, color: C.g400, marginTop: 2 }}>{user.email}</div>
        <div style={{ fontSize: 12, color: C.g300, marginTop: 2 }}>{user.dept}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            style={{
              padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.gold}`,
              background: `${C.gold}12`, color: C.goldD, fontSize: 12, fontWeight: 700,
              cursor: processing ? "wait" : "pointer", fontFamily: "inherit",
              transition: "all 0.15s",
            }}
          >
            {processing ? t.set_photo_uploading : user.photo ? t.set_photo_change : t.set_photo_upload}
          </button>
          {user.photo && (
            <button
              onClick={() => onPhotoChange(undefined)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.g200}`,
                background: "transparent", color: C.g500, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {t.set_photo_remove}
            </button>
          )}
        </div>
        {error && <div style={{ fontSize: 11, color: "#EF4444", marginTop: 6 }}>{error}</div>}
        {!error && <div style={{ fontSize: 11, color: C.g300, marginTop: 6 }}>{t.set_photo_hint}</div>}
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function Settings({ currentUser, onUpdateUser }: SettingsProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const isAdmin = currentUser.role === "admin";
  const TABS = [
    { k: "profile", l: t.set_profile },
    { k: "notifications", l: t.set_notifications },
    { k: "appearance", l: t.set_appearance },
    { k: "security", l: t.set_security },
    ...(isAdmin ? [{ k: "admin", l: t.set_admin }] : []),
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

  const handlePhotoChange = (photo: string | undefined) => {
    onUpdateUser({ photo });
  };

  const THEME_OPTS = [
    { k: "light", l: t.set_theme_light },
    { k: "dark", l: t.set_theme_dark },
    { k: "system", l: t.set_theme_system },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      <div style={{ marginBottom: isMobile ? 16 : 28 }}>
        <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.set_title}</h2>
        <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>{t.set_subtitle}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "220px 1fr", gap: isMobile ? 16 : 28 }}>
        {/* Tabs — horizontal scroll on mobile, vertical list on desktop */}
        {isMobile ? (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
            {TABS.map((tb) => (
              <button
                key={tb.k}
                onClick={() => setTab(tb.k)}
                data-testid={`settings-tab-${tb.k}`}
                style={{
                  padding: "8px 16px", borderRadius: 20, flexShrink: 0,
                  cursor: "pointer", fontFamily: "inherit", fontSize: 13,
                  background: tab === tb.k ? C.navy : C.w,
                  color: tab === tb.k ? "#fff" : C.g500,
                  fontWeight: tab === tb.k ? 600 : 400,
                  boxShadow: tab === tb.k ? "none" : `0 1px 3px rgba(0,0,0,.06)`,
                  border: `1px solid ${tab === tb.k ? C.navy : C.g100}`,
                  whiteSpace: "nowrap",
                }}
              >
                {tb.l}
              </button>
            ))}
          </div>
        ) : (
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
        )}

        {/* Content */}
        <div style={{ background: C.w, borderRadius: 16, padding: isMobile ? "20px 16px" : 28, border: `1px solid ${C.g100}` }}>
          {tab === "profile" && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 24 }}>{t.set_profile_info}</h3>
              <PhotoUploader user={currentUser} onPhotoChange={handlePhotoChange} />
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, maxWidth: 520 }}>
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

          {tab === "admin" && isAdmin && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{t.set_admin}</h3>
              <p style={{ fontSize: 13, color: C.g400, marginBottom: 28 }}>
                {t.set_admin_desc}
              </p>
              <AdminPanel />
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
