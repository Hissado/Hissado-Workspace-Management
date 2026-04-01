import { useState } from "react";
import { C, Av, Btn, PBar, Tabs, StatusBadge, PriorityBadge, Empty } from "@/components/primitives";
import type { Project, Task, User } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const BoardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>;
const ChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const CheckIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>;

const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onTaskClick: (t: Task) => void;
  onAddTask: () => void;
  onBack: () => void;
}

export default function ProjectDetail({ project, tasks, users, onTaskClick, onAddTask, onBack }: ProjectDetailProps) {
  const [view, setView] = useState<"list" | "board">("list");
  const pTasks = tasks.filter((t) => t.pId === project.id);
  const done = pTasks.filter((t) => t.status === "Done").length;
  const prog = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
  const members = project.members.map((id) => users.find((u) => u.id === id)).filter(Boolean) as User[];

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      {/* Back */}
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: 13, marginBottom: 20, fontFamily: "inherit" }}>
        <ChevLeft /> Back to Projects
      </button>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: project.color, opacity: 0.85 }} />
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{project.name}</h2>
            <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{project.desc}</p>
          </div>
        </div>
        <Btn onClick={onAddTask} icon={<PlusIcon />} data-testid="project-add-task-btn">Add Task</Btn>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { l: "Total Tasks", v: pTasks.length },
          { l: "In Progress", v: pTasks.filter((t) => t.status === "In Progress").length, c: C.info },
          { l: "Completed", v: done, c: C.ok },
          { l: "Progress", v: `${prog}%`, c: C.gold },
        ].map((s) => (
          <div key={s.l} style={{ background: C.w, borderRadius: 12, padding: "16px 18px", border: `1px solid ${C.g100}` }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.g400, textTransform: "uppercase", marginBottom: 6 }}>{s.l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.c || C.navy }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ background: C.w, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.g100}`, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.g600 }}>Overall Progress</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.gold }}>{prog}%</span>
        </div>
        <PBar value={prog} h={8} color={project.color} />
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          {members.map((m) => <Av key={m.id} ini={m.av} size={28} />)}
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Tasks ({pTasks.length})</h3>
        <Tabs
          tabs={[{ k: "list", l: "List", icon: <ListIcon /> }, { k: "board", l: "Board", icon: <BoardIcon /> }]}
          active={view}
          onChange={(k) => setView(k as "list" | "board")}
        />
      </div>

      {view === "list" ? (
        <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, overflow: "hidden" }}>
          {pTasks.length === 0 ? (
            <Empty icon={<CheckIcon />} title="No tasks yet" desc="Add your first task to get started" action={<Btn onClick={onAddTask} icon={<PlusIcon />} sz="sm">Add Task</Btn>} />
          ) : (
            pTasks.map((t) => {
              const assignee = users.find((u) => u.id === t.assignee);
              return (
                <div
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  data-testid={`task-row-${t.id}`}
                  style={{ display: "flex", alignItems: "center", padding: "14px 20px", borderBottom: `1px solid ${C.g50}`, cursor: "pointer", gap: 12 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = C.g50)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${t.status === "Done" ? C.ok : C.g300}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: t.status === "Done" ? "#D1FAE5" : "transparent" }}>
                    {t.status === "Done" && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: t.status === "Done" ? C.g400 : C.g700, textDecoration: t.status === "Done" ? "line-through" : "none" }}>{t.title}</div>
                    {t.desc && <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{t.desc}</div>}
                  </div>
                  <StatusBadge status={t.status} />
                  <PriorityBadge pri={t.pri} />
                  {assignee && <Av ini={assignee.av} size={26} />}
                  <span style={{ fontSize: 11, color: C.g400, minWidth: 70, textAlign: "right" }}>{t.due}</span>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {STATUSES.map((status) => {
            const col = pTasks.filter((t) => t.status === status);
            const statusColors = { "To Do": C.g300, "In Progress": C.info, "In Review": C.warn, Done: C.ok };
            return (
              <div key={status} style={{ background: C.g50, borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.g600, textTransform: "uppercase", letterSpacing: ".04em" }}>{status}</span>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: statusColors[status] + "20", color: statusColors[status], fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{col.length}</span>
                </div>
                {col.map((t) => {
                  const assignee = users.find((u) => u.id === t.assignee);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onTaskClick(t)}
                      data-testid={`kanban-card-${t.id}`}
                      style={{ background: C.w, borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: `1px solid ${C.g100}`, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${C.gold}40`; e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,.08)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"; }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>{t.title}</div>
                      <PBar value={t.prog} h={3} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                        <PriorityBadge pri={t.pri} />
                        {assignee && <Av ini={assignee.av} size={22} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
