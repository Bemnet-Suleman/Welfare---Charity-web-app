import { z } from "zod";

export type User = { id: string; username: string; password: string; email: string; fullName: string | null; role: string; avatar: string | null; verified: boolean | null; blocked: boolean | null; verificationToken: string | null; verificationExpiresAt?: Date | null; authUserId?: string | null; createdAt: Date | null };
export type Campaign = { id: string; title: string; description: string; image: string; category: string; goalAmount: string; raisedAmount: string | null; startDate: Date | null; endDate: Date; status: string; urgent: boolean | null; location: string | null; archived: boolean | null; createdAt: Date | null };
export type Donation = { id: string; campaignId: string; donorId: string | null; amount: string; anonymous: boolean | null; message: string | null; paymentMethod: string; transactionId: string | null; createdAt: Date | null };
export type Story = { id: string; title: string; content: string; image: string | null; author: { name: string; role: string; avatar?: string } | null; authorId: string | null; campaignId: string | null; published: boolean | null; createdAt: Date | null };
export type Volunteer = { id: string; userId: string | null; campaignId: string | null; skills: string[] | null; availability: string | null; experience: string | null; status: string; createdAt: Date | null };
export type AidRequest = { id: string; userId: string; title: string; description: string; category: string; urgency: string; status: string; documents: string[] | null; location: string | null; createdAt: Date | null; updatedAt: Date | null };
export type InsertUser = { username: string; password: string; email: string; fullName?: string | null; role?: string; avatar?: string | null };
export type InsertCampaign = { title: string; description: string; image: string; category: string; goalAmount: string; startDate?: Date | null; endDate: Date; status?: string; urgent?: boolean | null; location?: string | null; archived?: boolean | null };
export type InsertDonation = { campaignId: string; donorId?: string | null; amount: string; anonymous?: boolean; message?: string | null; paymentMethod: string; transactionId?: string | null };
export type InsertStory = { title: string; content: string; image?: string | null; author?: Story["author"]; authorId?: string | null; campaignId?: string | null; published?: boolean };
export type InsertVolunteer = { userId?: string | null; campaignId?: string | null; skills?: string[] | null; availability?: string | null; experience?: string | null; status?: string };
export type InsertAidRequest = Omit<AidRequest, "id" | "createdAt" | "updatedAt" | "status">;

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const insertUserSchema = z.object({ username: z.string().min(1), password: z.string().min(1), email: z.string().email(), fullName: z.string().optional().nullable().default(""), role: z.string().optional().default("donor"), avatar: z.string().optional().nullable().default(null) });
export const insertCampaignSchema = z.object({ title: z.string(), description: z.string(), image: z.string(), category: z.string(), goalAmount: z.coerce.string(), startDate: z.coerce.date().optional(), endDate: z.coerce.date(), status: z.string().optional(), urgent: z.boolean().optional(), location: z.string().nullable().optional(), archived: z.boolean().optional() });
export const insertDonationSchema = z.object({ campaignId: z.string(), donorId: z.string().nullable().optional(), amount: z.coerce.string(), anonymous: z.boolean().optional(), message: z.string().nullable().optional(), paymentMethod: z.string(), transactionId: z.string().nullable().optional() });
export const insertStorySchema = z.object({ title: z.string(), content: z.string(), image: z.string().nullable().optional(), author: z.object({ name: z.string(), role: z.string(), avatar: z.string().optional() }).nullable().optional(), authorId: z.string().nullable().optional(), campaignId: z.string().nullable().optional(), published: z.boolean().optional() });
export const insertVolunteerSchema = z.object({ userId: z.string().nullable().optional(), campaignId: z.string().nullable().optional(), skills: z.array(z.string()).nullable().optional(), availability: z.string().nullable().optional(), experience: z.string().nullable().optional(), status: z.string().optional() });
export const insertAidRequestSchema = z.object({ userId: z.string().min(1), title: z.string().min(1).max(255), description: z.string().min(10).max(5000), category: z.enum(["medical", "education", "food", "shelter", "emergency", "other"]), urgency: z.enum(["low", "medium", "high", "emergency"]).default("medium"), location: z.string().min(1).max(255), documents: z.array(z.string()).optional().default([]) });
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "api/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error("SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are required");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });
const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const PAYMENT_PROOF_BUCKET = process.env.PAYMENT_PROOF_BUCKET || "payment-proofs";
type Table = "users" | "campaigns" | "donations" | "stories" | "volunteers" | "aid_requests";
type Model = User | Campaign | Donation | Story | Volunteer | AidRequest;

const columns: Record<string, string> = {
  fullName: "full_name", goalAmount: "goal_amount", raisedAmount: "raised_amount",
  startDate: "start_date", endDate: "end_date", createdAt: "created_at", updatedAt: "updated_at",
  campaignId: "campaign_id", donorId: "donor_id", paymentMethod: "payment_method",
  transactionId: "transaction_id", authorId: "author_id", published: "published", userId: "user_id",
  verificationToken: "verification_token", verificationExpiresAt: "verification_expires_at", authUserId: "auth_user_id",
};
const toDb = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).map(([key, item]) => [columns[key] || key, item]));
const fromDb = <T extends Model>(value: Record<string, any>): T => {
  const result: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) {
    const camel = Object.entries(columns).find(([, dbKey]) => dbKey === key)?.[0] || key;
    result[camel] = ["createdAt", "updatedAt", "startDate", "endDate", "verificationExpiresAt"].includes(camel) && item ? new Date(item) : item;
  }
  return result as T;
};

