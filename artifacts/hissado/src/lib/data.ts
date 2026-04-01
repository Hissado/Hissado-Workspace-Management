export const uid = () => Math.random().toString(36).slice(2, 10);
export const now = new Date();
export const fmt = (d: Date) => d.toISOString().split("T")[0];
export const fmtT = (d: string | Date) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
export const addD = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
export const addH = (d: Date, n: number) => {
  const r = new Date(d);
  r.setHours(r.getHours() + n);
  return r;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "member" | "client";
  av: string;
  status: "active" | "inactive";
  dept: string;
};

export type Project = {
  id: string;
  name: string;
  desc: string;
  color: string;
  owner: string;
  members: string[];
  status: "active" | "on-hold" | "completed";
  created: string;
};

export type SubTask = { id: string; t: string; done: boolean };
export type Comment = { id: string; uid: string; text: string; date: string };

export type Task = {
  id: string;
  pId: string;
  title: string;
  desc: string;
  status: "To Do" | "In Progress" | "In Review" | "Done";
  pri: "Low" | "Medium" | "High" | "Urgent";
  assignee: string;
  due: string;
  created: string;
  subs: SubTask[];
  cmts: Comment[];
  prog: number;
};

export type Notification = {
  id: string;
  type: string;
  text: string;
  read: boolean;
  date: string;
};

export type Conversation = {
  id: string;
  type: "direct" | "group";
  name: string | null;
  parts: string[];
  pId?: string;
  created: string;
};

export type Message = {
  id: string;
  cId: string;
  from: string;
  text: string;
  ts: string;
};

export type FileItem = {
  id: string;
  name: string;
  type: string;
  size: string;
  pId: string;
  fId: string;
  by: string;
  at: string;
  tags: string[];
};

export type Folder = {
  id: string;
  name: string;
  pId: string;
};

export const STATUSES = ["To Do", "In Progress", "In Review", "Done"] as const;
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;

export const PRIORITY_COLORS: Record<string, { bg: string; t: string; d: string }> = {
  Low: { bg: "#E8F5E9", t: "#2E7D32", d: "#4CAF50" },
  Medium: { bg: "#FFF3E0", t: "#E65100", d: "#FF9800" },
  High: { bg: "#FCE4EC", t: "#C62828", d: "#EF5350" },
  Urgent: { bg: "#F3E5F5", t: "#6A1B9A", d: "#AB47BC" },
};

export const STATUS_COLORS: Record<string, { bg: string; t: string; a: string }> = {
  "To Do": { bg: "#E2E5EE", t: "#4A5268", a: "#9BA3B5" },
  "In Progress": { bg: "#DBEAFE", t: "#1E40AF", a: "#3B82F6" },
  "In Review": { bg: "#FEF3C7", t: "#92400E", a: "#F59E0B" },
  Done: { bg: "#D1FAE5", t: "#065F46", a: "#10B981" },
};

export const FILE_TYPES: Record<string, { c: string; l: string }> = {
  pdf: { c: "#EF4444", l: "PDF" },
  doc: { c: "#3B82F6", l: "DOC" },
  xls: { c: "#22C55E", l: "XLS" },
  png: { c: "#8B5CF6", l: "PNG" },
  fig: { c: "#EC4899", l: "FIG" },
  csv: { c: "#14B8A6", l: "CSV" },
  pptx: { c: "#F97316", l: "PPTX" },
  md: { c: "#6366F1", l: "MD" },
  jpg: { c: "#F59E0B", l: "JPG" },
  zip: { c: "#6B7280", l: "ZIP" },
};

// ── Seed Data ──
export const SEED_USERS: User[] = [
  { id: "u1", name: "Issa Daouda", email: "issa@hissado.com", role: "admin", av: "ID", status: "active", dept: "Executive" },
  { id: "u2", name: "Sarah Mitchell", email: "sarah@hissado.com", role: "manager", av: "SM", status: "active", dept: "Engineering" },
  { id: "u3", name: "James Chen", email: "james@hissado.com", role: "member", av: "JC", status: "active", dept: "Engineering" },
  { id: "u4", name: "Amara Diallo", email: "amara@hissado.com", role: "member", av: "AD", status: "active", dept: "Design" },
  { id: "u5", name: "Client Portal", email: "client@external.com", role: "client", av: "CP", status: "active", dept: "External" },
];

export const SEED_PROJECTS: Project[] = [
  { id: "p1", name: "Website Redesign", desc: "Complete redesign of corporate website", color: "#C8A45C", owner: "u2", members: ["u1", "u2", "u3", "u4"], status: "active", created: fmt(addD(now, -30)) },
  { id: "p2", name: "Mobile App Launch", desc: "Native mobile app for iOS and Android", color: "#5B8DEF", owner: "u2", members: ["u2", "u3"], status: "active", created: fmt(addD(now, -20)) },
  { id: "p3", name: "Q2 Marketing", desc: "Strategic marketing initiatives for Q2", color: "#6FCF97", owner: "u1", members: ["u1", "u4"], status: "active", created: fmt(addD(now, -15)) },
  { id: "p4", name: "Data Migration", desc: "Legacy data migration to cloud", color: "#F2994A", owner: "u2", members: ["u2", "u3"], status: "on-hold", created: fmt(addD(now, -45)) },
];

