import { useState } from "react";
import { C, Av, Btn, Inp, Modal } from "./primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, User } from "@/lib/data";
import { uid, fmt } from "@/lib/data";

const COLORS = ["#C8A45C", "#3B82F6", "#22C55E", "#8B5CF6", "#EC4899", "#F97316", "#EF4444", "#14B8A6", "#F59E0B", "#6366F1"];

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSave: (p: Project) => void;
}

export default function ProjectModal({ open, onClose, users, currentUser, onSave }: ProjectModalProps) {
  const { t } = useI18n();

  const STATUS_OPTS = [
    { k: "active", l: t.pmod_status_active },
    { k: "on-hold", l: t.pmod_status_hold },
    { k: "completed", l: t.pmod_status_done },
  ];

  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [status, setStatus] = useState<Project["status"]>("active");
  const [members, setMembers] = useState<string[]>([currentUser.id]);

  const create = () => {
    if (!name.trim()) return;
    const p: Project = {
      id: uid(), name: name.trim(), desc, color, status,
      members,
      owner: currentUser.id,
      created: fmt(new Date()),
    };
    onSave(p);
    setName(""); setDesc(""); setColor(COLORS[0]); setStatus("active"); setMembers([currentUser.id]);
  };

  const toggleMember = (id: string) => {
    if (id === currentUser.id) return;
    setMembers((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  return (
    <Modal open={open} onClose={onClose} title={t.pmod_title}>
      <Inp label={t.pmod_name} value={name} onChange={setName} ph={t.pmod_name_ph} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.pmod_desc}</label>
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={t.pmod_desc_ph} rows={2}
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.pmod_status}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])} data-testid="project-status-select"
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {STATUS_OPTS.map((s) => <option key={s.k} value={s.k}>{s.l}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.pmod_color}</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {COLORS.map((c) => (
              <button key={c} onClick={() => setColor(c)}
                style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: `3px solid ${color === c ? C.navy : "transparent"}`, cursor: "pointer", transition: "border-color .15s" }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 8 }}>{t.pmod_members}</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflow: "auto" }}>
          {users.map((u) => {
            const isOwner = u.id === currentUser.id;
            const checked = members.includes(u.id);
            return (
              <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: isOwner ? "default" : "pointer", padding: "6px 8px", borderRadius: 8, background: checked ? `${C.gold}10` : "transparent" }}>
                <input type="checkbox" checked={checked} disabled={isOwner} onChange={() => toggleMember(u.id)} />
                <Av ini={u.av} size={26} />
                <div>
                  <div style={{ fontSize: 13, color: C.navy, fontWeight: 500 }}>{u.name}</div>
                  {isOwner && <div style={{ fontSize: 10, color: C.gold }}>{t.pmod_owner}</div>}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ flex: 1, padding: "10px", background: C.g100, color: C.g600, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{t.pmod_cancel}</button>
        <Btn onClick={create} data-testid="create-project-btn" style={{ flex: 2, justifyContent: "center" }}>{t.pmod_create}</Btn>
      </div>
    </Modal>
  );
}
