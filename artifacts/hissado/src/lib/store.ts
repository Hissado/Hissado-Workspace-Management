import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Project, Task, Service, Client, Notification, Conversation, Message, Reaction, FileItem, Folder, RoleDef, Permission } from "./data";
import {
  SEED_USERS, SEED_PROJECTS, SEED_SERVICES, SEED_CLIENTS, SEED_TASKS, SEED_NOTIFICATIONS,
  SEED_CONVERSATIONS, SEED_MESSAGES, SEED_FILES, SEED_FOLDERS,
  SEED_ROLE_DEFS, SEED_ROLE_PERMISSIONS, SEED_DEPARTMENTS,
} from "./data";

export type Page =
  | "dashboard" | "services" | "sdetail" | "projects" | "pdetail" | "tasks"
  | "chat" | "files" | "calendar" | "reports"
  | "team" | "clients" | "settings" | "meetings";

interface AppState {
  currentUser: User | null;
  page: Page;
  collapsed: boolean;
  searchQuery: string;
  selectedProject: Project | null;
  selectedService: Service | null;
  selectedTask: Task | null;
  showTaskModal: boolean;
  showProjectModal: boolean;
  showUserModal: boolean;
  showNotifPanel: boolean;
  editingUser: User | null;

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

  setCurrentUser: (u: User | null) => void;
  setPage: (p: Page) => void;
  setCollapsed: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSelectedProject: (p: Project | null) => void;
  setSelectedService: (s: Service | null) => void;
  setSelectedTask: (t: Task | null) => void;
  setShowTaskModal: (v: boolean) => void;
  setShowProjectModal: (v: boolean) => void;
  setShowUserModal: (v: boolean) => void;
  setShowNotifPanel: (v: boolean) => void;
  setEditingUser: (u: User | null) => void;

  addTask: (t: Task) => void;
  updateTask: (t: Task) => void;
  deleteTask: (id: string) => void;

  addProject: (p: Project) => void;
  updateProject: (p: Project) => void;
  deleteProject: (id: string) => void;

  addService: (s: Service) => void;
  updateService: (s: Service) => void;
  deleteService: (id: string) => void;

  addClient: (c: Client) => void;
  updateClient: (c: Client) => void;
  deleteClient: (id: string) => void;

  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;
  mergeServerUsers: (serverUsers: User[]) => void;

  addNotification: (n: Notification) => void;
  markAllNotifsRead: () => void;

  chatOpenConvoId: string | null;
  setChatOpenConvoId: (id: string | null) => void;

