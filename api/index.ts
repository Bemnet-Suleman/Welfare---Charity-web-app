import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import MemoryStore from 'memorystore';
import multer from 'multer';
import { registerRoutes } from '../server/routes.ts'; 

const app = express();
const SessionStore = MemoryStore(session);

// Setup Multer for Vercel (Note: /tmp is the only writable folder)
const upload = multer({ dest: '/tmp' });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'charity-welfare-default',
    resave: false,
    saveUninitialized: false,
    store: new SessionStore({
      checkPeriod: 86400000,
    }),
    cookie: { secure: true }, // Vercel is always HTTPS
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Register your existing routes
// Since registerRoutes is async and returns a Server, we call it 
// but we let Vercel handle the actual 'listening'.
registerRoutes(app, upload).catch(err => {
    console.error("Failed to register routes:", err);
});

export default app;