import type { Express } from "express";
import { createServer, type Server } from "http";
import { notion } from "./notion";
import { contactFormSchema, blogPosts, compositions, recordings, media, contacts, type BlogPost, type Composition, type Recording, type Media } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, lt, gt } from "drizzle-orm";
import { syncBlogPosts, syncCompositions, syncRecordings, syncMedia } from "./sync";
import { getMediaPageReviews } from "./notion";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import * as fs from "fs";
import { promises as fsPromises } from 'fs';
import * as path from 'path';

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
                bio: `Composer, theorist, and professor David S. Lefkowitz has won international acclaim, with performances in Japan, China, Hong Kong, Taiwan, Russia, Ukraine, Switzerland, Italy, Netherlands, UK, France, Germany, Hungary, Czechoslovakia, Spain, Canada, Mexico, Israel, and Egypt. He has won recognition from Fukui Harp Music, ASCAP Young Composers, NACUSA, Guild of Temple Musi­cians, Chicago Civic Orchestra, Washington International, Society for New Music's Brian Israel, ALEA III, and Gaudeamus Music Week. He has had residencies with the University of Nevada/Las Vegas, National Sun-Yat Sen University (Kaoshiung, Taiwan), National Capital Normal University (Beijing, China), Herzen University (St. Petersburg, Russia), and Meet the Composer. He has presented his music at countless universities across four continents and throughout the United States.  He has also been a judge for many competitions for composers, locally, nationally, and in St. Petersburg, Russia.  Dr. David S. Lefkowitz received his Ph.D. in Music Composition and Theory from the Eastman School of Music/University of Rochester, where he studied primarily with Samuel Adler and Joseph Schwantner.  He received his M.A. in Music Composition from University of Pennsylvania, where he studied primarily with George Crumb.  He received his B.A. from Cornell University, where he studied both philosophy and music, and where he studied music composition with Karel Husa and Yehudi Wyner.

At <a href="https://schoolofmusic.ucla.edu/people/david-lefkowitz/" target="_blank" rel="noopener noreferrer">UCLA</a>, David S. Lefkowitz teaches courses in Music Composition, Orchestration, Contemporary Music Analysis, Music Theory, Speculative Music Theory, and Music Theory for Composers.  In his 31 years at UCLA, he has been nominated by the Music Department for the Distinguished Teaching Award, he served as Chair of the Division of Composition for more than 7 years, and has served for three years as Vice Chair of the Department.  He has been very active inviting ensembles from around the world to residencies at UCLA, including the Moscow Contemporary Music Ensemble, the Quatuor Diotima (Diotima String Quartet), Yarn/Wire, Syrinx Ensemble, Jose Menor, Alexander Boldachev, and the Aperture Duo, as well as collaborations with the Helfman Group and Junior Chamber Music.

David S. Lefkowitz's more than 150 compositions range from intimate works for many different solo instruments to large ensemble music for orchestra and for wind ensemble, and for choir, soloists, and orchestra.  He has received more than 50 commissions for new works, from soloists Inna Faliks, Gloria Cheng, Suzana Bartal, Susanne Kessel, David Geringas, Grace Cloutier, Petteri Iivonen, Robert Paterson, and Hans Joachim Dumeier; and for ensembles incluing Yarlung Artists for Elinor Frey and David Fung and for Lindsay Deutsch and Joanne Pearce Martin, Pacific Serenades, Coretet for Quartet Integra and for the Sibelius Piano Trio, Cantor's Assembly, Glory Star Children's Chorus, Center for Jewish Culture and Creativity for the Synergy Ensemble, Debussy Trio, Russian String Orchestra, Moscow Contemporary Music Ensemble, Herzen University for the St. Petersburg in the Mirror of the World's Cultural Heritage competition, Irina Donskaya for a harp quartet, Cornell University Glee Club, Baroque Camerata of Zhongshan Daxue (Kaoshiung, Taiwan), Harvard Westlake Symphony Orchestra, and for the Beijing City Opera Company.

Lefkowitz's compositions have been released on more than twenty commercial recordings, including on Bridge, Yarlung, Albany, and Parnassus Records, including four all-Lefkowitz recordings: David S. Lefkowitz Preludes and Fugues on Bridge Records, Harp's Desire: The Harp Music of David S. Lefkowitz and Music of Contradictions on Albany Records, and Inner World: the Music of David S. Lefkowitz on Yarlung Records.  His most recent composition, Green Mountains, Now Black, commissioned for Quartet Integra string quartet, will be released on Yarlung Records later this year.  His music has been published by Fatrock Music, Zenon Music, C. Alan Publications, Warner Brothers/Chappell Music, Yelton Rhodes Music.  Most of his music is available through Floating Point Music.`,
                bio_short: "Composer, Theorist, and Professor at UCLA",
                photo_url: `/api/media-cache/profile-photo.jpg?v=${Date.now()}`,
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
    // Get single recording by ID or slug
    app.get("/api/recordings/:id", async (req, res) => {
        try {
            const { id } = req.params;
            
            // Try to fetch by ID first (UUID), then try by slug
            let recordingData = await db
                .select()
                .from(recordings)
                .where(eq(recordings.id, id))
                .limit(1);

            // If not found by ID and it doesn't look like a UUID, try by slug
            if (recordingData.length === 0 && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                recordingData = await db
                    .select()
                    .from(recordings)
                    .where(eq(recordings.slug, id))
                    .limit(1);
            }

            if (recordingData.length === 0) {
                return res.status(404).json({ error: "Recording not found" });
            }

            const rec = recordingData[0];
            const formattedRecording = {
                id: rec.id,
                slug: rec.slug,
                title: rec.title,
                composer: rec.composer,
                performer: rec.performers || "",
                performers: rec.performers || "",
                composition: rec.composition || "",
                ensemble: Array.isArray(rec.ensemble) ? rec.ensemble.join(", ") : "",
                instrumentation: Array.isArray(rec.instrumentation) ? rec.instrumentation.join(", ") : "",
                year: rec.year,
                duration: rec.duration || "",
                label: rec.label || "",
                label_url: rec.label_url || null,
                links: rec.links || "",
                album_cover: rec.album_cover || null,
                album_track_listing: rec.album_track_listing || [],
                // For frontend compatibility
                audio_url: rec.links || "",
                video_url: "",
                description: "",
                release_date: rec.year ? new Date(rec.year, 0, 1).toISOString() : ""
            };

            res.json(formattedRecording);
        } catch (error) {
            console.error("Error fetching recording:", error);
            res.status(500).json({ error: "Failed to fetch recording" });
        }
    });

    app.get("/api/recordings", async (req, res) => {
        try {
            const recordingsData = await db
                .select()
                .from(recordings)
                .orderBy(desc(recordings.year), asc(recordings.ranking_within_year));

            // Filter out recordings with empty titles
            const validRecordings = recordingsData.filter((rec: Recording) => rec.title && rec.title.trim() !== "");

            const formattedRecordings = validRecordings.map((rec: Recording) => ({
                id: rec.id,
                slug: rec.slug,
                title: rec.title,
                composer: rec.composer,
                performer: rec.performers || "",  // Now a text field, not array
                performers: rec.performers || "",  // Keep both for compatibility
                composition: rec.composition || "",  // Add composition field
                ensemble: Array.isArray(rec.ensemble) ? rec.ensemble.join(", ") : "",
                instrumentation: Array.isArray(rec.instrumentation) ? rec.instrumentation.join(", ") : "",
                year: rec.year,
                duration: rec.duration || "",
                label: rec.label || "",  // Now a text field, not array
                label_url: rec.label_url || null,
                links: rec.links || "",
                album_cover: rec.album_cover || null,
                album_track_listing: rec.album_track_listing || [],  // Add track listing images
                // For frontend compatibility
                audio_url: rec.links || "",
                video_url: "",
                description: "",
                release_date: rec.year ? new Date(rec.year, 0, 1).toISOString() : ""
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
                slug: post.slug,
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
            
            // Try to fetch by ID first (UUID), then try by slug
            let blogPostData = await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.id, id))
                .limit(1);

            // If not found by ID and it doesn't look like a UUID, try by slug
            if (blogPostData.length === 0 && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                blogPostData = await db
                    .select()
                    .from(blogPosts)
                    .where(eq(blogPosts.slug, id))
                    .limit(1);
            }

            if (blogPostData.length === 0) {
                return res.status(404).json({ error: "Post not found" });
            }

            const post = blogPostData[0];
            const formattedPost = {
                id: post.id,
                slug: post.slug,
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

    // Get all media items from photos folder
    app.get("/api/media", async (req, res) => {
        try {
            const photosDir = path.join(process.cwd(), 'photos');
            const files = await fsPromises.readdir(photosDir);
            
            // Filter for image files and create media objects
            const imageFiles = files.filter(file => 
                /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
            );
            
            // Custom order matching the previous database order
            const customOrder = [
                "Lefkowitz 1370.jpg",
                "Lefkowitz 1312.jpg", 
                "Lefkowitz 1351.jpg",
                "Lefkowitz-17.jpg",
                "Lefkowitz-30.jpg",
                "Lefkowitz-31.jpg",
                "David Lefkowitz Summer 2013.jpg",
                "DavidSLefkowitz Hi-Res.jpg"
            ];
            
            // Sort files according to custom order
            const sortedFiles = [...imageFiles].sort((a, b) => {
                const indexA = customOrder.indexOf(a);
                const indexB = customOrder.indexOf(b);
                if (indexA === -1 && indexB === -1) return a.localeCompare(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            
            const mediaItems = sortedFiles.map((file, index) => {
                // Assign individual photo credits based on position (1-indexed)
                let photoCredit = "";
                const position = index + 1;
                if ([1, 2, 3, 8].includes(position)) {
                    photoCredit = "Photo: Laura R. Lefkowitz";
                } else if ([4, 5, 6].includes(position)) {
                    photoCredit = "Photo: Rob H. Baker";
                } else if (position === 7) {
                    photoCredit = "Photo: David Waldorf";
                }
                
                return {
                    id: file.replace(/\.[^/.]+$/, ""), // Remove file extension for ID
                    title: file.replace(/\.[^/.]+$/, ""), // Remove file extension for title
                    description: "",
                    image_url: `/photos/${file}`,
                    alt_text: file.replace(/\.[^/.]+$/, ""),
                    category: "photo",
                    date_taken: "",
                    photo_credits: photoCredit,
                    display_order: index
                };
            });
            
            res.json(mediaItems);
        } catch (error) {
            console.error("Error reading photos folder:", error);
            res.status(500).json({ error: "Failed to fetch photos" });
        }
    });

    // Get review content from Notion Media page
    app.get("/api/media/reviews", async (req, res) => {
        try {
            const reviews = await getMediaPageReviews();
            res.json({ reviews });
        } catch (error) {
            console.error("Error fetching media reviews:", error);
            res.status(500).json({ error: "Failed to fetch reviews" });
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
                .orderBy(media.display_order);
                
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

    // Serve photos directly from photos folder
    app.get("/photos/:filename", (req, res) => {
        const filename = req.params.filename;
        const filePath = path.join(process.cwd(), 'photos', filename);
        
        // Security check - ensure filename doesn't contain path traversal
        if (filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: "Invalid filename" });
        }
        
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error("Error serving photo:", err);
                res.status(404).json({ error: "Photo not found" });
            }
        });
    });

    // Serve cached media images from object storage
    app.get("/api/media-cache/:filename", async (req, res) => {
        const filename = req.params.filename;
        
        // Security check - ensure filename doesn't contain path traversal
        if (filename.includes('..') || filename.includes('/')) {
            return res.status(400).json({ error: "Invalid filename" });
        }
        
        try {
            const objectStorageService = new ObjectStorageService();
            
            // Search for the file in public object storage paths (media-cache folder)
            const file = await objectStorageService.searchPublicObject(`media-cache/${filename}`);
            
            if (file) {
                // Stream the file from object storage
                await objectStorageService.downloadObject(file, res, 86400); // Cache for 24 hours
            } else {
                // Try to serve from local file system as fallback (for legacy images)
                const filePath = path.join(process.cwd(), 'server', 'media-cache', filename);
                res.sendFile(filePath, (err) => {
                    if (err) {
                        console.error("Error serving cached media from local:", err);
                        res.status(404).json({ error: "Cached media not found" });
                    }
                });
            }
        } catch (error) {
            console.error("Error serving cached media from object storage:", error);
            
            // Try to serve from local file system as fallback (for legacy images)
            const filePath = path.join(process.cwd(), 'server', 'media-cache', filename);
            res.sendFile(filePath, (err) => {
                if (err) {
                    console.error("Error serving cached media from local:", err);
                    res.status(404).json({ error: "Cached media not found" });
                }
            });
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
            res.json({ success: true, message: "Manual sync completed" });
        } catch (error) {
            console.error("Error during manual sync:", error);
            res.status(500).json({ error: "Failed to sync data" });
        }
    });

    // Image download endpoint
    app.post("/api/download-images", async (req, res) => {
        try {
            const { downloadAllImages } = await import("./downloadImages");
            await downloadAllImages();
            res.json({ success: true, message: "All images downloaded" });
        } catch (error) {
            console.error("Error downloading images:", error);
            res.status(500).json({ error: "Failed to download images" });
        }
    });

    const httpServer = createServer(app);
    return httpServer;
}
