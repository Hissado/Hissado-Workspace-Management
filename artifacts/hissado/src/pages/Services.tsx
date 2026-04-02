import { useState } from "react";
import { C, SH, Av, Btn, Modal, Inp, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Service, ServiceCadence, User, Client } from "@/lib/data";
import { uid, fmt } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const EditIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const LayersIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
const ClockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const UsersIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

const PALETTE = [
  "#5B8DEF", "#6FCF97", "#C9A96E", "#BB6BD9",
  "#F2994A", "#EB5757", "#2F80ED", "#219653",
];

const CADENCE_STYLE: Record<ServiceCadence, { bg: string; t: string; label_en: string }> = {
  weekly:    { bg: "#DBEAFE", t: "#1D4ED8", label_en: "Weekly" },
  monthly:   { bg: "#FEF3C7", t: "#92400E", label_en: "Monthly" },
  quarterly: { bg: "#EDE9FE", t: "#5B21B6", label_en: "Quarterly" },
  annual:    { bg: "#D1FAE5", t: "#065F46", label_en: "Annual" },
};

const STATUS_DOT: Record<string, string> = {
  active: "#22C55E",
  paused: "#F59E0B",
  completed: "#8B5CF6",
};

interface ServicesProps {
  services: Service[];
  users: User[];
  clients?: Client[];
  currentUser: User;
  canManage?: boolean;
  onAdd: (s: Service) => void;
  onUpdate: (s: Service) => void;
  onDelete: (id: string) => void;
}

