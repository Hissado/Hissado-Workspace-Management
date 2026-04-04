# Hissado Platform — Product Specification

**Document version:** 1.0  
**Date:** April 2026  
**Classification:** Internal reference — development, planning, and review

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Architecture and Core Structure](#2-architecture-and-core-structure)
3. [User Types, Roles, and Permissions](#3-user-types-roles-and-permissions)
4. [Authentication, Onboarding, and Security](#4-authentication-onboarding-and-security)
5. [Navigation and Layout](#5-navigation-and-layout)
6. [Dashboard](#6-dashboard)
7. [Services Module](#7-services-module)
8. [Projects Module](#8-projects-module)
9. [Tasks Module](#9-tasks-module)
10. [Chat and Messaging](#10-chat-and-messaging)
11. [Calls and Video Conferencing](#11-calls-and-video-conferencing)
12. [Meetings Module](#12-meetings-module)
13. [Files and Document Management](#13-files-and-document-management)
14. [Calendar](#14-calendar)
15. [Reports](#15-reports)
16. [Team Directory](#16-team-directory)
17. [Clients Module](#17-clients-module)
18. [Settings and Profile Management](#18-settings-and-profile-management)
19. [Admin Panel](#19-admin-panel)
20. [Notifications](#20-notifications)
21. [Real-Time Engine](#21-real-time-engine)
22. [Reminder and Email Automation](#22-reminder-and-email-automation)
23. [Visibility, Access Control, and Sync Rules](#23-visibility-access-control-and-sync-rules)
24. [Bilingual Functionality](#24-bilingual-functionality)
25. [Mobile and Desktop Behavior](#25-mobile-and-desktop-behavior)
26. [Data Handling and Persistence](#26-data-handling-and-persistence)
27. [API Server](#27-api-server)
28. [Integrations and External Services](#28-integrations-and-external-services)
29. [UI/UX and Branding Requirements](#29-uiux-and-branding-requirements)
30. [Deployment Expectations](#30-deployment-expectations)

---

## 1. Platform Overview

**Hissado** is a full-stack consulting project management platform built for a professional services business. It provides a single unified workspace for internal staff and their clients to collaborate on projects, manage tasks, communicate in real time, share files, and track progress — all under one branded interface.

The platform operates on two simultaneous access modes:

- **Internal workspace** — used by staff (admins, managers, team members) at the primary domain.
- **Client portal** — a restricted view of the same platform, automatically activated when a user accesses the application from `project.hissadoconsulting.com` or via the `?portal=client` URL parameter. Clients see only their own data.

The business purpose is to replace fragmented tool stacks (email, spreadsheets, external project boards) with a coherent, branded platform that positions the consulting firm as organized, responsive, and professional.

---

## 2. Architecture and Core Structure

### Frontend

| Concern | Technology |
|---|---|
| Framework | React 18 with TypeScript |
| Build tool | Vite |
| State management | Zustand with `persist` middleware |
| Persistence | Browser `localStorage` (local-first) |
| Styling | Inline styles with a shared design token system (`primitives.tsx`) |
| Routing | Single-page application — no URL router; page state is a string enum in the store |
| Real-time | Server-Sent Events (SSE) |

The frontend is a **local-first** application. All data lives in `localStorage` and is manipulated client-side immediately. The server is synced for critical cross-device operations only (user accounts, presence heartbeats, invitation emails, and reminders).

### Backend (API Server)

| Concern | Technology |
|---|---|
| Runtime | Node.js with TypeScript |
| Framework | Express.js |
| Logging | Pino (`logger.ts`) |
| Email | Resend API |
| Real-time transport | In-memory SSE client registry |
| Scheduled jobs | Node `setInterval` polling |

The API server is stateless with the exception of:
- An in-memory SSE client registry for real-time signalling.
- An in-memory user presence map for heartbeat tracking.
- A persistent reminder queue (backing store for scheduled email reminders).

### Monorepo Structure

```
/
├── artifacts/
│   ├── hissado/          ← React frontend (Vite)
│   │   └── src/
│   │       ├── App.tsx           — top-level orchestration
│   │       ├── pages/            — one file per page/module
│   │       ├── components/       — shared UI components
│   │       ├── hooks/            — custom React hooks
│   │       └── lib/
│   │           ├── data.ts       — domain types and visual constants
│   │           ├── seed.ts       — initial demo data
│   │           ├── store.ts      — Zustand store
│   │           ├── api.ts        — centralized server fetch layer
│   │           ├── access.ts     — visibility and permission logic
│   │           └── i18n.tsx      — bilingual string definitions
│   └── api-server/       ← Express.js backend
│       └── src/
│           ├── routes/           — HTTP route handlers
│           └── lib/              — email builders, job scheduler, store utilities
└── package.json          — pnpm workspace root with security overrides
```

---

## 3. User Types, Roles, and Permissions

### Built-in Roles

| Role | Description |
|---|---|
| `admin` | Full access to all data, settings, and administrative functions. Cannot be deleted by another admin. |
| `manager` | Can create and manage projects they are assigned to. Can invite members. Cannot access Admin Panel. |
| `member` | Standard internal staff member. Sees only assigned projects and tasks. |
| `client` | External client user. Restricted to data scoped to their client account. |

Roles are stored on the `User` record and are also defined in a configurable `roleDefs` list, allowing the admin to rename role labels, assign badge colors, and create custom display names without affecting the underlying permission system.

### Permission Catalogue

Permissions are stored as a `Record<string, Permission[]>` map in the global store, keyed by role ID. Each role's permission set can be fully customized by an admin.

| Permission ID | Group | Description |
|---|---|---|
| `view_dashboard` | Dashboard | Access the dashboard page |
| `view_projects` | Projects | See the projects list |
| `create_projects` | Projects | Create and manage projects |
| `view_tasks` | Tasks | See the tasks module |
| `create_tasks` | Tasks | Create and edit tasks |
| `view_files` | Files | Access the file manager |
| `upload_files` | Files | Upload new files |
| `view_chat` | Messages | Access the chat module |
| `send_messages` | Messages | Send messages in conversations |
| `view_calendar` | Calendar | Access the calendar view |
| `view_reports` | Reports | Access the reports module |
| `view_team` | Team | View the team directory |
| `invite_members` | Team | Send team invitations |
| `view_settings` | Settings | Access personal settings |

Permissions are checked at the component level. Pages and actions not permitted for a role are hidden from the sidebar and blocked from rendering.

### Visibility Rules by Role

| Resource | admin / manager | member | client |
|---|---|---|---|
| Projects | All projects | Only assigned projects | Only their client's projects |
| Tasks | All tasks | Assigned tasks + tasks in accessible projects | Tasks in their client's projects |
| Services | All services | Assigned services | Their client's services |
| Team | All users | All internal users (no clientId) | Only internal staff assigned to their projects |
| Conversations | All | Own threads only | Own threads, only involving their project team |
| Files & Folders | All | In accessible projects | In their client's projects |
| Clients page | All | Hidden | Hidden |
| Admin Panel | admin only | Hidden | Hidden |

---

## 4. Authentication, Onboarding, and Security

### Login

- The login screen is the entry point for both the internal workspace and the client portal.
- The portal mode is auto-detected from the hostname (`project.hissadoconsulting.com`) or the `?portal=client` URL parameter.
- Authentication is credential-based (email + password) validated against the local user store, which is seeded with initial data and updated via server sync.
- No session token or cookie is used. The authenticated user object is stored in Zustand state and persists across page refreshes via `localStorage`.

### Forced Password Change

- When a user is invited, they receive a temporary password and the `mustChangePassword` flag is set to `true`.
- On their first login, the application intercepts navigation and forces them to set a new password before accessing any page.
- The new password is persisted both locally and to the server via `PATCH /api/users/:id/password`, ensuring the change takes effect across all browsers/devices.

### Session Timeout

- A session timeout is enforced client-side for all authenticated users.
- After **55 minutes of inactivity** (no click, keydown, mousedown, touchstart, scroll, or mousemove events), a full-screen warning modal appears.
- The modal displays a live countdown timer (5 minutes). The timer text turns red when under 60 seconds.
- The user can click **Stay Signed In** to dismiss and reset the timer, or **Sign Out** to end the session immediately.
- If no action is taken, the user is automatically signed out and shown a toast notification.
- The modal is fully bilingual (English and French).

### Team Member Invitation

- Admins and managers can invite new users from the Team module.
- When an invitation is submitted, the system:
  1. Creates the user record locally with a generated temporary password and `mustChangePassword: true`.
  2. Sends the user record to the server (`POST /api/users`) so it is visible cross-device.
  3. Calls `POST /api/invite` to send an HTML invitation email via Resend.
- The invitation email is fully bilingual (EN/FR), includes the user's name, role, workspace name, temporary password, and platform login instructions.
- Email language is determined by the current UI language at the time of invitation.

### Security

- All transitive dependency vulnerabilities (lodash, path-to-regexp, picomatch) are patched via pnpm workspace overrides in the root `package.json`.
- Passwords are stored in the local store as plain strings (the platform does not currently implement server-side password hashing — this is a known limitation for a future improvement).
- No authentication tokens or JWTs are used at this stage.

---

## 5. Navigation and Layout

### Layout Structure

The application shell consists of:

1. **Sidebar** — collapsible left navigation panel
2. **Header** — top bar with page title, global search, notification bell, and logout
3. **Main content area** — renders the active page
4. **Overlays** — modals (task, project), notification panel, call overlays, toast stack

### Sidebar

The sidebar renders navigation links based on the current user's permission set. Items with no matching permission are not rendered.

Navigation items (in order):

- Dashboard
- Services
  - Inline project quick-links (filtered by access)
- Projects
- My Tasks
- Chat (with unread badge)
- Files
- Calendar
- Reports
- Meetings
- Team
- Clients *(admin/manager only)*
- Settings

The sidebar can be collapsed to icon-only mode. The collapse state persists across sessions.

On mobile, the sidebar is hidden behind a slide-in drawer triggered by a hamburger button in the header. A dark backdrop overlay closes it when tapped.

### Header

- Displays the current page title (bilingual).
- Contains a global search input. The search query is stored in global state and passed to pages that support filtering.
- Contains a notification bell icon with an unread count badge.
- Contains a logout button.
- On mobile, displays a hamburger menu button instead of the collapse toggle.

### Page Transitions

Pages render with a CSS entry animation (`page-enter` class) to give a polished transition feel when navigating.

---

## 6. Dashboard

The dashboard is the landing page after login. It provides an at-a-glance status of the user's work environment.

### Summary Stats Cards

Four metric cards displayed at the top:

| Card | Metric |
|---|---|
| Active Projects | Count of projects with `status === "active"` |
| Completed Tasks | Count of tasks with `status === "Done"` |
| In Progress | Count of tasks with `status === "In Progress"` |
| Overdue | Count of non-done tasks with a past due date |

### Sections

- **Upcoming Tasks** — top 5 non-done tasks sorted by due date ascending, with assignee avatar, project name, priority badge, and due date.
- **Active Projects** — list of active projects with color stripe, member count, and task completion progress bar.
- **Recent Activity** — last 8 tasks added (reverse insertion order), with status badge, assignee, and project.
- **Active Clients** — top 5 active clients with contact info and status indicator *(admin/manager only)*.
- **Active Services** — list of active services with cadence label and client tag.

### Greeting

The dashboard displays a time-based greeting (Good morning / Good afternoon / Good evening) in the active language, addressed to the current user's first name.

### Responsiveness

All dashboard sections reflow to single-column stacks on mobile. Stats cards reduce to a 2×2 grid on small screens.

---

## 7. Services Module

Services represent recurring deliverables delivered on a defined cadence (weekly, monthly, quarterly, or annual), distinct from one-off projects.

### Service List (`/services`)

- Grid of service cards, each showing name, cadence badge, client tag, status badge, member avatars, and a color stripe.
- Admins can add, edit, or delete services. Managers have read access.
- Filter/search by name.

### Service Detail (`/sdetail`)

Clicking a service opens a detail view containing:

- Service header: name, cadence, status, client, member list.
- **Tasks tab**: a kanban-style or list of tasks associated with the service. Admins and managers can add tasks. All accessible users can update task status and view details.
- **Files tab**: files scoped to this service.
- Back navigation returns to the services list.

### Service Model

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Service name |
| `desc` | string | Description |
| `color` | string | Hex color for UI theming |
| `cadence` | `"weekly" \| "monthly" \| "quarterly" \| "annual"` | Delivery frequency |
| `members` | string[] | Assigned user IDs |
| `owner` | string | Owning user ID |
| `status` | `"active" \| "paused" \| "completed"` | Current status |
| `clientId` | string? | Owning client (optional) |
| `created` | string | ISO date |

---

## 8. Projects Module

### Project List (`/projects`)

- Grid of project cards with color stripe, status badge, member avatars, owner, client tag, and task completion percentage.
- Admins/managers can create new projects via a modal. Admins can delete projects.
- Clients see only projects belonging to their client account.
- Members see only projects they are listed on.

### Project Detail (`/pdetail`)

Clicking a project card navigates to its detail view:

- Project header: name, description, status, client, member list.
- **Task board**: kanban columns (To Do → In Progress → In Review → Done).
  - Tasks can be dragged between columns or clicked to open the task modal.
  - "Add Task" button pre-fills the project ID in the task modal.
- Back navigation returns to the projects list.

If a user navigates directly to a project they no longer have access to, a locked-screen placeholder is shown instead of the project content.

### Project Modal

Used for creating and editing projects. Fields:

- Name, description, status, color picker, client assignment, member selection.

### Project Model

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `name` | string | Project name |
| `desc` | string | Description |
| `color` | string | Hex color |
| `owner` | string | Owning user ID |
| `members` | string[] | Assigned user IDs |
| `status` | `"active" \| "on-hold" \| "completed"` | Current status |
| `clientId` | string? | Linked client |
| `created` | string | ISO date |

---

## 9. Tasks Module

### My Tasks (`/tasks`)

Displays all tasks accessible to the current user in a filterable, sortable list.

Filters:
- Status (To Do, In Progress, In Review, Done)
- Priority (Low, Medium, High, Urgent)
- Project
- Free-text search (title/description)

Each row shows title, project, assignee avatar, priority badge, status badge, due date (highlighted red if overdue), and progress percentage.

### Task Modal

A full overlay modal opened when viewing or creating a task. Contains:

- **Title** — editable text field
- **Description** — multi-line editable field
- **Status** — dropdown (To Do / In Progress / In Review / Done)
- **Priority** — dropdown (Low / Medium / High / Urgent), color-coded
- **Assignee** — user selector (filtered to accessible team)
- **Due date** — date picker
- **Progress** — percentage slider (0–100)
- **Section** — optional grouping label
- **Subtasks** — add/check/delete inline checklist items
- **Comments** — threaded comment thread with timestamps, author names, and avatars

Saving a task runs an upsert: if the task ID already exists in the store, it is updated; otherwise it is added.

### Task Model

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `pId` | string | Project ID (empty for service tasks) |
| `sId` | string? | Service ID (for service-scoped tasks) |
| `title` | string | Task title |
| `desc` | string | Description |
| `status` | Status enum | Current workflow status |
| `pri` | Priority enum | Priority level |
| `assignee` | string | Assigned user ID |
| `due` | string | ISO due date |
| `created` | string | ISO creation date |
| `subs` | SubTask[] | Subtask checklist |
| `cmts` | Comment[] | Comment thread |
| `prog` | number | Progress percentage (0–100) |
| `section` | string? | Optional grouping label |

---

## 10. Chat and Messaging

The chat module (`/chat`) is a full-featured real-time messaging system supporting direct messages and group conversations.

### Conversation Types

- **Direct (DM)** — one-to-one conversation between two users.
- **Group** — named group thread with multiple participants.

### Feature Set

| Feature | Description |
|---|---|
| Conversation list | Left panel listing all accessible conversations, ordered by most recent message. Unread conversations are highlighted. |
| Message thread | Right panel showing the full message history for the selected conversation with sender avatars, timestamps, and read receipts. |
| Send messages | Text input with Enter-to-send (Shift+Enter for new line). |
| File attachments | Attach any file (image, PDF, document, etc.) to a message. The attachment is stored as a base64 data URI. |
| Location sharing | Share current GPS coordinates as a rich map card. The card displays an OpenStreetMap tile preview, coordinates, a reverse-geocoded address (via Nominatim), and deep links to Google Maps and OpenStreetMap. |
| Voice recording | Record and send audio messages via the browser MediaRecorder API. |
| Drawing / sketches | Open an inline canvas to sketch and send a drawing as an image message. |
| Emoji reactions | React to any message with one of six quick emojis (👍 ❤️ 😂 😮 😢 🙏). Reaction counts are shown below the message. |
| Message editing | Edit the text of a sent message. Edited messages are marked with an "edited" label. |
| Message deletion | Delete a sent message (own messages only; admins can delete any). |
| Reply-to | Quote-reply a specific message to create a threaded reference. |
| Read receipts | Double-tick icon indicates when all participants have read the message. |
| Message search | Search the current conversation by keyword. |
| WhatsApp share | Share a message externally via WhatsApp deep link. |
| Message translation | Translate a received message to the user's current language. |
| Conversation creation | Create a new DM by selecting a team member, or a group by selecting multiple participants and entering a group name. |
| Admin deletion | Admins can delete entire conversation threads. |
| Call initiation | Start an audio or video call directly from a conversation header. |
| Unread tracking | Unread message count is surfaced in the sidebar notification badge. |
| In-app toast | When a new message arrives from another user, a toast notification appears. Clicking it opens the relevant conversation. |
| Desktop notification | Browser push notification is shown for new messages when the tab is not in focus. |
| Reminder email | When a message is sent, the server registers a deferred email reminder for each recipient who has not been active within the past hour. |

### Message Model

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier |
| `cId` | string | Conversation ID |
| `from` | string | Sender user ID |
| `text` | string | Message body (or base64 data URI for drawings) |
| `ts` | string | ISO timestamp |
| `attachment` | Attachment? | File name, type, size, base64 data |
| `replyTo` | string? | ID of the quoted message |
| `reactions` | Reaction[]? | Emoji + list of user IDs who reacted |
| `edited` | boolean? | Whether the message has been edited |
| `readBy` | string[]? | User IDs who have read the message |
| `location` | SharedLocation? | Lat/lng + optional label |

---

## 11. Calls and Video Conferencing

### Audio and Video Calls

Calls are initiated peer-to-peer using a custom signalling layer built on top of the SSE real-time engine. The signalling flow is:

1. **Caller** clicks the call button (audio or video). The app generates a `callId` and a `roomName`.
2. Caller sends a `call-ring` signal to the callee via `POST /api/signal/send`.
3. A **server-side email reminder** is registered for 1 hour later in case the callee never responds (cancelled automatically if the callee comes online).
4. **Callee** receives the `call-ring` event on their SSE stream. The incoming call overlay appears with caller name, avatar color, and call type (audio/video).
5. Callee clicks **Accept** → sends `call-accept` signal → both parties join the video room.
6. Callee clicks **Decline** → sends `call-decline` signal → caller overlay dismisses and shows a "call declined" toast.
7. Either party can end the call → `call-end` signal is broadcast → both overlays close.

### Call States

| State | Overlay shown |
|---|---|
| `outgoing` | Outgoing call overlay (target name, avatar, animated pulse, cancel button) |
| `incoming` | Incoming call overlay (caller name, avatar, accept/decline buttons) |
| `active` | Full video room (embedded iframe or WebRTC room) |

### Video Room

Active calls render a `VideoRoom` component embedded within the application. The room is identified by the shared `roomName` generated by the caller. Both parties join using the same room name.

### Desktop Notifications

When an incoming call signal is received, a browser push notification is dispatched with the caller's name and call type. This fires even if the user is on a different browser tab.

---

## 12. Meetings Module

The Meetings module (`/meetings`) provides a directory for scheduling and launching ad-hoc calls with any accessible team member, as well as a quick-join flow for pre-arranged meetings.

### Features

- **Instant room** — a random room code is auto-generated on page load. The user can copy the link and share it externally.
- **Join by code** — enter an existing room code to join a meeting in progress.
- **Team member directory** — searchable list of all accessible team members with role badge and audio/video call buttons. Clicking either button initiates the signalling flow immediately (identical to calling from the Chat module).

---

## 13. Files and Document Management

The Files module (`/files`) provides a hierarchical file manager scoped to the current user's accessible projects and services.

### Structure

- Files are organized into **folders**.
- Each folder and file is linked to a project (`pId`) or a service (`sId`).
- Folders can be created, renamed, and deleted (admin only for deletion).
- Files can be uploaded, tagged, and deleted (admin only for deletion).

### File Upload

- Files are uploaded client-side and stored as metadata records in the local store (name, type, size, uploader, timestamp, tags).
- The actual file binary is not stored on the server in the current implementation — the store holds the metadata and any in-memory reference.

### File Metadata

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | File name |
| `type` | Extension (pdf, doc, xls, png, fig, csv, pptx, md, jpg, zip) |
| `size` | Human-readable size string |
| `pId` | Owning project ID |
| `sId` | Owning service ID (optional) |
| `fId` | Parent folder ID |
| `by` | Uploader user ID |
| `at` | Upload ISO timestamp |
| `tags` | Array of keyword tags |

### Supported File Types

pdf, doc, xls, png, fig, csv, pptx, md, jpg, zip — each with a distinct color label for visual identification.

### Access Control

- Admins and managers see all files.
- Members see files in their accessible projects.
- Clients see files in their client's projects.

---

## 14. Calendar

The Calendar module (`/calendar`) provides a monthly calendar view of all accessible tasks that have a due date.

- Tasks are rendered as colored chips on their due date.
- Overdue tasks are visually highlighted.
- Clicking a task chip opens the task modal for viewing or editing.
- The user can navigate between months.
- Filter by project or assignee.

---

## 15. Reports

The Reports module (`/reports`) provides an analytics overview of the current user's accessible task and project data.

### Summary Cards

- Total tasks
- Completion rate (% of done tasks)
- Overdue count
- Active project count

### Charts

All charts are built with horizontal bar visualizations:

- **Tasks by Status** — breakdown across To Do, In Progress, In Review, Done.
- **Tasks by Priority** — breakdown across Urgent, High, Medium, Low.
- **Team Workload** — active (non-done) task count per team member.
- **Project Progress** — per-project task completion percentage.

Reports are scoped to the data visible to the current user. A client user's reports show only data from their own projects.

---

## 16. Team Directory

The Team module (`/team`) shows all users visible to the current user.

### For Admins / Managers

- Full user list with name, role badge, department, email, phone, and status.
- Can add new team members (opens the invite/user creation flow).
- Can edit any user's details.
- Can delete users (admin only; cannot delete self).
- Can filter by department, role, or status.

### For Internal Members

- Can see all other internal staff (users without a `clientId`).
- Read-only view.

### For Clients

- Can see only internal staff who are assigned to their projects.
- Cannot see other client users.
- Read-only view.

### User Model

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Full name |
| `email` | Email address |
| `role` | Role ID (admin, manager, member, client, or custom) |
| `av` | Two-letter initials for avatar fallback |
| `photo` | Base64 JPEG avatar image (optional) |
| `color` | Accent color for avatar ring in call overlays (optional) |
| `status` | `"active"` or `"inactive"` |
| `dept` | Department name |
| `phone` | Phone number (optional) |
| `clientId` | Linked client ID (set only for client users) |
| `password` | Credential (stored locally) |
| `mustChangePassword` | Forced password reset flag |
| `invitedAt` | Invitation timestamp |
| `invitedBy` | Inviting user ID |

---

## 17. Clients Module

The Clients module (`/clients`) is accessible to admins and managers only.

- Full list of client accounts with name, company, contact email, phone, status, and brand color.
- Add, edit, and delete client records.
- Each client record links to its associated projects, services, and user accounts.
- Admins can create client user accounts directly from a client's detail view (pre-fills the `clientId`).
- Active/inactive status filter.

### Client Model

| Field | Description |
|---|---|
| `id` | Unique identifier |
| `name` | Contact name |
| `company` | Company name |
| `color` | Brand color hex |
| `contactEmail` | Primary email |
| `phone` | Phone number (optional) |
| `status` | `"active"` or `"inactive"` |
| `created` | ISO creation date |

---

## 18. Settings and Profile Management

The Settings module (`/settings`) allows any authenticated user to manage their own profile.

### Profile Settings

- **Display name** — editable full name.
- **Email** — editable email address.
- **Phone** — editable phone number.
- **Department** — editable department label.
- **Language** — toggle between English (`en`) and French (`fr`). Changing language immediately re-renders the entire UI.
- **Avatar photo** — drag-and-drop or click-to-upload. The image is processed client-side: cropped to a square, resized to 300×300 pixels, and stored as a JPEG data URI (max 5 MB source file). Existing photo can be removed.
- **Change password** — form with current password verification and new password confirmation.

### Admin Panel Access

For users with the `admin` role, the Settings page embeds the full Admin Panel as a lower section.

---

## 19. Admin Panel

The Admin Panel is a sub-section of Settings, visible to admins only. It provides configuration controls for the platform's role and permission system.

### Role Management

- View all defined roles (system and custom).
- Create custom roles with a display label and badge color variant.
- Edit existing role display names and badge colors.
- Delete custom roles (system roles — admin, manager, member, client — cannot be deleted).

### Permission Configuration

- For each role, toggle individual permissions on or off using a toggle switch.
- Permissions are grouped visually (Dashboard, Projects, Tasks, Files, Messages, Calendar, Reports, Team, Settings).
- Changes take effect immediately for all users with that role.

### Badge Color Variants

Roles can be assigned one of seven badge styles: Red (danger), Gold, Blue (info), Green (success), Orange (warning), Navy, or Grey (default).

---

## 20. Notifications

### In-App Notification Panel

The notification bell in the header shows an unread count badge. Clicking it opens the Notification Panel overlay.

- Lists all notifications in reverse chronological order.
- Unread notifications are highlighted with a blue dot.
- "Mark all as read" button clears all unread indicators.

### Toast Notifications

A floating toast stack appears in the bottom-right corner of the screen. Toasts are triggered by:

- Incoming chat messages from other users (with sender name and message preview; clicking navigates to the conversation).
- Declined call notifications.
- Session timeout sign-out.

Each toast auto-dismisses after a few seconds.

### Desktop (Browser) Push Notifications

Browser push notifications are requested on first interaction and fired for:

- Incoming calls (shows caller name and call type).
- New chat messages when the tab is not focused.

---

## 21. Real-Time Engine

Real-time functionality uses **Server-Sent Events (SSE)** for server-to-client push, combined with standard HTTP POST for client-to-server signals.

### Connection Lifecycle

- On login, the client opens an SSE stream: `GET /api/signal/stream?userId={userId}`.
- The server registers the response object in an in-memory client map keyed by user ID.
- A keep-alive comment is written to the stream every 20 seconds to prevent proxy timeouts.
- On browser tab close or logout, the `close` event removes the client from the registry.

### Reconnection Strategy

If the SSE connection drops, the client implements **exponential backoff** reconnection:

| Failure count | Delay before retry |
|---|---|
| 1 | 2 seconds |
| 2 | 4 seconds |
| 3 | 8 seconds |
| 4 | 15 seconds |
| 5+ | 30 seconds (cap) |

### Signal Events

| Event | Direction | Payload |
|---|---|---|
| `call-ring` | server → client | callId, callerId, callerName, callerColor, roomName, videoEnabled |
| `call-accept` | server → client | callId, roomName, videoEnabled |
| `call-decline` | server → client | callId |
| `call-end` | server → client | callId |
| `new-message` | server → client | fromId, fromName, text, conversationId |

Signals are sent via `POST /api/signal/send` with `{ to, event, data }`. The server fans the event to all active SSE connections registered for that user ID.

---

## 22. Reminder and Email Automation

The platform has an automated email reminder system that notifies users of missed events when they have been offline.

### How It Works

1. When a chat message is sent, the sender registers a **pending reminder** for each recipient via `POST /api/reminders/register`.
2. When a call is initiated, a pending reminder is registered for the callee.
3. Each reminder has a `scheduledAt` timestamp (1 hour after the triggering event).
4. The server runs a reminder job every **5 minutes** that:
   - Fetches all reminders whose `scheduledAt` has passed.
   - Checks whether the recipient has sent a heartbeat within the past 5 minutes (meaning they are active).
   - If the recipient is active: **cancels** the reminder (they have already seen the notification in-app).
   - If the recipient is inactive: **sends the reminder email** via Resend and marks it as sent.

### Heartbeat

- Every signed-in user sends `POST /api/heartbeat` with their user ID every 5 minutes.
- On receipt, the server:
  1. Records the user's last-active timestamp in memory.
  2. Cancels all pending reminders for that user (they are online).

### Reminder Email Types

| Type | Trigger |
|---|---|
| `message` | A new chat message was sent to the user |
| `call` | An audio or video call was placed to the user |
| `notification` | A platform notification was generated for the user |

Reminder emails are bilingual (EN/FR based on the recipient's language preference stored in the reminder record) and are sent via the Resend email API from the `Hissado <...>` sender identity.

---

## 23. Visibility, Access Control, and Sync Rules

### Access Control Functions (`access.ts`)

All filtering logic is centralized in `src/lib/access.ts`. Data is filtered before being passed to any page component. Functions:

| Function | Purpose |
|---|---|
| `accessibleProjects` | Filter projects by role and membership |
| `accessibleServices` | Filter services by role and membership |
| `accessibleTasks` | Filter tasks; always includes directly-assigned tasks regardless of project membership |
| `accessibleConversations` | Filter conversations; clients see only threads within their project team |
| `accessibleTeamMembers` | Filter users visible to the current user |
| `accessibleFiles` | Filter files by accessible project scope |
| `accessibleFolders` | Filter folders by accessible project scope |
| `canAccessProject` | Boolean check for a single project |
| `canManageProject` | Admin/assigned-manager check for project settings |
| `canInviteMembers` | Admin/manager-only check |
| `canCreateProject` | Admin/manager-only check |
| `canDeleteUser` | Admin-only, cannot self-delete |

### Server Sync

| Operation | Endpoint | Triggered by |
|---|---|---|
| Load users cross-device | `GET /api/users` | App mount (once) |
| Persist new user | `POST /api/users` | Invitation / user creation |
| Update password | `PATCH /api/users/:id/password` | Password change |
| Presence heartbeat | `POST /api/heartbeat` | Every 5 minutes while signed in |
| Register reminder | `POST /api/reminders/register` | Message sent, call initiated |
| Send invitation email | `POST /api/invite` | Team member invited |

All other data (projects, tasks, conversations, messages, files, notifications) lives exclusively in `localStorage` and is never sent to the server.

### `mergeServerUsers`

When users are fetched from the server on app load, they are merged into the local store with the following rules:

- If a server user does not exist locally → add them.
- If a server user already exists locally → the local record takes precedence (locally-made edits are not overwritten).

This ensures that invitations sent from another device appear on the current device without wiping any local user edits.

---

## 24. Bilingual Functionality

The platform is fully bilingual in **English** and **French (Canadian)**.

### Scope

Every user-facing string in the application is defined in `src/lib/i18n.tsx`. This includes:

- All navigation labels
- All page titles and headings
- All form labels, placeholders, and validation messages
- All button labels
- All status and priority labels
- All dashboard metrics and greeting messages
- All modal content
- All toast and notification messages
- The session timeout modal (both languages rendered simultaneously)
- All invitation and reminder email content

### Language Switching

- Language is stored per-user in the Zustand store and persists via `localStorage`.
- It can be changed from the Settings page.
- The change is instantaneous — the entire UI re-renders with the new strings without a page reload.
- The active language is passed to the API when registering reminders, so email notifications are sent in the recipient's preferred language.

### Invitation Emails

The email language is determined by the inviting user's current language at the time the invitation is sent. If the inviting user's UI is in French, the invitation email will be in French.

---

## 25. Mobile and Desktop Behavior

### Responsive Design

The application is designed to work on both desktop and mobile using the `useIsMobile` hook (breakpoint: 768px). Layout changes at this breakpoint:

| Component | Desktop | Mobile |
|---|---|---|
| Sidebar | Always visible, collapsible to icon-only | Hidden; slide-in drawer |
| Dashboard stats | 4-column row | 2×2 grid |
| Dashboard sections | 2-column layout | 1-column stack |
| Chat | Split-pane (conversation list + thread) | Single-pane with back navigation |
| All grids and tables | Multi-column | Single-column stacked cards |
| Header | Full title + search + actions | Compact with hamburger button |
| Task/Project modals | Centered overlay | Full-screen |

### Touch Support

- Sidebar drawer is dismissible by tapping the backdrop.
- All interactive elements have appropriate tap target sizes.
- Touch events are monitored for session timeout reset.

---

## 26. Data Handling and Persistence

### Local Storage

All domain data is persisted in a single Zustand store using the `persist` middleware, stored under the key `hissado-store` in `localStorage`.

Persisted state includes:
- Current user session
- All projects, services, tasks, clients, users
- All conversations and messages
- All files and folders
- All notifications
- Role definitions and permission maps
- Sidebar collapsed state
- Active language preference
- Open conversation ID

### Seed Data

The application ships with realistic demo data defined in `src/lib/seed.ts`. This data is used to populate the store on first launch. It includes multiple users across roles, several projects, services, tasks, conversations, messages, files, and notifications, giving the platform a functional out-of-the-box demo state.

### Data Isolation

Seed data is imported only by `store.ts`. All other modules import types and utilities from `data.ts` only. This boundary ensures that demo data never leaks into application logic.

---

## 27. API Server

The API server runs on Express.js and exposes the following routes:

### User Routes (`/api/users`)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/users` | Return all users |
| `POST` | `/api/users` | Create or upsert a user |
| `PATCH` | `/api/users/:id/password` | Update a user's password |

### Signal Routes (`/api/signal`)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/signal/stream` | Open SSE subscription for a user |
| `POST` | `/api/signal/send` | Deliver a signal to a connected user |

### Invitation Route (`/api/invite`)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/invite` | Send an HTML invitation email via Resend |

### Reminder Routes (`/api/reminders`, `/api/heartbeat`)

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/heartbeat` | Mark user as active; cancel their pending reminders |
| `POST` | `/api/reminders/register` | Register a deferred email reminder |

### Health Route

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness check returning `{ status: "ok" }` |

---

## 28. Integrations and External Services

### Resend (Email)

All transactional emails are sent via the [Resend](https://resend.com) API, configured via the `RESEND_API_KEY` and `RESEND_FROM_EMAIL` environment variables.

Email types:
1. **Invitation email** — bilingual HTML email sent to new team members with their temporary credentials.
2. **Reminder email** — bilingual HTML email sent to users who missed a message, call, or notification.

The Resend client is instantiated without caching (`getUncachableResendClient`) to ensure the API key is always read fresh from the environment.

### OpenStreetMap / Nominatim

Location messages in chat use:
- **OpenStreetMap tiles** for the map preview image.
- **Nominatim reverse geocoding API** to convert lat/lng coordinates into a human-readable address.

No API key is required for either service.

---

## 29. UI/UX and Branding Requirements

### Design System

All visual constants are defined in `src/components/primitives.tsx` and used consistently across all pages and components. The design token namespace is `C` (color tokens), exposing:

- Primary navy (`C.navy`)
- Background (`C.bg`)
- White (`C.w`)
- Gold accent (`C.gold`, `C.goldPale`)
- Success green (`C.ok`, `C.okL`)
- Error red (`C.err`, `C.errL`)
- Grey scale (`C.g100` through `C.g600`)

### Typography

- Headings use **Playfair Display** (serif) — for page titles, module headers, and section headings.
- Body and UI text use the system sans-serif stack.

### Component Library

All shared UI elements are defined in `primitives.tsx`:

| Component | Description |
|---|---|
| `Av` | Avatar with photo, initials fallback, and optional online dot |
| `Btn` | Styled button with variant (primary, ghost, danger) |
| `Bdg` | Badge with variant (gold, success, warning, danger, info, navy, default) |
| `PBar` | Horizontal progress bar |
| `StatusBadge` | Pre-configured badge for task statuses |
| `PriorityBadge` | Pre-configured badge for task priorities |
| `Card` | Elevated card container |
| `SectionHeader` | Uppercase small-caps section label |
| `Modal` | Centered overlay modal |
| `Inp` | Styled text input |

### Color Coding

- **Projects** are individually color-coded (user-selected from a palette).
- **Services** are individually color-coded.
- **Clients** have a brand color used for identification across the UI.
- **User avatars** use a fallback color ring (used in call overlays and team views).

### Status and Priority Colors

Task statuses and priorities use a consistent semantic color system throughout the application (badges, kanban columns, calendar chips, chart bars).

### No External UI Library

The application does not use any third-party component library (no MUI, Chakra, Tailwind, etc.). All components are hand-crafted with inline styles to maintain full design control and minimal bundle size.

---

## 30. Deployment Expectations

### Frontend

- Built and served as a static Vite application.
- Dev server binds to the `PORT` environment variable (required for Replit proxy routing).
- `server.allowedHosts: true` is configured to allow Replit's proxied iframe preview.

### Backend

- Runs as a Node.js Express server.
- Binds to the `PORT` environment variable.
- Required environment variables:
  - `RESEND_API_KEY` — Resend API authentication key.
  - `RESEND_FROM_EMAIL` — Verified sender email address.
- The SSE client registry and user presence map are **in-memory** and reset on server restart. This means:
  - Active SSE connections are dropped on restart but clients reconnect with exponential backoff.
  - Presence data (heartbeat timestamps) is lost on restart (no consequence beyond a brief reminder delivery window).

### Domains

- **Internal platform**: primary domain (e.g., `hissadoconsulting.com`).
- **Client portal**: `project.hissadoconsulting.com` — same codebase, restricted client view auto-activated by hostname detection.

### Monorepo Deployment

The application is deployed as a pnpm monorepo. Each artifact (frontend and API server) runs as a separate process managed by the Replit workflow system.

### Security Overrides

The root `package.json` includes `pnpm.overrides` to enforce patched versions of:
- `lodash` (prototype pollution)
- `path-to-regexp` (ReDoS vulnerability)
- `picomatch@^2` and `picomatch@^4` (regex safety)

These overrides apply transitively across all packages in the monorepo.

---

*End of Hissado Platform Specification — v1.0*
