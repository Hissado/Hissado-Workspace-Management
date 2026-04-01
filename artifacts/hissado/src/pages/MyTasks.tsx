import { useState } from "react";
import { C, Av, Btn, StatusBadge, PriorityBadge, Empty } from "@/components/primitives";
import type { Project, Task, User } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const CheckIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;

const STATUSES = ["All", "To Do", "In Progress", "In Review", "Done"] as const;

interface MyTasksProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  onTaskClick: (t: Task) => void;
  onAddTask: () => void;
}

export default function MyTasks({ tasks, projects, users, onTaskClick, onAddTask }: MyTasksProps) {
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPri, setFilterPri] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"due" | "created" | "pri">("due");

  const filtered = tasks
    .filter((t) => filterStatus === "All" || t.status === filterStatus)
    .filter((t) => filterPri === "All" || t.pri === filterPri)
    .sort((a, b) => {
      if (sortBy === "due") return a.due.localeCompare(b.due);
      if (sortBy === "created") return b.created.localeCompare(a.created);
      const priOrder = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
      return (priOrder[a.pri as keyof typeof priOrder] ?? 2) - (priOrder[b.pri as keyof typeof priOrder] ?? 2);
    });

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>My Tasks</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{filtered.length} tasks</p>
        </div>
        <Btn onClick={onAddTask} icon={<PlusIcon />} data-testid="my-tasks-add-btn">New Task</Btn>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: C.g100, borderRadius: 10, padding: 3 }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: "6px 12px", border: "none", borderRadius: 7, fontSize: 12, fontWeight: 600,
                fontFamily: "inherit", cursor: "pointer", transition: "all .15s",
                background: filterStatus === s ? C.w : "transparent",
                color: filterStatus === s ? C.navy : C.g400,
                boxShadow: filterStatus === s ? "0 1px 4px rgba(0,0,0,.08)" : "none",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <select
          value={filterPri}
          onChange={(e) => setFilterPri(e.target.value)}
          style={{ padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none", background: C.w }}
        >
          {["All", "Urgent", "High", "Medium", "Low"].map((p) => <option key={p} value={p}>{p === "All" ? "All Priorities" : p}</option>)}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          style={{ padding: "8px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", cursor: "pointer", outline: "none", background: C.w }}
        >
          <option value="due">Sort: Due Date</option>
          <option value="created">Sort: Recently Created</option>
          <option value="pri">Sort: Priority</option>
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <Empty icon={<CheckIcon />} title="No tasks found" desc="Try adjusting your filters or create a new task" action={<Btn onClick={onAddTask} icon={<PlusIcon />} sz="sm">Add Task</Btn>} />
      ) : (
        <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, overflow: "hidden" }}>
          {filtered.map((t) => {
            const assignee = users.find((u) => u.id === t.assignee);
            const proj = projects.find((p) => p.id === t.pId);
            return (
              <div
                key={t.id}
                onClick={() => onTaskClick(t)}
                data-testid={`my-task-row-${t.id}`}
                style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.g50}`, cursor: "pointer", gap: 12 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = C.g50)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${t.status === "Done" ? C.ok : C.g300}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: t.status === "Done" ? "#D1FAE5" : "transparent" }}>
                  {t.status === "Done" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: t.status === "Done" ? C.g400 : C.g700, textDecoration: t.status === "Done" ? "line-through" : "none", marginBottom: 2 }}>{t.title}</div>
                  {proj && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: proj.color }} />
                      <span style={{ fontSize: 11, color: C.g400 }}>{proj.name}</span>
                    </div>
                  )}
                </div>
                <StatusBadge status={t.status} />
                <PriorityBadge pri={t.pri} />
                {assignee && <Av ini={assignee.av} size={26} />}
                <span style={{ fontSize: 11, color: C.g400, minWidth: 70, textAlign: "right" }}>{t.due}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
