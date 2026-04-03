# Hissado Project Management App

## Overview

Hissado is a comprehensive project management web application designed to optimize project workflows for teams of all sizes. It offers robust tools for task management, team collaboration, file sharing, and reporting, aiming to boost productivity and organization through a premium user experience and strong access controls.

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

The application is a pnpm workspace monorepo built with TypeScript.

### Frontend
- **Framework**: React with Vite
- **State Management**: Zustand, with state persisted to `localStorage`.
- **Internationalization**: Complete English/French (EN/FR) support for all UI strings, labels, messages, and administrative content. The invite API generates bilingual email templates.
- **Access Control**: Project-based Role-Based Access Control (RBAC) supporting admin, manager, member, and client roles. Service tasks are filtered based on user access.
- **Styling**: Uses DM Sans and Playfair Display fonts with a premium theme (`C.navy=#070D1A`, `C.gold=#C9A96E`, `C.bg=#EFF2F8`).
- **Design System**: Custom components (`Av`, `Btn`, `Inp`, `Modal`, `PBar`, `StatusBadge`, `PriorityBadge`, `Bdg`, `Card`, `SectionHeader`, `Empty`, `FileIcon`) and constants (`C`, `SH`) for consistent UI.
- **Mobile Responsiveness**: Adaptive UI across devices using a `768px` breakpoint and `useIsMobile()` hook.
- **Profile Photos**: Client-side processing (crop, resize to 300x300px JPEG) and storage as base64 data URLs. Supports drag-and-drop, with a 5 MB file size limit.
- **PWA (Progressive Web App)**: Full PWA support including manifest, service worker for caching (network-first, stale-while-revalidate), push notifications, and platform-specific installation instructions (iOS, Android, desktop).

### Backend
- **API Framework**: Express 5.
- **Database**: PostgreSQL, managed with Drizzle ORM.
- **Validation**: Zod for schema validation, integrated with `drizzle-zod`.
- **API Codegen**: Orval generates API client and Zod schemas from OpenAPI.
- **Email Service**: Integrates with Resend for sending branded HTML email invitations.

### Core Features
- **Services Management**: Dedicated "Services" page for managing recurring engagement types (weekly, monthly, quarterly, annual) with status, owner, and team members. Admin/manager roles can create, edit, delete services.
- **Navigation**: Optimized sidebar navigation order with "Messages" prominently placed.
- **Upgraded Messaging System**:
    - Conversations sorted by most recent message.
    - Voice-to-text input using Web Speech API with language adaptation.
    - Auto-translation of incoming messages via MyMemory API with language selection.
    - On-demand per-message translation.
    - Handwriting/drawing canvas for sending image messages.
    - Modern chat bubble design with grouped messages and visual accents.
    - Support for image messages (e.g., drawings).
- **Clients Page**: Client management with cards showing stats, search/filter, and actions (edit, delete, invite portal users). Available to admin/manager roles.
- **Service Detail Page**: Detailed view of services with List and Kanban Board task views, task expansion for subtasks and comments, progress tracking, and sidebar for service overview and team members.
- **Dashboard Enhancements**: "Active Clients" widget for admin/managers and personalized time-based greetings (Good morning/afternoon/evening, [FirstName]).
- **Project Management**: CRUD operations for projects, tasks (with priority, assignee, due date, progress), and sub-tasks.
- **User & Permissions**: Dynamic roles (admin, manager, member, client). Admin controls for departments, roles, and permissions. Invitation system with temporary passwords and forced password resets. Admins can edit any team member's profile.
- **File & Folder Management**: Hierarchical tree-view file browser with projects and services as root organizational units.
- **Communication**: Chat functionality with direct and group conversations. Includes WhatsApp integration for direct conversations when a phone number is available.
- **Reporting**: Dashboards and analytics for project status, priority, progress, and workload.
- **Authentication**: Standard email/password login, temporary passwords for invited users, and a forced password change flow with strength meter.
- **Admin Controls**: Cascading delete functionality for core entities.

## External Dependencies

- **pnpm workspaces**
- **TypeScript**
- **Node.js**
- **React**
- **Vite**
- **Zustand**
- **Resend** (for email services)
- **Express**
- **PostgreSQL**
- **Drizzle ORM**
- **Zod**
- **drizzle-zod**
- **Orval**
- **React Query**