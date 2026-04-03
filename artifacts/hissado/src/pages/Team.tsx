import { useState } from "react";
import { C, SH, Av, Btn, Modal, Inp, Bdg, Empty } from "@/components/primitives";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useI18n } from "@/lib/i18n";
import type { User, RoleDef } from "@/lib/data";
import { uid } from "@/lib/data";
import { canInviteMembers, canDeleteUser } from "@/lib/access";
import { useIsMobile } from "@/hooks/use-mobile";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>;
const MailIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>;
const UsersIcon2 = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const SendIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const CheckCircleIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const KeyIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const PhoneIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.75a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;

const FALLBACK_DEPTS = ["Engineering", "Design", "Marketing", "Product", "Operations", "Sales", "Executive", "External"];
const FALLBACK_ROLES: RoleDef[] = [
  { id: "admin",   label: "Admin",   isSystem: true, badgeVariant: "danger" },
  { id: "manager", label: "Manager", isSystem: true, badgeVariant: "gold" },
  { id: "member",  label: "Member",  isSystem: true, badgeVariant: "info" },
  { id: "client",  label: "Client",  isSystem: true, badgeVariant: "default" },
];

function generateTempPassword(): string {
  const words = ["Maple", "River", "Stone", "Cloud", "Tiger", "Eagle", "Swift", "Ember", "Noble", "Crest"];
  const nums = Math.floor(100 + Math.random() * 900);
  const syms = ["!", "@", "#", "$", "&"][Math.floor(Math.random() * 5)];
  return words[Math.floor(Math.random() * words.length)] + nums + syms;
}

interface TeamProps {
  users: User[];
  currentUser: User;
  onAddUser: (u: User) => void;
  onUpdateUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
  deptList?: string[];
  roleDefs?: RoleDef[];
}

