# Architecture Guide - Development vs Production

This document explains how the Welfare App works in **development** (local) and **production** (Vercel) environments.

## 📊 Architecture Overview

### Development Flow
```
┌─────────────────────────────────────────────────┐
│         Your Local Computer                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │  React App (Vite Dev Server)            │   │
│  │  Port: 5173                             │   │
│  │  http://localhost:5173                  │   │
│  └─────────────┬───────────────────────────┘   │
│                │                               │
│                │ Proxies API Calls             │
│                │ (/api/*)                      │
│                ▼                               │
│  ┌─────────────────────────────────────────┐   │
│  │  Express Backend                        │   │
│  │  Port: 5000                             │   │
│  │  http://localhost:5000                  │   │
│  └─────────────┬───────────────────────────┘   │
│                │                               │
│                │ SQL Queries                   │
│                ▼                               │
│  ┌─────────────────────────────────────────┐   │
│  │  PostgreSQL Database                    │   │
│  │  Local: localhost:5432                  │   │
│  │  DATABASE_URL from .env.local            │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
└─────────────────────────────────────────────────┘

Key Features:
- Hot reload on code changes
- Live debugging
- Direct database access
- No build step required
- Fast iteration
```

### Production Flow (Vercel)
```
┌────────────────────────────────────────────────────┐
│            Vercel Cloud Platform                   │
├────────────────────────────────────────────────────┤
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │  CDN & Static Files                          │  │
│  │  React App (Built HTML/CSS/JS)              │  │
│  │  Served from dist/public/                   │  │
│  │  https://your-app.vercel.app                │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │                              │
│                     │ API Requests                 │
│                     │ (/api/*)                     │
│                     ▼                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Serverless Functions                        │  │
│  │  api/index.ts → Express Handler              │  │
│  │  Runs on each request                       │  │
│  │  https://your-app.vercel.app/api/*         │  │
│  └──────────────────┬───────────────────────────┘  │
│                     │                              │
│                     │ SQL Queries                  │
│                     ▼                              │
│  ┌──────────────────────────────────────────────┐  │
│  │  Managed PostgreSQL Database                 │  │
│  │  Supabase / Neon / RDS                      │  │
│  │  DATABASE_URL from Vercel Env Vars         │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
└────────────────────────────────────────────────────┘

Key Features:
- No server to manage
- Automatic scaling
- Zero cold start optimization (with serverless-http)
- Global CDN for static files
- Secure environment variables
- Automatic HTTPS
```

---

## 🔄 How Requests Flow

### Local Development Request
1. **User action** in React browser → `/api/campaigns`
2. **Vite dev server** intercepts request (see `vite.config.ts` proxy rules)
3. **Proxies to** `http://localhost:5000/api/campaigns`
4. **Express server** handles request at `server/routes.ts`
5. **Database query** executed with `server/storage.ts`
6. **Response** sent back through proxy to React
7. **React UI** updates with data

### Production Request on Vercel
1. **User action** in React browser → `/api/campaigns`
2. **Vercel CDN** routes to `api/index.ts` serverless function
3. **api/index.ts** creates Express app and wraps it with `serverless-http`
4. **Request** routed through Express to `server/routes.ts`
5. **Database query** executed with `server/storage.ts`
6. **Response** returned through serverless-http wrapper
7. **React UI** updates with data

---

## 🗂️ Key Files Explained

### Development Setup

**`vite.config.ts`**
- Configures Vite dev server
- Sets up proxy to `/api` → `localhost:5000`
- Defines path aliases (`@` → `client/src`)
- Configured to serve from `client` folder

**`server/index.ts`**
- Entry point for local development
- Creates HTTP server from Express app
- Listens on port 5000
- Serves static files in production mode

**`server/app.ts`**
- **Shared** application factory
- Creates Express app with middleware
- Registers all routes
- Handles authentication, sessions, CORS

**`.env.local`** (created from `.env.local.example`)
- Contains local database credentials
- `LOCAL_DATABASE_URL` → local PostgreSQL
- `SESSION_SECRET` → authentication secret
- Only used in local development

### Production Setup

**`api/index.ts`**
- **Vercel serverless** function entry point
- Wraps Express app with `serverless-http`
- Handles all requests to `/api/*`
- Uses `createApp()` from `server/app.ts`

**`vercel.json`**
- Deployment configuration
- Builds: Static files + API function
- Routes: `/api/*` → serverless function, `/` → static HTML
- Ensures SPA routing works

**`.env` (Vercel Dashboard)**
- Production database credentials
- `DATABASE_URL` → live Supabase/Neon
- `SESSION_SECRET` → strong random string
- Secure environment variables

### Shared Code

**`server/app.ts`**
- **Used by both** local dev and Vercel production
- Contains all Express middleware and routes
- Database connection logic
- Authentication setup

