# ROADMAP.md — Essence and Implementation Plan for "Smart Task Tracker with Analytics" (CRM-Smart-Tracker)

[Project Essence]  
**Purpose:** Detailed description of all project aspects.

## Project Essence

This is a web application that helps job seekers (or any users managing multiple tasks) organise the job search process. Instead of keeping all stages of interaction with potential employers in mind or in a chaotic spreadsheet, the user gets a unified dashboard where they can:
- Add vacancies with detailed information (company, contact, job link, salary range).
- Track the status of each application (e.g., "Application Sent", "Interview Scheduled", "Test Task", "Offer", "Rejection").
- Make notes for each stage (impressions, questions, agreements).
- Set dates for key events (deadlines, interview dates).
- Filter and sort applications by status, date, company.
- The main "highlight" is to see clear analytics: how many applications are at each stage, how progress changes over time, which search channels are most effective (if we add a "source" field).

Thus, it is a mini‑CRM (Customer Relationship Management) adapted to managing relationships with employers.

---

## User Roles and Scenarios

In the basic version, the application is single‑user – each user manages only their own data (if registration/login is added, data is isolated). The main scenario:
1. The user registers / logs in (optionally, they could start without registration, storing data locally, but for demonstrating full‑stack skills it's better to use a database and JWT).
2. Goes to the main page – a list of all applications (table or Kanban board).
3. Adds a new application via a form.
4. As they progress, they change status, add comments, set reminders.
5. On the "Analytics" tab, they see charts and statistics.

---

## Features (by points)

1. **Application Management (CRUD)**
   - **Create:** form with fields:
     - Company name (required)
     - Position (required)
     - Job link (optional)
     - Contact person (name, email/phone)
     - Salary range (from/to)
     - Source (LinkedIn, DOU, referral, company website, etc.)
     - Status (dropdown)
     - Application date (default today)
     - Notes (text field)
     - Next event date (deadline, interview)

   - **Read:** display a list of applications as a table or cards with sorting and filtering.
   - **Update:** edit any field, quick status change (e.g., via a dropdown right in the table).
   - **Delete:** with confirmation.

2. **Filtering and Search**
   - Filter by status (e.g., show only "Active").
   - Filter by source.
   - Search by company name or position (full‑text).
   - Sorting by creation date, next event date, salary.

3. **Detailed Application Card**
   - Clicking on a row opens a separate page / modal window with complete information and a feed of notes (status change history and comments). This allows maintaining a chronology of communication.

4. **Analytics Dashboard**
   - A separate page displays:
     - Pie chart – distribution of applications by status (active, offers, rejections, unanswered applications).
     - Histogram – number of applications by day/week (shows activity dynamics).
     - Funnel – how many applications progressed to the next stage (from application to interview, from interview to offer) – a classic sales funnel.
     - Statistics – total number of applications, average response time, success rate (percentage of offers).
     - Top sources – bar chart showing which platforms bring the most responses (useful for optimising search strategy).

5. **Additional "Goodies" (optional)**
   - Automatic creation of notes when status changes (a record "Status changed to 'Interview' 2026-07-19" is added to the feed).
   - Export data to JSON/CSV (backup or analysis in Excel).
   - Email reminders about upcoming interviews (requires integration with nodemailer or an external service).
   - Dark/Light theme.

---

## How It Can Evolve

After the basic implementation, the project can be extended:
- Add a Kanban board (drag‑and‑drop cards between status columns) – this would look very impressive.
- Integrate external service APIs (e.g., automatically pull company data from the job link).
- Implement multi‑user mode with the ability to invite colleagues (team job search).
- Add push notifications via Service Workers.

---
---
---

[Implementation Plan]  
**Purpose:** Roadmap from the current state (v.0.9.0) to a full‑featured release.

---

## Status Markers
- **[+]** – step fully completed (infrastructure and basic setup).
- **[~]** – nearest steps to be implemented first.
- **[x]** – planned tasks, execution will start after previous stages are completed.

---

## Stage 0: Infrastructure and Deployment (completed) ✅
| Task | Status |
|------|--------|
| Create GitHub repository (`jun-bolony/CRM-Smart-Tracker`) | [+] |
| Set up project structure (split into `frontend/` and `backend/`) | [+] |
| Install all backend dependencies (Express, Mongoose, CORS, dotenv) | [+] |
| Install all frontend dependencies (React, TypeScript, Vite, MUI, Recharts, Axios) | [+] |
| Create and configure `.env` for backend (`PORT`, `MONGODB_URI`) | [+] |
| Create MongoDB Atlas cluster (free M0) and obtain connection string | [+] |
| Deploy backend to Render (set Root Directory = `backend`) | [+] |
| Deploy frontend to Vercel (set Root Directory = `frontend`) | [+] |
| Configure `VITE_API_URL` variable on Vercel (point to backend URL) | [+] |

---

## Stage 1: Backend – Data Models and Basic CRUD API (highest priority)
| Task | Status |
|------|--------|
| Create `backend/models/` folder and `Application.js` file with Mongoose schema according to the contract (fields: company, position, status, appliedDate, etc.) | [+] |
| Create `backend/routes/` folder and `applications.js` with basic endpoints: <br> • `GET /api/applications` – get all applications <br> • `POST /api/applications` – create a new application <br> • `GET /api/applications/:id` – get one application <br> • `PUT /api/applications/:id` – update an application <br> • `DELETE /api/applications/:id` – delete an application | [+] |
| Add input validation (e.g., using Mongoose built‑in validators or Joi) | [+] |
| Create controllers (move logic from routes to `backend/controllers/applications.js`) | [+] |
| Test all endpoints with cURL (success and error scenarios) | [+] |

---

## Stage 2: Frontend – Basic Application Management UI
| Task | Status |
|------|--------|
| Install React Router for navigation (list, create/edit, details, dashboard) | [+] |
| Create HTTP service (`frontend/src/services/api.ts`) using Axios with base URL from `VITE_API_URL` | [+] |
| Create `ApplicationList.tsx` component – table or cards showing main fields (company, position, status, date) | [+] |
| Create `ApplicationForm.tsx` component – form with fields according to the contract (Material‑UI components) for create and edit | [+] |
| Implement delete application with modal confirmation | [+] |
| Integrate CRUD operations with backend (display list, create, update, delete) | [+] |
| Handle loading and error states (loaders, snackbar notifications) | [+] |

---

## Stage 3: Filtering, Sorting, and Search
| Task | Status |
|------|--------|
| Add backend support for query parameters: filtering by status and source, search by company/position, sorting by fields | [+] |
| Implement frontend dropdowns for status and source filters | [+] |
| Search field (text input) with debounce for automatic list update | [+] |
| Sorting selection (by creation date, next event date, salary) via dropdown | [+] |

---

## Stage 4: Detailed Application Card
| Task | Status |
|------|--------|
| Create `ApplicationDetail.tsx` component (separate page or modal) displaying all application information | [+] |
| Display notes list (`notes`) and status history (`statusHistory`) in chronological order | [+] |
| Allow adding new notes via a form inside the card | [+] |
| Automatically add an entry to `statusHistory` on status change (implement on backend via middleware or controller hook) | [+] |

---

## Stage 5: Analytics Dashboard
| Task | Status |
|------|--------|
| Create backend endpoint `GET /api/stats` for data aggregation: <br> • Status distribution <br> • Dynamics by date (grouped by day/week) <br> • Funnel transitions between statuses <br> • Top sources | [+] |
| Create `Dashboard.tsx` page on frontend | [+] |
| Integrate Recharts: pie chart, histogram, source bar chart | [+] |
| Display statistical metrics (total count, offer percentage, average response time) | [+] |

---

## Stage 6: Authentication and Authorisation (JWT)
| Task | Status |
|------|--------|
| Create `User` model (Mongoose) with fields: email, passwordHash (bcrypt) | [+] |
| Endpoints `POST /api/auth/register` and `POST /api/auth/login` with JWT generation | [+] |
| Middleware for JWT verification on protected routes | [+] |
| Bind each application to `userId` (update schema and all queries) | [+] |
| Create login and registration pages on frontend (Material‑UI forms) | [+] |
| Store token in `localStorage` or `httpOnly` cookie (choose approach) and add it to `Authorization` header on requests | [+] |
| Protect frontend routes (redirect to login if no token) | [+] |

---

## Stage 7: Additional Improvements (optional)
| Task | Status |
|------|--------|
| Export data to CSV/JSON (button on list page, file download) | [+] |
| Email reminders about upcoming interviews (use `nodemailer` and cron job or scheduler) | [!] removed |
| Dark/Light theme | [+] |

---

## Stage 8: Final Polish and Deployment
| Task | Status |
|------|--------|
| Frontend performance optimisation (React.memo, useMemo, lazy loading) | [+] |
| Improve error handling on client and server (clear user‑friendly messages) | [+] |
| Responsive design for mobile devices | [+] |
| Re‑test all user scenarios (manual and possibly automated) | [+] |

---

## Priority Notes
1. **Core functionality (CRUD + basic UI)** must be implemented first – this is the Minimum Viable Product (MVP).
2. **Analytics and filters** are the second priority, as they are key differentiators of the project.
3. **Authentication** is added after the MVP to keep initial development simple.
4. **Additional features** are optional and will be implemented as desired and time permits.