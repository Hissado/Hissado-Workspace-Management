import { useState } from "react";
import { C, Av, Btn, PBar, StatusBadge, PriorityBadge, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, Task, User } from "@/lib/data";
import { fmt } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const BoardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>;
const ChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;

interface ProjectDetailProps {
  project: Project;
  tasks: Task[];
  users: User[];
  onTaskClick: (t: Task) => void;
  onAddTask: () => void;
  onBack: () => void;
}

const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;
type Status = typeof STATUSES[number];

export default function ProjectDetail({ project, tasks, users, onTaskClick, onAddTask, onBack }: ProjectDetailProps) {
  const { t } = useI18n();
  const [view, setView] = useState<"list" | "board">("list");

  const STATUS_LABELS_LOCAL: Record<Status, string> = {
    "To Do": t.task_todo,
    "In Progress": t.task_inprogress,
    "In Review": t.task_inreview,
    "Done": t.task_done,
  };

  const pTasks = tasks.filter((x) => x.pId === project.id);
  const doneTasks = pTasks.filter((x) => x.status === "Done").length;
  const ipTasks = pTasks.filter((x) => x.status === "In Progress").length;
  const pct = pTasks.length > 0 ? Math.round((doneTasks / pTasks.length) * 100) : 0;
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div style={{ padding: "32px 32px 60px" }}>
      <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: 13, display: "flex", alignItems: "center", gap: 4, marginBottom: 20, fontFamily: "inherit" }}>
        <ChevLeft /> {t.pdet_back}
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: "50%", background: project.color }} />
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{project.name}</h2>
            {project.desc && <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{project.desc}</p>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", background: C.g100, borderRadius: 8, padding: 3, gap: 2 }}>
            {([["list", <ListIcon />, t.pdet_list], ["board", <BoardIcon />, t.pdet_board]] as const).map(([v, icon, label]) => (
              <button
                key={v}
                onClick={() => setView(v as "list" | "board")}
                data-testid={`view-${v}`}
                style={{
                  padding: "5px 12px", border: "none", borderRadius: 6, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600,
                  fontFamily: "inherit",
                  background: view === v ? C.w : "transparent",
                  color: view === v ? C.navy : C.g400,
                  boxShadow: view === v ? "0 1px 3px rgba(0,0,0,.1)" : "none",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>
          <Btn onClick={onAddTask} data-testid="add-task-btn-detail">
            <PlusIcon /> {t.pdet_add_task}
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: t.pdet_total_tasks, value: pTasks.length, color: "#4F7CEC" },
          { label: t.pdet_in_progress, value: ipTasks, color: C.gold },
          { label: t.pdet_completed, value: doneTasks, color: "#10B981" },
          { label: t.pdet_progress, value: `${pct}%`, color: project.color },
        ].map((s, i) => (
          <div key={i} style={{ background: C.w, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.g100}` }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: C.g400 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: C.w, borderRadius: 12, padding: "16px 20px", border: `1px solid ${C.g100}`, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{t.pdet_overall}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: project.color }}>{pct}%</span>
        </div>
        <PBar value={pct} color={project.color} h={8} />
      </div>

      {pTasks.length === 0 ? (
        <Empty icon="✓" title={t.pdet_no_tasks} desc={t.pdet_no_tasks_desc} />
      ) : view === "list" ? (
        <ListView tasks={pTasks} userMap={userMap} onTaskClick={onTaskClick} t={t} />
      ) : (
        <BoardView tasks={pTasks} userMap={userMap} onTaskClick={onTaskClick} statuses={STATUSES} statusLabels={STATUS_LABELS_LOCAL} />
      )}
    </div>
  );
}

function ListView({ tasks, userMap, onTaskClick, t }: { tasks: Task[]; userMap: Record<string, User>; onTaskClick: (t: Task) => void; t: any }) {
  return (
    <div style={{ background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 90px", gap: 16, padding: "12px 20px", borderBottom: `1px solid ${C.g100}`, fontSize: 11, fontWeight: 600, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em" }}>
        {[t.dash_task, t.dash_status, t.dash_priority, t.dash_assignee, t.dash_due].map((h: string) => <div key={h}>{h}</div>)}
      </div>
      {tasks.map((tk) => {
        const assignee = userMap[tk.assignee];
        const isOverdue = tk.due && new Date(tk.due) < new Date() && tk.status !== "Done";
        return (
          <div key={tk.id} onClick={() => onTaskClick(tk)} data-testid={`task-detail-${tk.id}`}
            style={{ display: "grid", gridTemplateColumns: "1fr 120px 100px 100px 90px", gap: 16, padding: "14px 20px", borderBottom: `1px solid ${C.g50}`, cursor: "pointer", alignItems: "center" }}
            onMouseEnter={(e) => e.currentTarget.style.background = C.g50}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ fontSize: 13, fontWeight: 500, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.title}</div>
            <StatusBadge status={tk.status} />
            <PriorityBadge pri={tk.pri} />
            <div>
              {assignee ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Av ini={assignee.av} size={22} />
                  <span style={{ fontSize: 12, color: C.g500 }}>{assignee.name.split(" ")[0]}</span>
                </div>
              ) : <span style={{ color: C.g300 }}>—</span>}
            </div>
            <div style={{ fontSize: 12, color: isOverdue ? "#EF4444" : C.g400 }}>{tk.due ? fmt(new Date(tk.due)) : "—"}</div>
          </div>
        );
      })}
    </div>
  );
}

function BoardView({ tasks, userMap, onTaskClick, statuses, statusLabels }: {
  tasks: Task[]; userMap: Record<string, User>; onTaskClick: (t: Task) => void;
  statuses: readonly Status[]; statusLabels: Record<Status, string>;
}) {
  const COLUMN_COLORS: Record<Status, string> = {
    "To Do": "#E5E7EB", "In Progress": "#FEF3C7", "In Review": "#EDE9FE", "Done": "#D1FAE5",
  };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      {statuses.map((s) => {
        const col = tasks.filter((x) => x.status === s);
        return (
          <div key={s}>
            <div style={{ padding: "8px 12px", borderRadius: 8, background: COLUMN_COLORS[s], marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{statusLabels[s]}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: C.g500 }}>{col.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {col.map((tk) => {
                const assignee = userMap[tk.assignee];
                return (
                  <div key={tk.id} onClick={() => onTaskClick(tk)} data-testid={`board-task-${tk.id}`}
                    style={{ background: C.w, borderRadius: 10, padding: "12px 14px", border: `1px solid ${C.g100}`, cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.04)"}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, marginBottom: 8 }}>{tk.title}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <PriorityBadge pri={tk.pri} />
                      {assignee && <Av ini={assignee.av} size={22} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
