# Hissado Project Management App

## Overview

Hissado is a full-featured project management web application designed to streamline project workflows. It provides a comprehensive suite of tools for task management, team collaboration, file sharing, and reporting. The application aims to enhance productivity and organization for teams of various sizes, offering robust access control and a premium user experience.

## User Preferences

- All content pages should use responsive padding: `"32px 36px 60px"` for desktop and `"16px 16px 40px"` for mobile.
- Hover effects should use `onMouseEnter/Leave` inline style mutation, avoiding `useState` inside `.map()` calls.
- Page headers should consistently use `fontSize:22`, `fontFamily:"Playfair Display"`, `serif`, and `letterSpacing:"-.01em"`.
- Stat cards require a colored top accent bar with `position:absolute`, `top:0`, and `height:3`.
- The `Modal` component must support dismissal via the Escape key.
- The `ConfirmDialog` component needs to support Escape for cancel and Enter for confirm shortcuts.
- The `Inp` component should pass its `autoComplete?` prop directly to the underlying `<input>` element.
- The `getLuminance()` helper should be static and called once per render, not on every mount within the `Av` component.
- All hooks in `App.tsx` must be called before any conditional returns to prevent Rules of Hooks violations.
- `useMemo` should be used for all 6 access-controlled slices (`myProjects`, `myTasks`, `myConversations`, `myTeam`, `myFiles`, `myFolders`), ensuring null-safety for the pre-login state.
- `useMemo` should also be applied to `messagesMap`, `PAGE_TITLES`, and `unreadCount`.
- `useCallback` is required for `navigate`, `openProjectDetail`, `openTask`, `openAddTask`, `saveTask`, and `handleDeleteProject`.
- The `i18n.tsx` context value must be memoized with `useMemo`, and `setLang` stabilized with `useCallback` to prevent unnecessary re-renders of consumers.
- Google Fonts (DM Sans + Playfair Display) should be preloaded in `index.html`.
- `index.css` should include `text-rendering: optimizeLegibility`, `scroll-behavior: smooth`, improved scrollbar styling, and `font-family: inherit` on form elements.
- The user prefers detailed explanations for complex features and clear communication.
- The user prefers an iterative development approach, with frequent updates and opportunities for feedback.
- The user wants the agent to ask for confirmation before making any major architectural changes or introducing new dependencies.

## System Architecture

The application is built as a pnpm workspace monorepo using TypeScript.

