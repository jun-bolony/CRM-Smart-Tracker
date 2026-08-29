# CONTEXT.md — Project "Smart Task Tracker with Analytics" (CRM-Smart-Tracker)

**Project Version:** v.0.9.99  
**Date:** August 29, 2026  
**Author:** jun-bolony

---

## 1. Technology Stack and Versions

| Component           | Technology / Library             | Version (notes)                  |
|---------------------|----------------------------------|----------------------------------|
| **Frontend**        | React                            | 19.2.7                           |
|                     | TypeScript                       | 6.0.2 (dev)                      |
|                     | Vite                             | 8.1.1                            |
|                     | Material-UI (MUI)                | 9.2.0                            |
|                     | Recharts                         | 3.9.2                            |
|                     | Axios                            | 1.18.1                           |
|                     | React Router                     | 7.18.1                           |
|                     | papaparse                        | 5.5.4                            |
|                     | html2canvas                      | 1.4.1                            |
| **Backend**         | Node.js                          | 18.x / 20.x (LTS)                |
|                     | Express                          | 5.2.1                            |
|                     | express-rate-limit               | 8.6.2                            |
|                     | helmet                           | 8.3.0                            |
|                     | Mongoose                         | 9.8.0                            |
|                     | CORS                             | 2.8.x                            |
|                     | dotenv                           | 17.4.2                           |
|                     | bcrypt                           | 6.0.0                            |
|                     | jsonwebtoken                     | 9.0.2                            |
| **Database**        | MongoDB Atlas (cloud)            | version 6.0+ (free M0 cluster)   |
| **Deployment**      | Frontend: Vercel                 | –                                |
|                     | Backend: Render                  | –                                |
| **"Wake-up"**       | Cron-Job.org                     | –                                |
| **Version Control** | Git + GitHub                     | –                                |

---

## 2. Project Architecture

The project is split into two independent parts: **frontend** (client application) and **backend** (REST API). They communicate via HTTP requests.

### 2.1. Folder Tree (important nodes)
CRM-Smart-Tracker/ # repository root
├── backend/ # server side
│ ├── .env # environment variables (not in Git)
│ ├── .gitignore # excludes node_modules, .env, etc.
│ ├── package.json # dependencies and scripts
│ ├── server.js # entry point (routes, error middleware attached)
│ ├── models/
│ │ ├── Application.js # Mongoose schema for application
│ │ └── User.js # user model
│ ├── controllers/
│ │ ├── applications.js # CRUD controllers + filtering/sorting/search
│ │ ├── stats.js # controller for aggregated statistics
│ │ └── auth.js # authentication controller (register, login)
│ ├── routes/
│ │ ├── applications.js # /api/applications routes
│ │ ├── stats.js # /api/stats route
│ │ └── auth.js # /api/auth routes
│ ├── middleware/
│ │ ├── errorHandler.js # global error handler
│ │ └── auth.js # JWT verification middleware
│ └── utils/
│ └── asyncHandler.js # global async error catcher
└── frontend/ # client side (React + Vite)
├── public/ # static files
├── src/
│ ├── App.tsx # root component with routing (wrapped in ThemeProvider, uses lazy)
│ ├── main.tsx # entry point
│ ├── types/
│ │ └── Application.ts # TypeScript interfaces (Application, StatsData)
│ ├── services/
│ │ └── api.ts # HTTP client (Axios) + CRUD, getStats, login/register
│ ├── context/
│ │ ├── LanguageContext.tsx # language context
│ │ └── AuthContext.tsx # authentication context
│ ├── translations/
│ │ ├── index.ts # single import point for translations
│ │ ├── en.json # English translation (default)
│ │ ├── ru.json # Russian translation
│ │ ├── es.json # Spanish translation
│ │ ├── fr.json # French translation
│ │ ├── de.json # German translation
│ │ └── zh.json # Chinese translation
│ ├── hooks/
│ │ └── useBackendHealth.ts # hook to ping /api/health
│ ├── components/
│ │ ├── LoadingSpinner.tsx
│ │ ├── ErrorSnackbar.tsx
│ │ ├── DeleteConfirmationDialog.tsx
│ │ ├── WakeUpScreen.tsx # component informing the user about server wake-up
│ │ ├── ApplicationTable.tsx
│ │ ├── ApplicationForm.tsx
│ │ ├── ApplicationCard.tsx
│ │ ├── ApplicationCardList.tsx
│ │ ├── GlobalGradientWrapper.tsx
│ │ ├── ProtectedRoute.tsx
│ │ ├── GlobalNavBar.tsx # global navigation bar (except login/register)
│ │ ├── ErrorBoundary.tsx # global render error catcher
│ │ └── DragDropImport.tsx # drag‑and‑drop import component
│ ├── utils/
│ │ └── fileUtils.ts # universal script for selective Export/Import
│ ├── styles/
│ │ └── scrollbar.ts # common scrollbar styles
│ ├── pages/ # all pages are default exported (for lazy)
│ │ ├── ApplicationListPage.tsx # list with filters, export (CSV/JSON) – memoized
│ │ ├── ApplicationFormPage.tsx # create/edit
│ │ ├── ApplicationDetailPage.tsx # detailed card with history and notes
│ │ ├── Dashboard.tsx # analytics page with charts
│ │ ├── LoginPage.tsx
│ │ └── RegisterPage.tsx
│ └── assets/ # images, icons
├── .env # environment variables (not in Git)
├── package.json # dependencies and scripts
├── vite.config.ts # Vite configuration
└── tsconfig.json # TypeScript configuration

