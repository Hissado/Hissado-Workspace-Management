import { useState } from "react";
import { C, SH, Av, Btn, PBar, StatusBadge, PriorityBadge, Empty } from "@/components/primitives";
import { useI18n } from "@/lib/i18n";
import type { Service, Task, User, Client, Comment, SubTask } from "@/lib/data";
import { fmt, uid, STATUS_COLORS, PRIORITY_COLORS } from "@/lib/data";
import { useIsMobile } from "@/hooks/use-mobile";

const PlusIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const ListIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>;
const BoardIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>;
const ChevLeft = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const CheckCircleIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const CircleIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /></svg>;
const MessageIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;

const CADENCE_NEXT: Record<string, number> = {
  weekly: 7, monthly: 30, quarterly: 90, annual: 365,
};

interface ServiceDetailProps {
  service: Service;
  tasks: Task[];
  users: User[];
  clients?: Client[];
  currentUser: User;
  canManage?: boolean;
  onAddTask: () => void;
  onTaskClick: (t: Task) => void;
  onTaskUpdate: (t: Task) => void;
  onBack: () => void;
}

const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;
type TStatus = typeof STATUSES[number];

const STATUS_LABELS_MAP: Record<TStatus, { en: string; fr: string }> = {
  "To Do": { en: "To Do", fr: "À faire" },
  "In Progress": { en: "In Progress", fr: "En cours" },
  "In Review": { en: "In Review", fr: "En révision" },
  Done: { en: "Done", fr: "Terminé" },
};

const CADENCE_LABELS: Record<string, { en: string; fr: string }> = {
  weekly: { en: "Weekly", fr: "Hebdomadaire" },
  monthly: { en: "Monthly", fr: "Mensuel" },
  quarterly: { en: "Quarterly", fr: "Trimestriel" },
  annual: { en: "Annual", fr: "Annuel" },
};

