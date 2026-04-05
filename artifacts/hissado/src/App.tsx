import { useState, useMemo, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStore } from "@/lib/store";
import type { Page } from "@/lib/store";
import type { Task, Project, Service, Message } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useRealtime } from "@/hooks/useRealtime";
import type { CallSignal, MessageSignal } from "@/hooks/useRealtime";
import { useDesktopNotifications } from "@/hooks/useDesktopNotifications";
import { useSessionTimeout, INACTIVITY_MINUTES } from "@/hooks/useSessionTimeout";
import { pushToast } from "@/components/ToastNotifications";
import {
  fetchUsers, sendHeartbeat, updateUserPassword, registerReminder,
} from "@/lib/api";
import {
  accessibleProjects, accessibleTasks, accessibleConversations,
  accessibleTeamMembers, accessibleFiles, accessibleFolders,
  accessibleServices, accessibleClients, canCreateProject,
} from "@/lib/access";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import TaskModal from "@/components/TaskModal";
import ProjectModal from "@/components/ProjectModal";
import NotificationPanel from "@/components/NotificationPanel";
import SessionTimeoutModal from "@/components/SessionTimeoutModal";
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
import Meetings from "@/pages/Meetings";
import VideoRoom from "@/components/VideoRoom";
import IncomingCall from "@/components/IncomingCall";
import OutgoingCall from "@/components/OutgoingCall";
import ToastNotifications from "@/components/ToastNotifications";
import { C } from "@/components/primitives";

// ── Call overlay state ────────────────────────────────────────────────────────

type CallState =
  | null
  | { type: "outgoing"; callId: string; targetId: string; targetName: string; targetColor?: string; roomName: string; videoEnabled: boolean }
  | { type: "incoming"; signal: CallSignal }
  | { type: "active"; roomName: string; title: string; videoEnabled: boolean };


// ── Portal detection ──────────────────────────────────────────────────────────

// Auto-detected from the custom domain or a ?portal=client URL param (fallback for dev/testing).
const IS_CLIENT_PORTAL =
  window.location.hostname === "project.hissadoconsulting.com" ||
  new URLSearchParams(window.location.search).get("portal") === "client";


// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const { t, lang } = useI18n();
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
    addUser, updateUser, deleteUser, mergeServerUsers,
    addClient, updateClient, deleteClient,
    addNotification, markAllNotifsRead,
    addConversation, deleteConversation, addMessage, updateMessage, deleteMessage, addReaction, markMessagesRead,
    chatOpenConvoId, setChatOpenConvoId,
    addFile, deleteFile, addFolder, deleteFolder,
  } = useStore();

  // ── Server sync ─────────────────────────────────────────────────────────────

  // On mount: sync users from the server so cross-device invitations are visible
  useEffect(() => {
    fetchUsers()
      .then((serverUsers) => { if (Array.isArray(serverUsers)) mergeServerUsers(serverUsers); })
      .catch(() => { /* server unreachable — fall back to localStorage */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // While signed in: send a presence heartbeat every 5 minutes
  useEffect(() => {
    if (!currentUser) return;
    sendHeartbeat(currentUser.id);
    const interval = setInterval(() => sendHeartbeat(currentUser.id), 5 * 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // ── Session timeout ──────────────────────────────────────────────────────────

  const handleAutoSignOut = useCallback(() => {
    setCurrentUser(null);
    pushToast({ type: "message", title: t.session_timeout_title, body: t.session_timeout_body });
  }, [setCurrentUser, t]);

  const { showWarning: showTimeoutWarning, countdown: timeoutCountdown, stayActive } = useSessionTimeout({
    enabled: !!currentUser,
    onSignOut: handleAutoSignOut,
  });

  // ── Local UI state ───────────────────────────────────────────────────────────

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [taskDefaultProject, setTaskDefaultProject] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [callState, setCallState] = useState<CallState>(null);

  // ── Real-time (SSE + signalling) ─────────────────────────────────────────────

  const { send: desktopNotify } = useDesktopNotifications();

  const realtime = useRealtime(currentUser?.id ?? null, {
    onIncomingCall: (signal) => {
      setCallState({ type: "incoming", signal });
      desktopNotify(
        `Incoming ${signal.videoEnabled ? "Video" : "Audio"} Call`,
        `${signal.callerName} is calling you`,
        { tag: `call-${signal.callId}` }
      );
    },
    onCallAccepted: (_callId, roomName, videoEnabled) => {
      setCallState((prev) => {
        if (prev?.type === "outgoing") {
          return { type: "active", roomName, title: prev.targetName, videoEnabled };
        }
        return prev;
      });
    },
    onCallDeclined: (_callId) => {
      setCallState((prev) => {
        if (prev?.type === "outgoing") {
          pushToast({ type: "call-missed", title: "Call declined", body: `${prev.targetName} declined your call` });
          return null;
        }
        return prev;
      });
    },
    onCallEnded: (_callId) => setCallState(null),
    onNewMessage: (signal: MessageSignal) => {
      if (!currentUser || signal.fromId === currentUser.id) return;
      pushToast({
        type: "message",
        title: signal.fromName,
        body: signal.text,
        color: undefined,
        onPress: () => { setPage("chat"); setChatOpenConvoId(signal.conversationId); },
      });
      desktopNotify(signal.fromName, signal.text, { tag: `msg-${signal.conversationId}` });
    },
  });

  const isMobile = useIsMobile();

  // ── Memoized data slices ─────────────────────────────────────────────────────

  // Group messages by conversation for efficient lookup in Chat
  const messagesMap = useMemo(() => {
    const map: Record<string, Message[]> = {};
    messages.forEach((m) => {
      if (!map[m.cId]) map[m.cId] = [];
      map[m.cId].push(m);
    });
    return map;
  }, [messages]);

  // Access-controlled data slices (currentUser may be null before login)
  const myProjects     = useMemo(() => currentUser ? accessibleProjects(currentUser, projects) : [], [currentUser, projects]);
  const myTasks        = useMemo(() => currentUser ? accessibleTasks(currentUser, tasks, projects, services) : [], [currentUser, tasks, projects, services]);
  const myConversations= useMemo(() => currentUser ? accessibleConversations(currentUser, conversations, projects) : [], [currentUser, conversations, projects]);
  const myTeam         = useMemo(() => currentUser ? accessibleTeamMembers(currentUser, users, projects) : [], [currentUser, users, projects]);
  const myServices     = useMemo(() => currentUser ? accessibleServices(currentUser, services) : [], [currentUser, services]);
  const myClients      = useMemo(() => currentUser ? accessibleClients(currentUser, clients, projects, services) : [], [currentUser, clients, projects, services]);
  const myFiles        = useMemo(() => currentUser ? accessibleFiles(currentUser, files, projects, services) : [], [currentUser, files, projects, services]);
  const myFolders      = useMemo(() => currentUser ? accessibleFolders(currentUser, folders, projects, services) : [], [currentUser, folders, projects, services]);

  const isAdmin = currentUser?.role === "admin";

  const myPermissions = useMemo(() => {
    if (!currentUser) return new Set<string>();
    return new Set<string>(rolePermissions[currentUser.role] ?? []);
  }, [currentUser, rolePermissions]);

  const PAGE_TITLES = useMemo<Record<Page, string>>(() => ({
    dashboard: t.nav_dashboard,
    services:  t.nav_services,
    sdetail:   selectedService?.name || t.nav_services,
    projects:  t.nav_projects,
    pdetail:   selectedProject?.name || t.nav_projects,
    tasks:     t.nav_tasks,
    chat:      t.nav_chat,
    files:     t.nav_files,
    calendar:  t.nav_calendar,
    reports:   t.nav_reports,
    team:      t.nav_team,
    clients:   t.nav_clients,
    settings:  t.nav_settings,
    meetings:  t.nav_meetings,
  }), [t, selectedProject?.name, selectedService?.name]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // ── Navigation ───────────────────────────────────────────────────────────────

  const navigate = useCallback((p: Page) => {
    setPage(p);
    setShowNotifPanel(false);
    setMobileNavOpen(false);
  }, [setPage]);

  // ── Call handling ────────────────────────────────────────────────────────────

  const handleStartCall = useCallback((
    roomName: string,
    title: string,
    videoEnabled: boolean,
    target?: { id: string; name: string; color?: string }
  ) => {
    if (target && currentUser) {
      const callId = Math.random().toString(36).slice(2, 10);
      setCallState({ type: "outgoing", callId, targetId: target.id, targetName: target.name, targetColor: target.color, roomName, videoEnabled });
      realtime.ringUser(target.id, {
        callId, callerId: currentUser.id, callerName: currentUser.name,
        callerColor: currentUser.color, roomName, videoEnabled,
      });
      const callee = users.find((u) => u.id === target.id);
      if (callee?.email) {
        registerReminder({
          id: `call-${callId}-${target.id}`,
          recipientId: target.id,
          recipientEmail: callee.email,
          recipientName: callee.name,
          type: "call",
          summary: `Missed ${videoEnabled ? "video" : "audio"} call from ${currentUser.name}`,
          senderName: currentUser.name,
          lang,
          scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        }).catch(() => {});
      }
    } else {
      setCallState({ type: "active", roomName, title, videoEnabled });
    }
  }, [currentUser, lang, realtime, users]);

  // ── Message handling ─────────────────────────────────────────────────────────

  const handleSendMessage = useCallback((cId: string, msg: Message) => {
    addMessage(msg);
    if (!currentUser) return;
    const convo = conversations.find((c) => c.id === cId);
    if (!convo) return;
    const recipients = convo.parts.filter((uid) => uid !== currentUser.id);
    const isDrawing  = msg.text.startsWith("data:image");
    const isLocation = !!msg.location;
    const preview    = isLocation ? "📍 Location" : isDrawing ? "[Drawing]" : msg.text.slice(0, 120);
    const scheduledAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    recipients.forEach((toId) => {
      realtime.notifyMessage(toId, {
        fromId: currentUser.id, fromName: currentUser.name,
        text: preview, conversationId: cId,
      });
      const recipient = users.find((u) => u.id === toId);
      if (recipient?.email) {
        registerReminder({
          id: `${msg.id}-${toId}`,
          recipientId: toId,
          recipientEmail: recipient.email,
          recipientName: recipient.name,
          type: "message",
          summary: `${currentUser.name}: ${preview}`,
          senderName: currentUser.name,
          lang,
          scheduledAt,
        }).catch(() => {});
      }
    });
  }, [addMessage, conversations, currentUser, lang, realtime, users]);

  // ── Task / project helpers ───────────────────────────────────────────────────

  const openProjectDetail = useCallback((p: Project) => { setSelectedProject(p); setPage("pdetail"); }, [setSelectedProject, setPage]);
  const openServiceDetail  = useCallback((sv: Service) => { setSelectedService(sv); setPage("sdetail"); }, [setSelectedService, setPage]);
  const openTask           = useCallback((task: Task) => { setSelectedTask(task); setShowTaskModal(true); }, [setSelectedTask, setShowTaskModal]);

  const openAddTask = useCallback((projId?: string) => {
    setSelectedTask(null);
    setTaskDefaultProject(projId || selectedProject?.id);
    setShowTaskModal(true);
  }, [setSelectedTask, selectedProject?.id, setShowTaskModal]);

  const saveTask = useCallback((task: Task) => {
    const isNew = !tasks.find((x) => x.id === task.id);
    if (isNew) addTask(task); else updateTask(task);
    setShowTaskModal(false);
    setSelectedTask(null);
  }, [tasks, updateTask, addTask, setShowTaskModal, setSelectedTask]);

  const handleDeleteProject = useCallback((id: string) => {
    if (selectedProject?.id === id) { setSelectedProject(null); setPage("projects"); }
    deleteProject(id);
  }, [selectedProject?.id, setSelectedProject, setPage, deleteProject]);

  // ── Conditional renders (must come after all hooks) ─────────────────────────

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
          // Persist to server so the new password works across browsers
          updateUserPassword(updated.id, newPw).catch(() => {});
        }}
      />
    );
  }

  // ── Layout ───────────────────────────────────────────────────────────────────

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

        {showNotifPanel && (
          <NotificationPanel
            notifications={notifications}
            onClose={() => setShowNotifPanel(false)}
            onMarkAllRead={markAllNotifsRead}
          />
        )}

        <main key={page} className="page-enter" style={{ flex: 1, overflow: "auto" }}>
          {page === "dashboard" && (
            <Dashboard
              projects={myProjects} tasks={myTasks} users={myTeam}
              clients={clients} services={myServices} currentUser={currentUser}
              onTaskClick={openTask}
              onNavigateToClients={() => navigate("clients")}
            />
          )}
          {page === "services" && (
            <Services
              services={myServices} users={myTeam} clients={clients}
              currentUser={currentUser} canManage={isAdmin}
              onAdd={addService} onUpdate={updateService} onDelete={deleteService}
              onServiceClick={openServiceDetail}
            />
          )}
          {page === "sdetail" && selectedService && (
            <ServiceDetail
              service={selectedService} tasks={myTasks} users={myTeam}
              clients={clients} currentUser={currentUser}
              canManage={isAdmin || currentUser.role === "manager"}
              onAddTask={() => openAddTask()} onTaskClick={openTask}
              onTaskUpdate={(t) => updateTask(t)}
              onBack={() => setPage("services")}
            />
          )}
          {page === "projects" && (
            <Projects
              projects={myProjects} tasks={myTasks} users={myTeam} clients={clients}
              onAdd={() => setShowProjectModal(true)}
              onProjectClick={openProjectDetail}
              canCreate={canCreateProject(currentUser)}
              canDelete={isAdmin}
              onDelete={handleDeleteProject}
            />
          )}
          {page === "pdetail" && selectedProject && myProjects.find((p) => p.id === selectedProject.id) && (
            <ProjectDetail
              project={selectedProject} tasks={myTasks} users={myTeam}
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
              conversations={myConversations} messages={messagesMap}
              users={myTeam} currentUser={currentUser}
              onSendMessage={handleSendMessage} onCreateConvo={addConversation}
              onAddNotification={addNotification}
              onDeleteConversation={isAdmin ? deleteConversation : undefined}
              onStartCall={handleStartCall}
              onUpdateMessage={updateMessage} onDeleteMessage={deleteMessage}
              onReact={addReaction} onMarkRead={markMessagesRead}
              initialConvoId={chatOpenConvoId}
              onConvoOpened={() => setChatOpenConvoId(null)}
            />
          )}
          {page === "files" && (
            <Files
              files={myFiles} folders={myFolders} users={myTeam}
              projects={myProjects} services={myServices}
              onAddFile={addFile} onAddFolder={addFolder}
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
              users={myTeam} currentUser={currentUser}
              onAddUser={addUser} onUpdateUser={updateUser} onDeleteUser={deleteUser}
              deptList={departments} roleDefs={roleDefs}
            />
          )}
          {page === "clients" && (
            <ClientsPage
              clients={myClients} users={users} projects={projects} services={services}
              currentUser={currentUser}
              canManage={isAdmin || currentUser.role === "manager"}
              onAdd={addClient} onUpdate={updateClient} onDelete={deleteClient}
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
          {page === "meetings" && (
            <Meetings currentUser={currentUser} teamMembers={myTeam} onStartCall={handleStartCall} />
          )}
        </main>
      </div>

      {/* ── Call overlays ── */}
      {callState?.type === "outgoing" && (
        <OutgoingCall
          targetName={callState.targetName}
          targetColor={callState.targetColor}
          videoEnabled={callState.videoEnabled}
          onCancel={() => { realtime.declineCall(callState.targetId, callState.callId); setCallState(null); }}
        />
      )}
      {callState?.type === "incoming" && (
        <IncomingCall
          signal={callState.signal}
          onAccept={() => {
            const sig = callState.signal;
            realtime.acceptCall(sig.callerId, sig.callId, sig.roomName, sig.videoEnabled);
            setCallState({ type: "active", roomName: sig.roomName, title: sig.callerName, videoEnabled: sig.videoEnabled });
          }}
          onDecline={() => {
            const sig = callState.signal;
            realtime.declineCall(sig.callerId, sig.callId);
            setCallState(null);
          }}
        />
      )}
      {callState?.type === "active" && (
        <VideoRoom
          roomName={callState.roomName}
          displayName={currentUser.name}
          roomTitle={callState.title}
          startWithVideoMuted={!callState.videoEnabled}
          defaultLang={lang}
          onLeave={() => { if (callState.type === "active") setCallState(null); }}
        />
      )}

      {/* ── Global overlays ── */}
      <ToastNotifications />

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

      {showTimeoutWarning && (
        <SessionTimeoutModal
          countdown={timeoutCountdown}
          lang={lang}
          inactiveDuration={INACTIVITY_MINUTES}
          onSignOut={() => setCurrentUser(null)}
          onStayActive={stayActive}
        />
      )}
    </div>
  );
}
