import { useState, useEffect } from "react";
import { C, Btn, Inp, Modal } from "./primitives";
import { useI18n } from "@/lib/i18n";
import type { Task, User, Project } from "@/lib/data";
import { uid } from "@/lib/data";

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
  projects: Project[];
  users: User[];
  currentUser: User;
  onSave: (t: Task) => void;
  onDelete: (id: string) => void;
  defaultProject?: string;
}

const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;
const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;

export default function TaskModal({ open, onClose, task, projects, users, currentUser, onSave, onDelete, defaultProject }: TaskModalProps) {
  const { t, lang } = useI18n();

  const STATUS_LABELS_LOCAL: Record<string, string> = lang === "fr"
    ? { "To Do": "À faire", "In Progress": "En cours", "In Review": "En révision", "Done": "Terminée" }
    : { "To Do": "To Do", "In Progress": "In Progress", "In Review": "In Review", "Done": "Done" };

  const PRIORITY_LABELS_LOCAL: Record<string, string> = lang === "fr"
    ? { Urgent: "Urgent", High: "Haute", Medium: "Moyenne", Low: "Faible" }
    : { Urgent: "Urgent", High: "High", Medium: "Medium", Low: "Low" };

  const isEdit = !!task;

  const [title, setTitle] = useState(task?.title || "");
  const [desc, setDesc] = useState(task?.desc || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "To Do");
  const [priority, setPriority] = useState<Task["pri"]>(task?.pri || "Medium");
  const [due, setDue] = useState(task?.due || "");
  const [pId, setPId] = useState(task?.pId || defaultProject || projects[0]?.id || "");
  const [assignee, setAssignee] = useState(task?.assignee || currentUser.id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task?.title || "");
      setDesc(task?.desc || "");
      setStatus(task?.status || "To Do");
      setPriority(task?.pri || "Medium");
      setDue(task?.due || "");
      setPId(task?.pId || defaultProject || projects[0]?.id || "");
      setAssignee(task?.assignee || currentUser.id);
      setConfirmDelete(false);
    }
  }, [open, task, defaultProject]);

  const save = () => {
    if (!title.trim()) return;
    const saved: Task = {
      id: task?.id || uid(),
      title: title.trim(),
      desc,
      status,
      pri: priority,
      due,
      pId,
      assignee,
      created: task?.created || new Date().toISOString().split("T")[0],
      subs: task?.subs || [],
      cmts: task?.cmts || [],
      prog: task?.prog || 0,
    };
    onSave(saved);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? t.tmod_edit : t.tmod_create}>
      <Inp label={t.tmod_title_label} value={title} onChange={setTitle} ph={t.tmod_title_ph} />
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.tmod_desc}</label>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder={t.tmod_desc_ph}
          rows={3}
          style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.tmod_status}</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as Task["status"])} data-testid="task-status-select" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS_LOCAL[s]}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.tmod_priority}</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as Task["pri"])} data-testid="task-priority-select" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABELS_LOCAL[p]}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.tmod_due}</label>
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} data-testid="task-due-input" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.tmod_project}</label>
          <select value={pId} onChange={(e) => setPId(e.target.value)} data-testid="task-project-select" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: C.g600, display: "block", marginBottom: 6 }}>{t.tmod_assignee}</label>
        <select value={assignee} onChange={(e) => setAssignee(e.target.value)} data-testid="task-assignee-select" style={{ width: "100%", padding: "10px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 13, fontFamily: "inherit", outline: "none" }}>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {isEdit ? (
          confirmDelete ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.g500 }}>{t.tmod_delete_confirm}</span>
              <button onClick={() => onDelete(task!.id)} data-testid="confirm-delete-btn" style={{ padding: "6px 12px", background: "#EF4444", color: C.w, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>{t.tmod_delete_yes}</button>
              <button onClick={() => setConfirmDelete(false)} style={{ padding: "6px 12px", background: C.g100, color: C.g500, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 12 }}>{t.tmod_cancel}</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} data-testid="delete-task-btn" style={{ padding: "8px 14px", background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>
              {t.tmod_delete}
            </button>
          )
        ) : <div />}

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onClose} style={{ padding: "8px 16px", background: C.g100, color: C.g600, border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{t.tmod_cancel}</button>
          <Btn onClick={save} data-testid="save-task-btn">
            {isEdit ? t.tmod_save : t.tmod_create_btn}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
