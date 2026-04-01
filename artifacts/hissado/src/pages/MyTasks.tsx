import { useState } from "react";
import { C, Av, Btn, StatusBadge, PriorityBadge, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, Task, User } from "@/lib/data";
import { fmt } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

interface MyTasksProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  onTaskClick: (t: Task) => void;
  onAddTask: () => void;
}

type SortKey = "due" | "created" | "priority";
const PRIORITY_ORDER: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };

export default function MyTasks({ tasks, projects, users, onTaskClick, onAddTask }: MyTasksProps) {
  const { t } = useI18n();

  const STATUS_TABS = [
    { k: "All", l: t.task_all },
    { k: "To Do", l: t.task_todo },
    { k: "In Progress", l: t.task_inprogress },
    { k: "In Review", l: t.task_inreview },
    { k: "Done", l: t.task_done },
  ];

  const PRIORITY_OPTS = [
    { k: "all", l: t.task_all_priorities },
    { k: "Urgent", l: t.task_urgent },
    { k: "High", l: t.task_high },
    { k: "Medium", l: t.task_medium },
    { k: "Low", l: t.task_low },
  ];

  const SORT_OPTS = [
    { k: "due" as SortKey, l: t.task_sort_due },
    { k: "created" as SortKey, l: t.task_sort_created },
    { k: "priority" as SortKey, l: t.task_sort_priority },
  ];

  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("due");

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  let filtered = tasks
    .filter((tk) => statusFilter === "All" || tk.status === statusFilter)
    .filter((tk) => priorityFilter === "all" || tk.pri === priorityFilter);

  filtered = filtered.slice().sort((a, b) => {
    if (sort === "due") {
      if (!a.due) return 1;
      if (!b.due) return -1;
      return new Date(a.due).getTime() - new Date(b.due).getTime();
    }
    if (sort === "priority") return (PRIORITY_ORDER[a.pri] ?? 99) - (PRIORITY_ORDER[b.pri] ?? 99);
    return 0;
  });

  return (
    <div style={{ padding: "32px 32px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{t.task_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{filtered.length} {t.proj_total_tasks}</p>
        </div>
        <Btn onClick={onAddTask} data-testid="add-task-btn">
          <PlusIcon /> {t.task_new}
        </Btn>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {STATUS_TABS.map((s) => (
          <button
            key={s.k}
            onClick={() => setStatusFilter(s.k)}
            data-testid={`status-filter-${s.k}`}
            style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer", border: "1px solid transparent", fontFamily: "inherit",
              background: statusFilter === s.k ? C.navy : C.w,
              color: statusFilter === s.k ? C.w : C.g500,
              borderColor: statusFilter === s.k ? C.navy : C.g200,
            }}
          >
            {s.l}
          </button>
        ))}

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ marginLeft: 8, padding: "6px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", background: C.w, cursor: "pointer" }}
        >
          {PRIORITY_OPTS.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{ padding: "6px 12px", border: `1px solid ${C.g200}`, borderRadius: 8, fontSize: 12, fontFamily: "inherit", background: C.w, cursor: "pointer" }}
        >
          {SORT_OPTS.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
        </select>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <Empty icon="✓" title={t.task_no_tasks} desc={t.task_no_tasks_desc} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((tk) => {
            const p = projectMap[tk.pId];
            const assignee = userMap[tk.assignee];
            const isOverdue = tk.due && new Date(tk.due) < new Date() && tk.status !== "Done";
            return (
              <div
                key={tk.id}
                onClick={() => onTaskClick(tk)}
                data-testid={`task-item-${tk.id}`}
                style={{
                  background: C.w, borderRadius: 12, padding: "16px 20px",
                  border: `1px solid ${C.g100}`, cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 16, boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                  transition: "box-shadow .15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"}
              >
                {p && <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, flexShrink: 0 }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.title}</div>
                  <div style={{ fontSize: 12, color: C.g400, marginTop: 2 }}>{p?.name}</div>
                </div>
                <StatusBadge status={tk.status} />
                <PriorityBadge pri={tk.pri} />
                {assignee && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 100 }}>
                    <Av ini={assignee.av} size={24} />
                    <span style={{ fontSize: 12, color: C.g500 }}>{assignee.name.split(" ")[0]}</span>
                  </div>
                )}
                {tk.due && (
                  <div style={{ fontSize: 11, color: isOverdue ? "#EF4444" : C.g400, minWidth: 70, textAlign: "right" }}>
                    {fmt(new Date(tk.due))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
