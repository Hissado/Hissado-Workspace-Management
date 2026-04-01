import { C, PBar } from "@/components/primitives";
import { useI18n, STATUS_LABELS, PRIORITY_LABELS } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, Project, User } from "@/lib/data";

interface ReportsProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ background: C.w, borderRadius: 16, padding: 24, border: `1px solid ${C.g100}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 20 }}>{title}</h3>
      {children}
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: C.g600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{value}</span>
      </div>
      <PBar value={pct} color={color} h={6} />
    </div>
  );
}

export default function Reports({ tasks, projects, users }: ReportsProps) {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();

  const doneTasks = tasks.filter((x) => x.status === "Done").length;
  const overdueTasks = tasks.filter((x) => x.due && new Date(x.due) < new Date() && x.status !== "Done").length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const completionRate = tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;
  const STATUS_COLORS_CHART: Record<string, string> = { "To Do": C.g300, "In Progress": C.gold, "In Review": "#8B5CF6", "Done": "#10B981" };

  const PRIORITIES = ["Urgent", "High", "Medium", "Low"] as const;
  const PRIORITY_COLORS_CHART: Record<string, string> = { Urgent: "#EF4444", High: C.gold, Medium: "#3B82F6", Low: "#10B981" };

  const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, tasks.filter((x) => x.status === s).length]));
  const priorityCounts = Object.fromEntries(PRIORITIES.map((p) => [p, tasks.filter((x) => x.pri === p).length]));

  const workloadCounts = Object.fromEntries(users.map((u) => [u.id, tasks.filter((x) => x.assignee === u.id && x.status !== "Done").length]));
  const maxWorkload = Math.max(...Object.values(workloadCounts), 1);

  const stats = [
    { label: t.rep_total_tasks, value: tasks.length, color: "#4F7CEC" },
    { label: t.rep_completion, value: `${completionRate}%`, color: "#10B981" },
    { label: t.rep_overdue, value: overdueTasks, color: "#EF4444" },
    { label: t.rep_active_projects, value: activeProjects, color: C.gold },
  ];

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.rep_title}</h2>
        <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>{t.rep_subtitle}</p>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            background: C.w, borderRadius: 14, padding: "20px 24px",
            border: `1px solid ${C.g100}`, boxShadow: "0 2px 8px rgba(0,0,0,.05)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color, opacity: .7 }} />
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, marginBottom: 4, fontFamily: "'Playfair Display',serif" }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: C.g500, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
        <Card title={t.rep_by_status}>
          {STATUSES.map((s) => (
            <Bar key={s} label={STATUS_LABELS[s][lang]} value={statusCounts[s]} max={tasks.length} color={STATUS_COLORS_CHART[s]} />
          ))}
        </Card>

        <Card title={t.rep_by_priority}>
          {PRIORITIES.map((p) => (
            <Bar key={p} label={PRIORITY_LABELS[p][lang]} value={priorityCounts[p]} max={tasks.length} color={PRIORITY_COLORS_CHART[p]} />
          ))}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card title={t.rep_project_progress}>
          {projects.map((p) => {
            const pTasks = tasks.filter((x) => x.pId === p.id);
            const done = pTasks.filter((x) => x.status === "Done").length;
            const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
            return (
              <div key={p.id} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                    <span style={{ fontSize: 13, color: C.g600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{pct}%</span>
                </div>
                <PBar value={pct} color={p.color} h={6} />
              </div>
            );
          })}
        </Card>

        <Card title={t.rep_team_workload}>
          {users.map((u) => (
            <Bar key={u.id} label={u.name} value={workloadCounts[u.id] || 0} max={maxWorkload} color={C.gold} />
          ))}
        </Card>
      </div>
    </div>
  );
}