### Frontend
- **Framework**: React with Vite
- **State Management**: Zustand, with state persisted to `localStorage` under the key `hissado-pm-v3`.
- **Internationalization**: Complete English/French (EN/FR) support managed via `src/lib/i18n.tsx` context. All UI strings, labels, error messages, success messages, validation text, admin panel (badge colors in French: Rouge/Or/Bleu/Vert/Orange/Marine/Gris, permission group names in French), Team page invite flow, profile modal, status labels ("Actif"/"Inactif"), Files delete dialogs, and API email invitation templates are fully bilingual. `ALL_PERMISSIONS` items have `groupFr` field for French group headers. The invite API route (`/api/invite`) accepts a `lang` parameter and generates bilingual email templates.
- **Access Control**: Project-based Role-Based Access Control (RBAC) implemented in `src/lib/access.ts`, supporting roles: admin, manager, member, client.
- **Styling**: Utilizes DM Sans and Playfair Display fonts. A premium theme with `C.navy=#070D1A`, `C.gold=#C9A96E`, and `C.bg=#EFF2F8` is applied.
- **Design System**: A custom design system in `primitives.tsx` defines color (`C`) and shadow (`SH`) constants, and reusable components like `Av`, `Btn`, `Inp`, `Modal`, `PBar`, `StatusBadge`, `PriorityBadge`, `Bdg`, `Card`, `SectionHeader`, `Empty`, and `FileIcon`.
- **Mobile Responsiveness**: Achieved using a `768px` breakpoint with the `useIsMobile()` hook. UI elements like login, sidebar, dashboard grids, settings tabs, chat, modals, and content page padding adapt dynamically.
- **Profile Photos**: Users can upload, replace, and remove their profile photo from Settings → Profile. Photos are processed client-side using the Canvas API — cropped to a square from center and resized to 300×300px JPEG (≈20–40 KB). Stored as a base64 data URL in `user.photo` field in the Zustand store / localStorage. Displayed wherever user avatars appear: sidebar, team cards, profile modal, chat conversation list, chat message bubbles, group chat member picker, dashboard project members & task assignees, project cards, My Tasks assignees, calendar events, project detail kanban & list views, and project member selection modal. The `Av` component in `primitives.tsx` checks for `photo` first, falls back to initials if absent. Uploading also updates `currentUser` immediately via `setCurrentUser` so the sidebar reflects the change without re-login. Supports drag-and-drop. File size limit: 5 MB. Fully bilingual (EN/FR) via i18n keys `set_photo_*`.
- **PWA (Progressive Web App)**: Full PWA support implemented. Manifest at `public/manifest.json` (name: "Hissado Project", theme: navy #070D1A, display: standalone). Service worker at `public/sw.js` with network-first caching for navigation, stale-while-revalidate for assets, and push notification event handlers. App icons at `public/icon-192.svg`, `public/icon-512.svg`, `public/apple-touch-icon.svg`. Install page at `src/pages/Install.tsx` accessible at `/install` (no auth required), auto-detects iOS/Android/desktop, shows platform-specific step-by-step instructions (iOS: Share→Add to Home Screen; Android: menu→Install), Android native install button via `beforeinstallprompt` event, bilingual EN/FR with browser language auto-detection, QR code on desktop. Service worker registered in `src/main.tsx`. Install link/button included in invitation emails.

### Backend
- **API Framework**: Express 5.
- **Database**: PostgreSQL, managed with Drizzle ORM.
- **Validation**: Zod is used for schema validation, integrated with `drizzle-zod`.
- **API Codegen**: Orval generates API client and Zod schemas from an OpenAPI specification.
- **Email Service**: Integrates with Resend for sending branded HTML email invitations.

### Core Features
- **Services Tab**: A new "Services" page (`src/pages/Services.tsx`) positioned in the sidebar before Projects. Services are recurring engagement types with cadences: weekly, monthly, quarterly, annual. Each service has a name, description, color, cadence, status (active/paused/completed), owner, and team members. Admin/manager users see a "New Service" button and can create, edit, and delete services. Services use the `Service` type in `data.ts` with 5 seed entries. The service store actions (`addService`, `updateService`, `deleteService`) are fully implemented in `store.ts`. Access control: admin/manager see all services; member/client only see services they're members of. Fully bilingual with i18n keys `svc_*`.
- **Navigation Order**: Dashboard → Services → Projects → Messages (Chat) → My Tasks → Files → Calendar → Reports → Team. Chat was moved up to position 4 (after Projects) for higher visibility.
- **Personalized Dashboard Greeting**: Dashboard shows a time-based greeting at the top: "Good morning/afternoon/evening, [FirstName]." with a subtitle. Time ranges: 5:00–11:59 = morning, 12:00–17:59 = afternoon, 18:00+ = evening. Implemented via a `useGreeting()` helper function. Rendered in Playfair Display serif font. The `Dashboard` component now accepts a `currentUser?: User | null` prop passed from `App.tsx`. Bilingual: `dash_greeting_morning/afternoon/evening` + `dash_greeting_sub` in both EN and FR.
- **Project Management**: CRUD operations for projects, tasks, and sub-tasks. Tasks include `pri` (priority), `assignee`, `pId`, `due`, `created`, `prog`, `subs`, `cmts` fields.
- **User & Permissions**: User roles are dynamic strings (admin, manager, member, client). Admin controls for departments, roles, and permissions are available. Users can be invited via email, with temporary passwords and forced password resets.
- **File & Folder Management**: Hierarchical file and folder organization with `FileItem.fId` linking files to folders.
- **Communication**: Chat functionality with direct and group conversations. Auto-scroll to bottom on new messages via `useEffect` watching `msgs.length` and `selected` conversation.
- **Reporting**: Dashboards and analytics charts for project status, priority, progress, and workload.
- **Authentication**: Login with email/password, temporary passwords for invited users, and a forced password change flow with strength meter.
- **Admin Controls**: Cascading delete functionality for projects, conversations, folders, and files.

### Critical Type Definitions
- Task priority values: `"Urgent" | "High" | "Medium" | "Low"`.
- Task status values: `"To Do" | "In Progress" | "In Review" | "Done"`.
- Project status values: `"active" | "on-hold" | "completed"`.
- `fmt(d: Date)` accepts Date objects. `fmtT(d: string | Date)` accepts string or Date.

## External Dependencies

- **pnpm workspaces**: Monorepo management.
- **TypeScript**: Version 5.9.
- **Node.js**: Version 24.
- **React**: Frontend library.
- **Vite**: Frontend build tool.
- **Zustand**: State management library.
- **Resend**: Email API for sending invitations.
- **Express**: Node.js web application framework.
- **PostgreSQL**: Relational database.
- **Drizzle ORM**: TypeScript ORM for PostgreSQL.
- **Zod**: Schema validation library.
- **drizzle-zod**: Integration between Drizzle ORM and Zod.
- **Orval**: OpenAPI client code generator.
- **React Query**: Data fetching and caching library for React.