### 2.2. Module Descriptions

- **Backend**
  - `server.js` – initialises the Express app, connects to MongoDB (via Mongoose), sets up CORS, JSON parsing, and starts the server.
    - Public routes `/api/auth` and protected routes `/api/applications` and `/api/stats` with `auth.js` middleware are attached.
  - **Application Model** – defined in `models/Application.js` according to the contract, includes all fields, validation, and indexes. The `userId` field is mandatory for data isolation.
  - **User Model** – defined in `models/User.js` with fields `email`, `passwordHash`, `createdAt`. Uses `bcrypt` for password hashing.
  - **Controllers** – `controllers/applications.js` implements all CRUD operations with error handling and validation, also supports filtering by status (multiple values via comma), source, search by company and position, sorting by fields (`appliedDate`, `nextEventDate`, `salaryMax`), and pagination. All queries are filtered by `userId` extracted from JWT.
    - Special: when updating the status, a record is atomically added to `statusHistory` via the `$push` operator, and the entire update is performed with `findByIdAndUpdate` and `{ new: true }` to ensure correct history saving and return of the updated document.
    - `stats.js` – aggregates statistics for the dashboard, also filtered by `userId`.
    - `auth.js` – handles registration and login, returns a JWT token.
  - **Routes** – `routes/applications.js` defines endpoints with ObjectId validation.
    - `stats.js` – defines `GET /api/stats` calling the `getStats` controller.
    - `auth.js` – defines `POST /api/auth/register` and `POST /api/auth/login`.
  - **Middleware** – `auth.js` verifies the presence and validity of JWT in the Authorization header and extracts `userId`.
    - `errorHandler.js` – centralised error handler.

- **Frontend**
  – built with Vite with React and TypeScript.
  - Uses Material-UI for UI components, Recharts for charts, Axios for HTTP requests, React Router for navigation.
  - Core functionality is implemented in components: application list with filter panel (text search, multi-select status, source filter, sorting, reset button), add/edit form, modal dialogs for delete confirmation and error display.
  - Filters on the frontend use debounce (500 ms) for automatic list update on input.
  - Added `ApplicationDetailPage` showing full application information, status change (with automatic history entry), note addition, and full status change chronology (sorted newest to oldest).
  - Added `Dashboard` (path `/dashboard`) displaying:
    - Summary cards (total applications, offers, success rate).
    - Pie chart for status distribution.
    - Bar chart for top 5 sources.
    - Histogram for application dynamics over the last 30 days.
    - Funnel chart for status transitions.
  - All charts use Recharts and are responsive.
  - `ApplicationListPage` has a button to navigate to the dashboard and a logout button.
  - Data export – "Export" button in the AppBar opens a menu to choose CSV or JSON format. The file is downloaded with the current date.
  - Dark/light theme – via `ThemeContext` and `ThemeToggle` (moon/sun icon in AppBar). Theme choice saved in `localStorage`.
  - Authentication implemented:
    - `AuthContext` manages token and user state, provides `login`, `register`, `logout` methods.
    - `ProtectedRoute` guards routes, redirecting unauthenticated users to `/login`.
    - Login and registration pages use MUI forms.
    - `api.ts` includes `login` and `register` functions, as well as interceptors to automatically add JWT to headers and handle 401 (redirect to login).
  - Performance optimisation (added in v.0.9.0):
    - `ApplicationListPage`, `ApplicationTable`, `ApplicationForm` wrapped in `React.memo` to prevent unnecessary re-renders.
    - `useMemo` for query parameters and `useCallback` for functions passed to child components in `ApplicationListPage`.
    - **Lazy loading** of pages via `React.lazy` and `Suspense` in `App.tsx`, reducing initial bundle size.
  - Error handling improvements (added in v.0.9.0):
    - Added global `ErrorBoundary` (class component) to catch render errors and show a friendly message with "Try again" button.
  - Responsive design (added in v.0.9.0):
    - Filter panel in `ApplicationListPage` adapted: on `xs` screens all fields stretch to 100% width and stack vertically.
    - Buttons in AppBar hide text on small screens, icons remain.
    - Application table in `ApplicationTable` gets horizontal scroll for narrow screens.
    - Create/edit form in `ApplicationForm` adapts to a single column on mobile.
  - Code style compliance:
    - All type imports use `import type` for compatibility with `verbatimModuleSyntax`.
    - MUI system props moved to `sx` object.
    - For `TextField` with `type="date"`, `slotProps={{ inputLabel: { shrink: true } }}` is used.
    - All pages are default exported for `React.lazy` to work correctly.

---

## 3. Current Status (v.0.9.99)

✅ **What is already working and configured:**

