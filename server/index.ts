import { readFileSync } from "fs";
import { join } from "path";
import path from "path";

try {
  const envPath = join(process.cwd(), ".env");
  const envContent = readFileSync(envPath, "utf8");
  const envLines = envContent.split("\n");

  for (const line of envLines) {
    const [key, ...valueParts] = line.split("=");
    if (key && valueParts.length > 0) {
      const value = valueParts.join("=").trim();
      if (value.startsWith("\"") && value.endsWith("\"")) {
        process.env[key.trim()] = value.slice(1, -1);
      } else {
        process.env[key.trim()] = value;
      }
    }
  }
  console.log("Environment variables loaded from .env file");
} catch (error) {
  console.log("Could not load .env file:", (error as any).message);
}

// Ensure NODE_ENV is set so Express uses the right mode (development vs production)
process.env.NODE_ENV = process.env.NODE_ENV || "development";
console.log("NODE_ENV:", process.env.NODE_ENV);


import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import ConnectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";

console.log("Starting server...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");

const app = express();
console.log("Express app created");

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
console.log("CORS middleware added");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
console.log("Body parsing middleware added");

// Serve static files from attached_assets and uploads
app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Configure multer for file uploads
const storageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storageConfig });

// Session setup
const PgSession = ConnectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "welfare-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, 
      maxAge: 24 * 60 * 60 * 1000, 
    },
  }),
);
console.log("Session middleware added");

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
console.log("Passport middleware added");

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
        // Compare hashed password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Invalid email or password" });
        }
        return done(null, user);
      } catch (error) {
        return done(error);
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
    done(error);
  }
});
console.log("Passport strategies configured");

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log("Registering routes...");
  const server = await registerRoutes(app, upload);
  console.log("Routes registered");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });


  if (process.env.NODE_ENV === "development") {
    console.log("Setting up Vite for development...");
    await setupVite(app, server);
    console.log("Vite setup complete");
  } else {
    try {
      serveStatic(app);
    } catch (err) {
      console.warn(
        "Could not serve static build (likely not built yet). Falling back to Vite middleware.",
        err,
      );
      await setupVite(app, server);
      console.log("Vite setup complete (fallback)");
    }
  }
if (process.env.NODE_ENV !== 'production') {
  app.listen(process.env.PORT || "5000", () => console.log(`Server running on port ${process.env.PORT || "5000"}`));
  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
}


  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port http://localhost:${port}`);
    },
  );
})();
export default app;