import { useState } from "react";
import { useStore } from "@/lib/store";
import type { Page } from "@/lib/store";
import type { Task, Project } from "@/lib/data";
import { C } from "@/components/primitives";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TaskModal from "@/components/TaskModal";
import ProjectModal from "@/components/ProjectModal";
import Login from "@/pages/Login";
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

const PAGE_TITLES: Record<Page, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  pdetail: "Project Detail",
  tasks: "My Tasks",
  chat: "Messages",
  files: "Files & Documents",
  calendar: "Calendar",
  reports: "Reports",
  team: "Team",
  settings: "Settings",
};

export default function App() {
  const {
    currentUser, page, collapsed, searchQuery,
    selectedProject, selectedTask, showTaskModal, showProjectModal,
    users, projects, tasks, notifications, conversations, messages, files, folders,
    setCurrentUser, setPage, setCollapsed, setSearchQuery,
    setSelectedProject, setSelectedTask, setShowTaskModal, setShowProjectModal,
    addTask, updateTask, deleteTask,
    addProject,
    addUser, updateUser,
    addNotification, markAllNotifsRead,
    addConversation, addMessage,
    addFile, addFolder,
  } = useStore();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [taskDefaultProject, setTaskDefaultProject] = useState<string | undefined>();

  if (!currentUser) {
    return <Login users={users} onLogin={(u) => setCurrentUser(u)} />;
  }

  const navigate = (p: Page) => {
    setPage(p);
    setShowNotifPanel(false);
  };

  const openProjectDetail = (p: Project) => {
    setSelectedProject(p);
    setPage("pdetail");
  };

  const openTask = (t: Task) => {
    setSelectedTask(t);
    setShowTaskModal(true);
  };

  const openAddTask = (projId?: string) => {
    setSelectedTask(null);
    setTaskDefaultProject(projId || selectedProject?.id);
    setShowTaskModal(true);
  };

  const saveTask = (t: Task) => {
    const existing = tasks.find((x) => x.id === t.id);
    if (existing) updateTask(t);
    else addTask(t);
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  const subtitle = page === "pdetail" && selectedProject ? selectedProject.name : null;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.g50 }}>
      <Sidebar
        page={page}
        onNavigate={navigate}
        projects={projects}
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
          subtitle={subtitle}
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
            <div style={{ position: "fixed", top: 74, right: 20, width: 340, background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`, boxShadow: "0 8px 30px rgba(0,0,0,.12)", zIndex: 499, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.g100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Notifications</h3>
                <button onClick={markAllNotifsRead} style={{ fontSize: 11, color: C.gold, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}>Mark all read</button>
              </div>
              <div style={{ maxHeight: 380, overflow: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: C.g400, fontSize: 13 }}>No notifications</div>
                ) : notifications.map((n) => (
                  <div key={n.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${C.g50}`, background: n.read ? "transparent" : `${C.gold}06`, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.gold, marginTop: 5, flexShrink: 0 }} />}
                    <div style={{ flex: 1, marginLeft: n.read ? 16 : 0 }}>
                      <div style={{ fontSize: 13, color: C.g700 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: C.g400, marginTop: 3 }}>{n.date || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <main style={{ flex: 1, overflow: "auto" }}>
          {page === "dashboard" && (
            <Dashboard projects={projects} tasks={tasks} users={users} onTaskClick={openTask} />
          )}
          {page === "projects" && (
            <Projects projects={projects} tasks={tasks} users={users} onAdd={() => setShowProjectModal(true)} onProjectClick={openProjectDetail} />
          )}
          {page === "pdetail" && selectedProject && (
            <ProjectDetail project={selectedProject} tasks={tasks} users={users} onTaskClick={openTask} onAddTask={() => openAddTask(selectedProject.id)} onBack={() => setPage("projects")} />
          )}
          {page === "tasks" && (
            <MyTasks tasks={tasks} projects={projects} users={users} onTaskClick={openTask} onAddTask={() => openAddTask()} />
          )}
          {page === "chat" && (
            <Chat conversations={conversations} messages={messages} users={users} currentUser={currentUser} onSendMessage={addMessage} onCreateConvo={addConversation} onAddNotification={addNotification} />
          )}
          {page === "files" && (
            <Files files={files} folders={folders} users={users} onAddFile={addFile} onAddFolder={addFolder} />
          )}
          {page === "calendar" && (
            <Calendar tasks={tasks} users={users} projects={projects} onTaskClick={openTask} />
          )}
          {page === "reports" && (
            <Reports tasks={tasks} projects={projects} users={users} />
          )}
          {page === "team" && (
            <Team users={users} currentUser={currentUser} onAddUser={addUser} />
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
        projects={projects}
        users={users}
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
