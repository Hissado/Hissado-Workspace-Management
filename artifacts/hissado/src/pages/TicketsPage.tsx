import { useState, useRef } from "react";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { C, Av } from "@/components/primitives";
import { uid } from "@/lib/data";
import type { Ticket, TicketStatus, TicketCategory, TicketNote } from "@/lib/data";

/* ─── Icons ─────────────────────────────────────────────── */
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const CloseIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const PaperclipIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>;
const ChevronDown = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
const FilterIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;
const NoteIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;

/* ─── Status helpers ─────────────────────────────────────── */
const STATUS_META: Record<TicketStatus, { label: string; bg: string; t: string; dot: string }> = {
  new:          { label: "new",          bg: "#DBEAFE", t: "#1E40AF", dot: "#3B82F6" },
  under_review: { label: "under_review", bg: "#FEF3C7", t: "#92400E", dot: "#F59E0B" },
  in_progress:  { label: "in_progress",  bg: "#EDE9FE", t: "#5B21B6", dot: "#8B5CF6" },
  resolved:     { label: "resolved",     bg: "#D1FAE5", t: "#065F46", dot: "#10B981" },
  closed:       { label: "closed",       bg: "#F1F3F5", t: "#6B7280", dot: "#9BA3B5" },
};

const CAT_META: Record<TicketCategory, { icon: string }> = {
  complaint: { icon: "⚠️" },
  request:   { icon: "📋" },
  issue:     { icon: "🔧" },
  other:     { icon: "💬" },
};

const STATUSES: TicketStatus[] = ["new", "under_review", "in_progress", "resolved", "closed"];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