- GitHub repository (`jun-bolony/CRM-Smart-Tracker`).
- Local project structure with frontend/backend separation.
- Backend:
  - All dependencies installed (express, mongoose, cors, dotenv, bcrypt, jsonwebtoken).
  - `.env` file configured with `MONGODB_URI`, `PORT`, `JWT_SECRET`.
  - Deployed on Render: server starts with `npm start` (runs `server.js`).
  - Server responds to `GET /` with "CRM Smart Tracker API is running 🚀" (test route).
  - `Application` model (Mongoose) implemented with all fields, validation, indexes.
  - `User` model with password hashing and comparison methods.
  - CRUD endpoints for applications (JWT-protected):
    - `GET /api/applications` – get user's applications with filtering, search, sorting, pagination.
    - `POST /api/applications` – create a new application (initialises `statusHistory` and binds to `userId`).
    - `GET /api/applications/:id` – get a single application (with ownership check).
    - `PUT /api/applications/:id` – update an application (atomically adds to `statusHistory` on status change).
    - `DELETE /api/applications/:id` – delete an application (with ownership check).
  - Authentication endpoints (public):
    - `POST /api/auth/register` – register a new user, returns JWT.
    - `POST /api/auth/login` – login, returns JWT.
  - Statistics endpoint (protected):
    - `GET /api/stats` – returns aggregated statistics for the current user.
  - Controllers with error handling and validation added.
  - Middleware for ObjectId validation added.
  - Global error handler added (response format – `ApiResponse`).
- Frontend:
  - Created via `npm create vite@latest` with `react-ts` template.
  - All required dependencies installed (see stack table).
  - Deployed on Vercel: builds successfully and accessible via URL.
  - **Basic application management UI (Stage 2) implemented**:
    - Typed interfaces (`types/Application.ts`).
    - HTTP service (`services/api.ts`) using Axios with interceptor for `ApiResponse` format.
    - `ApplicationTable` – table showing key fields, status colour indicators, edit/delete buttons.
    - `ApplicationForm` – create/edit form with mandatory field validation.
    - Pages `ApplicationListPage` (list with add button) and `ApplicationFormPage` (create/edit).
    - Helper components: `LoadingSpinner`, `ErrorSnackbar`, `DeleteConfirmationDialog`.
    - Backend integration: all CRUD operations work – data loads, creates, updates, deletes.
    - Loading and error states handled with notifications.
    - Routing (React Router) configured: home (`/`), create (`/new`), edit (`/edit/:id`), detail (`/detail/:id`), dashboard (`/dashboard`).
  - **Filtering, sorting, and search (Stage 3) implemented**:
    - Backend `GET /api/applications` accepts query params: `status` (comma-separated list), `source` (exact match), `search` (case-insensitive search on company or position), `sortBy` and `sortOrder`, and `page`/`limit` for pagination.
    - Frontend `ApplicationListPage` has filter panel with search field (debounce 500 ms), multi-select status (MUI Select with Chip), source filter, sort field and order dropdowns, and reset button.
    - Filter changes automatically update the application list.
    - Type imports conform to `verbatimModuleSyntax` (e.g., `import type { SelectChangeEvent }`).
  - **Detailed application card (Stage 4) implemented**:
    - `ApplicationDetailPage` created, accessible at `/detail/:id`.
    - Displays all fields in a structured view.
    - Status change via dropdown – automatically adds entry to `statusHistory` (backend uses atomic `$push`).
    - Form to add notes; notes saved and displayed chronologically.
    - Status history block shows all changes with date/time, sorted newest to oldest, with status colour indicators.
    - All operations have loading and error handling.
  - **Analytics dashboard (Stage 5) implemented**:
    - `Dashboard.tsx` page using Recharts.
    - Displays key metrics (total applications, offers, success rate).
    - Pie chart for status distribution.
    - Bar chart for top 5 sources.
    - Histogram of application dynamics over the last 30 days.
    - Funnel chart for status transitions.
    - Data fetched from backend via `GET /api/stats`.
    - Button to navigate to dashboard added on the main list page.
  - **Authentication and authorisation (Stage 6) implemented**:
    - `AuthContext` manages user and token state.
    - `ProtectedRoute` guards all routes except `/login` and `/register`.
    - Login and registration pages ready with error handling.
    - `api.ts` automatically adds JWT to headers, intercepts 401 and redirects to login.
    - Logout button added on main page.
    - All backend requests now tied to the current user.
  - **Additional improvements (Stage 7) implemented**:
    - Data export – "Export" button in AppBar to download all applications in CSV or JSON.
    - Dark/light theme – toggle via AppBar button, choice saved in `localStorage`.
- Database:
  - MongoDB Atlas cluster created, connection string passed to `MONGODB_URI` on Render.
- Integration:
  - Frontend sends requests to backend via `VITE_API_URL` environment variable (set in .env).
- **Stage 8 "Final polish and deployment" added**:
  - Performance optimisation: `React.memo`, `useMemo`, `useCallback`, lazy loading via `React.lazy` and `Suspense`.
  - Error handling improvement: global `ErrorBoundary` catches render errors.
  - Responsive design: mobile adaptation of filter panel, AppBar, table, and form.
  - Code style compliance (type imports, `sx`, `slotProps`, default export).
  - Re‑tested all user scenarios – no errors found.

## Additional Improvements (after v.0.9.0)

