// === CONSOLIDATED BACKEND: Storage + App + Routes ===
// All backend logic in a single file to avoid module resolution issues on Vercel

import { randomUUID } from "crypto";
import {
  type User,
  type InsertUser,
  type Campaign,
  type InsertCampaign,
  type Donation,
  type InsertDonation,
  type Story,
  type InsertStory,
  type Volunteer,
  type InsertVolunteer,
  type AidRequest,
  type InsertAidRequest,
  users,
  campaigns,
  donations,
  stories,
  volunteers,
  aidRequests,
} from "./shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import os from "os";
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import ConnectPgSimple from "connect-pg-simple";
import bcrypt from "bcryptjs";
import multer from "multer";
import nodemailer from "nodemailer";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const DEFAULT_DB_URL = "postgresql://postgres:postgres.com@localhost:5432/WELFARE";
const rawDatabaseUrl = process.env.DATABASE_URL || process.env.LOCAL_DATABASE_URL || DEFAULT_DB_URL;
const DATABASE_URL = rawDatabaseUrl.replace(/"/g, "").trim();

let db: any;
try {
  console.log(
    "Connecting to database using URL:",
    process.env.DATABASE_URL ? "DATABASE_URL" : process.env.LOCAL_DATABASE_URL ? "LOCAL_DATABASE_URL" : "DEFAULT_DB_URL",
  );
  const client = postgres(DATABASE_URL);
  db = drizzle(client, {
    schema: { users, campaigns, donations, stories, volunteers, aidRequests },
  });
  console.log("Database connected successfully");
} catch (error: any) {
  console.warn("Database connection failed, falling back to in-memory storage:", error?.message || error);
  db = null;
}

// === STORAGE LAYER ===
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByVerificationToken(token: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  getUsers(limit?: number): Promise<User[]>;
  getCampaigns(limit?: number): Promise<Campaign[]>;
  getAllCampaigns(limit?: number): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: string): Promise<void>;
  updateCampaignRaisedAmount(id: string, amount: number): Promise<void>;
  getDonations(limit?: number): Promise<Donation[]>;
  getDonation(id: string): Promise<Donation | undefined>;
  getDonationByTransactionId(transactionId: string): Promise<Donation | undefined>;
  getDonationsByCampaign(campaignId: string): Promise<Donation[]>;
  getDonationsByDonor(donorId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getTotalDonationsByCampaign(campaignId: string): Promise<number>;
  getStories(limit?: number): Promise<Story[]>;
  getStory(id: string): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;
  updateStory(id: string, story: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<void>;
  getVolunteersByCampaign(campaignId: string): Promise<Volunteer[]>;
  getVolunteersByUser(userId: string): Promise<Volunteer[]>;
  getVolunteers(limit?: number): Promise<Volunteer[]>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;
  updateVolunteerStatus(id: string, status: string): Promise<void>;
  deleteVolunteer(id: string): Promise<void>;
  getAidRequests(limit?: number): Promise<AidRequest[]>;
  getAidRequest(id: string): Promise<AidRequest | undefined>;
  getAidRequestsByUser(userId: string): Promise<AidRequest[]>;
  createAidRequest(aidRequest: InsertAidRequest): Promise<AidRequest>;
  updateAidRequestStatus(id: string, status: string): Promise<void>;
  deleteAidRequest(id: string): Promise<void>;
  getStats(): Promise<{ totalRaised: number; livesImpacted: number; activeVolunteers: number; goalsAchieved: number }>;
}

export class DatabaseStorage implements IStorage {
  private memUsers: Map<string, User> = new Map();
  private memCampaigns: Map<string, Campaign> = new Map();
  private memStories: Map<string, Story> = new Map();
  private memVolunteers: Map<string, Volunteer> = new Map();
  private memDonations: Map<string, Donation> = new Map();
  private memAidRequests: Map<string, AidRequest> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const adminUser: User = {
      id: "admin-1",
      username: "charityadmin",
      password: "hashed_password",
      email: "admin@charity.org",
      fullName: "Charity Admin",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CA",
      verified: true,
      blocked: false,
      verificationToken: null,
      createdAt: new Date("2024-01-01"),
    };
    this.memUsers.set(adminUser.id, adminUser);
  }

  private isDbAvailable(): boolean {
    return db !== null;
  }

  async getUser(id: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    }
    return this.memUsers.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    }
    return Array.from(this.memUsers.values()).find((user) => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    }
    return Array.from(this.memUsers.values()).find((user) => user.email === email);
  }

  async getUserByVerificationToken(token: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(users).where(eq(users.verificationToken, token));
      return result[0];
    }
    return Array.from(this.memUsers.values()).find((user) => (user as any).verificationToken === token);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (this.isDbAvailable()) {
      const result = await db
        .insert(users)
        .values({
          ...insertUser,
          verified: false,
          blocked: false,
          verificationToken: randomUUID(),
        })
        .returning();
      return result[0];
    }
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      fullName: insertUser.fullName ?? null,
      avatar: insertUser.avatar ?? null,
      role: insertUser.role ?? "donor",
      verified: false,
      blocked: false,
      verificationToken: randomUUID(),
      createdAt: new Date(),
    };
    this.memUsers.set(id, user);
    return user;
  }

  async updateUser(id: string, partialUser: Partial<User>): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const result = await db
        .update(users)
        .set(partialUser)
        .where(eq(users.id, id))
        .returning();
      return result[0];
    }
    const existing = this.memUsers.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partialUser };
    this.memUsers.set(id, updated);
    return updated;
  }

  async getUsers(limit = 100): Promise<User[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(users).limit(limit);
    }
    return Array.from(this.memUsers.values()).slice(0, limit);
  }

  async getCampaigns(limit = 50): Promise<Campaign[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(campaigns)
        .where(and(eq(campaigns.status, "active"), eq(campaigns.archived, false)))
        .orderBy(desc(campaigns.createdAt))
        .limit(limit);
    }
    return Array.from(this.memCampaigns.values())
      .filter((c) => c.status === "active" && !c.archived)
      .slice(0, limit);
  }

  async getAllCampaigns(limit = 50): Promise<Campaign[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(campaigns)
        .orderBy(desc(campaigns.createdAt))
        .limit(limit);
    }
    return Array.from(this.memCampaigns.values()).slice(0, limit);
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(campaigns).where(eq(campaigns.id, id));
      return result[0];
    }
    return this.memCampaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    if (this.isDbAvailable()) {
      const result = await db.insert(campaigns).values(insertCampaign).returning();
      return result[0];
    }
    const id = randomUUID();
    const campaign = {
      ...insertCampaign,
      id,
      raisedAmount: "0",
      status: "active",
      startDate: insertCampaign.startDate ?? new Date(),
      urgent: insertCampaign.urgent ?? null,
      location: insertCampaign.location ?? null,
      archived: false,
      createdAt: new Date(),
    } as Campaign;
    this.memCampaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: string, partialCampaign: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    if (this.isDbAvailable()) {
      const result = await db
        .update(campaigns)
        .set(partialCampaign)
        .where(eq(campaigns.id, id))
        .returning();
      return result[0];
    }
    const existing = this.memCampaigns.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partialCampaign };
    this.memCampaigns.set(id, updated);
    return updated;
  }

  async deleteCampaign(id: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db.delete(campaigns).where(eq(campaigns.id, id));
    } else {
      this.memCampaigns.delete(id);
    }
  }

  async updateCampaignRaisedAmount(id: string, amount: number): Promise<void> {
    if (this.isDbAvailable()) {
      await db
        .update(campaigns)
        .set({ raisedAmount: sql`${campaigns.raisedAmount} + ${amount}` })
        .where(eq(campaigns.id, id));
    } else {
      const campaign = this.memCampaigns.get(id);
      if (campaign) {
        campaign.raisedAmount = (parseFloat(campaign.raisedAmount ?? "0") + amount).toString();
        this.memCampaigns.set(id, campaign);
      }
    }
  }

  async getDonations(limit = 50): Promise<Donation[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt))
        .limit(limit);
    }
    return Array.from(this.memDonations.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getDonation(id: string): Promise<Donation | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(donations).where(eq(donations.id, id));
      return result[0];
    }
    return this.memDonations.get(id);
  }

  async getDonationByTransactionId(transactionId: string): Promise<Donation | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(donations).where(eq(donations.transactionId, transactionId));
      return result[0];
    }
    return Array.from(this.memDonations.values()).find((d) => d.transactionId === transactionId);
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(donations).where(eq(donations.campaignId, campaignId));
    }
    return Array.from(this.memDonations.values()).filter((d) => d.campaignId === campaignId);
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(donations).where(eq(donations.donorId, donorId));
    }
    return Array.from(this.memDonations.values()).filter((d) => d.donorId === donorId);
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    if (this.isDbAvailable()) {
      const result = await db.insert(donations).values(insertDonation).returning();
      return result[0];
    }
    const donation: Donation = {
      ...insertDonation,
      id: randomUUID(),
      donorId: insertDonation.donorId ?? null,
      anonymous: insertDonation.anonymous ?? false,
      message: insertDonation.message ?? null,
      transactionId: insertDonation.transactionId ?? null,
      createdAt: new Date(),
    };
    this.memDonations.set(donation.id, donation);
    return donation;
  }

  async getTotalDonationsByCampaign(campaignId: string): Promise<number> {
    if (this.isDbAvailable()) {
      const result = await db
        .select({ total: sql<number>`sum(cast(${donations.amount} as numeric))` })
        .from(donations)
        .where(eq(donations.campaignId, campaignId));
      return result[0]?.total || 0;
    }
    return Array.from(this.memDonations.values())
      .filter((d) => d.campaignId === campaignId)
      .reduce((sum, d) => sum + parseFloat(d.amount || "0"), 0);
  }

  async getStories(limit = 50): Promise<Story[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(stories).limit(limit);
    }
    return Array.from(this.memStories.values()).slice(0, limit);
  }

  async getStory(id: string): Promise<Story | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(stories).where(eq(stories.id, id));
      return result[0];
    }
    return this.memStories.get(id);
  }

  async createStory(insertStory: InsertStory): Promise<Story> {
    if (this.isDbAvailable()) {
      const result = await db.insert(stories).values(insertStory).returning();
      return result[0];
    }
    const story: Story = {
      ...insertStory,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.memStories.set(story.id, story);
    return story;
  }

  async updateStory(id: string, partialStory: Partial<InsertStory>): Promise<Story | undefined> {
    if (this.isDbAvailable()) {
      const result = await db
        .update(stories)
        .set(partialStory)
        .where(eq(stories.id, id))
        .returning();
      return result[0];
    }
    const existing = this.memStories.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...partialStory };
    this.memStories.set(id, updated);
    return updated;
  }

  async deleteStory(id: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db.delete(stories).where(eq(stories.id, id));
    } else {
      this.memStories.delete(id);
    }
  }

  async getVolunteersByCampaign(campaignId: string): Promise<Volunteer[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(volunteers).where(eq(volunteers.campaignId, campaignId));
    }
    return Array.from(this.memVolunteers.values()).filter((v) => v.campaignId === campaignId);
  }

  async getVolunteersByUser(userId: string): Promise<Volunteer[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(volunteers).where(eq(volunteers.userId, userId));
    }
    return Array.from(this.memVolunteers.values()).filter((v) => v.userId === userId);
  }

  async getVolunteers(limit = 50): Promise<Volunteer[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(volunteers).limit(limit);
    }
    return Array.from(this.memVolunteers.values()).slice(0, limit);
  }

  async createVolunteer(insertVolunteer: InsertVolunteer): Promise<Volunteer> {
    if (this.isDbAvailable()) {
      const result = await db.insert(volunteers).values(insertVolunteer).returning();
      return result[0];
    }
    const volunteer: Volunteer = {
      ...insertVolunteer,
      id: randomUUID(),
      createdAt: new Date(),
    };
    this.memVolunteers.set(volunteer.id, volunteer);
    return volunteer;
  }

  async updateVolunteerStatus(id: string, status: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db.update(volunteers).set({ status }).where(eq(volunteers.id, id));
    } else {
      const vol = this.memVolunteers.get(id);
      if (vol) {
        vol.status = status;
        this.memVolunteers.set(id, vol);
      }
    }
  }

  async deleteVolunteer(id: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db.delete(volunteers).where(eq(volunteers.id, id));
    } else {
      this.memVolunteers.delete(id);
    }
  }

  async getAidRequests(limit = 50): Promise<AidRequest[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(aidRequests).limit(limit);
    }
    return Array.from(this.memAidRequests.values()).slice(0, limit);
  }

  async getAidRequest(id: string): Promise<AidRequest | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(aidRequests).where(eq(aidRequests.id, id));
      return result[0];
    }
    return this.memAidRequests.get(id);
  }

  async getAidRequestsByUser(userId: string): Promise<AidRequest[]> {
    if (this.isDbAvailable()) {
      return await db.select().from(aidRequests).where(eq(aidRequests.userId, userId));
    }
    return Array.from(this.memAidRequests.values()).filter((a) => a.userId === userId);
  }

  async createAidRequest(insertAidRequest: InsertAidRequest): Promise<AidRequest> {
    if (this.isDbAvailable()) {
      const result = await db.insert(aidRequests).values(insertAidRequest).returning();
      return result[0];
    }
    const aidRequest: AidRequest = {
      ...insertAidRequest,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.memAidRequests.set(aidRequest.id, aidRequest);
    return aidRequest;
  }

  async updateAidRequestStatus(id: string, status: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db.update(aidRequests).set({ status, updatedAt: new Date() }).where(eq(aidRequests.id, id));
    } else {
      const aid = this.memAidRequests.get(id);
      if (aid) {
        aid.status = status;
        aid.updatedAt = new Date();
        this.memAidRequests.set(id, aid);
      }
    }
  }

  async deleteAidRequest(id: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db.delete(aidRequests).where(eq(aidRequests.id, id));
    } else {
      this.memAidRequests.delete(id);
    }
  }

  async getStats(): Promise<{
    totalRaised: number;
    livesImpacted: number;
    activeVolunteers: number;
    goalsAchieved: number;
  }> {
    if (this.isDbAvailable()) {
      const totalRes = await db
        .select({ total: sql<number>`sum(cast(${campaigns.raisedAmount} as numeric))` })
        .from(campaigns);
      const totalRaised = totalRes[0]?.total || 0;

      const volRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(volunteers)
        .where(eq(volunteers.status, "approved"));
      const activeVolunteers = volRes[0]?.count || 0;

      const countRes = await db.select({ count: sql<number>`count(*)` }).from(campaigns);
      const achievedRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(campaigns)
        .where(sql`cast(${campaigns.raisedAmount} as numeric) >= cast(${campaigns.goalAmount} as numeric)`);
      const goalsAchieved =
        countRes[0]?.count ? (achievedRes[0]?.count / countRes[0].count) * 100 : 0;

      return {
        totalRaised,
        livesImpacted: totalRaised / 150,
        activeVolunteers,
        goalsAchieved,
      };
    }

    let totalRaised = 0;
    for (const c of Array.from(this.memCampaigns.values())) {
      totalRaised += parseFloat((c.raisedAmount ?? "0").toString());
    }
    const activeVolunteers = 0;
    const totalCount = this.memCampaigns.size;
    const achievedCount = Array.from(this.memCampaigns.values()).filter(
      (c) =>
        parseFloat((c.raisedAmount ?? "0").toString()) >=
        parseFloat(c.goalAmount.toString()),
    ).length;
    const goalsAchieved = totalCount ? (achievedCount / totalCount) * 100 : 0;

    return {
      totalRaised,
      livesImpacted: totalRaised,
      activeVolunteers,
      goalsAchieved,
    };
  }
}

