import { useState } from "react";
import { C, Av, StatusBadge } from "@/components/primitives";
import type { Task, User, Project } from "@/lib/data";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface CalendarProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  onTaskClick: (t: Task) => void;
}

export default function Calendar({ tasks, users, projects, onTaskClick }: CalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prev = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const next = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const tasksForDay = (d: number) => {
    const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return tasks.filter((t) => t.due === ds);
  };

  return (
    <div className="fade-in" style={{ padding: 28 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>Calendar</h2>
          <p style={{ fontSize: 13, color: C.g400, marginTop: 4 }}>Task due dates</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prev} style={{ background: C.g100, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.g500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
          <span style={{ fontSize: 16, fontWeight: 700, color: C.navy, minWidth: 180, textAlign: "center" }}>{MONTHS[month]} {year}</span>
          <button onClick={next} style={{ background: C.g100, border: "none", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: C.g500 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
          <button onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); }} style={{ padding: "6px 12px", background: `${C.gold}15`, border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, color: C.gold, cursor: "pointer", fontFamily: "inherit" }}>Today</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        {/* Calendar grid */}
        <div style={{ background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`, overflow: "hidden" }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {DAYS.map((d) => (
              <div key={d} style={{ padding: "12px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, color: C.g400, textTransform: "uppercase", letterSpacing: ".05em", borderBottom: `1px solid ${C.g100}` }}>{d}</div>
            ))}
          </div>
          {/* Day cells */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
            {cells.map((d, i) => {
              const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
              const dayTasks = d ? tasksForDay(d) : [];
              return (
                <div
                  key={i}
                  style={{
                    minHeight: 90, padding: "8px", borderBottom: `1px solid ${C.g50}`, borderRight: (i + 1) % 7 !== 0 ? `1px solid ${C.g50}` : "none",
                    background: isToday ? `${C.gold}06` : "transparent",
                  }}
                >
                  {d && (
                    <>
                      <div style={{
                        width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: isToday ? 700 : 400,
                        background: isToday ? C.gold : "transparent",
                        color: isToday ? "#fff" : C.g600,
                        marginBottom: 4,
                      }}>{d}</div>
                      {dayTasks.slice(0, 3).map((t) => {
                        const proj = projects.find((p) => p.id === t.pId);
                        return (
                          <div
                            key={t.id}
                            onClick={() => onTaskClick(t)}
                            data-testid={`cal-task-${t.id}`}
                            style={{ fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, marginBottom: 2, background: (proj?.color || C.gold) + "20", color: proj?.color || C.gold, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {t.title}
                          </div>
                        );
                      })}
                      {dayTasks.length > 3 && <div style={{ fontSize: 10, color: C.g400 }}>+{dayTasks.length - 3} more</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Side: upcoming tasks */}
        <div>
          <div style={{ background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.g100}` }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>This Month</h3>
            </div>
            <div style={{ maxHeight: 480, overflow: "auto" }}>
              {(() => {
                const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
                const monthTasks = tasks.filter((t) => t.due.startsWith(monthStr)).sort((a, b) => a.due.localeCompare(b.due));
                if (monthTasks.length === 0) return <div style={{ padding: 24, textAlign: "center", color: C.g400, fontSize: 13 }}>No tasks this month</div>;
                return monthTasks.map((t) => {
                  const assignee = users.find((u) => u.id === t.assignee);
                  const proj = projects.find((p) => p.id === t.pId);
                  const d = new Date(t.due + "T00:00:00");
                  const isToday2 = t.due === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
                  return (
                    <div
                      key={t.id}
                      onClick={() => onTaskClick(t)}
                      data-testid={`sidebar-cal-task-${t.id}`}
                      style={{ padding: "12px 20px", borderBottom: `1px solid ${C.g50}`, cursor: "pointer", display: "flex", gap: 12, alignItems: "center" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = C.g50)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{ minWidth: 36, textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: isToday2 ? C.gold : C.navy }}>{d.getDate()}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, color: C.g400, textTransform: "uppercase" }}>{DAYS[d.getDay()]}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                        {proj && <div style={{ fontSize: 10, color: proj.color, marginTop: 2 }}>{proj.name}</div>}
                      </div>
                      {assignee && <Av ini={assignee.av} size={24} />}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