export default function Team({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser, deptList, roleDefs }: TeamProps) {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const [deptFilter, setDeptFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [showProfile, setShowProfile] = useState<User | null>(null);
  const [showEdit, setShowEdit] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [inviteDept, setInviteDept] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState<{ name: string; email: string; tempPw: string } | null>(null);
  const [inviteError, setInviteError] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const activeRoleDefs = roleDefs ?? FALLBACK_ROLES;
  const activeDeptList = deptList ?? FALLBACK_DEPTS;

  const ROLE_LABELS_LOCAL: Record<string, string> = lang === "fr"
    ? { admin: "Administrateur", manager: "Responsable", member: "Membre", client: "Client" }
    : { admin: "Admin", manager: "Manager", member: "Member", client: "Client" };

  function roleLabel(roleId: string): string {
    const def = activeRoleDefs.find((r) => r.id === roleId);
    return def ? def.label : (ROLE_LABELS_LOCAL[roleId] ?? roleId);
  }
  function roleBadgeVariant(roleId: string) {
    const def = activeRoleDefs.find((r) => r.id === roleId);
    return def?.badgeVariant ?? "default";
  }

  const filtered = users.filter((u) =>
    (deptFilter === "all" || u.dept === deptFilter) &&
    (roleFilter === "all" || u.role === roleFilter)
  );

  const deptsInUse = [...new Set(users.map((u) => u.dept).filter(Boolean))];
  const rolesInUse = [...new Set(users.map((u) => u.role))];

  const isAdmin = currentUser.role === "admin";

  const openEdit = (u: User) => {
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDept(u.dept || "");
    setEditPhone(u.phone || "");
    setEditStatus(u.status);
    setShowEdit(u);
    setShowProfile(null);
  };

  const saveEdit = () => {
    if (!showEdit || !editName.trim()) return;
    const av = editName.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    onUpdateUser({
      ...showEdit,
      name: editName.trim(),
      email: editEmail.trim().toLowerCase(),
      role: editRole,
      dept: editDept,
      phone: editPhone.trim() || undefined,
      status: editStatus,
      av,
    });
    setShowEdit(null);
  };

  const resetInviteForm = () => {
    setInviteName(""); setInviteEmail(""); setInviteRole("member");
    setInviteDept(activeDeptList[0] ?? ""); setInviteError(""); setInviteSuccess(null);
  };

  const sendInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError(t.team_invite_error_required);
      return;
    }
    if (users.some((u) => u.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError(t.team_invite_error_exists);
      return;
    }

    const tempPassword = generateTempPassword();
    setInviteLoading(true);
    setInviteError("");

    const newUser: User = {
      id: uid(),
      name: inviteName.trim(),
      email: inviteEmail.trim().toLowerCase(),
      av: inviteName.trim().split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
      role: inviteRole,
      dept: inviteDept,
      status: "active",
      password: tempPassword,
      mustChangePassword: true,
      invitedAt: new Date().toISOString(),
      invitedBy: currentUser.name,
    };

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          tempPassword,
          invitedBy: currentUser.name,
          workspaceName: "Hissado Client",
          lang,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Email failed to send");
      }

      onAddUser(newUser);
      setInviteSuccess({ name: newUser.name, email: newUser.email, tempPw: tempPassword });
    } catch (err: any) {
      // Still add user even if email fails — show warning
      onAddUser(newUser);
      setInviteSuccess({ name: newUser.name, email: newUser.email, tempPw: tempPassword });
      setInviteError(t.team_invite_error_email_fn(err.message));
    } finally {
      setInviteLoading(false);
    }
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
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: "flex-start",
        gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 28,
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.team_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, margin: 0, fontWeight: 500 }}>
            {t.team_active_total(activeCount, users.length)}
          </p>
        </div>
        {canInviteMembers(currentUser) && (
          <Btn onClick={() => { resetInviteForm(); setShowInvite(true); }} data-testid="invite-btn" icon={<PlusIcon />} style={isMobile ? { alignSelf: "flex-start" } : {}}>
            {t.team_invite}
          </Btn>
        )}
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        {activeRoleDefs.map((rd) => {
          const count = users.filter((u) => u.role === rd.id).length;
          if (count === 0) return null;
          return (
            <div key={rd.id} style={{
              background: C.w, borderRadius: 12, padding: "10px 16px",
              border: `1.5px solid ${roleFilter === rd.id ? C.gold : C.g100}`,
              boxShadow: SH.xs, display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer", transition: "all .15s",
            }}
              onClick={() => setRoleFilter(roleFilter === rd.id ? "all" : rd.id)}
            >
              <span style={{ fontSize: 18, fontWeight: 800, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{count}</span>
              <Bdg v={rd.badgeVariant}>{rd.label}</Bdg>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{
        display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap",
        background: C.w, borderRadius: 13, padding: isMobile ? "10px 14px" : "12px 16px",
        border: `1px solid ${C.g100}`, boxShadow: SH.xs, alignItems: "center",
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.g400, letterSpacing: ".05em", textTransform: "uppercase" }}>{lang === "fr" ? "Filtres" : "Filter"}</span>
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} style={{ ...selectStyle, flex: isMobile ? 1 : "unset" }}>
          <option value="all">{t.team_all_depts}</option>
          {deptsInUse.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ ...selectStyle, flex: isMobile ? 1 : "unset" }}>
          <option value="all">{t.team_all_roles}</option>
          {rolesInUse.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
        </select>
        {(deptFilter !== "all" || roleFilter !== "all") && (
          <button
            onClick={() => { setDeptFilter("all"); setRoleFilter("all"); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: C.gold, fontWeight: 600, fontFamily: "inherit", padding: "0 6px" }}
          >
            {lang === "fr" ? "Effacer" : "Clear"}
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
                transition: "box-shadow .18s, transform .18s", boxShadow: SH.sm,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.lg; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ position: "relative" }}>
                  <Av ini={u.av} photo={u.photo} size={48} />
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
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                <Bdg v={roleBadgeVariant(u.role)}>{roleLabel(u.role)}</Bdg>
                {u.mustChangePassword && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                    background: "#FFF7ED", color: "#B45309", border: "1px solid #FDE68A",
                  }}>
                    <KeyIcon /> {t.team_pending_login}
                  </span>
                )}
              </div>
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
      <Modal open={showInvite} onClose={() => { setShowInvite(false); resetInviteForm(); }} title={t.team_invite} w={460}>
        {inviteSuccess ? (
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: "#F0FDF4", border: "1.5px solid #BBF7D0",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "#10B981",
            }}>
              <CheckCircleIcon />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 8px" }}>
              {t.team_invite_sent_title}
            </h3>
            <p style={{ fontSize: 13.5, color: C.g500, margin: "0 0 20px", lineHeight: 1.6 }}>
              {t.team_invite_sent_added_fn(inviteSuccess.name, inviteSuccess.email)}
              {!inviteError && t.team_invite_sent_email_sent}
            </p>

            {/* Temp password display */}
            <div style={{
              background: C.g50, border: `1px solid ${C.g200}`,
              borderRadius: 12, padding: "14px 18px", marginBottom: 16, textAlign: "left",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 8 }}>
                {t.team_invite_temp_creds}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: C.g500 }}>{t.team_invite_email_col}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy, fontFamily: "monospace" }}>{inviteSuccess.email}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: C.g500 }}>{t.team_invite_temp_pw_col}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: "monospace", letterSpacing: ".04em" }}>{inviteSuccess.tempPw}</span>
              </div>
            </div>

            {inviteError && (
              <div style={{
                background: "#FFFBEB", border: "1px solid #FDE68A",
                borderRadius: 10, padding: "10px 14px", marginBottom: 16,
                fontSize: 12.5, color: "#92400E", textAlign: "left",
              }}>
                ⚠️ {inviteError}
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => { resetInviteForm(); }} sz="sm" style={{ flex: 1, justifyContent: "center" }} icon={<PlusIcon />}>
                {t.team_invite_another}
              </Btn>
              <button
                onClick={() => { setShowInvite(false); resetInviteForm(); }}
                style={{
                  flex: 1, padding: "9px 16px", border: `1px solid ${C.g200}`,
                  borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  fontFamily: "inherit", background: C.w, color: C.g600,
                }}
              >
                {t.team_invite_done}
              </button>
            </div>
          </div>
        ) : (
          <>
            <Inp label={t.team_full_name} value={inviteName} onChange={setInviteName} ph={t.team_full_name_ph} />
            <Inp label={t.team_email_label} value={inviteEmail} onChange={setInviteEmail} ph={t.team_email_ph} type="email" />
            <Inp
              label={t.team_role}
              value={inviteRole}
              onChange={setInviteRole}
              opts={activeRoleDefs.map((r) => ({ v: r.id, l: r.label }))}
            />
            <Inp
              label={t.team_dept}
              value={inviteDept}
              onChange={setInviteDept}
              opts={activeDeptList.map((d) => ({ v: d, l: d }))}
            />

            {/* Info box */}
            <div style={{
              background: `${C.gold}0A`, border: `1px solid ${C.gold}25`,
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              display: "flex", gap: 8, alignItems: "flex-start",
            }}>
              <div style={{ color: C.gold, flexShrink: 0, marginTop: 1 }}><KeyIcon /></div>
              <p style={{ fontSize: 12.5, color: C.g600, margin: 0, lineHeight: 1.5 }}>
                {t.team_invite_info}
              </p>
            </div>

            {inviteError && (
              <div style={{
                background: C.errL, border: `1px solid #FECACA`,
                borderRadius: 10, padding: "10px 14px", marginBottom: 12,
                fontSize: 13, color: C.errD, fontWeight: 500,
              }}>
                {inviteError}
              </div>
            )}

            <Btn
              onClick={sendInvite}
              data-testid="send-invite-btn"
              sz="lg"
              style={{ width: "100%", justifyContent: "center", opacity: inviteLoading ? .7 : 1 }}
              icon={<SendIcon />}
            >
              {inviteLoading ? t.team_invite_sending : t.team_send_invite}
            </Btn>
          </>
        )}
      </Modal>

      {/* Profile Modal */}
      {showProfile && (
        <Modal open={!!showProfile} onClose={() => setShowProfile(null)} title={t.team_profile} w={420}>
          <div style={{ textAlign: "center", marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.g100}` }}>
            <div style={{ display: "inline-block", position: "relative", marginBottom: 14 }}>
              <Av ini={showProfile.av} photo={showProfile.photo} size={72} />
              <div style={{
                position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: "50%",
                background: showProfile.status === "active" ? "#10B981" : C.g300, border: `2.5px solid ${C.w}`,
              }} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{showProfile.name}</div>
            <div style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{showProfile.dept}</div>
            <div style={{ marginTop: 10, display: "flex", justifyContent: "center", gap: 6, flexWrap: "wrap" }}>
              <Bdg v={roleBadgeVariant(showProfile.role)}>{roleLabel(showProfile.role)}</Bdg>
              {showProfile.mustChangePassword && (
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                  background: "#FFF7ED", color: "#B45309", border: "1px solid #FDE68A",
                }}>
                  {t.team_pending_login}
                </span>
              )}
            </div>
          </div>
          {[
            { l: t.team_email_label, v: showProfile.email },
            { l: t.team_phone_label, v: showProfile.phone },
            { l: t.team_dept_label, v: showProfile.dept },
            { l: t.team_role, v: roleLabel(showProfile.role) },
            { l: t.team_status_label, v: showProfile.status === "active" ? t.team_status_active_label : t.team_status_inactive_label },
            ...(showProfile.invitedBy ? [{ l: t.team_invited_by, v: showProfile.invitedBy }] : []),
          ].map((row) => (
            <div key={row.l} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "12px 0", borderBottom: `1px solid ${C.g50}`, fontSize: 13,
            }}>
              <span style={{ color: C.g400, fontWeight: 500 }}>{row.l}</span>
              <span style={{ fontWeight: 700, color: C.navy }}>{row.v || "—"}</span>
            </div>
          ))}

          {/* Admin-only action zone */}
          {isAdmin && (
            <div style={{ marginTop: 24, paddingTop: 20, borderTop: `1px solid ${C.g100}`, display: "flex", gap: 10 }}>
              <button
                data-testid={`edit-user-btn-${showProfile.id}`}
                onClick={() => openEdit(showProfile)}
                style={{
                  flex: 1, padding: "10px 16px",
                  border: `1.5px solid ${C.g200}`,
                  borderRadius: 10, cursor: "pointer",
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                  backgroundColor: C.w, color: C.navy,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "all .15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.gold; (e.currentTarget as HTMLElement).style.color = C.gold; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = C.g200; (e.currentTarget as HTMLElement).style.color = C.navy; }}
              >
                <EditIcon />
                {t.team_edit_btn}
              </button>
              {canDeleteUser(currentUser, showProfile) && (
                <button
                  data-testid={`delete-user-btn-${showProfile.id}`}
                  onClick={() => setDeleteTarget(showProfile)}
                  style={{
                    flex: 1, padding: "10px 16px",
                    border: `1.5px solid #FECACA`,
                    borderRadius: 10, cursor: "pointer",
                    fontSize: 13, fontWeight: 700,
                    fontFamily: "'DM Sans', sans-serif",
                    backgroundColor: "#FFF5F5", color: C.err,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all .15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = C.errL; (e.currentTarget as HTMLElement).style.borderColor = C.err; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F5"; (e.currentTarget as HTMLElement).style.borderColor = "#FECACA"; }}
                >
                  <TrashIcon />
                  {t.team_delete_btn}
                </button>
              )}
            </div>
          )}
        </Modal>
      )}

      {/* Edit Member Modal */}
      {showEdit && (
        <Modal open={!!showEdit} onClose={() => setShowEdit(null)} title={t.team_edit_title} w={460}>
          <Inp label={t.team_full_name} value={editName} onChange={setEditName} ph={t.team_full_name_ph} />
          <Inp label={t.team_email_label} value={editEmail} onChange={setEditEmail} ph={t.team_email_ph} type="email" />
          <Inp label={t.team_phone_label} value={editPhone} onChange={setEditPhone} ph={t.team_phone_ph} type="tel" />
          <Inp
            label={t.team_role}
            value={editRole}
            onChange={setEditRole}
            opts={activeRoleDefs.map((r) => ({ v: r.id, l: r.label }))}
          />
          <Inp
            label={t.team_dept}
            value={editDept}
            onChange={setEditDept}
            opts={activeDeptList.map((d) => ({ v: d, l: d }))}
          />
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.team_status_label}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["active", "inactive"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setEditStatus(s)}
                  style={{
                    flex: 1, padding: "8px 12px",
                    border: `2px solid ${editStatus === s ? (s === "active" ? C.ok : C.err) : C.g200}`,
                    borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12,
                    fontWeight: editStatus === s ? 700 : 400,
                    background: editStatus === s ? (s === "active" ? `${C.ok}12` : `${C.err}12`) : C.w,
                    color: editStatus === s ? (s === "active" ? C.ok : C.err) : C.g500,
                    transition: "all .15s",
                  }}
                >
                  {s === "active" ? t.team_status_active_label : t.team_status_inactive_label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowEdit(null)}
              style={{ padding: "9px 18px", background: C.g100, color: C.g600, border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
            >
              {lang === "fr" ? "Annuler" : "Cancel"}
            </button>
            <Btn onClick={saveEdit} data-testid="save-edit-btn">
              {lang === "fr" ? "Enregistrer" : "Save Changes"}
            </Btn>
          </div>
        </Modal>
      )}

      {/* Delete User Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t.team_delete_title}
        message={deleteTarget ? t.team_delete_confirm(deleteTarget.name) : ""}
        onConfirm={() => {
          if (deleteTarget) {
            onDeleteUser(deleteTarget.id);
            setDeleteTarget(null);
            setShowProfile(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
