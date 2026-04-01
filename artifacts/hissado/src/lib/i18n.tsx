import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from "react";

export type Lang = "en" | "fr";

// ── Complete translation dictionary ──
const T = {
  en: {
    // Nav
    nav_dashboard: "Dashboard",
    nav_projects: "Projects",
    nav_tasks: "My Tasks",
    nav_chat: "Messages",
    nav_files: "Files",
    nav_calendar: "Calendar",
    nav_reports: "Reports",
    nav_team: "Team",
    nav_settings: "Settings",
    nav_projects_label: "Projects",

    // Auth
    login_title: "Sign in to your workspace",
    login_email: "Email",
    login_password: "Password",
    login_submit: "Sign In",
    login_quick: "Quick Login",
    login_error: "Invalid credentials. Try one of the accounts below.",
    login_wrong_password: "Incorrect password. Please try again.",
    login_signout: "Sign out",
    pw_change_title: "Set Your Password",
    pw_change_desc: "For security, you must set a new password before continuing.",
    pw_current: "Current (Temporary) Password",
    pw_new: "New Password",
    pw_confirm: "Confirm New Password",
    pw_set_btn: "Set Password & Continue",

    // Dashboard
    dash_active_projects: "Active Projects",
    dash_completed: "Tasks Completed",
    dash_in_progress: "In Progress",
    dash_overdue: "Overdue",
    dash_total: "total",
    dash_tasks_active: "tasks active",
    dash_tasks_past_due: "tasks past due",
    dash_projects_section: "Projects",
    dash_upcoming: "Upcoming Due",
    dash_recent: "Recent Tasks",
    dash_no_upcoming: "No upcoming tasks",
    dash_task: "Task",
    dash_status: "Status",
    dash_priority: "Priority",
    dash_assignee: "Assignee",
    dash_due: "Due",

    // Projects
    proj_title: "All Projects",
    proj_projects: "projects",
    proj_new: "New Project",
    proj_in_progress_label: "in progress",
    proj_total_tasks: "tasks",
    proj_no_projects: "No projects assigned",
    proj_no_projects_desc: "You have not been added to any projects yet.",

    // Project Detail
    pdet_back: "Back to Projects",
    pdet_add_task: "Add Task",
    pdet_total_tasks: "Total Tasks",
    pdet_in_progress: "In Progress",
    pdet_completed: "Completed",
    pdet_progress: "Progress",
    pdet_overall: "Overall Progress",
    pdet_tasks: "Tasks",
    pdet_list: "List",
    pdet_board: "Board",
    pdet_no_tasks: "No tasks yet",
    pdet_no_tasks_desc: "Add your first task to get started",

    // Tasks
    task_title: "My Tasks",
    task_new: "New Task",
    task_all: "All",
    task_todo: "To Do",
    task_inprogress: "In Progress",
    task_inreview: "In Review",
    task_done: "Done",
    task_all_priorities: "All Priorities",
    task_urgent: "Urgent",
    task_high: "High",
    task_medium: "Medium",
    task_low: "Low",
    task_sort_due: "Sort: Due Date",
    task_sort_created: "Sort: Recently Created",
    task_sort_priority: "Sort: Priority",
    task_no_tasks: "No tasks found",
    task_no_tasks_desc: "Adjust your filters or create a new task",

    // Task Modal
    tmod_create: "Create Task",
    tmod_edit: "Edit Task",
    tmod_title_label: "Task Title",
    tmod_title_ph: "Enter task title...",
    tmod_desc: "Description",
    tmod_desc_ph: "Optional description...",
    tmod_status: "Status",
    tmod_priority: "Priority",
    tmod_due: "Due Date",
    tmod_project: "Project",
    tmod_assignee: "Assignee",
    tmod_subtasks: "Subtasks",
    tmod_delete: "Delete",
    tmod_delete_confirm: "Delete this task?",
    tmod_delete_yes: "Yes, Delete",
    tmod_cancel: "Cancel",
    tmod_save: "Save Changes",
    tmod_create_btn: "Create Task",

    // Project Modal
    pmod_title: "New Project",
    pmod_name: "Project Name",
    pmod_name_ph: "e.g., Website Redesign",
    pmod_desc: "Description",
    pmod_desc_ph: "Brief project description...",
    pmod_status: "Status",
    pmod_status_active: "Active",
    pmod_status_hold: "On Hold",
    pmod_status_done: "Completed",
    pmod_color: "Color",
    pmod_members: "Team Members",
    pmod_owner: "Owner",
    pmod_cancel: "Cancel",
    pmod_create: "Create Project",

    // Chat
    chat_title: "Messages",
    chat_new: "New Conversation",
    chat_search: "Search conversations...",
    chat_no_convos: "No conversations",
    chat_you: "You: ",
    chat_online: "Online",
    chat_members: "members",
    chat_no_messages: "No messages yet",
    chat_placeholder: "Type a message...",
    chat_direct: "Direct Message",
    chat_group: "Group Chat",
    chat_group_name: "Group Name",
    chat_group_ph: "e.g., Design Team...",
    chat_select_person: "Select Person",
    chat_select_members: "Select Members",
    chat_start: "Start Conversation",
    chat_empty_title: "Team Chat",
    chat_empty_desc: "Select a conversation or start a new one",

    // Files
    files_title: "Files & Documents",
    files_subtitle_fn: (f: number, d: number) => `${f} files across ${d} folders`,
    files_new_folder: "New Folder",
    files_upload: "Upload File",
    files_all: "All Files",
    files_search: "Search files...",
    files_all_folders: "All Folders",
    files_folders: "Folders",
    files_files: "Files",
    files_search_results: (n: number) => `Search Results (${n})`,
    files_no_files: "No files found",
    files_no_files_desc: "Upload a file or search with a different term",
    files_files_label: "files",
    files_folder_name: "Folder Name",
    files_folder_ph: "e.g., Design Assets",
    files_create_folder: "Create Folder",
    files_file_name: "File Name",
    files_file_ph: "e.g., Project Brief",
    files_file_type: "File Type",
    files_upload_btn: "Upload File",

    // Calendar
    cal_title: "Calendar",
    cal_subtitle: "Task due dates",
    cal_today: "Today",
    cal_this_month: "This Month",
    cal_no_tasks: "No tasks this month",

    // Reports
    rep_title: "Reports & Analytics",
    rep_subtitle: "Project and team performance overview",
    rep_total_tasks: "Total Tasks",
    rep_completion: "Completion Rate",
    rep_overdue: "Overdue",
    rep_active_projects: "Active Projects",
    rep_by_status: "Tasks by Status",
    rep_by_priority: "Tasks by Priority",
    rep_project_progress: "Project Progress",
    rep_team_workload: "Team Workload",

    // Team
    team_title: "Team",
    team_active: (n: number) => `${n} active members`,
    team_invite: "Invite Member",
    team_all_depts: "All Departments",
    team_all_roles: "All Roles",
    team_no_members: "No team members found",
    team_no_members_desc: "Adjust your filters or invite new members",
    team_full_name: "Full Name",
    team_full_name_ph: "John Smith",
    team_email_ph: "john@company.com",
    team_role: "Role",
    team_dept: "Department",
    team_send_invite: "Send Invitation",
    team_profile: "Member Profile",
    team_email_label: "Email",
    team_dept_label: "Department",
    team_status_label: "Status",
    team_joined: "Joined",
    team_delete_btn: "Remove User",
    team_delete_title: "Remove User Account",
    team_delete_confirm: (name: string) =>
      `Are you sure you want to permanently remove ${name}? Their tasks will be unassigned, they will be removed from all projects, and their direct messages will be deleted. This cannot be undone.`,

    // Settings
    set_title: "Settings",
    set_subtitle: "Manage your account and preferences",
    set_profile: "Profile",
    set_notifications: "Notifications",
    set_appearance: "Appearance",
    set_security: "Security",
    set_profile_info: "Profile Information",
    set_full_name: "Full Name",
    set_email: "Email",
    set_title_label: "Title",
    set_title_ph: "e.g., Senior Designer",
    set_save: "Save Changes",
    set_saved: "✓ Saved successfully",
    set_notif_prefs: "Notification Preferences",
    set_notif_tasks: "Task Updates",
    set_notif_tasks_desc: "Notify me when tasks are assigned or updated",
    set_notif_chat: "Messages",
    set_notif_chat_desc: "Notify me on new messages",
    set_notif_projects: "Project Updates",
    set_notif_projects_desc: "Notify me on project status changes",
    set_notif_reports: "Weekly Reports",
    set_notif_reports_desc: "Receive weekly performance summary",
    set_theme: "Theme",
    set_theme_light: "Light",
    set_theme_dark: "Dark",
    set_theme_system: "System",
    set_theme_system_desc: "Follows your device settings",
    set_theme_desc: (t: string) => `Using ${t} mode`,
    set_sec_title: "Security",
    set_sec_protected: "Account Protected",
    set_sec_protected_desc: "Your account is secured with standard authentication.",
    set_change_password: "Change Password",
    set_change_password_desc: "Update your login password",
    set_2fa: "Two-Factor Authentication",
    set_2fa_desc: "Add an extra layer of security",
    set_sessions: "Active Sessions",
    set_sessions_desc: "Manage your logged-in devices",
    set_manage: "Manage",

    // Notifications panel
    notif_title: "Notifications",
    notif_mark_read: "Mark all read",
    notif_empty: "No notifications",

    // Access denied
    access_denied: "Access Restricted",
    access_denied_desc: "You don't have access to this section. Contact your project manager.",

    // Common
    search_tasks: "Search tasks...",
    progress: "Progress",
    cancel: "Cancel",
    save: "Save",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    close: "Close",
    invite: "Invite",
  },

  fr: {
    // Nav
    nav_dashboard: "Tableau de bord",
    nav_projects: "Projets",
    nav_tasks: "Mes tâches",
    nav_chat: "Messagerie",
    nav_files: "Fichiers",
    nav_calendar: "Calendrier",
    nav_reports: "Rapports",
    nav_team: "Équipe",
    nav_settings: "Paramètres",
    nav_projects_label: "Projets",

    // Auth
    login_title: "Accédez à votre espace de travail",
    login_email: "Adresse e-mail",
    login_password: "Mot de passe",
    login_submit: "Se connecter",
    login_quick: "Connexion rapide",
    login_error: "Identifiants incorrects. Utilisez l'un des comptes ci-dessous.",
    login_wrong_password: "Mot de passe incorrect. Veuillez réessayer.",
    login_signout: "Se déconnecter",
    pw_change_title: "Définir votre mot de passe",
    pw_change_desc: "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.",
    pw_current: "Mot de passe actuel (temporaire)",
    pw_new: "Nouveau mot de passe",
    pw_confirm: "Confirmer le nouveau mot de passe",
    pw_set_btn: "Définir le mot de passe et continuer",

    // Dashboard
    dash_active_projects: "Projets actifs",
    dash_completed: "Tâches terminées",
    dash_in_progress: "En cours",
    dash_overdue: "En retard",
    dash_total: "au total",
    dash_tasks_active: "tâches en cours",
    dash_tasks_past_due: "tâches en retard",
    dash_projects_section: "Projets",
    dash_upcoming: "Échéances à venir",
    dash_recent: "Tâches récentes",
    dash_no_upcoming: "Aucune tâche à venir",
    dash_task: "Tâche",
    dash_status: "Statut",
    dash_priority: "Priorité",
    dash_assignee: "Responsable",
    dash_due: "Échéance",

    // Projects
    proj_title: "Tous les projets",
    proj_projects: "projets",
    proj_new: "Nouveau projet",
    proj_in_progress_label: "en cours",
    proj_total_tasks: "tâches",
    proj_no_projects: "Aucun projet assigné",
    proj_no_projects_desc: "Vous n'avez pas encore été ajouté à un projet.",

    // Project Detail
    pdet_back: "Retour aux projets",
    pdet_add_task: "Ajouter une tâche",
    pdet_total_tasks: "Total des tâches",
    pdet_in_progress: "En cours",
    pdet_completed: "Terminées",
    pdet_progress: "Avancement",
    pdet_overall: "Progression globale",
    pdet_tasks: "Tâches",
    pdet_list: "Liste",
    pdet_board: "Tableau",
    pdet_no_tasks: "Aucune tâche",
    pdet_no_tasks_desc: "Ajoutez votre première tâche pour démarrer",

    // Tasks
    task_title: "Mes tâches",
    task_new: "Nouvelle tâche",
    task_all: "Toutes",
    task_todo: "À faire",
    task_inprogress: "En cours",
    task_inreview: "En révision",
    task_done: "Terminée",
    task_all_priorities: "Toutes priorités",
    task_urgent: "Urgent",
    task_high: "Haute",
    task_medium: "Moyenne",
    task_low: "Faible",
    task_sort_due: "Trier : Échéance",
    task_sort_created: "Trier : Récemment créées",
    task_sort_priority: "Trier : Priorité",
    task_no_tasks: "Aucune tâche trouvée",
    task_no_tasks_desc: "Affinez vos filtres ou créez une nouvelle tâche",

    // Task Modal
    tmod_create: "Créer une tâche",
    tmod_edit: "Modifier la tâche",
    tmod_title_label: "Titre de la tâche",
    tmod_title_ph: "Saisissez un titre...",
    tmod_desc: "Description",
    tmod_desc_ph: "Description facultative...",
    tmod_status: "Statut",
    tmod_priority: "Priorité",
    tmod_due: "Date d'échéance",
    tmod_project: "Projet",
    tmod_assignee: "Responsable",
    tmod_subtasks: "Sous-tâches",
    tmod_delete: "Supprimer",
    tmod_delete_confirm: "Supprimer cette tâche ?",
    tmod_delete_yes: "Oui, supprimer",
    tmod_cancel: "Annuler",
    tmod_save: "Enregistrer",
    tmod_create_btn: "Créer la tâche",

    // Project Modal
    pmod_title: "Nouveau projet",
    pmod_name: "Nom du projet",
    pmod_name_ph: "ex. : Refonte du site web",
    pmod_desc: "Description",
    pmod_desc_ph: "Brève description du projet...",
    pmod_status: "Statut",
    pmod_status_active: "Actif",
    pmod_status_hold: "En pause",
    pmod_status_done: "Terminé",
    pmod_color: "Couleur",
    pmod_members: "Membres de l'équipe",
    pmod_owner: "Propriétaire",
    pmod_cancel: "Annuler",
    pmod_create: "Créer le projet",

    // Chat
    chat_title: "Messagerie",
    chat_new: "Nouvelle conversation",
    chat_search: "Rechercher une conversation...",
    chat_no_convos: "Aucune conversation",
    chat_you: "Vous : ",
    chat_online: "En ligne",
    chat_members: "membres",
    chat_no_messages: "Aucun message",
    chat_placeholder: "Rédigez un message...",
    chat_direct: "Message direct",
    chat_group: "Discussion de groupe",
    chat_group_name: "Nom du groupe",
    chat_group_ph: "ex. : Équipe Design...",
    chat_select_person: "Choisir une personne",
    chat_select_members: "Choisir des membres",
    chat_start: "Démarrer la conversation",
    chat_empty_title: "Messagerie d'équipe",
    chat_empty_desc: "Sélectionnez une conversation ou démarrez-en une nouvelle",

    // Files
    files_title: "Fichiers & Documents",
    files_subtitle_fn: (f: number, d: number) => `${f} fichier${f > 1 ? "s" : ""} dans ${d} dossier${d > 1 ? "s" : ""}`,
    files_new_folder: "Nouveau dossier",
    files_upload: "Déposer un fichier",
    files_all: "Tous les fichiers",
    files_search: "Rechercher un fichier...",
    files_all_folders: "Tous les dossiers",
    files_folders: "Dossiers",
    files_files: "Fichiers",
    files_search_results: (n: number) => `Résultats de recherche (${n})`,
    files_no_files: "Aucun fichier trouvé",
    files_no_files_desc: "Déposez un fichier ou affinez votre recherche",
    files_files_label: "fichier(s)",
    files_folder_name: "Nom du dossier",
    files_folder_ph: "ex. : Ressources graphiques",
    files_create_folder: "Créer le dossier",
    files_file_name: "Nom du fichier",
    files_file_ph: "ex. : Cahier des charges",
    files_file_type: "Type de fichier",
    files_upload_btn: "Déposer le fichier",

    // Calendar
    cal_title: "Calendrier",
    cal_subtitle: "Dates d'échéances des tâches",
    cal_today: "Aujourd'hui",
    cal_this_month: "Ce mois-ci",
    cal_no_tasks: "Aucune tâche ce mois-ci",

    // Reports
    rep_title: "Rapports & Analyses",
    rep_subtitle: "Vue d'ensemble des performances",
    rep_total_tasks: "Total des tâches",
    rep_completion: "Taux de complétion",
    rep_overdue: "En retard",
    rep_active_projects: "Projets actifs",
    rep_by_status: "Tâches par statut",
    rep_by_priority: "Tâches par priorité",
    rep_project_progress: "Avancement par projet",
    rep_team_workload: "Charge de l'équipe",

    // Team
    team_title: "Équipe",
    team_active: (n: number) => `${n} membre${n > 1 ? "s" : ""} actif${n > 1 ? "s" : ""}`,
    team_invite: "Inviter un membre",
    team_all_depts: "Tous les services",
    team_all_roles: "Tous les rôles",
    team_no_members: "Aucun membre trouvé",
    team_no_members_desc: "Affinez vos filtres ou invitez de nouveaux membres",
    team_full_name: "Nom complet",
    team_full_name_ph: "Jean Dupont",
    team_email_ph: "jean@entreprise.com",
    team_role: "Rôle",
    team_dept: "Service",
    team_send_invite: "Envoyer l'invitation",
    team_profile: "Profil du membre",
    team_email_label: "E-mail",
    team_dept_label: "Service",
    team_status_label: "Statut",
    team_joined: "Rejoint le",
    team_delete_btn: "Supprimer l'utilisateur",
    team_delete_title: "Supprimer le compte",
    team_delete_confirm: (name: string) =>
      `Êtes-vous sûr de vouloir supprimer définitivement ${name} ? Ses tâches seront désassignées, il sera retiré de tous les projets et ses messages directs seront supprimés. Cette action est irréversible.`,

    // Settings
    set_title: "Paramètres",
    set_subtitle: "Gérez votre compte et vos préférences",
    set_profile: "Profil",
    set_notifications: "Notifications",
    set_appearance: "Apparence",
    set_security: "Sécurité",
    set_profile_info: "Informations de profil",
    set_full_name: "Nom complet",
    set_email: "E-mail",
    set_title_label: "Fonction",
    set_title_ph: "ex. : Designer senior",
    set_save: "Enregistrer",
    set_saved: "✓ Modifications enregistrées",
    set_notif_prefs: "Préférences de notification",
    set_notif_tasks: "Mises à jour des tâches",
    set_notif_tasks_desc: "Me notifier lors des attributions ou modifications",
    set_notif_chat: "Messages",
    set_notif_chat_desc: "Me notifier à chaque nouveau message",
    set_notif_projects: "Actualités des projets",
    set_notif_projects_desc: "Me notifier des changements de statut des projets",
    set_notif_reports: "Rapports hebdomadaires",
    set_notif_reports_desc: "Recevoir un bilan de performance chaque semaine",
    set_theme: "Thème",
    set_theme_light: "Clair",
    set_theme_dark: "Sombre",
    set_theme_system: "Système",
    set_theme_system_desc: "Suit les préférences de votre appareil",
    set_theme_desc: (t: string) => `Mode ${t} activé`,
    set_sec_title: "Sécurité",
    set_sec_protected: "Compte protégé",
    set_sec_protected_desc: "Votre compte est sécurisé par une authentification standard.",
    set_change_password: "Changer le mot de passe",
    set_change_password_desc: "Mettez à jour votre mot de passe de connexion",
    set_2fa: "Authentification à deux facteurs",
    set_2fa_desc: "Ajoutez une couche de sécurité supplémentaire",
    set_sessions: "Sessions actives",
    set_sessions_desc: "Gérez vos appareils connectés",
    set_manage: "Gérer",

    // Notifications panel
    notif_title: "Notifications",
    notif_mark_read: "Tout marquer comme lu",
    notif_empty: "Aucune notification",

    // Access denied
    access_denied: "Accès restreint",
    access_denied_desc: "Vous n'avez pas accès à cette section. Contactez votre responsable de projet.",

    // Common
    search_tasks: "Rechercher des tâches...",
    progress: "Progression",
    cancel: "Annuler",
    save: "Enregistrer",
    create: "Créer",
    edit: "Modifier",
    delete: "Supprimer",
    close: "Fermer",
    invite: "Inviter",
  },
} as const;

export type TranslationKey = keyof typeof T["en"];
export type Translations = typeof T["en"];

// ── Context ──
interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nCtx>({
  lang: "en",
  setLang: () => {},
  t: T.en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const stored = (typeof localStorage !== "undefined" ? localStorage.getItem("hissado-lang") : null) as Lang | null;
  const [lang, setLangState] = useState<Lang>(stored || "en");

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("hissado-lang", l);
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: T[lang] as Translations }), [lang, setLang]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

// ── French status/priority labels ──
export const STATUS_LABELS: Record<string, { en: string; fr: string }> = {
  "To Do": { en: "To Do", fr: "À faire" },
  "In Progress": { en: "In Progress", fr: "En cours" },
  "In Review": { en: "In Review", fr: "En révision" },
  Done: { en: "Done", fr: "Terminée" },
};

export const PRIORITY_LABELS: Record<string, { en: string; fr: string }> = {
  Urgent: { en: "Urgent", fr: "Urgent" },
  High: { en: "High", fr: "Haute" },
  Medium: { en: "Medium", fr: "Moyenne" },
  Low: { en: "Low", fr: "Faible" },
};

export const MONTH_NAMES: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
};

export const DAY_NAMES: Record<Lang, string[]> = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
};