export default function Services({ services, users, clients, currentUser, canManage, onAdd, onUpdate, onDelete }: ServicesProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

  const [cadenceFilter, setCadenceFilter] = useState<"all" | ServiceCadence>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "completed">("all");
  const [clientFilter, setClientFilter] = useState<string>("all");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Service | null>(null);

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [cadence, setCadence] = useState<ServiceCadence>("monthly");
  const [status, setStatus] = useState<Service["status"]>("active");
  const [color, setColor] = useState(PALETTE[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c]));

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const getCadenceLabel = (c: ServiceCadence) => {
    const map: Record<ServiceCadence, string> = {
      weekly: t.svc_weekly,
      monthly: t.svc_monthly,
      quarterly: t.svc_quarterly,
      annual: t.svc_annual,
    };
    return map[c];
  };

  const getStatusLabel = (s: Service["status"]) => {
    if (s === "active") return t.svc_active;
    if (s === "paused") return t.svc_paused;
    return t.svc_completed;
  };

  const filtered = services.filter((s) => {
    if (cadenceFilter !== "all" && s.cadence !== cadenceFilter) return false;
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (clientFilter !== "all") {
      if (clientFilter === "__none__" && s.clientId) return false;
      if (clientFilter !== "__none__" && s.clientId !== clientFilter) return false;
    }
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    setName(""); setDesc(""); setCadence("monthly"); setStatus("active");
    setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
    setSelectedMembers([currentUser.id]);
    setSelectedClientId(currentUser.clientId ?? "");
    setShowModal(true);
  };

  const openEdit = (sv: Service) => {
    setEditing(sv);
    setName(sv.name); setDesc(sv.desc);
    setCadence(sv.cadence); setStatus(sv.status);
    setColor(sv.color); setSelectedMembers(sv.members);
    setSelectedClientId(sv.clientId ?? "");
    setShowModal(true);
  };

  const save = () => {
    if (!name.trim()) return;
    const clientId = selectedClientId || undefined;
    if (editing) {
      onUpdate({ ...editing, name: name.trim(), desc, cadence, status, color, members: selectedMembers, clientId });
    } else {
      onAdd({
        id: uid(), name: name.trim(), desc, cadence, status, color,
        members: selectedMembers.length > 0 ? selectedMembers : [currentUser.id],
        owner: currentUser.id, clientId, created: fmt(new Date()),
      });
    }
    setShowModal(false);
  };

  const cadenceFilters: ("all" | ServiceCadence)[] = ["all", "weekly", "monthly", "quarterly", "annual"];
  const statusFilters: ("all" | Service["status"])[] = ["all", "active", "paused", "completed"];

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: isMobile ? 20 : 26, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: C.navy, letterSpacing: "-0.01em" }}>
            {t.svc_title}
          </h1>
          <p style={{ margin: "5px 0 0", fontSize: 13, color: "#7A849B" }}>{t.svc_desc}</p>
        </div>
        {canManage && (
          <Btn onClick={openCreate} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <PlusIcon />{t.svc_new}
          </Btn>
        )}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {/* Client filter */}
        {clients && clients.length > 0 && (
          <div style={{ display: "flex", background: C.w, border: `1px solid ${C.g100}`, borderRadius: 10, padding: 3, gap: 2, flexWrap: "wrap" }}>
            <button
              onClick={() => setClientFilter("all")}
              style={{
                padding: "5px 12px", border: "none", borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: clientFilter === "all" ? 600 : 400, fontFamily: "inherit",
                background: clientFilter === "all" ? C.navy : "transparent",
                color: clientFilter === "all" ? C.w : C.g500, transition: "all .15s",
              }}
            >
              {t.client_filter_all}
            </button>
            {clients.map((cl) => (
              <button
                key={cl.id}
                onClick={() => setClientFilter(cl.id)}
                style={{
                  padding: "5px 12px", border: "none", borderRadius: 7, cursor: "pointer",
                  fontSize: 12, fontWeight: clientFilter === cl.id ? 600 : 400, fontFamily: "inherit",
                  background: clientFilter === cl.id ? cl.color : "transparent",
                  color: clientFilter === cl.id ? "#fff" : C.g500, transition: "all .15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: clientFilter === cl.id ? "#ffffff80" : cl.color, flexShrink: 0 }} />
                {cl.name}
              </button>
            ))}
          </div>
        )}
        {/* Cadence filter */}
        <div style={{ display: "flex", background: C.w, border: `1px solid ${C.g100}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {cadenceFilters.map((f) => (
            <button
              key={f}
              onClick={() => setCadenceFilter(f)}
              style={{
                padding: "5px 12px", border: "none", borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: cadenceFilter === f ? 600 : 400,
                fontFamily: "inherit",
                background: cadenceFilter === f ? C.navy : "transparent",
                color: cadenceFilter === f ? C.w : C.g500,
                transition: "all .15s",
              }}
            >
              {f === "all" ? t.svc_filter_all : getCadenceLabel(f as ServiceCadence)}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div style={{ display: "flex", background: C.w, border: `1px solid ${C.g100}`, borderRadius: 10, padding: 3, gap: 2 }}>
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: "5px 12px", border: "none", borderRadius: 7, cursor: "pointer",
                fontSize: 12, fontWeight: statusFilter === f ? 600 : 400,
                fontFamily: "inherit",
                background: statusFilter === f ? C.navy : "transparent",
                color: statusFilter === f ? C.w : C.g500,
                transition: "all .15s",
              }}
            >
              {f === "all" ? t.svc_filter_all : getStatusLabel(f as Service["status"])}
            </button>
          ))}
        </div>
      </div>

      {/* Service cards */}
      {filtered.length === 0 ? (
        <Empty icon={<LayersIcon />} title={t.svc_empty} desc={t.svc_empty_desc} />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(340px, 1fr))",
          gap: isMobile ? 14 : 20,
        }}>
          {filtered.map((sv) => {
            const cadStyle = CADENCE_STYLE[sv.cadence];
            const members = sv.members.map((id) => userMap[id]).filter(Boolean);
            const owner = userMap[sv.owner];

            return (
              <div
                key={sv.id}
                className="fade-in"
                style={{
                  background: C.w,
                  borderRadius: 16,
                  border: `1px solid ${C.g100}`,
                  boxShadow: SH.sm,
                  overflow: "hidden",
                  transition: "box-shadow .2s, transform .2s",
                  cursor: "default",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.md; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {/* Color stripe */}
                <div style={{ height: 4, background: sv.color, flexShrink: 0 }} />

                <div style={{ padding: "20px 22px 18px", flex: 1, display: "flex", flexDirection: "column" }}>
                  {/* Top row: title + action buttons */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Cadence badge + status dot */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 4,
                          padding: "3px 9px", borderRadius: 20,
                          background: cadStyle.bg, color: cadStyle.t,
                          fontSize: 11, fontWeight: 700, letterSpacing: ".04em",
                        }}>
                          <ClockIcon />
                          {getCadenceLabel(sv.cadence)}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#7A849B", fontWeight: 500 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_DOT[sv.status], flexShrink: 0 }} />
                          {getStatusLabel(sv.status)}
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {sv.name}
                      </h3>
                    </div>

                    {canManage && (
                      <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 8 }}>
                        <button
                          onClick={() => openEdit(sv)}
                          style={{
                            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, cursor: "pointer",
                            color: C.g400, transition: "all .12s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}10`; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = `${C.gold}40`; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g400; e.currentTarget.style.borderColor = C.g200; }}
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(sv)}
                          style={{
                            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                            border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, cursor: "pointer",
                            color: C.g400, transition: "all .12s",
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.err; e.currentTarget.style.borderColor = "#FECACA"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g400; e.currentTarget.style.borderColor = C.g200; }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Client badge */}
                  {sv.clientId && clientMap[sv.clientId] && (
                    <div style={{ marginBottom: 8 }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 10.5, fontWeight: 700, padding: "2px 9px", borderRadius: 20,
                        background: `${clientMap[sv.clientId].color}15`,
                        color: clientMap[sv.clientId].color,
                        border: `1px solid ${clientMap[sv.clientId].color}30`,
                        letterSpacing: ".03em",
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: clientMap[sv.clientId].color, flexShrink: 0 }} />
                        {clientMap[sv.clientId].name}
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  {sv.desc && (
                    <p style={{ margin: "0 0 16px", fontSize: 13, color: "#7A849B", lineHeight: 1.55, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {sv.desc}
                    </p>
                  )}

                  {/* Footer: members + owner */}
                  <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    {/* Member avatars */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex" }}>
                        {members.slice(0, 4).map((u, i) => (
                          <div key={u.id} title={u.name} style={{ marginLeft: i === 0 ? 0 : -8, zIndex: 4 - i }}>
                            <Av ini={u.av} photo={u.photo} size={26} />
                          </div>
                        ))}
                        {members.length > 4 && (
                          <div style={{
                            width: 26, height: 26, borderRadius: "50%",
                            background: C.g200, border: `2px solid ${C.w}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 10, fontWeight: 700, color: C.g500, marginLeft: -8,
                          }}>
                            +{members.length - 4}
                          </div>
                        )}
                      </div>
                      {members.length > 0 && (
                        <span style={{ fontSize: 11, color: "#7A849B" }}>
                          <UsersIcon /> {members.length} {t.svc_members_count}
                        </span>
                      )}
                    </div>

                    {/* Owner */}
                    {owner && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Av ini={owner.av} photo={owner.photo} size={20} />
                        <span style={{ fontSize: 11, color: "#7A849B", fontWeight: 500 }}>{owner.name.split(" ")[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? t.svc_edit : t.svc_new}
        w={520}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Inp
            label={t.svc_name}
            value={name}
            onChange={setName}
            ph={t.svc_name_ph}
          />

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.svc_desc_label}</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder={t.svc_desc_ph}
              rows={3}
              style={{
                width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 10,
                fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical",
                boxSizing: "border-box", color: C.navy, background: C.w,
              }}
            />
          </div>

          {/* Cadence selector */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.svc_cadence}</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {(["weekly", "monthly", "quarterly", "annual"] as ServiceCadence[]).map((c) => {
                const cs = CADENCE_STYLE[c];
                return (
                  <button
                    key={c}
                    onClick={() => setCadence(c)}
                    style={{
                      padding: "9px 6px", border: `2px solid ${cadence === c ? cs.t : C.g200}`,
                      borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                      fontSize: 12, fontWeight: cadence === c ? 700 : 400,
                      background: cadence === c ? cs.bg : C.w,
                      color: cadence === c ? cs.t : C.g500,
                      transition: "all .15s",
                    }}
                  >
                    {getCadenceLabel(c)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.svc_status_label}</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["active", "paused", "completed"] as Service["status"][]).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    flex: 1, padding: "8px 6px", border: `2px solid ${status === s ? STATUS_DOT[s] : C.g200}`,
                    borderRadius: 10, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 12, fontWeight: status === s ? 700 : 400,
                    background: status === s ? `${STATUS_DOT[s]}15` : C.w,
                    color: status === s ? STATUS_DOT[s] : C.g500,
                    transition: "all .15s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  }}
                >
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[s] }} />
                  {getStatusLabel(s)}
                </button>
              ))}
            </div>
          </div>

          {/* Client assignment */}
          {clients && clients.length > 0 && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.client_assign_label}</label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                style={{
                  width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 10,
                  fontSize: 13, fontFamily: "inherit", outline: "none", background: C.w, color: C.navy,
                }}
              >
                <option value="">{t.client_assign_ph}</option>
                {clients.map((cl) => (
                  <option key={cl.id} value={cl.id}>{cl.name} — {cl.company}</option>
                ))}
              </select>
            </div>
          )}

          {/* Color picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.svc_color}</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 28, height: 28, borderRadius: "50%", background: c,
                    border: color === c ? `3px solid ${C.navy}` : "3px solid transparent",
                    cursor: "pointer", outline: color === c ? `2px solid ${c}` : "none",
                    outlineOffset: 2, transition: "all .12s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Members */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.svc_members_label}</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto", border: `1px solid ${C.g100}`, borderRadius: 10, padding: 8 }}>
              {users.filter((u) => u.status === "active").map((u) => (
                <label
                  key={u.id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                    padding: "6px 8px", borderRadius: 8,
                    background: selectedMembers.includes(u.id) ? `${C.gold}12` : "transparent",
                    transition: "background .12s",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u.id)}
                    onChange={(e) =>
                      setSelectedMembers(e.target.checked
                        ? [...selectedMembers, u.id]
                        : selectedMembers.filter((x) => x !== u.id)
                      )
                    }
                    style={{ accentColor: C.gold }}
                  />
                  <Av ini={u.av} photo={u.photo} size={26} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.navy }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: C.g400 }}>{u.role}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ padding: "9px 18px", border: `1px solid ${C.g200}`, borderRadius: 10, background: C.w, cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: C.g500 }}
            >
              {t.cancel}
            </button>
            <Btn onClick={save} disabled={!name.trim()}>
              {t.svc_save}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={t.svc_delete}
        message={t.svc_confirm_delete}
        onConfirm={() => { if (confirmDelete) { onDelete(confirmDelete.id); setConfirmDelete(null); } }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
