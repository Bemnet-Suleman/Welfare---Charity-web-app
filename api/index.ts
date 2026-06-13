import serverless from "serverless-http";
import { createApp } from "./standalone";

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  console.log("[API] getHandler called");
  if (!cachedHandler) {
    try {
      console.log("[API] Creating Express app...");
      const app = await createApp();
      console.log("[API] Express app created successfully");
      
      console.log("[API] Wrapping app with serverless-http...");
      cachedHandler = serverless(app);
      console.log("[API] App wrapped successfully");
    } catch (err) {
      console.error("[API] Error during app creation:", err);
      throw err;
    }
  }
  return cachedHandler;
}

export default async function main(req: any, res: any) {
  try {
    console.log("[API] Request received:", req.method, req.path || req.url);
    const fn = await getHandler();
    console.log("[API] Handler retrieved, invoking...");
    return fn(req, res);
  } catch (err) {
    console.error("[API] Fatal error in handler:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: err instanceof Error ? err.message : String(err)
    });
  }
}
