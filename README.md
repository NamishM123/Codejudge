# Personal Finance Tracker - Codejudge

This repository contains a full-stack personal finance tracker web app: a Next.js frontend in `frontend/` and an Express backend in `server/` using SQLite. It's designed to be easy to run locally and deploy to Vercel or Replit.

Features
- Sign up / Log in (JWT)
- Add income and expenses with categories
- Dashboard showing total balance, monthly summaries, and charts

Tech stack
- Frontend: Next.js (React), Chart.js
- Backend: Node.js + Express, SQLite (uses `sqlite3`) or Postgres in production
- Auth: JWT, password hashing with `bcrypt`

Quick start (local)

1. Backend

```bash
cd server
npm install
# run migrations (creates SQLite DB and seeds categories)
npm run migrate
npm run dev
```

The backend will start on `http://localhost:4000`.

2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Configuration
- `server/.env` (optional):
  - `PORT` - server port (default 4000)
  - `JWT_SECRET` - secret for signing JWTs
  - `SQLITE_FILE` - path to SQLite DB file
- `frontend/.env.local` (optional):
  - `NEXT_PUBLIC_API_URL` - points to backend API, e.g. `http://localhost:4000/api`

Deployment
- Vercel: Deploy the `frontend/` folder to Vercel. For the backend, you can deploy `server/` to Vercel as a separate serverless function or use Replit/Render/Heroku. Alternatively, convert the backend to serverless functions under `frontend/api`.
- Replit: Create a Replit project using the whole repo. Start the server with `cd server && npm install && npm run migrate && npm start` and the frontend with `cd frontend && npm install && npm run build && npm start` (or serve the frontend as static if you build it).

Notes
- `better-sqlite3` requires native build tools on some environments. If you run into build errors, you can switch to `sqlite3` package or use a hosted PostgreSQL and adjust `db.js` accordingly.

Troubleshooting
- If `npm install` fails on `better-sqlite3` with compilation errors, use the `sqlite3` package or ensure build tools are installed (Python, make, g++, node-gyp). This project already uses `sqlite3` to avoid common native build problems.

Deploying full-stack
- Vercel: Deploy the `frontend/` directory as a Next.js project. For the backend, you can deploy `server/` to another platform (Render, Railway, Heroku) and set `NEXT_PUBLIC_API_URL` to point to the deployed backend. Alternatively, convert backend endpoints into Next.js API routes under `frontend/pages/api`.
- Replit: Create two repls (or a single monorepo repl). Start the backend with `cd server && npm install && npm run migrate && npm start`. Start the frontend with `cd frontend && npm install && npm run build && npm start`.

Next steps / Improvements
- Add tests, input validation, and stronger error handling
- Add pagination and filtering for transactions
- Add CSV export / import
# CodeJudge Lite

Day 1 scaffold.

## Production notes (Postgres on Vercel)

- This project supports using a hosted Postgres via the `DATABASE_URL` environment variable. If `DATABASE_URL` is set the app will use Postgres; otherwise it falls back to a local SQLite file (good for local dev).
- Recommended Vercel environment variables:
  - `JWT_SECRET` — set to a secure random string
  - `DATABASE_URL` — the Postgres connection string (for production persistence)
  - `DB_SSL` — set to `true` when your Postgres provider requires SSL (e.g. Heroku)

Vercel quick steps
1. Push repo to GitHub.
2. Import repository on Vercel: https://vercel.com/new/clone?repository-url=https://github.com/NamishM123/Codejudge&project-name=codejudge (choose branch `vercel-ready` and Root Directory `frontend`).
3. In Vercel project settings add `JWT_SECRET` and `DATABASE_URL` (if using Postgres). If you set `DATABASE_URL`, the app will run migrations automatically on first request.

CI / GitHub Actions Vercel deploy

- A GitHub Actions workflow is included at `.github/workflows/vercel-deploy.yml` that deploys the `frontend` folder to Vercel when the `vercel-ready` branch is pushed or when manually triggered.
- Required repository secrets (Repository Settings → Secrets → Actions):
  - `VERCEL_TOKEN` — a Vercel personal token (see Vercel Dashboard → Account Settings → Tokens)
  - `VERCEL_ORG_ID` — your Vercel Organization ID
  - `VERCEL_PROJECT_ID` — the Vercel Project ID for this project

To obtain `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID`:
1. Create (or import) the project in Vercel via the import flow.
2. Open the project in Vercel and go to Settings → General → Git; the Project ID is visible there. The Org ID appears in the URL or in your account settings.

After adding those secrets, pushing to `vercel-ready` will trigger the workflow and deploy the `frontend` to Vercel.

