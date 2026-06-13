import type { Express } from "express";
import passport from "passport";
import { randomUUID } from "crypto";
import { storage } from "./storage";
import { insertUserSchema, insertCampaignSchema, insertDonationSchema, insertStorySchema, insertVolunteerSchema, insertAidRequestSchema, type InsertCampaign, type InsertStory } from "../../shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import multer from "multer";
import { sendVerificationEmail, sendResendVerificationEmail } from "./email";

type PendingDonation = {
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

const pendingDonations: Record<string, PendingDonation> = {};

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

  app.get("/api/auth/me", async (req, res) => {
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

      res.json({ user: { ...currentUser, isVolunteer } });
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
        password: hashedPassword,
      });

      const verificationToken = user.verificationToken;
      const verificationLink = verificationToken
        ? `${req.protocol}://${req.get("host")}/verify-email/${verificationToken}`
        : null;

      // Send verification email
      if (verificationLink) {
        try {
          await sendVerificationEmail(user.email, verificationLink);
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          // Don't fail registration if email fails to send
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
        verificationToken: null,
      });
      if (!updatedUser) {
        return res.status(500).json({ error: "Unable to verify email" });
      }
      res.json({ message: "Email verified successfully", user: updatedUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to verify email" });
    }
  });

  // Handle browser returns to /donate when Chapa redirects back to backend
  app.get("/donate", async (req: any, res: any, next: any) => {
    try {
      const status = String(req.query.status || "");
      const txRef = String(req.query.tx_ref || "");
      const campaignId = String(req.query.campaignId || "");
      const frontendUrl = String(req.query.frontendUrl || req.get("referer") || process.env.FRONTEND_URL || `http://localhost:5173`);
      const frontendBase = new URL(frontendUrl, "http://localhost:5173").origin;

      console.log("/donate return hit", { status, txRef, campaignId, frontendUrl, frontendBase });

      if (status === "success" && txRef) {
        // perform verification and create donation if missing, then redirect to frontend success page
        const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET || "CHASECK_TEST-WB6QQBYFjbHtuPdZd7KadnkVND38cQV9";
        const verifyResponse = await fetch(`https://api.chapa.co/v1/transaction/verify/${encodeURIComponent(txRef)}`, {
          headers: { Authorization: `Bearer ${chapaSecretKey}`, "Content-Type": "application/json" },
        });
        const verifyData = await verifyResponse.json();
        if (!verifyResponse.ok || verifyData?.data?.status !== "success") {
          return res.redirect(`${frontendBase}/donate?status=failed&tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`);
        }

        // if already processed, redirect to success page
        const existing = await storage.getDonationByTransactionId(txRef);
        if (existing) {
          return res.redirect(`${frontendBase}/donation-success/${existing.id}`);
        }

        const session = req.session as any;
        const pending = session?.pendingDonations?.[txRef] || pendingDonations[txRef] || null;
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
          transactionId: txRef,
        });

        await storage.updateCampaignRaisedAmount(resolvedCampaignId, parseFloat(amount));
        if (session?.pendingDonations) delete session.pendingDonations[txRef];
        delete pendingDonations[txRef];

        return res.redirect(`${frontendBase}/donation-success/${donation.id}`);
      }

      // Not a Chapa return; continue to next middleware (vite/static)
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
      const newToken = randomUUID();
      const updatedUser = await storage.updateUser(user.id, { verificationToken: newToken });
      if (!updatedUser) {
        return res.status(500).json({ error: "Unable to resend verification" });
      }
      const verificationLink = `${req.protocol}://${req.get("host")}/verify-email/${newToken}`;
      
      // Send resend verification email
      try {
        await sendResendVerificationEmail(user.email, verificationLink);
      } catch (emailError) {
        console.error("Failed to send resend verification email:", emailError);
        // Don't fail the request if email fails to send
      }
      
      res.json({ message: "Verification link resent to your email", verificationLink });
    } catch (error) {
      res.status(500).json({ error: "Failed to resend verification" });
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
  const includeArchived = req.query.includeArchived === "true";

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
          donorAvatar:
            donorUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${donorUser.username || donorUser.id}`,
        };
      }),
    );
    res.json(donationsWithDonor);
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
      const rawFrontendUrl = req.get("origin") || req.body?.frontendUrl || req.get("referer") || process.env.FRONTEND_URL;
      const frontendBaseUrl = rawFrontendUrl
        ? new URL(String(rawFrontendUrl), "http://localhost:5173").origin
        : `http://localhost:5173`;
      const backendBaseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
      const callbackUrl = `${backendBaseUrl}/api/payments/chapa/verify?tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;
      const returnUrl = `${frontendBaseUrl}/donate?status=success&tx_ref=${encodeURIComponent(txRef)}&campaignId=${encodeURIComponent(campaignId)}`;

      console.log("Chapa init rawFrontendUrl", rawFrontendUrl, "callback_url", callbackUrl, "return_url", returnUrl);

      const session = req.session as any;
      if (session) {
        session.pendingDonations = session.pendingDonations || {};
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
      }

      pendingDonations[txRef] = {
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

      const chapaSecretKey = process.env.CHAPA_SECRET_KEY || process.env.CHAPA_API_SECRET || "CHASECK_TEST-WB6QQBYFjbHtuPdZd7KadnkVND38cQV9";

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

      const session = req.session as any;
      const campaignId = String(req.query.campaignId || "");
      const pendingDonation = session?.pendingDonations?.[txRef] || pendingDonations[txRef];
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
        transactionId: txRef,
      });

      await storage.updateCampaignRaisedAmount(resolvedCampaignId, parseFloat(amount));
      
      if (session?.pendingDonations) {
        delete session.pendingDonations[txRef];
      }
      delete pendingDonations[txRef];

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

    const donations = await storage.getDonations(limit);
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

  // Stories
  app.get("/api/stories", async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    let stories = await storage.getStories(limit);

    const search = (req.query.search as string) || "";
    const category = (req.query.category as string) || "";
    const campaignId = (req.query.campaignId as string) || "";
    const publishedOnly = req.query.published === undefined || req.query.published === "true";

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
    const volunteers = await storage.getVolunteersByCampaign(req.params.id);
    res.json(volunteers);
  });

  app.get("/api/volunteers", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    // Check if the request is coming from the public Volunteer feed
    const listingsOnly = req.query.listingsOnly === "true";
    
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

        return {
          ...v, // Keeps userId, status, and everything intact for the Admin Dashboard!
          isListing: isOpportunityListing,
          campaign: campaign ? { title: campaign.title, category: campaign.category, image: campaign.image, location: campaign.location } : null,
          campaignTitle: campaign?.title || null,
          campaignCategory: campaign?.category || "General",
        };
      })
    );

    // If the public feed asked for listings only, filter it here safely
    if (listingsOnly) {
      return res.json(enrichedVolunteers.filter(item => item.isListing === true));
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
      } else {
        // Fallback catch-all if data leaks through unauthenticated pipelines
        payload.status = "pending";
        if (payload.userId === null || payload.userId === "" || payload.userId === undefined) {
          delete payload.userId;
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

  app.post("/api/aid-requests", upload.array("documents"), async (req, res) => {
    try {
      const documents = req.files ? (req.files as Express.Multer.File[]).map(file => `/uploads/${file.filename}`) : [];
      const aidRequestData = {
        ...req.body,
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