export const SEED_TASKS: Task[] = [
  { id: "t1", pId: "p1", title: "Design system audit", desc: "Audit design tokens", status: "Done", pri: "High", assignee: "u4", due: fmt(addD(now, -5)), created: fmt(addD(now, -28)), subs: [{ id: "s1", t: "Color review", done: true }, { id: "s2", t: "Typography", done: true }], cmts: [{ id: "c1", uid: "u4", text: "Completed audit. 23 inconsistencies found.", date: fmt(addD(now, -6)) }], prog: 100 },
  { id: "t2", pId: "p1", title: "Wireframe homepage", desc: "Create wireframes", status: "In Review", pri: "High", assignee: "u4", due: fmt(addD(now, 2)), created: fmt(addD(now, -20)), subs: [{ id: "s3", t: "Desktop", done: true }, { id: "s4", t: "Mobile", done: true }, { id: "s5", t: "Tablet", done: false }], cmts: [], prog: 75 },
  { id: "t3", pId: "p1", title: "Frontend development", desc: "Implement new design in React", status: "In Progress", pri: "Medium", assignee: "u3", due: fmt(addD(now, 10)), created: fmt(addD(now, -15)), subs: [{ id: "s6", t: "Header", done: true }, { id: "s7", t: "Hero", done: false }], cmts: [{ id: "c2", uid: "u3", text: "Started component library setup.", date: fmt(addD(now, -3)) }], prog: 35 },
  { id: "t4", pId: "p1", title: "SEO optimization", desc: "Implement SEO best practices", status: "To Do", pri: "Low", assignee: "u3", due: fmt(addD(now, 20)), created: fmt(addD(now, -10)), subs: [], cmts: [], prog: 0 },
  { id: "t5", pId: "p1", title: "Content migration", desc: "Migrate content to new CMS", status: "To Do", pri: "Medium", assignee: "u2", due: fmt(addD(now, 15)), created: fmt(addD(now, -8)), subs: [], cmts: [], prog: 0 },
  { id: "t6", pId: "p2", title: "API architecture", desc: "Design RESTful endpoints", status: "Done", pri: "Urgent", assignee: "u3", due: fmt(addD(now, -10)), created: fmt(addD(now, -18)), subs: [], cmts: [{ id: "c3", uid: "u2", text: "Great API docs!", date: fmt(addD(now, -11)) }], prog: 100 },
  { id: "t7", pId: "p2", title: "Auth module", desc: "OAuth 2.0 + JWT", status: "In Progress", pri: "Urgent", assignee: "u3", due: fmt(addD(now, 3)), created: fmt(addD(now, -12)), subs: [{ id: "s11", t: "Login flow", done: true }, { id: "s12", t: "Token refresh", done: false }], cmts: [], prog: 50 },
  { id: "t8", pId: "p2", title: "Push notifications", desc: "Push notification service", status: "To Do", pri: "Medium", assignee: "u2", due: fmt(addD(now, 14)), created: fmt(addD(now, -5)), subs: [], cmts: [], prog: 0 },
  { id: "t9", pId: "p3", title: "Campaign strategy", desc: "Q2 campaign planning", status: "Done", pri: "High", assignee: "u1", due: fmt(addD(now, -3)), created: fmt(addD(now, -14)), subs: [], cmts: [], prog: 100 },
  { id: "t10", pId: "p3", title: "Social media content", desc: "Social calendar + content", status: "In Progress", pri: "Medium", assignee: "u4", due: fmt(addD(now, 5)), created: fmt(addD(now, -9)), subs: [], cmts: [], prog: 60 },
];

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", type: "assign", text: "Assigned to 'Frontend development'", read: false, date: fmt(addD(now, -1)) },
  { id: "n2", type: "comment", text: "Amara commented on 'Design audit'", read: false, date: fmt(addD(now, -2)) },
  { id: "n3", type: "due", text: "'Auth module' due in 3 days", read: true, date: fmt(now) },
];

export const SEED_CONVERSATIONS: Conversation[] = [
  { id: "cv1", type: "direct", name: null, parts: ["u1", "u2"], created: addH(now, -48).toISOString() },
  { id: "cv2", type: "direct", name: null, parts: ["u1", "u3"], created: addH(now, -72).toISOString() },
  { id: "cv3", type: "group", name: "Website Redesign Team", parts: ["u1", "u2", "u3", "u4"], pId: "p1", created: addD(now, -25).toISOString() },
  { id: "cv4", type: "group", name: "Engineering", parts: ["u1", "u2", "u3"], created: addD(now, -20).toISOString() },
  { id: "cv5", type: "group", name: "Design Team", parts: ["u1", "u4"], created: addD(now, -10).toISOString() },
];

