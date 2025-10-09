import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Profile interface (not stored in DB, just for API responses)
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
  comment: z.string().optional(),
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

// Database tables for mirroring Notion data
export const profile = pgTable("profile", {
  id: varchar("id").primaryKey(), // Use Notion page ID
  name: text("name").notNull(),
  title: text("title"),
  institution: text("institution"),
  bio: text("bio").notNull(),
  bio_short: text("bio_short"),
  photo_url: text("photo_url"),
  email: text("email"),
  cv_url: text("cv_url"),
  last_synced: timestamp("last_synced").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});
export const blogPosts = pgTable("blog_posts", {
  id: varchar("id").primaryKey(), // Use Notion page ID
  title: text("title").notNull(),
  slug: text("slug"), // Human-readable URL slug
  content: text("content").notNull().default(""),
  excerpt: text("excerpt").default(""),
  comment: text("comment").default(""), // Comment from Notion DB
  published_date: timestamp("published_date").notNull(),
  published: boolean("published").notNull().default(false),
  tags: json("tags").$type<string[]>().default([]),
  read_time: integer("read_time").default(5),
  notion_url: text("notion_url"),
  related_compositions: json("related_compositions").$type<string[]>().default([]), // Array of composition slugs
  last_synced: timestamp("last_synced").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const compositions = pgTable("compositions", {
  id: varchar("id").primaryKey(), // Use Notion page ID
  slug: text("slug"), // URL-friendly version of title
  title: text("title").notNull(),
  instrumentation: json("instrumentation").$type<string[]>().default([]),
  ensemble: json("ensemble").$type<string[]>().default([]),
  year: integer("year"),
  duration: text("duration"),
  publisher: json("publisher").$type<string[]>().default([]),
  premiere_info: text("premiere_info"),
  recording: json("recording").$type<string[]>().default([]),
  streaming_links: text("streaming_links"), // Additional streaming links from Notion
  program_note: text("program_note"), // Program notes from Notion
  published: boolean("published").notNull().default(false),
  last_synced: timestamp("last_synced").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Media reviews cache table
export const mediaReviews = pgTable("media_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  review_text: text("review_text").notNull(),
  order_index: integer("order_index").notNull(), // To maintain review order
  last_synced: timestamp("last_synced").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

export const recordings = pgTable("recordings", {
  id: varchar("id").primaryKey(), // Use Notion page ID
  title: text("title").notNull(),
  slug: text("slug"), // Human-readable URL slug
  composer: text("composer").default("David S. Lefkowitz"),
  performers: text("performers").default(""),
  ensemble: json("ensemble").$type<string[]>().default([]),
  instrumentation: json("instrumentation").$type<string[]>().default([]),
  year: integer("year"),
  ranking_within_year: integer("ranking_within_year"),
  duration: text("duration"),
  label: text("label").default(""),
  label_url: text("label_url"),
  links: text("links"),
  album_cover: text("album_cover"),
  composition: text("composition"),
  album_track_listing: json("album_track_listing").$type<string[]>().default([]),
  last_synced: timestamp("last_synced").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const aboutContent = pgTable("about_content", {
  id: varchar("id").primaryKey(), // Use Notion page ID
  content: text("content").notNull(), // Main about content
  bio: text("bio").default(""), // Biography section
  education: text("education").default(""), // Education section
  awards: text("awards").default(""), // Awards section
  commissions: text("commissions").default(""), // Commissions section
  performances: text("performances").default(""), // Notable performances section
  press: text("press").default(""), // Press quotes section
  last_synced: timestamp("last_synced").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const media = pgTable("media", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`), // Use UUID for local uploads
  title: text("title").notNull(),
  description: text("description").default(""),
  image_url: text("image_url").notNull(), // Will store object storage path
  alt_text: text("alt_text").default(""),
  category: text("category").default(""),
  date_taken: timestamp("date_taken"),
  photo_credits: text("photo_credits").default(""),
  display_order: integer("display_order").default(0), // For ordering photos
  published: boolean("published").notNull().default(true), // Default to published for uploads
  file_name: text("file_name"), // Original file name
  file_size: integer("file_size"), // File size in bytes
  content_type: text("content_type"), // MIME type
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Keep the existing user schema for authentication if needed later
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Simple analytics tracking table
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  event_type: text("event_type").notNull(), // 'fyc_visit', 'listen_now_click', 'streaming_link_click'
  event_data: text("event_data"), // Optional data like which streaming link was clicked
  created_at: timestamp("created_at").defaultNow(),
});

// Create insert and select schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  last_synced: true,
  created_at: true,
  updated_at: true,
});

export const insertCompositionSchema = createInsertSchema(compositions).omit({
  id: true,
  last_synced: true,
  created_at: true,
  updated_at: true,
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  last_synced: true,
  created_at: true,
  updated_at: true,
});

export const insertMediaSchema = createInsertSchema(media).omit({
  id: true,
  last_synced: true,
  created_at: true,
  updated_at: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  created_at: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProfileSchema = createInsertSchema(profile).omit({
  id: true,
  last_synced: true,
  updated_at: true,
});

export const insertAboutContentSchema = createInsertSchema(aboutContent).omit({
  id: true,
  last_synced: true,
  updated_at: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  created_at: true,
});

// Export types
export type ProfileData = typeof profile.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type Composition = typeof compositions.$inferSelect;
export type InsertComposition = z.infer<typeof insertCompositionSchema>;
export type Recording = typeof recordings.$inferSelect;
export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Media = typeof media.$inferSelect;
export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type AboutContent = typeof aboutContent.$inferSelect;
export type InsertAboutContent = z.infer<typeof insertAboutContentSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
