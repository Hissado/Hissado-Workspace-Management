import { C, Av, PBar, StatusBadge, PriorityBadge } from "@/components/primitives";
import type { Project, Task, User } from "@/lib/data";
import { fmt } from "@/lib/data";

const now = new Date();
const todayStr = fmt(now);

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="fade-in" style={{ background: C.w, borderRadius: 14, padding: "20px 24px", border: `1px solid ${C.g100}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.g400, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, color: color || C.navy, fontFamily: "'Playfair Display',serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.g400, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onTaskClick: (t: Task) => void;
}

export default function Dashboard({ projects, tasks, users, onTaskClick }: DashboardProps) {
  const activeProjCount = projects.filter((p) => p.status === "active").length;
  const doneCount = tasks.filter((t) => t.status === "Done").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const overdueCount = tasks.filter((t) => t.due < todayStr && t.status !== "Done").length;

  const recentTasks = [...tasks].sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()).slice(0, 5);
  const upcomingTasks = tasks.filter((t) => t.status !== "Done" && t.due >= todayStr).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5);

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Active Projects" value={activeProjCount} sub={`${projects.length} total`} />
        <StatCard label="Tasks Completed" value={doneCount} sub={`${tasks.length} total`} color={C.ok} />
        <StatCard label="In Progress" value={inProgressCount} sub="tasks active" color={C.info} />
        <StatCard label="Overdue" value={overdueCount} sub="tasks past due" color={overdueCount > 0 ? C.err : C.ok} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Projects overview */}
        <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, padding: "20px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Projects</h3>
          {projects.map((p) => {
            const pTasks = tasks.filter((t) => t.pId === p.id);
            const done = pTasks.filter((t) => t.status === "Done").length;
            const prog = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.g700 }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 11, color: C.g400 }}>{done}/{pTasks.length}</span>
                </div>
                <PBar value={prog} color={p.color} />
              </div>
            );
          })}
        </div>

        {/* Upcoming tasks */}
        <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, padding: "20px 24px" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Upcoming Due</h3>
          {upcomingTasks.length === 0 ? (
            <p style={{ fontSize: 13, color: C.g400 }}>No upcoming tasks</p>
          ) : (
            upcomingTasks.map((t) => {
              const assignee = users.find((u) => u.id === t.assignee);
              return (
                <div
                  key={t.id}
                  onClick={() => onTaskClick(t)}
                  data-testid={`dashboard-task-${t.id}`}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: `1px solid ${C.g50}`, cursor: "pointer" }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.g700 }}>{t.title}</div>
                    <div style={{ fontSize: 11, color: C.g400, marginTop: 2 }}>{t.due}</div>
                  </div>
                  <PriorityBadge pri={t.pri} />
                  {assignee && <Av ini={assignee.av} size={24} />}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent tasks */}
      <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 16 }}>Recent Tasks</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Task", "Status", "Priority", "Assignee", "Due"].map((h) => (
                  <th key={h} style={{ textAlign: "left", fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".04em", padding: "0 12px 12px 0" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((t) => {
                const assignee = users.find((u) => u.id === t.assignee);
                const isOverdue = t.due < todayStr && t.status !== "Done";
                return (
                  <tr
                    key={t.id}
                    onClick={() => onTaskClick(t)}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = C.g50)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    data-testid={`dashboard-recent-task-${t.id}`}
                  >
                    <td style={{ padding: "10px 12px 10px 0", fontSize: 13, fontWeight: 500, color: C.navy, borderBottom: `1px solid ${C.g50}` }}>{t.title}</td>
                    <td style={{ padding: "10px 12px 10px 0", borderBottom: `1px solid ${C.g50}` }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: "10px 12px 10px 0", borderBottom: `1px solid ${C.g50}` }}><PriorityBadge pri={t.pri} /></td>
                    <td style={{ padding: "10px 12px 10px 0", borderBottom: `1px solid ${C.g50}` }}>
                      {assignee ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Av ini={assignee.av} size={22} />
                          <span style={{ fontSize: 12, color: C.g500 }}>{assignee.name}</span>
                        </div>
                      ) : "—"}
                    </td>
                    <td style={{ padding: "10px 0", fontSize: 12, color: isOverdue ? C.err : C.g400, borderBottom: `1px solid ${C.g50}` }}>{t.due}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
