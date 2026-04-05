import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  User, Project, Task, Service, Client,
  Notification, Conversation, Message, Reaction,
  FileItem, Folder, RoleDef, Permission, Ticket,
} from "./data";
import {
  SEED_USERS, SEED_PROJECTS, SEED_SERVICES, SEED_CLIENTS, SEED_TASKS,
  SEED_NOTIFICATIONS, SEED_CONVERSATIONS, SEED_MESSAGES, SEED_FILES,
  SEED_FOLDERS, SEED_ROLE_DEFS, SEED_ROLE_PERMISSIONS, SEED_DEPARTMENTS,
} from "./seed";

// ── Navigation ────────────────────────────────────────────────────────────────

export type Page =
  | "dashboard" | "services" | "sdetail" | "projects" | "pdetail" | "tasks"
  | "chat" | "files" | "calendar" | "reports"
  | "team" | "clients" | "settings" | "meetings" | "tickets";

// Maximum number of notifications kept in the store.
// Prevents localStorage from growing unboundedly in long-running sessions.
const MAX_NOTIFICATIONS = 100;

// ── Shared pure helpers ───────────────────────────────────────────────────────

/**
 * Computes the cascading state changes caused by removing a user.
 * Handles: task unassignment, project/service/client membership removal,
 * direct conversation deletion, group conversation pruning, and message cleanup.
 * Does NOT modify the `users` array — callers are responsible for that.
 */
function computeUserDeletionCascade(
  s: Readonly<AppState>,
  userId: string,
): Partial<Pick<AppState, "tasks" | "projects" | "services" | "clients" | "conversations" | "messages">> {
  const directRemovedIds = new Set(
    s.conversations
      .filter((c) => c.type === "direct" && c.parts.includes(userId))
      .map((c) => c.id),
  );

  const updatedGroups = s.conversations
    .filter((c) => c.type === "group" && c.parts.includes(userId))
    .map((c) => ({ ...c, parts: c.parts.filter((p) => p !== userId) }));

  // A group conversation with ≤1 participant after removal is meaningless — drop it.
  const groupRemovedIds = new Set(
    updatedGroups.filter((c) => c.parts.length <= 1).map((c) => c.id),
  );

  const removedConvoIds = new Set([...directRemovedIds, ...groupRemovedIds]);
  const updatedGroupMap = new Map(updatedGroups.map((g) => [g.id, g]));

  return {
    tasks:    s.tasks.map((t) => t.assignee === userId ? { ...t, assignee: "" } : t),
    projects: s.projects.map((p) => ({ ...p, members: p.members.filter((m) => m !== userId) })),
    services: s.services.map((sv) => ({ ...sv, members: sv.members.filter((m) => m !== userId) })),
    clients:  s.clients.map((c) => ({ ...c, staffIds: (c.staffIds ?? []).filter((m) => m !== userId) })),
    conversations: s.conversations
      .filter((c) => !removedConvoIds.has(c.id))
      .map((c) => updatedGroupMap.get(c.id) ?? c),
    messages: s.messages.filter((m) => !removedConvoIds.has(m.cId)),
  };
}

/**
 * Returns the project/service membership updates needed when a task's assignee changes.
 * Service membership takes priority over project membership (a task can only live in one).
 */
function computeAssigneeSync(
  s: Readonly<AppState>,
  task: Pick<Task, "assignee" | "pId" | "sId">,
): Partial<Pick<AppState, "projects" | "services">> {
  if (!task.assignee) return {};

  if (task.sId) {
    return {
      services: s.services.map((sv) =>
        sv.id === task.sId && !sv.members.includes(task.assignee)
          ? { ...sv, members: [...sv.members, task.assignee] }
          : sv,
      ),
    };
  }

  if (task.pId) {
    return {
      projects: s.projects.map((p) =>
        p.id === task.pId && !p.members.includes(task.assignee)
          ? { ...p, members: [...p.members, task.assignee] }
          : p,
      ),
    };
  }

  return {};
}

// ── Store shape ───────────────────────────────────────────────────────────────

interface AppState {
  // Session
  currentUser: User | null;
  page: Page;
  collapsed: boolean;
  searchQuery: string;
  chatOpenConvoId: string | null;

  // UI state for modals / overlays
  selectedProject: Project | null;
  selectedService: Service | null;
  selectedTask: Task | null;
  showTaskModal: boolean;
  showProjectModal: boolean;

