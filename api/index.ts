import serverless from "serverless-http";
import { createApp } from "../server/app";

let handler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!handler) {
    const app = await createApp();
    handler = serverless(app);
  }
  return handler;
}

export default async function handler(req: any, res: any) {
  const fn = await getHandler();
  return fn(req, res);
}
