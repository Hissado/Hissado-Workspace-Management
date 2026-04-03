import { useState, useMemo, useCallback, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStore } from "@/lib/store";
import type { Page } from "@/lib/store";
import type { Task, Project, Service, Message } from "@/lib/data";
import { useI18n } from "@/lib/i18n";
import { useRealtime } from "@/hooks/useRealtime";
import type { CallSignal, MessageSignal } from "@/hooks/useRealtime";
import { useDesktopNotifications } from "@/hooks/useDesktopNotifications";
import { pushToast } from "@/components/ToastNotifications";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";
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
import Meetings from "@/pages/Meetings";
import VideoRoom from "@/components/VideoRoom";
import IncomingCall from "@/components/IncomingCall";
import OutgoingCall from "@/components/OutgoingCall";
import ToastNotifications from "@/components/ToastNotifications";
import { C } from "@/components/primitives";

// Client portal: auto-detected from the custom domain OR a ?portal=client URL param (fallback for dev/testing)
const IS_CLIENT_PORTAL =
  window.location.hostname === "project.hissadoconsulting.com" ||
  new URLSearchParams(window.location.search).get("portal") === "client";

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

  /* ── Sync users from server on every mount (fixes cross-browser auth) ── */
  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((serverUsers) => { if (Array.isArray(serverUsers)) mergeServerUsers(serverUsers); })
      .catch(() => { /* server unreachable — fall back to localStorage */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Heartbeat: tell server user is active every 5 minutes ── */
  useEffect(() => {
    if (!currentUser) return;
    const sendHeartbeat = () => {
      fetch("/api/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id }),
      }).catch(() => {});
    };
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5 * 60 * 1000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  /* ── Session timeout: auto sign-out after 1 hour of inactivity ── */
  const handleAutoSignOut = useCallback(() => {
    setCurrentUser(null);
    pushToast({ type: "message", title: "Signed out", body: "You were signed out due to inactivity." });
  }, [setCurrentUser]);

  const { showWarning: showTimeoutWarning, countdown: timeoutCountdown, stayActive } = useSessionTimeout({
    enabled: !!currentUser,
    onSignOut: handleAutoSignOut,
  });

  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [taskDefaultProject, setTaskDefaultProject] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  type CallState =
    | null
    | { type: "outgoing"; callId: string; targetId: string; targetName: string; targetColor?: string; roomName: string; videoEnabled: boolean }
    | { type: "incoming"; signal: CallSignal }
    | { type: "active"; roomName: string; title: string; videoEnabled: boolean };

  const [callState, setCallState] = useState<CallState>(null);

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
    onCallEnded: (_callId) => {
      setCallState(null);
    },
    onNewMessage: (signal: MessageSignal) => {
      /* Guard: never show a notification to the sender for their own message */
      if (!currentUser || signal.fromId === currentUser.id) return;
      pushToast({
        type: "message",
        title: signal.fromName,
        body: signal.text,
        color: undefined,
        onPress: () => {
          setPage("chat");
          setChatOpenConvoId(signal.conversationId);
        },
      });
      desktopNotify(signal.fromName, signal.text, { tag: `msg-${signal.conversationId}` });
    },
  });

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
    meetings: t.nav_meetings,
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

  const handleStartCall = useCallback((
    roomName: string,
    title: string,
    videoEnabled: boolean,
    target?: { id: string; name: string; color?: string }
  ) => {
    if (target && currentUser) {
      const callId = Math.random().toString(36).slice(2, 10);
      setCallState({
        type: "outgoing",
        callId,
        targetId: target.id,
        targetName: target.name,
        targetColor: target.color,
        roomName,
        videoEnabled,
      });
      realtime.ringUser(target.id, {
        callId,
        callerId: currentUser.id,
        callerName: currentUser.name,
        callerColor: currentUser.color,
        roomName,
        videoEnabled,
      });
      /* Register missed-call reminder for the callee — cancelled if they heartbeat */
      const callee = users.find((u) => u.id === target.id);
      if (callee?.email) {
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        fetch("/api/reminders/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `call-${callId}-${target.id}`,
            recipientId: target.id,
            recipientEmail: callee.email,
            recipientName: callee.name,
            type: "call",
            summary: `Missed ${videoEnabled ? "video" : "audio"} call from ${currentUser.name}`,
            senderName: currentUser.name,
            lang: lang,
            scheduledAt: oneHourFromNow,
          }),
        }).catch(() => {});
      }
    } else {
      setCallState({ type: "active", roomName, title, videoEnabled });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, realtime, users, lang]);

  const handleSendMessage = useCallback((cId: string, msg: Message) => {
    addMessage(msg);
    if (!currentUser) return;
    const convo = conversations.find((c) => c.id === cId);
    if (!convo) return;
    const recipients = convo.parts.filter((uid) => uid !== currentUser.id);
    const isDrawing = msg.text.startsWith("data:image");
    const isLocation = !!msg.location;
    const preview = isLocation ? "📍 Location" : isDrawing ? "[Drawing]" : msg.text.slice(0, 120);
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    recipients.forEach((toId) => {
      realtime.notifyMessage(toId, {
        fromId: currentUser.id,
        fromName: currentUser.name,
        text: preview,
        conversationId: cId,
      });
      /* Register an email reminder — cancelled automatically if the recipient heartbeats */
      const recipient = users.find((u) => u.id === toId);
      if (recipient?.email) {
        fetch("/api/reminders/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: `${msg.id}-${toId}`,
            recipientId: toId,
            recipientEmail: recipient.email,
            recipientName: recipient.name,
            type: "message",
            summary: `${currentUser.name}: ${preview}`,
            senderName: currentUser.name,
            lang: lang,
            scheduledAt: oneHourFromNow,
          }),
        }).catch(() => {});
      }
    });
  }, [addMessage, conversations, currentUser, realtime, users, lang]);

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
          /* Persist new password to server so it works across browsers */
          fetch(`/api/users/${updated.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: newPw, mustChangePassword: false }),
          }).catch(() => { /* non-critical — local store updated */ });
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

        <main key={page} className="page-enter" style={{ flex: 1, overflow: "auto" }}>
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
              onSendMessage={handleSendMessage}
              onCreateConvo={addConversation}
              onAddNotification={addNotification}
              onDeleteConversation={isAdmin ? deleteConversation : undefined}
              onStartCall={handleStartCall}
              onUpdateMessage={updateMessage}
              onDeleteMessage={deleteMessage}
              onReact={addReaction}
              onMarkRead={markMessagesRead}
              initialConvoId={chatOpenConvoId}
              onConvoOpened={() => setChatOpenConvoId(null)}
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
          {page === "meetings" && (
            <Meetings
              currentUser={currentUser}
              teamMembers={myTeam}
              onStartCall={handleStartCall}
            />
          )}
        </main>
      </div>

      {/* ── Outgoing call overlay ── */}
      {callState?.type === "outgoing" && (
        <OutgoingCall
          targetName={callState.targetName}
          targetColor={callState.targetColor}
          videoEnabled={callState.videoEnabled}
          onCancel={() => {
            realtime.declineCall(callState.targetId, callState.callId);
            setCallState(null);
          }}
        />
      )}

      {/* ── Incoming call overlay ── */}
      {callState?.type === "incoming" && (
        <IncomingCall
          signal={callState.signal}
          onAccept={() => {
            const sig = (callState as { type: "incoming"; signal: CallSignal }).signal;
            realtime.acceptCall(sig.callerId, sig.callId, sig.roomName, sig.videoEnabled);
            setCallState({ type: "active", roomName: sig.roomName, title: sig.callerName, videoEnabled: sig.videoEnabled });
          }}
          onDecline={() => {
            const sig = (callState as { type: "incoming"; signal: CallSignal }).signal;
            realtime.declineCall(sig.callerId, sig.callId);
            setCallState(null);
          }}
        />
      )}

      {/* ── Active video room overlay ── */}
      {callState?.type === "active" && (
        <VideoRoom
          roomName={callState.roomName}
          displayName={currentUser.name}
          roomTitle={callState.title}
          startWithVideoMuted={!callState.videoEnabled}
          defaultLang={lang}
          onLeave={() => {
            if (callState.type === "active") {
              setCallState(null);
            }
          }}
        />
      )}

      {/* ── In-app toast notifications ── */}
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

      {/* ── Session timeout warning modal ── */}
      {showTimeoutWarning && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(7,13,26,0.72)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px",
        }}>
          <div style={{
            background: "#ffffff", borderRadius: 20,
            padding: "40px 36px", maxWidth: 400, width: "100%",
            boxShadow: "0 24px 80px rgba(7,13,26,0.4)",
            textAlign: "center", fontFamily: "'DM Sans', sans-serif",
          }}>
            {/* Clock icon */}
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg,rgba(201,169,110,0.18),rgba(201,169,110,0.06))",
              border: "2px solid rgba(201,169,110,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 20px",
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <h2 style={{ color: "#070D1A", fontSize: 20, fontWeight: 700, margin: "0 0 10px" }}>
              {lang === "fr" ? "Toujours là ?" : "Still there?"}
            </h2>
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.65, margin: "0 0 8px" }}>
              {lang === "fr"
                ? "Vous avez été inactif(ve) pendant 55 minutes."
                : "You've been inactive for 55 minutes."}
            </p>
            <p style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.65, margin: "0 0 28px" }}>
              {lang === "fr"
                ? "Déconnexion automatique dans"
                : "You'll be signed out automatically in"}
            </p>

            {/* Countdown */}
            <div style={{
              fontSize: 44, fontWeight: 800, color: timeoutCountdown <= 60 ? "#DC2626" : "#C9A96E",
              margin: "0 0 28px", letterSpacing: "-0.02em",
              transition: "color 0.3s",
            }}>
              {String(Math.floor(timeoutCountdown / 60)).padStart(2, "0")}
              :{String(timeoutCountdown % 60).padStart(2, "0")}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setCurrentUser(null)}
                style={{
                  flex: 1, padding: "12px 0",
                  border: "1.5px solid #E5E7EB", borderRadius: 10,
                  background: "#ffffff", cursor: "pointer",
                  fontSize: 14, fontWeight: 600, color: "#6B7280",
                  fontFamily: "inherit",
                }}
              >
                {lang === "fr" ? "Se déconnecter" : "Sign Out"}
              </button>
              <button
                onClick={stayActive}
                style={{
                  flex: 2, padding: "12px 0", border: "none", borderRadius: 10,
                  background: "linear-gradient(135deg,#C9A96E,#a87e4a)",
                  cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#ffffff",
                  fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(201,169,110,0.35)",
                }}
              >
                {lang === "fr" ? "Rester connecté(e)" : "Stay Signed In"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
