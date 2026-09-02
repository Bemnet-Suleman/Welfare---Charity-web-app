import serverless from "serverless-http";
import { createApp } from "../server/app";

let handlerPromise: Promise<ReturnType<typeof serverless>> | undefined;

function getHandler() {
  handlerPromise ??= createApp().then((app) => serverless(app));
  return handlerPromise;
}

export default async function handler(req: any, res: any) {
  try {
    return (await getHandler())(req, res);
  } catch (error) {
    console.error("API request failed", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
