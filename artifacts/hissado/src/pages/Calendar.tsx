import { useState } from "react";
import { C, Av, StatusBadge } from "@/components/primitives";
import { useI18n, MONTH_NAMES, DAY_NAMES } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Task, User, Project } from "@/lib/data";
import { fmt } from "@/lib/data";

interface CalendarProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  onTaskClick?: (t: Task) => void;
}

const ChevLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>;
const ChevRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>;

export default function Calendar({ tasks, users, projects, onTaskClick }: CalendarProps) {
  const { t, lang } = useI18n();
  const isMobile = useIsMobile();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const MONTHS = MONTH_NAMES[lang];
  const DAYS = DAY_NAMES[lang];
  const DAYS_SHORT = DAYS.map((d) => d[0]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const tasksByDay: Record<number, Task[]> = {};
  tasks.forEach((tk) => {
    if (!tk.due) return;
    const d = new Date(tk.due);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(tk);
    }
  });

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };
  const thisMonth = tasks.filter((tk) => {
    if (!tk.due) return false;
    const d = new Date(tk.due);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const calendarGrid = (
    <div style={{ background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      {/* Header */}
      <div style={{ padding: isMobile ? "12px 14px" : "16px 20px", borderBottom: `1px solid ${C.g100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: C.navy, fontFamily: "'Playfair Display',serif" }}>
          {MONTHS[month]} {year}
        </h2>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={prevMonth} data-testid="cal-prev" style={{ background: C.g100, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g600 }}><ChevLeft /></button>
          <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth()); }} data-testid="cal-today" style={{ background: C.g100, border: "none", borderRadius: 8, padding: "4px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600, color: C.g600, fontFamily: "inherit" }}>{t.cal_today}</button>
          <button onClick={nextMonth} data-testid="cal-next" style={{ background: C.g100, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: C.g600 }}><ChevRight /></button>
        </div>
      </div>

      {/* Day labels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", borderBottom: `1px solid ${C.g100}` }}>
        {(isMobile ? DAYS_SHORT : DAYS).map((d) => (
          <div key={d} style={{ padding: isMobile ? "8px 0" : "10px 0", textAlign: "center", fontSize: isMobile ? 10 : 11, fontWeight: 600, color: C.g400, textTransform: "uppercase", letterSpacing: ".06em" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)" }}>
        {cells.map((day, i) => {
          const isToday = day === now.getDate() && year === now.getFullYear() && month === now.getMonth();
          const dayTasks = day ? tasksByDay[day] || [] : [];
          return (
            <div key={i} style={{ minHeight: isMobile ? 44 : 80, borderRight: (i + 1) % 7 !== 0 ? `1px solid ${C.g50}` : "none", borderBottom: `1px solid ${C.g50}`, padding: isMobile ? "4px 2px" : "6px 8px", background: isToday ? `${C.gold}08` : "transparent" }}>
              {day && (
                <>
                  <div style={{ width: isMobile ? 20 : 24, height: isMobile ? 20 : 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isToday ? C.gold : "transparent", color: isToday ? C.w : C.g700, fontSize: isMobile ? 10 : 12, fontWeight: isToday ? 700 : 500, marginBottom: 2 }}>
                    {day}
                  </div>
                  {!isMobile && dayTasks.slice(0, 2).map((tk) => {
                    const p = projectMap[tk.pId];
                    return (
                      <div key={tk.id} onClick={() => onTaskClick?.(tk)} data-testid={`cal-task-${tk.id}`}
                        style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: p ? `${p.color}22` : C.g100, color: p?.color || C.g500, marginBottom: 2, cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600 }}
                      >
                        {tk.title}
                      </div>
                    );
                  })}
                  {isMobile && dayTasks.length > 0 && (
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.gold, margin: "0 auto" }} />
                  )}
                  {!isMobile && dayTasks.length > 2 && <div style={{ fontSize: 10, color: C.g400, fontWeight: 600 }}>+{dayTasks.length - 2}</div>}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const taskSidebar = (
    <div style={{ background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`, padding: isMobile ? 16 : 20, boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, marginBottom: 12 }}>{t.cal_this_month}</h3>
      <p style={{ fontSize: 12, color: C.g400, marginBottom: 14 }}>{t.cal_subtitle}</p>
      {thisMonth.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0", color: C.g400, fontSize: 13 }}>{t.cal_no_tasks}</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {thisMonth.map((tk) => {
            const p = projectMap[tk.pId];
            const assignee = userMap[tk.assignee];
            return (
              <div key={tk.id} onClick={() => onTaskClick?.(tk)} data-testid={`sidebar-task-${tk.id}`}
                style={{ padding: "10px 0", borderBottom: `1px solid ${C.g50}`, cursor: "pointer" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 6 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.title}</div>
                    {p && <div style={{ fontSize: 10, color: p.color, marginTop: 2, fontWeight: 600 }}>{p.name}</div>}
                  </div>
                  {assignee && <Av ini={assignee.av} size={22} />}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                  <StatusBadge status={tk.status} />
                  {tk.due && <span style={{ fontSize: 10, color: C.g400 }}>{tk.due}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: isMobile ? "16px 16px 40px" : "32px 36px 60px", background: C.bg, minHeight: "100%" }}>
      {isMobile ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {calendarGrid}
          {taskSidebar}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }}>
          {calendarGrid}
          {taskSidebar}
        </div>
      )}
    </div>
  );
}