  // Domain data
  users: User[];
  projects: Project[];
  services: Service[];
  clients: Client[];
  tasks: Task[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  files: FileItem[];
  folders: Folder[];
  departments: string[];
  roleDefs: RoleDef[];
  rolePermissions: Record<string, Permission[]>;
  tickets: Ticket[];

  // Session actions
  setCurrentUser: (u: User | null) => void;
  setPage: (p: Page) => void;
  setCollapsed: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setChatOpenConvoId: (id: string | null) => void;

  // Modal/overlay actions
  setSelectedProject: (p: Project | null) => void;
  setSelectedService: (s: Service | null) => void;
  setSelectedTask: (t: Task | null) => void;
  setShowTaskModal: (v: boolean) => void;
  setShowProjectModal: (v: boolean) => void;

  // Task actions
  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;

  // Project actions
  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;

  // Service actions
  addService: (s: Service) => void;
  updateService: (s: Service) => void;
  deleteService: (id: string) => void;

  // Client actions
  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;
  updateClientStaff: (clientId: string, staffIds: string[]) => void;

  // User actions
  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  mergeServerUsers: (serverUsers: User[]) => void;

  // Notification actions
  addNotification: (n: Notification) => void;
  markAllNotifsRead: () => void;

  // Conversation / message actions
  addConversation: (c: Conversation) => void;
  deleteConversation: (id: string) => void;
  addMessage: (m: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  addReaction: (msgId: string, emoji: string, userId: string) => void;
  markMessagesRead: (conversationId: string, userId: string) => void;

  // File / folder actions
  addFile: (f: FileItem) => void;
  deleteFile: (id: string) => void;
  addFolder: (f: Folder) => void;
  deleteFolder: (id: string) => void;

  // Department actions
  addDepartment: (name: string) => void;
  updateDepartment: (oldName: string, newName: string) => void;
  deleteDepartment: (name: string) => void;

  // Role / permission actions
  addRoleDef: (r: RoleDef) => void;
  updateRoleDef: (r: RoleDef) => void;
  deleteRoleDef: (id: string) => void;
  setRolePermissions: (roleId: string, perms: Permission[]) => void;

  // Ticket actions
  addTicket: (t: Ticket) => void;
  updateTicket: (id: string, updates: Partial<Ticket>) => void;
  deleteTicket: (id: string) => void;
}


// ── Store implementation ──────────────────────────────────────────────────────

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // ── Initial state ──
      currentUser: null,
      page: "dashboard",
      collapsed: false,
      searchQuery: "",
      chatOpenConvoId: null,

      selectedProject: null,
      selectedService: null,
      selectedTask: null,
      showTaskModal: false,
      showProjectModal: false,

      users: SEED_USERS,
      projects: SEED_PROJECTS,
      services: SEED_SERVICES,
      clients: SEED_CLIENTS,
      tasks: SEED_TASKS,
      notifications: SEED_NOTIFICATIONS,
      conversations: SEED_CONVERSATIONS,
      messages: SEED_MESSAGES,
      files: SEED_FILES,
      folders: SEED_FOLDERS,
      departments: SEED_DEPARTMENTS,
      roleDefs: SEED_ROLE_DEFS,
      rolePermissions: SEED_ROLE_PERMISSIONS,
      tickets: [],

      // ── Session ──

      // Navigate to dashboard only when the logged-in identity changes
      // (login → new session, logout → null). Updating the same user's
      // profile (e.g. from the Settings page) must NOT reset the page.
      setCurrentUser: (u) => set((s) => ({
        currentUser: u,
        page: (!u || u.id !== s.currentUser?.id) ? "dashboard" : s.page,
      })),
      setPage: (p) => set({ page: p }),
      setCollapsed: (v) => set({ collapsed: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setChatOpenConvoId: (id) => set({ chatOpenConvoId: id }),

      // ── Modals / overlays ──
      setSelectedProject: (p) => set({ selectedProject: p }),
      setSelectedService: (s) => set({ selectedService: s }),
      setSelectedTask: (t) => set({ selectedTask: t }),
      setShowTaskModal: (v) => set({ showTaskModal: v }),
      setShowProjectModal: (v) => set({ showProjectModal: v }),

      // ── Tasks ──
      addTask: (t) => set((s) => ({
        tasks: [...s.tasks, t],
        // Auto-add the assignee to the parent project/service so they immediately
        // gain visibility into the project context, files, and conversations.
        ...computeAssigneeSync(s, t),
      })),
      updateTask: (t) => set((s) => ({
        tasks: s.tasks.map((x) => (x.id === t.id ? t : x)),
        ...computeAssigneeSync(s, t),
      })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),

      // ── Projects ──
      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
      updateProject: (p) => set((s) => ({
        projects: s.projects.map((x) => (x.id === p.id ? p : x)),
        // Keep the detail panel in sync so it never shows stale data.
        selectedProject: s.selectedProject?.id === p.id ? p : s.selectedProject,
      })),
      deleteProject: (id) => set((s) => {
        const removedConvoIds = new Set(
          s.conversations.filter((c) => c.pId === id).map((c) => c.id),
        );
        return {
          projects:      s.projects.filter((x) => x.id !== id),
          selectedProject: s.selectedProject?.id === id ? null : s.selectedProject,
          // Cascade-delete associated tasks, files, folders, conversations, and messages.
          tasks:         s.tasks.filter((t) => t.pId !== id),
          files:         s.files.filter((f) => f.pId !== id),
          folders:       s.folders.filter((f) => f.pId !== id),
          conversations: s.conversations.filter((c) => c.pId !== id),
          messages:      s.messages.filter((m) => !removedConvoIds.has(m.cId)),
        };
      }),

      // ── Services ──
      addService: (sv) => set((s) => ({ services: [...s.services, sv] })),
      updateService: (sv) => set((s) => ({
        services: s.services.map((x) => (x.id === sv.id ? sv : x)),
        // Keep the detail panel in sync.
        selectedService: s.selectedService?.id === sv.id ? sv : s.selectedService,
      })),
      deleteService: (id) => set((s) => ({
        services: s.services.filter((x) => x.id !== id),
        selectedService: s.selectedService?.id === id ? null : s.selectedService,
        // Cascade-delete tasks, files, and folders tied to this service.
        tasks:   s.tasks.filter((t) => t.sId !== id),
        files:   s.files.filter((f) => f.sId !== id),
        folders: s.folders.filter((f) => f.sId !== id),
      })),

      // ── Clients ──
      addClient: (c) => set((s) => ({ clients: [...s.clients, c] })),
      updateClient: (c) => set((s) => ({ clients: s.clients.map((x) => (x.id === c.id ? c : x)) })),
      deleteClient: (id) => set((s) => ({
        clients: s.clients.filter((x) => x.id !== id),
        // Unlink clientId from projects, services, and users that belonged to this client.
        projects:  s.projects.map((p) => p.clientId === id ? { ...p, clientId: undefined } : p),
        services:  s.services.map((sv) => sv.clientId === id ? { ...sv, clientId: undefined } : sv),
        users:     s.users.map((u) => u.clientId === id ? { ...u, clientId: undefined } : u),
      })),
      updateClientStaff: (clientId, staffIds) => set((s) => ({
        clients: s.clients.map((c) => c.id === clientId ? { ...c, staffIds } : c),
      })),

      // ── Users ──

      // Guard against duplicate IDs (e.g. two concurrent invite submissions).
      addUser: (u) => set((s) => {
        if (s.users.some((x) => x.id === u.id)) return {};
        return { users: [...s.users, u] };
      }),

      // When the logged-in user's own profile is updated (e.g. Settings page),
      // currentUser must be kept in sync — otherwise the UI shows stale identity data.
      updateUser: (u) => set((s) => ({
        users: s.users.map((x) => (x.id === u.id ? u : x)),
        currentUser: s.currentUser?.id === u.id ? u : s.currentUser,
      })),

      deleteUser: (id) => set((s) => ({
        users: s.users.filter((x) => x.id !== id),
        ...computeUserDeletionCascade(s, id),
      })),

      mergeServerUsers: (serverUsers) => set((s) => {
        // Safety guard: never wipe all local users if the server returns an empty list
        // (e.g. cold-boot race, network error returning a 200 with an empty body, etc.).
        if (!serverUsers.length) return {};

        // SERVER IS TRUTH for core identity fields. We merge server data so that
        // edits and deletions made in another browser are reflected here immediately.
        // Local-only fields (color, photo, phone) that the server doesn't track
        // are preserved from the local record.
        const serverMap = new Map(serverUsers.map((u) => [u.id, u]));
        const loggedInId = s.currentUser?.id;

        let changed = false;
        let updatedCurrentUser: User | null = s.currentUser;

        // Accumulate cascade changes for all users dropped in this merge pass.
        let cascadedState: ReturnType<typeof computeUserDeletionCascade> = {};

        const merged: User[] = [];

        for (const local of s.users) {
          const srv = serverMap.get(local.id);

          if (!srv) {
            // User was removed from the server by another browser.
            // Protect the active session — never evict the currently signed-in user.
            if (local.id === loggedInId) {
              merged.push(local);
            } else {
              changed = true;
              // Merge the cascade for this dropped user into the accumulated state.
              // We apply it to the current `s` snapshot since helpers are pure.
              const cascade = computeUserDeletionCascade(s, local.id);
              cascadedState = {
                tasks:         cascade.tasks         ?? cascadedState.tasks,
                projects:      cascade.projects      ?? cascadedState.projects,
                services:      cascade.services      ?? cascadedState.services,
                clients:       cascade.clients       ?? cascadedState.clients,
                conversations: cascade.conversations ?? cascadedState.conversations,
                messages:      cascade.messages      ?? cascadedState.messages,
              };
            }
            continue;
          }

          // Selectively apply server fields, preserving any local-only extras.
          const srvFields: Partial<User> = {};
          if (srv.name   !== local.name)                             { srvFields.name   = srv.name;   changed = true; }
          if (srv.email  !== local.email)                            { srvFields.email  = srv.email;  changed = true; }
          if (srv.role   !== local.role)                             { srvFields.role   = srv.role;   changed = true; }
          if (srv.dept   !== local.dept)                             { srvFields.dept   = srv.dept;   changed = true; }
          if (srv.status !== local.status)                           { srvFields.status = srv.status; changed = true; }
          // `av` is always a string — sync it unconditionally (covers clears too).
          if (srv.av !== local.av)                                   { srvFields.av     = srv.av;     changed = true; }
          if (srv.mustChangePassword !== local.mustChangePassword)   { srvFields.mustChangePassword = srv.mustChangePassword; changed = true; }
          if (srv.clientId !== local.clientId)                       { srvFields.clientId = srv.clientId; changed = true; }
          // Password is stripped from GET /api/users — only sync if the server
          // actually returned one (e.g. a future authenticated endpoint).
          if (srv.password && srv.password !== local.password)       { srvFields.password = srv.password; changed = true; }

          const updatedUser = Object.keys(srvFields).length > 0
            ? { ...local, ...srvFields }
            : local;

          merged.push(updatedUser);

          // If this is the logged-in user, keep currentUser in sync so the session
          // reflects any role/name/email changes made by an admin in another browser.
          if (local.id === loggedInId && updatedUser !== local) {
            updatedCurrentUser = updatedUser;
          }
        }

        // Add users that exist on the server but not locally (invited from elsewhere).
        const localIds = new Set(s.users.map((u) => u.id));
        const newFromServer = serverUsers.filter((srv) => !localIds.has(srv.id));
        if (newFromServer.length > 0) changed = true;

        if (!changed) return {};

        return {
          users: [...merged, ...newFromServer],
          currentUser: updatedCurrentUser,
          ...cascadedState,
        };
      }),

      // ── Notifications ──
      addNotification: (n) => set((s) => {
        // Prepend and cap to prevent unbounded localStorage growth.
        const next = [n, ...s.notifications];
        return { notifications: next.length > MAX_NOTIFICATIONS ? next.slice(0, MAX_NOTIFICATIONS) : next };
      }),
      markAllNotifsRead: () => set((s) => ({
        notifications: s.notifications.map((n) => n.read ? n : { ...n, read: true }),
      })),

      // ── Conversations & messages ──
      addConversation: (c) => set((s) => ({ conversations: [...s.conversations, c] })),
      deleteConversation: (id) => set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
        messages:      s.messages.filter((m) => m.cId !== id),
      })),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
      updateMessage: (id, updates) => set((s) => ({
        messages: s.messages.map((m) => m.id === id ? { ...m, ...updates } : m),
      })),
      deleteMessage: (id) => set((s) => ({
        messages: s.messages.filter((m) => m.id !== id),
      })),
      addReaction: (msgId, emoji, userId) => set((s) => ({
        messages: s.messages.map((m) => {
          if (m.id !== msgId) return m;

          const reactions: Reaction[] = m.reactions ? [...m.reactions] : [];
          const existingIdx = reactions.findIndex((r) => r.emoji === emoji);

          if (existingIdx !== -1) {
            const existing = reactions[existingIdx];
            if (existing.userIds.includes(userId)) {
              // Toggle off: remove user from this reaction.
              const updated = existing.userIds.filter((id) => id !== userId);
              if (updated.length === 0) {
                return { ...m, reactions: reactions.filter((_, i) => i !== existingIdx) };
              }
              const next = [...reactions];
              next[existingIdx] = { ...existing, userIds: updated };
              return { ...m, reactions: next };
            }
            // Toggle on: add user to existing reaction.
            const next = [...reactions];
            next[existingIdx] = { ...existing, userIds: [...existing.userIds, userId] };
            return { ...m, reactions: next };
          }

          // New reaction emoji not yet seen on this message.
          return { ...m, reactions: [...reactions, { emoji, userIds: [userId] }] };
        }),
      })),
      markMessagesRead: (conversationId, userId) => set((s) => ({
        messages: s.messages.map((m) => {
          // Skip messages outside this conversation or sent by this user.
          if (m.cId !== conversationId || m.from === userId) return m;
          // Skip messages already marked read by this user.
          if (m.readBy?.includes(userId)) return m;
          return { ...m, readBy: [...(m.readBy ?? []), userId] };
        }),
      })),

