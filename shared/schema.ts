import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role").default("donor").notNull(), // donor, volunteer, beneficiary, admin, system_admin
  avatar: text("avatar"),
  verified: boolean("verified").default(false),
  blocked: boolean("blocked").default(false),
  verificationToken: text("verification_token"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  category: text("category").notNull(),
  goalAmount: decimal("goal_amount", { precision: 10, scale: 2 }).notNull(),
  raisedAmount: decimal("raised_amount", { precision: 10, scale: 2 }).default("0"),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").default("active").notNull(), // active, completed, paused, emergency
  urgent: boolean("urgent").default(false),
  location: text("location"),
  archived: boolean("archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const donations = pgTable("donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").references(() => campaigns.id).notNull(),
  donorId: varchar("donor_id").references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  anonymous: boolean("anonymous").default(false),
  message: text("message"),
  paymentMethod: text("payment_method").notNull(),
  transactionId: text("transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
const authorSchema = z.object({
  name: z.string(),
  role: z.string(),
  avatar: z.string().optional(),
});
export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  author: jsonb("author").$type<z.infer<typeof authorSchema>>(),
  authorId: varchar("author_id").references(() => users.id),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const volunteers = pgTable("volunteers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  campaignId: varchar("campaign_id").references(() => campaigns.id),
  skills: jsonb("skills").$type<string[]>(),
  availability: text("availability"),
  experience: text("experience"),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const aidRequests = pgTable("aid_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  urgency: text("urgency").default("medium").notNull(), // low, medium, high, emergency
  status: text("status").default("pending").notNull(), // pending, under_review, approved, rejected, fulfilled
  documents: jsonb("documents").$type<string[]>(), // array of document URLs
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  email: z.string().email("Invalid email address"),
  fullName: z.string().optional().nullable().default(""),
  role: z.string().optional().default("donor"),
  avatar: z.string().optional().nullable().default(null),
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  raisedAmount: true,
  createdAt: true,
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
});

export const insertVolunteerSchema = createInsertSchema(volunteers).omit({
  id: true,
  createdAt: true,
});

export const insertAidRequestSchema = createInsertSchema(aidRequests)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    status: true, // status is server-managed, always defaults to "pending"
  })
  .extend({
    userId: z.string().min(1, "User ID is required"),
    title: z.string().min(1, "Title is required").max(255, "Title must be less than 255 characters"),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000, "Description must be less than 5000 characters"),
    category: z.string().refine(
      (val) => ["medical", "education", "food", "shelter", "emergency", "other"].includes(val),
      "Invalid aid category"
    ),
    urgency: z.string()
      .refine(
        (val) => ["low", "medium", "high", "emergency"].includes(val),
        "Invalid urgency level"
      )
      .default("medium"),
    location: z.string()
      .min(1, "Location is required")
      .max(255, "Location must be less than 255 characters"),
    documents: z.array(z.string()).optional().default([]),
  });

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donations.$inferSelect;

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

export type InsertVolunteer = z.infer<typeof insertVolunteerSchema>;
export type Volunteer = typeof volunteers.$inferSelect;

export type InsertAidRequest = z.infer<typeof insertAidRequestSchema>;
export type AidRequest = typeof aidRequests.$inferSelect;
