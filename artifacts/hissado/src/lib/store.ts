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
      addTask: (t) => set((s) => {
        // Auto-add assignee to the parent project/service members so they immediately
        // gain visibility into the project context, files, and conversations.
        const needsProjectSync = t.assignee && !t.sId && t.pId;
        const needsServiceSync = t.assignee && !!t.sId;
        return {
          tasks: [...s.tasks, t],
          ...(needsProjectSync && {
            projects: s.projects.map((p) =>
              p.id === t.pId && !p.members.includes(t.assignee)
                ? { ...p, members: [...p.members, t.assignee] }
                : p
            ),
          }),
          ...(needsServiceSync && {
            services: s.services.map((sv) =>
              sv.id === t.sId && !sv.members.includes(t.assignee)
                ? { ...sv, members: [...sv.members, t.assignee] }
                : sv
            ),
          }),
        };
      }),
      updateTask: (t) => set((s) => {
        // When assignee changes, also ensure they are added to the parent members.
        const needsProjectSync = t.assignee && !t.sId && t.pId;
        const needsServiceSync = t.assignee && !!t.sId;
        return {
          tasks: s.tasks.map((x) => (x.id === t.id ? t : x)),
          ...(needsProjectSync && {
            projects: s.projects.map((p) =>
              p.id === t.pId && !p.members.includes(t.assignee)
                ? { ...p, members: [...p.members, t.assignee] }
                : p
            ),
          }),
          ...(needsServiceSync && {
            services: s.services.map((sv) =>
              sv.id === t.sId && !sv.members.includes(t.assignee)
                ? { ...sv, members: [...sv.members, t.assignee] }
                : sv
            ),
          }),
        };
      }),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),

      // ── Projects ──
      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
      updateProject: (p) => set((s) => ({ projects: s.projects.map((x) => (x.id === p.id ? p : x)) })),
      deleteProject: (id) => set((s) => {
        const removedConvoIds = new Set(
          s.conversations.filter((c) => c.pId === id).map((c) => c.id)
        );
        return {
          projects:      s.projects.filter((x) => x.id !== id),
          // Cascade-delete associated tasks, files, folders, conversations, and their messages
          tasks:         s.tasks.filter((t) => t.pId !== id),
          files:         s.files.filter((f) => f.pId !== id),
          folders:       s.folders.filter((f) => f.pId !== id),
          conversations: s.conversations.filter((c) => c.pId !== id),
          messages:      s.messages.filter((m) => !removedConvoIds.has(m.cId)),
        };
      }),

      // ── Services ──
      addService: (sv) => set((s) => ({ services: [...s.services, sv] })),
      updateService: (sv) => set((s) => ({ services: s.services.map((x) => (x.id === sv.id ? sv : x)) })),
      deleteService: (id) => set((s) => ({
        services: s.services.filter((x) => x.id !== id),
        // Cascade-delete tasks, files, and folders tied to this service
        tasks:   s.tasks.filter((t) => t.sId !== id),
        files:   s.files.filter((f) => f.sId !== id),
        folders: s.folders.filter((f) => f.sId !== id),
      })),

      // ── Clients ──
      addClient: (c) => set((s) => ({ clients: [...s.clients, c] })),
      updateClient: (c) => set((s) => ({ clients: s.clients.map((x) => (x.id === c.id ? c : x)) })),
      deleteClient: (id) => set((s) => ({
        clients: s.clients.filter((x) => x.id !== id),
        // Unlink clientId from projects, services, and users that belonged to this client
        projects:  s.projects.map((p) => p.clientId === id ? { ...p, clientId: undefined } : p),
        services:  s.services.map((sv) => sv.clientId === id ? { ...sv, clientId: undefined } : sv),
        users:     s.users.map((u) => u.clientId === id ? { ...u, clientId: undefined } : u),
      })),
      updateClientStaff: (clientId, staffIds) => set((s) => ({
        clients: s.clients.map((c) => c.id === clientId ? { ...c, staffIds } : c),
      })),

      // ── Users ──
      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (u) => set((s) => ({ users: s.users.map((x) => (x.id === u.id ? u : x)) })),
      mergeServerUsers: (serverUsers) => set((s) => {
        // Safety guard: never wipe all local users if the server returns an empty list
        // (e.g. server error, cold boot, etc.)
        if (!serverUsers.length) return {};

        // SERVER IS TRUTH for core identity fields (name, email, role, dept, status,
        // mustChangePassword, clientId, av, password). We merge server data into local
        // users so that edits / deletions made in another browser are immediately reflected.
        // Local-only fields (color, photo, phone, etc.) that the server doesn't track
        // are preserved from the local record.
        const serverMap = new Map(serverUsers.map((u) => [u.id, u]));
        const loggedInId = s.currentUser?.id;
        let changed = false;

        // Step 1 — Update fields for users found on the server; drop users removed from server
        const merged: typeof s.users = [];
        for (const local of s.users) {
          const srv = serverMap.get(local.id);
          if (!srv) {
            // User no longer exists on server. Remove them — UNLESS they are the currently
            // signed-in user (deleting the session owner mid-flight would break the app).
            if (local.id === loggedInId) {
              merged.push(local);
            } else {
              changed = true; // dropping this user
            }
            continue;
          }
          // Selectively apply server fields, preserving any local-only extras
          const srvFields: Partial<typeof local> = {};
          if (srv.name !== local.name)                               { srvFields.name = srv.name; changed = true; }
          if (srv.email !== local.email)                             { srvFields.email = srv.email; changed = true; }
          if (srv.role !== local.role)                               { srvFields.role = srv.role; changed = true; }
          if (srv.dept !== local.dept)                               { srvFields.dept = srv.dept; changed = true; }
          if (srv.status !== local.status)                           { srvFields.status = srv.status; changed = true; }
          if (srv.av !== local.av && srv.av)                         { srvFields.av = srv.av; changed = true; }
          if (srv.mustChangePassword !== local.mustChangePassword)   { srvFields.mustChangePassword = srv.mustChangePassword; changed = true; }
          if (srv.clientId !== local.clientId)                       { srvFields.clientId = srv.clientId; changed = true; }
          if (srv.password && srv.password !== local.password)       { srvFields.password = srv.password; changed = true; }
          merged.push(Object.keys(srvFields).length > 0 ? { ...local, ...srvFields } : local);
        }

        // Step 2 — Add users that exist on the server but not locally (invited from elsewhere)
        const localIds = new Set(s.users.map((u) => u.id));
        const newFromServer = serverUsers.filter((srv) => !localIds.has(srv.id));
        if (newFromServer.length > 0) changed = true;

        if (!changed) return {};
        return { users: [...merged, ...newFromServer] };
      }),
      deleteUser: (id) => set((s) => {
        // Direct conversations involving this user are removed entirely
        const directRemoved = new Set(
          s.conversations
            .filter((c) => c.type === "direct" && c.parts.includes(id))
            .map((c) => c.id)
        );
        // Group conversations: remove the user from the participants list;
        // if this leaves only 1 participant the conversation is meaningless — drop it too
        const updatedGroups = s.conversations
          .filter((c) => c.type === "group" && c.parts.includes(id))
          .map((c) => ({ ...c, parts: c.parts.filter((p) => p !== id) }));
        const groupRemovedIds = new Set(
          updatedGroups.filter((c) => c.parts.length <= 1).map((c) => c.id)
        );
        const removedConvoIds = new Set([...directRemoved, ...groupRemovedIds]);

        const mergedConversations = s.conversations
          .filter((c) => !removedConvoIds.has(c.id))
          .map((c) => {
            const updated = updatedGroups.find((g) => g.id === c.id);
            return updated ?? c;
          });

        return {
          users:         s.users.filter((x) => x.id !== id),
          tasks:         s.tasks.map((t) => t.assignee === id ? { ...t, assignee: "" } : t),
          projects:      s.projects.map((p) => ({ ...p, members: p.members.filter((m) => m !== id) })),
          services:      s.services.map((sv) => ({ ...sv, members: sv.members.filter((m) => m !== id) })),
          clients:       s.clients.map((c) => ({ ...c, staffIds: (c.staffIds ?? []).filter((m) => m !== id) })),
          conversations: mergedConversations,
          messages:      s.messages.filter((m) => !removedConvoIds.has(m.cId)),
        };
      }),

      // ── Notifications ──
      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markAllNotifsRead: () => set((s) => ({
        notifications: s.notifications.map((n) => ({ ...n, read: true })),
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
          const existing = reactions.find((r) => r.emoji === emoji);

          if (existing) {
            if (existing.userIds.includes(userId)) {
              // Toggle off: remove user from this reaction
              const updated = existing.userIds.filter((id) => id !== userId);
              if (updated.length === 0) {
                return { ...m, reactions: reactions.filter((r) => r.emoji !== emoji) };
              }
              return { ...m, reactions: reactions.map((r) => r.emoji === emoji ? { ...r, userIds: updated } : r) };
            }
            // Toggle on: add user to existing reaction
            return { ...m, reactions: reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r) };
          }

          // New reaction
          return { ...m, reactions: [...reactions, { emoji, userIds: [userId] }] };
        }),
      })),
      markMessagesRead: (conversationId, userId) => set((s) => ({
        messages: s.messages.map((m) => {
          if (m.cId !== conversationId || m.from === userId) return m;
          if (m.readBy?.includes(userId)) return m;
          return { ...m, readBy: [...(m.readBy || []), userId] };
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
        users:       s.users.map((u) => (u.dept === oldName ? { ...u, dept: newName } : u)),
      })),
      deleteDepartment: (name) => set((s) => ({
        departments: s.departments.filter((d) => d !== name),
      })),

      // ── Roles ──
      addRoleDef: (r) => set((s) => ({ roleDefs: [...s.roleDefs, r] })),
      updateRoleDef: (r) => set((s) => ({ roleDefs: s.roleDefs.map((x) => (x.id === r.id ? r : x)) })),
      deleteRoleDef: (id) => set((s) => {
        const { [id]: _removed, ...remainingPerms } = s.rolePermissions;
        return {
          roleDefs:        s.roleDefs.filter((r) => r.id !== id),
          users:           s.users.map((u) => (u.role === id ? { ...u, role: "member" } : u)),
          rolePermissions: remainingPerms as Record<string, Permission[]>,
        };
      }),
      setRolePermissions: (roleId, perms) => set((s) => ({
        rolePermissions: { ...s.rolePermissions, [roleId]: perms },
      })),

      // ── Tickets ──
      addTicket: (t) => set((s) => ({ tickets: [t, ...s.tickets] })),
      updateTicket: (id, updates) => set((s) => ({
        tickets: s.tickets.map((t) => t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t),
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
    }
  )
);
