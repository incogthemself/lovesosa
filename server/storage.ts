import { type Profile, type InsertProfile, type CredentialLog, type InsertCredentialLog } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAllProfiles(): Promise<Profile[]>;
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByUsername(username: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(username: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;
  incrementViewCount(username: string): Promise<Profile | undefined>;
  
  createCredentialLog(log: InsertCredentialLog): Promise<CredentialLog>;
  getAllCredentialLogs(): Promise<CredentialLog[]>;
}

export class MemStorage implements IStorage {
  private profiles: Map<string, Profile>;
  private credentialLogs: Map<string, CredentialLog>;

  constructor() {
    this.profiles = new Map();
    this.credentialLogs = new Map();
  }

  async getAllProfiles(): Promise<Profile[]> {
    return Array.from(this.profiles.values());
  }

  async getProfile(id: string): Promise<Profile | undefined> {
    return this.profiles.get(id);
  }

  async getProfileByUsername(username: string): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(
      (profile) => profile.username === username,
    );
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = randomUUID();
    const profile: Profile = { 
      id,
      username: insertProfile.username,
      displayName: insertProfile.displayName ?? null,
      bio: insertProfile.bio ?? null,
      profilePicture: insertProfile.profilePicture ?? null,
      backgroundVideo: insertProfile.backgroundVideo ?? null,
      backgroundVideoMuted: insertProfile.backgroundVideoMuted ?? 1,
      backgroundAudio: insertProfile.backgroundAudio ?? null,
      viewCount: 0,
      snapchat: insertProfile.snapchat ?? null,
      discord: insertProfile.discord ?? null,
      twitter: insertProfile.twitter ?? null,
      instagram: insertProfile.instagram ?? null,
      tiktok: insertProfile.tiktok ?? null,
      youtube: insertProfile.youtube ?? null,
      github: insertProfile.github ?? null,
      twitch: insertProfile.twitch ?? null,
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(username: string, updates: Partial<InsertProfile>): Promise<Profile | undefined> {
    const profile = await this.getProfileByUsername(username);
    if (profile) {
      const normalizedUpdates: Partial<Profile> = {};
      
      if (updates.displayName !== undefined) normalizedUpdates.displayName = updates.displayName ?? null;
      if (updates.bio !== undefined) normalizedUpdates.bio = updates.bio ?? null;
      if (updates.profilePicture !== undefined) normalizedUpdates.profilePicture = updates.profilePicture ?? null;
      if (updates.backgroundVideo !== undefined) normalizedUpdates.backgroundVideo = updates.backgroundVideo ?? null;
      if (updates.backgroundVideoMuted !== undefined) normalizedUpdates.backgroundVideoMuted = updates.backgroundVideoMuted ?? 1;
      if (updates.backgroundAudio !== undefined) normalizedUpdates.backgroundAudio = updates.backgroundAudio ?? null;
      if (updates.snapchat !== undefined) normalizedUpdates.snapchat = updates.snapchat ?? null;
      if (updates.discord !== undefined) normalizedUpdates.discord = updates.discord ?? null;
      if (updates.twitter !== undefined) normalizedUpdates.twitter = updates.twitter ?? null;
      if (updates.instagram !== undefined) normalizedUpdates.instagram = updates.instagram ?? null;
      if (updates.tiktok !== undefined) normalizedUpdates.tiktok = updates.tiktok ?? null;
      if (updates.youtube !== undefined) normalizedUpdates.youtube = updates.youtube ?? null;
      if (updates.github !== undefined) normalizedUpdates.github = updates.github ?? null;
      if (updates.twitch !== undefined) normalizedUpdates.twitch = updates.twitch ?? null;
      
      const updatedProfile = { ...profile, ...normalizedUpdates };
      this.profiles.set(profile.id, updatedProfile);
      return updatedProfile;
    }
    return undefined;
  }

  async incrementViewCount(username: string): Promise<Profile | undefined> {
    const profile = await this.getProfileByUsername(username);
    if (profile) {
      profile.viewCount += 1;
      this.profiles.set(profile.id, profile);
      return profile;
    }
    return undefined;
  }

  async createCredentialLog(insertLog: InsertCredentialLog): Promise<CredentialLog> {
    const id = randomUUID();
    const log: CredentialLog = {
      ...insertLog,
      id,
      timestamp: new Date().toISOString(),
    };
    this.credentialLogs.set(id, log);
    return log;
  }

  async getAllCredentialLogs(): Promise<CredentialLog[]> {
    return Array.from(this.credentialLogs.values());
  }
}

export const storage = new MemStorage();