[v.0.9.15]:

  - **Navigation**:
    - On `ApplicationFormPage` and `Dashboard`, "Back" buttons added at the top to quickly return to the application list.
  - **Export with path selection**:
    - Exporting all or a single application now opens the standard file save dialog (thanks to File System Access API).
    - If the browser does not support the API, fallback to automatic download to Downloads folder.
    - If the user cancels, the file is not downloaded (previous forced download behaviour fixed).
    - After successful save, a Snackbar notification confirms.
  - **Import with update of existing applications**:
    - Bulk import via JSON or CSV files implemented.
    - On import, applications are either created (if missing) or updated (by `_id` or by `company+position` pair).
    - Automatic addition of entries to `statusHistory` on update is excluded – history remains untouched.
    - After import, the application list and available sources list refresh automatically.
    - No separate `/bulk` endpoint is needed – all operations run through existing CRUD methods.
  - **Export/import of single applications**:
    - In `ApplicationTable`, added buttons:
      - Export – downloads the selected application in JSON format with path selection.
      - Import – allows uploading a JSON file to update that specific application (without changing status history).
    - Similar buttons added on `ApplicationDetailPage`.
  - **Source filtering**:
    - The "Source" filter now supports multi‑select (like statuses).
    - Available sources are dynamically built from the user's existing applications (no separate backend request).
  - **Editing source field**:
    - Fixed bug where `source` was not updated or cleared when editing an application. Now it saves correctly.
  - **Save dashboard as image**:
    - On `Dashboard` page added "Save as Image" button, which saves the entire dashboard (including charts) as PNG using `html2canvas`.
  - **UX improvements and error handling**:
    - Added success notifications for operations (delete, import, export) via Snackbar with Alert.
    - Fixed TypeScript build errors (removed unused imports, added check for `window.showSaveFilePicker`).
  - **Optimisation and removal of unused endpoints**:
    - Removed call to `/api/stats/sources` – sources now obtained from application list on the client.
    - Removed call to `/api/applications/bulk` – bulk import implemented via sequential `createApplication` and `updateApplication` calls.

[v.0.9.30]:

- **Source filtering**:
  - Fixed multi-select logic – now selecting multiple sources shows applications whose source is in the selected list (using `$in` operator).
  - If the user has no applications with a source, the filter dropdown shows an info message: "No sources available. Please add sources to your applications."
- **Application detail page**:
  - Added "Edit" and "Delete" buttons (previously only in the table). Deletion is accompanied by a confirmation dialog.
- **Export and import**:
  - All export operations (including saving dashboard as image) now use the unified utility `saveFileWithPicker` with File System Access API (save path selection) and fallback download.
  - On successful save, the snackbar shows the actual file name chosen by the user (or the proposed one).
  - Added tooltips for all export/import buttons:
    - General export/import: "Export/Import all applications for backup or sharing."
    - Single application export/import: "Export/Import this application for backup or sharing."
    - General import tooltip includes: "Supports updating existing applications by _id or company+position."
- **Email reminders (optional)** – **REMOVED in v.0.9.30** (see below).

[v.0.9.50]:

- **Removal of email reminders**:
  - Completely removed the functionality for sending email reminders about upcoming events.
  - Removed `timezone` field from `User` model.
  - Removed `reminderEnabled` field from `Application` model.
  - Removed files `backend/services/emailService.js` and `backend/cron/reminderJob.js`.
  - Removed cron job initialisation from `server.js`.
  - Removed `nodemailer` and `node-cron` dependencies from `package.json`.
  - Removed all `EMAIL_*` environment variables.
  - Removed "Send email reminder" checkboxes from forms and detail page on frontend.
  - Removed associated states, handlers, and imports (Checkbox, FormControlLabel, Tooltip in relevant places).
  - `AuthContext` no longer stores or passes `timezone`.
  - `login` and `register` API functions no longer return or accept `timezone`.
- **Added drag‑n‑drop import**:
  - Created universal component `DragDropImport` (wrapper with drag event handling, visual overlay, and file filtering).
  - On the main page (`ApplicationListPage`), the entire content area accepts file drag‑and‑drop (JSON/CSV) for bulk import. Import logic combined with "Import" button (single function `processImportFiles`).
  - On the detail page (`ApplicationDetailPage`), the application card accepts a single JSON file drag‑and‑drop to update that specific application. Logic combined with "Import" button (function `processImportFile`).
  - On drag, a semi‑transparent overlay appears with "Drop files here" hint.
  - File extension validation: for list – `.json,.csv`; for detail – `.json`.
  - Error handling and notifications integrated with existing Snackbar.

[v.0.9.60]:

- **Removal of light/dark theme toggle**:
  - Completely removed theme switching functionality and button.
- **Added global navigation bar**:
  - Created `GlobalNavBar` component (top bar for navigating between pages, logout, absent on login/register pages).

[v.0.9.65]:

- **Added toggle between card and list view for applications**:
  - Created a toggle switch to change the view (default is cards).
  - The last selected view is saved globally per account.
  - Card view is the new default (previously only list).

[v.0.9.70]:

