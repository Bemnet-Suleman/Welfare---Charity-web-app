import type { Express } from "express";
import passport from "passport";
import { storage } from "./storage";
import { insertUserSchema, insertCampaignSchema, insertDonationSchema, insertStorySchema, insertVolunteerSchema, insertAidRequestSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import multer from "multer";

export async function registerRoutes(app: Express, upload: any): Promise<void> {
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
      const allowedRoles = ["donor", "volunteer", "beneficiary"];
      const safeRole = allowedRoles.includes(userData.role || "") ? userData.role : "donor";
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        role: safeRole,
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

  app.get("/api/users", async (req, res) => {
    const currentUser = req.user as unknown as { role?: string } | undefined;
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

      const updateSchema = isSystemAdmin
        ? baseSchema.extend({
            role: z.string().optional().refine((value) =>
              !value || ["donor", "volunteer", "beneficiary", "admin", "system_admin"].includes(value),
              { message: "Invalid role" },
            ),
            verified: z.boolean().optional(),
          })
        : baseSchema;

      const updatePayload = updateSchema.parse({
        ...req.body,
        avatar: req.file ? `/uploads/${req.file.filename}` : req.body.avatar,
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

  app.post("/api/campaigns", upload.single("image"), async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      const currentUser = req.user as unknown as { role?: string };
      if (!["admin", "system_admin"].includes(currentUser.role || "")) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const campaignData: any = { ...req.body };
      if (req.file) {
        campaignData.image = `/uploads/${req.file.filename}`;
      }

      const incoming = insertCampaignSchema.parse(campaignData);
      const campaign = await storage.createCampaign(incoming);
      res.json(campaign);
    } catch (error) {
      console.error("Campaign creation error:", error);
      res.status(400).json({ error: "Invalid campaign data" });
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

      const updateData: Partial<InsertCampaign> = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
      }

      const updated = await storage.updateCampaign(req.params.id, updateData);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: "Invalid campaign data" });
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
      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || "CHASECK_TEST-WB6QQBYFjbHtuPdZd7KadnkVND38cQV9";
      
      if (!chapaSecretKey) {
        return res.status(500).json({ error: "Chapa payment provider is not configured." });
      }

      const txRef = `donation_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      const baseUrl = process.env.NODE_ENV === "production" 
  ? "" 
  : `http://localhost:${process.env.PORT || 5000}`;
      const callbackUrl = `${baseUrl}/api/payments/chapa/verify?tx_ref=${encodeURIComponent(txRef)}`;
      const returnUrl = `${baseUrl}/donate?status=success&tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;

      const session = req.session as any;
      if (!session.pendingDonations) {
        session.pendingDonations = {};
      }

      session.pendingDonations[txRef] = {
        campaignId,
        amount: String(amount),
        donorId: donorId ?? null,
        anonymous: Boolean(anonymous),
        message: "",
        donationType: donationType || "one-time",
        email,
        firstName: firstName || "",
        lastName: lastName || "",
      };
      const chapaResponse = await fetch("https://api.chapa.co/v1/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "ETB",
          email,
          first_name: firstName || "",
          last_name: lastName || "",
          tx_ref: txRef,
          callback_url: callbackUrl,
          return_url: returnUrl,
        }),
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

      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET;
      if (!chapaSecretKey) {
        return res.status(500).json({ error: "Chapa payment provider is not configured." });
      }

      const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
        headers: {
          Authorization: `Bearer ${chapaSecretKey}`,
          "Content-Type": "application/json",
        },
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok || verifyData?.data?.status !== "success") {
        const message = verifyData?.message || verifyData?.data?.message || "Payment verification failed.";
        return res.status(400).json({ error: message });
      }

      // Fix: Cast session to any to access custom property
      const session = req.session as any;
      const pendingDonation = session?.pendingDonations?.[txRef];
      
      if (!pendingDonation) {
        return res.status(404).json({ error: "Pending donation not found" });
      }

      const donation = await storage.createDonation({
        campaignId: pendingDonation.campaignId,
        donorId: pendingDonation.donorId,
        amount: pendingDonation.amount,
        anonymous: pendingDonation.anonymous,
        message: pendingDonation.message,
        paymentMethod: "chapa",
        transactionId: txRef,
      });

      await storage.updateCampaignRaisedAmount(pendingDonation.campaignId, parseFloat(pendingDonation.amount));
      
      delete session.pendingDonations[txRef];

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
        author: story.author ?? {
          name: "Anonymous",
          role: "Beneficiary",
          avatar: story.image ?? undefined,
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

    const campaign = story.campaignId ? await storage.getCampaign(story.campaignId) : null;

    const enriched = {
      ...story,
      author: story.author ?? {
        name: "Anonymous",
        role: "Beneficiary",
        avatar: story.image ?? undefined,
      },
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

      const updateData: Partial<InsertStory> = { ...req.body };
      if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
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
    const volunteers = await storage.getVolunteersByCampaign(req.params.id);
    res.json(volunteers);
  });

  app.get("/api/volunteers", async (req, res) => {
    const currentUser = req.user as unknown as { role?: string } | undefined;
    if (!currentUser || !["admin", "system_admin"].includes(currentUser.role || "")) {
      return res.status(403).json({ error: "Forbidden" });
    }
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const volunteers = await storage.getVolunteers(limit);
    res.json(volunteers);
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
      const volunteerData = insertVolunteerSchema.parse(req.body);
      const volunteer = await storage.createVolunteer(volunteerData);
      res.json(volunteer);
    } catch (error) {
      res.status(400).json({ error: "Invalid volunteer data" });
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

}