      // ── Files & folders ──
      addFile: (f) => set((s) => ({ files: [...s.files, f] })),
      deleteFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
      addFolder: (f) => set((s) => ({ folders: [...s.folders, f] })),
      deleteFolder: (id) => set((s) => ({
        folders: s.folders.filter((f) => f.id !== id),
        files:   s.files.filter((f) => f.fId !== id),
      })),

      // ── Departments ──
      addDepartment: (name) => set((s) => ({ departments: [...s.departments, name] })),
      updateDepartment: (oldName, newName) => set((s) => ({
        departments: s.departments.map((d) => (d === oldName ? newName : d)),
        users: s.users.map((u) => (u.dept === oldName ? { ...u, dept: newName } : u)),
        // Keep currentUser in sync if their department was renamed.
        currentUser: s.currentUser?.dept === oldName
          ? { ...s.currentUser, dept: newName }
          : s.currentUser,
      })),
      deleteDepartment: (name) => set((s) => ({
        departments: s.departments.filter((d) => d !== name),
        // Clear the dept field on any users that belonged to the deleted department
        // so they are not left pointing at a name that no longer exists in the list.
        users: s.users.map((u) => (u.dept === name ? { ...u, dept: "" } : u)),
        currentUser: s.currentUser?.dept === name
          ? { ...s.currentUser, dept: "" }
          : s.currentUser,
      })),