export default function ServiceDetail({
  service, tasks, users, clients, currentUser, canManage, onAddTask, onTaskClick, onTaskUpdate, onBack,
}: ServiceDetailProps) {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"list" | "board">("list");
  const [commentText, setCommentText] = useState("");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  const svTasks = tasks.filter((tk) => tk.sId === service.id);
  const doneTasks = svTasks.filter((x) => x.status === "Done").length;
  const ipTasks = svTasks.filter((x) => x.status === "In Progress").length;
  const pct = svTasks.length > 0 ? Math.round((doneTasks / svTasks.length) * 100) : 0;
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const clientMap = Object.fromEntries((clients ?? []).map((c) => [c.id, c]));

  const nextDueDays = CADENCE_NEXT[service.cadence] ?? 30;
  const nextDue = fmt(new Date(new Date(service.created).getTime() + nextDueDays * 24 * 60 * 60 * 1000));

  const statusLabel = (s: TStatus) => lang === "fr" ? STATUS_LABELS_MAP[s].fr : STATUS_LABELS_MAP[s].en;
  const cadenceLabel = lang === "fr" ? CADENCE_LABELS[service.cadence]?.fr : CADENCE_LABELS[service.cadence]?.en;

  const client = service.clientId ? clientMap[service.clientId] : null;

  // Group tasks by section for list view
  const sections: Record<string, Task[]> = {};
  svTasks.forEach((tk) => {
    const sec = tk.section || t.sdet_no_section;
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(tk);
  });

  const addComment = (task: Task) => {
    if (!commentText.trim()) return;
    const comment: Comment = {
      id: uid(),
      uid: currentUser.id,
      text: commentText.trim(),
      date: fmt(new Date()),
    };
    onTaskUpdate({ ...task, cmts: [...(task.cmts || []), comment] });
    setCommentText("");
  };

  const toggleSubtask = (task: Task, sub: SubTask) => {
    const updated = task.subs.map((s) => s.id === sub.id ? { ...s, done: !s.done } : s);
    const doneCount = updated.filter((s) => s.done).length;
    const prog = updated.length > 0 ? Math.round((doneCount / updated.length) * 100) : task.prog;
    onTaskUpdate({ ...task, subs: updated, prog });
  };

  const StatusDot = ({ status }: { status: TStatus }) => {
    const col = STATUS_COLORS[status];
    return (
      <div style={{
        width: 9, height: 9, borderRadius: "50%",
        background: col?.a || C.g300, flexShrink: 0,
      }} />
    );
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const isExpanded = expandedTask === task.id;
    const assigneeUser = userMap[task.assignee];
    const isOverdue = task.due && new Date(task.due) < new Date() && task.status !== "Done";
    const pri = PRIORITY_COLORS[task.pri];
    const completedSubs = task.subs.filter((s) => s.done).length;

    return (
      <div
        style={{
          background: C.w, border: `1px solid ${C.g100}`, borderRadius: 12,
          marginBottom: 8, overflow: "hidden",
          transition: "box-shadow .15s, border-color .15s",
          boxShadow: isExpanded ? SH.md : SH.xs,
          borderColor: isExpanded ? `${service.color}40` : C.g100,
        }}
      >
        {/* Main task row */}
        <div
          style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
        >
          <div style={{ color: task.status === "Done" ? C.ok : C.g300, flexShrink: 0 }}>
            {task.status === "Done" ? <CheckCircleIcon /> : <CircleIcon />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13.5, fontWeight: 600, color: task.status === "Done" ? C.g400 : C.navy,
              textDecoration: task.status === "Done" ? "line-through" : "none",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {task.title}
            </div>
            {task.desc && !isExpanded && (
              <div style={{ fontSize: 11.5, color: C.g400, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {task.desc}
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            {task.subs.length > 0 && (
              <span style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircleIcon />{completedSubs}/{task.subs.length}
              </span>
            )}
            {task.cmts.length > 0 && (
              <span style={{ fontSize: 11, color: C.g400, display: "flex", alignItems: "center", gap: 4 }}>
                <MessageIcon />{task.cmts.length}
              </span>
            )}
            <span style={{
              fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: pri?.bg, color: pri?.t,
            }}>
              {task.pri}
            </span>
            <StatusBadge status={task.status} />
            {task.due && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: isOverdue ? C.err : C.g400,
                padding: "2px 7px", borderRadius: 6,
                background: isOverdue ? "#FEE2E2" : C.g50,
              }}>
                {task.due}
              </span>
            )}
            {assigneeUser && (
              <Av ini={assigneeUser.av} photo={assigneeUser.photo} size={26} />
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onTaskClick(task); }}
              style={{
                width: 26, height: 26, border: `1px solid ${C.g200}`, borderRadius: 6,
                background: C.w, cursor: "pointer", fontSize: 11, color: C.g400,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .12s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${C.gold}12`; e.currentTarget.style.color = C.gold; e.currentTarget.style.borderColor = `${C.gold}40`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.w; e.currentTarget.style.color = C.g400; e.currentTarget.style.borderColor = C.g200; }}
              title="Edit task"
            >
              ✎
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        {isExpanded && (
          <div style={{ padding: "0 16px 16px", borderTop: `1px solid ${C.g50}` }}>
            {task.desc && (
              <p style={{ fontSize: 13, color: C.g500, margin: "12px 0 12px", lineHeight: 1.6 }}>{task.desc}</p>
            )}

            {/* Progress bar */}
            {task.prog > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.g400, marginBottom: 4 }}>
                  <span>{t.sdet_progress}</span>
                  <span>{task.prog}%</span>
                </div>
                <PBar value={task.prog} color={service.color} />
              </div>
            )}

            {/* Subtasks */}
            {task.subs.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                  {t.sdet_subtasks} ({completedSubs}/{task.subs.length})
                </div>
                {task.subs.map((sub) => (
                  <label
                    key={sub.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "6px 8px",
                      borderRadius: 7, cursor: "pointer", marginBottom: 2,
                      background: sub.done ? `${C.ok}10` : C.g50,
                      transition: "background .12s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={sub.done}
                      onChange={() => toggleSubtask(task, sub)}
                      style={{ width: 14, height: 14, accentColor: C.ok, cursor: "pointer" }}
                    />
                    <span style={{
                      fontSize: 13, color: sub.done ? C.g400 : C.g700,
                      textDecoration: sub.done ? "line-through" : "none",
                    }}>
                      {sub.t}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {/* Comments */}
            {task.cmts.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.g500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
                  {t.sdet_comments} ({task.cmts.length})
                </div>
                {task.cmts.map((cmt) => {
                  const author = userMap[cmt.uid];
                  return (
                    <div key={cmt.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      {author && <Av ini={author.av} photo={author.photo} size={28} />}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{author?.name}</span>
                          <span style={{ fontSize: 11, color: C.g400 }}>{cmt.date}</span>
                        </div>
                        <div style={{
                          fontSize: 13, color: C.g600, background: C.g50, borderRadius: 8,
                          padding: "8px 12px", lineHeight: 1.5,
                        }}>
                          {cmt.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add comment */}
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Av ini={currentUser.av} photo={currentUser.photo} size={28} />
              <div style={{ flex: 1, display: "flex", gap: 6 }}>
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={t.sdet_add_comment}
                  onKeyDown={(e) => { if (e.key === "Enter") addComment(task); }}
                  style={{
                    flex: 1, padding: "7px 12px", border: `1px solid ${C.g200}`, borderRadius: 8,
                    fontSize: 13, fontFamily: "inherit", outline: "none", color: C.navy,
                  }}
                />
                <button
                  onClick={() => addComment(task)}
                  style={{
                    padding: "7px 12px", background: C.navy, color: C.w, border: "none",
                    borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
                  }}
                >
                  {t.sdet_post}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          background: C.w, border: `1px solid ${C.g100}`, cursor: "pointer",
          color: C.g500, fontSize: 13, display: "flex", alignItems: "center", gap: 6,
          marginBottom: 20, fontFamily: "'DM Sans', sans-serif", borderRadius: 9,
          padding: "7px 14px", fontWeight: 600, boxShadow: SH.xs, transition: "all .15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.g200; e.currentTarget.style.color = C.g700; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.g100; e.currentTarget.style.color = C.g500; }}
      >
        <ChevLeft /> {t.sdet_back}
      </button>

      {/* Header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        justifyContent: "space-between",
        alignItems: isMobile ? "flex-start" : "flex-start",
        gap: isMobile ? 14 : 0,
        marginBottom: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: `${service.color}18`, border: `1.5px solid ${service.color}30`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: service.color, boxShadow: `0 0 12px ${service.color}80` }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
              <h2 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif", margin: 0, letterSpacing: "-.01em" }}>
                {service.name}
              </h2>
              {client && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20,
                  background: `${client.color}18`, color: client.color,
                  border: `1px solid ${client.color}30`,
                }}>
                  {client.name}
                </span>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: C.g400 }}>{cadenceLabel}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.g300 }} />
              <span style={{
                fontSize: 11, fontWeight: 600, color: service.status === "active" ? "#22C55E" : service.status === "paused" ? "#F59E0B" : "#8B5CF6",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "currentColor" }} />
                {service.status}
              </span>
              {service.desc && (
                <>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.g300 }} />
                  <span style={{ fontSize: 12, color: C.g400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 320 }}>{service.desc}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {canManage && (
          <Btn onClick={onAddTask} style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 7 }}>
            <PlusIcon /> {t.sdet_add_task}
          </Btn>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: t.sdet_total_tasks, value: svTasks.length, color: "#4F7CEC", light: "#EFF4FF" },
          { label: t.sdet_done_tasks, value: doneTasks, color: C.ok, light: "#F0FDF4" },
          { label: t.sdet_ip_tasks, value: ipTasks, color: C.gold, light: C.goldPale },
          { label: t.sdet_progress, value: `${pct}%`, color: service.color, light: `${service.color}10` },
        ].map((stat, i) => (
          <div key={i} style={{
            background: C.w, borderRadius: 14, padding: "16px 18px",
            border: `1px solid ${C.g100}`, boxShadow: SH.xs,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: C.g400, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 6 }}>{stat.label}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {svTasks.length > 0 && (
        <div style={{ background: C.w, borderRadius: 14, padding: "16px 20px", border: `1px solid ${C.g100}`, boxShadow: SH.xs, marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.g500, marginBottom: 8, fontWeight: 600 }}>
            <span>{t.sdet_progress}</span>
            <span>{pct}% — {doneTasks}/{svTasks.length} {t.sdet_done_tasks.toLowerCase()}</span>
          </div>
          <PBar value={pct} color={service.color} h={8} />
        </div>
      )}

      {/* Content area: sidebar + tasks */}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 280px", gap: 24 }}>
        {/* Main: task list / board */}
        <div>
          {/* View toggles */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", background: C.w, border: `1px solid ${C.g100}`, borderRadius: 10, padding: 3, gap: 2 }}>
              {(["list", "board"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  style={{
                    padding: "6px 14px", border: "none", borderRadius: 8, cursor: "pointer",
                    fontSize: 12, fontWeight: view === v ? 600 : 400, fontFamily: "inherit",
                    background: view === v ? C.navy : "transparent",
                    color: view === v ? C.w : C.g500,
                    display: "flex", alignItems: "center", gap: 6, transition: "all .15s",
                  }}
                >
                  {v === "list" ? <ListIcon /> : <BoardIcon />}
                  {v === "list" ? t.sdet_list_view : t.sdet_board_view}
                </button>
              ))}
            </div>
          </div>

          {svTasks.length === 0 ? (
            <div style={{
              background: C.w, borderRadius: 16, border: `2px dashed ${C.g200}`,
              padding: "48px 24px", textAlign: "center",
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, margin: "0 0 8px" }}>{t.sdet_no_tasks}</h3>
              <p style={{ fontSize: 13, color: C.g400, margin: "0 0 20px" }}>{t.sdet_no_tasks_desc}</p>
              {canManage && (
                <Btn onClick={onAddTask}><PlusIcon /> {t.sdet_add_task}</Btn>
              )}
            </div>
          ) : view === "list" ? (
            /* List view grouped by section */
            <div>
              {Object.entries(sections).map(([section, sectionTasks]) => (
                <div key={section} style={{ marginBottom: 24 }}>
                  <div style={{
                    fontSize: 11, fontWeight: 800, color: C.g400, textTransform: "uppercase",
                    letterSpacing: ".12em", marginBottom: 10, display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <div style={{ height: 1, width: 20, background: C.g200 }} />
                    {section}
                    <span style={{
                      fontSize: 10, background: C.g100, color: C.g500, padding: "1px 7px",
                      borderRadius: 10, fontWeight: 700,
                    }}>
                      {sectionTasks.length}
                    </span>
                    <div style={{ flex: 1, height: 1, background: C.g100 }} />
                  </div>
                  {sectionTasks.map((task) => <TaskRow key={task.id} task={task} />)}
                </div>
              ))}
            </div>
          ) : (
            /* Board view */
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)", gap: 14, overflowX: isMobile ? "unset" : "auto" }}>
              {STATUSES.map((col) => {
                const colTasks = svTasks.filter((t) => t.status === col);
                const colColor = STATUS_COLORS[col];
                return (
                  <div key={col} style={{ background: C.g50, borderRadius: 14, padding: 12, minWidth: isMobile ? "unset" : 200 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                      <StatusDot status={col} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: colColor?.t || C.navy }}>{statusLabel(col)}</span>
                      <span style={{
                        marginLeft: "auto", fontSize: 10, fontWeight: 700,
                        background: C.w, color: C.g400, padding: "1px 7px", borderRadius: 10,
                        border: `1px solid ${C.g100}`,
                      }}>
                        {colTasks.length}
                      </span>
                    </div>
                    {colTasks.map((task) => {
                      const pri = PRIORITY_COLORS[task.pri];
                      const assigneeUser = userMap[task.assignee];
                      return (
                        <div
                          key={task.id}
                          onClick={() => onTaskClick(task)}
                          style={{
                            background: C.w, borderRadius: 10, padding: "12px 14px",
                            marginBottom: 8, cursor: "pointer", border: `1px solid ${C.g100}`,
                            boxShadow: SH.xs, transition: "all .15s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.sm; (e.currentTarget as HTMLElement).style.borderColor = C.g200; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = SH.xs; (e.currentTarget as HTMLElement).style.borderColor = C.g100; }}
                        >
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 8, lineHeight: 1.4 }}>{task.title}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{
                              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20,
                              background: pri?.bg, color: pri?.t,
                            }}>
                              {task.pri}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {task.due && (
                                <span style={{ fontSize: 10, color: C.g400 }}>{task.due}</span>
                              )}
                              {assigneeUser && (
                                <Av ini={assigneeUser.av} photo={assigneeUser.photo} size={22} />
                              )}
                            </div>
                          </div>
                          {task.subs.length > 0 && (
                            <div style={{ marginTop: 8, height: 3, borderRadius: 3, background: C.g100, overflow: "hidden" }}>
                              <div style={{
                                height: "100%", borderRadius: 3, background: service.color,
                                width: `${Math.round((task.subs.filter((s) => s.done).length / task.subs.length) * 100)}%`,
                              }} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar: overview */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Service info card */}
            <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, boxShadow: SH.xs, overflow: "hidden" }}>
              <div style={{ height: 4, background: service.color }} />
              <div style={{ padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
                  {t.sdet_overview_tab}
                </div>
                {[
                  { label: t.sdet_cadence, value: cadenceLabel },
                  { label: t.sdet_created, value: service.created },
                  client && { label: t.sdet_client, value: client.name, color: client.color },
                ].filter(Boolean).map((row, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.g50}` }}>
                    <span style={{ fontSize: 12, color: C.g400, fontWeight: 500 }}>{(row as any).label}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: (row as any).color || C.navy,
                    }}>
                      {(row as any).value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team card */}
            <div style={{ background: C.w, borderRadius: 14, border: `1px solid ${C.g100}`, boxShadow: SH.xs, padding: "16px 18px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
                {t.sdet_team} ({service.members.length})
              </div>
              {service.members.map((mId) => {
                const member = userMap[mId];
                if (!member) return null;
                return (
                  <div key={mId} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Av ini={member.av} photo={member.photo} size={32} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.navy }}>{member.name}</div>
                      <div style={{ fontSize: 11, color: C.g400, textTransform: "capitalize" }}>{member.role}</div>
                    </div>
                    {member.id === service.owner && (
                      <span style={{
                        marginLeft: "auto", fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                        padding: "2px 7px", borderRadius: 10,
                        background: `${C.gold}18`, color: C.gold,
                        letterSpacing: ".06em",
                      }}>
                        Owner
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