  addConversation: (c: Conversation) => void;
  deleteConversation: (id: string) => void;
  addMessage: (m: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  deleteMessage: (id: string) => void;
  addReaction: (msgId: string, emoji: string, userId: string) => void;
  markMessagesRead: (cId: string, userId: string) => void;

  addFile: (f: FileItem) => void;
  deleteFile: (id: string) => void;
  addFolder: (f: Folder) => void;
  deleteFolder: (id: string) => void;

  addDepartment: (name: string) => void;
  updateDepartment: (oldName: string, newName: string) => void;
  deleteDepartment: (name: string) => void;

  addRoleDef: (r: RoleDef) => void;
  updateRoleDef: (r: RoleDef) => void;
  deleteRoleDef: (id: string) => void;

  setRolePermissions: (roleId: string, perms: Permission[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      page: "dashboard",
      collapsed: false,
      searchQuery: "",
      selectedProject: null,
      selectedService: null,
      selectedTask: null,
      showTaskModal: false,
      showProjectModal: false,
      showUserModal: false,
      showNotifPanel: false,
      editingUser: null,

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

      /* Always navigate to dashboard on login or logout so the user starts
         fresh, but page is persisted so a plain browser refresh keeps the
         current page intact.                                                */
      setCurrentUser: (u) => set({ currentUser: u, page: "dashboard" }),
      setPage: (p) => set({ page: p }),
      setCollapsed: (v) => set({ collapsed: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedProject: (p) => set({ selectedProject: p }),
      setSelectedService: (s) => set({ selectedService: s }),
      setSelectedTask: (t) => set({ selectedTask: t }),
      setShowTaskModal: (v) => set({ showTaskModal: v }),
      setShowProjectModal: (v) => set({ showProjectModal: v }),
      setShowUserModal: (v) => set({ showUserModal: v }),
      setShowNotifPanel: (v) => set({ showNotifPanel: v }),
      setEditingUser: (u) => set({ editingUser: u }),

      addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
      updateTask: (t) => set((s) => ({ tasks: s.tasks.map((x) => (x.id === t.id ? t : x)) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((x) => x.id !== id) })),

      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
      updateProject: (p) => set((s) => ({ projects: s.projects.map((x) => (x.id === p.id ? p : x)) })),
      deleteProject: (id) => set((s) => ({
        projects: s.projects.filter((x) => x.id !== id),
        tasks: s.tasks.filter((t) => t.pId !== id),
        files: s.files.filter((f) => f.pId !== id),
        folders: s.folders.filter((f) => f.pId !== id),
        conversations: s.conversations.filter((c) => c.pId !== id),
      })),

      addService: (sv) => set((s) => ({ services: [...s.services, sv] })),
      updateService: (sv) => set((s) => ({ services: s.services.map((x) => (x.id === sv.id ? sv : x)) })),
      deleteService: (id) => set((s) => ({
        services: s.services.filter((x) => x.id !== id),
        tasks: s.tasks.filter((t) => t.sId !== id),
      })),

      addClient: (c) => set((s) => ({ clients: [...s.clients, c] })),
      updateClient: (c) => set((s) => ({ clients: s.clients.map((x) => (x.id === c.id ? c : x)) })),
      deleteClient: (id) => set((s) => ({
        clients: s.clients.filter((x) => x.id !== id),
        // Unlink clientId from all projects, services, and users that belonged to this client
        projects: s.projects.map((p) => p.clientId === id ? { ...p, clientId: undefined } : p),
        services: s.services.map((sv) => sv.clientId === id ? { ...sv, clientId: undefined } : sv),
        users: s.users.map((u) => u.clientId === id ? { ...u, clientId: undefined } : u),
      })),

      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (u) => set((s) => ({ users: s.users.map((x) => (x.id === u.id ? u : x)) })),
      mergeServerUsers: (serverUsers) => set((s) => {
        /* LOCAL DATA WINS — never overwrite local user changes with server data.
           This ensures that:
           • Admin-made role / password changes survive a server restart.
           • Republishing the app does not reset user credentials.
           We only add server users whose ID is not already known locally
           (e.g. a user registered on another device via email invite).     */
        const localIds = new Set(s.users.map((u) => u.id));
        const newFromServer = serverUsers.filter((srv) => !localIds.has(srv.id));
        if (newFromServer.length === 0) return {};           // nothing to add
        return { users: [...s.users, ...newFromServer] };
      }),
      deleteUser: (id) => set((s) => {
        // Find all 1-on-1 conversations involving this user so we can purge their messages too
        const removedConvIds = new Set(
          s.conversations
            .filter((c) => c.type === "direct" && c.parts.includes(id))
            .map((c) => c.id)
        );
        return {
          users: s.users.filter((x) => x.id !== id),
          // Unassign any tasks this user was assigned to
          tasks: s.tasks.map((t) => t.assignee === id ? { ...t, assignee: "" } : t),
          // Remove user from all project member lists (don't delete the project itself)
          projects: s.projects.map((p) => ({
            ...p,
            members: p.members.filter((m) => m !== id),
          })),
          // Delete their 1-on-1 conversations and those conversations' messages
          conversations: s.conversations.filter((c) => !removedConvIds.has(c.id)),
          messages: s.messages.filter((m) => !removedConvIds.has(m.cId)),
        };
      }),

      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markAllNotifsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      chatOpenConvoId: null,
      setChatOpenConvoId: (id) => set({ chatOpenConvoId: id }),

      addConversation: (c) => set((s) => ({ conversations: [...s.conversations, c] })),
      deleteConversation: (id) => set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
        messages: s.messages.filter((m) => m.cId !== id),
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
              const updated = existing.userIds.filter((id) => id !== userId);
              if (updated.length === 0) return { ...m, reactions: reactions.filter((r) => r.emoji !== emoji) };
              return { ...m, reactions: reactions.map((r) => r.emoji === emoji ? { ...r, userIds: updated } : r) };
            }
            return { ...m, reactions: reactions.map((r) => r.emoji === emoji ? { ...r, userIds: [...r.userIds, userId] } : r) };
          }
          return { ...m, reactions: [...reactions, { emoji, userIds: [userId] }] };
        }),
      })),
      markMessagesRead: (cId, userId) => set((s) => ({
        messages: s.messages.map((m) => {
          if (m.cId !== cId || m.from === userId) return m;
          if (m.readBy?.includes(userId)) return m;
          return { ...m, readBy: [...(m.readBy || []), userId] };
        }),
      })),

      addFile: (f) => set((s) => ({ files: [...s.files, f] })),
      deleteFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
      addFolder: (f) => set((s) => ({ folders: [...s.folders, f] })),
      deleteFolder: (id) => set((s) => ({
        folders: s.folders.filter((f) => f.id !== id),
        files: s.files.filter((f) => f.fId !== id),
      })),

      addDepartment: (name) => set((s) => ({ departments: [...s.departments, name] })),
      updateDepartment: (oldName, newName) => set((s) => ({
        departments: s.departments.map((d) => (d === oldName ? newName : d)),
        users: s.users.map((u) => (u.dept === oldName ? { ...u, dept: newName } : u)),
      })),
      deleteDepartment: (name) => set((s) => ({
        departments: s.departments.filter((d) => d !== name),
      })),

      addRoleDef: (r) => set((s) => ({ roleDefs: [...s.roleDefs, r] })),
      updateRoleDef: (r) => set((s) => ({ roleDefs: s.roleDefs.map((x) => (x.id === r.id ? r : x)) })),
      deleteRoleDef: (id) => set((s) => {
        const { [id]: _removed, ...remainingPerms } = s.rolePermissions;
        return {
          roleDefs: s.roleDefs.filter((r) => r.id !== id),
          users: s.users.map((u) => (u.role === id ? { ...u, role: "member" } : u)),
          rolePermissions: remainingPerms as Record<string, Permission[]>,
        };
      }),

      setRolePermissions: (roleId, perms) => set((s) => ({
        rolePermissions: { ...s.rolePermissions, [roleId]: perms },
      })),
    }),
    {
      name: "hissado-pm-v3",
      partialize: (state) => ({
        currentUser:     state.currentUser,
        /* Persist the active page + detail context so a browser refresh
           (F5) lands the user back on exactly where they were working,
           rather than always resetting to the dashboard.                */
        page:            state.page,
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
      }),
    }
  )
);
