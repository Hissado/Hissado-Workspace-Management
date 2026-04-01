import { C, Av, PBar, StatusBadge, PriorityBadge } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, Task, User } from "@/lib/data";
import { fmt, fmtT } from "@/lib/data";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onTaskClick?: (t: Task) => void;
}

export default function Dashboard({ projects, tasks, users, onTaskClick }: DashboardProps) {
  const { t } = useI18n();

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((x) => x.status === "Done").length;
  const ipTasks = tasks.filter((x) => x.status === "In Progress").length;
  const overdueTasks = tasks.filter((x) => x.due && new Date(x.due) < new Date() && x.status !== "Done").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;

  const upcoming = tasks
    .filter((x) => x.due && x.status !== "Done")
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime())
    .slice(0, 5);

  const recent = tasks.slice().reverse().slice(0, 8);
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  const stats = [
    { label: t.dash_active_projects, value: activeProjects, sub: `${projects.length} ${t.dash_total}`, color: "#4F7CEC" },
    { label: t.dash_completed, value: doneTasks, sub: `${totalTasks} ${t.dash_tasks_active}`, color: "#10B981" },
    { label: t.dash_in_progress, value: ipTasks, sub: `${Math.round(totalTasks > 0 ? (ipTasks / totalTasks) * 100 : 0)}% ${t.progress}`, color: C.gold },
    { label: t.dash_overdue, value: overdueTasks, sub: `${overdueTasks} ${t.dash_tasks_past_due}`, color: "#EF4444" },
  ];

  return (
    <div style={{ padding: "32px 32px 60px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} className="fade-in" style={{ background: C.w, borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.g100}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: s.color }} />
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.g700, marginBottom: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: C.g300 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <div>
          {/* Projects progress */}
          <div style={{ background: C.w, borderRadius: 16, padding: 24, border: `1px solid ${C.g100}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)", marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 20 }}>{t.dash_projects_section}</h3>
            {projects.filter((p) => p.status === "active").length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.g400, fontSize: 13 }}>{t.proj_no_projects_desc}</div>
            )}
            {projects.filter((p) => p.status === "active").slice(0, 6).map((p) => {
              const pTasks = tasks.filter((x) => x.pId === p.id);
              const done = pTasks.filter((x) => x.status === "Done").length;
              const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
              const members = p.members.map((id) => userMap[id]).filter(Boolean);
              return (
                <div key={p.id} style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${C.g50}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex" }}>
                        {members.slice(0, 3).map((m, i) => (
                          <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                            <Av ini={m.av} size={22} />
                          </div>
                        ))}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: C.g400 }}>{pct}%</span>
                    </div>
                  </div>
                  <PBar value={pct} color={p.color} h={5} />
                  <div style={{ fontSize: 11, color: C.g400, marginTop: 4 }}>{done}/{pTasks.length} {t.dash_completed.toLowerCase()}</div>
                </div>
              );
            })}
          </div>

          {/* Recent tasks */}
          <div style={{ background: C.w, borderRadius: 16, padding: 24, border: `1px solid ${C.g100}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 20 }}>{t.dash_recent}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[t.dash_task, t.dash_status, t.dash_priority, t.dash_assignee, t.dash_due].map((h) => (
                    <th key={h} style={{ fontSize: 11, color: C.g400, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", padding: "0 0 12px", textAlign: "left", paddingRight: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((tk) => {
                  const assignee = userMap[tk.assignee];
                  const isOverdue = tk.due && new Date(tk.due) < new Date() && tk.status !== "Done";
                  return (
                    <tr key={tk.id} onClick={() => onTaskClick?.(tk)} data-testid={`task-row-${tk.id}`} style={{ cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.g50)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "10px 12px 10px 0", fontSize: 13, color: C.navy, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.title}</td>
                      <td style={{ padding: "10px 12px 10px 0" }}><StatusBadge status={tk.status} /></td>
                      <td style={{ padding: "10px 12px 10px 0" }}><PriorityBadge pri={tk.pri} /></td>
                      <td style={{ padding: "10px 12px 10px 0" }}>
                        {assignee ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Av ini={assignee.av} size={22} /><span style={{ fontSize: 12, color: C.g500 }}>{assignee.name.split(" ")[0]}</span></div> : <span style={{ color: C.g300 }}>—</span>}
                      </td>
                      <td style={{ padding: "10px 0", fontSize: 12, color: isOverdue ? "#EF4444" : C.g500 }}>{tk.due ? fmt(new Date(tk.due)) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming sidebar */}
        <div>
          <div style={{ background: C.w, borderRadius: 16, padding: 24, border: `1px solid ${C.g100}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 20 }}>{t.dash_upcoming}</h3>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.g400, fontSize: 13 }}>{t.dash_no_upcoming}</div>
            ) : upcoming.map((tk) => {
              const p = projectMap[tk.pId];
              const overdue = tk.due && new Date(tk.due) < new Date();
              return (
                <div key={tk.id} onClick={() => onTaskClick?.(tk)} style={{ padding: "10px 0", borderBottom: `1px solid ${C.g50}`, cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    {p && <div style={{ width: 6, height: 6, borderRadius: "50%", background: p.color, marginTop: 6, flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.navy, fontWeight: 500, marginBottom: 3 }}>{tk.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <PriorityBadge pri={tk.pri} />
                        {tk.due && <span style={{ fontSize: 11, color: overdue ? "#EF4444" : C.g400 }}>{fmtT(tk.due)}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
