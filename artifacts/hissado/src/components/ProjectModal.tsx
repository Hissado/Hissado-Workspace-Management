import { useState } from "react";
import { C, Av, Btn, Inp, Modal } from "./primitives";
import type { Project, User } from "@/lib/data";
import { uid } from "@/lib/data";

const COLORS = ["#C8A45C", "#3B82F6", "#22C55E", "#8B5CF6", "#EC4899", "#F97316", "#EF4444", "#14B8A6", "#F59E0B", "#6366F1"];

interface ProjectModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSave: (p: Project) => void;
}

export default function ProjectModal({ open, onClose, users, currentUser, onSave }: ProjectModalProps) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [status, setStatus] = useState<"active" | "on-hold" | "completed">("active");
  const [selMembers, setSelMembers] = useState<string[]>([currentUser.id]);

  const toggleMember = (id: string) => {
    if (id === currentUser.id) return;
    setSelMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const save = () => {
    if (!name.trim()) return;
    onSave({
      id: uid(),
      name: name.trim(),
      desc,
      color,
      owner: currentUser.id,
      members: selMembers,
      status,
      created: new Date().toISOString().slice(0, 10),
    });
    setName(""); setDesc(""); setColor(COLORS[0]); setStatus("active"); setSelMembers([currentUser.id]);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Project" w={500}>
      <Inp label="Project Name" value={name} onChange={setName} ph="e.g., Website Redesign" />
      <Inp label="Description" value={desc} onChange={setDesc} ph="Brief project description..." ta />
      <Inp label="Status" value={status} onChange={(v) => setStatus(v as typeof status)} opts={[{ v: "active", l: "Active" }, { v: "on-hold", l: "On Hold" }, { v: "completed", l: "Completed" }]} />

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g500, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Color</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${color === c ? C.navy : "transparent"}`, cursor: "pointer", outline: color === c ? `2px solid ${c}` : "none", outlineOffset: 2 }}
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g500, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Team Members</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 200, overflow: "auto" }}>
          {users.filter((u) => u.status === "active").map((u) => {
            const sel = selMembers.includes(u.id);
            const isOwner = u.id === currentUser.id;
            return (
              <div
                key={u.id}
                onClick={() => toggleMember(u.id)}
                data-testid={`project-member-${u.id}`}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 10, cursor: isOwner ? "default" : "pointer", background: sel ? `${C.gold}10` : "transparent", border: sel ? `1px solid ${C.gold}30` : "1px solid transparent", transition: "all .1s" }}
              >
                <Av ini={u.av} size={28} />
                <div style={{ flex: 1 }}><div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{u.name}</div><div style={{ fontSize: 11, color: C.g400 }}>{u.dept}</div></div>
                {isOwner && <span style={{ fontSize: 10, fontWeight: 600, color: C.gold }}>Owner</span>}
                {!isOwner && sel && <div style={{ width: 18, height: 18, borderRadius: "50%", background: C.gold, display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 12, borderTop: `1px solid ${C.g100}` }}>
        <Btn v="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={save} disabled={!name.trim()} data-testid="project-save-btn">Create Project</Btn>
      </div>
    </Modal>
  );
}
