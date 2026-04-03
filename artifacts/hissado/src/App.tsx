import { useState, useMemo, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStore } from "@/lib/store";
import type { Page } from "@/lib/store";
import type { Task, Project, Service, Message } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import {
  accessibleProjects, accessibleTasks, accessibleConversations,
  accessibleTeamMembers, accessibleFiles, accessibleFolders,
  accessibleServices, canCreateProject,
} from "@/lib/access";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TaskModal from "@/components/TaskModal";
import ProjectModal from "@/components/ProjectModal";
import Login from "@/pages/Login";
import PasswordChange from "@/pages/PasswordChange";
import Dashboard from "@/pages/Dashboard";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import MyTasks from "@/pages/MyTasks";
import Chat from "@/pages/Chat";
import Files from "@/pages/Files";
import Calendar from "@/pages/Calendar";
import Reports from "@/pages/Reports";
import Team from "@/pages/Team";
import ClientsPage from "@/pages/ClientsPage";
import Settings from "@/pages/Settings";
import { C } from "@/components/primitives";

// Detect ?portal=client URL parameter (set once at module load — stable reference)
const IS_CLIENT_PORTAL = new URLSearchParams(window.location.search).get("portal") === "client";

export default function App() {
  const { t } = useI18n();
  const {
    currentUser, page, collapsed, searchQuery,
    selectedProject, selectedService, selectedTask, showTaskModal, showProjectModal,
    users, projects, services, tasks, notifications, conversations, messages, files, folders,
    departments, roleDefs, rolePermissions, clients,
    setCurrentUser, setPage, setCollapsed, setSearchQuery,
    setSelectedProject, setSelectedService, setSelectedTask, setShowTaskModal, setShowProjectModal,
    addTask, updateTask, deleteTask,
    addProject, updateProject, deleteProject,
    addService, updateService, deleteService,
    addUser, updateUser, deleteUser,
    addClient, updateClient, deleteClient,
    addNotification, markAllNotifsRead,
    addConversation, deleteConversation, addMessage,
    addFile, deleteFile, addFolder, deleteFolder,
  } = useStore();

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [taskDefaultProject, setTaskDefaultProject] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const isMobile = useIsMobile();

  // ── ALL hooks must come before any conditional returns ──

  // Group messages by conversation ID
  const messagesMap = useMemo(() => {
    const map: Record<string, Message[]> = {};
    messages.forEach((m) => {
      if (!map[m.cId]) map[m.cId] = [];
      map[m.cId].push(m);
    });
    return map;
  }, [messages]);

  // Access-controlled data slices — null-safe (currentUser may be null before login)
  const myProjects = useMemo(
    () => currentUser ? accessibleProjects(currentUser, projects) : [],
    [currentUser, projects]
  );
  const myTasks = useMemo(
    () => currentUser ? accessibleTasks(currentUser, tasks, projects, services) : [],
    [currentUser, tasks, projects, services]
  );
  const myConversations = useMemo(
    () => currentUser ? accessibleConversations(currentUser, conversations, projects) : [],
    [currentUser, conversations, projects]
  );
  const myTeam = useMemo(
    () => currentUser ? accessibleTeamMembers(currentUser, users, projects) : [],
    [currentUser, users, projects]
  );

  const myServices = useMemo(
    () => currentUser ? accessibleServices(currentUser, services) : [],
    [currentUser, services]
  );
  const myFiles = useMemo(
    () => currentUser ? accessibleFiles(currentUser, files, projects) : [],
    [currentUser, files, projects]
  );
  const myFolders = useMemo(
    () => currentUser ? accessibleFolders(currentUser, folders, projects) : [],
    [currentUser, folders, projects]
  );

  const isAdmin = currentUser?.role === "admin";

  // Effective permission set for the current user based on stored role permissions
  const myPermissions = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set<string>(rolePermissions[currentUser.role] ?? []);
  }, [currentUser, rolePermissions]);

  const PAGE_TITLES = useMemo<Record<Page, string>>(() => ({
    dashboard: t.nav_dashboard,
    services: t.nav_services,
    sdetail: selectedService?.name || t.nav_services,
    projects: t.nav_projects,
    pdetail: selectedProject?.name || t.nav_projects,
    tasks: t.nav_tasks,
    chat: t.nav_chat,
    files: t.nav_files,
    calendar: t.nav_calendar,
    reports: t.nav_reports,
    team: t.nav_team,
    clients: t.nav_clients,
    settings: t.nav_settings,
  }), [t, selectedProject?.name, selectedService?.name]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const navigate = useCallback((p: Page) => {
    setPage(p);
    setShowNotifPanel(false);
    setMobileNavOpen(false);
  }, [setPage]);

  const openProjectDetail = useCallback((p: Project) => {
    setSelectedProject(p);
    setPage("pdetail");
  }, [setSelectedProject, setPage]);

  const openServiceDetail = useCallback((sv: Service) => {
    setSelectedService(sv);
    setPage("sdetail");
  }, [setSelectedService, setPage]);

  const openTask = useCallback((task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  }, [setSelectedTask, setShowTaskModal]);

  const openAddTask = useCallback((projId?: string) => {
    setSelectedTask(null);
    setTaskDefaultProject(projId || selectedProject?.id);
    setShowTaskModal(true);
  }, [setSelectedTask, selectedProject?.id, setShowTaskModal]);

  const saveTask = useCallback((task: Task) => {
    const existing = tasks.find((x) => x.id === task.id);
    if (existing) updateTask(task);
    else addTask(task);
    setShowTaskModal(false);
    setSelectedTask(null);
  }, [tasks, updateTask, addTask, setShowTaskModal, setSelectedTask]);

  const handleDeleteProject = useCallback((id: string) => {
    if (selectedProject?.id === id) {
      setSelectedProject(null);
      setPage("projects");
    }
    deleteProject(id);
  }, [selectedProject?.id, setSelectedProject, setPage, deleteProject]);

  // ── Conditional renders (after all hooks) ──

  if (!currentUser) {
    return <Login users={users} onLogin={(u) => setCurrentUser(u)} isClientPortal={IS_CLIENT_PORTAL} />;
  }

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

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg }}>
      {/* Mobile nav backdrop */}
      {isMobile && mobileNavOpen && (
        <div
          onClick={() => setMobileNavOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1040,
            background: "rgba(7,13,26,.55)", backdropFilter: "blur(2px)",
          }}
        />
      )}

      <Sidebar
        page={page}
        onNavigate={navigate}
        projects={myProjects}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        userRole={currentUser.role}
        userName={currentUser.name}
        userAv={currentUser.av}
        userPhoto={currentUser.photo}
        unread={unreadCount}
        onProjectClick={openProjectDetail}
        permissions={myPermissions}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>
        <Header
          title={PAGE_TITLES[page]}
          notifications={notifications}
          onNotifClick={() => setShowNotifPanel((v) => !v)}
          searchQuery={searchQuery}
          onSearch={setSearchQuery}
          onLogout={() => setCurrentUser(null)}
          onMobileMenuOpen={() => setMobileNavOpen(true)}
        />

        {/* Notification Panel */}
        {showNotifPanel && (
          <>
            <div style={{ position: "fixed", inset: 0, zIndex: 498 }} onClick={() => setShowNotifPanel(false)} />
            <div style={{
              position: "fixed", top: 74, right: isMobile ? 8 : 20,
              width: isMobile ? "calc(100vw - 16px)" : 340,
              background: C.w, borderRadius: 16, border: `1px solid ${C.g100}`,
              boxShadow: "0 8px 30px rgba(0,0,0,.12)", zIndex: 499, overflow: "hidden",
            }}>
              <div style={{
                padding: "14px 16px", borderBottom: `1px solid ${C.g100}`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.navy, margin: 0 }}>{t.notif_title}</h3>
                <button
                  onClick={markAllNotifsRead}
                  style={{
                    fontSize: 11, color: C.gold, background: "none", border: "none",
                    cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
                  }}
                >
                  {t.notif_mark_read}
                </button>
              </div>
              <div style={{ maxHeight: 380, overflow: "auto" }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: 32, textAlign: "center", color: C.g400, fontSize: 13 }}>{t.notif_empty}</div>
                ) : notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px", borderBottom: `1px solid ${C.g50}`,
                      background: n.read ? "transparent" : `${C.gold}06`,
                      display: "flex", gap: 10, alignItems: "flex-start",
                    }}
                  >
                    {!n.read && (
                      <div style={{
                        width: 6, height: 6, borderRadius: "50%", background: C.gold,
                        marginTop: 5, flexShrink: 0,
                      }} />
                    )}
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
            <Dashboard
              projects={myProjects}
              tasks={myTasks}
              users={myTeam}
              clients={clients}
              services={myServices}
              currentUser={currentUser}
              onTaskClick={openTask}
              onNavigateToClients={() => navigate("clients")}
            />
          )}
          {page === "services" && (
            <Services
              services={myServices}
              users={myTeam}
              clients={clients}
              currentUser={currentUser}
              canManage={isAdmin}
              onAdd={addService}
              onUpdate={updateService}
              onDelete={deleteService}
              onServiceClick={openServiceDetail}
            />
          )}
          {page === "sdetail" && selectedService && (
            <ServiceDetail
              service={selectedService}
              tasks={myTasks}
              users={myTeam}
              clients={clients}
              currentUser={currentUser}
              canManage={isAdmin || currentUser.role === "manager"}
              onAddTask={() => openAddTask()}
              onTaskClick={openTask}
              onTaskUpdate={(t) => updateTask(t)}
              onBack={() => setPage("services")}
            />
          )}
          {page === "projects" && (
            <Projects
              projects={myProjects}
              tasks={myTasks}
              users={myTeam}
              clients={clients}
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
                <h2 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{t.access_denied}</h2>
                <p style={{ fontSize: 14, color: C.g400 }}>{t.access_denied_desc}</p>
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
              projects={myProjects}
              services={myServices}
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
            <Team
              users={myTeam}
              currentUser={currentUser}
              onAddUser={addUser}
              onUpdateUser={updateUser}
              onDeleteUser={deleteUser}
              deptList={departments}
              roleDefs={roleDefs}
            />
          )}
          {page === "clients" && (
            <ClientsPage
              clients={clients}
              users={users}
              projects={projects}
              services={services}
              currentUser={currentUser}
              canManage={isAdmin || currentUser.role === "manager"}
              onAdd={addClient}
              onUpdate={updateClient}
              onDelete={deleteClient}
              onAddUser={addUser}
            />
          )}
          {page === "settings" && (
            <Settings
              currentUser={currentUser}
              onUpdateUser={(updates) => {
                const updated = { ...currentUser, ...updates };
                updateUser(updated);
                setCurrentUser(updated);
              }}
            />
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
        clients={clients}
        onSave={(p) => { addProject(p); setShowProjectModal(false); }}
      />
    </div>
  );
}
