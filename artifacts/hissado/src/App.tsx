import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import type { Page } from "@/lib/store";
import type { Task, Project, Message } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import {
  accessibleProjects, accessibleTasks, accessibleConversations,
  accessibleTeamMembers, accessibleFiles, accessibleFolders,
  canCreateProject,
} from "@/lib/access";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TaskModal from "@/components/TaskModal";
import ProjectModal from "@/components/ProjectModal";
import Login from "@/pages/Login";
import PasswordChange from "@/pages/PasswordChange";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import MyTasks from "@/pages/MyTasks";
import Chat from "@/pages/Chat";
import Files from "@/pages/Files";
import Calendar from "@/pages/Calendar";
import Reports from "@/pages/Reports";
import Team from "@/pages/Team";
import Settings from "@/pages/Settings";

const NAVY = "#0F1A2E";
const G50 = "#F8F9FC";
const G100 = "#F0F2F7";
const G400 = "#9BA3B5";
const G700 = "#343B4F";
const GOLD = "#C8A45C";
const WHITE = "#FFF";

export default function App() {
  const { t } = useI18n();
  const {
    currentUser, page, collapsed, searchQuery,
    selectedProject, selectedTask, showTaskModal, showProjectModal,
    users, projects, tasks, notifications, conversations, messages, files, folders,
    setCurrentUser, setPage, setCollapsed, setSearchQuery,
    setSelectedProject, setSelectedTask, setShowTaskModal, setShowProjectModal,
    addTask, updateTask, deleteTask,
    addProject, updateProject, deleteProject,
    addUser, updateUser,
    addNotification, markAllNotifsRead,
    addConversation, deleteConversation, addMessage,
    addFile, deleteFile, addFolder, deleteFolder,
  } = useStore();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [taskDefaultProject, setTaskDefaultProject] = useState<string | undefined>();

  // Group flat messages array by conversation ID
  const messagesMap = useMemo(() => {
    const map: Record<string, Message[]> = {};
    messages.forEach((m) => {
      if (!map[m.cId]) map[m.cId] = [];
      map[m.cId].push(m);
    });
    return map;
  }, [messages]);

  // ── Login flow ──
  if (!currentUser) {
    return <Login users={users} onLogin={(u) => setCurrentUser(u)} />;
  }

  // ── Forced password reset ──
  if (currentUser.mustChangePassword) {
    return (
      <PasswordChange
        user={currentUser}
        onComplete={(newPw) => {
          const updated = { ...currentUser, password: newPw, mustChangePassword: false };
          updateUser(updated);
          setCurrentUser(updated);
        }}
      />
    );
  }

  // ── Access-controlled data slices ──
  const myProjects = accessibleProjects(currentUser, projects);
  const myTasks = accessibleTasks(currentUser, tasks, projects);
  const myConversations = accessibleConversations(currentUser, conversations, projects);
  const myTeam = accessibleTeamMembers(currentUser, users, projects);
  const myFiles = accessibleFiles(currentUser, files, projects);
  const myFolders = accessibleFolders(currentUser, folders, projects);

  const isAdmin = currentUser.role === "admin";

  const PAGE_TITLES: Record<Page, string> = {
    dashboard: t.nav_dashboard,
    projects: t.nav_projects,
    pdetail: selectedProject?.name || t.nav_projects,
    tasks: t.nav_tasks,
    chat: t.nav_chat,
    files: t.nav_files,
    calendar: t.nav_calendar,
    reports: t.nav_reports,
    team: t.nav_team,
    settings: t.nav_settings,
  };

  const navigate = (p: Page) => {
    setPage(p);
    setShowNotifPanel(false);
  };

  const openProjectDetail = (p: Project) => {
    setSelectedProject(p);
    setPage("pdetail");
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const openAddTask = (projId?: string) => {
    setSelectedTask(null);
    setTaskDefaultProject(projId || selectedProject?.id);
    setShowTaskModal(true);
  };

  const saveTask = (task: Task) => {
    const existing = tasks.find((x) => x.id === task.id);
    if (existing) updateTask(task);
    else addTask(task);
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const handleDeleteProject = (id: string) => {
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setPage("projects");
    }
    deleteProject(id);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#EFF2F8" }}>
      <Sidebar
        page={page}
        onNavigate={navigate}
        projects={myProjects}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        userRole={currentUser.role}
        userName={currentUser.name}
        userAv={currentUser.av}
        unread={unreadCount}
        onProjectClick={openProjectDetail}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Header
          title={PAGE_TITLES[page]}
          notifications={notifications}
          onNotifClick={() => setShowNotifPanel((v) => !v)}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onLogout={() => setCurrentUser(null)}
        />

        {/* Notification Panel */}
        {showNotifPanel && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 498 }} onClick={() => setShowNotifPanel(false)} />
            <div style={{ position: "fixed", top: 74, right: 20, width: 340, background: WHITE, borderRadius: 16, border: `1px solid ${G100}`, boxShadow: "0 8px 30px rgba(0,0,0,.12)", zIndex: 499, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${G100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{t.notif_title}</h3>
                <button onClick={markAllNotifsRead} style={{ fontSize: 11, color: GOLD, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>{t.notif_mark_read}</button>
              </div>
              <div style={{ maxHeight: 380, overflow: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: G400, fontSize: 13 }}>{t.notif_empty}</div>
                ) : notifications.map((n) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${G50}`, background: n.read ? "transparent" : `${GOLD}06`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, marginTop: 5, flexShrink: 0 }} />}
                    <div style={{ flex: 1, marginLeft: n.read ? 16 : 0 }}>
                      <div style={{ fontSize: 13, color: G700 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: G400, marginTop: 3 }}>{n.date || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <main style={{ flex: 1, overflow: "auto" }}>
          {page === "dashboard" && (
            <Dashboard projects={myProjects} tasks={myTasks} users={myTeam} onTaskClick={openTask} />
          )}
          {page === "projects" && (
            <Projects
              projects={myProjects}
              tasks={myTasks}
              users={myTeam}
              onAdd={() => setShowProjectModal(true)}
              onProjectClick={openProjectDetail}
              canCreate={canCreateProject(currentUser)}
              canDelete={isAdmin}
              onDelete={handleDeleteProject}
            />
          )}
          {page === "pdetail" && selectedProject && myProjects.find((p) => p.id === selectedProject.id) && (
            <ProjectDetail
              project={selectedProject}
              tasks={myTasks}
              users={myTeam}
              onTaskClick={openTask}
              onAddTask={() => openAddTask(selectedProject.id)}
              onBack={() => setPage("projects")}
            />
          )}
          {page === "pdetail" && selectedProject && !myProjects.find((p) => p.id === selectedProject.id) && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
              <div style={{ textAlign: "center", padding: 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 }}>{t.access_denied}</h2>
                <p style={{ fontSize: 14, color: G400 }}>{t.access_denied_desc}</p>
              </div>
            </div>
          )}
          {page === "tasks" && (
            <MyTasks tasks={myTasks} projects={myProjects} users={myTeam} onTaskClick={openTask} onAddTask={() => openAddTask()} />
          )}
          {page === "chat" && (
            <Chat
              conversations={myConversations}
              messages={messagesMap}
              users={myTeam}
              currentUser={currentUser}
              onSendMessage={(_, msg) => addMessage(msg)}
              onCreateConvo={addConversation}
              onAddNotification={addNotification}
              onDeleteConversation={isAdmin ? deleteConversation : undefined}
            />
          )}
          {page === "files" && (
            <Files
              files={myFiles}
              folders={myFolders}
              users={myTeam}
              onAddFile={addFile}
              onAddFolder={addFolder}
              onDeleteFile={isAdmin ? deleteFile : undefined}
              onDeleteFolder={isAdmin ? deleteFolder : undefined}
            />
          )}
          {page === "calendar" && (
            <Calendar tasks={myTasks} users={myTeam} projects={myProjects} onTaskClick={openTask} />
          )}
          {page === "reports" && (
            <Reports tasks={myTasks} projects={myProjects} users={myTeam} />
          )}
          {page === "team" && (
            <Team users={myTeam} currentUser={currentUser} onAddUser={addUser} />
          )}
          {page === "settings" && (
            <Settings currentUser={currentUser} onUpdateUser={(updates) => updateUser({ ...currentUser, ...updates })} />
          )}
        </main>
      </div>

      <TaskModal
        open={showTaskModal}
        onClose={() => { setShowTaskModal(false); setSelectedTask(null); }}
        task={selectedTask}
        projects={myProjects}
        users={myTeam}
        currentUser={currentUser}
        onSave={saveTask}
        onDelete={(id) => { deleteTask(id); setShowTaskModal(false); setSelectedTask(null); }}
        defaultProject={taskDefaultProject}
      />

      <ProjectModal
        open={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        users={users}
        currentUser={currentUser}
        onSave={(p) => { addProject(p); setShowProjectModal(false); }}
      />
    </div>
  );
}
