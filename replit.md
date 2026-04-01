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
- **Internationalization**: Full English/French support managed via `src/lib/i18n.tsx` context.
- **Access Control**: Project-based Role-Based Access Control (RBAC) implemented in `src/lib/access.ts`, supporting roles: admin, manager, member, client.
- **Styling**: Utilizes DM Sans and Playfair Display fonts. A premium theme with `C.navy=#070D1A`, `C.gold=#C9A96E`, and `C.bg=#EFF2F8` is applied.
- **Design System**: A custom design system in `primitives.tsx` defines color (`C`) and shadow (`SH`) constants, and reusable components like `Av`, `Btn`, `Inp`, `Modal`, `PBar`, `StatusBadge`, `PriorityBadge`, `Bdg`, `Card`, `SectionHeader`, `Empty`, and `FileIcon`.
- **Mobile Responsiveness**: Achieved using a `768px` breakpoint with the `useIsMobile()` hook. UI elements like login, sidebar, dashboard grids, settings tabs, chat, modals, and content page padding adapt dynamically.

### Backend
- **API Framework**: Express 5.
- **Database**: PostgreSQL, managed with Drizzle ORM.
- **Validation**: Zod is used for schema validation, integrated with `drizzle-zod`.
- **API Codegen**: Orval generates API client and Zod schemas from an OpenAPI specification.
- **Email Service**: Integrates with Resend for sending branded HTML email invitations.

### Core Features
- **Project Management**: CRUD operations for projects, tasks, and sub-tasks. Tasks include `pri` (priority), `assignee`, `pId`, `due`, `created`, `prog`, `subs`, `cmts` fields.
- **User & Permissions**: User roles are dynamic strings (admin, manager, member, client). Admin controls for departments, roles, and permissions are available. Users can be invited via email, with temporary passwords and forced password resets.
- **File & Folder Management**: Hierarchical file and folder organization with `FileItem.fId` linking files to folders.
- **Communication**: Chat functionality with direct and group conversations.
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