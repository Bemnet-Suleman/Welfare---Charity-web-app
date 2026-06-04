# Getting Started Checklist ✅

Use this checklist to ensure your environment is properly set up for local development or Vercel deployment.

## 🔧 Local Development Setup

### Prerequisites
- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] PostgreSQL installed and running
- [ ] Git installed (`git --version`)

### Initial Setup (One-time)
- [ ] Clone repository: `git clone <your-repo>`
- [ ] Navigate to directory: `cd Welfare---Charity-web-app`
- [ ] Install dependencies: `npm install`
- [ ] Copy env template: `cp .env.local.example .env.local`
- [ ] **Edit `.env.local`** with your local database credentials
- [ ] Create local database: `createdb welfare_dev`
- [ ] Run migrations: `npm run db:push`

### Start Development
- [ ] Run dev server: `npm run dev`
- [ ] Frontend opens at: http://localhost:5173
- [ ] Backend running at: http://localhost:5000
- [ ] Both should load without errors

### First Test
- [ ] Click around the app
- [ ] Try logging in (sign up first if needed)
- [ ] Check browser console (F12) for errors
- [ ] Check terminal for backend errors

---

## 🌐 Deploy to Vercel

### Before Deployment
- [ ] Commit all changes: `git add .` → `git commit -m "message"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Project builds locally: `npm run build` (no errors)
- [ ] No secrets in code (check `.env.local` is in `.gitignore`)

### Vercel Setup (One-time per project)
- [ ] Go to https://vercel.com
- [ ] Sign up / Log in with GitHub
- [ ] Click "New Project"
- [ ] Select your GitHub repository
- [ ] Vercel should auto-detect Next.js/build settings

### Environment Variables (Critical!)
In Vercel Dashboard → Settings → Environment Variables:

- [ ] Add `DATABASE_URL`
  - Get from Supabase/Neon dashboard
  - Format: `postgresql://user:pass@host:port/database?sslmode=require`
  - Test connection before saving

- [ ] Add `SESSION_SECRET`
  - Generate: `openssl rand -base64 32`
  - Save somewhere safe
  - Must be 32+ characters

- [ ] Add email settings for verification
  - `SMTP_HOST` — your SMTP server hostname
  - `SMTP_PORT` — usually `587` for TLS or `465` for SSL
  - `SMTP_SECURE` — `true` for SSL, `false` for TLS
  - `SMTP_USER` — SMTP login username
  - `SMTP_PASSWORD` — SMTP login password
  - `EMAIL_FROM` — sender address, e.g. `noreply@yourdomain.com`

- [ ] Verify all variables are set and saved

### Deploy
- [ ] Click "Deploy" button
- [ ] Wait for build to complete (5-10 min)
- [ ] Check build logs for errors
- [ ] Visit your deployed URL

### Post-Deploy Testing
- [ ] Load your Vercel app URL
- [ ] Check browser console for errors
- [ ] Try API call: visit `/api/campaigns`
- [ ] Should return JSON (or empty array if no data)
- [ ] Check Vercel function logs if issues

---

## 📝 Database Setup

### Local Development

**Using PostgreSQL directly:**
- [ ] PostgreSQL service running
- [ ] Create database: `createdb welfare_dev`
- [ ] Connection string in `.env.local`:
  ```
  LOCAL_DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_dev
  ```

**Using Docker:**
```bash
docker run --name welfare-postgres \
  -e POSTGRES_PASSWORD=mypassword \
  -p 5432:5432 \
  -d postgres:latest
```
- [ ] Docker container running
- [ ] Update `.env.local` with connection string

### Production Database

Choose ONE:

**Supabase (Recommended):**
- [ ] Create account at https://supabase.com
- [ ] Create new project
- [ ] Get connection string from Settings → Database
- [ ] Save as `DATABASE_URL` in Vercel

**Neon:**
- [ ] Create account at https://neon.tech
- [ ] Create database
- [ ] Copy connection string
- [ ] Save as `DATABASE_URL` in Vercel

