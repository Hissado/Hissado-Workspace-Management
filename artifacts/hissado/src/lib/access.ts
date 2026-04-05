import type { User, Project, Task, Service, Client, Conversation, FileItem, Folder, Permission } from "./data";

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
 * - Client users see all projects matching their clientId.
 * - Internal members see projects they are assigned to OR have a task assigned to them in.
 */
export function canAccessProject(user: User, project: Project, tasks?: Task[]): boolean {
  if (user.role === "admin" || user.role === "manager") return true;
  if (user.clientId) return project.clientId === user.clientId;
  if (project.members.includes(user.id)) return true;
  // Also grant access if the user has a task assigned to them in this project
  if (tasks) return tasks.some((t) => t.assignee === user.id && t.pId === project.id && !t.sId);
  return false;
}

/**
 * Filter projects the user can access.
 * Internal members: projects they are listed as a member of, OR have an assigned task in.
 * Clients: projects belonging to their client account.
 * Admins / managers: all projects.
 */
export function accessibleProjects(user: User, projects: Project[], tasks?: Task[]): Project[] {
  if (user.role === "admin" || user.role === "manager") return projects;
  if (user.clientId) return projects.filter((p) => p.clientId === user.clientId);
  if (!tasks) return projects.filter((p) => p.members.includes(user.id));

  // Collect project IDs where user has an assigned task
  const assignedProjIds = new Set(
    tasks.filter((t) => t.assignee === user.id && !t.sId).map((t) => t.pId)
  );
  return projects.filter((p) => p.members.includes(user.id) || assignedProjIds.has(p.id));
}

/**
 * Filter services the user can access.
 * Internal members: services they are listed as a member of, OR have an assigned task in.
 * Clients: services belonging to their client account.
 * Admins / managers: all services.
 */
export function accessibleServices(user: User, services: Service[], tasks?: Task[]): Service[] {
  if (user.role === "admin" || user.role === "manager") return services;
  if (user.clientId) return services.filter((s) => s.clientId === user.clientId);
  if (!tasks) return services.filter((s) => s.members.includes(user.id));

  // Collect service IDs where user has an assigned task
  const assignedSvcIds = new Set(
    tasks.filter((t) => t.assignee === user.id && !!t.sId).map((t) => t.sId as string)
  );
  return services.filter((s) => s.members.includes(user.id) || assignedSvcIds.has(s.id));
}

/**
 * Filter tasks the user can access.
 * - Admins / managers: all tasks.
 * - Any user: tasks directly assigned to them (regardless of project membership).
 * - Otherwise: tasks belonging to accessible projects / services.
 */
export function accessibleTasks(
  user: User,
  tasks: Task[],
  projects: Project[],
  services?: Service[]
): Task[] {
  if (user.role === "admin" || user.role === "manager") return tasks;

  const projIds = new Set(accessibleProjects(user, projects, tasks).map((p) => p.id));
  const svcIds  = new Set(
    (services ? accessibleServices(user, services, tasks) : []).map((s) => s.id)
  );

  return tasks.filter((t) => {
    // Always surface tasks directly assigned to this user — even if they haven't
    // been added to the project's member list yet.
    if (t.assignee === user.id) return true;
    // Otherwise gate on project / service access.
    if (t.sId) return svcIds.has(t.sId);
    return projIds.has(t.pId);
  });
}

/**
 * Filter clients the user can access.
 * - Admins / managers: all clients.
 * - Internal staff: clients where their ID is in the client's staffIds array,
 *   OR clients linked to any project/service they are a member of.
 * - Client portal users: only their own client.
 */
export function accessibleClients(
  user: User,
  clients: Client[],
  projects?: Project[],
  services?: Service[]
): Client[] {
  if (user.role === "admin" || user.role === "manager") return clients;

  // Client portal users see only their own client record
  if (user.clientId) return clients.filter((c) => c.id === user.clientId);

  // Internal staff — see clients they are directly assigned to OR linked via projects/services
  const linkedClientIds = new Set<string>();
  if (projects) {
    projects.forEach((p) => {
      if (p.clientId && p.members.includes(user.id)) linkedClientIds.add(p.clientId);
    });
  }
  if (services) {
    services.forEach((s) => {
      if (s.clientId && s.members.includes(user.id)) linkedClientIds.add(s.clientId);
    });
  }

  return clients.filter(
    (c) => (c.staffIds ?? []).includes(user.id) || linkedClientIds.has(c.id)
  );
}

/**
 * Filter conversations the user can access.
 *
 * Admins: all conversations.
 * Internal staff (no clientId): all conversations they are a participant of.
 *   → No project-based restriction: internal team members should be able to
 *     chat with any other internal colleague.
 * Clients: only conversations where every other participant belongs to their
 *   project team (no other clients visible).
 */
export function accessibleConversations(
  user: User,
  conversations: Conversation[],
  projects: Project[]
): Conversation[] {
  if (user.role === "admin") return conversations;

  // Internal staff — open access to all their own threads
  if (!user.clientId) {
    return conversations.filter((cv) => cv.parts.includes(user.id));
  }

  // Client users — restricted to conversations that only involve their project team
  const myProjects   = accessibleProjects(user, projects);
  const allowedIds   = new Set<string>();
  allowedIds.add(user.id);
  myProjects.forEach((p) => p.members.forEach((id) => allowedIds.add(id)));

  return conversations.filter((cv) => {
    if (!cv.parts.includes(user.id)) return false;
    return cv.parts.every((pid) => allowedIds.has(pid));
  });
}

/**
 * Filter visible team members.
 *
 * Admins / managers: everyone.
 * Internal staff (no clientId): all other internal users (no clientId).
 *   → Any employee can see and initiate a DM with any other employee.
 * Clients: only internal staff assigned to their projects, never other clients.
 */
export function accessibleTeamMembers(
  user: User,
  users: User[],
  projects: Project[]
): User[] {
  if (user.role === "admin" || user.role === "manager") return users;

  // Internal staff — see all other internal users (anyone without a clientId)
  if (!user.clientId) {
    return users.filter((u) => !u.clientId);
  }

  // Client users — see only internal staff assigned to their projects
  const myProjects = accessibleProjects(user, projects);
  const staffIds   = new Set<string>();
  myProjects.forEach((p) =>
    p.members.forEach((id) => staffIds.add(id))
  );

  return users.filter((u) => {
    if (u.id === user.id) return true;            // always include self
    if (u.clientId) return false;                 // never show other clients
    return staffIds.has(u.id);                    // only assigned staff
  });
}

/**
 * Filter files to those in accessible projects or services.
 */
export function accessibleFiles(
  user: User,
  files: FileItem[],
  projects: Project[],
  services?: Service[]
): FileItem[] {
  if (user.role === "admin" || user.role === "manager") return files;
  const projIds = new Set(accessibleProjects(user, projects).map((p) => p.id));
  const svcIds  = new Set((services ? accessibleServices(user, services) : []).map((s) => s.id));
  return files.filter((f) => {
    if (f.sId) return svcIds.has(f.sId);
    return projIds.has(f.pId);
  });
}

/**
 * Filter folders to those in accessible projects or services.
 */
export function accessibleFolders(
  user: User,
  folders: Folder[],
  projects: Project[],
  services?: Service[]
): Folder[] {
  if (user.role === "admin" || user.role === "manager") return folders;
  const projIds = new Set(accessibleProjects(user, projects).map((p) => p.id));
  const svcIds  = new Set((services ? accessibleServices(user, services) : []).map((s) => s.id));
  return folders.filter((f) => {
    if (f.sId) return svcIds.has(f.sId);
    return projIds.has(f.pId);
  });
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
