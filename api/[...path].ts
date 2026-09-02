import serverless from "serverless-http";
import { createApp } from "./server/app";

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!cachedHandler) {
    cachedHandler = serverless(await createApp());
  }
  return cachedHandler;
}

export default async function handler(req: any, res: any) {
  try {
    return (await getHandler())(req, res);
  } catch (error) {
    console.error("[API] Handler failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
