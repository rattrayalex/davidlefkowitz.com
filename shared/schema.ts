import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Types for Notion API responses
export interface NotionPage {
  id: string;
  title: string;
  content?: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
}

export interface Composition {
  id: string;
  title: string;
  instrumentation: string;
  description: string;
  year: number;
  category: string;
  duration?: string;
  premiere_info?: string;
  score_url?: string;
  audio_url?: string;
}

export interface Recording {
  id: string;
  title: string;
  performer: string;
  description: string;
  release_date: string;
  audio_url?: string;
  video_url?: string;
  album_cover?: string;
  duration?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  published_date: string;
  read_time: number;
  tags: string[];
  published: boolean;
}

export interface Profile {
  name: string;
  title: string;
  institution: string;
  bio: string;
  bio_short: string;
  photo_url: string;
  email: string;
  cv_url?: string;
}

// Zod schemas for validation
export const compositionSchema = z.object({
  title: z.string().min(1),
  instrumentation: z.string().min(1),
  description: z.string().min(1),
  year: z.number().min(1900).max(new Date().getFullYear() + 10),
  category: z.string().min(1),
  duration: z.string().optional(),
  premiere_info: z.string().optional(),
  score_url: z.string().url().optional(),
  audio_url: z.string().url().optional(),
});

export const recordingSchema = z.object({
  title: z.string().min(1),
  performer: z.string().min(1),
  description: z.string().min(1),
  release_date: z.string(),
  audio_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  album_cover: z.string().url().optional(),
  duration: z.string().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  published_date: z.string(),
  read_time: z.number().min(1),
  tags: z.array(z.string()),
  published: z.boolean(),
});

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Keep the existing user schema for authentication if needed later
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
