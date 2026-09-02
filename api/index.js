// serverless-entry.ts
import serverless from "serverless-http";

// server/app.ts
import dotenv2 from "dotenv";
import fs from "fs";
import path2 from "path";
import os from "os";
import express from "express";
import cors from "cors";
import multer from "multer";

// server/routes.ts
import { randomUUID as randomUUID2 } from "crypto";

// server/storage.ts
import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "api/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required");
}
var supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
var columns = {
  fullName: "full_name",
  goalAmount: "goal_amount",
  raisedAmount: "raised_amount",
  startDate: "start_date",
  endDate: "end_date",
  createdAt: "created_at",
  updatedAt: "updated_at",
  campaignId: "campaign_id",
  donorId: "donor_id",
  paymentMethod: "payment_method",
  transactionId: "transaction_id",
  authorId: "author_id",
  published: "published",
  userId: "user_id",
  verificationToken: "verification_token"
};
var toDb = (value) => Object.fromEntries(Object.entries(value).map(([key, item]) => [columns[key] || key, item]));
var fromDb = (value) => {
  const result = {};
  for (const [key, item] of Object.entries(value)) {
    const camel = Object.entries(columns).find(([, dbKey]) => dbKey === key)?.[0] || key;
    result[camel] = ["createdAt", "updatedAt", "startDate", "endDate"].includes(camel) && item ? new Date(item) : item;
  }
  return result;
};
async function select(table, query) {
  const { data, error } = await query(supabase.from(table).select("*"));
  if (error) throw error;
  return (data || []).map((row) => fromDb(row));
}
async function one(table, query) {
  return (await select(table, query))[0];
}
async function insert(table, value) {
  const { data, error } = await supabase.from(table).insert(toDb(value)).select().single();
  if (error) throw error;
  return fromDb(data);
}
async function update(table, id, value) {
  const { data, error } = await supabase.from(table).update(toDb(value)).eq("id", id).select().single();
  if (error && error.code !== "PGRST116") throw error;
  return data ? fromDb(data) : void 0;
}
async function remove(table, id) {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw error;
}
var newest = (builder) => builder.order("created_at", { ascending: false });
var DatabaseStorage = class {
  async getUser(id) {
    return one("users", (q) => q.eq("id", id));
  }
  async getUserByUsername(username) {
    return one("users", (q) => q.eq("username", username));
  }
  async getUserByEmail(email) {
    return one("users", (q) => q.eq("email", email));
  }
  async getUserByVerificationToken(token) {
    return one("users", (q) => q.eq("verification_token", token));
  }
  async createUser(user) {
    return insert("users", { ...user, verified: false, blocked: false, verificationToken: randomUUID() });
  }
  async updateUser(id, user) {
    return update("users", id, user);
  }
  async getUsers(limit = 100) {
    return select("users", (q) => q.limit(limit));
  }
  async getCampaigns(limit = 50) {
    return select("campaigns", (q) => newest(q).eq("status", "active").eq("archived", false).limit(limit));
  }
  async getAllCampaigns(limit = 50) {
    return select("campaigns", (q) => newest(q).limit(limit));
  }
  async getCampaign(id) {
    return one("campaigns", (q) => q.eq("id", id));
  }
  async createCampaign(campaign) {
    return insert("campaigns", campaign);
  }
  async updateCampaign(id, campaign) {
    return update("campaigns", id, campaign);
  }
  async deleteCampaign(id) {
    return remove("campaigns", id);
  }
  async updateCampaignRaisedAmount(id, amount) {
    const campaign = await this.getCampaign(id);
    if (!campaign) return;
    const raisedAmount = parseFloat(String(campaign.raisedAmount || 0)) + amount;
    await update("campaigns", id, { raisedAmount, ...raisedAmount >= parseFloat(String(campaign.goalAmount)) ? { status: "completed" } : {} });
  }
  async getDonations(limit = 50) {
    return select("donations", (q) => newest(q).limit(limit));
  }
  async getDonation(id) {
    return one("donations", (q) => q.eq("id", id));
  }
  async getDonationByTransactionId(transactionId) {
    return one("donations", (q) => q.eq("transaction_id", transactionId));
  }
  async getDonationsByCampaign(campaignId) {
    return select("donations", (q) => newest(q).eq("campaign_id", campaignId));
  }
  async getDonationsByDonor(donorId) {
    return select("donations", (q) => newest(q).eq("donor_id", donorId));
  }
  async createDonation(donation) {
    return insert("donations", donation);
  }
  async getTotalDonationsByCampaign(campaignId) {
    return (await this.getDonationsByCampaign(campaignId)).reduce((sum, donation) => sum + parseFloat(String(donation.amount)), 0);
  }
  async getStories(limit = 50) {
    return select("stories", (q) => newest(q).eq("published", true).limit(limit));
  }
  async getStory(id) {
    return one("stories", (q) => q.eq("id", id));
  }
  async createStory(story) {
    return insert("stories", story);
  }
  async updateStory(id, story) {
    return update("stories", id, story);
  }
  async deleteStory(id) {
    return remove("stories", id);
  }
  async getVolunteersByCampaign(campaignId) {
    return select("volunteers", (q) => newest(q).eq("campaign_id", campaignId).eq("status", "approved"));
  }
  async getVolunteersByUser(userId) {
    return select("volunteers", (q) => newest(q).eq("user_id", userId).eq("status", "approved"));
  }
  async getVolunteers(limit = 50) {
    return select("volunteers", (q) => newest(q).limit(limit));
  }
  async createVolunteer(volunteer) {
    return insert("volunteers", volunteer);
  }
  async updateVolunteerStatus(id, status) {
    await update("volunteers", id, { status });
  }
  async deleteVolunteer(id) {
    return remove("volunteers", id);
  }
  async getAidRequests(limit = 50) {
    return select("aid_requests", (q) => newest(q).limit(limit));
  }
  async getAidRequest(id) {
    return one("aid_requests", (q) => q.eq("id", id));
  }
  async getAidRequestsByUser(userId) {
    return select("aid_requests", (q) => newest(q).eq("user_id", userId));
  }
  async createAidRequest(aidRequest) {
    return insert("aid_requests", aidRequest);
  }
  async updateAidRequestStatus(id, status) {
    await update("aid_requests", id, { status, updatedAt: /* @__PURE__ */ new Date() });
  }
  async deleteAidRequest(id) {
    return remove("aid_requests", id);
  }
  async getStats() {
    const [campaignList, volunteers] = await Promise.all([this.getAllCampaigns(1e3), this.getVolunteers(1e3)]);
    const totalRaised = campaignList.reduce((sum, campaign) => sum + parseFloat(String(campaign.raisedAmount || 0)), 0);
    const goalsAchieved = campaignList.length ? campaignList.filter((c) => parseFloat(String(c.raisedAmount || 0)) >= parseFloat(String(c.goalAmount))).length / campaignList.length * 100 : 0;
    return { totalRaised, livesImpacted: totalRaised / 150, activeVolunteers: volunteers.filter((v) => v.status === "approved").length, goalsAchieved };
  }
};
var storage = new DatabaseStorage();

