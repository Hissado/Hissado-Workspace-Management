import type { User, Project, Task, Conversation, FileItem, Folder } from "./data";

/**
 * Returns true if the user has access to the given project.
 * Admins and managers see all projects.
 */
export function canAccessProject(user: User, project: Project): boolean {
  if (user.role === "admin") return true;
  return project.members.includes(user.id);
}

/**
 * Filter a list of projects to only those the user can access.
 */
export function accessibleProjects(user: User, projects: Project[]): Project[] {
  if (user.role === "admin") return projects;
  return projects.filter((p) => p.members.includes(user.id));
}

/**
 * Filter tasks to only those in accessible projects.
 */
export function accessibleTasks(user: User, tasks: Task[], projects: Project[]): Task[] {
  const projIds = new Set(accessibleProjects(user, projects).map((p) => p.id));
  return tasks.filter((t) => projIds.has(t.pId));
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

  // Set of user IDs that share at least one project with current user
  const myProjects = accessibleProjects(user, projects);
  const teamMateIds = new Set<string>();
  teamMateIds.add(user.id);
  myProjects.forEach((p) => p.members.forEach((id) => teamMateIds.add(id)));

  return conversations.filter((cv) => {
    // Must be a participant
    if (!cv.parts.includes(user.id)) return false;
    // All other participants must be teammates
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
  if (user.role === "admin") return users;

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
  if (user.role === "admin") return files;
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
  if (user.role === "admin") return folders;
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
