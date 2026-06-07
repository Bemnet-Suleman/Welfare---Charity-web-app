```text
# Welfare App - Charity and Welfare Portal

A modern, full-stack charity and welfare platform connecting donors, volunteers, and beneficiaries. Built with React, Express, PostgreSQL, and designed for local/school-network execution.

Proudly created by OZONE HIGH SCHOOL GRADE 11 A STUDENTS as part of a charity club initiative.

---

### Important Project Status and Deployment Note
Deployment Roadmap: This platform is currently configured to run locally within the school network. It will be officially deployed online to production once the platform hits Welfare 2.0, which will introduce a fully functional, live production payment processing system alongside the complete implementation of all remaining secondary application features. Until then, it will remain hosted entirely on the school network.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start and Database Setup](#quick-start-and-database-setup)
- [Pre-seeded Test Accounts](#pre-seeded-test-accounts)
- [Project Documentation Links](#project-documentation-links)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- Donation System - Secure, transparent simulated contribution logging.
- Volunteer Management - Match applications to open opportunities seamlessly.
- Impact and Transparency Dashboard - Live filtering for fully funded campaigns (including archived entries).
- Authentication and Authorization - Role-separated user flows with secure local session tracking.
- Multi-language Support - Integrated frontend localization setups (i18n).

---

## Tech Stack
* Frontend: React 18, TypeScript, Vite, TailwindCSS, React Query, Shadcn/ui
* Backend: Node.js, Express, TypeScript, Passport.js
* Database: PostgreSQL, Drizzle ORM

---

## Quick Start and Database Setup

Follow these steps to spin up the local application environment inside the school network.

### Clone and Install Dependencies
```bash
git clone [https://github.com/Bemnet-Suleman/Welfare---Charity-web-app.git](https://github.com/Bemnet-Suleman/Welfare---Charity-web-app.git)
cd Welfare---Charity-web-app
npm install

```

### Configure Your Environment File

Create your local environment properties file from the provided example template:

```bash
cp .env.local.example .env.local

```

Open .env.local and configure your database target variables. The standard default local configuration setup uses the postgres user with postgres.com at port 5432 or default local parameters matching:

```env
LOCAL_DATABASE_URL=postgresql://postgres:postgres.com@localhost:5432/WELFARE
SESSION_SECRET=super-random-32-character-string-for-security

```

### Initialize and Seed Sample Database Data

An explicit database backup scheme containing all core metrics, layout configurations, and pre-seeded mock records is provided at the root folder path inside welfare_eg_db_backup.sql. Access the local PostgreSQL instance to provision the empty database and restore the structured layout schema with all pre-seeded records from the backup file:

```bash
psql -U postgres -c "CREATE DATABASE \"WELFARE\";"
psql -U postgres -d WELFARE -f welfare_eg_db_backup.sql

```

Alternatively, push raw schemas or reset structural layouts via ORM commands if needed:

```bash
npm run db:push

```

### Run the Platform Locally

```bash
npm run dev

```

* Frontend Application Client URL: http://localhost:5173
* Backend Platform API Target Engine: http://localhost:5000/api

---

## Pre-seeded Test Accounts

The layout backup file handles database seeding automatically. Use these built-in mock accounts to test user-facing authorization flows:

| Role | Email Address | Password | Clearances and Notes |
| --- | --- | --- | --- |
| System Admin | sysadmin@example.com | SysAdmin@123 | Top clearance level. Admin management dashboard visibility and can reassign user access roles plus performs all actions available to the charity admin. |
| Charity Admin | null@gmail.com | 1qaz2wsx | Standard management dashboard permissions. Approves campaigns, processes incoming applications. |
| Donor Account A | exampleDonor@gmail.com | qawsedrf | Standard donation platform privileges. |
| Donor Account B | henok_2@yahoo.com | qawsedrf | Standard donation platform privileges. |
| Donor Account C | mehanayim@gmail.com | qawsedrf | Standard donation platform privileges. |
| Donor Account D | teketelewbelete99@gmail.com | qawsedrf | Standard donation platform privileges. |
| Beneficiary | exampleBeneficiary@gmail.com | qawsedrf | Core assistance profiles access. |

Note: These are purely mock test accounts created strictly for verifying regional offline development metrics. Additional user structures can be explored straight through the built-in system administrator views. These accounts are entirely fictional test parameters.

---

## Project Documentation Links

Our technical deep-dives are organized across dedicated tracking documents:

* [Deployment Blueprint](DEPLOYMENT.md) - Comprehensive step-by-step instructions for production environments.
* [System Architecture Guide](ARCHITECTURE.md) - Structural tracking across backend routes, API proxies, and UI layers.
* [Codebase Technical Overview](PROJECT_DOCUMENTATION.md) - Exhaustive file breakdown and active relational schemas maps.
* [Design Layout System](design_guidelines.md) - Color styling parameters, font metrics, and component rules.

---

## Contributing

We welcome contributions to help drive features forward toward our Welfare 2.0 milestone:

* Fork the codebase repository.
* Branch your custom additions using git checkout -b feature/your-feature-name
* Commit localized implementation fixes using git commit -m "Add: feature description"
* Push your branch upstream using git push origin feature/your-feature-name
* Open a pull request for revision.

---

## License

This project is licensed under the MIT License. Dedicated entirely to supporting the growth and operational milestones of the OZONE Charity Club initiative.

```

```