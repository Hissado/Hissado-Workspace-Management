import { C, Av, Btn, PBar } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, Task, User } from "@/lib/data";

const PlusIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onAdd: () => void;
  onProjectClick: (p: Project) => void;
  canCreate?: boolean;
}

const STATUS_BG: Record<string, string> = {
  active: "#DCF5E9", "on-hold": "#FEF3C7", completed: "#EEF2FF",
};
const STATUS_TEXT: Record<string, string> = {
  active: "#059669", "on-hold": "#D97706", completed: "#6366F1",
};

export default function Projects({ projects, tasks, users, onAdd, onProjectClick, canCreate }: ProjectsProps) {
  const { t, lang } = useI18n();

  const STATUS_LABELS_LOCAL: Record<string, string> = lang === "fr"
    ? { active: "Actif", "on-hold": "En pause", completed: "Terminé" }
    : { active: "Active", "on-hold": "On Hold", completed: "Completed" };

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <div style={{ padding: "32px 32px 60px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>{t.proj_title}</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>{projects.length} {t.proj_projects}</p>
        </div>
        {canCreate && (
          <Btn onClick={onAdd} data-testid="new-project-btn">
            <PlusIcon /> {t.proj_new}
          </Btn>
        )}
      </div>

      {projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: C.g400 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.navy, marginBottom: 6 }}>{t.proj_no_projects}</div>
          <div style={{ fontSize: 13 }}>{t.proj_no_projects_desc}</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 20 }}>
          {projects.map((p) => {
            const pTasks = tasks.filter((x) => x.pId === p.id);
            const done = pTasks.filter((x) => x.status === "Done").length;
            const ip = pTasks.filter((x) => x.status === "In Progress").length;
            const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
            const members = p.members.map((id) => userMap[id]).filter(Boolean);

            return (
              <div
                key={p.id}
                onClick={() => onProjectClick(p)}
                data-testid={`project-card-${p.id}`}
                style={{
                  background: C.w, borderRadius: 16, padding: "24px",
                  border: `1px solid ${C.g100}`, boxShadow: "0 2px 8px rgba(0,0,0,.04)",
                  cursor: "pointer", transition: "box-shadow .2s,transform .2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color }} />
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{p.name}</h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: STATUS_BG[p.status] || C.g100, color: STATUS_TEXT[p.status] || C.g500 }}>
                    {STATUS_LABELS_LOCAL[p.status] || p.status}
                  </span>
                </div>

                {p.desc && <p style={{ fontSize: 12, color: C.g400, marginBottom: 16, lineHeight: 1.5 }}>{p.desc}</p>}

                {/* Progress */}
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: C.g500 }}>{t.progress}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{pct}%</span>
                  </div>
                  <PBar value={pct} color={p.color} h={5} />
                </div>

                {/* Stats */}
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: C.g400, marginBottom: 14 }}>
                  <span>{pTasks.length} {t.proj_total_tasks}</span>
                  <span>{ip} {t.proj_in_progress_label}</span>
                  <span>{done} {t.task_done.toLowerCase()}</span>
                </div>

                {/* Members */}
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {members.slice(0, 5).map((m, i) => (
                    <div key={m.id} style={{ marginLeft: i > 0 ? -8 : 0 }}>
                      <Av ini={m.av} size={26} />
                    </div>
                  ))}
                  {members.length > 5 && (
                    <span style={{ fontSize: 11, color: C.g400, marginLeft: 6 }}>+{members.length - 5}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