// shared/schema.ts
import { z } from "zod";
var insertUserSchema = z.object({ username: z.string().min(1), password: z.string().min(1), email: z.string().email(), fullName: z.string().optional().nullable().default(""), role: z.string().optional().default("donor"), avatar: z.string().optional().nullable().default(null) });
var insertCampaignSchema = z.object({ title: z.string(), description: z.string(), image: z.string(), category: z.string(), goalAmount: z.coerce.string(), startDate: z.coerce.date().optional(), endDate: z.coerce.date(), status: z.string().optional(), urgent: z.boolean().optional(), location: z.string().nullable().optional(), archived: z.boolean().optional() });
var insertDonationSchema = z.object({ campaignId: z.string(), donorId: z.string().nullable().optional(), amount: z.coerce.string(), anonymous: z.boolean().optional(), message: z.string().nullable().optional(), paymentMethod: z.string(), transactionId: z.string().nullable().optional() });
var insertStorySchema = z.object({ title: z.string(), content: z.string(), image: z.string().nullable().optional(), author: z.object({ name: z.string(), role: z.string(), avatar: z.string().optional() }).nullable().optional(), authorId: z.string().nullable().optional(), campaignId: z.string().nullable().optional(), published: z.boolean().optional() });
var insertVolunteerSchema = z.object({ userId: z.string().nullable().optional(), campaignId: z.string().nullable().optional(), skills: z.array(z.string()).nullable().optional(), availability: z.string().nullable().optional(), experience: z.string().nullable().optional(), status: z.string().optional() });
var insertAidRequestSchema = z.object({ userId: z.string().min(1), title: z.string().min(1).max(255), description: z.string().min(10).max(5e3), category: z.enum(["medical", "education", "food", "shelter", "emergency", "other"]), urgency: z.enum(["low", "medium", "high", "emergency"]).default("medium"), location: z.string().min(1).max(255), documents: z.array(z.string()).optional().default([]) });

