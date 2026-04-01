import { useState } from "react";
import { C, SH, Av, Btn, StatusBadge, PriorityBadge, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, Task, User } from "@/lib/data";
import { fmt } from "@/lib/data";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const ClipboardIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /></svg>;
const SortIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" /></svg>;

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
    <div style={{ padding: "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 style={{
            fontSize: 22, fontWeight: 700, color: C.navy,
            fontFamily: "'Playfair Display',serif", margin: "0 0 5px", letterSpacing: "-.01em",
          }}>{t.task_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, margin: 0, fontWeight: 500 }}>
            <span style={{ color: C.g700, fontWeight: 700 }}>{filtered.length}</span> {t.proj_total_tasks}
          </p>
        </div>
        <Btn onClick={onAddTask} data-testid="add-task-btn" icon={<PlusIcon />}>
          {t.task_new}
        </Btn>
      </div>

      {/* Filter bar */}
      <div style={{
        background: C.w, borderRadius: 14, padding: "14px 18px",
        border: `1px solid ${C.g100}`, boxShadow: SH.xs,
        display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap",
        alignItems: "center",
      }}>
        {/* Status pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {STATUS_TABS.map((s) => (
            <button
              key={s.k}
              onClick={() => setStatusFilter(s.k)}
              data-testid={`status-filter-${s.k}`}
              style={{
                padding: "6px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                border: `1px solid ${statusFilter === s.k ? C.navy : C.g200}`,
                background: statusFilter === s.k ? C.navy : "transparent",
                color: statusFilter === s.k ? "#fff" : C.g500,
                transition: "all .15s",
              }}
              onMouseEnter={(e) => {
                if (statusFilter !== s.k) {
                  (e.currentTarget as HTMLElement).style.borderColor = C.g300;
                  (e.currentTarget as HTMLElement).style.color = C.g700;
                }
              }}
              onMouseLeave={(e) => {
                if (statusFilter !== s.k) {
                  (e.currentTarget as HTMLElement).style.borderColor = C.g200;
                  (e.currentTarget as HTMLElement).style.color = C.g500;
                }
              }}
            >
              {s.l}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Dropdowns */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: "7px 32px 7px 12px", border: `1px solid ${C.g200}`,
              borderRadius: 9, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
              background: C.w, cursor: "pointer", color: C.g600, fontWeight: 500,
              outline: "none", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236B7A99' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
            }}
          >
            {PRIORITY_OPTS.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
          </select>

          <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.g400 }}>
            <SortIcon />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              padding: "7px 32px 7px 12px", border: `1px solid ${C.g200}`,
              borderRadius: 9, fontSize: 12, fontFamily: "'DM Sans', sans-serif",
              background: C.w, cursor: "pointer", color: C.g600, fontWeight: 500,
              outline: "none", appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236B7A99' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center",
            }}
          >
            {SORT_OPTS.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}
          </select>
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div style={{
          background: C.w, borderRadius: 16, boxShadow: SH.sm,
          border: `1px solid ${C.g100}`,
        }}>
          <Empty
            icon={<ClipboardIcon />}
            title={t.task_no_tasks}
            desc={t.task_no_tasks_desc}
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
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
                  background: C.w, borderRadius: 13, padding: "14px 20px",
                  border: `1px solid ${isOverdue ? "#FECACA" : C.g100}`,
                  cursor: "pointer", display: "flex",
                  alignItems: "center", gap: 16,
                  boxShadow: SH.xs,
                  transition: "box-shadow .15s, transform .15s, border-color .15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = SH.md;
                  (e.currentTarget as HTMLElement).style.transform = "translateX(2px)";
                  (e.currentTarget as HTMLElement).style.borderColor = isOverdue ? "#FCA5A5" : C.g200;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = SH.xs;
                  (e.currentTarget as HTMLElement).style.transform = "translateX(0)";
                  (e.currentTarget as HTMLElement).style.borderColor = isOverdue ? "#FECACA" : C.g100;
                }}
              >
                {/* Project color dot */}
                {p && (
                  <div style={{
                    width: 3, height: 36, borderRadius: 2, background: p.color,
                    flexShrink: 0, boxShadow: `0 0 6px ${p.color}50`,
                  }} />
                )}

                {/* Task info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 600, color: C.navy,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    marginBottom: 3,
                  }}>{tk.title}</div>
                  <div style={{ fontSize: 12, color: C.g400, fontWeight: 500 }}>{p?.name || "—"}</div>
                </div>

                {/* Status & Priority */}
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <StatusBadge status={tk.status} />
                  <PriorityBadge pri={tk.pri} />
                </div>

                {/* Assignee */}
                {assignee && (
                  <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 90, flexShrink: 0 }}>
                    <Av ini={assignee.av} size={26} />
                    <span style={{ fontSize: 12.5, color: C.g500, fontWeight: 500 }}>{assignee.name.split(" ")[0]}</span>
                  </div>
                )}

                {/* Due date */}
                {tk.due && (
                  <div style={{
                    fontSize: 12, fontWeight: 600,
                    color: isOverdue ? C.err : C.g400,
                    minWidth: 64, textAlign: "right", flexShrink: 0,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    {isOverdue && (
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
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
