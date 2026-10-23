# TaskFlow — Modern Full-Stack Todo Application

[![CI](https://github.com/harsh312-afk/todoapp/actions/workflows/ci.yml/badge.svg)](https://github.com/harsh312-afk/todoapp/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A modern, production-ready, fully accessible full-stack task management application built with Node.js, Express, MongoDB (with resilient in-memory fallback), and React.

---

## 🚀 Key Improvements & Features

- **Robust & Resilient Architecture**:
  - Modular MVC structure (`controllers`, `models`, `routes`, `middleware`, `config`).
  - **Zero-Friction In-Memory Fallback**: Runs out-of-the-box even without a local MongoDB service running, while persisting automatically to MongoDB whenever available.
  - **Critical Bug Fixes**: Resolved fatal `todo.remove()` crash in Mongoose 7+ by migrating to `findByIdAndDelete()`, plus handled `CastError` and input sanitization.
  - **Security Hardening**: Integrated `helmet`, `express-rate-limit`, configurable CORS, and body size limits.
  - **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT` to safely drain connections and close MongoDB sessions.
- **Modern & Accessible Frontend**:
  - **IME-Safe Submission**: Protects against premature form submission when composing characters in CJK (Japanese, Chinese, Korean) or virtual keyboards.
  - **Accessible Semantic HTML**: WCAG-compliant forms, labels, high-contrast `:focus-visible` rings, and screen-reader announcements via `aria-live`.
  - **Rich Task Controls**:
    - Filter tabs: **All**, **Active**, **Completed** with live counter badges.
    - **Real-time Search**: Instant task filtering by keyword.
    - **Inline Task Renaming**: Double-click or click **Edit** (with Enter to save, Esc to cancel).
    - **Batch Operations**: "Check All / Uncheck All" and "Clear Completed".
    - **Progress Bar**: Visual completion percentage tracking.
    - **Dark & Light Theme**: Automatically conforms to system color scheme (`prefers-color-scheme`).
    - **Optimistic UI**: Instant updates with automatic rollback on network failure.
- **Testing & Developer Experience**:
  - Root monorepo scripts for concurrent development and unified testing (`npm run dev`, `npm test`).
  - 26 automated unit and integration tests (Jest + Supertest on backend, React Testing Library on frontend).
  - Docker & Docker Compose setup for containerized deployment.
  - GitHub Actions CI pipeline.

---

## 📁 Project Structure

```
todoapp/
├── .github/workflows/ci.yml      # Automated GitHub Actions CI workflow
├── backend/
│   ├── src/
│   │   ├── config/db.js          # MongoDB connection with in-memory fallback
│   │   ├── controllers/          # Todo request logic & error handling
│   │   ├── middleware/           # Rate limiter, errorHandler, notFoundHandler
│   │   ├── models/               # Mongoose Todo schema & repository layer
│   │   ├── routes/               # Express routes (/api/todos, /api/health)
│   │   └── app.js                # Express app definition (isolated for testing)
│   ├── tests/                    # Supertest API test suite
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── server.js                 # HTTP server entry point & graceful shutdown
├── frontend/
│   ├── src/
│   │   ├── components/           # TodoForm, TodoItem, TodoFilters, ProgressBar
│   │   ├── services/             # Axios API service with environment proxy
│   │   ├── App.js                # Main application component
│   │   ├── App.css               # Modern CSS variables, responsive & accessible styles
│   │   └── App.test.js           # React Testing Library unit tests
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml            # Multi-container orchestration (Mongo, Backend, Frontend)
├── package.json                  # Root monorepo developer scripts
└── README.md
```

---

## 🛠️ Quick Start

### 1. Prerequisites
- **Node.js**: v18.x or higher (tested on Node 20 and Node 26)
- **npm**: v9.x or higher
- **MongoDB** *(Optional)*: If MongoDB is running locally, it connects automatically; otherwise, it seamlessly runs with an in-memory store.

### 2. Install All Dependencies
From the repository root:
```bash
npm run install:all
```

### 3. Run Development Servers Concurrently
Start both backend (port 5000) and frontend (port 3000) in one command:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

Run all unit and integration tests across both backend and frontend:
```bash
npm test
```

Or run individually:
```bash
# Run backend tests only
npm run test:backend

# Run frontend tests only
npm run test:frontend
```

---

## 🐳 Docker & Docker Compose

To run the entire stack (MongoDB + Backend + Frontend via Nginx) inside Docker:

```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000/api](http://localhost:5000/api)
- MongoDB: `localhost:27017`

To shut down:
```bash
docker compose down -v
```

---

## 🔌 API Reference

### Base URL: `/api`

| Method | Endpoint | Description | Request Body / Query Params |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status & DB state | — |
| `GET` | `/api/todos` | List todos | `?completed=true\|false&search=keyword&sort=newest\|oldest` |
| `POST` | `/api/todos` | Create a new todo | `{"title": "Task title", "completed": false}` |
| `GET` | `/api/todos/:id` | Get single todo by ID | — |
| `PATCH`| `/api/todos/:id` | Update title or toggle completed | `{"title": "New title", "completed": true}` |
| `DELETE`| `/api/todos/:id` | Delete todo by ID | — |
| `PATCH`| `/api/todos/toggle-all` | Batch toggle all todos | `{"completed": true\|false}` |
| `DELETE`| `/api/todos/completed` | Clear all completed todos | — |

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```ini
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fullstackdb
CORS_ORIGIN=*
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```ini
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
