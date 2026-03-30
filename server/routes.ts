import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from "passport";
import { storage } from "./storage";
import { insertUserSchema, insertCampaignSchema, insertDonationSchema, insertStorySchema, insertVolunteerSchema, insertAidRequestSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
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

  app.get("/api/auth/me", (req, res) => {
    if (req.user) {
      res.json({ user: req.user });
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Registration error" });
        }
        res.json({ user });
      });
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  // Users
  // Users
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  });

  app.put("/api/users/:id", async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const currentUser = req.user as unknown as { id?: string; role?: string };

    // Users can update only their own profile unless admin
    if (currentUser.id !== req.params.id && currentUser.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    try {
      // Allow only a fixed set of fields for profile update
      const updatePayload = z.object({
        username: z.string().min(3).optional(),
        fullName: z.string().optional(),
        email: z.string().email().optional(),
        avatar: z.string().url().optional(),
        password: z.string().min(6).optional(),
      }).partial().parse(req.body);

      if (updatePayload.password) {
        updatePayload.password = await bcrypt.hash(updatePayload.password, 10);
      }

      const updatedUser = await storage.updateUser(req.params.id, updatePayload);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Keep session user in sync
      req.user = updatedUser;

      res.json({ user: updatedUser });
    } catch (error) {
      res.status(400).json({ error: "Invalid update data" });
    }
  });

  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    let campaigns = await storage.getCampaigns(limit);

    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";

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
    // no organizer relationship in revised schema
    res.json({ ...campaign, organizer: null });
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const incoming = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(incoming);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ error: "Invalid campaign data" });
    }
  });

  app.get("/api/campaigns/:id/donations", async (req, res) => {
    const donations = await storage.getDonationsByCampaign(req.params.id);
    res.json(donations);
  });

  // Donations
  app.post("/api/donations", async (req, res) => {
    try {
      const donationData = insertDonationSchema.parse(req.body);
      const donation = await storage.createDonation(donationData);

      // Update campaign raised amount
      await storage.updateCampaignRaisedAmount(donation.campaignId, parseFloat(donation.amount.toString()));

      res.json(donation);
    } catch (error) {
      res.status(400).json({ error: "Invalid donation data" });
    }
  });

  app.get("/api/donations", async (req, res) => {
    const donorId = req.query.donorId as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (donorId) {
      const donations = await storage.getDonationsByDonor(donorId);
      res.json(donations);
      return;
    }

    const donations = await storage.getDonations(limit);
    res.json(donations);
  });

  // Stories
  app.get("/api/stories", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    let stories = await storage.getStories(limit);

    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";

    if (search) {
      const lower = search.toLowerCase();
      stories = stories.filter(s =>
        s.title.toLowerCase().includes(lower) ||
        s.content.toLowerCase().includes(lower)
      );
    }

    const enriched = await Promise.all(stories.map(async (story) => {
      const campaign = story.campaignId ? await storage.getCampaign(story.campaignId) : null;
      return {
        ...story,
        author: null,
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

    const campaign = story.campaignId ? await storage.getCampaign(story.campaignId) : null;

    const enriched = {
      ...story,
      author: null,
      category: campaign?.category || "Impact Story",
    };
    res.json(enriched);
  });

  app.post("/api/stories", async (req, res) => {
    try {
      const storyData = insertStorySchema.parse(req.body);
      const story = await storage.createStory(storyData);
      res.json(story);
    } catch (error) {
      res.status(400).json({ error: "Invalid story data" });
    }
  });

  // Volunteers
  app.get("/api/campaigns/:id/volunteers", async (req, res) => {
    const volunteers = await storage.getVolunteersByCampaign(req.params.id);
    res.json(volunteers);
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
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      res.status(400).json({ error: "Invalid volunteer data" });
    }
  });

  // Aid Requests
  app.get("/api/aid-requests", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
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

  app.post("/api/aid-requests", async (req, res) => {
    try {
      const aidRequestData = insertAidRequestSchema.parse(req.body);
      const aidRequest = await storage.createAidRequest(aidRequestData);
      res.json(aidRequest);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
