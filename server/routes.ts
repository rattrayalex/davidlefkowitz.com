import type { Express } from "express";
import { createServer, type Server } from "http";
import { notion, NOTION_PAGE_ID, findDatabaseByTitle } from "./notion";
import { contactFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
    // Get profile information
    app.get("/api/profile", async (req, res) => {
        try {
            // Profile data from the existing website
            const profile = {
                name: "David S. Lefkowitz",
                title: "Composer, Professor of Music Composition & Theory",
                institution: "UCLA Herb Alpert School of Music",
                bio: "David S. Lefkowitz is a composer, theorist, and professor at UCLA. His work explores contemporary musical expression through innovative compositional techniques and advanced harmonic theory.",
                bio_short: "Composer, Theorist, and Professor at UCLA",
                photo_url: "https://www.davidlefkowitz.com/image/attachment%3A476b5447-bc36-47ab-a850-9b582c5e0782%3ADavidSLefkowitz_harp_vertical.jpg?table=block&id=22e3907b-2ee6-802d-b759-f91716caee9a&spaceId=e88500c6-581b-4ed6-abcb-6b83ce43de6d&width=2000&userId=&cache=v2",
                email: "dlefkowitz@ucla.edu",
                cv_url: null
            };
            res.json(profile);
        } catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ error: "Failed to fetch profile" });
        }
    });

    // Get all compositions
    app.get("/api/compositions", async (req, res) => {
        try {
            if (!notion) {
                return res.json([]);
            }
            const compositionsDb = await findDatabaseByTitle("Compositions");
            if (!compositionsDb) {
                return res.json([]);
            }

            const response = await notion.databases.query({
                database_id: compositionsDb.id,
            });

            const compositions = response.results.map((page: any) => {
                const properties = page.properties;
                return {
                    id: page.id,
                    title: properties.Title?.title?.[0]?.plain_text || "Untitled",
                    instrumentation: properties.Instrumentation?.rich_text?.[0]?.plain_text || "",
                    description: properties.Description?.rich_text?.[0]?.plain_text || "",
                    year: properties.Year?.number || new Date().getFullYear(),
                    category: properties.Category?.select?.name || "Other",
                    duration: properties.Duration?.rich_text?.[0]?.plain_text || "",
                    premiere_info: properties.PremiereInfo?.rich_text?.[0]?.plain_text || "",
                    score_url: properties.ScoreURL?.url || "",
                    audio_url: properties.AudioURL?.url || "",
                };
            });

            // Sort by year descending
            compositions.sort((a, b) => b.year - a.year);
            res.json(compositions);
        } catch (error) {
            console.error("Error fetching compositions:", error);
            res.status(500).json({ error: "Failed to fetch compositions" });
        }
    });

    // Get all recordings
    app.get("/api/recordings", async (req, res) => {
        try {
            if (!notion) {
                return res.json([]);
            }
            const recordingsDb = await findDatabaseByTitle("Recordings");
            if (!recordingsDb) {
                return res.json([]);
            }

            const response = await notion.databases.query({
                database_id: recordingsDb.id,
            });

            const recordings = response.results.map((page: any) => {
                const properties = page.properties;
                return {
                    id: page.id,
                    title: properties.Title?.title?.[0]?.plain_text || "Untitled",
                    performer: properties.Performer?.rich_text?.[0]?.plain_text || "",
                    description: properties.Description?.rich_text?.[0]?.plain_text || "",
                    release_date: properties.ReleaseDate?.date?.start || "",
                    audio_url: properties.AudioURL?.url || "",
                    video_url: properties.VideoURL?.url || "",
                    album_cover: properties.AlbumCover?.url || "",
                    duration: properties.Duration?.rich_text?.[0]?.plain_text || "",
                };
            });

            // Sort by release date descending
            recordings.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
            res.json(recordings);
        } catch (error) {
            console.error("Error fetching recordings:", error);
            res.status(500).json({ error: "Failed to fetch recordings" });
        }
    });

    // Get all blog posts
    app.get("/api/blog-posts", async (req, res) => {
        try {
            if (!notion) {
                return res.json([]);
            }
            const blogDb = await findDatabaseByTitle("BlogPosts");
            if (!blogDb) {
                return res.json([]);
            }

            const response = await notion.databases.query({
                database_id: blogDb.id,
                filter: {
                    property: "Published",
                    checkbox: {
                        equals: true
                    }
                }
            });

            const posts = response.results.map((page: any) => {
                const properties = page.properties;
                return {
                    id: page.id,
                    title: properties.Title?.title?.[0]?.plain_text || "Untitled",
                    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
                    content: properties.Content?.rich_text?.[0]?.plain_text || "",
                    published_date: properties.PublishedDate?.date?.start || "",
                    read_time: properties.ReadTime?.number || 5,
                    tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                    published: properties.Published?.checkbox || false,
                };
            });

            // Sort by published date descending
            posts.sort((a, b) => new Date(b.published_date).getTime() - new Date(a.published_date).getTime());
            res.json(posts);
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            res.status(500).json({ error: "Failed to fetch blog posts" });
        }
    });

    // Get single blog post
    app.get("/api/blog-posts/:id", async (req, res) => {
        try {
            if (!notion) {
                return res.status(404).json({ error: "Post not found" });
            }
            const { id } = req.params;
            
            const page = await notion.pages.retrieve({ page_id: id });
            const properties = (page as any).properties;

            const post = {
                id: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "Untitled",
                excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
                content: properties.Content?.rich_text?.[0]?.plain_text || "",
                published_date: properties.PublishedDate?.date?.start || "",
                read_time: properties.ReadTime?.number || 5,
                tags: properties.Tags?.multi_select?.map((tag: any) => tag.name) || [],
                published: properties.Published?.checkbox || false,
            };

            res.json(post);
        } catch (error) {
            console.error("Error fetching blog post:", error);
            res.status(500).json({ error: "Failed to fetch blog post" });
        }
    });

    // Contact form submission
    app.post("/api/contact", async (req, res) => {
        try {
            const validatedData = contactFormSchema.parse(req.body);

            // Here you would typically send an email or save to a database
            // For now, we'll just log the contact form submission
            console.log("Contact form submission:", validatedData);

            // In a real implementation, you might:
            // 1. Send an email using a service like SendGrid or Nodemailer
            // 2. Save the message to a Notion database
            // 3. Send a notification to the website owner

            res.json({ success: true, message: "Thank you for your message. I will get back to you soon!" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ 
                    error: "Validation failed", 
                    details: error.errors 
                });
            }
            console.error("Error processing contact form:", error);
            res.status(500).json({ error: "Failed to send message" });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