**`server/routes.ts`**
- All API endpoints
- Request handling logic
- Response formatting

**`server/storage.ts`**
- Database layer
- Drizzle ORM queries
- Data models

---

## 🚀 Development Workflow

### Starting Local Development

```bash
# Terminal 1: Backend
npm run dev:server
# Listens on http://localhost:5000

# Terminal 2: Frontend
npm run dev:client
# Listens on http://localhost:5173

# OR both at once:
npm run dev
# Uses concurrently to run both
```

### Making Changes

| File | Hot Reload? | Requires Restart? |
|------|------------|------------------|
| `client/src/**` | ✅ Yes (auto) | No |
| `server/app.ts` | ❌ No | Yes (`npm run dev:server`) |
| `server/routes.ts` | ❌ No | Yes (`npm run dev:server`) |
| `.env.local` | ⚠️ Partial | Yes (restart `npm run dev`) |

### Database Changes

```bash
# Schema changes in shared/schema.ts
npm run db:push
# This applies migrations to your local database
```

---

## 📦 Production Build Process

### Build Command
```bash
npm run build
```

### What Happens

1. **Vite builds React app**
   - Bundles all React components
   - Optimizes CSS/JS
   - Output: `dist/public/` (HTML, CSS, JS, assets)

2. **No backend build needed**
   - `server/` code stays as-is
   - TypeScript not compiled (Node handles `.ts` via tsx)
   - Ready for Vercel deployment

3. **Output structure**
   ```
   dist/
   ├── public/              ← Static files served by CDN
   │   ├── index.html
   │   ├── assets/
   │   │   ├── index-*.css
   │   │   └── index-*.js
   │   └── ...
   ```

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Vercel automatically:**
   - Detects `package.json`
   - Runs `npm run build`
   - Deploys `dist/public/` to CDN
   - Creates serverless function from `api/index.ts`

3. **Routes configured** via `vercel.json`:
   - Static files: `dist/public/**`
   - API routes: `api/index.ts`
   - SPA fallback: `index.html` for all unmatched routes

---

## 🔑 Key Differences

| Aspect | Development | Production |
|--------|------------|-----------|
| **Frontend Server** | Vite dev server (port 5173) | Vercel CDN (global) |
| **Backend Server** | Express (port 5000) | Serverless function |
| **Database** | Local PostgreSQL | Supabase/Neon (cloud) |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Environment** | `.env.local` | Vercel dashboard |
| **API Proxy** | Vite proxy | Vercel routing |
| **Session Store** | PostgreSQL | PostgreSQL (cloud) |

---

## ⚙️ Environment Variables

### Local Development (`.env.local`)
```env
LOCAL_DATABASE_URL=postgresql://user:pass@localhost:5432/welfare_dev
SESSION_SECRET=local-secret-any-value
NODE_ENV=development
PORT=5000
```

### Production (Vercel Environment Variables)
```env
DATABASE_URL=postgresql://user:pass@supabase.postgres.databases.supabase.co:5432/postgres?sslmode=require
SESSION_SECRET=strong-random-secret-32-chars
NODE_ENV=production
```

**Important**: `NODE_ENV` automatically set to `production` on Vercel.

---

## 🔐 Security

### Local Development
- `.env.local` is gitignored (see `.gitignore`)
- Local database has no external access
- No secrets exposed in code

### Production (Vercel)
- Secrets stored in Vercel dashboard (encrypted)
- Never commit secrets to GitHub
- Environment variables injected at runtime
- HTTPS enforced automatically

---

## 🐛 Debugging

### Local Development
- **Frontend**: Browser DevTools (F12)
- **Backend**: Console logs in terminal
- **Database**: Connect with pgAdmin or psql
- **Network**: Vite proxy shows API calls

### Production (Vercel)
- **Frontend**: Browser DevTools
- **Backend**: Vercel function logs
- **Database**: Managed dashboard (Supabase/Neon)
- **Errors**: Check Vercel deployment logs

---

## 📚 Files Reference

- [.env.example](.env.example) – Environment template
- [.env.local.example](.env.local.example) – Local dev template
- [vercel.json](vercel.json) – Vercel config
- [vite.config.ts](vite.config.ts) – Vite config
- [api/index.ts](api/index.ts) – Serverless entry
- [server/app.ts](server/app.ts) – Express factory
- [DEPLOYMENT.md](DEPLOYMENT.md) – Deployment guide
- [QUICK_START.md](QUICK_START.md) – Quick setup

---

This architecture allows you to:
- ✅ Develop locally without Vercel
- ✅ Clone on any computer and run
- ✅ Switch between local and cloud databases
- ✅ Deploy to Vercel seamlessly
- ✅ Share code with team members

**Happy coding!** 🎉
