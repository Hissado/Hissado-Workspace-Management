import { C, PBar } from "@/components/primitives";
import type { Task, Project, User } from "@/lib/data";

interface ReportsProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
}

function Card({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.g100}`, padding: "20px 24px" }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 16 }}>{title}</h3>
      {children}
    </div>
  );
}

function SimpleBar({ label, value, max, color = C.gold }: { label: string; value: number; max: number; color?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.g600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{value}</span>
      </div>
      <PBar value={max > 0 ? (value / max) * 100 : 0} color={color} />
    </div>
  );
}

export default function Reports({ tasks, projects, users }: ReportsProps) {
  const statuses = ["To Do", "In Progress", "In Review", "Done"] as const;
  const statusCounts = statuses.map((s) => ({ s, v: tasks.filter((t) => t.status === s).length }));
  const maxStatus = Math.max(...statusCounts.map((s) => s.v), 1);

  const prioLabels = ["Urgent", "High", "Medium", "Low"];
  const prioCounts = prioLabels.map((p) => ({ p, v: tasks.filter((t) => t.pri === p).length }));
  const maxPrio = Math.max(...prioCounts.map((p) => p.v), 1);

  const projStats = projects.map((p) => {
    const pt = tasks.filter((t) => t.pId === p.id);
    const done = pt.filter((t) => t.status === "Done").length;
    return { ...p, total: pt.length, done, prog: pt.length ? Math.round((done / pt.length) * 100) : 0 };
  }).sort((a, b) => b.prog - a.prog);

  const memberStats = users.filter((u) => u.status === "active").map((u) => {
    const assigned = tasks.filter((t) => t.assignee === u.id);
    const done = assigned.filter((t) => t.status === "Done").length;
    return { ...u, assigned: assigned.length, done };
  }).sort((a, b) => b.assigned - a.assigned);
  const maxMemberAssigned = Math.max(...memberStats.map((m) => m.assigned), 1);

  const statusColors: Record<string, string> = { "To Do": C.g400, "In Progress": C.info, "In Review": C.warn, Done: C.ok };
  const prioColors: Record<string, string> = { Urgent: "#DC2626", High: "#EA580C", Medium: C.warn, Low: C.ok };

  // Completion rate over time (last 6 months)
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { label: d.toLocaleDateString("en", { month: "short" }), year: d.getFullYear(), month: d.getMonth() };
  });

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>Reports & Analytics</h2>
        <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>Project and team performance overview</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          { l: "Total Tasks", v: tasks.length, c: C.navy },
          { l: "Completion Rate", v: `${tasks.length ? Math.round((tasks.filter(t => t.status === "Done").length / tasks.length) * 100) : 0}%`, c: C.ok },
          { l: "Overdue", v: tasks.filter(t => t.due < new Date().toISOString().slice(0, 10) && t.status !== "Done").length, c: C.err },
          { l: "Active Projects", v: projects.filter(p => p.status === "active").length, c: C.info },
        ].map((s) => (
          <div key={s.l} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${C.g100}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.g400, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{s.l}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.c, fontFamily: "'Playfair Display',serif" }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* By status */}
        <Card title="Tasks by Status">
          {statusCounts.map(({ s, v }) => (
            <SimpleBar key={s} label={s} value={v} max={maxStatus} color={statusColors[s]} />
          ))}
        </Card>

        {/* By priority */}
        <Card title="Tasks by Priority">
          {prioCounts.map(({ p, v }) => (
            <SimpleBar key={p} label={p} value={v} max={maxPrio} color={prioColors[p]} />
          ))}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Project progress */}
        <Card title="Project Progress">
          {projStats.map((p) => (
            <div key={p.id} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: C.g600, display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
                  {p.name}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{p.prog}%</span>
              </div>
              <PBar value={p.prog} color={p.color} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                <span style={{ fontSize: 10, color: C.g400 }}>{p.done}/{p.total} tasks</span>
              </div>
            </div>
          ))}
        </Card>

        {/* Team workload */}
        <Card title="Team Workload">
          {memberStats.slice(0, 8).map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(135deg,${C.gold},${C.goldD})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{m.av}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.g600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</span>
                  <span style={{ fontSize: 11, color: C.g400, flexShrink: 0 }}>{m.done}/{m.assigned}</span>
                </div>
                <PBar value={maxMemberAssigned > 0 ? (m.assigned / maxMemberAssigned) * 100 : 0} h={4} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
