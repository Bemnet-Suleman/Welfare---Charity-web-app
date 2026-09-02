import { createHmac, timingSafeEqual } from "crypto";
import type { Request, Response } from "express";

const COOKIE_NAME = "welfare_auth";
const COOKIE_TTL_SECONDS = 24 * 60 * 60;

function secret() {
  return process.env.SESSION_SECRET || "welfare-secret";
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

export function setAuthCookie(res: Response, userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + COOKIE_TTL_SECONDS * 1000 })).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${process.env.VERCEL ? "; Secure" : ""}`);
}

export function clearAuthCookie(res: Response) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${process.env.VERCEL ? "; Secure" : ""}`);
}

export function getAuthUserId(req: Request) {
  const header = req.headers.cookie || "";
  const value = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value) return undefined;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return undefined;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return undefined;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: string; exp?: number };
    return data.userId && data.exp && data.exp > Date.now() ? data.userId : undefined;
  } catch {
    return undefined;
  }
}