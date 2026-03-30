# Welfare Charity Web App - Complete Documentation

## Project Overview

This is a full-stack web application called "Welfare Charity Web App" designed to connect donors, volunteers, and beneficiaries in charity initiatives. It provides a platform for transparent donations, volunteer management, campaign tracking, and impact reporting. The app aims to make charity work more accessible and accountable.

The project was created by OZONE HIGH SCHOOL GRADE 11 A STUDENTS as part of a charity club initiative.

## Technology Stack

### Frontend Technologies
- **React**: A JavaScript library for building user interfaces. It allows creating reusable UI components and manages the app's state.
- **TypeScript**: A superset of JavaScript that adds static typing. It helps catch errors early and makes code more maintainable.
- **Tailwind CSS**: A utility-first CSS framework. Instead of writing custom CSS, you use pre-defined classes directly in HTML/JSX for styling.
- **Vite**: A build tool and development server. It provides fast hot reloading during development and optimized builds for production.

### Backend Technologies
- **Node.js**: A JavaScript runtime that allows running JavaScript on the server side.
- **Express**: A web framework for Node.js. It simplifies creating server-side applications and APIs.
- **TypeScript**: Used on the backend as well for type safety.

### Database
- **PostgreSQL**: A relational database system. The app uses Drizzle ORM to interact with it.
- **Drizzle ORM**: An Object-Relational Mapping tool that makes database queries type-safe and easier to write.

### Other Tools
- **Drizzle Kit**: A development tool for Drizzle ORM, used for database migrations and schema management.
- **ESLint**: A tool for identifying and fixing code quality issues.
- **Vercel**: A platform for deploying web applications.

## Project Structure

```
Welfare---Charity-web-app/
├── client/                    # Frontend React application
│   ├── index.html            # Main HTML file
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── main.tsx          # Entry point for React app
│   │   ├── index.css         # Global styles
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/           # Basic UI components (buttons, forms, etc.)
│   │   │   └── examples/     # Example components
│   │   ├── pages/            # Page components for routing
│   │   ├── hooks/            # Custom React hooks
│   │   └── lib/              # Utility functions and configurations
├── server/                   # Backend Node.js/Express application
│   ├── index.ts              # Main server file
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Database/storage utilities
│   └── vite.ts               # Vite configuration for server
├── shared/                   # Shared code between client and server
│   └── schema.ts             # Database schema definitions
├── migrations/               # Database migration files
├── attached_assets/          # Additional assets
├── package.json              # Project dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite build configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── drizzle.config.ts         # Drizzle ORM configuration
├── vercel.json               # Vercel deployment configuration
└── README.md                 # Project overview and setup instructions
```

## Database Schema and Migrations

The database uses PostgreSQL with Drizzle ORM. The schema is defined in `shared/schema.ts`.

### Key Tables
- **users**: Stores user information (donors, volunteers, admins)
- **campaigns**: Charity campaigns and events
- **donations**: Donation records
- **volunteers**: Volunteer sign-ups and information
- **stories**: Success stories and impact reports

### Migrations
- `migrations/0001_init.sql`: Initial database setup
- `migrations/0002_seed.sql`: Sample data for testing

## Backend (Server)

The backend is built with Node.js, Express, and TypeScript.

### server/index.ts
This is the main server file that sets up the Express application.

```typescript
import express from 'express';  // Import Express framework
import cors from 'cors';        // Import CORS middleware for cross-origin requests
import helmet from 'helmet';    // Import Helmet for security headers
import morgan from 'morgan';    // Import Morgan for HTTP request logging
import dotenv from 'dotenv';    // Import dotenv for environment variables

dotenv.config();  // Load environment variables from .env file

const app = express();  // Create Express application instance
const PORT = process.env.PORT || 5000;  // Set port from environment or default to 5000

// Middleware setup
app.use(cors());              // Enable CORS for all routes
app.use(helmet());            // Add security headers
app.use(morgan('combined'));  // Log HTTP requests in combined format
app.use(express.json());      // Parse JSON request bodies

// Import and use routes
import routes from './routes';  // Import route definitions
app.use('/api', routes);       // Mount routes under /api path

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);  // Log server start
});
```

### server/routes.ts
Defines API endpoints for the application.

```typescript
import express from 'express';
const router = express.Router();

// Import controllers (not shown in this file, but would handle business logic)

// User routes
router.get('/users', getUsers);      // Get all users
router.post('/users', createUser);   // Create new user
router.get('/users/:id', getUser);   // Get specific user

// Campaign routes
router.get('/campaigns', getCampaigns);        // Get all campaigns
router.post('/campaigns', createCampaign);     // Create new campaign
router.get('/campaigns/:id', getCampaign);     // Get specific campaign

// Donation routes
router.post('/donations', createDonation);     // Process donation

export default router;
```

### server/storage.ts
Handles database connections and queries using Drizzle ORM.

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Create database connection
const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema });

// Export database instance for use in routes/controllers
```

## Frontend (Client)

The frontend is a React application built with TypeScript and styled with Tailwind CSS.

### client/src/main.tsx
Entry point for the React application.

```typescript
import React from 'react';                    // Import React
import ReactDOM from 'react-dom/client';      // Import ReactDOM for rendering
import App from './App.tsx';                  // Import main App component
import './index.css';                         // Import global styles