- **Comprehensive DDoS, spam, and DB overload protection**:
  - Added `express-rate-limit` with two levels:
    - global limit of 100 requests per 15 minutes for all API routes (except auth),
    - strict limit of 10 attempts per 15 minutes on `/api/auth/*` (brute‑force protection).
  - Limited incoming JSON body size: for regular requests – 10 KB, for bulk import endpoint (`/api/applications/bulk`) – 1 MB (selective in `server.js`).
  - In `applications.js` controllers, added forced sanitisation of pagination: `limit` cannot exceed 50 records per page.
  - Added compound indexes to `Application` model: `{ userId: 1, status: 1 }` and `{ userId: 1, appliedDate: -1 }` for faster filtering and sorting.
  - Added validation for notes array in `Application` model:
    - each note no longer than 1000 characters,
    - total number of notes no more than 50.
  - Introduced global limit of 1000 applications per user (checked in `createApplication` and `createBulkApplications`).
- **Optimisation and fix for data import**:
  - Frontend import now uses batching (packages of 5 applications) instead of sequential sending – reducing server load and speeding up the process.
  - Fixed bug where users did not see validation error messages (e.g., notes too long) – now all errors are collected and displayed in a single snackbar with detailed description.
- **Vercel deployment fix**:
  - Added `frontend/vercel.json` with `rewrites` rule redirecting all requests to `index.html` – fixes 404 errors on client‑side navigation (e.g., after failed login attempt).

[v.0.9.75]:

- **Backend security and stability**:
  - Added `helmet` middleware to automatically set secure HTTP headers (XSS, clickjacking protection, etc.).
  - Configured CORS strictly to allowed origins:
    - In production, only the domain specified in `FRONTEND_URL` environment variable is allowed; if absent, the server does not start.
    - In development, local addresses are allowed by default (`localhost:5173`, `127.0.0.1:5173`, and port 3000 for backend).
  - Added a universal wrapper module `asyncHandler` (`backend/utils/asyncHandler.js`) that automatically passes errors from async controllers to the global `errorHandler`. This ensures that any unhandled error will not crash the Node.js process.
  - All routes (`/api/applications`, `/api/auth`, `/api/stats`) now use `asyncHandler` to wrap their controllers.
- **Local development improvements (CORS bypass)**:
  - Added proxy in `vite.config.ts` for all `/api` requests, redirecting them to the target backend (local or remote depending on `VITE_API_URL`). This avoids CORS errors when developing on `localhost`.
  - Changed `baseURL` logic in `api.ts`:
    - In **production** mode, uses the full URL from `VITE_API_URL`.
    - In **development** mode, `baseURL` remains empty, and all requests go through the Vite proxy (to the same host and port where the frontend is running).
  - Updated documentation: for local development, it is recommended not to set `VITE_API_URL` in `.env`, or set it only to specify the target backend for the proxy.

[v.0.9.80]:

- **Combatting backend cold start**:
  - Created a lightweight `/api/health` endpoint on the backend (returns `text/plain` with `'ok'`), used to check server availability and wake it up.
  - Configured an external "wake‑up" via **Cron-Job.org** – the service pings `/api/health` **every 5 minutes around the clock**, preventing the server from sleeping on Render (free tier). This ensures instant response for all users at any time, completely eliminating cold start delays.
  - Implemented a **fallback wake‑up mechanism** on the frontend in case the external pinger fails:
    - Created hook `useBackendHealth`, which on app load sends a request to `/api/health` with a 3‑second timeout.
    - If no response is received (server is sleeping), a countdown timer (60 seconds) starts with a retry after the time elapses. On a second failure, it adds another 15 seconds.
    - While the server is not awake, a `WakeUpScreen` component is displayed – a stylish modal with explanatory text, animated progress bar, and remaining seconds counter, turning the wait into a transparent and professional feature.
  - Integration into `App.tsx`: rendering of the main app (`AppContent`) happens only after a successful health check, preventing errors from requests to a sleeping API and improving user experience.
  - All changes comply with code style rules (type imports, `sx`, English language).

[v.0.9.85]:

- **Small‑screen optimisation**:
  - Navigation bar turns into a convenient scrollbar at low resolution.
  - Global gradient side bars now compress and disappear on page resize.
  - At low resolution, the view toggle (cards/list) is hidden and cards are forced (since list is inconvenient on narrow screens).
  - On mobile, tool buttons on the Detailed Application page become simple icons to avoid overlap.

[v.0.9.90]:

- **GlobalNavBar navigation improvements**:
  - "Edit Page" and "Detailed Application" buttons now become active (highlighted and functional) when the corresponding application pages are opened. In inactive state, hover shows a tooltip explaining activation conditions.
  - In active state, only the button corresponding to the current page is highlighted (the other remains clickable but not highlighted).
- **Extended sorting options**:
  - Added sorting by status in order: Sent → Viewed → Interview → Test → Offer → Rejected → Archived.
  - Added sorting by last update (field `updatedAt`).
  - Sorting by creation date now uses exact creation time (`createdAt`), not just the date from `appliedDate`.
  - Updated `ApplicationQueryParams` types and the "Sort By" dropdown on the list page.
- **Account management**:
  - Added a delete account button (icon only) to the right of the Logout button in the navigation bar.
  - On click, opens a confirmation dialog displaying the user's email in bold.
  - Implemented backend endpoint `DELETE /api/auth/account`, which deletes the user and all their applications from the database.
- **Note management on detail page**:
  - Added delete button (cross) next to each note.
  - When editing an application, if the user completely clears the notes field, the notes array becomes empty (notes are deleted).