async function select<T extends Model>(table: Table, query: (builder: any) => any): Promise<T[]> {
  const { data, error } = await query(supabase.from(table).select("*"));
  if (error) throw error;
  return (data || []).map((row: Record<string, any>) => fromDb<T>(row));
}
async function one<T extends Model>(table: Table, query: (builder: any) => any): Promise<T | undefined> {
  return (await select<T>(table, query))[0];
}
async function insert<T extends Model>(table: Table, value: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.from(table).insert(toDb(value)).select().single();
  if (error) throw error;
  return fromDb<T>(data);
}
async function update<T extends Model>(table: Table, id: string, value: Record<string, unknown>): Promise<T | undefined> {
  const { data, error } = await supabase.from(table).update(toDb(value)).eq("id", id).select().single();
  if (error && error.code !== "PGRST116") throw error;
  return data ? fromDb<T>(data) : undefined;
}
async function remove(table: Table, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
const newest = (builder: any) => builder.order("created_at", { ascending: false });

export interface IStorage {
  getUser(id: string): Promise<User | undefined>; getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>; getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>; updateUser(id: string, user: Partial<User>): Promise<User | undefined>; getUsers(limit?: number, offset?: number, search?: string): Promise<User[]>;
  getCampaigns(limit?: number): Promise<Campaign[]>; getAllCampaigns(limit?: number): Promise<Campaign[]>; getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>; updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>; deleteCampaign(id: string): Promise<void>; updateCampaignRaisedAmount(id: string, amount: number): Promise<void>;
  getDonations(limit?: number): Promise<Donation[]>; getDonation(id: string): Promise<Donation | undefined>; getDonationByTransactionId(transactionId: string): Promise<Donation | undefined>; getDonationsByCampaign(campaignId: string): Promise<Donation[]>; getDonationsByDonor(donorId: string): Promise<Donation[]>; createDonation(donation: InsertDonation): Promise<Donation>; getTotalDonationsByCampaign(campaignId: string): Promise<number>;
  getStories(limit?: number, includeUnpublished?: boolean): Promise<Story[]>; getStory(id: string): Promise<Story | undefined>; createStory(story: InsertStory): Promise<Story>; updateStory(id: string, story: Partial<InsertStory>): Promise<Story | undefined>; deleteStory(id: string): Promise<void>;
  getVolunteersByCampaign(campaignId: string): Promise<Volunteer[]>; getVolunteersByUser(userId: string): Promise<Volunteer[]>; getVolunteers(limit?: number): Promise<Volunteer[]>; createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>; updateVolunteerStatus(id: string, status: string): Promise<void>; deleteVolunteer(id: string): Promise<void>;
  getAidRequests(limit?: number): Promise<AidRequest[]>; getAidRequest(id: string): Promise<AidRequest | undefined>; getAidRequestsByUser(userId: string): Promise<AidRequest[]>; createAidRequest(aidRequest: InsertAidRequest): Promise<AidRequest>; updateAidRequestStatus(id: string, status: string): Promise<void>; deleteAidRequest(id: string): Promise<void>;
  getStats(): Promise<{ totalRaised: number; livesImpacted: number; activeVolunteers: number; goalsAchieved: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) { return one<User>("users", (q) => q.eq("id", id)); }
  async getUserByUsername(username: string) { return one<User>("users", (q) => q.eq("username", username)); }
  async getUserByEmail(email: string) { return one<User>("users", (q) => q.eq("email", email)); }
  async getUserByVerificationToken(token: string) { return one<User>("users", (q) => q.eq("verification_token", token)); }
  async createUser(user: InsertUser) { return insert<User>("users", { ...user, verified: false, blocked: false, verificationToken: randomUUID(), verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) }); }
  async updateUser(id: string, user: Partial<User>) { return update<User>("users", id, user); }
  async getUsers(limit = 20, offset = 0, search = "") {
    return select<User>("users", (q) => {
      let query = newest(q);
      const safeSearch = search.replace(/[%,()]/g, " ").trim();
      if (safeSearch) query = query.or(`email.ilike.%${safeSearch}%,username.ilike.%${safeSearch}%,full_name.ilike.%${safeSearch}%`);
      return query.range(offset, offset + limit - 1);
    });
  }

  async getCampaigns(limit = 50) { return select<Campaign>("campaigns", (q) => newest(q).eq("status", "active").eq("archived", false).limit(limit)); }
  async getAllCampaigns(limit = 50) { return select<Campaign>("campaigns", (q) => newest(q).limit(limit)); }
  async getCampaign(id: string) { return one<Campaign>("campaigns", (q) => q.eq("id", id)); }
  async createCampaign(campaign: InsertCampaign) { return insert<Campaign>("campaigns", campaign); }
  async updateCampaign(id: string, campaign: Partial<InsertCampaign>) { return update<Campaign>("campaigns", id, campaign); }
  async deleteCampaign(id: string) { return remove("campaigns", id); }
  async updateCampaignRaisedAmount(id: string, amount: number) {
    const campaign = await this.getCampaign(id); if (!campaign) return;
    const raisedAmount = parseFloat(String(campaign.raisedAmount || 0)) + amount;
    await update("campaigns", id, { raisedAmount, ...(raisedAmount >= parseFloat(String(campaign.goalAmount)) ? { status: "completed" } : {}) });
  }

  async getDonations(limit = 50) { return select<Donation>("donations", (q) => newest(q).limit(limit)); }
  async getDonation(id: string) { return one<Donation>("donations", (q) => q.eq("id", id)); }
  async getDonationByTransactionId(transactionId: string) { return one<Donation>("donations", (q) => q.eq("transaction_id", transactionId)); }
  async getDonationsByCampaign(campaignId: string) { return select<Donation>("donations", (q) => newest(q).eq("campaign_id", campaignId)); }
  async getDonationsByDonor(donorId: string) { return select<Donation>("donations", (q) => newest(q).eq("donor_id", donorId)); }
  async createDonation(donation: InsertDonation) { return insert<Donation>("donations", donation); }
  async getTotalDonationsByCampaign(campaignId: string) { return (await this.getDonationsByCampaign(campaignId)).reduce((sum, donation) => sum + parseFloat(String(donation.amount)), 0); }

  async getStories(limit = 50, includeUnpublished = false) {
    return select<Story>("stories", (q) => {
      const query = newest(q);
      return (includeUnpublished ? query : query.eq("published", true)).limit(limit);
    });
  }
  async getStory(id: string) { return one<Story>("stories", (q) => q.eq("id", id)); }
  async createStory(story: InsertStory) { return insert<Story>("stories", story); }
  async updateStory(id: string, story: Partial<InsertStory>) { return update<Story>("stories", id, story); }
  async deleteStory(id: string) { return remove("stories", id); }

  async getVolunteersByCampaign(campaignId: string) { return select<Volunteer>("volunteers", (q) => newest(q).eq("campaign_id", campaignId).eq("status", "approved")); }
  async getVolunteersByUser(userId: string) { return select<Volunteer>("volunteers", (q) => newest(q).eq("user_id", userId).eq("status", "approved")); }
  async getVolunteers(limit = 50) { return select<Volunteer>("volunteers", (q) => newest(q).limit(limit)); }
  async createVolunteer(volunteer: InsertVolunteer) { return insert<Volunteer>("volunteers", volunteer); }
  async updateVolunteerStatus(id: string, status: string) { await update("volunteers", id, { status }); }
  async deleteVolunteer(id: string) { return remove("volunteers", id); }

  async getAidRequests(limit = 50) { return select<AidRequest>("aid_requests", (q) => newest(q).limit(limit)); }
  async getAidRequest(id: string) { return one<AidRequest>("aid_requests", (q) => q.eq("id", id)); }
  async getAidRequestsByUser(userId: string) { return select<AidRequest>("aid_requests", (q) => newest(q).eq("user_id", userId)); }
  async createAidRequest(aidRequest: InsertAidRequest) { return insert<AidRequest>("aid_requests", aidRequest); }
  async updateAidRequestStatus(id: string, status: string) { await update("aid_requests", id, { status, updatedAt: new Date() }); }
  async deleteAidRequest(id: string) { return remove("aid_requests", id); }

  async getStats() {
    const [campaignList, volunteers] = await Promise.all([this.getAllCampaigns(1000), this.getVolunteers(1000)]);
    const totalRaised = campaignList.reduce((sum, campaign) => sum + parseFloat(String(campaign.raisedAmount || 0)), 0);
    const goalsAchieved = campaignList.length ? campaignList.filter((c) => parseFloat(String(c.raisedAmount || 0)) >= parseFloat(String(c.goalAmount))).length / campaignList.length * 100 : 0;
    return { totalRaised, livesImpacted: totalRaised / 150, activeVolunteers: volunteers.filter((v) => v.status === "approved").length, goalsAchieved };
  }
}

export const storage = new DatabaseStorage();
import { createHmac, timingSafeEqual } from "crypto";
import express, { type Express, type Request, type Response, type NextFunction } from "express";

const COOKIE_NAME = "welfare_auth";
const COOKIE_TTL_SECONDS = 24 * 60 * 60;

function secret() {
  const configured = process.env.SESSION_SECRET;
  if (process.env.VERCEL_ENV === "production" && (!configured || configured.length < 32)) {
    throw new Error("SESSION_SECRET must be configured with at least 32 characters in production");
  }
  return configured || "local-development-only-session-secret";
}

