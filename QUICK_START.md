# Quick Start Guide for Welfare App

This guide covers the fastest way to get the app running locally or deploy it.

## 🚀 Local Development (5 minutes)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/Welfare---Charity-web-app.git
cd Welfare---Charity-web-app
npm install
```

### 2. Setup Database
```bash
# Create .env.local file
cp .env.local.example .env.local

# Edit .env.local with your database credentials (local PostgreSQL):
# LOCAL_DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_dev
# SESSION_SECRET=any-random-string

# Create local database
createdb welfare_dev

# Run migrations
npm run db:push
```

### 3. Start Development
```bash
npm run dev
```

Open:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 🌐 Deploy to Vercel (10 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Vercel auto-detects the setup

### 3. Add Environment Variables
In **Vercel Dashboard → Settings → Environment Variables**, add:

```
DATABASE_URL=postgresql://user:pass@supabase-host:5432/postgres?sslmode=require
SESSION_SECRET=generate-new-secret-here
```

### 4. Deploy
- Click "Deploy"
- Wait for build to complete
- Visit your live URL

## 📦 What's Included

- ✅ Express backend with serverless support
- ✅ React frontend with Vite
- ✅ PostgreSQL database with Drizzle ORM
- ✅ Passport.js authentication
- ✅ File uploads with Multer
- ✅ Responsive UI with Tailwind CSS
- ✅ Automatic dev proxy (Vite → Express)

## 🔧 Available Scripts

```bash
npm run dev              # Start backend + frontend
npm run dev:server       # Backend only (port 5000)
npm run dev:client       # Frontend only (port 5173)
npm run build           # Production build
npm run check           # TypeScript check
npm run db:push         # Apply migrations
npm start               # Run production build
```

## 🗄️ Database Options

### For Development
- **Local PostgreSQL**: Fastest, no internet needed
- **Docker**: `docker run -e POSTGRES_PASSWORD=pass -p 5432:5432 postgres`

### For Production (Choose One)
- **Supabase**: https://supabase.com (recommended)
- **Neon**: https://neon.tech
- **AWS RDS**: https://aws.amazon.com/rds/

## ⚠️ Common Issues

### "Cannot connect to database"
```bash
# Verify PostgreSQL is running
psql -U postgres

# Check connection string in .env.local
```

### "Port 5000 already in use"
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:5000 | xargs kill -9
```

### Build failing on Vercel
1. Check Vercel logs for specific error
2. Test locally: `npm run build`
3. Verify all env vars are set

## 📚 Full Documentation

- [Detailed Deployment Guide](./DEPLOYMENT.md)
- [Project Documentation](./PROJECT_DOCUMENTATION.md)
- [Design Guidelines](./design_guidelines.md)
- [Main README](./README.md)

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) troubleshooting section
2. Review the [README.md](./README.md)
3. Create an issue on GitHub

---

**You're all set! Happy coding! 🎉**
