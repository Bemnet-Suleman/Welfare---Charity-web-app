# Welfare App - Deployment & Setup Guide

This guide covers both **local development** and **production deployment on Vercel**.

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Production Deployment (Vercel)](#production-deployment-vercel)
3. [Database Setup](#database-setup)
4. [Environment Variables](#environment-variables)
5. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (local database or Docker)
- npm or yarn

### Step 1: Clone & Install Dependencies

```bash
git clone <your-repo-url>
cd Welfare---Charity-web-app
npm install
```

### Step 2: Set Up Local Database

#### Option A: Local PostgreSQL (Recommended for Development)

1. **Install PostgreSQL locally**
   - Windows: [Download PostgreSQL](https://www.postgresql.org/download/windows/)
   - macOS: `brew install postgresql`
   - Linux: `sudo apt-get install postgresql`

2. **Create a local database**
   ```bash
   psql -U postgres
   CREATE DATABASE welfare_dev;
   \q
   ```

3. **Create `.env.local` file**
   ```env
   LOCAL_DATABASE_URL=postgresql://postgres:your-password@localhost:5432/welfare_dev
   SESSION_SECRET=generate-a-secure-random-string-here
   NODE_ENV=development
   PORT=5000
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

#### Option B: Docker (Alternative)

```bash
docker run --name welfare-postgres \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:latest

# Then run migrations
npm run db:push
```

### Step 3: Start Development Server

```bash
npm run dev
```

This will start:
- **Backend**: Express server on `http://localhost:5000`
- **Frontend**: Vite dev server on `http://localhost:5173`

The client automatically proxies API calls to the backend during development.

### Step 4: Access the Application

- Frontend: http://localhost:5173
- API: http://localhost:5000/api

---

## Production Deployment (Vercel)

### Step 1: Deploy to Vercel

#### Using Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

#### Or Using GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Connect your GitHub repository
5. Select the project and deploy

### Step 2: Configure Environment Variables

In **Vercel Dashboard** → **Settings** → **Environment Variables**, add:

```
DATABASE_URL=postgresql://your-user:your-password@your-host.postgres.supabase.co:5432/postgres?sslmode=require
SESSION_SECRET=your-secure-random-secret
NODE_ENV=production
```

### Step 3: Verify Deployment

After deployment completes:

1. Visit your Vercel URL
2. Test API endpoints: `https://your-app.vercel.app/api/campaigns`
3. Check logs in Vercel dashboard for errors

---

## Database Setup

### Using Supabase (Recommended for Production)

1. **Create Supabase Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up and create a new project

2. **Get Connection String**
   - In Supabase dashboard → Settings → Database
   - Copy the PostgreSQL connection string
   - Use this as `DATABASE_URL` in Vercel

3. **Run Migrations**
   ```bash
   # Using drizzle-kit
   npm run db:push
   ```

### Using Neon (Alternative)

1. Create account at [neon.tech](https://neon.tech)
2. Create a PostgreSQL database
3. Copy the connection string
4. Use as `DATABASE_URL`

### Using Other Providers

Any PostgreSQL provider works (AWS RDS, Azure Database, etc.):
- Get the connection string
- Set as `DATABASE_URL`
- Run migrations

---

## Environment Variables

### Development (`.env.local`)
```env
# Local Database
LOCAL_DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_dev

# Session Secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-development-secret

# Server Configuration
PORT=5000
NODE_ENV=development
```

### Production (Vercel Environment Variables)
```env
# Live Database
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Session Secret (MUST be different from development)
SESSION_SECRET=your-production-secret

# Server Configuration
NODE_ENV=production
```

### Important Notes
- **Never commit `.env.local`** to Git
- Use `.env.example` as a template for contributors
- Generate `SESSION_SECRET` with: `openssl rand -base64 32`
- Each environment should have unique secrets

---

## Development Workflow

### Running Both Server & Client

```bash
npm run dev
# Starts server on :5000 and client on :5173 with live reload
```

### Running Only Server
```bash
npm run dev:server
# Backend on :5000
```

### Running Only Client
```bash
npm run dev:client
# Frontend on :5173 (proxies to :5000 for API calls)
```

### Building for Production
```bash
npm run build
# Creates optimized build in dist/ folder
```

### Type Checking
```bash
npm run check
# Runs TypeScript type checking
```

---

## How It Works

### Local Development
1. Express server serves the API on `:5000`
2. Vite dev server runs on `:5173`
3. Vite config proxies `/api/*` requests to `:5000`
4. Client makes fetch requests to `/api/...` (proxied by Vite)

### Vercel Production
1. **Build Step**: `npm run build` → Vite builds client to `dist/client`
2. **Serverless Functions**: API requests route to `api/` folder
3. **`api/index.ts`**: Catches all requests and routes to Express app
4. **Express App**: Handles API logic, authentication, database queries
5. **Database**: Direct connection to live PostgreSQL (Supabase/Neon)

### Key Files

- **`api/index.ts`**: Vercel serverless function entry point
- **`server/app.ts`**: Express application factory
- **`server/routes.ts`**: API route definitions
- **`vite.config.ts`**: Dev proxy configuration
- **`vercel.json`**: Vercel build & routing config

---

## Troubleshooting

### "Cannot connect to database" Error

**Problem**: Connection string is invalid or database is down

**Solutions**:
1. Verify connection string in `.env.local` or Vercel
2. Check database is running: `psql -U postgres -h localhost`
3. Verify credentials are correct
4. For Supabase, ensure firewall allows your IP

### "PORT already in use" Error

**Problem**: Port 5000 is already in use

**Solutions**:
```bash
# Kill the process using port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "API calls returning 404" Error

**Problem**: API routes not found

**Solutions**:
1. Ensure backend is running: `npm run dev:server`
2. Check route definitions in `server/routes.ts`
3. Verify Vite proxy config in `vite.config.ts`
4. Check browser console for actual URL being called

### "Build failing on Vercel"

**Problem**: Vercel build command fails

**Solutions**:
1. Check Vercel logs for specific error
2. Run locally: `npm run build`
3. Ensure all environment variables are set
4. Verify `database/` file paths are correct

### "Session/Authentication not working"

**Problem**: Users not staying logged in

**Solutions**:
1. Verify `SESSION_SECRET` is set (must be 32+ chars)
2. Ensure database session table exists (created automatically)
3. Check browser cookies are allowed
4. Verify CORS settings allow credentials

---

## Production Checklist

Before deploying to Vercel:

- [ ] Database is set up on Supabase/Neon/other provider
- [ ] `DATABASE_URL` is configured in Vercel
- [ ] `SESSION_SECRET` is a strong random string (32+ chars)
- [ ] `NODE_ENV` is set to `production`
- [ ] Test locally with production database connection
- [ ] Run `npm run build` and verify no errors
- [ ] Check for any hardcoded URLs or dev-only configs
- [ ] Review `.env.example` doesn't contain secrets

---

## Contributing

When cloning to contribute:

1. `git clone <repo>`
2. `npm install`
3. Create `.env.local` with your local database
4. `npm run db:push` to migrate schema
5. `npm run dev` to start development
6. Make changes and test
7. Push changes to GitHub (we handle Vercel deployments)

---

For more help, check the [main README](./README.md) or create an issue on GitHub.