**AWS RDS:**
- [ ] Create PostgreSQL instance
- [ ] Get endpoint and credentials
- [ ] Format: `postgresql://user:pass@endpoint:5432/db`
- [ ] Save as `DATABASE_URL` in Vercel

### Database Migrations
- [ ] Local migrations run: `npm run db:push`
- [ ] No schema errors in terminal
- [ ] Tables created in database (verify with pgAdmin/psql)

---

## 🧪 Testing & Validation

### Local Testing
```bash
# Type checking
npm run check

# Build test
npm run build

# Check for build errors
```

- [ ] `npm run check` passes (no TypeScript errors)
- [ ] `npm run build` succeeds (no errors)
- [ ] App loads at http://localhost:5173
- [ ] API responds at http://localhost:5000/api

### Production Testing
- [ ] Vercel build completes (check build logs)
- [ ] App loads at your Vercel URL
- [ ] API responds at `https://your-app.vercel.app/api`
- [ ] No errors in Vercel function logs
- [ ] Database connection works (check for errors)

---

## 📊 Development Workflow

### Daily Development
1. [ ] Start dev server: `npm run dev`
2. [ ] Code your features in `client/src` or `server/`
3. [ ] See changes instantly (frontend)
4. [ ] Restart server for backend changes: `Ctrl+C` → `npm run dev:server`
5. [ ] Commit changes: `git add . && git commit -m "feature"`

### Before Each Push
- [ ] [ ] Run type check: `npm run check` ✅
- [ ] [ ] Test locally: `npm run dev` ✅
- [ ] [ ] Build for production: `npm run build` ✅
- [ ] [ ] Verify no `.env.local` in git: `git status`

### After Push to GitHub
- [ ] Vercel automatically deploys
- [ ] Check Vercel dashboard for build status
- [ ] Verify live URL works
- [ ] Test a few key features

---

## 🆘 Common Setup Issues

### "Cannot connect to database"
```bash
# Verify PostgreSQL is running
psql -U postgres
\q

# Check connection string in .env.local
cat .env.local | grep DATABASE_URL
```
- [ ] Update `.env.local` with correct credentials
- [ ] Restart dev server: `npm run dev`

### "Port 5000 already in use"
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:5000 | xargs kill -9
```
- [ ] Kill process
- [ ] Restart: `npm run dev:server`

### "Build fails on Vercel"
- [ ] Check Vercel build logs (Dashboard → Deployments → Build Logs)
- [ ] Run build locally: `npm run build`
- [ ] Verify all environment variables set
- [ ] Check `.env.example` for missing vars
- [ ] Test database connection

### "API returns 404"
- [ ] Backend running on :5000? `npm run dev:server`
- [ ] Frontend making correct requests? Check browser DevTools Network tab
- [ ] API endpoint exists? Check `server/routes.ts`
- [ ] Vite proxy working? Check `vite.config.ts`

### "Session/Login not working"
- [ ] `SESSION_SECRET` set in `.env.local`?
- [ ] Database table for sessions exists? (auto-created)
- [ ] Cookies enabled in browser?
- [ ] Check browser DevTools → Cookies

---

## 📚 Documentation

- [ ] Read [QUICK_START.md](./QUICK_START.md) (5 min overview)
- [ ] Read [DEPLOYMENT.md](./DEPLOYMENT.md) (full guide)
- [ ] Read [ARCHITECTURE.md](./ARCHITECTURE.md) (how it works)
- [ ] Check [README.md](./README.md) (overview)

---

## 🎉 You're Ready!

Once all checkboxes are complete:
- ✅ Local development environment working
- ✅ Database connected
- ✅ App running on http://localhost:5173
- ✅ Ready to push to GitHub
- ✅ Ready to deploy on Vercel

---

## 📞 Need Help?

1. Check [DEPLOYMENT.md Troubleshooting](./DEPLOYMENT.md#troubleshooting)
2. Check [README.md](./README.md)
3. Review [CONTRIBUTING.md](./.github/CONTRIBUTING.md)
4. Search GitHub Issues
5. Create a new GitHub Issue

---

**Happy coding! 🚀**