- **Dashboard and UI improvements**:
  - When no applications exist, the pie chart block on the dashboard shows "No data available" (like other blocks).
  - In the account deletion confirmation dialog, user email is shown in bold.
- **Unified scrollbars**:
  - Created common style file `frontend/src/styles/scrollbar.ts` with a unified scrollbar design (10px width, rounded corners, colours `#f1f1f1` / `#c1c1c1`).
  - All pages and components use the unified scrollbar style via `scrollbarSx`.
- **Fixed missing scroll on pages**:
  - On Dashboard, ApplicationDetailPage, and ApplicationFormPage, added styles `height: '100%'` and `overflowY: 'auto'` for proper vertical scrolling when content overflows.

[v.0.9.91]:

- **Internationalisation (i18n) and interface translation**:
  - Added full support for two languages: English (default) and Russian.
  - Created translation system based on context (`LanguageContext`) with function `t(key, params)`.
  - All static texts on pages `ApplicationListPage`, `LoginPage`, `RegisterPage`, `Dashboard`, and components `GlobalNavBar`, `ApplicationTable`, `ApplicationCard`, `ApplicationCardList` are translated into both languages.
  - Added translations for all application statuses (Sent → Отправлено, Interview → Собеседование, etc.).
  - Translation file `translations.ts` split into separate JSON files per language (`en.json`, `ru.json`) placed in `frontend/src/translations` with a single import point (`index.ts`).
  - In the navigation bar (`GlobalNavBar`), a language toggle button is added on the left, showing the current locale as an abbreviation (EN/RU). On click, opens a dropdown to select language.
  - A similar language toggle button is placed in the top‑left corner of Login and Register pages.
  - Selected language is saved in `localStorage` and automatically picked up on next visit.
  - For correct JSON imports, added `"resolveJsonModule": true` and `"esModuleInterop": true` in `tsconfig.app.json`.
- **Fixes and improvements**:
  - Fixed nested key parsing error in `LanguageContext` – now `t` correctly handles dot notation (e.g., `'statuses.Sent'`), fixing display of strings like `statuses.Sent` instead of translated status names.
  - Fixed "white screen" and 404 error on project start – added missing TypeScript settings for importing JSON modules.
  - All new files (translations, language context) comply with code style: `import type` for types, `sx` props, `slotProps` for `TextField`, comments in English.

[v.0.9.92]:

- **Status internationalisation on all pages**:
  - In components `ApplicationDetailPage`, `ApplicationForm`, `ApplicationListPage` (filters, chips), and `Dashboard` (charts), all statuses now display via `t('statuses.' + status)`.
  - Fixed colour mismatch on pie chart and funnel when switching language – original status names (`originalName`, `originalStage`) are kept for colour mapping.
- **Improved date display on detail page**:
  - Added `formatDateOnly` function for "Next event" and "Applied date" fields – displays only date (without time) in localised format (e.g., `09.08.2026` for RU, `08/09/2026` for EN).
  - For status history, added `formatDateShortWithTime` – displays short date with time (e.g., `09.08.2026, 21:17` for RU, `8/9/2026, 9:17 PM` for EN).
- **Custom tooltips on dashboard**:
  - Created `CustomFunnelTooltip` for funnel – tooltip text coloured to match the segment.
  - In all chart tooltips, translated the word "count" via `tooltipFormatter` (key `count`).
  - Added separate tooltip `saveAsImageTooltip` for the "SAVE AS IMAGE" button.
- **UX and UI improvements**:
  - In account deletion dialog, user email is displayed in bold.
  - Reduced divider thickness on applications page.
  - In delete confirmation dialog (`DeleteConfirmationDialog`), text translated via `t('deleteConfirmMessage')`.
- **Full translation of all interface strings**:
  - Added missing keys in `en.json` and `ru.json` for all components: `ApplicationDetailPage`, `ApplicationFormPage`, `ApplicationForm`, `DeleteConfirmationDialog`, `DragDropImport`, `WakeUpScreen`, `GlobalNavBar`.
  - Translated all tooltips, form labels, error messages, and notifications.

[v.0.9.93]:

- **Added support for Spanish and French**:
  - Created translation files `es.json` and `fr.json` with all necessary keys (statuses, navigation, pages, notifications, etc.).
  - `Language` type in `LanguageContext` extended to `'en' | 'ru' | 'es' | 'fr'`.
  - Updated logic in `LanguageProvider` to restore saved language from `localStorage` considering the new languages.
  - In `GlobalNavBar`, added "Español" and "Français" items to language menu.
  - On `LoginPage` and `RegisterPage`, similarly updated language menus.
  - All components using `t()` now correctly display translations for all four languages without additional changes.

[v.0.9.95]:

- **Added support for German and Simplified Chinese**:
  - Created translation files `de.json` and `zh.json` with all necessary keys (statuses, navigation, pages, notifications, etc.).
  - `Language` type in `LanguageContext` extended to `'de' | 'zh'`.
  - Updated logic in `LanguageProvider` to restore saved language from `localStorage` considering the new languages.
  - In `GlobalNavBar`, `LoginPage`, and `RegisterPage`, added "Deutsch" and "中文" items to language menu.
  - All components using `t()` now correctly display translations for all six languages (en, ru, es, fr, de, zh) without additional changes.

[v.0.9.99]:

