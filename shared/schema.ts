import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const profiles = pgTable("profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
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

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  viewCount: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export const DEFAULT_AVATAR = "/defaults/avatar.svg";
export const DEFAULT_BACKGROUND_COLOR = "#000000";
