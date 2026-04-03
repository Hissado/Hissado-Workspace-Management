import { useState, useMemo } from "react";
import { C, SH, Btn, Inp, Modal, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Client, User, Project, Service } from "@/lib/data";
import { uid, fmt } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const SendIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>;
const BuildingIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2" /><path d="M8 9h8M8 13h6M8 17h4" /></svg>;
const UserIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
const FolderIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const LayersIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
const EditIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;
const SearchIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;

const COLOR_PALETTE = ["#5B8DEF", "#6FCF97", "#C9A96E", "#BB6BD9", "#F2994A", "#EF4444", "#14B8A6", "#6366F1", "#EC4899", "#F59E0B"];

interface ClientsPageProps {
  clients: Client[];
  users: User[];
  projects: Project[];
  services: Service[];
  currentUser: User;
  canManage?: boolean;
  onAdd: (c: Client) => void;
  onUpdate: (c: Client) => void;
  onDelete: (id: string) => void;
  onAddUser: (u: User) => void;
  onNavigateToServices?: () => void;
  onNavigateToProjects?: () => void;
  lang?: string;
}

const API_BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") + "/api";

export default function ClientsPage({
  clients, users, projects, services, currentUser, canManage,
  onAdd, onUpdate, onDelete, onAddUser,
  onNavigateToServices, onNavigateToProjects,
}: ClientsPageProps) {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Client | null>(null);
  const [showInvite, setShowInvite] = useState<Client | null>(null);

  // Client form state
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [clientStatus, setClientStatus] = useState<Client["status"]>("active");

  // Invite form state
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteClientId, setInviteClientId] = useState("");
  const [inviteStep, setInviteStep] = useState<"form" | "sending" | "sent" | "error">("form");
  const [inviteError, setInviteError] = useState("");
  const [inviteTempPw, setInviteTempPw] = useState("");

  const filtered = useMemo(() => clients.filter((c) => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.company.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [clients, statusFilter, search]);

  const getStats = (cl: Client) => ({
    projects: projects.filter((p) => p.clientId === cl.id).length,
    services: services.filter((s) => s.clientId === cl.id).length,
    users: users.filter((u) => u.clientId === cl.id).length,
  });

  const globalStats = useMemo(() => ({
    active: clients.filter((c) => c.status === "active").length,
    total: clients.length,
    projects: projects.filter((p) => p.clientId).length,
    services: services.filter((s) => s.clientId).length,
  }), [clients, projects, services]);

  const openCreate = () => {
    setEditing(null);
    setName(""); setCompany(""); setContactEmail(""); setPhone(""); setColor(COLOR_PALETTE[0]); setClientStatus("active");
    setShowModal(true);
  };

  const openEdit = (cl: Client) => {
    setEditing(cl);
    setName(cl.name); setCompany(cl.company); setContactEmail(cl.contactEmail);
    setPhone(cl.phone || ""); setColor(cl.color); setClientStatus(cl.status);
    setShowModal(true);
  };

  const save = () => {
    if (!name.trim()) return;
    if (editing) {
      onUpdate({ ...editing, name: name.trim(), company, contactEmail, phone: phone.trim() || undefined, color, status: clientStatus });
    } else {
      onAdd({ id: uid(), name: name.trim(), company, contactEmail, phone: phone.trim() || undefined, color, status: clientStatus, created: fmt(new Date()) });
    }
    setShowModal(false);
  };

  const openInvite = (cl: Client) => {
    setShowInvite(cl);
    setInviteName(""); setInviteEmail(""); setInviteClientId(cl.id);
    setInviteStep("form"); setInviteError(""); setInviteTempPw("");
  };

  const sendInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim() || !inviteClientId) {
      setInviteError(t.cp_invite_error_required); return;
    }
    if (users.find((u) => u.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError(t.cp_invite_error_exists); return;
    }
    setInviteStep("sending");
    const tempPw = `${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
    const av = inviteName.trim().split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    const newUser: User = {
      id: uid(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: "client",
      av,
      status: "active",
      dept: "External",
      clientId: inviteClientId,
      password: tempPw,
      mustChangePassword: true,
      invitedAt: fmt(new Date()),
      invitedBy: currentUser.id,
    };
    onAddUser(newUser);
    setInviteTempPw(tempPw);

    try {
      await fetch(`${API_BASE}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inviteName.trim(),
          email: inviteEmail.trim(),
          role: "Client",
          tempPassword: tempPw,
          invitedBy: currentUser.name,
          workspaceName: "Hissado Project",
          lang,
        }),
      });
    } catch (_) { /* email failure non-blocking */ }
    setInviteStep("sent");
  };

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", gap: 14, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 4px", letterSpacing: "-.02em" }}>
            {t.cp_title}
          </h1>
          <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>{globalStats.active} {t.cp_active.toLowerCase()} · {globalStats.total} total</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {canManage && (
            <>
              <Btn
                onClick={() => openInvite({ id: "", name: "", company: "", color: "#5B8DEF", contactEmail: "", status: "active", created: "" } as Client)}
                style={{ background: "transparent", border: `1.5px solid ${C.navy}`, color: C.navy, display: "flex", alignItems: "center", gap: 7 }}
              >
                <SendIcon /> {t.cp_invite_btn}
              </Btn>
              <Btn onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <PlusIcon /> {t.cp_new}
              </Btn>
            </>
          )}
        </div>
      </div>

      {/* Stats row */}
      {canManage && (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
          {[
            { label: t.cp_stats_active, value: globalStats.active, color: C.ok, icon: "✓" },
            { label: t.cp_stats_total, value: globalStats.total, color: "#4F7CEC", icon: "⬡" },
            { label: t.cp_stats_projects, value: globalStats.projects, color: C.gold, icon: "◫" },
            { label: t.cp_stats_services, value: globalStats.services, color: "#8B5CF6", icon: "◈" },
          ].map((s, i) => (
            <div key={i} style={{ background: C.w, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.g100}`, boxShadow: SH.xs }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 340 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: C.g400, pointerEvents: "none" }}>
            <SearchIcon />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.cp_search_ph}
            style={{
              width: "100%", padding: "9px 12px 9px 34px", border: `1px solid ${C.g200}`, borderRadius: 10,
              fontSize: 13, fontFamily: "inherit", outline: "none", background: C.w, color: C.navy,
              boxSizing: "border-box",
            }}
          />
        </div>
        <div style={{ display: "flex", background: C.w, border: `1px solid ${C.g100}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {(["all", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: "6px 14px", border: "none", borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: statusFilter === f ? 600 : 400, fontFamily: "inherit",
                background: statusFilter === f ? C.navy : "transparent",
                color: statusFilter === f ? C.w : C.g500, transition: "all .15s",
              }}
            >
              {f === "all" ? t.cp_all_status : f === "active" ? t.cp_active : t.cp_inactive}
            </button>
          ))}
        </div>
      </div>

      {/* Client cards */}
      {filtered.length === 0 ? (
        <Empty
          icon={<BuildingIcon />}
          title={search || statusFilter !== "all" ? t.cp_empty_filter : t.cp_empty}
          desc={t.cp_empty_desc}
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(360px,1fr))", gap: 20 }}>
          {filtered.map((cl) => {
            const stats = getStats(cl);
            const portalUsers = users.filter((u) => u.clientId === cl.id);
            return (
              <div
                key={cl.id}
                className="fade-in"
                style={{
                  background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`,
                  boxShadow: SH.sm, overflow: "hidden", transition: "box-shadow .2s, transform .2s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.md; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {/* Color stripe */}
                <div style={{ height: 5, background: cl.color }} />

                <div style={{ padding: "20px 22px 18px" }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
                      {/* Color avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `${cl.color}18`, border: `2px solid ${cl.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: cl.color }}>
                          {cl.name.charAt(0)}
                        </span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {cl.name}
                        </h3>
                        <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{cl.company}</div>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: cl.status === "active" ? "#D1FAE5" : C.g100,
                      color: cl.status === "active" ? "#065F46" : C.g500,
                      letterSpacing: ".04em", flexShrink: 0,
                    }}>
                      {cl.status === "active" ? t.cp_active.toUpperCase() : t.cp_inactive.toUpperCase()}
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "flex", gap: 16, marginBottom: 16, padding: "12px 0", borderTop: `1px solid ${C.g50}`, borderBottom: `1px solid ${C.g50}` }}>
                    {[
                      { icon: <FolderIcon />, value: stats.projects, label: t.cp_projects },
                      { icon: <LayersIcon />, value: stats.services, label: t.cp_services },
                      { icon: <UserIcon />, value: stats.users, label: t.cp_portal_users },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ color: cl.color }}>{s.icon}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{s.value}</span>
                        <span style={{ fontSize: 11, color: C.g400 }}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Contact + date */}
                  {cl.contactEmail && (
                    <div style={{ fontSize: 12, color: C.g400, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: C.g300 }}>@</span>
                      {cl.contactEmail}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: C.g400, marginBottom: 16 }}>
                    {t.cp_since} {cl.created}
                  </div>

                  {/* Portal users avatars */}
                  {portalUsers.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <div style={{ display: "flex" }}>
                        {portalUsers.slice(0, 4).map((u, i) => (
                          <div
                            key={u.id}
                            style={{
                              width: 28, height: 28, borderRadius: "50%", marginLeft: i === 0 ? 0 : -8,
                              border: `2px solid ${C.w}`, background: cl.color,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: 10, fontWeight: 700, color: "#fff",
                            }}
                          >
                            {u.av}
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 11, color: C.g400 }}>
                        {portalUsers.length} portal {portalUsers.length === 1 ? "user" : "users"}
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  {canManage && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => openInvite(cl)}
                        style={{
                          flex: 1, padding: "8px 12px", border: `1.5px solid ${cl.color}`,
                          borderRadius: 9, cursor: "pointer", fontFamily: "inherit",
                          fontSize: 12, fontWeight: 600, background: `${cl.color}10`, color: cl.color,
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                          transition: "all .15s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${cl.color}20`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = `${cl.color}10`; }}
                      >
                        <SendIcon /> {t.cp_invite_btn}
                      </button>
                      <button
                        onClick={() => openEdit(cl)}
                        style={{
                          width: 34, height: 34, border: `1px solid ${C.g200}`, borderRadius: 9,
                          background: C.w, cursor: "pointer", color: C.g400,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .12s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}10`; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = `${C.gold}40`; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g400; e.currentTarget.style.borderColor = C.g200; }}
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(cl)}
                        style={{
                          width: 34, height: 34, border: `1px solid ${C.g200}`, borderRadius: 9,
                          background: C.w, cursor: "pointer", color: C.g400,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .12s",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.err; e.currentTarget.style.borderColor = "#FECACA"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g400; e.currentTarget.style.borderColor = C.g200; }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Client Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t.client_edit : t.client_new} w={500}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Inp label={t.client_name_label} value={name} onChange={setName} ph={t.client_name_ph} />
          <Inp label={t.client_company_label} value={company} onChange={setCompany} ph={t.client_company_ph} />
          <Inp label={t.client_email_label} value={contactEmail} onChange={setContactEmail} ph={t.client_email_ph} />
          <Inp label={t.client_phone_label} value={phone} onChange={setPhone} ph={t.client_phone_ph} type="tel" />
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.client_color_label}</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer",
                    border: color === c ? `3px solid ${C.navy}` : "3px solid transparent",
                    outline: color === c ? `2px solid ${c}` : "none", outlineOffset: 2, transition: "all .12s",
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.client_status_label}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["active", "inactive"] as Client["status"][]).map((s) => (
                <button
                  key={s}
                  onClick={() => setClientStatus(s)}
                  style={{
                    flex: 1, padding: "8px 12px", border: `2px solid ${clientStatus === s ? (s === "active" ? C.ok : C.err) : C.g200}`,
                    borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: clientStatus === s ? 700 : 400,
                    background: clientStatus === s ? (s === "active" ? `${C.ok}12` : `${C.err}12`) : C.w,
                    color: clientStatus === s ? (s === "active" ? C.ok : C.err) : C.g500, transition: "all .15s",
                  }}
                >
                  {s === "active" ? t.client_status_active : t.client_status_inactive}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button onClick={() => setShowModal(false)} style={{ padding: "9px 18px", background: C.g100, color: C.g600, border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
              {t.cancel}
            </button>
            <Btn onClick={save}>{editing ? t.client_save : t.client_create}</Btn>
          </div>
        </div>
      </Modal>

      {/* Invite Modal */}
      <Modal
        open={showInvite !== null}
        onClose={() => { setShowInvite(null); setInviteStep("form"); }}
        title={t.cp_invite_modal_title}
        w={480}
      >
        {inviteStep === "sent" ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%", background: "#D1FAE5",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: C.ok,
            }}>
              <CheckIcon />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>{t.cp_invite_sent}</h3>
            <p style={{ fontSize: 13, color: C.g400, margin: "0 0 20px" }}>
              {inviteName} ({inviteEmail})
            </p>
            <div style={{
              background: C.g50, borderRadius: 12, padding: "14px 18px",
              border: `1px solid ${C.g100}`, textAlign: "left", marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
                {t.team_invite_temp_creds}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span style={{ color: C.g500 }}>{t.team_invite_email_col}</span>
                <span style={{ fontWeight: 600, color: C.navy }}>{inviteEmail}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ color: C.g500 }}>{t.team_invite_temp_pw_col}</span>
                <span style={{ fontWeight: 700, fontFamily: "monospace", color: C.navy, letterSpacing: ".08em" }}>{inviteTempPw}</span>
              </div>
            </div>
            <button
              onClick={() => { setShowInvite(null); setInviteStep("form"); }}
              style={{
                width: "100%", padding: "10px", background: C.navy, color: C.w,
                border: "none", borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                fontSize: 13, fontWeight: 600,
              }}
            >
              {t.team_invite_done}
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: C.g500, margin: 0, lineHeight: 1.6 }}>{t.cp_invite_modal_desc}</p>
            {inviteError && (
              <div style={{ background: "#FEE2E2", border: `1px solid #FECACA`, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.err }}>
                {inviteError}
              </div>
            )}
            <Inp label={t.cp_invite_name_label} value={inviteName} onChange={setInviteName} ph={t.cp_invite_name_ph} />
            <Inp label={t.cp_invite_email_label} value={inviteEmail} onChange={setInviteEmail} ph={t.cp_invite_email_ph} />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.cp_invite_client_label}</label>
              <select
                value={inviteClientId}
                onChange={(e) => setInviteClientId(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 9,
                  fontSize: 13, fontFamily: "inherit", outline: "none", background: C.w, color: C.navy,
                }}
              >
                <option value="">{t.cp_invite_client_label}…</option>
                {clients.filter((c) => c.status === "active").map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button
                onClick={() => { setShowInvite(null); setInviteStep("form"); }}
                style={{ padding: "9px 18px", background: C.g100, color: C.g600, border: "none", borderRadius: 9, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}
              >
                {t.cancel}
              </button>
              <Btn onClick={sendInvite} disabled={inviteStep === "sending"}>
                {inviteStep === "sending" ? t.cp_invite_sending : <><SendIcon /> {t.cp_invite_send}</>}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      {confirmDelete && (
        <ConfirmDialog
          title={t.client_delete_title}
          message={t.client_delete_msg(confirmDelete.name)}
          confirmLabel={t.delete}
          danger
          onConfirm={() => { onDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
