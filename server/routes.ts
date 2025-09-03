import type { Express } from "express";
import { createServer, type Server } from "http";
import { notion } from "./notion";
import { contactFormSchema, blogPosts, compositions, recordings, media, contacts, type BlogPost, type Composition, type Recording, type Media } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, lt, gt } from "drizzle-orm";
import { syncBlogPosts, syncCompositions, syncRecordings, syncMedia } from "./sync";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import * as fs from "fs";

// Load database schemas
const schemaData = JSON.parse(fs.readFileSync("server/notion-schemas.json", "utf-8"));

export async function registerRoutes(app: Express): Promise<Server> {
    // Get profile information
    app.get("/api/profile", async (req, res) => {
        try {
            // Profile data from the existing website - exact text only
            const profile = {
                name: "David S. Lefkowitz",
                title: "Composer, Professor of Music Composition & Theory",
                institution: "UCLA Herb Alpert School of Music",
                bio: null, // No bio text on production site
                bio_short: "Composer, Theorist, and Professor at UCLA",
                photo_url: "https://www.davidlefkowitz.com/image/attachment%3A476b5447-bc36-47ab-a850-9b582c5e0782%3ADavidSLefkowitz_harp_vertical.jpg?table=block&id=22e3907b-2ee6-802d-b759-f91716caee9a&spaceId=e88500c6-581b-4ed6-abcb-6b83ce43de6d&width=2000&userId=&cache=v2",
                email: "lefko at ucla.edu",
                cv_url: null
            };
            res.json(profile);
        } catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ error: "Failed to fetch profile" });
        }
    });

    // Get all compositions from local database
    app.get("/api/compositions", async (req, res) => {
        try {
            const compositionsData = await db
                .select()
                .from(compositions)
                .where(eq(compositions.published, true))
                .orderBy(desc(compositions.year));

            const formattedCompositions = compositionsData.map((comp: Composition) => ({
                id: comp.id,
                title: comp.title,
                instrumentation: Array.isArray(comp.instrumentation) ? comp.instrumentation.join(", ") : "",
                ensemble: Array.isArray(comp.ensemble) ? comp.ensemble.join(", ") : "",
                year: comp.year,
                category: Array.isArray(comp.ensemble) && comp.ensemble.length > 0 ? comp.ensemble[0] : "",
                duration: comp.duration || "",
                premiere_info: comp.premiere_info || "",
                publisher: Array.isArray(comp.publisher) ? comp.publisher.join(", ") : "",
                recording: comp.recording || "",
            }));

            res.json(formattedCompositions);
        } catch (error) {
            console.error("Error fetching compositions:", error);
            res.status(500).json({ error: "Failed to fetch compositions" });
        }
    });

    // Get all recordings from local database
    app.get("/api/recordings", async (req, res) => {
        try {
            const recordingsData = await db
                .select()
                .from(recordings)
                .orderBy(desc(recordings.year));

            const formattedRecordings = recordingsData.map((rec: Recording) => ({
                id: rec.id,
                title: rec.title,
                composer: rec.composer,
                performers: Array.isArray(rec.performers) ? rec.performers.join(", ") : "",
                ensemble: Array.isArray(rec.ensemble) ? rec.ensemble.join(", ") : "",
                instrumentation: Array.isArray(rec.instrumentation) ? rec.instrumentation.join(", ") : "",
                year: rec.year,
                duration: rec.duration || "",
                label: Array.isArray(rec.label) ? rec.label.join(", ") : "",
                links: rec.links || "",
            }));

            res.json(formattedRecordings);
        } catch (error) {
            console.error("Error fetching recordings:", error);
            res.status(500).json({ error: "Failed to fetch recordings" });
        }
    });

    // Get all blog posts from local database
    app.get("/api/blog-posts", async (req, res) => {
        try {
            const blogPostsData = await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.published, true))
                .orderBy(desc(blogPosts.published_date));

            const formattedPosts = blogPostsData.map((post: BlogPost) => ({
                id: post.id,
                title: post.title,
                excerpt: post.excerpt || "",
                content: post.content,
                comment: post.comment || "",
                published_date: post.published_date.toLocaleDateString('en-CA'), // Format as YYYY-MM-DD without timezone conversion
                read_time: post.read_time || 5,
                tags: Array.isArray(post.tags) ? post.tags : [],
                published: post.published,
            }));

            res.json(formattedPosts);
        } catch (error) {
            console.error("Error fetching blog posts:", error);
            res.status(500).json({ error: "Failed to fetch blog posts" });
        }
    });

    // Get single blog post from local database
    app.get("/api/blog-posts/:id", async (req, res) => {
        try {
            const { id } = req.params;
            
            const blogPostData = await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.id, id))
                .limit(1);

            if (blogPostData.length === 0) {
                return res.status(404).json({ error: "Post not found" });
            }

            const post = blogPostData[0];
            const formattedPost = {
                id: post.id,
                title: post.title,
                excerpt: post.excerpt || "",
                content: post.content,
                comment: post.comment || "",
                published_date: post.published_date.toLocaleDateString('en-CA'), // Format as YYYY-MM-DD without timezone conversion
                read_time: post.read_time || 5,
                tags: Array.isArray(post.tags) ? post.tags : [],
                published: post.published,
            };

            res.json(formattedPost);
        } catch (error) {
            console.error("Error fetching blog post:", error);
            res.status(500).json({ error: "Failed to fetch blog post" });
        }
    });

    // Get all media from local database
    app.get("/api/media", async (req, res) => {
        try {
            const mediaData = await db
                .select()
                .from(media)
                .where(eq(media.published, true))
                .orderBy(media.display_order, media.created_at);

            const formattedMedia = mediaData.map((item: Media) => ({
                id: item.id,
                title: item.title,
                description: item.description || "",
                image_url: item.image_url,
                alt_text: item.alt_text || "",
                category: item.category || "",
                date_taken: item.date_taken ? item.date_taken.toLocaleDateString('en-CA') : "",
                photo_credits: item.photo_credits || "",
                display_order: item.display_order,
            }));

            res.json(formattedMedia);
        } catch (error) {
            console.error("Error fetching media:", error);
            res.status(500).json({ error: "Failed to fetch media" });
        }
    });

    // Media upload endpoints
    app.post("/api/media/upload-url", async (req, res) => {
        try {
            const objectStorageService = new ObjectStorageService();
            const uploadURL = await objectStorageService.getMediaUploadURL();
            res.json({ uploadURL });
        } catch (error) {
            console.error("Error getting upload URL:", error);
            res.status(500).json({ error: "Failed to get upload URL" });
        }
    });

    app.post("/api/media", async (req, res) => {
        try {
            const { title, description, alt_text, photo_credits, category, image_url, file_name, file_size, content_type } = req.body;
            
            if (!title || !image_url) {
                return res.status(400).json({ error: "Title and image URL are required" });
            }

            // Get the next display order
            const maxOrderResult = await db
                .select({ maxOrder: sql<number>`COALESCE(MAX(${media.display_order}), 0)` })
                .from(media);
            const nextOrder = (maxOrderResult[0]?.maxOrder || 0) + 1;

            const [newMedia] = await db.insert(media).values({
                title,
                description: description || "",
                alt_text: alt_text || "",
                photo_credits: photo_credits || "",
                category: category || "",
                image_url,
                file_name,
                file_size,
                content_type,
                published: true,
                date_taken: new Date(),
                display_order: nextOrder,
            }).returning();

            res.json(newMedia);
        } catch (error) {
            console.error("Error saving media metadata:", error);
            res.status(500).json({ error: "Failed to save media metadata" });
        }
    });

    // Move media item up in order
    app.put("/api/media/:id/move-up", async (req, res) => {
        try {
            const { id } = req.params;
            
            // Get current item
            const [currentItem] = await db.select().from(media).where(eq(media.id, id));
            if (!currentItem) {
                return res.status(404).json({ error: "Media item not found" });
            }

            // Get the item above it
            const [itemAbove] = await db
                .select()
                .from(media)
                .where(lt(media.display_order, currentItem.display_order))
                .orderBy(desc(media.display_order))
                .limit(1);

            if (itemAbove) {
                // Swap display orders
                await db.update(media)
                    .set({ display_order: itemAbove.display_order })
                    .where(eq(media.id, currentItem.id));
                    
                await db.update(media)
                    .set({ display_order: currentItem.display_order })
                    .where(eq(media.id, itemAbove.id));
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Error moving media up:", error);
            res.status(500).json({ error: "Failed to move media up" });
        }
    });

    // Move media item down in order
    app.put("/api/media/:id/move-down", async (req, res) => {
        try {
            const { id } = req.params;
            
            // Get current item
            const [currentItem] = await db.select().from(media).where(eq(media.id, id));
            if (!currentItem) {
                return res.status(404).json({ error: "Media item not found" });
            }

            // Get the item below it
            const [itemBelow] = await db
                .select()
                .from(media)
                .where(gt(media.display_order, currentItem.display_order))
                .orderBy(media.display_order)
                .limit(1);

            if (itemBelow) {
                // Swap display orders
                await db.update(media)
                    .set({ display_order: itemBelow.display_order })
                    .where(eq(media.id, currentItem.id));
                    
                await db.update(media)
                    .set({ display_order: currentItem.display_order })
                    .where(eq(media.id, itemBelow.id));
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Error moving media down:", error);
            res.status(500).json({ error: "Failed to move media down" });
        }
    });

    // Debug endpoint to see current media
    app.get("/api/media/debug", async (req, res) => {
        try {
            const mediaData = await db
                .select({
                    id: media.id,
                    title: media.title,
                    file_name: media.file_name,
                    display_order: media.display_order
                })
                .from(media)
                .orderBy(media.display_order, media.created_at);
                
            res.json(mediaData);
        } catch (error) {
            console.error("Error fetching media debug info:", error);
            res.status(500).json({ error: "Failed to fetch media debug info" });
        }
    });

    // Set custom order for media items
    app.put("/api/media/set-order", async (req, res) => {
        try {
            const { titles } = req.body;
            
            if (!Array.isArray(titles)) {
                return res.status(400).json({ error: "Titles must be an array" });
            }

            // Get all media items first
            const allMedia = await db.select().from(media);
            console.log("All media items:", allMedia.map(m => ({ id: m.id, title: m.title })));

            // Update display_order for each title
            for (let i = 0; i < titles.length; i++) {
                const targetTitle = titles[i];
                console.log(`Looking for title: ${targetTitle}`);
                
                // Find media item with matching title (case-insensitive exact match)
                const matchingMedia = allMedia.find(m => 
                    m.title && m.title.toLowerCase() === targetTitle.toLowerCase()
                );
                
                if (matchingMedia) {
                    console.log(`Found match: "${matchingMedia.title}" -> order ${i + 1}`);
                    await db.update(media)
                        .set({ display_order: i + 1 })
                        .where(eq(media.id, matchingMedia.id));
                } else {
                    console.log(`No match found for: "${targetTitle}"`);
                }
            }

            res.json({ success: true });
        } catch (error) {
            console.error("Error setting media order:", error);
            res.status(500).json({ error: "Failed to set media order" });
        }
    });

    // Move specific media item to top
    app.put("/api/media/move-to-top", async (req, res) => {
        try {
            const { title } = req.body;
            
            if (!title) {
                return res.status(400).json({ error: "Title is required" });
            }

            // Find the media item with matching title
            const [targetItem] = await db.select().from(media).where(eq(media.title, title));
            
            if (!targetItem) {
                return res.status(404).json({ error: "Media item not found" });
            }

            // Set this item's display_order to 0 (making it first)
            await db.update(media)
                .set({ display_order: 0 })
                .where(eq(media.id, targetItem.id));

            res.json({ success: true });
        } catch (error) {
            console.error("Error moving media to top:", error);
            res.status(500).json({ error: "Failed to move media to top" });
        }
    });

    // Update media item title
    app.put("/api/media/:id/title", async (req, res) => {
        try {
            const { id } = req.params;
            const { title } = req.body;
            
            console.log(`Attempting to update title for ID ${id} to: "${title}"`);
            
            if (!title || title.trim().length === 0) {
                return res.status(400).json({ error: "Title is required" });
            }

            // Check if item exists first
            const [existingItem] = await db.select().from(media).where(eq(media.id, id));
            if (!existingItem) {
                console.log(`No media item found with ID: ${id}`);
                return res.status(404).json({ error: "Media item not found" });
            }
            
            console.log(`Found existing item with title: "${existingItem.title}"`);

            const result = await db.update(media)
                .set({ 
                    title: title.trim(),
                    updated_at: new Date()
                })
                .where(eq(media.id, id))
                .returning();

            console.log(`Database update result:`, result);
            
            // Verify the update worked
            const [updatedItem] = await db.select().from(media).where(eq(media.id, id));
            console.log(`Verified updated title: "${updatedItem.title}"`);

            res.json({ success: true });
        } catch (error) {
            console.error("Error updating media title:", error);
            res.status(500).json({ error: "Failed to update media title" });
        }
    });

    // Serve public images from object storage
    app.get("/public-objects/:filePath(*)", async (req, res) => {
        const filePath = req.params.filePath;
        const objectStorageService = new ObjectStorageService();
        try {
            const file = await objectStorageService.searchPublicObject(filePath);
            if (!file) {
                return res.status(404).json({ error: "File not found" });
            }
            objectStorageService.downloadObject(file, res);
        } catch (error) {
            console.error("Error searching for public object:", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    });

    // Contact form submission
    app.post("/api/contact", async (req, res) => {
        try {
            const validatedData = contactFormSchema.parse(req.body);

            // Save contact form to database
            await db.insert(contacts).values(validatedData);

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

    // Webhook endpoints for Notion synchronization
    app.post("/api/webhook/notion", async (req, res) => {
        try {
            console.log("Received Notion webhook:", req.body);
            
            // Handle Notion verification challenge
            if (req.body.verification_token) {
                return res.status(200).send(req.body.verification_token);
            }

            // Basic webhook security - you might want to verify the request signature in production
            const { type, page_id, database_id } = req.body;

            if (type === "page_update" || type === "page_create") {
                // Determine which database was updated and sync accordingly
                if (database_id === schemaData.databases.blog.id) {
                    await syncBlogPosts();
                    console.log("Blog posts synchronized via webhook");
                } else if (database_id === schemaData.databases.compositions.id) {
                    await syncCompositions();
                    console.log("Compositions synchronized via webhook");
                } else if (database_id === schemaData.databases.recordings.id) {
                    await syncRecordings();
                    console.log("Recordings synchronized via webhook");
                } else if (database_id === schemaData.databases.media.id) {
                    await syncMedia();
                    console.log("Media synchronized via webhook");
                }
            }

            res.json({ success: true, message: "Webhook processed" });
        } catch (error) {
            console.error("Error processing Notion webhook:", error);
            res.status(500).json({ error: "Failed to process webhook" });
        }
    });

    // Manual sync endpoint (for development)
    app.post("/api/sync", async (req, res) => {
        try {
            await syncBlogPosts();
            await syncCompositions();
            await syncRecordings();
            await syncMedia();
            res.json({ success: true, message: "Manual sync completed" });
        } catch (error) {
            console.error("Error during manual sync:", error);
            res.status(500).json({ error: "Failed to sync data" });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