      // ── Roles ──
      addRoleDef: (r) => set((s) => ({ roleDefs: [...s.roleDefs, r] })),
      updateRoleDef: (r) => set((s) => ({ roleDefs: s.roleDefs.map((x) => (x.id === r.id ? r : x)) })),
      deleteRoleDef: (id) => set((s) => {
        const { [id]: _removed, ...remainingPerms } = s.rolePermissions;
        // Fall back to "member" (always a system role). If somehow "member" was
        // also removed, fall back to the first remaining role or an empty string.
        const fallbackRole = s.roleDefs.find((r) => r.id !== id && r.id === "member")
          ? "member"
          : (s.roleDefs.find((r) => r.id !== id)?.id ?? "");
        return {
          roleDefs:        s.roleDefs.filter((r) => r.id !== id),
          users:           s.users.map((u) => (u.role === id ? { ...u, role: fallbackRole } : u)),
          currentUser:     s.currentUser?.role === id
            ? { ...s.currentUser, role: fallbackRole }
            : s.currentUser,
          rolePermissions: remainingPerms as Record<string, Permission[]>,
        };
      }),
      setRolePermissions: (roleId, perms) => set((s) => ({
        rolePermissions: { ...s.rolePermissions, [roleId]: perms },
      })),

      // ── Tickets ──
      addTicket: (t) => set((s) => ({ tickets: [t, ...s.tickets] })),
      updateTicket: (id, updates) => set((s) => ({
        tickets: s.tickets.map((t) =>
          t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t,
        ),
      })),
      deleteTicket: (id) => set((s) => ({ tickets: s.tickets.filter((t) => t.id !== id) })),
    }),
    {
      name: "hissado-pm-v3",
      partialize: (state) => ({
        currentUser:     state.currentUser,
        // Persist the active page + detail context so a refresh lands the user
        // back where they were working, rather than always going to the dashboard.
        page:            state.page,
        collapsed:       state.collapsed,
        selectedProject: state.selectedProject,
        selectedService: state.selectedService,
        users:           state.users,
        projects:        state.projects,
        services:        state.services,
        clients:         state.clients,
        tasks:           state.tasks,
        notifications:   state.notifications,
        conversations:   state.conversations,
        messages:        state.messages,
        files:           state.files,
        folders:         state.folders,
        departments:     state.departments,
        roleDefs:        state.roleDefs,
        rolePermissions: state.rolePermissions,
        tickets:         state.tickets,
      }),
    },
  ),
);
