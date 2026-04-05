// ── Utility functions ─────────────────────────────────────────────────────────

/** Generates a short random ID string (8 characters, alphanumeric). */
export const uid = () => Math.random().toString(36).slice(2, 10);

/** A stable "now" snapshot used for computing relative dates in seed data. */
export const now = new Date();

/** Formats a Date as an ISO date string (YYYY-MM-DD). */
export const fmt = (d: Date) => d.toISOString().split("T")[0];

/** Formats a date/string as a human-readable time using the system locale. */
export const fmtT = (d: string | Date) =>
  new Date(d).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

/** Returns a new Date offset by `n` days from `d`. */
export const addD = (d: Date, n: number) => {
  const result = new Date(d);
  result.setDate(result.getDate() + n);
  return result;
};

/** Returns a new Date offset by `n` hours from `d`. */
export const addH = (d: Date, n: number) => {
  const result = new Date(d);
  result.setHours(result.getHours() + n);
  return result;
};


// ── Domain types ──────────────────────────────────────────────────────────────

export type BdgVariant = "default" | "gold" | "success" | "warning" | "danger" | "info" | "navy";

export type Permission =
  | "view_dashboard" | "view_projects" | "create_projects"
  | "view_tasks"     | "create_tasks"
  | "view_files"     | "upload_files"
  | "view_chat"      | "send_messages"
  | "view_calendar"  | "view_reports"
  | "view_team"      | "invite_members"
  | "view_settings";

export type RoleDef = {
  id: string;
  label: string;
  isSystem: boolean;
  badgeVariant: BdgVariant;
};

export type Client = {
  id: string;
  name: string;
  company: string;
  color: string;
  contactEmail: string;
  phone?: string;
  status: "active" | "inactive";
  created: string;
  /** IDs of internal staff members directly assigned to manage this client. */
  staffIds?: string[];
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Two-letter initials used as avatar fallback. */
  av: string;
  photo?: string;
  /** Optional brand/accent color for the user's avatar. */
  color?: string;
  status: "active" | "inactive";
  dept: string;
  phone?: string;
  clientId?: string;
  password?: string;
  mustChangePassword?: boolean;
  invitedAt?: string;
  invitedBy?: string;
};

export type ProjectStatus = "active" | "on-hold" | "completed";

export type Project = {
  id: string;
  name: string;
  desc: string;
  color: string;
  owner: string;
  members: string[];
  status: ProjectStatus;
  clientId?: string;
  created: string;
};

export type ServiceCadence = "weekly" | "monthly" | "quarterly" | "annual";

export type ServiceStatus = "active" | "paused" | "completed";

export type Service = {
  id: string;
  name: string;
  desc: string;
  color: string;
  cadence: ServiceCadence;
  members: string[];
  owner: string;
  status: ServiceStatus;
  clientId?: string;
  created: string;
};

export type SubTask = { id: string; t: string; done: boolean };
export type Comment = { id: string; uid: string; text: string; date: string };

export type TaskStatus   = "To Do" | "In Progress" | "In Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type Task = {
  id: string;
  /** Project ID (empty string for service tasks). */
  pId: string;
  /** Service ID (set for service tasks, absent for project tasks). */
  sId?: string;
  title: string;
  desc: string;
  status: TaskStatus;
  /** Priority level. */
  pri: TaskPriority;
  assignee: string;
  due: string;
  created: string;
  subs: SubTask[];
  cmts: Comment[];
  /** Overall progress percentage (0–100). */
  prog: number;
  section?: string;
};

export type Notification = {
  id: string;
  type: string;
  text: string;
  read: boolean;
  date: string;
};

export type ConversationType = "direct" | "group";

export type Conversation = {
  id: string;
  type: ConversationType;
  name: string | null;
  parts: string[];
  pId?: string;
  created: string;
};

export type Attachment = {
  name: string;
  type: string;
  size: number;
  data: string;
};

export type Reaction = {
  emoji: string;
  userIds: string[];
};

export type SharedLocation = {
  lat: number;
  lng: number;
  label?: string;
};

export type Message = {
  id: string;
  /** Conversation ID this message belongs to. */
  cId: string;
  /** User ID of the sender. */
  from: string;
  text: string;
  /** ISO timestamp. */
  ts: string;
  attachment?: Attachment;
  replyTo?: string;
  reactions?: Reaction[];
  edited?: boolean;
  readBy?: string[];
  location?: SharedLocation;
};

export type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  /** Project ID this file belongs to. */
  pId: string;
  /** Service ID (for service-scoped files). */
  sId?: string;
  /** Folder ID. */
  fId: string;
  /** Uploaded by (user ID). */
  by: string;
  /** Uploaded at (ISO timestamp). */
  at: string;
  tags: string[];
};

export type Folder = {
  id: string;
  name: string;
  /** Project ID this folder belongs to. */
  pId: string;
  /** Service ID (for service-scoped folders). */
  sId?: string;
};

