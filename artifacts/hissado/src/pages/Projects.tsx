import { C, Av, Btn, PBar, StatusBadge } from "@/components/primitives";
import type { Project, Task, User } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onAdd: () => void;
  onProjectClick: (p: Project) => void;
}

export default function Projects({ projects, tasks, users, onAdd, onProjectClick }: ProjectsProps) {
  return (
    <div className="fade-in" style={{ padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>All Projects</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{projects.length} projects</p>
        </div>
        <Btn onClick={onAdd} icon={<PlusIcon />} data-testid="add-project-btn">New Project</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
        {projects.map((p) => {
          const pTasks = tasks.filter((t) => t.pId === p.id);
          const done = pTasks.filter((t) => t.status === "Done").length;
          const inProgress = pTasks.filter((t) => t.status === "In Progress").length;
          const prog = pTasks.length ? Math.round((done / pTasks.length) * 100) : 0;
          const owner = users.find((u) => u.id === p.owner);
          const members = p.members.map((id) => users.find((u) => u.id === id)).filter(Boolean);

          return (
            <div
              key={p.id}
              onClick={() => onProjectClick(p)}
              data-testid={`project-card-${p.id}`}
              className="fade-in"
              style={{
                background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`,
                padding: "20px 22px", cursor: "pointer", transition: "all .15s",
                boxShadow: "0 1px 4px rgba(0,0,0,.04)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${p.color}50`; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,.07)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,.04)"; }}
            >
              {/* Color bar */}
              <div style={{ height: 4, borderRadius: 4, background: p.color, marginBottom: 16 }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{p.name}</h3>
                <StatusBadge status={p.status === "active" ? "In Progress" : "To Do"} />
              </div>

              <p style={{ fontSize: 12, color: C.g400, marginBottom: 16, lineHeight: 1.5 }}>{p.desc}</p>

              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: C.g500 }}>Progress</span>
                  <span style={{ fontSize: 11, color: C.g400 }}>{done}/{pTasks.length} tasks</span>
                </div>
                <PBar value={prog} color={p.color} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex" }}>
                  {(members as User[]).slice(0, 4).map((m, i) => (
                    <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0, border: "2px solid #fff", borderRadius: "50%", zIndex: 4 - i }}>
                      <Av ini={m.av} size={26} />
                    </div>
                  ))}
                  {members.length > 4 && (
                    <div style={{ marginLeft: -8, width: 28, height: 28, borderRadius: "50%", background: C.g200, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: C.g500 }}>
                      +{members.length - 4}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 11, color: C.g400 }}>
                  {inProgress} in progress
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
