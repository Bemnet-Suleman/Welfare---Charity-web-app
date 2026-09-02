import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import { getAuthUserId } from "./session";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
process.env.NODE_ENV = process.env.NODE_ENV || "development";

export async function createApp(): Promise<Express> {
  console.log("[App] createApp called");
  
  const app = express();
  app.disable("etag");
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

  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });

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
  app.use(async (req, _res, next) => {
    const userId = getAuthUserId(req);
    if (userId) req.user = await storage.getUser(userId);
    next();
  });

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