export const SEED_MESSAGES: Message[] = [
  { id: "m1", cId: "cv1", from: "u2", text: "Hey Issa, I pushed the updated wireframes. Can you review?", ts: addH(now, -26).toISOString() },
  { id: "m2", cId: "cv1", from: "u1", text: "Sure, I'll look this afternoon. Mobile breakpoints included?", ts: addH(now, -25).toISOString() },
  { id: "m3", cId: "cv1", from: "u2", text: "Yes, all three breakpoints covered. Also added dark mode.", ts: addH(now, -24).toISOString() },
  { id: "m4", cId: "cv1", from: "u1", text: "Perfect. Feedback by EOD.", ts: addH(now, -23).toISOString() },
  { id: "m5", cId: "cv2", from: "u3", text: "API endpoints ready for testing. Deploy to staging?", ts: addH(now, -10).toISOString() },
  { id: "m6", cId: "cv2", from: "u1", text: "Go ahead. Let me know when it's live.", ts: addH(now, -9).toISOString() },
  { id: "m7", cId: "cv3", from: "u2", text: "Team: On track for design review Friday. Components ready by Thursday EOD please.", ts: addH(now, -48).toISOString() },
  { id: "m8", cId: "cv3", from: "u4", text: "Icon set and illustrations finalized by Wednesday.", ts: addH(now, -46).toISOString() },
  { id: "m9", cId: "cv3", from: "u3", text: "Frontend at 60%. Header, nav, footer done. Working on hero.", ts: addH(now, -44).toISOString() },
  { id: "m10", cId: "cv3", from: "u1", text: "Great progress. Let's sync Thursday morning.", ts: addH(now, -42).toISOString() },
  { id: "m11", cId: "cv4", from: "u2", text: "Code reviews moving to Tuesdays next week.", ts: addH(now, -72).toISOString() },
  { id: "m12", cId: "cv5", from: "u4", text: "Uploaded new brand guidelines to shared files.", ts: addH(now, -5).toISOString() },
  { id: "m13", cId: "cv5", from: "u1", text: "Thanks Amara! Color palette looks refined. Let's apply everywhere.", ts: addH(now, -4).toISOString() },
];

export const SEED_FILES: FileItem[] = [
  { id: "f1", name: "Brand Guidelines v2.pdf", type: "pdf", size: "2.4 MB", pId: "p1", fId: "fl1", by: "u4", at: addD(now, -20).toISOString(), tags: ["design", "branding"] },
  { id: "f2", name: "Homepage Wireframe.fig", type: "fig", size: "8.1 MB", pId: "p1", fId: "fl1", by: "u4", at: addD(now, -15).toISOString(), tags: ["wireframe"] },
  { id: "f3", name: "Component Library.fig", type: "fig", size: "12.3 MB", pId: "p1", fId: "fl1", by: "u4", at: addD(now, -10).toISOString(), tags: ["components"] },
  { id: "f4", name: "SEO Audit.pdf", type: "pdf", size: "1.8 MB", pId: "p1", fId: "fl2", by: "u3", at: addD(now, -8).toISOString(), tags: ["seo"] },
  { id: "f5", name: "Content Inventory.xls", type: "xls", size: "340 KB", pId: "p1", fId: "fl2", by: "u2", at: addD(now, -5).toISOString(), tags: ["content"] },
  { id: "f6", name: "API Docs.md", type: "md", size: "45 KB", pId: "p2", fId: "fl3", by: "u3", at: addD(now, -12).toISOString(), tags: ["api"] },
  { id: "f7", name: "DB Schema.pdf", type: "pdf", size: "890 KB", pId: "p2", fId: "fl3", by: "u3", at: addD(now, -10).toISOString(), tags: ["database"] },
  { id: "f8", name: "App Mockups.fig", type: "fig", size: "15.2 MB", pId: "p2", fId: "fl4", by: "u4", at: addD(now, -8).toISOString(), tags: ["mobile"] },
  { id: "f9", name: "Q2 Strategy.pptx", type: "pptx", size: "4.5 MB", pId: "p3", fId: "fl5", by: "u1", at: addD(now, -7).toISOString(), tags: ["strategy"] },
  { id: "f10", name: "Social Calendar.xls", type: "xls", size: "210 KB", pId: "p3", fId: "fl5", by: "u4", at: addD(now, -4).toISOString(), tags: ["social"] },
  { id: "f11", name: "Migration Plan.pdf", type: "pdf", size: "780 KB", pId: "p4", fId: "fl6", by: "u2", at: addD(now, -25).toISOString(), tags: ["migration"] },
];

export const SEED_FOLDERS: Folder[] = [
  { id: "fl1", name: "Design Assets", pId: "p1" },
  { id: "fl2", name: "Documents", pId: "p1" },
  { id: "fl3", name: "Technical Docs", pId: "p2" },
  { id: "fl4", name: "Design", pId: "p2" },
  { id: "fl5", name: "Campaign Materials", pId: "p3" },
  { id: "fl6", name: "Migration Docs", pId: "p4" },
];
