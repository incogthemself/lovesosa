import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertProfileSchema } from "@shared/schema";
import { writeFile, unlink, mkdir } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import "./types";

export async function registerRoutes(app: Express): Promise<Server> {
  // Ensure uploads directory exists
  await mkdir("public/uploads", { recursive: true });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        username: validatedData.username,
        password: hashedPassword,
      });
      
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ id: user.id, username: user.username });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    res.json({ id: req.session.userId, username: req.session.username });
  });

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
      if (!req.session.userId) {
        return res.status(401).json({ message: "Must be logged in to create a profile" });
      }

      const validatedData = insertProfileSchema.parse(req.body);
      
      const existingProfile = await storage.getProfileByUsername(validatedData.username);
      if (existingProfile) {
        return res.status(400).json({ message: "Profile with this username already exists" });
      }

      const profile = await storage.createProfile(req.session.userId, validatedData);
      res.status(201).json(profile);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update profile
  app.put("/api/profiles/:username", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Must be logged in to update a profile" });
      }

      const profile = await storage.getProfileByUsername(req.params.username);
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      if (profile.userId !== req.session.userId) {
        return res.status(403).json({ message: "You can only edit your own profile" });
      }

      if (req.body.username && req.body.username !== req.params.username) {
        return res.status(400).json({ message: "Cannot change username" });
      }
      
      const updates = insertProfileSchema.partial().omit({ username: true }).parse(req.body);
      const updatedProfile = await storage.updateProfile(req.params.username, updates);
      res.json(updatedProfile);
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

  const httpServer = createServer(app);

  return httpServer;
}
