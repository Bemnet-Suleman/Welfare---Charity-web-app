// import { drizzle } from "drizzle-orm/neon-http";
// import { neon } from "@neondatabase/serverless";
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
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

// Database connection - using postgres-js for local PostgreSQL
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const DEFAULT_DB_URL = "postgresql://postgres:postgres.com@localhost:5432/WELFARE";
const DATABASE_URL = (process.env.DATABASE_URL || DEFAULT_DB_URL).replace(/"/g, "");

let db: any;
try {
  console.log("Connecting to database using URL:", DATABASE_URL);
  const client = postgres(DATABASE_URL);
  db = drizzle(client, {
    schema: { users, campaigns, donations, stories, volunteers, aidRequests },
  });
  console.log("Database connected successfully");
} catch (error: any) {
  console.warn("Database connection failed, falling back to in-memory storage:", error?.message || error);
  db = null;
}

// Storage interface
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User | undefined>;
  getUsers(limit?: number): Promise<User[]>;

  // Campaigns
  getCampaigns(limit?: number): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaignRaisedAmount(id: string, amount: number): Promise<void>;

  // Donations
  getDonations(limit?: number): Promise<Donation[]>;
  getDonationsByCampaign(campaignId: string): Promise<Donation[]>;
  getDonationsByDonor(donorId: string): Promise<Donation[]>;
  createDonation(donation: InsertDonation): Promise<Donation>;
  getTotalDonationsByCampaign(campaignId: string): Promise<number>;

  // Stories
  getStories(limit?: number): Promise<Story[]>;
  getStory(id: string): Promise<Story | undefined>;
  createStory(story: InsertStory): Promise<Story>;

  // Volunteers
  getVolunteersByCampaign(campaignId: string): Promise<Volunteer[]>;
  getVolunteers(limit?: number): Promise<Volunteer[]>;
  createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>;

  // Aid Requests
  getAidRequests(limit?: number): Promise<AidRequest[]>;
  getAidRequest(id: string): Promise<AidRequest | undefined>;
  getAidRequestsByUser(userId: string): Promise<AidRequest[]>;
  createAidRequest(aidRequest: InsertAidRequest): Promise<AidRequest>;
  updateAidRequestStatus(id: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private memUsers: Map<string, User> = new Map();
  private memCampaigns: Map<string, Campaign> = new Map();
  private memStories: Map<string, Story> = new Map();
  private memVolunteers: Map<string, Volunteer> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed some initial data for demonstration
    const adminUser: User = {
      id: "admin-1",
      username: "charityadmin",
      password: "hashed_password",
      email: "admin@charity.org",
      fullName: "Charity Admin",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=CA",
      verified: true,
      createdAt: new Date("2024-01-01"),
    };
    this.memUsers.set(adminUser.id, adminUser);

    const sysAdminUser: User = {
      id: "sysadmin-1",
      username: "sysadmin",
      password: "hashed_password",
      email: "sysadmin@welfare.org",
      fullName: "System Administrator",
      role: "system_admin",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SA",
      verified: true,
      createdAt: new Date("2024-01-01"),
    };
    this.memUsers.set(sysAdminUser.id, sysAdminUser);

    const user1: User = {
      id: "user-1",
      username: "redcross",
      password: "hashed_password",
      email: "contact@redcross.et",
      fullName: "Red Cross Ethiopia",
      role: "admin",
      avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RC",
      verified: true,
      createdAt: new Date("2024-01-01"),
    };
    this.memUsers.set(user1.id, user1);

    const campaign1: Campaign = {
      id: "campaign-1",
      title: "Emergency Relief: Flood Victims in Southern Ethiopia",
      description: "Provide immediate aid including food, water, shelter, and medical supplies to families affected by devastating floods.",
      image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
      category: "Disaster Relief",
      goalAmount: "100000",
      raisedAmount: "67000",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-02-01"),
      status: "active",
      urgent: true,
      location: "Southern Ethiopia",
      createdAt: new Date("2024-01-01"),
    };
    this.memCampaigns.set(campaign1.id, campaign1);

    const campaign2: Campaign = {
      id: "campaign-2",
      title: "Clean Water Wells for Rural Communities",
      description: "Build sustainable water wells to provide clean drinking water to 10 villages lacking access to safe water sources.",
      image: "https://images.unsplash.com/photo-1594398901394-4e34939a4fd0?w=800&q=80",
      category: "Healthcare",
      goalAmount: "75000",
      raisedAmount: "52000",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-03-15"),
      status: "active",
      urgent: false,
      location: "Rural Ethiopia",
      createdAt: new Date("2024-01-15"),
    };
    this.memCampaigns.set(campaign2.id, campaign2);

    const story1: Story = {
      id: "story-1",
      title: "A Life Saved",
      content: "The medical supplies donated through Welfare saved my son's life. When the hospital ran out of critical medications, these generous donors stepped in. I will be forever grateful.",
      image: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
      author:{"name": "John Smith", "role": "donor", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"},
      campaignId: campaign1.id,
      published: true,
      createdAt: new Date("2024-01-20"),
    };
    this.memStories.set(story1.id, story1);
  }

  private isDbAvailable(): boolean {
    return db !== null;
  }

  // Users
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
    return Array.from(this.memUsers.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(users).where(eq(users.email, email));
      return result[0];
    }
    return Array.from(this.memUsers.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (this.isDbAvailable()) {
      const result = await db.insert(users).values(insertUser).returning();
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
      createdAt: new Date() 
    };
    this.memUsers.set(id, user);
    return user;
  }

  async updateUser(id: string, partialUser: Partial<InsertUser>): Promise<User | undefined> {
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

  // Campaigns
  async getCampaigns(limit = 50): Promise<Campaign[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(campaigns)
        .where(eq(campaigns.status, "active"))
        .orderBy(desc(campaigns.createdAt))
        .limit(limit);
    }
    return Array.from(this.memCampaigns.values()).filter(c => c.status === "active").slice(0, limit);
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
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      raisedAmount: "0",
      status: "active",
      startDate: insertCampaign.startDate ?? new Date(),
      urgent: insertCampaign.urgent ?? null,
      location: insertCampaign.location ?? null,
      createdAt: new Date()
    };
    this.memCampaigns.set(id, campaign);
    return campaign;
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

  // Donations
  async getDonations(limit = 50): Promise<Donation[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(donations)
        .orderBy(desc(donations.createdAt))
        .limit(limit);
    }
    return [];
  }

  async getDonationsByCampaign(campaignId: string): Promise<Donation[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(donations)
        .where(eq(donations.campaignId, campaignId))
        .orderBy(desc(donations.createdAt));
    }
    // In-memory doesn't store donations, return empty array
    return [];
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(donations)
        .where(eq(donations.donorId, donorId))
        .orderBy(desc(donations.createdAt));
    }
    return [];
  }

  async createDonation(insertDonation: InsertDonation): Promise<Donation> {
    if (this.isDbAvailable()) {
      const result = await db.insert(donations).values(insertDonation).returning();
      return result[0];
    }
    // For in-memory, just return the donation with an ID
    const donation: Donation = {
      ...insertDonation,
      id: randomUUID(),
      donorId: insertDonation.donorId ?? null,
      anonymous: insertDonation.anonymous ?? false,
      message: insertDonation.message ?? null,
      transactionId: insertDonation.transactionId ?? null,
      createdAt: new Date()
    };
    return donation;
  }

  async getTotalDonationsByCampaign(campaignId: string): Promise<number> {
    if (this.isDbAvailable()) {
      const result = await db
        .select({ total: sql<number>`sum(${donations.amount})` })
        .from(donations)
        .where(eq(donations.campaignId, campaignId));

      return result[0]?.total || 0;
    }
    return 0;
  }

  // Stories
  async getStories(limit = 50): Promise<Story[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(stories)
        .where(eq(stories.published, true))
        .orderBy(desc(stories.createdAt))
        .limit(limit);
    }
    return Array.from(this.memStories.values()).filter(s => s.published).slice(0, limit);
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
    const id = randomUUID();
    const story: Story = { 
      ...insertStory, 
      id, 
      image: insertStory.image ?? null,
      author: (insertStory.author as Story["author"]) ?? null,
      campaignId: insertStory.campaignId ?? null,
      published: insertStory.published ?? null,
      createdAt: new Date() };
    this.memStories.set(id, story);
    return story;
  }

  // Volunteers
  async getVolunteersByCampaign(campaignId: string): Promise<Volunteer[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(volunteers)
        .where(and(eq(volunteers.campaignId, campaignId), eq(volunteers.status, "approved")))
        .orderBy(desc(volunteers.createdAt));
    }
    return Array.from(this.memVolunteers.values()).filter(
      (volunteer) => volunteer.campaignId === campaignId && volunteer.status === "approved",
    );
  }

  async getVolunteers(limit = 50): Promise<Volunteer[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(volunteers)
        .orderBy(desc(volunteers.createdAt))
        .limit(limit);
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
      campaignId: insertVolunteer.campaignId ?? null,
      skills: (insertVolunteer.skills as string[] | undefined) ?? null,
      availability: insertVolunteer.availability ?? null,
      experience: insertVolunteer.experience ?? null,
      status: "pending",
      createdAt: new Date(),
    };
    this.memVolunteers.set(volunteer.id, volunteer);
    return volunteer;
  }

  // Aid Requests
  async getAidRequests(limit = 50): Promise<AidRequest[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(aidRequests)
        .orderBy(desc(aidRequests.createdAt))
        .limit(limit);
    }
    return [];
  }

  async getAidRequest(id: string): Promise<AidRequest | undefined> {
    if (this.isDbAvailable()) {
      const result = await db.select().from(aidRequests).where(eq(aidRequests.id, id));
      return result[0];
    }
    return undefined;
  }

  async getAidRequestsByUser(userId: string): Promise<AidRequest[]> {
    if (this.isDbAvailable()) {
      return await db
        .select()
        .from(aidRequests)
        .where(eq(aidRequests.userId, userId))
        .orderBy(desc(aidRequests.createdAt));
    }
    return [];
  }

  async createAidRequest(insertAidRequest: InsertAidRequest): Promise<AidRequest> {
    if (this.isDbAvailable()) {
      const result = await db.insert(aidRequests).values(insertAidRequest).returning();
      return result[0];
    }
    const aidRequest: AidRequest = {
      ...insertAidRequest,
      id: randomUUID(),
      status: "pending",
      urgency: insertAidRequest.urgency || "medium",
      documents: Array.isArray(insertAidRequest.documents) ? (insertAidRequest.documents as string[]) : null,
      location: insertAidRequest.location ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return aidRequest;
  }

  async updateAidRequestStatus(id: string, status: string): Promise<void> {
    if (this.isDbAvailable()) {
      await db
        .update(aidRequests)
        .set({ status, updatedAt: new Date() })
        .where(eq(aidRequests.id, id));
    }
  }

  // statistics aggregation
  async getStats(): Promise<{
    totalRaised: number;
    livesImpacted: number;
    activeVolunteers: number;
    goalsAchieved: number;
  }> {
    if (this.isDbAvailable()) {
      // total amount raised across all campaigns
      const totalRes = await db
        .select({ total: sql<number>`sum(${campaigns.raisedAmount})` })
        .from(campaigns);
      const totalRaised = totalRes[0]?.total || 0;

      // active volunteers count (approved)
      const volRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(volunteers)
        .where(eq(volunteers.status, "approved"));
      const activeVolunteers = volRes[0]?.count || 0;

      // campaigns count
      const countRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(campaigns);
      const achievedRes = await db
        .select({ count: sql<number>`count(*)` })
        .from(campaigns)
        .where(sql`${campaigns.raisedAmount} >= ${campaigns.goalAmount}`);
      const goalsAchieved = countRes[0]?.count
        ? (achievedRes[0]?.count / countRes[0].count) * 100
        : 0;

      // for now, livesImpacted mirrors totalRaised or could use custom logic
      return {
        totalRaised,
        livesImpacted: totalRaised,
        activeVolunteers,
        goalsAchieved,
      };
    }

    // in-memory fallback
    let totalRaised = 0;
    for (const c of Array.from(this.memCampaigns.values())) {
      totalRaised += parseFloat(((c.raisedAmount ?? "0") as string).toString());
    }
    const activeVolunteers = 0;
    const totalCount = this.memCampaigns.size;
    const achievedCount = Array.from(this.memCampaigns.values()).filter(
      (c) => parseFloat(((c.raisedAmount ?? "0") as string).toString()) >= parseFloat(c.goalAmount.toString())
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