/* ─── Status badge ───────────────────────────────────────── */
function StatusBadge({ status, label }: { status: TicketStatus; label: string }) {
  const m = STATUS_META[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 9px", borderRadius: 20,
      background: m.bg, color: m.t, fontSize: 11, fontWeight: 600,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function TicketsPage() {
  const { t, lang } = useI18n();
  const currentUser = useStore((s) => s.currentUser)!;
  const tickets = useStore((s) => s.tickets);
  const projects = useStore((s) => s.projects);
  const services = useStore((s) => s.services);
  const users = useStore((s) => s.users);
  const clients = useStore((s) => s.clients);
  const addTicket = useStore((s) => s.addTicket);
  const updateTicket = useStore((s) => s.updateTicket);
  const deleteTicket = useStore((s) => s.deleteTicket);
  const addNotification = useStore((s) => s.addNotification);

  const isClient = currentUser.role === "client";
  const isAdmin = currentUser.role === "admin" || currentUser.role === "manager";

  /* ── Form state ── */
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<TicketCategory>("request");
  const [formDesc, setFormDesc] = useState("");
  const [formProject, setFormProject] = useState("");
  const [formService, setFormService] = useState("");
  const [formAttachment, setFormAttachment] = useState<Ticket["attachment"]>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Detail modal ── */
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [noteText, setNoteText] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Ticket | null>(null);

  /* ── Filters ── */
  const [filterStatus, setFilterStatus] = useState<TicketStatus | "all">("all");
  const [filterClient, setFilterClient] = useState("all");

  /* ── Helpers ── */
  const statusLabel = (s: TicketStatus): string => {
    const map: Record<TicketStatus, string> = {
      new: t.ticket_status_new,
      under_review: t.ticket_status_under_review,
      in_progress: t.ticket_status_in_progress,
      resolved: t.ticket_status_resolved,
      closed: t.ticket_status_closed,
    };
    return map[s];
  };

  const catLabel = (c: TicketCategory): string => {
    const map: Record<TicketCategory, string> = {
      complaint: t.ticket_cat_complaint,
      request: t.ticket_cat_request,
      issue: t.ticket_cat_issue,
      other: t.ticket_cat_other,
    };
    return map[c];
  };

  /* ── Visible tickets ── */
  const visibleTickets = tickets.filter((tk) => {
    if (isClient) return tk.submitterId === currentUser.id;
    if (filterStatus !== "all" && tk.status !== filterStatus) return false;
    if (filterClient !== "all" && tk.clientId !== filterClient) return false;
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  /* ── Accessible projects for the current user (clients see only their own) ── */
  const accessibleProjects = isClient
    ? projects.filter((p) => {
        const client = clients.find((c) => c.id === currentUser.clientId);
        return client && p.clientId === client.id;
      })
    : projects;

  const accessibleServices = isClient
    ? services.filter((s) => {
        const client = clients.find((c) => c.id === currentUser.clientId);
        return client && s.clientId === client.id;
      })
    : services;

  /* ── File attachment ── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormAttachment({ name: file.name, type: file.type, size: file.size, data: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  /* ── Submit ── */
  const handleSubmit = () => {
    if (!formTitle.trim() || !formDesc.trim()) return;
    setSubmitting(true);
    const now = new Date().toISOString();
    const newTicket: Ticket = {
      id: uid(),
      title: formTitle.trim(),
      category: formCategory,
      description: formDesc.trim(),
      status: "new",
      submitterId: currentUser.id,
      clientId: currentUser.clientId,
      projectId: formProject || undefined,
      serviceId: formService || undefined,
      attachment: formAttachment,
      notes: [],
      createdAt: now,
      updatedAt: now,
    };
    addTicket(newTicket);

    /* Notify all admins / managers / staff */
    const staffToNotify = users.filter(
      (u) => (u.role === "admin" || u.role === "manager" || u.role === "member") && u.id !== currentUser.id
    );
    staffToNotify.forEach((u) => {
      addNotification({
        id: uid(),
        type: "ticket",
        text: t.ticket_notif_new(currentUser.name),
        read: false,
        date: now,
      });
    });

    /* Reset */
    setFormTitle("");
    setFormCategory("request");
    setFormDesc("");
    setFormProject("");
    setFormService("");
    setFormAttachment(undefined);
    if (fileRef.current) fileRef.current.value = "";
    setSubmitting(false);
    setShowForm(false);
  };

  /* ── Add internal note ── */
  const handleAddNote = () => {
    if (!selected || !noteText.trim()) return;
    const note: TicketNote = {
      id: uid(),
      uid: currentUser.id,
      text: noteText.trim(),
      date: new Date().toISOString(),
    };
    updateTicket(selected.id, { notes: [...selected.notes, note] });
    setSelected((prev) => prev ? { ...prev, notes: [...prev.notes, note], updatedAt: new Date().toISOString() } : prev);
    setNoteText("");
  };

  const userName = (uid: string) => users.find((u) => u.id === uid)?.name ?? "Unknown";
  const userAv = (uid: string) => users.find((u) => u.id === uid)?.av ?? "?";

  return (
    <div style={{ padding: "32px 32px 48px", maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.navy, margin: 0 }}>{t.ticket_title}</h1>
          <p style={{ fontSize: 13, color: C.g500, margin: "4px 0 0" }}>{t.ticket_subtitle}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 10,
            background: C.gold, color: C.w, border: "none",
            fontWeight: 600, fontSize: 13, cursor: "pointer",
            transition: "opacity .15s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          <PlusIcon /> {t.ticket_new}
        </button>
      </div>

      {/* Staff filters */}
      {!isClient && (
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, fontSize: 13 }}>
            <FilterIcon />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TicketStatus | "all")}
              style={{ border: "none", outline: "none", fontSize: 13, cursor: "pointer", background: "transparent", color: C.navy, fontFamily: "inherit" }}
            >
              <option value="all">{t.ticket_filter_all}</option>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </div>
          {clients.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, background: C.w, fontSize: 13 }}>
              <select
                value={filterClient}
                onChange={(e) => setFilterClient(e.target.value)}
                style={{ border: "none", outline: "none", fontSize: 13, cursor: "pointer", background: "transparent", color: C.navy, fontFamily: "inherit" }}
              >
                <option value="all">{t.ticket_all_clients}</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Ticket list */}
      {visibleTickets.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, color: C.navy, fontSize: 16, marginBottom: 6 }}>
            {isClient ? t.ticket_empty : t.ticket_empty_staff}
          </div>
          <div style={{ color: C.g400, fontSize: 13 }}>
            {isClient ? t.ticket_empty_desc : t.ticket_empty_staff_desc}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visibleTickets.map((tk) => {
            const submitter = users.find((u) => u.id === tk.submitterId);
            const project = projects.find((p) => p.id === tk.projectId);
            const service = services.find((s) => s.id === tk.serviceId);
            const sm = STATUS_META[tk.status];
            const cm = CAT_META[tk.category];
            return (
              <div
                key={tk.id}
                onClick={() => setSelected(tk)}
                style={{
                  background: C.w, borderRadius: 12, padding: "16px 20px",
                  border: `1px solid ${C.g200}`, cursor: "pointer",
                  display: "flex", gap: 14, alignItems: "flex-start",
                  transition: "box-shadow .15s, border-color .15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"; e.currentTarget.style.borderColor = C.gold + "60"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.g200; }}
              >
                <div style={{ fontSize: 22, flexShrink: 0, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", background: sm.bg, borderRadius: 10 }}>
                  {cm.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 600, color: C.navy, fontSize: 14 }}>{tk.title}</span>
                    <StatusBadge status={tk.status} label={statusLabel(tk.status)} />
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.g100, color: C.g500, fontWeight: 500 }}>
                      {catLabel(tk.category)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: C.g500, marginTop: 5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tk.description}
                  </div>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                    {submitter && (
                      <span style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 4 }}>
                        <Av name={submitter.name} photo={submitter.photo} size={16} color={submitter.color} />
                        {submitter.name}
                      </span>
                    )}
                    {project && (
                      <span style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: project.color, flexShrink: 0 }} />
                        {project.name}
                      </span>
                    )}
                    {service && (
                      <span style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 3 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: service.color, flexShrink: 0 }} />
                        {service.name}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: C.g400, marginLeft: "auto" }}>
                      {t.ticket_submitted}: {fmtDate(tk.createdAt)}
                    </span>
                    {tk.notes.length > 0 && (
                      <span style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 3 }}>
                        <NoteIcon /> {tk.notes.length}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Submission form modal ─── */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(7,13,26,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{
            background: C.w, borderRadius: 16, width: "100%", maxWidth: 540,
            boxShadow: "0 20px 60px rgba(0,0,0,.25)", overflow: "hidden",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: `1px solid ${C.g100}` }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>{t.ticket_new}</div>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, padding: 4 }}><CloseIcon /></button>
            </div>

            {/* Form body */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16, maxHeight: "70vh", overflowY: "auto" }}>
              {/* Subject */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{t.ticket_subject} *</label>
                <input
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={t.ticket_subject_ph}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.g200; }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{t.ticket_category} *</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["complaint", "request", "issue", "other"] as TicketCategory[]).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormCategory(cat)}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        padding: "7px 14px", borderRadius: 8, fontSize: 13, cursor: "pointer",
                        border: `1.5px solid ${formCategory === cat ? C.gold : C.g200}`,
                        background: formCategory === cat ? `${C.gold}12` : C.w,
                        color: formCategory === cat ? C.gold : C.g500,
                        fontWeight: formCategory === cat ? 600 : 400,
                        transition: "all .12s",
                        fontFamily: "inherit",
                      }}
                    >
                      {CAT_META[cat].icon} {catLabel(cat)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{t.ticket_desc} *</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder={t.ticket_desc_ph}
                  rows={5}
                  style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = C.g200; }}
                />
              </div>

              {/* Related project */}
              {accessibleProjects.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{t.ticket_project}</label>
                  <select
                    value={formProject}
                    onChange={(e) => setFormProject(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: C.w, cursor: "pointer" }}
                  >
                    <option value="">{t.ticket_none}</option>
                    {accessibleProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              )}

              {/* Related service */}
              {accessibleServices.length > 0 && (
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{t.ticket_service}</label>
                  <select
                    value={formService}
                    onChange={(e) => setFormService(e.target.value)}
                    style={{ width: "100%", padding: "9px 12px", border: `1.5px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", background: C.w, cursor: "pointer" }}
                  >
                    <option value="">{t.ticket_none}</option>
                    {accessibleServices.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* Attachment */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.navy, display: "block", marginBottom: 6 }}>{t.ticket_attachment}</label>
                {formAttachment ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, background: C.g50 }}>
                    <PaperclipIcon />
                    <span style={{ fontSize: 13, color: C.navy, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{formAttachment.name}</span>
                    <button onClick={() => { setFormAttachment(undefined); if (fileRef.current) fileRef.current.value = ""; }} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, padding: 2 }}><CloseIcon /></button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", border: `1px dashed ${C.g200}`, borderRadius: 8, background: C.g50, cursor: "pointer", fontSize: 13, color: C.g500, fontFamily: "inherit", width: "100%" }}
                  >
                    <PaperclipIcon /> {t.ticket_attach_btn}
                  </button>
                )}
                <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", gap: 10, padding: "16px 24px", borderTop: `1px solid ${C.g100}`, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowForm(false)}
                style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${C.g200}`, background: C.w, cursor: "pointer", fontSize: 13, color: C.g500, fontFamily: "inherit" }}
              >
                {t.ticket_cancel}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formTitle.trim() || !formDesc.trim()}
                style={{
                  padding: "9px 20px", borderRadius: 8, border: "none",
                  background: C.gold, color: C.w, cursor: "pointer", fontSize: 13,
                  fontWeight: 600, fontFamily: "inherit",
                  opacity: (submitting || !formTitle.trim() || !formDesc.trim()) ? 0.55 : 1,
                }}
              >
                {submitting ? t.ticket_submitting : t.ticket_submit}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Ticket detail modal ─── */}
      {selected && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(7,13,26,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: 20,
        }} onClick={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div style={{
            background: C.w, borderRadius: 16, width: "100%", maxWidth: 600,
            boxShadow: "0 20px 60px rgba(0,0,0,.25)", overflow: "hidden",
            display: "flex", flexDirection: "column", maxHeight: "90vh",
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: `1px solid ${C.g100}`, flexShrink: 0 }}>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontSize: 18 }}>{CAT_META[selected.category].icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.navy }}>{selected.title}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <StatusBadge status={selected.status} label={statusLabel(selected.status)} />
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 20, background: C.g100, color: C.g500, fontWeight: 500 }}>{catLabel(selected.category)}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, padding: 4, flexShrink: 0 }}><CloseIcon /></button>
            </div>

            {/* Scrollable body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
              {/* Meta */}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, color: C.g400, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.ticket_by}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.navy, fontWeight: 500 }}>
                    <Av name={userName(selected.submitterId)} size={18} />
                    {userName(selected.submitterId)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: C.g400, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.ticket_submitted}</div>
                  <div style={{ fontSize: 13, color: C.navy }}>{fmtDate(selected.createdAt)}</div>
                </div>
                {selected.updatedAt !== selected.createdAt && (
                  <div>
                    <div style={{ fontSize: 11, color: C.g400, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.ticket_updated}</div>
                    <div style={{ fontSize: 13, color: C.navy }}>{fmtDate(selected.updatedAt)}</div>
                  </div>
                )}
                {selected.projectId && (
                  <div>
                    <div style={{ fontSize: 11, color: C.g400, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Project</div>
                    <div style={{ fontSize: 13, color: C.navy }}>{projects.find((p) => p.id === selected.projectId)?.name ?? "—"}</div>
                  </div>
                )}
                {selected.serviceId && (
                  <div>
                    <div style={{ fontSize: 11, color: C.g400, marginBottom: 2, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Service</div>
                    <div style={{ fontSize: 13, color: C.navy }}>{services.find((s) => s.id === selected.serviceId)?.name ?? "—"}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ background: C.g50, borderRadius: 10, padding: "14px 16px", marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: C.g400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{t.ticket_desc}</div>
                <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{selected.description}</div>
              </div>

              {/* Attachment */}
              {selected.attachment && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: C.g400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{t.ticket_attachment}</div>
                  <a
                    href={selected.attachment.data}
                    download={selected.attachment.name}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.g200}`,
                      background: C.g50, color: C.navy, textDecoration: "none", fontSize: 13,
                    }}
                  >
                    <PaperclipIcon />
                    {selected.attachment.name}
                  </a>
                </div>
              )}

              {/* Status update — staff/admin only */}
              {!isClient && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: C.g400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>{t.ticket_update_status}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          updateTicket(selected.id, { status: s });
                          setSelected((prev) => prev ? { ...prev, status: s } : prev);
                        }}
                        style={{
                          padding: "6px 14px", borderRadius: 20, fontSize: 12, cursor: "pointer",
                          border: `1.5px solid ${selected.status === s ? STATUS_META[s].dot : C.g200}`,
                          background: selected.status === s ? STATUS_META[s].bg : C.w,
                          color: selected.status === s ? STATUS_META[s].t : C.g500,
                          fontWeight: selected.status === s ? 600 : 400,
                          fontFamily: "inherit",
                          transition: "all .12s",
                        }}
                      >
                        {statusLabel(s)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal notes — staff/admin only */}
              {!isClient && (
                <div>
                  <div style={{ fontSize: 11, color: C.g400, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>{t.ticket_notes}</div>
                  {selected.notes.length === 0 ? (
                    <div style={{ fontSize: 13, color: C.g400, fontStyle: "italic", marginBottom: 12 }}>{t.ticket_no_notes}</div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                      {selected.notes.map((note) => (
                        <div key={note.id} style={{ background: `${C.gold}0e`, borderLeft: `3px solid ${C.gold}`, borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                            <Av name={userName(note.uid)} size={16} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{userName(note.uid)}</span>
                            <span style={{ fontSize: 11, color: C.g400 }}>{fmtDate(note.date)}</span>
                          </div>
                          <div style={{ fontSize: 13, color: C.navy, lineHeight: 1.5 }}>{note.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder={t.ticket_notes_ph}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddNote(); } }}
                      style={{ flex: 1, padding: "8px 12px", border: `1.5px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = C.gold; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = C.g200; }}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteText.trim()}
                      style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: C.gold, color: C.w, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit", opacity: noteText.trim() ? 1 : 0.5 }}
                    >
                      {t.ticket_add_note}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "14px 24px", borderTop: `1px solid ${C.g100}`, flexShrink: 0 }}>
              {isAdmin && (
                <button
                  onClick={() => setConfirmDelete(selected)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", borderRadius: 8, border: `1px solid #FEE2E2`, background: "#FFF5F5", color: "#DC2626", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
                >
                  <TrashIcon /> {t.ticket_delete}
                </button>
              )}
              <button
                onClick={() => setSelected(null)}
                style={{ marginLeft: "auto", padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.g200}`, background: C.w, cursor: "pointer", fontSize: 13, color: C.g500, fontFamily: "inherit" }}
              >
                {t.ticket_close_detail}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(7,13,26,.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1100, padding: 20,
        }}>
          <div style={{ background: C.w, borderRadius: 14, padding: "28px 28px 24px", maxWidth: 400, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, marginBottom: 10 }}>{t.ticket_delete}</div>
            <div style={{ fontSize: 14, color: C.g500, lineHeight: 1.5, marginBottom: 20 }}>{t.ticket_delete_confirm}</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: "8px 18px", borderRadius: 8, border: `1px solid ${C.g200}`, background: C.w, cursor: "pointer", fontSize: 13, fontFamily: "inherit", color: C.g500 }}>
                {t.ticket_cancel}
              </button>
              <button
                onClick={() => {
                  deleteTicket(confirmDelete.id);
                  setConfirmDelete(null);
                  setSelected(null);
                }}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#DC2626", color: C.w, cursor: "pointer", fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
              >
                {t.ticket_delete_yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
