import { useState } from "react";
import { C, SH, Av, Btn, Modal, Inp, Bdg, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { User } from "@/lib/data";
import { uid } from "@/lib/data";
import { canInviteMembers } from "@/lib/access";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const MailIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const UsersIcon2 = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

const DEPT_LIST = ["Engineering", "Design", "Marketing", "Product", "Operations", "Sales", "Executive", "External"];
const ROLE_LIST: User["role"][] = ["admin", "manager", "member", "client"];

const ROLE_BADGE_VARIANT: Record<string, "danger" | "gold" | "info" | "default"> = {
  admin: "danger", manager: "gold", member: "info", client: "default",
};

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

  const selectStyle = {
    padding: "8px 36px 8px 14px", border: `1px solid ${C.g200}`,
    borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
    background: C.w, cursor: "pointer", outline: "none", color: C.g600,
    fontWeight: 500, appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236B7A99' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat" as const, backgroundPosition: "right 12px center",
    boxShadow: SH.xs,
  };

  const activeCount = users.filter((u) => u.status === "active").length;

  return (
    <div style={{ padding: "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.team_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, margin: 0, fontWeight: 500 }}>
            <span style={{ color: C.g700, fontWeight: 700 }}>{activeCount}</span> active · <span style={{ color: C.g700, fontWeight: 700 }}>{users.length}</span> total
          </p>
        </div>
        {canInviteMembers(currentUser) && (
          <Btn onClick={() => setShowInvite(true)} data-testid="invite-btn" icon={<PlusIcon />}>
            {t.team_invite}
          </Btn>
        )}
      </div>

      {/* Summary strip */}
      <div style={{
        display: "flex", gap: 12, marginBottom: 24,
      }}>
        {Object.entries({ admin: "danger", manager: "gold", member: "info", client: "default" } as const).map(([role, variant]) => {
          const count = users.filter((u) => u.role === role).length;
          if (count === 0) return null;
          return (
            <div key={role} style={{
              background: C.w, borderRadius: 12, padding: "10px 16px",
              border: `1px solid ${C.g100}`, boxShadow: SH.xs,
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer",
              transition: "all .15s",
            }}
              onClick={() => setRoleFilter(roleFilter === role ? "all" : role)}
            >
              <span style={{
                fontSize: 18, fontWeight: 800, color: C.navy,
                fontFamily: "'Playfair Display',serif",
              }}>{count}</span>
              <span style={{ fontSize: 12, color: C.g400, fontWeight: 500, textTransform: "capitalize" }}>
                {ROLE_LABELS_LOCAL[role]}{count !== 1 ? "s" : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 24,
        background: C.w, borderRadius: 13, padding: "12px 16px",
        border: `1px solid ${C.g100}`, boxShadow: SH.xs,
        alignItems: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.g400, letterSpacing: ".05em", textTransform: "uppercase" }}>Filter</span>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={selectStyle}>
          <option value="all">{t.team_all_depts}</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={selectStyle}>
          <option value="all">{t.team_all_roles}</option>
          {roles.map((r) => <option key={r} value={r}>{ROLE_LABELS_LOCAL[r] || r}</option>)}
        </select>
        {(deptFilter !== "all" || roleFilter !== "all") && (
          <button
            onClick={() => { setDeptFilter("all"); setRoleFilter("all"); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.gold, fontWeight: 600, fontFamily: "inherit", padding: "0 6px" }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ background: C.w, borderRadius: 16, boxShadow: SH.sm, border: `1px solid ${C.g100}` }}>
          <Empty icon={<UsersIcon2 />} title={t.team_no_members} desc={t.team_no_members_desc} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {filtered.map((u) => (
            <div
              key={u.id}
              onClick={() => setShowProfile(u)}
              data-testid={`team-member-${u.id}`}
              style={{
                background: C.w, borderRadius: 16, padding: "22px",
                border: `1px solid ${C.g100}`, cursor: "pointer",
                transition: "box-shadow .18s, transform .18s",
                boxShadow: SH.sm,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.lg; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              {/* Avatar + name */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ position: "relative" }}>
                  <Av ini={u.av} size={48} />
                  <div style={{
                    position: "absolute", bottom: 1, right: 1,
                    width: 11, height: 11, borderRadius: "50%",
                    background: u.status === "active" ? "#10B981" : C.g300,
                    border: `2px solid ${C.w}`,
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 2 }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: C.g400, fontWeight: 500 }}>{u.dept || "—"}</div>
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <Bdg v={ROLE_BADGE_VARIANT[u.role] || "default"}>{ROLE_LABELS_LOCAL[u.role] || u.role}</Bdg>
              </div>

              {/* Email */}
              <div style={{
                display: "flex", alignItems: "center", gap: 7,
                fontSize: 12.5, color: C.g500,
                padding: "8px 12px", borderRadius: 8,
                background: C.g50, border: `1px solid ${C.g100}`,
              }}>
                <MailIcon />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title={t.team_invite}>
        <Inp label={t.team_full_name} value={inviteName} onChange={setInviteName} ph={t.team_full_name_ph} />
        <Inp label="Email" value={inviteEmail} onChange={setInviteEmail} ph={t.team_email_ph} type="email" />
        <Inp
          label={t.team_role}
          value={inviteRole}
          onChange={(v) => setInviteRole(v as User["role"])}
          opts={ROLE_LIST.map((r) => ({ v: r, l: ROLE_LABELS_LOCAL[r] || r }))}
        />
        <Inp
          label={t.team_dept}
          value={inviteDept}
          onChange={setInviteDept}
          opts={DEPT_LIST.map((d) => ({ v: d, l: d }))}
        />
        <Btn onClick={sendInvite} data-testid="send-invite-btn" sz="lg" style={{ width: "100%", justifyContent: "center" }}>
          {t.team_send_invite}
        </Btn>
      </Modal>

      {/* Profile Modal */}
      {showProfile && (
        <Modal open={!!showProfile} onClose={() => setShowProfile(null)} title={t.team_profile} w={420}>
          <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.g100}` }}>
            <div style={{ display: "inline-block", position: "relative", marginBottom: 14 }}>
              <Av ini={showProfile.av} size={72} />
              <div style={{
                position: "absolute", bottom: 2, right: 2,
                width: 14, height: 14, borderRadius: "50%",
                background: showProfile.status === "active" ? "#10B981" : C.g300,
                border: `2.5px solid ${C.w}`,
              }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{showProfile.name}</div>
            <div style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{showProfile.dept}</div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
              <Bdg v={ROLE_BADGE_VARIANT[showProfile.role] || "default"}>{ROLE_LABELS_LOCAL[showProfile.role] || showProfile.role}</Bdg>
            </div>
          </div>
          {[
            { l: t.team_email_label, v: showProfile.email },
            { l: t.team_dept_label, v: showProfile.dept },
            { l: t.team_role, v: ROLE_LABELS_LOCAL[showProfile.role] || showProfile.role },
            { l: t.team_status_label, v: showProfile.status },
          ].map((row) => (
            <div key={row.l} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderBottom: `1px solid ${C.g50}`, fontSize: 13,
            }}>
              <span style={{ color: C.g400, fontWeight: 500 }}>{row.l}</span>
              <span style={{ fontWeight: 700, color: C.navy }}>{row.v || "—"}</span>
            </div>
          ))}
        </Modal>
      )}
    </div>
  );
}