- **Repository preparation for public opening**:
  - Added community and documentation files:
    - `LICENSE` – chosen MIT license.
    - `CONTRIBUTING.md` – detailed contributor guide (setup, coding rules, PR process).
    - `CODE_OF_CONDUCT.md` – code of conduct (Contributor Covenant v2.1).
    - `SECURITY.md` – security policy and vulnerability reporting instructions.
  - Added Issue templates (in `.github/ISSUE_TEMPLATE/`):
    - `bug_report.yml` – structured form for bug reports.
    - `feature_request.yml` – form for feature suggestions.
    - `task.yml` – template for general tasks and technical debt.
    - `config.yml` – template selection configuration and link to Discussions.
  - Added environment file examples:
    - `backend/.env.example` – with `PORT`, `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` and comments.
    - `frontend/.env.example` – with `VITE_API_URL` and explanation about Vite proxy for local development.
  - Created root `README.md` in English:
    - Project description, key features, technology stack.
    - Installation and setup instructions (including proxy and variables).
    - Sections on deployment, contribution, security, and license.
- All added files do not affect application code or behaviour; they are intended to improve developer and user experience when the repository is opened.

---

## 4. Global Development Rules

### 4.1. Code Style

- **Backend** (Node.js):
  - Use **CommonJS** (`require` / `module.exports`), since `package.json` does not specify `"type": "module"`.
  - All environment variables are obtained via `process.env` (using `dotenv`).
  - Error handling: use `try/catch` in async controllers and pass errors via `next(err)` in Express.
  - File naming: `kebab-case` for files (`user-model.js`, `applications-routes.js`).

- **Frontend** (React + TypeScript):
  - Use **functional components** with hooks.
  - Style components with **Material-UI** – preferably using `sx` props.
  - Typing: strict typing for all props, state, API responses.
  - Naming: components – `PascalCase`, files – `PascalCase` for components (`ApplicationList.tsx`), utilities – `camelCase`.
  - When using `verbatimModuleSyntax`, all type imports must be `import type`.
  - For performance optimisation, use `React.memo`, `useMemo`, `useCallback` in heavy components.
  - For lazy loading pages, use `React.lazy` and `Suspense`.
  - For global render error catching, use `ErrorBoundary`.

### 4.2. API Organisation

- Base URL for API: `VITE_API_URL` (frontend) / `https://your-backend.onrender.com` (production).
- All application endpoints have prefix `/api/applications`.
- API responses must be JSON and contain fields:
  ```typescript
  {
    success: boolean;
    data?: any;          // payload
    message?: string;    // error or success message
  }
  ```
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Internal Server Error).

### 4.3. Database Operations

- Use Mongoose for data modelling.
- Schemas are defined in backend/models/.
- MongoDB connection is made once at server start, then a single connection instance is used.
- On connection error, the server should exit with code 1 (process crashes so Render can restart it).

### 4.4. Environment Variables

- **Backend (.env)**:
	- PORT – port the server listens on (default 3000).
	- MONGODB_URI – MongoDB Atlas connection string (mandatory).
	- JWT_SECRET – secret for signing tokens (mandatory, added in Stage 6).