export type TicketStatus = "new" | "under_review" | "in_progress" | "resolved" | "closed";
export type TicketCategory = "complaint" | "request" | "issue" | "other";

export type TicketNote = {
  id: string;
  /** User ID of note author. */
  uid: string;
  text: string;
  date: string;
};

export type Ticket = {
  id: string;
  title: string;
  category: TicketCategory;
  description: string;
  status: TicketStatus;
  /** User ID of the person who submitted the ticket. */
  submitterId: string;
  /** Client ID associated with the submitter (if any). */
  clientId?: string;
  /** Optional related project ID. */
  projectId?: string;
  /** Optional related service ID. */
  serviceId?: string;
  attachment?: Attachment;
  /** Internal staff notes, not visible to the client submitter. */
  notes: TicketNote[];
  createdAt: string;
  updatedAt: string;
};


// ── Permission catalogue ───────────────────────────────────────────────────────

/** Full list of all available feature permissions, grouped for display in the admin panel. */
export const ALL_PERMISSIONS: { id: Permission; group: string; groupFr: string; label: string; labelFr: string }[] = [
  { id: "view_dashboard",  group: "Dashboard", groupFr: "Tableau de bord", label: "View Dashboard",           labelFr: "Accès au tableau de bord" },
  { id: "view_projects",   group: "Projects",  groupFr: "Projets",         label: "View Projects",            labelFr: "Voir les projets" },
  { id: "create_projects", group: "Projects",  groupFr: "Projets",         label: "Create & Manage Projects", labelFr: "Créer et gérer les projets" },
  { id: "view_tasks",      group: "Tasks",     groupFr: "Tâches",          label: "View Tasks",               labelFr: "Voir les tâches" },
  { id: "create_tasks",    group: "Tasks",     groupFr: "Tâches",          label: "Create & Edit Tasks",      labelFr: "Créer et modifier les tâches" },
  { id: "view_files",      group: "Files",     groupFr: "Fichiers",        label: "View Files",               labelFr: "Voir les fichiers" },
  { id: "upload_files",    group: "Files",     groupFr: "Fichiers",        label: "Upload Files",             labelFr: "Téléverser des fichiers" },
  { id: "view_chat",       group: "Messages",  groupFr: "Messagerie",      label: "View Messages",            labelFr: "Voir les messages" },
  { id: "send_messages",   group: "Messages",  groupFr: "Messagerie",      label: "Send Messages",            labelFr: "Envoyer des messages" },
  { id: "view_calendar",   group: "Calendar",  groupFr: "Calendrier",      label: "View Calendar",            labelFr: "Voir le calendrier" },
  { id: "view_reports",    group: "Reports",   groupFr: "Rapports",        label: "View Reports",             labelFr: "Voir les rapports" },
  { id: "view_team",       group: "Team",      groupFr: "Équipe",          label: "View Team Directory",      labelFr: "Annuaire d'équipe" },
  { id: "invite_members",  group: "Team",      groupFr: "Équipe",          label: "Invite Members",           labelFr: "Inviter des membres" },
  { id: "view_settings",   group: "Settings",  groupFr: "Paramètres",      label: "View Settings",            labelFr: "Accès aux paramètres" },
];


// ── Visual constants ───────────────────────────────────────────────────────────

export const STATUSES   = ["To Do", "In Progress", "In Review", "Done"] as const;
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const PRIORITY_COLORS: Record<TaskPriority, { bg: string; t: string; d: string }> = {
  Low:    { bg: "#E8F5E9", t: "#2E7D32", d: "#4CAF50" },
  Medium: { bg: "#FFF3E0", t: "#E65100", d: "#FF9800" },
  High:   { bg: "#FCE4EC", t: "#C62828", d: "#EF5350" },
  Urgent: { bg: "#F3E5F5", t: "#6A1B9A", d: "#AB47BC" },
};

export const STATUS_COLORS: Record<TaskStatus, { bg: string; t: string; a: string }> = {
  "To Do":      { bg: "#E2E5EE", t: "#4A5268", a: "#9BA3B5" },
  "In Progress":{ bg: "#DBEAFE", t: "#1E40AF", a: "#3B82F6" },
  "In Review":  { bg: "#FEF3C7", t: "#92400E", a: "#F59E0B" },
  "Done":       { bg: "#D1FAE5", t: "#065F46", a: "#10B981" },
};

export const FILE_TYPES: Record<string, { c: string; l: string }> = {
  pdf:  { c: "#EF4444", l: "PDF"  },
  doc:  { c: "#3B82F6", l: "DOC"  },
  xls:  { c: "#22C55E", l: "XLS"  },
  png:  { c: "#8B5CF6", l: "PNG"  },
  fig:  { c: "#EC4899", l: "FIG"  },
  csv:  { c: "#14B8A6", l: "CSV"  },
  pptx: { c: "#F97316", l: "PPTX" },
  md:   { c: "#6366F1", l: "MD"   },
  jpg:  { c: "#F59E0B", l: "JPG"  },
  zip:  { c: "#6B7280", l: "ZIP"  },
};
