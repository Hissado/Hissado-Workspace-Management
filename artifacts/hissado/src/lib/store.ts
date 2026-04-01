import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, Project, Task, Notification, Conversation, Message, FileItem, Folder } from "./data";
import {
  SEED_USERS, SEED_PROJECTS, SEED_TASKS, SEED_NOTIFICATIONS,
  SEED_CONVERSATIONS, SEED_MESSAGES, SEED_FILES, SEED_FOLDERS,
} from "./data";

export type Page =
  | "dashboard" | "projects" | "pdetail" | "tasks"
  | "chat" | "files" | "calendar" | "reports"
  | "team" | "settings";

interface AppState {
  currentUser: User | null;
  page: Page;
  collapsed: boolean;
  searchQuery: string;
  selectedProject: Project | null;
  selectedTask: Task | null;
  showTaskModal: boolean;
  showProjectModal: boolean;
  showUserModal: boolean;
  showNotifPanel: boolean;
  editingUser: User | null;

  users: User[];
  projects: Project[];
  tasks: Task[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  files: FileItem[];
  folders: Folder[];

  setCurrentUser: (u: User | null) => void;
  setPage: (p: Page) => void;
  setCollapsed: (v: boolean) => void;
  setSearchQuery: (q: string) => void;
  setSelectedProject: (p: Project | null) => void;
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

  addUser: (u: User) => void;
  updateUser: (u: User) => void;
  deleteUser: (id: string) => void;

  addNotification: (n: Notification) => void;
  markAllNotifsRead: () => void;

  addConversation: (c: Conversation) => void;
  deleteConversation: (id: string) => void;
  addMessage: (m: Message) => void;

  addFile: (f: FileItem) => void;
  deleteFile: (id: string) => void;
  addFolder: (f: Folder) => void;
  deleteFolder: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      page: "dashboard",
      collapsed: false,
      searchQuery: "",
      selectedProject: null,
      selectedTask: null,
      showTaskModal: false,
      showProjectModal: false,
      showUserModal: false,
      showNotifPanel: false,
      editingUser: null,

      users: SEED_USERS,
      projects: SEED_PROJECTS,
      tasks: SEED_TASKS,
      notifications: SEED_NOTIFICATIONS,
      conversations: SEED_CONVERSATIONS,
      messages: SEED_MESSAGES,
      files: SEED_FILES,
      folders: SEED_FOLDERS,

      setCurrentUser: (u) => set({ currentUser: u }),
      setPage: (p) => set({ page: p }),
      setCollapsed: (v) => set({ collapsed: v }),
      setSearchQuery: (q) => set({ searchQuery: q }),
      setSelectedProject: (p) => set({ selectedProject: p }),
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

      addUser: (u) => set((s) => ({ users: [...s.users, u] })),
      updateUser: (u) => set((s) => ({ users: s.users.map((x) => (x.id === u.id ? u : x)) })),
      deleteUser: (id) => set((s) => ({ users: s.users.filter((x) => x.id !== id) })),

      addNotification: (n) => set((s) => ({ notifications: [n, ...s.notifications] })),
      markAllNotifsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

      addConversation: (c) => set((s) => ({ conversations: [...s.conversations, c] })),
      deleteConversation: (id) => set((s) => ({
        conversations: s.conversations.filter((c) => c.id !== id),
        messages: s.messages.filter((m) => m.cId !== id),
      })),
      addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),

      addFile: (f) => set((s) => ({ files: [...s.files, f] })),
      deleteFile: (id) => set((s) => ({ files: s.files.filter((f) => f.id !== id) })),
      addFolder: (f) => set((s) => ({ folders: [...s.folders, f] })),
      deleteFolder: (id) => set((s) => ({
        folders: s.folders.filter((f) => f.id !== id),
        files: s.files.filter((f) => f.fId !== id),
      })),
    }),
    {
      name: "hissado-pm-v3",
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users,
        projects: state.projects,
        tasks: state.tasks,
        notifications: state.notifications,
        conversations: state.conversations,
        messages: state.messages,
        files: state.files,
        folders: state.folders,
      }),
    }
  )
);
