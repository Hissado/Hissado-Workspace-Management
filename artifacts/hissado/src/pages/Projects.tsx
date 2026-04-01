import { useState } from "react";
import { C, SH, Av, Btn, PBar } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Project, Task, User } from "@/lib/data";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useIsMobile } from "@/hooks/use-mobile";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const FolderIcon2 = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>;
const TrashIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" /></svg>;

interface ProjectsProps {
  projects: Project[];
  tasks: Task[];
  users: User[];
  onAdd: () => void;
  onProjectClick: (p: Project) => void;
  canCreate?: boolean;
  canDelete?: boolean;
  onDelete?: (id: string) => void;
}

const STATUS_STYLES: Record<string, { bg: string; c: string; dot: string }> = {
  active: { bg: "#ECFDF5", c: "#065F46", dot: "#10B981" },
  "on-hold": { bg: "#FFFBEB", c: "#92400E", dot: "#F59E0B" },
  completed: { bg: "#EFF6FF", c: "#1E40AF", dot: "#3B82F6" },
};

export default function Projects({ projects, tasks, users, onAdd, onProjectClick, canCreate, canDelete, onDelete }: ProjectsProps) {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const [confirmDelete, setConfirmDelete] = useState<Project | null>(null);

  const STATUS_LABELS_LOCAL: Record<string, string> = lang === "fr"
    ? { active: "Actif", "on-hold": "En pause", completed: "Terminé" }
    : { active: "Active", "on-hold": "On Hold", completed: "Completed" };

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const activeCount = projects.filter((p) => p.status === "active").length;
  const holdCount = projects.filter((p) => p.status === "on-hold").length;
  const doneCount = projects.filter((p) => p.status === "completed").length;

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Page header */}
      <div style={{
        display: "flex", flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "flex-start",
        gap: isMobile ? 12 : 0, marginBottom: isMobile ? 20 : 32,
      }}>
        <div>
          <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: "0 0 6px", letterSpacing: "-.01em" }}>{t.proj_title}</h2>
          <div style={{ display: "flex", gap: isMobile ? 12 : 20, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { label: STATUS_LABELS_LOCAL.active, count: activeCount, color: "#10B981" },
              { label: STATUS_LABELS_LOCAL["on-hold"], count: holdCount, color: "#F59E0B" },
              { label: STATUS_LABELS_LOCAL.completed, count: doneCount, color: "#3B82F6" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: C.g500, fontWeight: 500 }}>
                  <span style={{ fontWeight: 700, color: C.g700 }}>{item.count}</span> {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        {canCreate && (
          <Btn onClick={onAdd} data-testid="new-project-btn" icon={<PlusIcon />} style={isMobile ? { alignSelf: "flex-start" } : {}}>
            {t.proj_new}
          </Btn>
        )}
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "80px 20px",
          background: C.w, borderRadius: 20, border: `1px solid ${C.g100}`,
          boxShadow: SH.sm,
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: `${C.gold}10`, border: `1px solid ${C.gold}25`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px", color: C.gold,
          }}>
            <FolderIcon2 />
          </div>
          <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 8, fontFamily: "'Playfair Display',serif" }}>{t.proj_no_projects}</div>
          <div style={{ fontSize: 13.5, color: C.g400, marginBottom: 24 }}>{t.proj_no_projects_desc}</div>
          {canCreate && <Btn onClick={onAdd} data-testid="new-project-btn" icon={<PlusIcon />}>{t.proj_new}</Btn>}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
          {projects.map((p) => {
            const pTasks = tasks.filter((x) => x.pId === p.id);
            const done = pTasks.filter((x) => x.status === "Done").length;
            const ip = pTasks.filter((x) => x.status === "In Progress").length;
            const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
            const members = p.members.map((id) => userMap[id]).filter(Boolean);
            const ss = STATUS_STYLES[p.status] || { bg: C.g100, c: C.g500, dot: C.g400 };

            return (
              <div
                key={p.id}
                onClick={() => onProjectClick(p)}
                data-testid={`project-card-${p.id}`}
                style={{
                  background: C.w, borderRadius: 18, padding: "24px",
                  border: `1px solid ${C.g100}`, boxShadow: SH.sm,
                  cursor: "pointer", transition: "box-shadow .2s, transform .2s",
                  display: "flex", flexDirection: "column", gap: 0,
                  position: "relative", overflow: "hidden",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.lg; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {/* Color top accent */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${p.color},${p.color}70)`, borderRadius: "18px 18px 0 0" }} />

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, marginTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: `${p.color}14`, border: `1.5px solid ${p.color}28`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}70` }} />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: C.navy, lineHeight: 1.25, margin: 0 }}>{p.name}</h3>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{
                      fontSize: 10.5, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                      background: ss.bg, color: ss.c,
                      border: `1px solid ${ss.dot}30`,
                      letterSpacing: ".04em", textTransform: "uppercase",
                      display: "flex", alignItems: "center", gap: 5,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: ss.dot }} />
                      {STATUS_LABELS_LOCAL[p.status] || p.status}
                    </span>
                    {canDelete && onDelete && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setConfirmDelete(p); }}
                        data-testid={`delete-project-${p.id}`}
                        title="Delete project"
                        style={{
                          width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.g200}`,
                          background: C.w, cursor: "pointer", color: C.g400,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all .15s", flexShrink: 0,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = C.err; e.currentTarget.style.borderColor = "#FECACA"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g400; e.currentTarget.style.borderColor = C.g200; }}
                      >
                        <TrashIcon />
                      </button>
                    )}
                  </div>
                </div>

                {p.desc && (
                  <p style={{ fontSize: 12.5, color: C.g400, marginBottom: 16, lineHeight: 1.55, margin: "0 0 16px" }}>
                    {p.desc}
                  </p>
                )}

                {/* Progress */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, alignItems: "center" }}>
                    <span style={{ fontSize: 11.5, color: C.g400, fontWeight: 500 }}>{t.progress}</span>
                    <span style={{
                      fontSize: 13, fontWeight: 800,
                      color: pct >= 100 ? C.ok : pct >= 50 ? C.gold : C.g600,
                    }}>{pct}%</span>
                  </div>
                  <PBar value={pct} color={p.color} h={7} />
                </div>

                {/* Stats strip */}
                <div style={{
                  display: "flex", gap: 0,
                  borderRadius: 10, overflow: "hidden",
                  background: C.g50, border: `1px solid ${C.g100}`,
                  marginBottom: 16,
                }}>
                  {[
                    { label: t.proj_total_tasks, value: pTasks.length },
                    { label: t.proj_in_progress_label, value: ip },
                    { label: t.task_done, value: done },
                  ].map((stat, idx) => (
                    <div key={idx} style={{
                      flex: 1, padding: "8px 10px", textAlign: "center",
                      borderRight: idx < 2 ? `1px solid ${C.g100}` : "none",
                    }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: C.navy, lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: 10, color: C.g400, marginTop: 2, fontWeight: 500, letterSpacing: ".02em" }}>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Members */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex" }}>
                    {members.slice(0, 5).map((m, i) => (
                      <div key={m.id} style={{ marginLeft: i > 0 ? -10 : 0, border: `2px solid ${C.w}`, borderRadius: "50%" }}>
                        <Av ini={m.av} size={28} />
                      </div>
                    ))}
                    {members.length > 5 && (
                      <div style={{
                        marginLeft: -10, width: 28, height: 28, borderRadius: "50%",
                        background: C.g100, border: `2px solid ${C.w}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 9, fontWeight: 700, color: C.g500,
                      }}>+{members.length - 5}</div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 11, color: C.g400, fontWeight: 500,
                    background: C.g50, padding: "3px 8px", borderRadius: 6,
                    border: `1px solid ${C.g100}`,
                  }}>
                    {members.length} {lang === "fr" ? "membres" : "members"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm delete dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={lang === "fr" ? "Supprimer le projet" : "Delete Project"}
        message={
          lang === "fr"
            ? `Êtes-vous sûr de vouloir supprimer "${confirmDelete?.name}" ? Toutes les tâches, fichiers et conversations associés seront définitivement supprimés.`
            : `Are you sure you want to delete "${confirmDelete?.name}"? All associated tasks, files, and conversations will be permanently removed.`
        }
        confirmLabel={lang === "fr" ? "Supprimer" : "Delete Project"}
        cancelLabel={lang === "fr" ? "Annuler" : "Cancel"}
        onConfirm={() => { if (confirmDelete) onDelete?.(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
