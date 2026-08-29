# 🧠 CRM Smart Tracker

**Full‑stack job application tracker with analytics, status history, and multi‑language support.**

[![Version](https://img.shields.io/badge/version-0.9.95-blue.svg)](https://github.com/jun-bolony/CRM-Smart-Tracker/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.2.7-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.2-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)](https://www.mongodb.com/atlas)

**Live Demo:** [Frontend](https://crm-smart-tracker.vercel.app) • [Backend API](https://crm-backend.onrender.com/api/health)

---

## 📖 About

**CRM Smart Tracker** is a personal CRM‑style web application designed to help job seekers and freelancers manage their applications, track communication with employers, and gain actionable insights through analytics.

Instead of juggling spreadsheets or losing track of follow‑ups, you get a single dashboard where you can:

- Add and update job applications (company, position, contacts, salary, source, etc.).
- Move applications through a custom status workflow (`Sent` → `Viewed` → `Interview` → `Test` → `Offer` → `Rejected` → `Archived`).
- Write notes and see a full chronological **status history** for each application.
- Filter, search, and sort your list.
- Explore **real‑time analytics**: status distribution, daily activity, top sources, and a conversion funnel.
- Export/import your data (JSON/CSV) for backup or sharing.

The app is **fully internationalized** and supports 6 languages: English, Russian, Spanish, French, German, and Chinese (simplified).

> Built with a modern MERN stack, deployed on Vercel + Render, and kept alive 24/7 with a cron‑based wake‑up mechanism to eliminate cold starts.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🔐 Authentication** | JWT‑based sign‑up / login, protected routes, account deletion. |
| **📋 Application CRUD** | Create, read, update, delete applications with all fields (company, position, status, salary, contacts, dates, notes). |
| **📊 Status History** | Every status change is automatically recorded with a timestamp – visible on the detail page. |
| **🔎 Filtering & Search** | Multi‑select status & source filters, full‑text search (company / position), and sorting by date, salary, or last update. |
| **📈 Analytics Dashboard** | Pie chart (status distribution), bar chart (top sources), timeline (daily activity), and conversion funnel – all powered by Recharts. |
| **📂 Import / Export** | Bulk import from CSV/JSON (with update‑or‑create logic) and export to CSV/JSON. Supports single‑application import/export as well. |
| **🌍 Internationalization** | 6 languages: English, Russian, Spanish, French, German, and Chinese – with a language switcher in the navigation bar. |
| **📱 Responsive** | Fully adaptive UI for mobile, tablet, and desktop. |
| **🎨 Drag‑and‑Drop Import** | Drag a file onto the application list or detail page to import data instantly. |
| **🛡️ Security** | Rate limiting, request size limits, pagination caps, Helmet security headers, and strict CORS policies. |
| **💾 "Wake‑Up" Mechanism** | External cron‑job pings the health endpoint every 5 minutes to prevent cold starts on Render's free tier. |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** – component library
- **TypeScript** – type safety
- **Vite** – fast build tool
- **Material‑UI (MUI)** – component framework and styling
- **Recharts** – charting library
- **React Router** – navigation
- **Axios** – HTTP client
- **html2canvas** – dashboard export as image

### Backend
- **Node.js** (LTS) – runtime
- **Express** – web framework
- **MongoDB Atlas** – cloud database (M0 cluster)
- **Mongoose** – ODM
- **JWT** – authentication
- **bcrypt** – password hashing
- **helmet** – security headers
- **express‑rate‑limit** – DDoS protection
- **CORS** – cross‑origin resource sharing

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Cron‑Job**: Cron‑Job.org (keeps backend awake)

---

## 🚀 Live Demo

- **Frontend:** [https://crm-smart-tracker.vercel.app](https://crm-smart-tracker.vercel.app)  
  *Try it with your own email/password.*
- **Backend API:** [https://crm-backend.onrender.com/api/health](https://crm-backend.onrender.com/api/health)  
  *Returns `ok` if the server is awake.*

---

## 📥 Installation (Local Development)

### Prerequisites
- Node.js (v18 or v20 LTS)
- npm or yarn
- MongoDB Atlas account (free tier is fine) or a local MongoDB instance

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/jun-bolony/CRM-Smart-Tracker.git
   cd CRM-Smart-Tracker
   ```
2. **Backend Setup**
	```bash
	cd backend
	npm install
	cp .env.example .env   # create your environment file
	# Edit .env: add MONGODB_URI, JWT_SECRET, FRONTEND_URL (use http://localhost:5173 for local dev)
	npm run dev            # starts on port 3000 by default
	```
3. **Frontend Setup**
	```bash
	cd frontend
	npm install
	cp .env.example .env   # create your environment file
	# Leave VITE_API_URL empty – Vite's proxy will forward requests to localhost:3000
	npm run dev            # starts on port 5173
	```
4. Open http://localhost:5173 in your browser.

*The frontend uses a Vite proxy to avoid CORS issues during development. All /api requests are automatically forwarded to the backend.

###🔐 Environment Variables
**Backend (backend/.env)**
Variable	Description	Default
PORT	Server port	3000
MONGODB_URI	MongoDB connection string	required
JWT_SECRET	Secret for signing JWTs	required
FRONTEND_URL	Allowed frontend origin (CORS)	required in production
**Frontend (frontend/.env)**
Variable	Description	Default
VITE_API_URL	Backend API URL (leave empty for local dev with proxy)	empty
See the .env.example files in each directory for detailed comments.

###📂 Project Structure

CRM-Smart-Tracker/
├── backend/
│   ├── models/          # Mongoose schemas (Application, User)
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, error handling, asyncHandler
│   ├── utils/           # Utilities (asyncHandler)
│   ├── server.js        # Entry point
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Lazy‑loaded page components
│   │   ├── context/     # Auth & Language contexts
│   │   ├── translations/# i18n JSON files (en, ru, es, fr, de, zh)
│   │   ├── services/    # API client (Axios)
│   │   ├── types/       # TypeScript interfaces
│   │   └── ...
│   └── .env.example
└── README.md

###📦 Deployment
The project is live and can be deployed separately:

**Frontend (Vercel):**
Connect your GitHub repository, set VITE_API_URL to your backend URL, and deploy.

**Backend (Render):**
Use the backend/ folder as root, set environment variables in the Render dashboard (MONGODB_URI, JWT_SECRET, FRONTEND_URL), and deploy.

**Wake‑up Service:**
A cron‑job (via Cron‑Job.org) pings the /api/health endpoint every 5 minutes to keep the free‑tier backend alive.

###🤝 Contributing
We welcome contributions! Please read our Contributing Guide before submitting issues or pull requests.
	- Report bugs and request features via Issues (use the provided templates).
	- Join discussions in Discussions.
	- Check our Code of Conduct – we are committed to a friendly community.

###🛡️ Security
If you discover a security vulnerability, please do not open a public issue. Instead, use the "Report a vulnerability" button on GitHub’s Security tab or contact the maintainer directly. See our Security Policy for details.

###📄 License
This project is licensed under the MIT License – see the LICENSE file for details.

###🙏 Acknowledgements
	- Material‑UI for the beautiful component library.
	- Recharts for the charts.
	- Vercel and Render for generous free hosting.
	- All open‑source contributors who made this project possible.


**Built with ❤️ by jun-bolony**