function publicUser(user: User) {
  const { password: _password, verificationToken: _verificationToken, verificationExpiresAt: _verificationExpiresAt, authUserId: _authUserId, ...safe } = user;
  return safe;
}

function isAdmin(user?: User) {
  return !!user && ["admin", "system_admin"].includes(user.role);
}

function publicDonation(donation: Donation) {
  const { donorId: _donorId, transactionId: _transactionId, ...safe } = donation;
  return safe;
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

import fs from "fs";
import os from "os";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

async function initializeTransporter() {
  if (transporter) return transporter;

  // For development: use Ethereal (free testing email service)
  // For production: configure with real SMTP settings from environment variables
  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  } else {
    // Development: use Ethereal for free testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

export async function sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
  const transporter = await initializeTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@welfare-charity.com",
    to: email,
    subject: "Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9fafb;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            h1 {
              color: #1f2937;
              margin: 20px 0;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              padding: 12px 32px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .link-text {
              word-break: break-all;
              color: #2563eb;
              font-size: 12px;
              margin-top: 20px;
              padding: 15px;
              background: #eff6ff;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🤝 Welfare Charity</div>
              </div>
              <h1>Verify Your Email Address</h1>
              <p>Welcome to Welfare Charity! We're excited to have you join our community.</p>
              <p>To complete your registration and start making an impact, please verify your email address by clicking the button below:</p>
              
              <a href="${verificationLink}" class="button">Verify Your Email</a>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-text">${verificationLink}</div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 24 hours. If you didn't create this account, please ignore this email.
              </p>
              
              <div class="footer">
                <p>© 2024 Welfare Charity. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@welfare-charity.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // In development, log the Ethereal preview URL
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Verification email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("📧 Verification email sent to:", email);
  }
}

export async function sendResendVerificationEmail(email: string, verificationLink: string): Promise<void> {
  const transporter = await initializeTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@welfare-charity.com",
    to: email,
    subject: "Resend: Verify Your Email Address",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #f9fafb;
            }
            .card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #2563eb;
            }
            h1 {
              color: #1f2937;
              margin: 20px 0;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              padding: 12px 32px;
              background: #2563eb;
              color: white;
              text-decoration: none;
              border-radius: 4px;
              margin: 20px 0;
              font-weight: 600;
            }
            .button:hover {
              background: #1d4ed8;
            }
            .link-text {
              word-break: break-all;
              color: #2563eb;
              font-size: 12px;
              margin-top: 20px;
              padding: 15px;
              background: #eff6ff;
              border-radius: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="card">
              <div class="header">
                <div class="logo">🤝 Welfare Charity</div>
              </div>
              <h1>Verify Your Email Address</h1>
              <p>You requested a new verification link. Please click the button below to verify your email address:</p>
              
              <a href="${verificationLink}" class="button">Verify Your Email</a>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="link-text">${verificationLink}</div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                This link will expire in 24 hours. If you didn't request this link, please ignore this email.
              </p>
              
              <div class="footer">
                <p>© 2024 Welfare Charity. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@welfare-charity.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);

  // In development, log the Ethereal preview URL
  if (process.env.NODE_ENV !== "production") {
    console.log("📧 Resend verification email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("📧 Resend verification email sent to:", email);
  }
}


type PendingDonation = {
  txRef: string;
  campaignId: string;
  amount: string;
  donorId?: string | null;
  anonymous: boolean;
  message: string;
  donationType: string;
  email: string;
  firstName: string;
  lastName: string;
};

async function savePendingDonation(value: PendingDonation) {
  const { error } = await supabase.from("payment_intents").upsert({
    tx_ref: value.txRef,
    campaign_id: value.campaignId,
    amount: value.amount,
    donor_id: value.donorId,
    anonymous: value.anonymous,
    message: value.message,
    donation_type: value.donationType,
    email: value.email,
    first_name: value.firstName,
    last_name: value.lastName,
    status: "pending",
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: "tx_ref" });
  if (error) throw error;
}

async function getPendingDonation(txRef: string): Promise<PendingDonation | undefined> {
  const { data, error } = await supabase.from("payment_intents").select("*").eq("tx_ref", txRef).maybeSingle();
  if (error) throw error;
  if (!data || data.status !== "pending" || new Date(data.expires_at).getTime() < Date.now()) return undefined;
  return {
    txRef: data.tx_ref,
    campaignId: data.campaign_id,
    amount: String(data.amount),
    donorId: data.donor_id,
    anonymous: data.anonymous,
    message: data.message || "",
    donationType: data.donation_type || "one-time",
    email: data.email,
    firstName: data.first_name || "",
    lastName: data.last_name || "",
  };
}

async function markPendingDonationProcessed(txRef: string) {
  const { error } = await supabase.from("payment_intents").update({ status: "processed" }).eq("tx_ref", txRef);
  if (error) throw error;
}

async function deletePendingDonation(txRef: string) {
  const { error } = await supabase.from("payment_intents").delete().eq("tx_ref", txRef);
  if (error) throw error;
}

function requireAdmin(req: Request, res: Response) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return false;
  }
  if (!isAdmin(req.user)) {
    res.status(403).json({ error: "Forbidden" });
    return false;
  }
  return true;
}

function getRequestOrigin(req: Request) {
  if (process.env.FRONTEND_URL) return process.env.FRONTEND_URL.replace(/\/$/, "");
  if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host") || "localhost"}`.replace(/\/$/, "");
}