- **Frontend (on Vercel)**:
	- VITE_API_URL – full backend URL (e.g., https://crm-backend.onrender.com).

## 5. Critical Interfaces (Data Contracts)
Below are the key types and structures that must be used throughout the project. When generating code, the AI must strictly adhere to these interfaces.

### 5.1. Application Entity
```typescript
// frontend/src/types/Application.ts (and similarly for backend model)

export type ApplicationStatus =
  | 'Sent'
  | 'Viewed'
  | 'Interview'
  | 'Test'
  | 'Offer'
  | 'Rejected'
  | 'Archived';

export interface Application {
  _id?: string;
  userId?: string;
  company: string;
  position: string;
  url?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  salaryMin?: number;
  salaryMax?: number;
  source?: string;
  status: ApplicationStatus;
  appliedDate: Date | string;
  nextEventDate?: Date | string;
  notes?: string[];
  statusHistory?: {
    status: ApplicationStatus;
    changedAt: Date | string;
  }[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
```

### 5.2. API Response Wrapper
```typescript
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}
```

Example success response for getting applications list:

```json
{
  "success": true,
  "data": [ /* array of Application */ ]
}
```

Example error:

```json
{
  "success": false,
  "message": "Application not found"
}
```

### 5.3. Filtering and Pagination Parameters (for GET /api/applications)

```typescript
export interface ApplicationQueryParams {
  status?: string;            // Comma-separated list of statuses, e.g. "Sent,Viewed"
  source?: string;            // Exact match of source
  search?: string;            // search by company or position (case-insensitive)
  sortBy?: 'appliedDate' | 'nextEventDate' | 'salaryMax';
  sortOrder?: 'asc' | 'desc';
  page?: number;              // for pagination
  limit?: number;
}
```

### 5.4. Application – Current App.tsx

```tsx
// frontend/src/App.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, Box, GlobalStyles } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorBoundary } from './components/ErrorBoundary';
import { GlobalNavBar } from './components/GlobalNavBar';
import { useBackendHealth } from './hooks/useBackendHealth';
import { WakeUpScreen } from './components/WakeUpScreen';
import { GlobalGradientWrapper } from './components/GlobalGradientWrapper';

const ApplicationListPage = lazy(() => import('./pages/ApplicationListPage'));
const ApplicationFormPage = lazy(() => import('./pages/ApplicationFormPage'));
const ApplicationDetailPage = lazy(() => import('./pages/ApplicationDetailPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

const AppRoutes = () => {
  const location = useLocation();
  const hideNav = location.pathname === '/login' || location.pathname === '/register';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100%', overflow: 'hidden' }}>
      {!hideNav && <GlobalNavBar />}
      <GlobalGradientWrapper>
        <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/" element={<ProtectedRoute><ApplicationListPage /></ProtectedRoute>} />
              <Route path="/new" element={<ProtectedRoute><ApplicationFormPage /></ProtectedRoute>} />
              <Route path="/edit/:id" element={<ProtectedRoute><ApplicationFormPage /></ProtectedRoute>} />
              <Route path="/detail/:id" element={<ProtectedRoute><ApplicationDetailPage /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Box>
      </GlobalGradientWrapper>
    </Box>
  );
};

const AppContent = () => {
  const theme = createTheme({ palette: { mode: 'light' } });

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          'html, body': {
            margin: 0,
            padding: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
          },
          '#root': {
            width: '100%',
            height: '100%',
            margin: 0,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
          },
          // Unified scrollbar styles for all scroll containers
          '.table-scroll-container, .dashboard-scroll-container, .detail-scroll-container': {
            scrollbarWidth: 'thin',
            scrollbarColor: '#c1c1c1 #f1f1f1',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#c1c1c1',
              borderRadius: '8px',
              border: '2px solid #f1f1f1',
              backgroundClip: 'padding-box',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#a8a8a8',
            },
          },
        }}
      />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </MuiThemeProvider>
  );
};

function App() {
  const { isBackendReady, secondsLeft, isWaiting } = useBackendHealth();

  return (
    <ErrorBoundary>
      {!isBackendReady ? (
        <WakeUpScreen secondsLeft={secondsLeft} isWaiting={isWaiting} />
      ) : (
        <AppContent />
      )}
    </ErrorBoundary>
  );
}

export default App;
```

### 5.5. Statistics Interface

```tsx
export interface StatsData {
  statusDistribution: { name: string; value: number }[];
  timeline: { date: string; count: number }[];
  topSources: { source: string; count: number }[];
  funnel: { stage: string; count: number }[];
  totalApplications: number;
  offerCount: number;
  offerRate: number;
}
```

### 5.6. User Entity

```ts
// frontend/src/types/User.ts
export interface User {
  _id?: string;
  email: string;
  passwordHash?: string; // not sent to frontend
  createdAt?: Date | string;
}

export interface AuthResponse {
  token: string;
  email: string;
}
```

## 6. Planned Endpoints (for reference)

*(All endpoints listed below are implemented)*

Method			URL							Description					Protection
GET		/api/applications		✅ Get all applications (with filters)		JWT
POST	/api/applications		✅ Create a new application					JWT
GET		/api/applications/:id	✅ Get a single application					JWT
PUT		/api/applications/:id	✅ Update an application					JWT
DELETE	/api/applications/:id	✅ Delete an application					JWT
GET		/api/stats				✅ Get aggregated statistics				JWT
POST	/api/auth/register		✅ Register a new user						none
POST	/api/auth/login			✅ Login, obtain JWT						none

## 7. Instructions for AI Assistant

**When working on the project, please consider**:
- All new features must conform to the described interfaces.
- When generating frontend code, use Material-UI for components and Recharts for charts.
- On the backend, always handle errors and return responses in ApiResponse format.
- Follow clean code principles: separate logic, use middleware, avoid code duplication.
- When adding new pages or components, update routing and types.
- No Cyrillic characters in code files – all code, including comments, must be in English.
- Note the current version of ApplicationQueryParams – the status field is now a string, not an array. This is critical for proper query parameter transmission.
- On the frontend, when using MUI components always use sx props for styling, not obsolete makeStyles. For importing MUI types, use import type { ... }. For SelectChangeEvent, always specify import type { SelectChangeEvent } from @mui/material to avoid build errors with verbatimModuleSyntax.
- Specifics of status history implementation: when updating the status on the backend, the entry in statusHistory is added atomically via the $push operator, and the entire update is performed with findByIdAndUpdate and { new: true }. This ensures history integrity and returns the updated document. Any changes affecting status must follow this approach to avoid losing or duplicating history.
- When working with authentication:
	- All protected endpoints expect the Authorization: Bearer <token> header.
	- On the backend, use auth.js middleware to extract req.userId.
	- On the frontend, use AuthContext and ProtectedRoute component.
	- In api.ts, interceptors are already set up to automatically add the token and handle 401.
- New recommendations for optimisation and quality (v.0.9.0):
	- For components that may re‑render often (tables, forms, lists), use React.memo.
	- In components with heavy computations or dependencies on props, use useMemo and useCallback.
	- For pages not needed at initial load, use lazy loading via React.lazy and Suspense.
	- Always wrap the root component in ErrorBoundary to catch render errors.
	- For responsive layout, use MUI breakpoints (xs, sm, md, etc.) inside sx or via useMediaQuery.
	- Ensure all pages are default exported (export default) so that React.lazy works correctly.