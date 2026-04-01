import { useState } from "react";
import { C, Av, Btn, Inp, Modal } from "./primitives";
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
  onDelete?: (id: string) => void;
  defaultProject?: string;
}

export default function TaskModal({ open, onClose, task, projects, users, currentUser, onSave, onDelete, defaultProject }: TaskModalProps) {
  const isEdit = !!task;
  const [title, setTitle] = useState(task?.title || "");
  const [desc, setDesc] = useState(task?.desc || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "To Do");
  const [pri, setPri] = useState<Task["pri"]>(task?.pri || "Medium");
  const [due, setDue] = useState(task?.due || "");
  const [assignee, setAssignee] = useState(task?.assignee || currentUser.id);
  const [pId, setPId] = useState(task?.pId || defaultProject || (projects[0]?.id ?? ""));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: task?.id || uid(),
      title: title.trim(),
      desc,
      status,
      pri,
      due,
      assignee,
      pId,
      prog: task?.prog ?? 0,
      created: task?.created || new Date().toISOString().slice(0, 10),
      subs: task?.subs || [],
      cmts: task?.cmts || [],
    });
    onClose();
  };

  const handleClose = () => {
    onClose();
    setConfirmDelete(false);
  };

  return (
    <Modal open={open} onClose={handleClose} title={isEdit ? "Edit Task" : "Create Task"} w={540}>
      <Inp label="Task Title" value={title} onChange={setTitle} ph="Enter task title..." />
      <Inp label="Description" value={desc} onChange={setDesc} ph="Optional description..." ta />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp
          label="Status" value={status} onChange={(v) => setStatus(v as Task["status"])}
          opts={["To Do", "In Progress", "In Review", "Done"].map((s) => ({ v: s, l: s }))}
        />
        <Inp
          label="Priority" value={pri} onChange={(v) => setPri(v as Task["pri"])}
          opts={["Urgent", "High", "Medium", "Low"].map((p) => ({ v: p, l: p }))}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Inp label="Due Date" value={due} onChange={setDue} type="date" />
        <Inp
          label="Project" value={pId} onChange={setPId}
          opts={projects.map((p) => ({ v: p.id, l: p.name }))}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g500, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Assignee</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {users.filter((u) => u.status === "active").map((u) => (
            <button
              key={u.id}
              onClick={() => setAssignee(u.id)}
              data-testid={`assignee-${u.id}`}
              style={{
                padding: "5px 10px", border: `2px solid ${assignee === u.id ? C.gold : C.g200}`,
                borderRadius: 20, background: assignee === u.id ? `${C.gold}10` : "transparent",
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                fontSize: 12, fontWeight: 500, color: assignee === u.id ? C.gold : C.g600, fontFamily: "inherit",
              }}
            >
              <Av ini={u.av} size={20} color={assignee === u.id ? C.gold : C.g400} />
              {u.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Subtasks if editing */}
      {isEdit && task?.subs && task.subs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.g500, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".05em" }}>Subtasks</label>
          <div style={{ background: C.g50, borderRadius: 8, padding: "8px 12px" }}>
            {task.subs.map((sub) => (
              <div key={sub.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${sub.done ? C.ok : C.g300}`, background: sub.done ? "#D1FAE5" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sub.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <span style={{ fontSize: 13, color: sub.done ? C.g400 : C.g700, textDecoration: sub.done ? "line-through" : "none" }}>{sub.t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: `1px solid ${C.g100}` }}>
        {isEdit && onDelete ? (
          confirmDelete ? (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 12, color: C.err }}>Delete this task?</span>
              <Btn v="danger" sz="sm" onClick={() => { onDelete(task!.id); handleClose(); }}>Yes, Delete</Btn>
              <Btn v="secondary" sz="sm" onClick={() => setConfirmDelete(false)}>Cancel</Btn>
            </div>
          ) : (
            <Btn v="danger" sz="sm" onClick={() => setConfirmDelete(true)}>Delete</Btn>
          )
        ) : <div />}
        <div style={{ display: "flex", gap: 8 }}>
          <Btn v="secondary" onClick={handleClose}>Cancel</Btn>
          <Btn onClick={handleSave} disabled={!title.trim()} data-testid="task-save-btn">{isEdit ? "Save Changes" : "Create Task"}</Btn>
        </div>
      </div>
    </Modal>
  );
}