export const storage = new DatabaseStorage();

// === EMAIL SERVICE ===
let transporter: nodemailer.Transporter | null = null;

async function initializeTransporter() {
  if (transporter) return transporter;
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

async function sendVerificationEmail(email: string, verificationLink: string): Promise<void> {
  const trans = await initializeTransporter();
  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@welfare-charity.com",
    to: email,
    subject: "Verify Your Email Address",
    html: `<html><body><p>Please verify your email by visiting: <a href="${verificationLink}">Verify Email</a></p></body></html>`,
  };
  await trans.sendMail(mailOptions);
}

// === APP SETUP ===
export async function createApp(): Promise<Express> {
  console.log("[App] createApp called");

  const app = express();
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

  const DEFAULT_UPLOADS_DIR = path.join(process.cwd(), "uploads");
  const SERVERLESS_TMP_DIR = path.join(os.tmpdir(), "welfare-uploads");
  const UPLOADS_DIR = process.env.UPLOAD_DIR || (process.env.VERCEL ? SERVERLESS_TMP_DIR : DEFAULT_UPLOADS_DIR);

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });

  app.use("/attached_assets", express.static(path.join(process.cwd(), "attached_assets")));
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
  const PgSession = ConnectPgSimple(session);

  let sessionStore: any;
  try {
    sessionStore = new PgSession({
      conString: DATABASE_URL,
      createTableIfMissing: true,
    });
    console.log("Using PostgreSQL session store");
  } catch (err) {
    console.warn("Failed to create PostgreSQL session store, using memory store:", err);
    sessionStore = new session.MemoryStore();
  }

  app.use(
    session({
      store: sessionStore,
      secret: process.env.SESSION_SECRET || "welfare-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        sameSite: "lax",
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

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

          const isBlocked = (user as any).blocked || false;
          if (isBlocked) {
            return done(null, false, { message: "This account has been blocked" });
          }

          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password" });
          }

          return done(null, user);
        } catch (error) {
          return done(error as Error);
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
      done(error as Error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());

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

  // === MINIMAL ROUTES ===
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns(50);
      res.json(campaigns);
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication error" });
      }
      if (!user) {
        return res.status(401).json({ error: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login error" });
        }
        res.json({ user });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout error" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  console.log("[App] App creation complete");
  return app;
}