// server/routes.ts
import { z as z2 } from "zod";
import bcrypt from "bcryptjs";

// server/email.ts
import nodemailer from "nodemailer";
var transporter = null;
async function initializeTransporter() {
  if (transporter) return transporter;
  if (process.env.NODE_ENV === "production") {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }
  return transporter;
}
async function sendVerificationEmail(email, verificationLink) {
  const transporter2 = await initializeTransporter();
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
                <div class="logo">\u{1F91D} Welfare Charity</div>
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
                <p>\xA9 2024 Welfare Charity. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@welfare-charity.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  };
  const info = await transporter2.sendMail(mailOptions);
  if (process.env.NODE_ENV !== "production") {
    console.log("\u{1F4E7} Verification email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("\u{1F4E7} Verification email sent to:", email);
  }
}
async function sendResendVerificationEmail(email, verificationLink) {
  const transporter2 = await initializeTransporter();
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
                <div class="logo">\u{1F91D} Welfare Charity</div>
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
                <p>\xA9 2024 Welfare Charity. All rights reserved.</p>
                <p>If you have any questions, please contact us at support@welfare-charity.com</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  };
  const info = await transporter2.sendMail(mailOptions);
  if (process.env.NODE_ENV !== "production") {
    console.log("\u{1F4E7} Resend verification email sent!");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
  } else {
    console.log("\u{1F4E7} Resend verification email sent to:", email);
  }
}

