import { randomUUID } from "crypto";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import type {
  User, InsertUser, Campaign, InsertCampaign, Donation, InsertDonation,
  Story, InsertStory, Volunteer, InsertVolunteer, AidRequest, InsertAidRequest,
} from "../shared/schema";

dotenv.config({ path: path.resolve(process.cwd(), "api/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required");
}

const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
type Table = "users" | "campaigns" | "donations" | "stories" | "volunteers" | "aid_requests";
type Model = User | Campaign | Donation | Story | Volunteer | AidRequest;

const columns: Record<string, string> = {
  fullName: "full_name", goalAmount: "goal_amount", raisedAmount: "raised_amount",
  startDate: "start_date", endDate: "end_date", createdAt: "created_at", updatedAt: "updated_at",
  campaignId: "campaign_id", donorId: "donor_id", paymentMethod: "payment_method",
  transactionId: "transaction_id", authorId: "author_id", published: "published", userId: "user_id",
  verificationToken: "verification_token",
};
const toDb = (value: Record<string, unknown>) => Object.fromEntries(Object.entries(value).map(([key, item]) => [columns[key] || key, item]));
const fromDb = <T extends Model>(value: Record<string, any>): T => {
  const result: Record<string, any> = {};
  for (const [key, item] of Object.entries(value)) {
    const camel = Object.entries(columns).find(([, dbKey]) => dbKey === key)?.[0] || key;
    result[camel] = ["createdAt", "updatedAt", "startDate", "endDate"].includes(camel) && item ? new Date(item) : item;
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
  createUser(user: InsertUser): Promise<User>; updateUser(id: string, user: Partial<User>): Promise<User | undefined>; getUsers(limit?: number): Promise<User[]>;
  getCampaigns(limit?: number): Promise<Campaign[]>; getAllCampaigns(limit?: number): Promise<Campaign[]>; getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>; updateCampaign(id: string, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>; deleteCampaign(id: string): Promise<void>; updateCampaignRaisedAmount(id: string, amount: number): Promise<void>;
  getDonations(limit?: number): Promise<Donation[]>; getDonation(id: string): Promise<Donation | undefined>; getDonationByTransactionId(transactionId: string): Promise<Donation | undefined>; getDonationsByCampaign(campaignId: string): Promise<Donation[]>; getDonationsByDonor(donorId: string): Promise<Donation[]>; createDonation(donation: InsertDonation): Promise<Donation>; getTotalDonationsByCampaign(campaignId: string): Promise<number>;
  getStories(limit?: number): Promise<Story[]>; getStory(id: string): Promise<Story | undefined>; createStory(story: InsertStory): Promise<Story>; updateStory(id: string, story: Partial<InsertStory>): Promise<Story | undefined>; deleteStory(id: string): Promise<void>;
  getVolunteersByCampaign(campaignId: string): Promise<Volunteer[]>; getVolunteersByUser(userId: string): Promise<Volunteer[]>; getVolunteers(limit?: number): Promise<Volunteer[]>; createVolunteer(volunteer: InsertVolunteer): Promise<Volunteer>; updateVolunteerStatus(id: string, status: string): Promise<void>; deleteVolunteer(id: string): Promise<void>;
  getAidRequests(limit?: number): Promise<AidRequest[]>; getAidRequest(id: string): Promise<AidRequest | undefined>; getAidRequestsByUser(userId: string): Promise<AidRequest[]>; createAidRequest(aidRequest: InsertAidRequest): Promise<AidRequest>; updateAidRequestStatus(id: string, status: string): Promise<void>; deleteAidRequest(id: string): Promise<void>;
  getStats(): Promise<{ totalRaised: number; livesImpacted: number; activeVolunteers: number; goalsAchieved: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string) { return one<User>("users", (q) => q.eq("id", id)); }
  async getUserByUsername(username: string) { return one<User>("users", (q) => q.eq("username", username)); }
  async getUserByEmail(email: string) { return one<User>("users", (q) => q.eq("email", email)); }
  async getUserByVerificationToken(token: string) { return one<User>("users", (q) => q.eq("verification_token", token)); }
  async createUser(user: InsertUser) { return insert<User>("users", { ...user, verified: false, blocked: false, verificationToken: randomUUID() }); }
  async updateUser(id: string, user: Partial<User>) { return update<User>("users", id, user); }
  async getUsers(limit = 100) { return select<User>("users", (q) => q.limit(limit)); }

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

  async getStories(limit = 50) { return select<Story>("stories", (q) => newest(q).eq("published", true).limit(limit)); }
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
