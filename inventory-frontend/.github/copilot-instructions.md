<!-- Copilot / AI agent instructions for the InventoryMS frontend -->
# InventoryMS — Copilot instructions

Purpose: give AI coding agents the minimal, actionable context to be productive in this React frontend.

- **How to run**: uses Create React App. Use these commands from the repo root:
  - `npm install` to install dependencies
  - `npm start` to run the dev server (http://localhost:3000)
  - `npm test` to run tests
  - `npm run build` to create production bundle

- **High-level architecture**:
  - React app bootstrapped with Create React App (`react-scripts`).
  - Routing lives in `src/App.js` and role-based routing is implemented in `src/components/DashboardRouter.jsx`.
  - Authentication context: `src/auth/AuthContext.jsx` provides `useAuth()` which stores JWT in `localStorage` under key `token` and exposes `{ user, login, logout }`.
  - API helpers: lightweight helpers are in `src/services/` (see `src/services/api.js` and `src/services/authService.js`). The `src/api/` folder exists but files are currently empty and may be intended for future axios-based wrappers.
  - Pages live in `src/pages/` and smaller UI pieces in `src/components/`.

- **API & auth patterns (critical)**:
  - Backend base URL: `http://localhost:7028/api` (used in `src/services/*`).
  - Authentication: token stored in `localStorage` as `token`. Many components read `user.token` from `useAuth()` and attach `Authorization: Bearer <token>` to `fetch` requests (see `src/components/AssetManagement.jsx`).
  - JWT decoding: `AuthContext` decodes claims and tolerates ASP.NET long claim names (e.g. `http://schemas.microsoft.com/.../role`). When updating auth logic, preserve these fallback checks.
  - Use `src/services/api.js`'s `apiRequest(endpoint, options)` for common authenticated requests when possible — it attaches token and handles 401 redirect to `/login`.

- **Conventions & patterns found in code**:
  - Network calls use `fetch` (not axios) in many components; expect JSON request/response bodies and `Content-Type: application/json` headers.
  - Role values used by `DashboardRouter.jsx` are string values: `Admin`, `Staff`, `Student`.
  - CRUD components (example: `src/components/AssetManagement.jsx`) fetch lists, then provide create/update/delete via POST/PUT/DELETE to `/api/Assets` and refresh by re-fetching the list.
  - Error handling pattern: components set local `error` state and show inline messages; backend error bodies are often parsed as JSON when response is not OK.
  - Console debugging lines exist (e.g., JWT decoding logs in `AuthContext.jsx` and request logs in `AssetManagement.jsx`). Be conservative when editing these — they help runtime debugging.

- **Files to inspect when working on features/bugs** (common starting points):
  - `src/auth/AuthContext.jsx` — token storage / decoding / login/logout
  - `src/services/api.js` — `apiRequest` helper and `login` helper
  - `src/services/authService.js` — register/login requests
  - `src/components/DashboardRouter.jsx` — role routing
  - `src/components/AssetManagement.jsx` — example of authenticated CRUD and UI patterns
  - `src/pages/Login.jsx` — login form that should call auth helpers

- **When to modify `src/api/` vs `src/services/`**:
  - `src/services/` currently contains working fetch-based helpers used by the app. `src/api/` files are present but empty; do not assume they are wired up. If you introduce a new HTTP client (axios), put adapters in `src/api/` and migrate callers in `src/services/` incrementally.

- **Testing & debugging notes**:
  - Dev server runs on port 3000; backend assumed on port 7028.
  - If you see 401s, token handling lives in `AuthContext` + `src/services/api.js` (which clears localStorage and redirects on 401).
  - Unit tests use `react-scripts test`; there are currently no specialized test configs.

- **Examples** (copy-paste patterns to follow)
  - Authenticated fetch using `useAuth()`:

    const { user } = useAuth();
    fetch('http://localhost:7028/api/Assets', { headers: { Authorization: `Bearer ${user.token}` } })

  - Using shared `apiRequest`:

    const data = await apiRequest('/Assets', { method: 'GET' });

- **Do not change** (unless migrating carefully):
  - The `localStorage` key name `token` (used across multiple files).
  - Role string expectations in `DashboardRouter.jsx`.

If anything in this file is unclear or you want more examples from particular files, tell me which feature or folder to expand and I will iterate.