// server/session.ts
import { createHmac, timingSafeEqual } from "crypto";
var COOKIE_NAME = "welfare_auth";
var COOKIE_TTL_SECONDS = 24 * 60 * 60;
function secret() {
  return process.env.SESSION_SECRET || "welfare-secret";
}
function sign(value) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
function setAuthCookie(res, userId) {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + COOKIE_TTL_SECONDS * 1e3 })).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=${value}; Max-Age=${COOKIE_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Lax${process.env.VERCEL ? "; Secure" : ""}`);
}
function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", `${COOKIE_NAME}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax${process.env.VERCEL ? "; Secure" : ""}`);
}
function getAuthUserId(req) {
  const header = req.headers.cookie || "";
  const value = header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value) return void 0;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return void 0;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return void 0;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.userId && data.exp && data.exp > Date.now() ? data.userId : void 0;
  } catch {
    return void 0;
  }
}

// server/routes.ts
var pendingDonations = {};
async function registerRoutes(app, upload) {
  app.post("/api/auth/login", async (req, res) => {
    const user = await storage.getUserByEmail(String(req.body.email || ""));
    if (!user || user.blocked || !await bcrypt.compare(String(req.body.password || ""), user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    setAuthCookie(res, user.id);
    return res.json({ user });
  });
  app.post("/api/auth/logout", (req, res) => {
    clearAuthCookie(res);
    res.json({ message: "Logged out" });
  });
  app.get("/api/auth/me", async (req, res) => {
    if (req.user) {
      const currentUser = req.user;
      let isVolunteer = false;
      try {
        if (currentUser.id) {
          const volunteerRecords = await storage.getVolunteersByUser(currentUser.id);
          isVolunteer = volunteerRecords.some((volunteer) => volunteer.status === "approved");
        }
      } catch (error) {
        console.error("Unable to determine volunteer status:", error);
      }
      res.json({ user: { ...currentUser, isVolunteer } });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });
  app.get("/api/volunteers/me", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const currentUser = req.user;
    if (!currentUser.id) {
      return res.status(400).json({ error: "Invalid user" });
    }
    const volunteers = await storage.getVolunteersByUser(currentUser.id);
    res.json(volunteers);
  });
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const allowedRoles = ["donor", "volunteer", "beneficiary"];
      const safeRole = allowedRoles.includes(userData.role || "") ? userData.role : "donor";
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        role: safeRole,
        password: hashedPassword
      });
      const verificationToken = user.verificationToken;
      const verificationLink = verificationToken ? `${req.protocol}://${req.get("host")}/verify-email/${verificationToken}` : null;
      if (verificationLink) {
        try {
          await sendVerificationEmail(user.email, verificationLink);
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
        }
      }
      res.json({ user, verificationLink, message: "Registration successful. Check your email to verify your account." });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app.get("/api/auth/verify-email/:token", async (req, res) => {
    try {
      const user = await storage.getUserByVerificationToken(req.params.token);
      if (!user) {
        return res.status(404).json({ error: "Invalid or expired verification token" });
      }
      const updatedUser = await storage.updateUser(user.id, {
        verified: true,
        verificationToken: null
      });
      if (!updatedUser) {
        return res.status(500).json({ error: "Unable to verify email" });
      }
      res.json({ message: "Email verified successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify email" });
    }
  });
  app.get("/donate", async (req, res, next) => {
    try {
      const status = String(req.query.status || "");
      const txRef = String(req.query.tx_ref || "");
      const campaignId = String(req.query.campaignId || "");
      const frontendUrl = String(req.query.frontendUrl || req.get("referer") || process.env.FRONTEND_URL || `http://localhost:5173`);
      const frontendBase = new URL(frontendUrl, "http://localhost:5173").origin;
      console.log("/donate return hit", { status, txRef, campaignId, frontendUrl, frontendBase });
      if (status === "success" && txRef) {
        const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET || "CHASECK_TEST-WB6QQBYFjbHtuPdZd7KadnkVND38cQV9";
        const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
          headers: { Authorization: `Bearer ${chapaSecretKey}`, "Content-Type": "application/json" }
        });
        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok || verifyData?.data?.status !== "success") {
          return res.redirect(`${frontendBase}/donate?status=failed&tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`);
        }
        const existing = await storage.getDonationByTransactionId(txRef);
        if (existing) {
          return res.redirect(`${frontendBase}/donation-success/${existing.id}`);
        }
        const pending = pendingDonations[txRef] || null;
        const amount = pending?.amount ?? String(verifyData?.data?.amount ?? "0");
        const resolvedCampaignId = pending?.campaignId || campaignId;
        if (!resolvedCampaignId) {
          return res.redirect(`${frontendBase}/donate?status=failed&tx_ref=${encodeURIComponent(txRef)}`);
        }
        const donation = await storage.createDonation({
          campaignId: resolvedCampaignId,
          donorId: pending?.donorId ?? null,
          amount,
          anonymous: pending?.anonymous ?? true,
          message: pending?.message ?? "",
          paymentMethod: "chapa",
          transactionId: txRef
        });
        await storage.updateCampaignRaisedAmount(resolvedCampaignId, parseFloat(amount));
        delete pendingDonations[txRef];
        return res.redirect(`${frontendBase}/donation-success/${donation.id}`);
      }
      return next();
    } catch (error) {
      console.error("Error handling /donate return:", error);
      const frontendUrl = String(req.query.frontendUrl || req.get("referer") || process.env.FRONTEND_URL || `http://localhost:5173`);
      const frontendBase = new URL(frontendUrl, "http://localhost:5173").origin;
      return res.redirect(`${frontendBase}/donate?status=failed`);
    }
  });
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const email = (req.body.email || "").toString();
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.verified) {
        return res.status(400).json({ error: "Email is already verified" });
      }
      const newToken = randomUUID2();
      const updatedUser = await storage.updateUser(user.id, { verificationToken: newToken });
      if (!updatedUser) {
        return res.status(500).json({ error: "Unable to resend verification" });
      }
      const verificationLink = `${req.protocol}://${req.get("host")}/verify-email/${newToken}`;
      try {
        await sendResendVerificationEmail(user.email, verificationLink);
      } catch (emailError) {
        console.error("Failed to send resend verification email:", emailError);
      }
      res.json({ message: "Verification link resent to your email", verificationLink });
    } catch (error) {
      res.status(500).json({ error: "Failed to resend verification" });
    }
  });
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app.get("/api/users", async (req, res) => {
    const currentUser = req.user;
    if (!currentUser || !["admin", "system_admin"].includes(currentUser.role || "")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const users = await storage.getUsers();
    res.json(users);
  });
  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });
  app.put("/api/users/:id", upload.single("avatar"), async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const currentUser = req.user;
    const isSystemAdmin = currentUser.role === "system_admin";
    const isAdmin = currentUser.role === "admin" || isSystemAdmin;
    const isOwner = currentUser.id === req.params.id;
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    try {
      const baseSchema = z2.object({
        username: z2.string().min(3).optional(),
        fullName: z2.string().optional(),
        email: z2.string().email().optional(),
        avatar: z2.string().optional(),
        password: z2.string().min(6).optional()
      }).partial();
      const adminSchema = baseSchema.extend({
        verified: z2.boolean().optional(),
        blocked: z2.boolean().optional()
      });
      const systemAdminSchema = adminSchema.extend({
        role: z2.string().optional().refine(
          (value) => !value || ["donor", "volunteer", "beneficiary", "admin", "system_admin"].includes(value),
          { message: "Invalid role" }
        )
      });
      if (req.body.verified !== void 0) {
        req.body.verified = req.body.verified === "true" || req.body.verified === true;
      }
      if (req.body.blocked !== void 0) {
        req.body.blocked = req.body.blocked === "true" || req.body.blocked === true;
      }
      const updateSchema = isSystemAdmin ? systemAdminSchema : isAdmin ? adminSchema : baseSchema;
      const updatePayload = updateSchema.parse({
        ...req.body,
        avatar: req.file ? `/uploads/${req.file.filename}` : req.body.avatar
      });
      if (updatePayload.password) {
        updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
      }
      const updatedUser = await storage.updateUser(req.params.id, updatePayload);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      req.user = updatedUser;
      res.json({ user: updatedUser });
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });
  app.get("/api/campaigns", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    const includeArchived = req.query.includeArchived === "true";
    let campaigns;
    if (includeArchived && typeof storage.getAllCampaigns === "function") {
      campaigns = await storage.getAllCampaigns(limit);
    } else {
      campaigns = await storage.getCampaigns(limit);
    }
    const search = req.query.search || "";
    const category = req.query.category || "";
    if (!includeArchived) {
      campaigns = campaigns.filter((c) => !c.archived);
    }
    if (search) {
      const lower = search.toLowerCase();
      campaigns = campaigns.filter(
        (c) => c.title.toLowerCase().includes(lower) || c.description.toLowerCase().includes(lower)
      );
    }
    if (category && category !== "all") {
      const lower = category.toLowerCase();
      campaigns = campaigns.filter((c) => c.category.toLowerCase().includes(lower));
    }
    const enriched = campaigns.map((c) => ({
      ...c,
      organizer: null
    }));
    res.json(enriched);
  });
  app.get("/api/campaigns/:id", async (req, res) => {
    const campaign = await storage.getCampaign(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.json({ ...campaign, organizer: null });
  });
  app.post("/api/campaigns", upload.single("image"), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user;
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const imagePath = req.file ? `/uploads/${req.file.filename}` : typeof req.body.image === "string" ? req.body.image : "https://images.unsplash.com/photo-1640622656785-4fddbd3b4c6a?w=800&q=80";
      const campaignData = {
        title: String(req.body.title || "").trim(),
        description: String(req.body.description || "").trim(),
        image: imagePath,
        category: String(req.body.category || "Other").trim(),
        goalAmount: String(req.body.goalAmount || "0.00"),
        startDate: req.body.startDate ? new Date(req.body.startDate) : /* @__PURE__ */ new Date(),
        endDate: req.body.endDate ? new Date(req.body.endDate) : /* @__PURE__ */ new Date(),
        status: "active",
        urgent: false,
        location: req.body.location ? String(req.body.location).trim() : null
      };
      const incoming = insertCampaignSchema.parse(campaignData);
      const campaign = await storage.createCampaign(incoming);
      res.json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      if (error && typeof error === "object" && "issues" in error) {
        console.error("Zod Validation Issues:", JSON.stringify(error.issues, null, 2));
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
      const currentUser = req.user;
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const updateData = {};
      if (req.body.title !== void 0) updateData.title = String(req.body.title).trim();
      if (req.body.description !== void 0) updateData.description = String(req.body.description).trim();
      if (req.body.category !== void 0) updateData.category = String(req.body.category).trim();
      if (req.body.goalAmount !== void 0) updateData.goalAmount = String(req.body.goalAmount);
      if (req.body.location !== void 0) updateData.location = req.body.location ? String(req.body.location).trim() : null;
      if (req.body.startDate) updateData.startDate = new Date(req.body.startDate);
      if (req.body.endDate) updateData.endDate = new Date(req.body.endDate);
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      } else if (typeof req.body.image === "string" && req.body.image.trim() !== "") {
        updateData.image = req.body.image;
      }
      const updated = await storage.updateCampaign(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      console.error("Campaign update error:", error);
      if (error && typeof error === "object" && "issues" in error) {
        console.error("Zod Validation Issues (PUT):", JSON.stringify(error.issues, null, 2));
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
      const currentUser = req.user;
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
      const currentUser = req.user;
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
      const currentUser = req.user;
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
    const donations = await storage.getDonationsByCampaign(req.params.id);
    const donationsWithDonor = await Promise.all(
      donations.map(async (donation) => {
        if (!donation.donorId || donation.anonymous) {
          return donation;
        }
        const donorUser = await storage.getUser(donation.donorId);
        if (!donorUser) {
          return donation;
        }
        return {
          ...donation,
          donorName: donorUser.fullName?.trim() || donorUser.username || donation.donorId,
          donorAvatar: donorUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser.username || donorUser.id}`
        };
      })
    );
    res.json(donationsWithDonor);
  });
  app.post("/api/donations", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);
      await storage.updateCampaignRaisedAmount(donation.campaignId, parseFloat(donation.amount.toString()));
      res.json(donation);
    } catch (error) {
      res.status(400).json({ error: "Invalid donation data" });
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
        donationType
      } = req.body;
      if (!campaignId || !amount || !email) {
        return res.status(400).json({ error: "Missing payment details" });
      }
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "CHASECK_TEST-WB6QQBYFjbHtuPdZd7KadnkVND38cQV9";
      if (!chapaSecretKey) {
        return res.status(500).json({ error: "Chapa payment provider is not configured." });
      }
      const txRef = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const rawFrontendUrl = req.get("origin") || req.body?.frontendUrl || req.get("referer") || process.env.FRONTEND_URL;
      const frontendBaseUrl = rawFrontendUrl ? new URL(String(rawFrontendUrl), "http://localhost:5173").origin : `http://localhost:5173`;
      const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5e3}`;
      const callbackUrl = `${backendBaseUrl}/api/payments/chapa/verify?tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;
      const returnUrl = `${frontendBaseUrl}/donate?status=success&tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;
      console.log("Chapa init rawFrontendUrl", rawFrontendUrl, "callback_url", callbackUrl, "return_url", returnUrl);
      pendingDonations[txRef] = {
        campaignId,
        amount: String(amount),
        donorId: donorId ?? null,
        anonymous: Boolean(anonymous),
        message: "",
        donationType: donationType || "one-time",
        email,
        firstName: firstName || "",
        lastName: lastName || ""
      };
      const chapaResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "ETB",
          email,
          first_name: firstName || "",
          last_name: lastName || "",
          tx_ref: txRef,
          callback_url: callbackUrl,
          return_url: returnUrl
        })
      });
      const chapaData = await chapaResponse.json();
      if (!chapaResponse.ok || !chapaData?.data?.checkout_url) {
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
      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET || "CHASECK_TEST-WB6QQBYFjbHtuPdZd7KadnkVND38cQV9";
      const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json"
        }
      });
      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || verifyData?.data?.status !== "success") {
        const message2 = verifyData?.message || verifyData?.data?.message || "Payment verification failed.";
        return res.status(400).json({ error: message2 });
      }
      const campaignId = String(req.query.campaignId || "");
      const pendingDonation = pendingDonations[txRef];
      const donationSource = pendingDonation ?? null;
      const amount = donationSource?.amount ?? String(verifyData?.data?.amount ?? "0");
      const resolvedCampaignId = donationSource?.campaignId || campaignId;
      const donorId = donationSource?.donorId ?? null;
      const anonymous = donationSource?.anonymous ?? true;
      const message = donationSource?.message ?? "";
      if (!resolvedCampaignId) {
        return res.status(400).json({ error: "Missing campaign information for donation verification" });
      }
      const existingDonation = await storage.getDonationByTransactionId(txRef);
      if (existingDonation) {
        return res.json({ success: true, donation: existingDonation, alreadyProcessed: true });
      }
      const donation = await storage.createDonation({
        campaignId: resolvedCampaignId,
        donorId,
        amount,
        anonymous,
        message,
        paymentMethod: "chapa",
        transactionId: txRef
      });
      await storage.updateCampaignRaisedAmount(resolvedCampaignId, parseFloat(amount));
      delete pendingDonations[txRef];
      res.json({ success: true, donation });
    } catch (error) {
      console.error("Chapa payment verification failed", error);
      res.status(500).json({ error: "Unable to verify Chapa payment." });
    }
  });
  app.get("/api/donations", async (req, res) => {
    const donorId = req.query.donorId;
    const limit = req.query.limit ? parseInt(req.query.limit) : 50;
    if (donorId) {
      const donations2 = await storage.getDonationsByDonor(donorId);
      const enriched2 = await Promise.all(
        donations2.map(async (d) => {
          if (!d.donorId || d.anonymous) return d;
          const donorUser = await storage.getUser(d.donorId);
          return {
            ...d,
            donorName: donorUser?.fullName?.trim() || donorUser?.username || d.donorId,
            donorAvatar: donorUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser?.username || d.donorId}`
          };
        })
      );
      res.json(enriched2);
      return;
    }
    const donations = await storage.getDonations(limit);
    const enriched = await Promise.all(
      donations.map(async (d) => {
        if (!d.donorId || d.anonymous) return d;
        const donorUser = await storage.getUser(d.donorId);
        return {
          ...d,
          donorName: donorUser?.fullName?.trim() || donorUser?.username || d.donorId,
          donorAvatar: donorUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser?.username || d.donorId}`
        };
      })
    );
    res.json(enriched);
  });
  app.get("/api/donations/:id", async (req, res) => {
    try {
      const donation = await storage.getDonation(req.params.id);
      if (!donation) {
        return res.status(404).json({ error: "Donation not found" });
      }
      res.json(donation);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch donation" });
    }
  });
  app.get("/api/stories", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
    let stories = await storage.getStories(limit);
    const search = req.query.search || "";
    const category = req.query.category || "";
    const campaignId = req.query.campaignId || "";
    const publishedOnly = req.query.published === void 0 || req.query.published === "true";
    if (search) {
      const lower = search.toLowerCase();
      stories = stories.filter(
        (s) => s.title.toLowerCase().includes(lower) || s.content.toLowerCase().includes(lower)
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
      if (story.authorId) {
        const authorUser = await storage.getUser(story.authorId);
        if (authorUser) {
          author = {
            name: authorUser.fullName?.trim() || authorUser.username || "Anonymous",
            role: authorUser.role === "beneficiary" ? "Beneficiary" : authorUser.role === "donor" ? "Donor" : "Story Author",
            avatar: authorUser.avatar || void 0
          };
        }
      }
      return {
        ...story,
        author: author ?? {
          name: "Anonymous",
          role: "Beneficiary",
          avatar: void 0
        },
        category: campaign?.category || "Impact Story"
      };
    }));
    const filteredByCategory = category && category !== "all" ? enriched.filter((s) => s.category.toLowerCase().includes(category.toLowerCase())) : enriched;
    res.json(filteredByCategory);
  });
  app.get("/api/stories/:id", async (req, res) => {
    const story = await storage.getStory(req.params.id);
    if (!story) {
      return res.status(404).json({ error: "Story not found" });
    }
    const campaign = story.campaignId ? await storage.getCampaign(story.campaignId) : null;
    let author = story.author;
    if (story.authorId) {
      const authorUser = await storage.getUser(story.authorId);
      if (authorUser) {
        author = {
          name: authorUser.fullName?.trim() || authorUser.username || "Anonymous",
          role: authorUser.role === "beneficiary" ? "Beneficiary" : authorUser.role === "donor" ? "Donor" : "Story Author",
          avatar: authorUser.avatar || void 0
        };
      }
    }
    const enriched = {
      ...story,
      author: author ?? {
        name: "Anonymous",
        role: "Beneficiary",
        avatar: void 0
      },
      category: campaign?.category || "Impact Story"
    };
    res.json(enriched);
  });
  app.post("/api/stories", upload.single("image"), async (req, res) => {
    try {
      const storyPayload = { ...req.body };
      if (typeof storyPayload.author === "string") {
        try {
          storyPayload.author = JSON.parse(storyPayload.author);
        } catch {
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
      const currentUser = req.user;
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const story = await storage.getStory(req.params.id);
      if (!story) {
        return res.status(404).json({ error: "Story not found" });
      }
      const updateData = { ...req.body };
      if (typeof updateData.author === "string") {
        try {
          updateData.author = JSON.parse(updateData.author);
        } catch {
        }
      }
      if (typeof updateData.published === "string") {
        updateData.published = updateData.published === "true";
      }
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      } else if (updateData.image === void 0 || updateData.image === "") {
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
      const currentUser = req.user;
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
  app.get("/api/campaigns/:id/volunteers", async (req, res) => {
    const volunteers = await storage.getVolunteersByCampaign(req.params.id);
    res.json(volunteers);
  });
  app.get("/api/volunteers", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 100;
      const listingsOnly = req.query.listingsOnly === "true";
      const volunteers = await storage.getVolunteers(limit);
      const enrichedVolunteers = await Promise.all(
        volunteers.map(async (v) => {
          const campaign = v.campaignId ? await storage.getCampaign(v.campaignId) : null;
          let isOpportunityListing = false;
          if (!v.userId) {
            isOpportunityListing = true;
          } else {
            const user = await storage.getUser(v.userId);
            if (user && ["admin", "system_admin"].includes(user.role || "")) {
              isOpportunityListing = true;
            }
          }
          return {
            ...v,
            // Keeps userId, status, and everything intact for the Admin Dashboard!
            isListing: isOpportunityListing,
            campaign: campaign ? { title: campaign.title, category: campaign.category, image: campaign.image, location: campaign.location } : null,
            campaignTitle: campaign?.title || null,
            campaignCategory: campaign?.category || "General"
          };
        })
      );
      if (listingsOnly) {
        return res.json(enrichedVolunteers.filter((item) => item.isListing === true));
      }
      res.json(enrichedVolunteers);
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      res.status(500).json({ error: "Unable to fetch volunteer opportunities" });
    }
  });
  app.put("/api/volunteers/:id/status", async (req, res) => {
    const currentUser = req.user;
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
      const currentUser = req.user;
      const payload = { ...req.body };
      if (payload.campaignId === null || payload.campaignId === "" || payload.campaignId === void 0) {
        delete payload.campaignId;
      }
      if (currentUser) {
        const isAdminUser = ["admin", "system_admin"].includes(currentUser.role || "");
        if (isAdminUser) {
          if (!payload.userId || payload.userId === "") {
            payload.userId = currentUser.id;
          }
          payload.status = payload.status || "approved";
        } else {
          payload.userId = currentUser.id;
          payload.status = "pending";
        }
      } else {
        payload.status = "pending";
        if (payload.userId === null || payload.userId === "" || payload.userId === void 0) {
          delete payload.userId;
        }
      }
      const volunteerData = insertVolunteerSchema.parse(payload);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      console.error("Volunteer registry submission error:", error);
      res.status(400).json({ error: "Invalid volunteer data structural specifications" });
    }
  });
  app.delete("/api/volunteers/:id", async (req, res) => {
    try {
      const currentUser = req.user;
      if (!currentUser || !["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await storage.deleteVolunteer(req.params.id);
      res.json({ message: "Volunteer deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Unable to delete volunteer" });
    }
  });
  app.get("/api/aid-requests", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
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
      res.json(aidRequest);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch aid request" });
    }
  });
  app.get("/api/users/:userId/aid-requests", async (req, res) => {
    try {
      const aidRequests = await storage.getAidRequestsByUser(req.params.userId);
      res.json(aidRequests);
    } catch (error) {
      res.status(500).json({ error: "Unable to fetch user aid requests" });
    }
  });
  app.post("/api/aid-requests", upload.array("documents"), async (req, res) => {
    try {
      const documents = req.files ? req.files.map((file) => `/uploads/${file.filename}`) : [];
      const aidRequestData = {
        ...req.body,
        documents
      };
      const parsedData = insertAidRequestSchema.parse(aidRequestData);
      const aidRequest = await storage.createAidRequest(parsedData);
      res.json(aidRequest);
    } catch (error) {
      console.error("Aid request creation error:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(400).json({ error: "Invalid aid request data" });
    }
  });
  app.put("/api/aid-requests/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status || typeof status !== "string") {
        return res.status(400).json({ error: "Status is required" });
      }
      await storage.updateAidRequestStatus(req.params.id, status);
      res.json({ message: "Status updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Unable to update aid request status" });
    }
  });
}

// server/app.ts
dotenv2.config({ path: path2.resolve(process.cwd(), ".env") });
process.env.NODE_ENV = process.env.NODE_ENV || "development";
async function createApp() {
  console.log("[App] createApp called");
  const app = express();
  app.disable("etag");
  console.log("[App] Express instance created");
  app.use(
    cors({
      origin: true,
      credentials: true
    })
  );
  console.log("[App] CORS configured");
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  console.log("[App] JSON/URL parsers configured");
  app.use("/api", (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
  });
  const DEFAULT_UPLOADS_DIR = path2.join(process.cwd(), "uploads");
  const SERVERLESS_TMP_DIR = path2.join(os.tmpdir(), "welfare-uploads");
  const UPLOADS_DIR = process.env.UPLOAD_DIR || (process.env.VERCEL ? SERVERLESS_TMP_DIR : DEFAULT_UPLOADS_DIR);
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  app.use("/attached_assets", express.static(path2.join(process.cwd(), "attached_assets")));
  app.use("/uploads", express.static(UPLOADS_DIR));
  const storageConfig = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, `${file.fieldname}-${uniqueSuffix}${path2.extname(file.originalname)}`);
    }
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
    let capturedJsonResponse;
    const originalResJson = res.json;
    res.json = function(bodyJson, ...args) {
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
          logLine = `${logLine.slice(0, 120)}\u2026`;
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
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  console.log("[App] App creation complete");
  return app;
}

// serverless-entry.ts
var handlerPromise;
function getHandler() {
  handlerPromise ??= createApp().then((app) => serverless(app));
  return handlerPromise;
}
async function handler(req, res) {
  try {
    return (await getHandler())(req, res);
  } catch (error) {
    console.error("API request failed", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
export {
  handler as default
};
