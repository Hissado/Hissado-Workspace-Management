import { useState } from "react";
import { C, Av, Btn, Modal, Inp, Bdg, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/lib/data";
import { uid } from "@/lib/data";
import { canInviteMembers } from "@/lib/access";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const MailIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;

const ROLE_COLORS: Record<string, string> = { admin: C.err, manager: C.gold, member: C.info, client: C.g400 };
const DEPT_LIST = ["Engineering", "Design", "Marketing", "Product", "Operations", "Sales", "Executive", "External"];
const ROLE_LIST: User["role"][] = ["admin", "manager", "member", "client"];

interface TeamProps {
  users: User[];
  currentUser: User;
  onAddUser: (u: User) => void;
}

export default function Team({ users, currentUser, onAddUser }: TeamProps) {
  const { t, lang } = useI18n();
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [showProfile, setShowProfile] = useState<User | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<User["role"]>("member");
  const [inviteDept, setInviteDept] = useState("Engineering");

  const ROLE_LABELS_LOCAL: Record<string, string> = lang === "fr"
    ? { admin: "Administrateur", manager: "Responsable", member: "Membre", client: "Client" }
    : { admin: "Admin", manager: "Manager", member: "Member", client: "Client" };

  const filtered = users.filter((u) =>
    (deptFilter === "all" || u.dept === deptFilter) &&
    (roleFilter === "all" || u.role === roleFilter)
  );

  const departments = [...new Set(users.map((u) => u.dept).filter(Boolean))];
  const roles = [...new Set(users.map((u) => u.role))];

  const sendInvite = () => {
    if (!inviteName || !inviteEmail) return;
    const u: User = {
      id: uid(), name: inviteName, email: inviteEmail,
      av: inviteName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      role: inviteRole, dept: inviteDept, status: "active",
    };
    onAddUser(u);
    setShowInvite(false);
    setInviteName(""); setInviteEmail("");
  };

  return (
    <div style={{ padding: "32px 32px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{t.team_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{t.team_active(users.filter((u) => u.status === "active").length)}</p>
        </div>
        {canInviteMembers(currentUser) && (
          <Btn onClick={() => setShowInvite(true)} data-testid="invite-btn">
            <PlusIcon /> {t.team_invite}
          </Btn>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: C.w, cursor: "pointer", outline: "none" }}>
          <option value="all">{t.team_all_depts}</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", background: C.w, cursor: "pointer", outline: "none" }}>
          <option value="all">{t.team_all_roles}</option>
          {roles.map((r) => <option key={r} value={r}>{ROLE_LABELS_LOCAL[r] || r}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <Empty icon="👥" title={t.team_no_members} desc={t.team_no_members_desc} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {filtered.map((u) => (
            <div
              key={u.id}
              onClick={() => setShowProfile(u)}
              data-testid={`team-member-${u.id}`}
              style={{ background: C.w, borderRadius: 16, padding: "20px", border: `1px solid ${C.g100}`, cursor: "pointer", transition: "box-shadow .15s, transform .15s", boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <Av ini={u.av} size={44} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: C.g400 }}>{u.dept}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 10 }}>
                <Bdg v={u.role === "admin" ? "danger" : u.role === "manager" ? "gold" : "info"}>{ROLE_LABELS_LOCAL[u.role] || u.role}</Bdg>
                {u.dept && <Bdg>{u.dept}</Bdg>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.g400 }}>
                <MailIcon />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
              </div>
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: u.status === "active" ? "#22C55E" : C.g300 }} />
                <span style={{ fontSize: 11, color: u.status === "active" ? "#22C55E" : C.g400, fontWeight: 600 }}>
                  {u.status === "active" ? (lang === "fr" ? "Actif" : "Active") : (lang === "fr" ? "Inactif" : "Inactive")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title={t.team_invite}>
        <Inp label={t.team_full_name} value={inviteName} onChange={setInviteName} ph={t.team_full_name_ph} />
        <Inp label="Email" value={inviteEmail} onChange={setInviteEmail} ph={t.team_email_ph} type="email" />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.team_role}</label>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as User["role"])} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {ROLE_LIST.map((r) => <option key={r} value={r}>{ROLE_LABELS_LOCAL[r] || r}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.team_dept}</label>
          <select value={inviteDept} onChange={(e) => setInviteDept(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {DEPT_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <Btn onClick={sendInvite} data-testid="send-invite-btn" style={{ width: "100%", justifyContent: "center" }}>
          {t.team_send_invite}
        </Btn>
      </Modal>

      {/* Profile Modal */}
      {showProfile && (
        <Modal open={!!showProfile} onClose={() => setShowProfile(null)} title={t.team_profile}>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Av ini={showProfile.av} size={64} />
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginTop: 12 }}>{showProfile.name}</div>
            <div style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{showProfile.dept}</div>
          </div>
          {[
            { l: t.team_email_label, v: showProfile.email },
            { l: t.team_dept_label, v: showProfile.dept },
            { l: t.team_role, v: ROLE_LABELS_LOCAL[showProfile.role] || showProfile.role },
            { l: t.team_status_label, v: showProfile.status },
          ].map((row) => (
            <div key={row.l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.g50}`, fontSize: 13 }}>
              <span style={{ color: C.g400 }}>{row.l}</span>
              <span style={{ fontWeight: 600, color: C.navy }}>{row.v || "—"}</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