ReactDOM.createRoot(document.getElementById('root')!).render(  // Render app to DOM
  <React.StrictMode>  // Wrap in StrictMode for development checks
    <App />
  </React.StrictMode>,
);
```

### client/src/App.tsx
Main application component that sets up routing.

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';  // Import routing components
import Home from './pages/Home';              // Import page components
import Login from './pages/Login';
import Register from './pages/Register';
import Donate from './pages/Donate';
import Volunteer from './pages/Volunteer';
import Stories from './pages/Stories';
import Transparency from './pages/Transparency';
import NotFound from './pages/not-found';

function App() {
  return (
    <Router>  {/* Wrap app in Router for navigation */}
      <div className="App">  {/* Main app container */}
        <Routes>  {/* Define routes */}
          <Route path="/" element={<Home />} />                    {/* Home page */}
          <Route path="/login" element={<Login />} />              {/* Login page */}
          <Route path="/register" element={<Register />} />        {/* Registration page */}
          <Route path="/donate" element={<Donate />} />            {/* Donation page */}
          <Route path="/volunteer" element={<Volunteer />} />      {/* Volunteer page */}
          <Route path="/stories" element={<Stories />} />          {/* Stories page */}
          <Route path="/transparency" element={<Transparency />} /> {/* Transparency page */}
          <Route path="*" element={<NotFound />} />                {/* 404 page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
```

### Components

#### Header Component (client/src/components/Header.tsx)
Navigation bar at the top of the page.

```typescript
import React from 'react';
import { Link } from 'react-router-dom';  // Import Link for navigation

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white p-4">  {/* Header with blue background */}
      <nav className="container mx-auto flex justify-between items-center">  {/* Navigation container */}
        <Link to="/" className="text-xl font-bold">Charity App</Link>  {/* Logo/Home link */}
        <ul className="flex space-x-4">  {/* Navigation menu */}
          <li><Link to="/donate" className="hover:underline">Donate</Link></li>      {/* Donate link */}
          <li><Link to="/volunteer" className="hover:underline">Volunteer</Link></li>  {/* Volunteer link */}
          <li><Link to="/stories" className="hover:underline">Stories</Link></li>     {/* Stories link */}
          <li><Link to="/transparency" className="hover:underline">Transparency</Link></li>  {/* Transparency link */}
          <li><Link to="/login" className="hover:underline">Login</Link></li>       {/* Login link */}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
```

#### HeroSection Component
Main banner section on the home page.

```typescript
import React from 'react';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20">  {/* Hero section with gradient background */}
      <div className="container mx-auto text-center">  {/* Center content */}
        <h1 className="text-4xl font-bold mb-4">Make a Difference Today</h1>  {/* Main heading */}
        <p className="text-xl mb-8">Join our community in supporting meaningful causes</p>  {/* Subheading */}
        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">  {/* Call-to-action button */}
          Get Started
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
```

### Pages

#### Home Page (client/src/pages/Home.tsx)
Main landing page combining multiple components.

```typescript
import React from 'react';
import Header from '../components/Header';          // Import header component
import HeroSection from '../components/HeroSection'; // Import hero section
import FeaturedCampaigns from '../components/FeaturedCampaigns';  // Import campaigns
import ImpactStats from '../components/ImpactStats';  // Import stats
import Footer from '../components/Footer';          // Import footer

const Home: React.FC = () => {
  return (
    <div>  {/* Main page container */}
      <Header />              {/* Navigation header */}
      <HeroSection />         {/* Hero banner */}
      <FeaturedCampaigns />   {/* Featured campaigns section */}
      <ImpactStats />         {/* Impact statistics */}
      <Footer />              {/* Footer */}
    </div>
  );
};

export default Home;
```

## Configuration Files

### package.json
Defines project dependencies, scripts, and metadata.

Key scripts:
- `npm run dev`: Start development server with Vite
- `npm run build`: Build production version
- `npm run db:migrate`: Run database migrations

### tsconfig.json
TypeScript configuration for type checking and compilation.

### vite.config.ts
Vite build tool configuration.

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],  // Use React plugin
  server: {
    proxy: {
      '/api': 'http://localhost:5000'  // Proxy API requests to backend
    }
  }
});
```

### tailwind.config.ts
Tailwind CSS configuration for custom styling.

## Getting Started

1. **Install dependencies**: Run `npm install` in the project root
2. **Set up database**: Configure PostgreSQL and run migrations with `npm run db:migrate`
3. **Start development**: Run `npm run dev` to start both frontend and backend
4. **Build for production**: Run `npm run build` then deploy the `dist` folder

## Key Concepts Explained

### React Components
React apps are built from components - reusable pieces of UI. Each component is a function that returns JSX (HTML-like syntax).

### Props and State
- **Props**: Data passed from parent components to child components
- **State**: Data that can change within a component, managed with `useState` hook

### Routing
`react-router-dom` handles navigation between different pages without full page reloads.

### Tailwind CSS Classes
Instead of writing CSS, you apply utility classes directly:
- `bg-blue-600`: Blue background
- `text-white`: White text
- `p-4`: Padding of 1rem on all sides
- `flex`: Display flexbox
- `justify-between`: Space items evenly

### Express Routes
API endpoints that handle HTTP requests (GET, POST, PUT, DELETE) for data operations.

### Database ORM
Drizzle provides a type-safe way to interact with the database using JavaScript/TypeScript instead of raw SQL.

This documentation covers the main aspects of the project. For more detailed explanations of specific components or features, refer to the inline comments in the code files.