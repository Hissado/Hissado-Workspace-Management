import { C, SH, Av, PBar, StatusBadge, PriorityBadge, Card, SectionHeader } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Project, Task, User } from "@/lib/data";
import { fmt, fmtT } from "@/lib/data";

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onTaskClick?: (t: Task) => void;
}

const statIcons = [
  // Active Projects
  <svg key="proj" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>,
  // Completed
  <svg key="done" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  // In Progress
  <svg key="ip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>,
  // Overdue
  <svg key="od" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
];

export default function Dashboard({ projects, tasks, users, onTaskClick }: DashboardProps) {
  const { t } = useI18n();
  const isMobile = useIsMobile();

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
    {
      label: t.dash_active_projects, value: activeProjects,
      sub: `${projects.length} ${t.dash_total}`,
      color: "#4F7CEC", light: "#EFF4FF",
    },
    {
      label: t.dash_completed, value: doneTasks,
      sub: `${totalTasks} ${t.dash_tasks_active}`,
      color: C.ok, light: C.okL,
    },
    {
      label: t.dash_in_progress, value: ipTasks,
      sub: `${Math.round(totalTasks > 0 ? (ipTasks / totalTasks) * 100 : 0)}% ${t.progress}`,
      color: C.gold, light: C.goldPale,
    },
    {
      label: t.dash_overdue, value: overdueTasks,
      sub: `${overdueTasks} ${t.dash_tasks_past_due}`,
      color: C.err, light: C.errL,
    },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2,1fr)" : "repeat(4,1fr)", gap: isMobile ? 12 : 20, marginBottom: isMobile ? 16 : 28 }}>
        {stats.map((s, i) => (
          <div key={i} className="fade-in" style={{
            background: C.w, borderRadius: 16,
            border: `1px solid ${C.g100}`,
            boxShadow: SH.sm,
            padding: "22px 24px",
            position: "relative", overflow: "hidden",
            transition: "box-shadow .2s, transform .2s",
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.md; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            {/* Accent bar top */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${s.color},${s.color}60)`, borderRadius: "16px 16px 0 0" }} />
            <div style={{
              width: 40, height: 40, borderRadius: 12, marginBottom: 16,
              background: s.light, display: "flex", alignItems: "center", justifyContent: "center",
              color: s.color,
            }}>
              {statIcons[i]}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.navy, marginBottom: 4, fontFamily: "'Playfair Display',serif", lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.g700, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: 11.5, color: C.g400 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 300px", gap: isMobile ? 16 : 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Projects progress */}
          <Card style={{ padding: 28 }}>
            <SectionHeader title={t.dash_projects_section} sub={`${activeProjects} active projects`} />
            {projects.filter((p) => p.status === "active").length === 0 && (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.g400, fontSize: 13 }}>{t.proj_no_projects_desc}</div>
            )}
            {projects.filter((p) => p.status === "active").slice(0, 6).map((p, idx, arr) => {
              const pTasks = tasks.filter((x) => x.pId === p.id);
              const done = pTasks.filter((x) => x.status === "Done").length;
              const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
              const members = p.members.map((id) => userMap[id]).filter(Boolean);
              return (
                <div key={p.id} style={{
                  marginBottom: idx < arr.length - 1 ? 20 : 0,
                  paddingBottom: idx < arr.length - 1 ? 20 : 0,
                  borderBottom: idx < arr.length - 1 ? `1px solid ${C.g50}` : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                      <div style={{
                        width: 10, height: 10, borderRadius: "50%", background: p.color, flexShrink: 0,
                        boxShadow: `0 0 6px ${p.color}70`,
                      }} />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: C.navy }}>{p.name}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ display: "flex" }}>
                        {members.slice(0, 3).map((m, i) => (
                          <div key={m.id} style={{ marginLeft: i > 0 ? -10 : 0, border: `2px solid ${C.w}`, borderRadius: "50%" }}>
                            <Av ini={m.av} size={24} />
                          </div>
                        ))}
                        {members.length > 3 && (
                          <div style={{
                            marginLeft: -10, width: 24, height: 24, borderRadius: "50%",
                            background: C.g100, border: `2px solid ${C.w}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 9, fontWeight: 700, color: C.g500,
                          }}>+{members.length - 3}</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 12.5, fontWeight: 700,
                        color: pct >= 100 ? C.ok : pct >= 50 ? C.gold : C.g500,
                        minWidth: 32, textAlign: "right",
                      }}>{pct}%</span>
                    </div>
                  </div>
                  <PBar value={pct} color={p.color} h={6} />
                  <div style={{ fontSize: 11, color: C.g400, marginTop: 5 }}>{done}/{pTasks.length} {t.dash_completed.toLowerCase()}</div>
                </div>
              );
            })}
          </Card>

          {/* Recent tasks table */}
          <Card style={{ padding: 28 }}>
            <SectionHeader title={t.dash_recent} sub={`${recent.length} recent tasks`} />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: C.g50 }}>
                    {[t.dash_task, t.dash_status, t.dash_priority, t.dash_assignee, t.dash_due].map((h) => (
                      <th key={h} style={{
                        fontSize: 10.5, color: C.g400, fontWeight: 700, textTransform: "uppercase",
                        letterSpacing: ".09em", padding: "10px 12px", textAlign: "left",
                        borderBottom: `1px solid ${C.g100}`,
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recent.map((tk, idx) => {
                    const assignee = userMap[tk.assignee];
                    const isOverdue = tk.due && new Date(tk.due) < new Date() && tk.status !== "Done";
                    return (
                      <tr
                        key={tk.id}
                        onClick={() => onTaskClick?.(tk)}
                        data-testid={`task-row-${tk.id}`}
                        style={{ cursor: "pointer", borderBottom: idx < recent.length - 1 ? `1px solid ${C.g50}` : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = C.g50)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "12px 12px", fontSize: 13, color: C.navy, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>{tk.title}</td>
                        <td style={{ padding: "12px 12px" }}><StatusBadge status={tk.status} /></td>
                        <td style={{ padding: "12px 12px" }}><PriorityBadge pri={tk.pri} /></td>
                        <td style={{ padding: "12px 12px" }}>
                          {assignee
                            ? <div style={{ display: "flex", alignItems: "center", gap: 7 }}><Av ini={assignee.av} size={24} /><span style={{ fontSize: 12.5, color: C.g600, fontWeight: 500 }}>{assignee.name.split(" ")[0]}</span></div>
                            : <span style={{ color: C.g300 }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 12px 12px 0", fontSize: 12.5, fontWeight: 500, color: isOverdue ? C.err : C.g500, whiteSpace: "nowrap" }}>
                          {isOverdue && <span style={{ marginRight: 4 }}>⚠</span>}
                          {tk.due ? fmt(new Date(tk.due)) : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Upcoming sidebar */}
        <div>
          <Card style={{ padding: 24 }}>
            <SectionHeader title={t.dash_upcoming} />
            {upcoming.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: C.g400, fontSize: 13 }}>{t.dash_no_upcoming}</div>
            ) : upcoming.map((tk, idx) => {
              const p = projectMap[tk.pId];
              const overdue = tk.due && new Date(tk.due) < new Date();
              return (
                <div
                  key={tk.id}
                  onClick={() => onTaskClick?.(tk)}
                  style={{
                    padding: "12px 0",
                    borderBottom: idx < upcoming.length - 1 ? `1px solid ${C.g50}` : "none",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateX(2px)"; }}
                  onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateX(0)"; }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {p && (
                      <div style={{
                        width: 3, height: 36, borderRadius: 2, background: p.color,
                        flexShrink: 0, marginTop: 2,
                        boxShadow: `0 0 6px ${p.color}60`,
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.navy, fontWeight: 600, marginBottom: 5, lineHeight: 1.3 }}>{tk.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                        <PriorityBadge pri={tk.pri} />
                        {tk.due && (
                          <span style={{
                            fontSize: 11, fontWeight: 600,
                            color: overdue ? C.err : C.g400,
                            display: "flex", alignItems: "center", gap: 3,
                          }}>
                            {overdue && "⚠"}{fmtT(tk.due)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}
