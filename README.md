# ✨ Welfare App - Charity & Welfare Portal

A modern, full-stack charity and welfare platform connecting donors, volunteers, and beneficiaries. Built with React, Express, PostgreSQL, and deployed on Vercel.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Development](#development)
- [Production Deployment](#production-deployment)
- [Project Structure](#project-structure)
- [Contributing](#contributing)

---

## 🌟 Features

- 💝 **Donation System** – Secure and transparent contributions
- 👥 **Volunteer Management** – Sign-up and scheduling for events
- 📊 **Impact Dashboard** – Track funds, projects, and beneficiaries
- 📢 **Campaigns & Events** – Share causes and upcoming charity drives
- 🔒 **Authentication** – Secure login with session management
- 🌍 **Multi-language Support** – i18n ready
- 🎨 **Modern UI** – Beautiful, responsive Tailwind CSS design
- 📱 **Mobile Responsive** – Works on all devices

---

## 🛠️ Tech Stack

### Frontend
- **React 18** – UI framework
- **TypeScript** – Type safety
- **Vite** – Fast build tool
- **TailwindCSS** – Styling
- **React Query** – Data fetching & caching
- **React Hook Form** – Form management
- **Shadcn/ui** – Component library

### Backend
- **Node.js** – Runtime
- **Express** – Web framework
- **TypeScript** – Type safety
- **PostgreSQL** – Database
- **Drizzle ORM** – Database ORM
- **Passport.js** – Authentication
- **Express Session** – Session management

### Deployment
- **Vercel** – Hosting (serverless functions for API)
- **Supabase / Neon** – Managed PostgreSQL
- **GitHub** – Version control

---

## 🚀 Quick Start

### Option 1: Local Development (Recommended)

#### Prerequisites
- Node.js 18+
- PostgreSQL installed locally

#### Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/Welfare---Charity-web-app.git
cd Welfare---Charity-web-app

# 2. Install dependencies
npm install

# 3. Create local environment file
cp .env.local.example .env.local
# Edit .env.local with your local database credentials

# 4. Create local database
createdb welfare_dev

# 5. Run database migrations
npm run db:push

# 6. Start development server (runs both backend + frontend)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

### Option 2: Production on Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
# - Go to vercel.com
# - Import your GitHub repository
# - Add environment variables (DATABASE_URL, SESSION_SECRET)
# - Deploy

# 3. Vercel will automatically build and deploy
```

---

## 📖 Development

### Development Scripts

```bash
# Run both backend and frontend
npm run dev

# Run backend only (port 5000)
npm run dev:server

# Run frontend only (port 5173)
npm run dev:client

# Build for production
npm run build

# Type checking
npm run check

# Database commands
npm run db:push    # Apply migrations
npm run db:init    # Initialize schema
```

### Project Structure

```
Welfare---Charity-web-app/
├── api/                    # Vercel serverless functions
│   └── index.ts           # API gateway for serverless
├── client/                # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/         # Route pages
│   │   ├── components/    # Reusable components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities & API client
│   │   └── main.tsx
│   └── index.html
├── server/                # Express backend
│   ├── app.ts            # Express app setup
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Database layer
│   └── vite.ts           # Vite dev config
├── migrations/            # Database migrations
├── shared/               # Shared types/schemas
│   └── schema.ts         # Zod schemas
├── vite.config.ts        # Vite configuration
├── vercel.json           # Vercel build config
├── .env.example          # Environment template
├── DEPLOYMENT.md         # Detailed deployment guide
└── README.md             # This file
```

### Environment Variables

#### Local Development (`.env.local`)
```env
LOCAL_DATABASE_URL=postgresql://postgres:password@localhost:5432/welfare_dev
SESSION_SECRET=your-local-secret-here
PORT=5000
NODE_ENV=development
```

#### Production (Vercel Environment Variables)
```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
SESSION_SECRET=your-production-secret-here
NODE_ENV=production
```

**Important**: Never commit `.env.local` to Git!

---

## 🌐 Production Deployment

### Using Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Configure build settings (defaults work fine)

3. **Add Environment Variables**
   - In Vercel Dashboard → Settings → Environment Variables
   - Add `DATABASE_URL` (from Supabase/Neon)
   - Add `SESSION_SECRET` (strong random string)

4. **Deploy**
   - Vercel automatically deploys on push to main
   - Check deployment status in Vercel Dashboard

### Database Setup for Production

#### Using Supabase (Recommended)
1. Go to https://supabase.com
2. Create a new project
3. Get PostgreSQL connection string from Settings
4. Set as `DATABASE_URL` in Vercel

#### Using Neon
1. Go to https://neon.tech
2. Create PostgreSQL database
3. Copy connection string
4. Set as `DATABASE_URL` in Vercel

### Testing Production Build Locally

```bash
# Build for production
npm run build

# Preview the production build
npm run start
```

---

## 🔑 Key Features Explained

### Authentication
- Passport.js for local strategy (email/password)
- Express sessions stored in PostgreSQL
- Automatic session handling

### API Routes
All API endpoints are prefixed with `/api`:
- `/api/campaigns` – Campaign management
- `/api/donations` – Donation tracking
- `/api/volunteers` – Volunteer management
- `/api/stories` – Charity stories
- `/api/auth` – Authentication endpoints

### Database
- PostgreSQL with Drizzle ORM
- Type-safe schema definitions
- Automatic migrations with Drizzle Kit
- Session storage in database

### File Uploads
- Multipart form data handling with Multer
- Files stored locally (`/uploads` directory)
- Public assets in `/attached_assets`

---

## 🐛 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Windows
psql -U postgres
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Or on Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Vite Dev Server Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build Errors on Vercel
1. Check Vercel build logs
2. Run build locally: `npm run build`
3. Ensure all environment variables are set
4. Check for hardcoded local paths

---

## 📚 Additional Resources

- [Deployment Guide](./DEPLOYMENT.md) – Detailed deployment instructions
- [Design Guidelines](./design_guidelines.md) – UI/UX standards
- [Project Documentation](./PROJECT_DOCUMENTATION.md) – Full technical docs

---

## 🤝 Contributing

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/Welfare---Charity-web-app.git
   cd Welfare---Charity-web-app
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Install dependencies and setup**
   ```bash
   npm install
   cp .env.local.example .env.local
   # Configure .env.local
   npm run db:push
   npm run dev
   ```

4. **Make your changes**
   - Follow existing code style
   - Add tests if applicable
   - Update documentation

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add: your feature description"
   git push origin feature/your-feature-name
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Reference any related issues

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 💬 Support

For questions or issues:
- Create an issue on GitHub
- Check existing issues and discussions
- Review [Troubleshooting](#troubleshooting) section

---

**Built with ❤️ for the charity community**
Clone the repo:

bash
git clone https://github.com/your-username/Welfare---Charity-web-app.git
Navigate to the project:

bash
cd Welfare---Charity-web-app
Install dependencies:

bash
npm install
Prepare environment variables:

bash
cp .env.example .env

Then edit `.env` with your local or live database connection.

Run locally:

bash
npm run dev

Environment variables
- `LOCAL_DATABASE_URL` — local Postgres connection string for development
- `DATABASE_URL` — live database URL (Supabase, Neon, or another Postgres-hosted database)
- `SESSION_SECRET` — secret string for session encryption
- `CHAPA_SECRET_KEY` — optional payment provider key
- `PORT` — optional server port (default `5000`)

🤝 Contributing
We welcome contributions!

Fork the repo

Create a feature branch

Submit a pull request

🌍 Vision
This project is built to empower communities through transparency, accessibility, and collective action. Together, we can make welfare initiatives more impactful and inclusive.

💡 Dedicated to the Charity Club — a platform built exclusively to support its mission and values.