export async function registerRoutes(app: Express, upload: any, privateUpload: any, manualPaymentUpload: any, privateUploadsDir: string): Promise<void> {
  app.get("/api/auth/config", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=300");
    res.json({ supabaseUrl, supabaseAnonKey });
  });

  // Auth routes
  app.post("/api/login", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");
    const user = await storage.getUserByEmail(email);

    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({ email, password }).catch((err) => ({ data: null, error: err }));
    if (!authError && authData?.user && authData.user.email_confirmed_at) {
      if (!user || user.blocked) {
        return res.status(401).json({ error: "Invalid email or password" });
      }
      if (!user.verified) await storage.updateUser(user.id, { verified: true, verificationToken: null, verificationExpiresAt: null });
      setAuthCookie(res, user.id);
      return res.json({ user: publicUser({ ...user, verified: true }) });
    }

    if (user && !user.blocked) {
      const validLegacyPassword = await bcrypt.compare(password, user.password);
      if (validLegacyPassword) {
        setAuthCookie(res, user.id);
        return res.json({ user: publicUser(user) });
      }
    }

    return res.status(401).json({ error: authError?.message?.toLowerCase().includes("email not confirmed") ? "Please verify your email before signing in" : "Invalid email or password" });
  });

  app.post("/api/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ message: "Logged out" });
  });

  app.get("/api/me", async (req, res) => {
    if (req.user) {
      const currentUser = req.user as any;
      let isVolunteer = false;

      try {
        if (currentUser.id) {
          const volunteerRecords = await storage.getVolunteersByUser(currentUser.id);
          isVolunteer = volunteerRecords.some((volunteer) => volunteer.status === "approved");
        }
      } catch (error) {
        console.error("Unable to determine volunteer status:", error);
      }

      res.json({ user: { ...publicUser(currentUser), isVolunteer } });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.get("/api/volunteers/me", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const currentUser = req.user as unknown as { id?: string };
    if (!currentUser.id) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const volunteers = await storage.getVolunteersByUser(currentUser.id);
    res.json(volunteers);
  });

  app.post("/api/register", async (req, res) => {
    try {
      const email = String(req.body.email || "").trim().toLowerCase();
      const password = String(req.body.password || "");
      const username = String(req.body.username || email).trim();
      const fullName = String(req.body.fullName || "").trim();
      const role = ["donor", "volunteer", "beneficiary"].includes(String(req.body.role || "donor")) ? String(req.body.role || "donor") : "donor";

      if (!email || !password || password.length < 8) {
        return res.status(400).json({ error: "Provide a valid email and a password with at least 8 characters." });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: "An account already exists for this email." });
      }

      const authRedirect = `${getRequestOrigin(req)}/verify-email`;
      const { data: signupData, error: signupError } = await supabaseAuth.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: authRedirect,
          data: { username, full_name: fullName, role },
        },
      });

      if (signupError) {
        return res.status(400).json({ error: signupError.message });
      }

      const authUser = signupData?.user;
      if (!authUser) {
        return res.status(502).json({ error: "Supabase did not return the new user." });
      }

      const generatedPassword = await bcrypt.hash(password, 10);
      const createdUser = await storage.createUser({ username: username || email, password: generatedPassword, email, fullName, role });
      const user = await storage.updateUser(createdUser.id, { authUserId: authUser.id, verified: Boolean(authUser.email_confirmed_at), verificationToken: null, verificationExpiresAt: null }) || createdUser;
      return res.status(201).json({ user: publicUser(user), message: "Registration successful. Check your email to verify your account." });
    } catch (error) {
      console.error("Profile creation failed", error);
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/verify-email/:token", async (req, res) => {
    return res.status(410).json({ error: "Email verification is handled by Supabase Auth. Use the verification link sent to your email." });
  });

  app.post("/api/resend-verification", async (req, res) => {
    try {
      const email = String(req.body.email || "").trim().toLowerCase();
      if (!email) return res.status(400).json({ error: "Email is required" });
      const redirectUrl = `${getRequestOrigin(req)}/verify-email`;
      const { error: resendError } = await supabaseAuth.auth.resend({ type: "signup", email, options: { emailRedirectTo: redirectUrl } });
      if (resendError) console.warn("Supabase verification resend was not accepted", resendError.message);
      res.json({ message: "If the account exists and is unverified, a verification email has been sent." });
    } catch (error) {
      res.status(500).json({ error: "Failed to resend verification" });
    }
  });

  app.post("/api/users", async (req, res) => {
    return res.status(405).json({ error: "Use /api/register to create an account" });
  });

  app.get("/api/users", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || "10"), 10) || 10, 1), 50);
    const offset = Math.max(Number.parseInt(String(req.query.offset || "0"), 10) || 0, 0);
    const users = await storage.getUsers(limit + 1, offset, String(req.query.search || ""));
    const hasMore = users.length > limit;
    res.json({ users: users.slice(0, limit).map(publicUser), hasMore, nextOffset: offset + limit });
  });

  app.get("/api/users/:id", async (req, res) => {
    if (!req.user || (req.user.id !== req.params.id && !isAdmin(req.user))) return res.status(403).json({ error: "Forbidden" });
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(publicUser(user));
  });

  app.put("/api/users/:id", upload.single('avatar'), async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const currentUser = req.user as unknown as { id?: string; role?: string };
    const isSystemAdmin = currentUser.role === "system_admin";
    const isAdmin = currentUser.role === "admin" || isSystemAdmin;
    const isOwner = currentUser.id === req.params.id;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      const baseSchema = z.object({
        username: z.string().min(3).optional(),
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        avatar: z.string().optional(),
        password: z.string().min(6).optional(),
      }).partial();

      const adminSchema = baseSchema.extend({
        verified: z.boolean().optional(),
        blocked: z.boolean().optional(),
      });

      const systemAdminSchema = adminSchema.extend({
        role: z.string().optional().refine((value) =>
          !value || ["donor", "volunteer", "beneficiary", "admin", "system_admin"].includes(value),
          { message: "Invalid role" },
        ),
      });

      if (req.body.verified !== undefined) {
        req.body.verified = req.body.verified === "true" || req.body.verified === true;
      }
      if (req.body.blocked !== undefined) {
        req.body.blocked = req.body.blocked === "true" || req.body.blocked === true;
      }

      const updateSchema = isSystemAdmin
        ? systemAdminSchema
        : isAdmin
        ? adminSchema
        : baseSchema;

      const updatePayload = updateSchema.parse({
        ...req.body,
        avatar: req.file ? `/uploads/${req.file.filename}` : req.body.avatar,
      });

      if (updatePayload.email && updatePayload.email.toLowerCase() !== req.user.email.toLowerCase()) {
        return res.status(400).json({ error: "Email changes must be completed through Supabase Auth confirmation; this profile form cannot change email yet." });
      }

      if (updatePayload.password) {
        if (!req.user.authUserId) return res.status(409).json({ error: "This legacy account must be linked to Supabase Auth before its password can be changed here." });
        const { error: passwordError } = await supabase.auth.admin.updateUserById(req.user.authUserId!, { password: updatePayload.password });
        if (passwordError) return res.status(400).json({ error: passwordError.message });
      }

      if (updatePayload.password) {
        updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
      }

      const updatedUser = await storage.updateUser(req.params.id, updatePayload);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if ((updatePayload as { verified?: boolean }).verified === true) {
        if (updatedUser.authUserId) {
          const { error: confirmError } = await supabase.auth.admin.updateUserById(updatedUser.authUserId, { email_confirm: true });
          if (confirmError) throw confirmError;
        }
      }

      req.user = updatedUser;

      res.json({ user: publicUser(updatedUser) });
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
  const includeArchived = req.query.includeArchived === "true" && isAdmin(req.user);

  // FIX: If includeArchived is requested, pull from getAllCampaigns(), otherwise fallback to default getCampaigns()
  let campaigns;
  if (includeArchived && typeof storage.getAllCampaigns === "function") {
    campaigns = await storage.getAllCampaigns(limit);
  } else {
    campaigns = await storage.getCampaigns(limit);
  }

  const search = (req.query.search as string) || "";
  const category = (req.query.category as string) || "";

  // Filter out archived campaigns if it wasn't requested (and if the storage layer didn't already filter them)
  if (!includeArchived) {
    campaigns = campaigns.filter(c => !c.archived);
  }

  if (search) {
    const lower = search.toLowerCase();
    campaigns = campaigns.filter(c =>
      c.title.toLowerCase().includes(lower) ||
      c.description.toLowerCase().includes(lower)
    );
  }

  if (category && category !== "all") {
    const lower = category.toLowerCase();
    campaigns = campaigns.filter(c => c.category.toLowerCase().includes(lower));
  }

  // ensure we return a stable response shape even if organizer relation was removed
  const enriched = campaigns.map((c) => ({
    ...c,
    organizer: null,
  }));

  res.json(enriched);
});

  app.get("/api/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    if (campaign.archived && !isAdmin(req.user)) return res.status(404).json({ error: "Campaign not found" });
    // no organizer relationship in revised schema
    res.json({ ...campaign, organizer: null });
  });

  app.post("/api/campaigns", upload.single("image"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const currentUser = req.user as unknown as { role?: string };
    if (!["admin", "system_admin"].includes(currentUser.role || "")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    // Explicitly fallback to string paths or default values
    const imagePath = req.file 
      ? `/uploads/${req.file.filename}` 
      : (typeof req.body.image === 'string' ? req.body.image : "https://images.unsplash.com/photo-1640622656785-4fddbd3b4c6a?w=800&q=80");

    // Construct payload ensuring correct primitive types
    const campaignData = {
      title: String(req.body.title || "").trim(),
      description: String(req.body.description || "").trim(),
      image: imagePath,
      category: String(req.body.category || "Other").trim(),
      goalAmount: String(req.body.goalAmount || "0.00"), 
      startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
      endDate: req.body.endDate ? new Date(req.body.endDate) : new Date(),
      status: "active",
      urgent: false,
      location: req.body.location ? String(req.body.location).trim() : null,
      archived: false,
    };

    // Parse data safely
    const incoming = insertCampaignSchema.parse(campaignData);
    const campaign = await storage.createCampaign(incoming);
    res.json(campaign);
  } catch (error) {
    // This will force the exact Zod issue to show up in your console logs
    console.error("Campaign creation error:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error("Zod Validation Issues:", JSON.stringify((error as any).issues, null, 2));
    }
    res.status(400).json({ 
      error: "Invalid campaign data", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});
  app.put("/api/campaigns/:id", upload.single("image"), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const currentUser = req.user as unknown as { role?: string };
    if (!["admin", "system_admin"].includes(currentUser.role || "")) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    // Prepare clean data object
    const updateData: any = {};

    // Only map fields if they exist in the incoming request body
    if (req.body.title !== undefined) updateData.title = String(req.body.title).trim();
    if (req.body.description !== undefined) updateData.description = String(req.body.description).trim();
    if (req.body.category !== undefined) updateData.category = String(req.body.category).trim();
    if (req.body.goalAmount !== undefined) updateData.goalAmount = String(req.body.goalAmount);
    if (req.body.location !== undefined) updateData.location = req.body.location ? String(req.body.location).trim() : null;

    // Safely parse incoming date strings into actual Date objects
    if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
    if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);

    // Explicitly handle image updates
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else if (typeof req.body.image === 'string' && req.body.image.trim() !== "") {
      updateData.image = req.body.image;
    }

    const updated = await storage.updateCampaign(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    console.error("Campaign update error:", error);
    if (error && typeof error === 'object' && 'issues' in error) {
      console.error("Zod Validation Issues (PUT):", JSON.stringify((error as any).issues, null, 2));
    }
    res.status(400).json({ 
      error: "Invalid campaign data", 
      details: error instanceof Error ? error.message : String(error) 
    });
  }
});

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user as unknown as { role?: string };
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      await storage.deleteCampaign(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  app.post("/api/campaigns/:id/archive", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user as unknown as { role?: string };
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      await storage.updateCampaign(req.params.id, { archived: true });
      res.json({ success: true, message: "Campaign archived" });
    } catch (error) {
      res.status(500).json({ error: "Failed to archive campaign" });
    }
  });

  app.post("/api/campaigns/:id/unarchive", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user as unknown as { role?: string };
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      await storage.updateCampaign(req.params.id, { archived: false });
      res.json({ success: true, message: "Campaign unarchived" });
    } catch (error) {
      res.status(500).json({ error: "Failed to unarchive campaign" });
    }
  });

  app.get("/api/campaigns/:id/donations", async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign || campaign.archived) return res.status(404).json({ error: "Campaign not found" });
    const donations = await storage.getDonationsByCampaign(req.params.id);
    const donationsWithDonor = await Promise.all(
      donations.map(async (donation) => {
        if (!donation.donorId || donation.anonymous) {
          return publicDonation(donation);
        }

        const donorUser = await storage.getUser(donation.donorId);
        if (!donorUser) {
          return publicDonation(donation);
        }

        return {
          ...publicDonation(donation),
          donorName: donorUser.fullName?.trim() || donorUser.username || donation.donorId,
          donorAvatar:
            donorUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser.username || donorUser.id}`,
        };
      }),
    );
    res.json(donationsWithDonor);
  });

  // Donations
  app.post("/api/donations", async (req, res) => {
    return res.status(405).json({ error: "Donations must be completed through the configured payment provider" });
  });

  app.post("/api/payments/manual", manualPaymentUpload.single("proof"), async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Sign in before submitting payment proof" });
      const amount = Number(req.body.amount);
      const campaignId = String(req.body.campaignId || "");
      const paymentMethod = String(req.body.paymentMethod || "");
      if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) return res.status(400).json({ error: "Enter a valid donation amount" });
      if (!["telebirr", "other"].includes(paymentMethod)) return res.status(400).json({ error: "Choose Telebirr or another payment method" });
      if (!req.file) return res.status(400).json({ error: "Upload a screenshot or receipt as proof of payment" });
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign || campaign.archived || campaign.status !== "active") return res.status(404).json({ error: "Campaign is not accepting donations" });
      const extensionByMime: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
      const extension = extensionByMime[req.file.mimetype];
      if (!extension) return res.status(400).json({ error: "Proof must be a JPG, PNG, WebP, or PDF" });
      const proofPath = `${req.user.id}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from(PAYMENT_PROOF_BUCKET).upload(proofPath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
      if (uploadError) throw uploadError;
      const { data, error } = await supabase.from("manual_payment_submissions").insert({
        donor_id: req.user.id,
        campaign_id: campaignId,
        amount: amount.toFixed(2),
        payment_method: paymentMethod,
        payment_reference: String(req.body.paymentReference || "").trim() || null,
        proof_path: proofPath,
        status: "pending",
      }).select("id, status, amount, campaign_id, payment_method, created_at").single();
      if (error) {
        await supabase.storage.from(PAYMENT_PROOF_BUCKET).remove([proofPath]);
        throw error;
      }
      return res.status(201).json({ submission: data, message: "Payment proof submitted. Your donation will be recorded after admin verification." });
    } catch (error) {
      console.error("Manual payment submission failed", error);
      return res.status(500).json({ error: "Unable to submit payment proof" });
    }
  });

  app.get("/api/payments/manual/mine", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const { data, error } = await supabase.from("manual_payment_submissions").select("id, campaign_id, amount, payment_method, payment_reference, status, review_note, donation_id, created_at, reviewed_at").eq("donor_id", req.user.id).order("created_at", { ascending: false }).limit(100);
    if (error) return res.status(500).json({ error: "Unable to load payment submissions" });
    return res.json(data || []);
  });

  app.get("/api/admin/manual-payments", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const status = String(req.query.status || "pending");
    if (!(["pending", "approved", "rejected", "all"].includes(status))) return res.status(400).json({ error: "Invalid status filter" });
    let query = supabase.from("manual_payment_submissions").select("*").order("created_at", { ascending: false }).limit(100);
    if (status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: "Unable to load manual payment reviews" });
    const rows = await Promise.all((data || []).map(async (submission) => {
      const [donor, campaign, signed] = await Promise.all([
        storage.getUser(submission.donor_id),
        storage.getCampaign(submission.campaign_id),
        supabase.storage.from(PAYMENT_PROOF_BUCKET).createSignedUrl(submission.proof_path, 5 * 60),
      ]);
      return {
        id: submission.id,
        donorId: submission.donor_id,
        donorName: donor?.fullName?.trim() || donor?.username || donor?.email || "Donor",
        donorEmail: donor?.email || "",
        campaignId: submission.campaign_id,
        campaignTitle: campaign?.title || "Campaign",
        amount: submission.amount,
        paymentMethod: submission.payment_method,
        paymentReference: submission.payment_reference,
        status: submission.status,
        reviewNote: submission.review_note,
        createdAt: submission.created_at,
        proofUrl: signed.error ? null : signed.data.signedUrl,
      };
    }));
    return res.json(rows);
  });

  app.post("/api/admin/manual-payments/:id/review", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    const decision = req.body.decision === "approve";
    if (!decision && req.body.decision !== "reject") return res.status(400).json({ error: "Decision must be approve or reject" });
    try {
      const { data, error } = await supabase.rpc("review_manual_payment", {
        p_submission_id: req.params.id,
        p_approve: decision,
        p_reviewer_id: req.user!.id,
        p_review_note: typeof req.body.note === "string" ? req.body.note.slice(0, 1000) : null,
      });
      if (error) throw error;
      return res.json({ result: data, message: decision ? "Payment approved and donation recorded" : "Payment proof rejected" });
    } catch (error) {
      console.error("Manual payment review failed", error);
      return res.status(500).json({ error: "Unable to review payment submission" });
    }
  });

  app.post("/api/payments/chapa", async (req, res) => {
    try {
      const {
        campaignId,
        amount,
        email,
        firstName,
        lastName,
        donorId,
        anonymous,
        donationType,
      } = req.body as {
        campaignId: string;
        amount: string | number;
        email: string;
        firstName?: string;
        lastName?: string;
        donorId?: string | null;
        anonymous?: boolean;
        donationType?: string;
      };

      if (!campaignId || !amount || !email) {
        return res.status(400).json({ error: "Missing payment details" });
      }

      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Fix: Added missing closing quote and used type casting for session
      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET;
      if (!chapaSecretKey) {
        return res.status(500).json({ error: "Chapa payment provider is not configured." });
      }

      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 10000000) {
        return res.status(400).json({ error: "Amount must be a positive value within the allowed limit" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
        return res.status(400).json({ error: "A valid email address is required" });
      }
      if (campaign.archived || campaign.status !== "active" || new Date(campaign.endDate).getTime() < Date.now()) {
        return res.status(409).json({ error: "This campaign is not accepting donations" });
      }

      const authenticatedUser = req.user;
      const donorIdForPayment = authenticatedUser?.id ?? null;
      const emailForPayment = authenticatedUser?.email || String(email);

      const txRef = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const rawFrontendUrl = process.env.FRONTEND_URL || req.get("origin") || req.get("referer");
      const frontendBaseUrl = rawFrontendUrl ? new URL(String(rawFrontendUrl)).origin : (process.env.VERCEL ? `https://${process.env.VERCEL_URL}` : `http://localhost:5173`);
      const backendBaseUrl = process.env.BACKEND_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${process.env.PORT || 5000}`);
      if (process.env.VERCEL && (!process.env.BACKEND_URL && !process.env.VERCEL_URL || !process.env.FRONTEND_URL)) {
        return res.status(500).json({ error: "FRONTEND_URL and BACKEND_URL (or VERCEL_URL) must be configured for payments" });
      }
      const callbackUrl = `${backendBaseUrl}/api/payments/chapa/verify?tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;
      const returnUrl = `${frontendBaseUrl}/donate?status=success&tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;

      await savePendingDonation({
        txRef,
        campaignId,
        amount: parsedAmount.toFixed(2),
        donorId: donorIdForPayment,
        anonymous: donorIdForPayment ? Boolean(anonymous) : true,
        message: "",
        donationType: donationType || "one-time",
        email: emailForPayment,
        firstName: firstName || "",
        lastName: lastName || "",
      });
      const chapaResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parsedAmount,
          currency: "ETB",
          email: emailForPayment,
          first_name: firstName || "",
          last_name: lastName || "",
          tx_ref: txRef,
          callback_url: callbackUrl,
          return_url: returnUrl,
        }),
      });

      const chapaData = await chapaResponse.json();
      if (!chapaResponse.ok || !chapaData?.data?.checkout_url) {
        await deletePendingDonation(txRef);
        const message = chapaData?.message || chapaData?.data?.message || "Failed to initialize Chapa checkout.";
        return res.status(502).json({ error: message });
      }

      res.json({ checkoutUrl: chapaData.data.checkout_url, reference: txRef });
    } catch (error) {
      console.error("Chapa payment initialization failed", error);
      res.status(500).json({ error: "Unable to initialize Chapa payment." });
    }
  });

  app.get("/api/payments/chapa/verify", async (req, res) => {
    try {
      const txRef = String(req.query.tx_ref || "");
      if (!txRef) {
        return res.status(400).json({ error: "Missing transaction reference" });
      }

      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET;
      if (!chapaSecretKey) return res.status(503).json({ error: "Chapa payment provider is not configured" });

      const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || verifyData?.data?.status !== "success" || (verifyData?.data?.tx_ref && verifyData.data.tx_ref !== txRef)) {
        const message = verifyData?.message || verifyData?.data?.message || "Payment verification failed.";
        return res.status(400).json({ error: message });
      }

      const existingDonation = await storage.getDonationByTransactionId(txRef);
      if (existingDonation) {
        return res.json({ success: true, donation: existingDonation, alreadyProcessed: true });
      }
      const pendingDonation = await getPendingDonation(txRef);
      if (!pendingDonation) return res.status(410).json({ error: "Payment intent not found or expired" });
      const verifiedAmount = Number(verifyData?.data?.amount);
      if (!Number.isFinite(verifiedAmount) || Math.abs(verifiedAmount - Number(pendingDonation.amount)) > 0.009) {
        return res.status(400).json({ error: "Verified payment amount does not match the donation amount" });
      }
      if (verifyData?.data?.currency && verifyData.data.currency !== "ETB") {
        return res.status(400).json({ error: "Verified payment currency does not match ETB" });
      }

      const { data: createdRows, error: createError } = await supabase.rpc("apply_verified_donation", {
        p_campaign_id: pendingDonation.campaignId,
        p_donor_id: pendingDonation.donorId,
        p_amount: pendingDonation.amount,
        p_anonymous: pendingDonation.anonymous,
        p_message: pendingDonation.message,
        p_payment_method: "chapa",
        p_transaction_id: txRef,
      });
      if (createError) throw createError;
      const donationRow = Array.isArray(createdRows) ? createdRows[0] : createdRows;
      if (!donationRow) throw new Error("Payment was verified but the donation record was not returned");
      const donation = fromDb<Donation>(donationRow);
      await markPendingDonationProcessed(txRef);
      res.json({ success: true, donation });
    } catch (error) {
      console.error("Chapa payment verification failed", error);
      res.status(500).json({ error: "Unable to verify Chapa payment." });
    }
  });

  app.get("/api/donations", async (req, res) => {
    const donorId = req.query.donorId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (donorId) {
      if (!req.user || (req.user.id !== donorId && !isAdmin(req.user))) return res.status(403).json({ error: "Forbidden" });
      const donations = await storage.getDonationsByDonor(donorId);
      const enriched = await Promise.all(
        donations.map(async (d) => {
          if (!d.donorId || d.anonymous) return d;
          const donorUser = await storage.getUser(d.donorId);
          return {
            ...d,
            donorName: donorUser?.fullName?.trim() || donorUser?.username || d.donorId,
            donorAvatar: donorUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser?.username || d.donorId}`,
          };
        }),
      );
      res.json(enriched);
      return;
    }

    const donations = await storage.getDonations(Math.min(Math.max(limit, 1), 100));
    const enriched = await Promise.all(
      donations.map(async (d) => {
        if (!d.donorId || d.anonymous) return d;
        const donorUser = await storage.getUser(d.donorId);
        return {
          ...d,
          donorName: donorUser?.fullName?.trim() || donorUser?.username || d.donorId,
          donorAvatar: donorUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser?.username || d.donorId}`,
        };
      }),
    );
    res.json(enriched.map((donation) => ({
      ...publicDonation(donation),
      ...(donation.anonymous ? {} : { donorName: (donation as any).donorName, donorAvatar: (donation as any).donorAvatar }),
    })));
  });

  app.get("/api/donations/:id", async (req, res) => {
    try {
      const donation = await storage.getDonation(req.params.id);
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }
      if (donation.donorId && donation.donorId !== req.user?.id && !isAdmin(req.user)) {
        return res.status(403).json({ error: "Forbidden" });
      }
      res.json(publicDonation(donation));
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch donation" });
    }
  });

  // Stories
  app.get("/api/stories", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const includeUnpublished = req.query.includeDrafts === "true" && isAdmin(req.user);
    let stories = await storage.getStories(limit, includeUnpublished);

    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const campaignId = (req.query.campaignId as string) || "";
    const publishedOnly = !includeUnpublished && (req.query.published === undefined || req.query.published === "true");

    if (search) {
      const lower = search.toLowerCase();
      stories = stories.filter(s =>
        s.title.toLowerCase().includes(lower) ||
        s.content.toLowerCase().includes(lower)
      );
    }

    if (campaignId) {
      stories = stories.filter((s) => s.campaignId === campaignId);
    }

    if (publishedOnly) {
      stories = stories.filter((s) => Boolean(s.published));
    }

    const enriched = await Promise.all(stories.map(async (story) => {
      const campaign = story.campaignId ? await storage.getCampaign(story.campaignId) : null;
      let author = story.author;
      
      // If authorId exists, fetch the real author data
      if (story.authorId) {
        const authorUser = await storage.getUser(story.authorId);
        if (authorUser) {
          author = {
            name: authorUser.fullName?.trim() || authorUser.username || "Anonymous",
            role: authorUser.role === "beneficiary" ? "Beneficiary" : authorUser.role === "donor" ? "Donor" : "Story Author",
            avatar: authorUser.avatar || undefined,
          };
        }
      }
      
      return {
        ...story,
        author: author ?? {
          name: "Anonymous",
          role: "Beneficiary",
          avatar: undefined,
        },
        category: campaign?.category || "Impact Story",
      };
    }));

    const filteredByCategory = category && category !== "all"
      ? enriched.filter((s) => s.category.toLowerCase().includes(category.toLowerCase()))
      : enriched;

    res.json(filteredByCategory);
  });

  app.get("/api/stories/:id", async (req, res) => {
    const story = await storage.getStory(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    if (!story.published && !isAdmin(req.user)) return res.status(404).json({ error: "Story not found" });

    const campaign = story.campaignId ? await storage.getCampaign(story.campaignId) : null;
    let author = story.author;
    
    // If authorId exists, fetch the real author data
    if (story.authorId) {
      const authorUser = await storage.getUser(story.authorId);
      if (authorUser) {
        author = {
          name: authorUser.fullName?.trim() || authorUser.username || "Anonymous",
          role: authorUser.role === "beneficiary" ? "Beneficiary" : authorUser.role === "donor" ? "Donor" : "Story Author",
          avatar: authorUser.avatar || undefined,
        };
      }
    }

    const enriched = {
      ...story,
      author: author ?? {
        name: "Anonymous",
        role: "Beneficiary",
        avatar: undefined,
      },
      category: campaign?.category || "Impact Story",
    };
    res.json(enriched);
  });

  app.post("/api/stories", upload.single("image"), async (req, res) => {
    try {
      if (!requireAdmin(req, res)) return;
      const storyPayload: any = { ...req.body };
      if (typeof storyPayload.author === "string") {
        try {
          storyPayload.author = JSON.parse(storyPayload.author);
        } catch {
          // keep the raw string if parsing fails
        }
      }
      if (typeof storyPayload.published === "string") {
        storyPayload.published = storyPayload.published === "true";
      }
      if (req.file) {
        storyPayload.image = `/uploads/${req.file.filename}`;
      }

      const storyData = insertStorySchema.parse(storyPayload);
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error) {
      res.status(400).json({ error: "Invalid story data" });
    }
  });

  app.put("/api/stories/:id", upload.single("image"), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user as unknown as { role?: string };
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      const updateData: any = { ...req.body };
      if (typeof updateData.author === "string") {
        try {
          updateData.author = JSON.parse(updateData.author);
        } catch {
          // keep raw author string if parsing fails
        }
      }
      if (typeof updateData.published === "string") {
        updateData.published = updateData.published === "true";
      }
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      } else if (updateData.image === undefined || updateData.image === "") {
        delete updateData.image;
      }

      const updated = await storage.updateStory(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid story data" });
    }
  });

  app.delete("/api/stories/:id", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user as unknown as { role?: string };
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }

      await storage.deleteStory(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete story" });
    }
  });

  // Volunteers
  app.get("/api/campaigns/:id/volunteers", async (req, res) => {
    if (!isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    const volunteers = await storage.getVolunteersByCampaign(req.params.id);
    res.json(volunteers);
  });

  app.get("/api/volunteers", async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || "50"), 10) || 50, 1), 100);
    const listingsOnly = req.query.listingsOnly === "true";
    if (!listingsOnly && !isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    
    const volunteers = await storage.getVolunteers(limit);
    
    const enrichedVolunteers = await Promise.all(
      volunteers.map(async (v) => {
        const campaign = v.campaignId ? await storage.getCampaign(v.campaignId) : null;
        
        // Determine if this row is an Admin-created opportunity listing
        let isOpportunityListing = false;
        if (!v.userId) {
          isOpportunityListing = true;
        } else {
          const user = await storage.getUser(v.userId);
          if (user && ["admin", "system_admin"].includes(user.role || "")) {
            isOpportunityListing = true;
          }
        }

        const applicant = !isOpportunityListing && v.userId ? await storage.getUser(v.userId) : undefined;
        return {
          ...v, // Keeps userId, status, and everything intact for the Admin Dashboard!
          applicantName: applicant?.fullName?.trim() || applicant?.username || null,
          applicantEmail: applicant?.email || null,
          isListing: isOpportunityListing,
          campaign: campaign ? { title: campaign.title, category: campaign.category, image: campaign.image, location: campaign.location } : null,
          campaignTitle: campaign?.title || null,
          campaignCategory: campaign?.category || "General",
        };
      })
    );

    if (listingsOnly) {
      return res.json(enrichedVolunteers.filter(item => item.isListing === true && item.status === "approved").map(({ userId: _userId, status: _status, ...listing }) => listing));
    }

    // Otherwise, return everything unmodified so the Admin Dashboard works perfectly
    res.json(enrichedVolunteers);
  } catch (error) {
    console.error("Error fetching volunteers:", error);
    res.status(500).json({ error: "Unable to fetch volunteer opportunities" });
  }
});

  app.put("/api/volunteers/:id/status", async (req, res) => {
    const currentUser = req.user as unknown as { role?: string } | undefined;
    if (!currentUser || !["admin", "system_admin"].includes(currentUser.role || "")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    try {
      const { status } = req.body;
      if (!status || !["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      await storage.updateVolunteerStatus(req.params.id, status);
      res.json({ message: "Volunteer status updated" });
    } catch (error) {
      res.status(500).json({ error: "Unable to update volunteer status" });
    }
  });

  // Statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (err) {
      console.error("error fetching stats", err);
      res.status(500).json({ error: "Unable to compute statistics" });
    }
  });

app.post("/api/volunteers", async (req, res) => {
    try {
      const currentUser = req.user as unknown as { id: string; role?: string } | undefined;
      if (!currentUser) return res.status(401).json({ error: "Not authenticated" });
      const payload = { ...req.body };

      // 1. Clean payload fields so Drizzle/Zod does not reject structural variations
      if (payload.campaignId === null || payload.campaignId === "" || payload.campaignId === undefined) {
        delete payload.campaignId;
      }

      // 2. Automate user identity mappings and rules based on roles
      if (currentUser) {
        const isAdminUser = ["admin", "system_admin"].includes(currentUser.role || "");
        
        if (isAdminUser) {
          // If the admin is creating an empty opportunity template, assign it to their own ID.
          // This satisfies the database foreign key and prevents "violates foreign key constraint" crashes!
          if (!payload.userId || payload.userId === "") {
            payload.userId = currentUser.id;
          }
          payload.status = payload.status || "approved";
        } else {
          // Regular users or donors applying to campaigns are forced onto their own ID and marked pending
          payload.userId = currentUser.id;
          payload.status = "pending";
        }
      }

      // 3. Test data attributes using your Zod library schema configuration
      const volunteerData = insertVolunteerSchema.parse(payload);
      
      // 4. Save record to local storage engine
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      console.error("Volunteer registry submission error:", error);
      res.status(400).json({ error: "Invalid volunteer data structural specifications" });
    }
  });
  app.delete("/api/volunteers/:id", async (req, res) => {
    try {
      const currentUser = req.user as unknown as { role?: string } | undefined;
      if (!currentUser || !["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await storage.deleteVolunteer(req.params.id);
      res.json({ message: "Volunteer deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Unable to delete volunteer" });
    }
  });

  // Aid Requests
  app.get("/api/aid-requests", async (req, res) => {
    try {
      if (!requireAdmin(req, res)) return;
      const limit = Math.min(Math.max(Number.parseInt(String(req.query.limit || "50"), 10) || 50, 1), 100);
      const aidRequests = await storage.getAidRequests(limit);
      res.json(aidRequests);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch aid requests" });
    }
  });

  app.get("/api/aid-requests/:id", async (req, res) => {
    try {
      const aidRequest = await storage.getAidRequest(req.params.id);
      if (!aidRequest) {
        return res.status(404).json({ error: "Aid request not found" });
      }
      if (!req.user || (req.user.id !== aidRequest.userId && !isAdmin(req.user))) return res.status(403).json({ error: "Forbidden" });
      res.json(aidRequest);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch aid request" });
    }
  });

  app.get("/api/users/:userId/aid-requests", async (req, res) => {
    try {
      if (!req.user || (req.user.id !== req.params.userId && !isAdmin(req.user))) return res.status(403).json({ error: "Forbidden" });
      const aidRequests = await storage.getAidRequestsByUser(req.params.userId);
      res.json(aidRequests);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch user aid requests" });
    }
  });

  app.get("/api/aid-requests/:id/documents/:filename", async (req, res) => {
    if (!req.user) return res.status(401).json({ error: "Not authenticated" });
    const aidRequest = await storage.getAidRequest(req.params.id);
    if (!aidRequest) return res.status(404).json({ error: "Aid request not found" });
    if (aidRequest.userId !== req.user.id && !isAdmin(req.user)) return res.status(403).json({ error: "Forbidden" });
    const filename = path.basename(req.params.filename);
    if (!aidRequest.documents?.includes(`/private-uploads/${filename}`)) return res.status(404).json({ error: "Document not found" });
    return res.sendFile(filename, { root: privateUploadsDir });
  });

  app.post("/api/aid-requests", privateUpload.array("documents"), async (req, res) => {
    try {
      if (!req.user) return res.status(401).json({ error: "Not authenticated" });
      const documents = req.files ? (req.files as Express.Multer.File[]).map(file => `/private-uploads/${file.filename}`) : [];
      const aidRequestData = {
        ...req.body,
        userId: req.user.id,
        documents,
      };
      const parsedData = insertAidRequestSchema.parse(aidRequestData);
      const aidRequest = await storage.createAidRequest(parsedData);
      res.json(aidRequest);
    } catch (error) {
      console.error('Aid request creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(400).json({ error: "Invalid aid request data" });
    }
  });

  app.put("/api/aid-requests/:id/status", async (req, res) => {
    try {
      if (!requireAdmin(req, res)) return;
      const { status } = req.body;
      if (!status || !["pending", "under_review", "approved", "rejected", "fulfilled"].includes(status)) {
        return res.status(400).json({ error: "Status is required" });
      }
      await storage.updateAidRequestStatus(req.params.id, status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Unable to update aid request status" });
    }
  });

  app.delete("/api/aid-requests/:id", async (req, res) => {
    if (!requireAdmin(req, res)) return;
    try {
      const existing = await storage.getAidRequest(req.params.id);
      if (!existing) return res.status(404).json({ error: "Aid request not found" });
      await storage.deleteAidRequest(req.params.id);
      return res.json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Unable to delete aid request" });
    }
  });

}

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
  const PRIVATE_UPLOADS_DIR = (process.env.PRIVATE_UPLOAD_DIR || path.join(os.tmpdir(), "welfare-private-uploads"));

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true });

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
  const privateUpload = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, PRIVATE_UPLOADS_DIR),
      filename: (_req, file, cb) => cb(null, `aid-${Date.now()}-${Math.round(Math.random() * 1_000_000_000)}${path.extname(file.originalname)}`),
    }),
    limits: { files: 5, fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.originalname);
      if (!allowed) return cb(new Error("Unsupported document type"));
      cb(null, true);
    },
  });
  const manualPaymentUpload = multer({
    storage: multer.memoryStorage(),
    limits: { files: 1, fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(file.mimetype);
      if (!allowed) return cb(new Error("Proof must be a JPG, PNG, WebP, or PDF"));
      cb(null, true);
    },
  });
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
    await registerRoutes(app, upload, privateUpload, manualPaymentUpload, PRIVATE_UPLOADS_DIR);
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

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  console.log("[App] App creation complete");
  return app;
}

let appPromise: ReturnType<typeof createApp> | undefined;

function getApp() {
	appPromise ??= createApp();
	return appPromise;
}

export default async function handler(req: any, res: any) {
    try {
        // Ensure req.query exists
        req.query = req.query || {};

        // If Vercel already provided path as array/string, normalize it
        let segments = req.query.path ?? req.query['path'];
        if (typeof segments === 'string') {
            segments = segments.split('/').filter(Boolean).map(decodeURIComponent);
        } else if (!Array.isArray(segments)) {
            // Fallback: parse from req.url after the first "/api/"
            const raw = (req.url || req.originalUrl || '').split('?')[0];
            const idx = raw.indexOf('/api/');
            const after = idx >= 0 ? raw.slice(idx + 5) : raw.replace(/^\/api\/?/, '');
            segments = after === '' ? [] : after.split('/').filter(Boolean).map(decodeURIComponent);
        }
        req.query.path = segments;

        // Optional debug log (remove if noisy)
        console.log('catch-all hit', req.method, req.url, 'segments=', segments);

        const app = await getApp();
        return app(req, res);
    } catch (error) {
        console.error("API request failed", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}
