import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import ConnectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import { registerRoutes } from "./routes";
import { storage } from "./storage";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const DEFAULT_DB_URL = "postgresql://postgres:postgres.com@localhost:5432/WELFARE";
const rawDatabaseUrl = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || DEFAULT_DB_URL;
const cleanedDatabaseUrl = rawDatabaseUrl.replace(/"/g, "").trim();
if (process.env.NODE_ENV === "production") {
  const containsPlaceholder = /\[your-password\]|your-?password/i.test(cleanedDatabaseUrl);
  if (containsPlaceholder) {
    console.error(
      "Invalid DATABASE_URL detected: it contains a placeholder password. Update your Vercel DATABASE_URL environment variable with the real Supabase connection string.",
    );
  }
  if (cleanedDatabaseUrl === DEFAULT_DB_URL) {
    console.error(
      "DATABASE_URL is not configured for production. Set the Vercel DATABASE_URL to your Supabase Postgres connection string.",
    );
  }
}
process.env.DATABASE_URL = cleanedDatabaseUrl;

export async function createApp(): Promise<Express> {
  console.log("[App] createApp called");
  
  const app = express();
  console.log("[App] Express instance created");

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );
  console.log("[App] CORS configured");

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  console.log("[App] JSON/URL parsers configured");

  // Use an ephemeral uploads directory when running on serverless platforms (Vercel).
  // Allow overriding with `UPLOAD_DIR` env var for testing/alternative setups.
  const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), "uploads");
  const SERVERLESS_TMP_DIR = path.join(os.tmpdir(), "welfare-uploads");
  const UPLOADS_DIR = (process.env.UPLOAD_DIR || (process.env.VERCEL ? SERVERLESS_TMP_DIR : DEFAULT_UPLOADS_DIR));

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  app.use("/attached_assets", express.static(path.join(process.cwd(), "attached_assets")));
  // Serve uploaded files from the chosen uploads directory (ephemeral on serverless)
  app.use("/uploads", express.static(UPLOADS_DIR));

  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1_000_000_000);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  const upload = multer({ storage: storageConfig });
  const PgSession = ConnectPgSimple(session);

  let sessionStore: any;
  try {
    sessionStore = new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    });
    console.log("Using PostgreSQL session store");
  } catch (err) {
    console.warn("Failed to create PostgreSQL session store, using memory store:", err);
    sessionStore = new session.MemoryStore();
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "welfare-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: "lax",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
      },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }

          const isBlocked = (user as any).blocked || false;
          if (isBlocked) {
            return done(null, false, { message: "This account has been blocked" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error as Error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

  app.use((req, res, next) => {
    const start = Date.now();
    const pathName = req.path;
    let capturedJsonResponse: Record<string, any> | undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (pathName.startsWith("/api")) {
        let logLine = `${req.method} ${pathName} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }
        if (logLine.length > 120) {
          logLine = `${logLine.slice(0, 120)}…`;
        }
        console.log(logLine);
      }
    });

    next();
  });

  console.log("[App] About to register routes...");
  try {
    await registerRoutes(app, upload);
    console.log("[App] Routes registered successfully");
  } catch (err) {
    console.error("[App] Error registering routes:", err);
    throw err;
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  console.log("[App] App creation complete");
  return app;
}
