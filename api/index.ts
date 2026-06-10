import serverless from "serverless-http";
import { createApp } from "../server/app";

let cachedHandler: ReturnType<typeof serverless> | null = null;

async function getHandler() {
  if (!cachedHandler) {
    const app = await createApp();
    cachedHandler = serverless(app);
  }
  return cachedHandler;
}

export default async function main(req: any, res: any) {
  const fn = await getHandler();
  return fn(req, res);
}
