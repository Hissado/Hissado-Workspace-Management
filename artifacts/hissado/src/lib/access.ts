import type { User, Project, Task, Service, Conversation, FileItem, Folder, Permission } from "./data";

/**
 * Check if a user has a specific feature permission based on the stored permission config.
 */
export function hasPermission(
  user: User,
  permission: Permission,
  rolePermissions: Record<string, string[]>
): boolean {
  const perms = rolePermissions[user.role] ?? [];
  return perms.includes(permission);
}

/**
 * Returns true if the user has access to the given project.
 * - Admins and managers see all projects.
 * - Client users (with clientId) see all projects matching their clientId (no member restriction).
 * - Internal members see only projects they're assigned to.
 */
export function canAccessProject(user: User, project: Project): boolean {
  if (user.role === "admin" || user.role === "manager") return true;
  if (user.clientId) {
    return project.clientId === user.clientId;
  }
  return project.members.includes(user.id);
}

/**
 * Filter a list of projects to only those the user can access.
 */
export function accessibleProjects(user: User, projects: Project[]): Project[] {
  if (user.role === "admin" || user.role === "manager") return projects;
  // Client portal users see all projects belonging to their client (no member restriction)
  if (user.clientId) {
    return projects.filter((p) => p.clientId === user.clientId);
  }
  // Internal users see only projects they are assigned to
  return projects.filter((p) => p.members.includes(user.id));
}

/**
 * Filter services to only those the user can access.
 * - Admins and managers see all services.
 * - Client users see only services for their client AND where they're a member.
 * - Internal members see only services they're assigned to.
 */
export function accessibleServices(user: User, services: Service[]): Service[] {
  if (user.role === "admin" || user.role === "manager") return services;
  // Client portal users see all services belonging to their client (no member restriction)
  if (user.clientId) {
    return services.filter((s) => s.clientId === user.clientId);
  }
  // Internal users see only services where they are a member
  return services.filter((s) => s.members.includes(user.id));
}

/**
 * Filter tasks to only those in accessible projects OR accessible services.
 */
export function accessibleTasks(user: User, tasks: Task[], projects: Project[], services?: Service[]): Task[] {
  const projIds = new Set(accessibleProjects(user, projects).map((p) => p.id));
  const accessibleSvcs = services ? accessibleServices(user, services) : [];
  const svcIds = new Set(accessibleSvcs.map((s) => s.id));
  return tasks.filter((t) => {
    if (t.sId) return svcIds.has(t.sId);
    return projIds.has(t.pId);
  });
}

/**
 * Filter conversations to only those the user is a participant of,
 * AND where the other participants share a project with the user.
 */
export function accessibleConversations(
  user: User,
  conversations: Conversation[],
  projects: Project[]
): Conversation[] {
  if (user.role === "admin") return conversations;

  const myProjects = accessibleProjects(user, projects);
  const teamMateIds = new Set<string>();
  teamMateIds.add(user.id);
  myProjects.forEach((p) => p.members.forEach((id) => teamMateIds.add(id)));

  return conversations.filter((cv) => {
    if (!cv.parts.includes(user.id)) return false;
    return cv.parts.every((pid) => teamMateIds.has(pid));
  });
}

/**
 * Filter team members to only those who share at least one project with the current user.
 * Admins see everyone.
 */
export function accessibleTeamMembers(
  user: User,
  users: User[],
  projects: Project[]
): User[] {
  if (user.role === "admin" || user.role === "manager") return users;

  const myProjects = accessibleProjects(user, projects);
  const teamMateIds = new Set<string>();
  teamMateIds.add(user.id);
  myProjects.forEach((p) => p.members.forEach((id) => teamMateIds.add(id)));

  return users.filter((u) => teamMateIds.has(u.id));
}

/**
 * Filter files to those in accessible projects.
 */
export function accessibleFiles(
  user: User,
  files: FileItem[],
  projects: Project[]
): FileItem[] {
  if (user.role === "admin" || user.role === "manager") return files;
  const projIds = new Set(accessibleProjects(user, projects).map((p) => p.id));
  return files.filter((f) => projIds.has(f.pId));
}

/**
 * Filter folders to those in accessible projects.
 */
export function accessibleFolders(
  user: User,
  folders: Folder[],
  projects: Project[]
): Folder[] {
  if (user.role === "admin" || user.role === "manager") return folders;
  const projIds = new Set(accessibleProjects(user, projects).map((p) => p.id));
  return folders.filter((f) => projIds.has(f.pId));
}

/**
 * Check if a user can manage project settings (add/remove members, delete tasks, etc).
 */
export function canManageProject(user: User, project: Project): boolean {
  if (user.role === "admin") return true;
  if (user.role === "manager" && project.members.includes(user.id)) return true;
  return false;
}

/**
 * Check if a user can invite team members.
 */
export function canInviteMembers(user: User): boolean {
  return user.role === "admin" || user.role === "manager";
}

/**
 * Check if a user can create projects.
 */
export function canCreateProject(user: User): boolean {
  return user.role === "admin" || user.role === "manager";
}

/**
 * Check if a user can delete another user account.
 * Admins only; cannot delete themselves.
 */
export function canDeleteUser(actor: User, target: User): boolean {
  return actor.role === "admin" && actor.id !== target.id;
}
