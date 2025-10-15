import type { Express } from "express";
import { createServer, type Server } from "http";
import { notion } from "./notion";
import { contactFormSchema, blogPosts, compositions, recordings, media, mediaReviews, contacts, profile, aboutContent, analytics, type BlogPost, type Composition, type Recording, type Media } from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, sql, lt, gt, and } from "drizzle-orm";
import { syncBlogPosts, syncCompositions, syncRecordings, syncMedia, syncAboutContent } from "./sync";
import { getMediaPageReviews } from "./notion";
import { ObjectStorageService } from "./objectStorage";
import { z } from "zod";
import * as fs from "fs";
import { promises as fsPromises } from 'fs';
import * as path from 'path';

// Load database schemas
const schemaData = JSON.parse(fs.readFileSync("server/notion-schemas.json", "utf-8"));

export async function registerRoutes(app: Express): Promise<Server> {
    // Health check endpoint for deployment readiness - early registration to avoid catch-all conflicts
    app.get("/health", (req, res) => {
        res.status(200).json({ 
            status: "healthy", 
            timestamp: new Date().toISOString(),
            version: "1.0.0"
        });
    });

    // HEAD health check for load balancers
    app.head("/health", (req, res) => {
        res.status(200).end();
    });

    // Lazy sync middleware for API routes - triggers sync on first request if no data
    app.use("/api", async (req, res, next) => {
        const syncMutex = (global as any).syncMutex;
        const performSync = (global as any).performSync;
        
        // Check if we need to trigger initial sync
        if (!syncMutex.lastSyncTime && !syncMutex.isSyncing && performSync) {
            // Check if we have any data in the database
            try {
                const compositionCount = await db.select({ count: sql`count(*)` }).from(compositions);
                const blogPostCount = await db.select({ count: sql`count(*)` }).from(blogPosts);
                
                // If no data exists and sync hasn't run, trigger lazy sync in background
                if ((compositionCount[0]?.count === 0 || blogPostCount[0]?.count === 0)) {
                    console.log('No data found, triggering lazy sync in background...');
                    // Don't await - let it run in background
                    performSync().catch((error: any) => {
                        console.error('Background lazy sync failed:', error);
                    });
                }
            } catch (error) {
                console.error('Error checking for data in lazy sync middleware:', error);
            }
        }
        
        next();
    });

    // Get profile information
    app.get("/api/profile", async (req, res) => {
        try {
            // Try to fetch from about_content table first
            const [aboutData] = await db.select().from(aboutContent).limit(1);
            
            if (aboutData) {
                // Use about content data
                const profileResponse = {
                    name: "David S. Lefkowitz",
                    title: "Composer, Professor of Music Composition & Theory",
                    institution: "UCLA Herb Alpert School of Music",
                    bio: aboutData.content || aboutData.bio || "Bio content not available",
                    bio_short: "Composer, Theorist, and Professor at UCLA",
                    photo_url: `/api/media-cache/profile-photo.jpg?v=${Date.now()}`,
                    email: "david@lefkowitz.me",
                    cv_url: null
                };
                res.json(profileResponse);
            } else {
                // Fallback to hardcoded data if database is empty
                const fallbackProfile = {
                    name: "David S. Lefkowitz",
                    title: "Composer, Professor of Music Composition & Theory",
                    institution: "UCLA Herb Alpert School of Music",
                    bio: `Composer, theorist, and professor David S. Lefkowitz has won international acclaim, with performances in Japan, China, Hong Kong, Taiwan, Russia, Ukraine, Switzerland, Italy, Netherlands, UK, France, Germany, Hungary, Czechoslovakia, Spain, Canada, Mexico, Israel, and Egypt. He has won recognition from Fukui Harp Music, ASCAP Young Composers, NACUSA, Guild of Temple Musi­cians, Chicago Civic Orchestra, Washington International, Society for New Music's Brian Israel, ALEA III, and Gaudeamus Music Week. He has had residencies with the University of Nevada/Las Vegas, National Sun-Yat Sen University (Kaoshiung, Taiwan), National Capital Normal University (Beijing, China), Herzen University (St. Petersburg, Russia), and Meet the Composer.

He has presented his music at countless universities across four continents and throughout the United States.  He has also been a judge for many competitions for composers, locally, nationally, and in St. Petersburg, Russia.  Dr. David S. Lefkowitz received his Ph.D. in Music Composition and Theory from the Eastman School of Music/University of Rochester, where he studied primarily with Samuel Adler and Joseph Schwantner.  He received his M.A. in Music Composition from University of Pennsylvania, where he studied primarily with George Crumb.  He received his B.A. from Cornell University, where he studied both philosophy and music, and where he studied music composition with Karel Husa and Yehudi Wyner.

At <a href="https://schoolofmusic.ucla.edu/people/david-lefkowitz/" target="_blank" rel="noopener noreferrer">UCLA</a>, David S. Lefkowitz teaches courses in Music Composition, Orchestration, Contemporary Music Analysis, Music Theory, Speculative Music Theory, and Music Theory for Composers.  In his 31 years at UCLA, he has been nominated by the Music Department for the Distinguished Teaching Award, he served as Chair of the Division of Composition for more than 7 years, and has served for three years as Vice Chair of the Department.  He has been very active inviting ensembles from around the world to residencies at UCLA, including the Moscow Contemporary Music Ensemble, the Quatuor Diotima (Diotima String Quartet), Yarn/Wire, Syrinx Ensemble, Jose Menor, Alexander Boldachev, and the Aperture Duo, as well as collaborations with the Helfman Group and Junior Chamber Music.

David S. Lefkowitz's more than 150 compositions range from intimate works for many different solo instruments to large ensemble music for orchestra and for wind ensemble, and for choir, soloists, and orchestra.  He has received more than 50 commissions for new works, from soloists Inna Faliks, Gloria Cheng, Suzana Bartal, Susanne Kessel, David Geringas, Grace Cloutier, Petteri Iivonen, Robert Paterson, and Hans Joachim Dumeier; and for ensembles incluing Yarlung Artists for Elinor Frey and David Fung and for Lindsay Deutsch and Joanne Pearce Martin, Pacific Serenades, Coretet for Quartet Integra and for the Sibelius Piano Trio, Cantor's Assembly, Glory Star Children's Chorus, Center for Jewish Culture and Creativity for the Synergy Ensemble, Debussy Trio, Russian String Orchestra, Moscow Contemporary Music Ensemble, Herzen University for the St. Petersburg in the Mirror of the World's Cultural Heritage competition, Irina Donskaya for a harp quartet, Cornell University Glee Club, Baroque Camerata of Zhongshan Daxue (Kaoshiung, Taiwan), Harvard Westlake Symphony Orchestra, and for the Beijing City Opera Company.

Lefkowitz's compositions have been released on more than twenty commercial recordings, including on Bridge, Yarlung, Albany, and Parnassus Records, including four all-Lefkowitz recordings: David S. Lefkowitz Preludes and Fugues on Bridge Records, Harp's Desire: The Harp Music of David S. Lefkowitz and Music of Contradictions on Albany Records, and Inner World: the Music of David S. Lefkowitz on Yarlung Records.  His most recent composition, Green Mountains, Now Black, commissioned for Quartet Integra string quartet, will be released on Yarlung Records later this year.  His music has been published by Fatrock Music, Zenon Music, C. Alan Publications, Warner Brothers/Chappell Music, Yelton Rhodes Music.  Most of his music is available through Floating Point Music.`,
                    bio_short: "Composer, Theorist, and Professor at UCLA",
                    photo_url: `/api/media-cache/profile-photo.jpg?v=${Date.now()}`,
                    email: "lefko at ucla.edu",
                    cv_url: null
                };
                res.json(fallbackProfile);
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ error: "Failed to fetch profile" });
        }
    });

    // Get all compositions from local database with conditional pagination support
    app.get("/api/compositions", async (req, res) => {
        try {
            // Check if we should fetch all results (no pagination)
            const fetchAll = req.query.all === 'true';
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = (page - 1) * limit;

            let compositionsData;
            let count;

            if (fetchAll) {
                // Fetch all compositions without pagination
                compositionsData = await db
                    .select()
                    .from(compositions)
                    .orderBy(desc(compositions.year));
                
                count = compositionsData.length;
            } else {
                // Get total count for pagination
                const countResult = await db
                    .select({ count: sql`count(*)::int` })
                    .from(compositions);
                count = countResult[0].count;

                // Fetch paginated compositions
                compositionsData = await db
                    .select()
                    .from(compositions)
                    .orderBy(desc(compositions.year))
                    .limit(limit)
                    .offset(offset);
            }

            const formattedCompositions = compositionsData.map((comp: Composition) => ({
                id: comp.id,
                slug: comp.slug,
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

            // Return consistent response shape for both modes
            res.json({
                compositions: formattedCompositions,
                pagination: {
                    total: count,
                    page: fetchAll ? 1 : page,
                    limit: fetchAll ? count : limit,
                    totalPages: fetchAll ? 1 : Math.ceil(count / limit)
                }
            });
        } catch (error) {
            console.error("Error fetching compositions:", error);
            res.status(500).json({ error: "Failed to fetch compositions" });
        }
    });

    // Get single composition by slug
    app.get("/api/compositions/:slug", async (req, res) => {
        try {
            const { slug } = req.params;
            
            const [composition] = await db
                .select()
                .from(compositions)
                .where(eq(compositions.slug, slug))
                .limit(1);
            
            if (!composition) {
                return res.status(404).json({ error: "Composition not found" });
            }

            // If there are recording links, try to find the matching recordings
            let recordingInfoArray: any[] = [];
            if (composition.recording) {
                // Handle recording as an array (new format) or string (legacy format)
                const recordingUrls = Array.isArray(composition.recording) 
                    ? composition.recording 
                    : typeof composition.recording === 'string' && composition.recording.trim() 
                        ? [composition.recording]
                        : [];
                
                for (const recordingUrl of recordingUrls) {
                    if (!recordingUrl || typeof recordingUrl !== 'string') continue;
                    
                    // Extract the slug from the URL if it's a URL, otherwise treat as title
                    let searchCriteria = recordingUrl;
                    
                    // Check if it's a URL and extract the slug
                    if (recordingUrl.includes('/recordings/')) {
                        const urlParts = recordingUrl.split('/recordings/');
                        searchCriteria = urlParts[urlParts.length - 1];
                    }
                    
                    // Try to find a matching recording by slug
                    const [matchingRecording] = await db
                        .select()
                        .from(recordings)
                        .where(eq(recordings.slug, searchCriteria))
                        .limit(1);
                    
                    // If not found by slug and it's not a URL, try by title
                    if (!matchingRecording && !recordingUrl.includes('/recordings/')) {
                        const [titleMatch] = await db
                            .select()
                            .from(recordings)
                            .where(eq(recordings.title, searchCriteria))
                            .limit(1);
                        
                        if (titleMatch) {
                            recordingInfoArray.push({
                                id: titleMatch.id,
                                slug: titleMatch.slug,
                                title: titleMatch.title,
                                album_cover: titleMatch.album_cover || "",
                            });
                        }
                    } else if (matchingRecording) {
                        recordingInfoArray.push({
                            id: matchingRecording.id,
                            slug: matchingRecording.slug,
                            title: matchingRecording.title,
                            album_cover: matchingRecording.album_cover || "",
                        });
                    }
                }
            }

            // Fetch blog posts that reference this composition (by Notion page ID)
            // Blog posts store the Notion page IDs from the relation field, not local DB IDs
            // So we need to use the composition's Notion ID (stored as the composition.id)
            const relatedBlogPosts = await db
                .select({
                    id: blogPosts.id,
                    title: blogPosts.title,
                    slug: blogPosts.slug,
                    published_date: blogPosts.published_date,
                })
                .from(blogPosts)
                .where(sql`${blogPosts.related_compositions}::jsonb @> ${JSON.stringify([composition.id])}`)
                .orderBy(desc(blogPosts.published_date));

            const formattedComposition = {
                id: composition.id,
                slug: composition.slug,
                title: composition.title,
                instrumentation: Array.isArray(composition.instrumentation) ? composition.instrumentation.join(", ") : "",
                ensemble: Array.isArray(composition.ensemble) ? composition.ensemble.join(", ") : "",
                year: composition.year,
                category: Array.isArray(composition.ensemble) && composition.ensemble.length > 0 ? composition.ensemble[0] : "",
                duration: composition.duration || "",
                premiere_info: composition.premiere_info || "",
                publisher: composition.publisher || [],  // Keep as array, don't join
                recording: composition.recording || "",
                streaming_links: composition.streaming_links || "",
                recording_info: recordingInfoArray.length > 0 ? recordingInfoArray : null,
                program_note: composition.program_note || "",
                related_blogposts: relatedBlogPosts,
            };

            res.json(formattedComposition);
        } catch (error) {
            console.error("Error fetching composition:", error);
            res.status(500).json({ error: "Failed to fetch composition" });
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

    // Get navigation info for a blog post (previous and next posts)
    app.get("/api/blog-posts/:id/navigation", async (req, res) => {
        try {
            const { id } = req.params;
            
            // Get the current post first to know its date
            let currentPostData = await db
                .select()
                .from(blogPosts)
                .where(eq(blogPosts.id, id))
                .limit(1);

            // If not found by ID and it doesn't look like a UUID, try by slug
            if (currentPostData.length === 0 && !id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                currentPostData = await db
                    .select()
                    .from(blogPosts)
                    .where(eq(blogPosts.slug, id))
                    .limit(1);
            }

            if (currentPostData.length === 0) {
                return res.status(404).json({ error: "Post not found" });
            }

            const currentPost = currentPostData[0];

            // Get previous post (older - earlier date)
            const previousPost = await db
                .select({
                    id: blogPosts.id,
                    slug: blogPosts.slug,
                    title: blogPosts.title
                })
                .from(blogPosts)
                .where(
                    and(
                        eq(blogPosts.published, true),
                        lt(blogPosts.published_date, currentPost.published_date)
                    )
                )
                .orderBy(desc(blogPosts.published_date))
                .limit(1);

            // Get next post (newer - later date)
            const nextPost = await db
                .select({
                    id: blogPosts.id,
                    slug: blogPosts.slug,
                    title: blogPosts.title
                })
                .from(blogPosts)
                .where(
                    and(
                        eq(blogPosts.published, true),
                        gt(blogPosts.published_date, currentPost.published_date)
                    )
                )
                .orderBy(blogPosts.published_date)
                .limit(1);

            res.json({
                previous: previousPost[0] || null,
                next: nextPost[0] || null
            });
        } catch (error) {
            console.error("Error fetching blog post navigation:", error);
            res.status(500).json({ error: "Failed to fetch blog post navigation" });
        }
    });

    // Get all media items from database
    app.get("/api/media", async (req, res) => {
        try {
            // Read from database instead of filesystem
            const mediaItems = await db
                .select()
                .from(media)
                .orderBy(media.display_order);
            
            // Format the response to match the expected structure
            const formattedItems = mediaItems.map((item) => ({
                id: item.id,
                title: item.title,
                description: item.description || "",
                image_url: item.image_url,
                alt_text: item.alt_text || item.title,
                category: item.category || "photo",
                date_taken: item.date_taken ? item.date_taken.toISOString() : "",
                photo_credits: item.photo_credits ? `Photo: ${item.photo_credits}` : "",
                display_order: item.display_order
            }));
            
            res.json(formattedItems);
        } catch (error) {
            console.error("Error fetching media from database:", error);
            res.status(500).json({ error: "Failed to fetch media" });
        }
    });

    // Get review content from Notion Media page
    app.get("/api/media/reviews", async (req, res) => {
        try {
            // First, try to get reviews from database cache
            const cachedReviews = await db.select()
                .from(mediaReviews)
                .orderBy(mediaReviews.order_index);
            
            if (cachedReviews.length > 0) {
                // Serve from cache for fastest response
                const reviews = cachedReviews.map(r => r.review_text);
                res.json({ reviews });
            } else {
                // If cache is empty, fetch from Notion and cache will be populated
                const reviews = await getMediaPageReviews();
                res.json({ reviews });
            }
        } catch (error) {
            console.error("Error fetching media reviews:", error);
            res.status(500).json({ error: "Failed to fetch reviews" });
        }
    });
    
    // Debug endpoint to check available Notion pages
    app.get("/api/debug/notion-pages", async (req, res) => {
        try {
            const { getNotionPages } = await import("./notion");
            const pages = await getNotionPages();
            res.json({ pages });
        } catch (error) {
            console.error("Error fetching Notion pages:", error);
            res.status(500).json({ error: "Failed to fetch Notion pages" });
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
    
    // Temporary endpoint to get Notion databases
    app.get("/api/notion/databases", async (req, res) => {
        try {
            const { getNotionDatabases } = await import("./notion.js");
            const databases = await getNotionDatabases();
            const formattedDatabases = databases.map(db => ({
                id: db.id,
                title: db.title?.[0]?.plain_text || "Untitled",
                url: db.url
            }));
            console.log("Found databases:", formattedDatabases);
            res.json(formattedDatabases);
        } catch (error) {
            console.error("Error getting Notion databases:", error);
            res.status(500).json({ error: "Failed to get Notion databases" });
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

    // Simple analytics tracking endpoint
    app.post("/api/track", async (req, res) => {
        try {
            const { event_type, event_data } = req.body;
            
            // Only track specific events
            if (!['fyc_visit', 'listen_now_click', 'streaming_link_click'].includes(event_type)) {
                return res.status(400).json({ error: "Invalid event type" });
            }
            
            // Insert the event into the analytics table
            await db.insert(analytics).values({
                event_type,
                event_data: event_data || null
            });
            
            res.json({ success: true });
        } catch (error) {
            console.error("Error tracking event:", error);
            res.status(500).json({ error: "Failed to track event" });
        }
    });

    // Get analytics summary (optional endpoint to view the data)
    app.get("/api/analytics-summary", async (req, res) => {
        try {
            const summary = await db.select({
                event_type: analytics.event_type,
                count: sql<number>`count(*)::int`
            })
            .from(analytics)
            .groupBy(analytics.event_type);
            
            res.json(summary);
        } catch (error) {
            console.error("Error getting analytics summary:", error);
            res.status(500).json({ error: "Failed to get analytics" });
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

    // Middleware to protect manual sync endpoints in production
    const requireAdminAuth = (req: any, res: any, next: any) => {
        // In production, require an admin token
        if (process.env.NODE_ENV === 'production') {
            const adminToken = process.env.ADMIN_SYNC_TOKEN;
            const providedToken = req.headers['x-admin-token'] || req.query.token;
            
            if (!adminToken) {
                // If no admin token is set, log warning and proceed (for backward compatibility)
                console.warn('Warning: ADMIN_SYNC_TOKEN not set in production');
                next();
                return;
            }
            
            if (providedToken !== adminToken) {
                res.status(401).json({ error: "Unauthorized" });
                return;
            }
        }
        next();
    };
    
    // Shared mutex with the automatic sync in index.ts
    let syncMutex = (global as any).syncMutex || { isSyncing: false };
    (global as any).syncMutex = syncMutex;
    
    // Store logo paths from last sync  
    let cachedLogoPaths = (global as any).cachedLogoPaths || [];
    (global as any).cachedLogoPaths = cachedLogoPaths;
    
    // Individual sync endpoints
    app.get("/api/sync-recordings", requireAdminAuth, async (req, res) => {
        if (syncMutex.isSyncing) {
            res.json({ success: false, message: "Sync already in progress" });
            return;
        }
        
        syncMutex.isSyncing = true;
        try {
            await syncRecordings();
            res.json({ success: true, message: "Recordings sync completed" });
        } catch (error) {
            console.error("Error during recordings sync:", error);
            res.status(500).json({ error: "Failed to sync recordings" });
        } finally {
            syncMutex.isSyncing = false;
        }
    });

    app.get("/api/sync-compositions", requireAdminAuth, async (req, res) => {
        if (syncMutex.isSyncing) {
            res.json({ success: false, message: "Sync already in progress" });
            return;
        }
        
        syncMutex.isSyncing = true;
        try {
            await syncCompositions();
            res.json({ success: true, message: "Compositions sync completed" });
        } catch (error) {
            console.error("Error during compositions sync:", error);
            res.status(500).json({ error: "Failed to sync compositions" });
        } finally {
            syncMutex.isSyncing = false;
        }
    });

    app.get("/api/sync-blog", requireAdminAuth, async (req, res) => {
        if (syncMutex.isSyncing) {
            res.json({ success: false, message: "Sync already in progress" });
            return;
        }
        
        syncMutex.isSyncing = true;
        try {
            await syncBlogPosts();
            res.json({ success: true, message: "Blog posts sync completed" });
        } catch (error) {
            console.error("Error during blog posts sync:", error);
            res.status(500).json({ error: "Failed to sync blog posts" });
        } finally {
            syncMutex.isSyncing = false;
        }
    });

    app.post("/api/sync-about", async (req, res) => {
        if (syncMutex.isSyncing) {
            res.json({ success: false, message: "Sync already in progress" });
            return;
        }
        
        syncMutex.isSyncing = true;
        try {
            await syncAboutContent();
            res.json({ success: true, message: "About page sync completed" });
        } catch (error) {
            console.error("Error during about page sync:", error);
            res.status(500).json({ error: "Failed to sync about page" });
        } finally {
            syncMutex.isSyncing = false;
        }
    });

    // Sync logos from Notion - disabled until syncLogos function is implemented
    // app.post("/api/sync-logos", async (req, res) => {
    //     if (syncMutex.isSyncing) {
    //         res.json({ success: false, message: "Sync already in progress" });
    //         return;
    //     }
        
    //     syncMutex.isSyncing = true;
    //     try {
    //         const logos = await syncLogos();
            
    //         // Store the logo paths globally for the API endpoint
    //         (global as any).cachedLogoPaths = logos.map(logo => ({
    //             platform: logo.platform,
    //             path: logo.url
    //         }));
    //         res.json({ success: true, message: "Logos sync completed", logos });
    //     } catch (error) {
    //         console.error("Error during logos sync:", error);
    //         res.status(500).json({ error: "Failed to sync logos" });
    //     } finally {
    //         syncMutex.isSyncing = false;
    //     }
    // });

    // Media sync endpoint
    app.post("/api/sync/media", async (req, res) => {
        if (syncMutex.isSyncing) {
            res.json({ success: false, message: "Sync already in progress" });
            return;
        }
        
        syncMutex.isSyncing = true;
        try {
            await syncMedia();
            res.json({ success: true, message: "Media sync completed" });
        } catch (error) {
            console.error("Error during media sync:", error);
            res.status(500).json({ error: "Failed to sync media" });
        } finally {
            syncMutex.isSyncing = false;
        }
    });

    // Get synced logos
    app.get("/api/logos", async (req, res) => {
        try {
            // Check global cache first
            const cachedLogos = (global as any).cachedLogoPaths;
            if (cachedLogos && cachedLogos.length > 0) {
                console.log(`Returning ${cachedLogos.length} logos from global cache`);
                res.json(cachedLogos);
                return;
            }
            
            // If no cached logos, use fallback to the last known good logos
            // These are the logos that were successfully synced to object storage
            const fallbackLogos = [
                { platform: "Amazon", path: "/api/media-cache/logo_amazon_30bd78e5.svg" },
                { platform: "Amazon Music", path: "/api/media-cache/logo_amazon_music_dd85eb97.svg" },
                { platform: "Apple Music", path: "/api/media-cache/logo_apple_music_8cb4e244.svg" },
                { platform: "Deezer", path: "/api/media-cache/logo_deezer_205302b9.svg" },
                { platform: "BeMusic", path: "/api/media-cache/logo_bemusic_804c5fc2.jpg" },
                { platform: "Pandora", path: "/api/media-cache/logo_pandora_67f5b889.svg" },
                { platform: "Spotify", path: "/api/media-cache/logo_spotify_ddb7a2a0.png" },
                { platform: "YouTube", path: "/api/media-cache/logo_youtube_4b24d04b.svg" },
                { platform: "Tidal", path: "/api/media-cache/logo_tidal_53e4408f.svg" },
                { platform: "Naxos", path: "/api/media-cache/logo_naxos_fca4239f.png" }
            ];
            
            console.log(`Returning ${fallbackLogos.length} logos from fallback`);
            res.json(fallbackLogos);
        } catch (error) {
            console.error("Error fetching logos:", error);
            res.status(500).json({ error: "Failed to fetch logos" });
        }
    });

    app.get("/api/sync-all", requireAdminAuth, async (req, res) => {
        if (syncMutex.isSyncing) {
            res.json({ success: false, message: "Sync already in progress" });
            return;
        }
        
        syncMutex.isSyncing = true;
        try {
            await syncBlogPosts();
            await syncCompositions();
            await syncRecordings();
            await syncMedia();
            res.json({ success: true, message: "Full sync completed" });
        } catch (error) {
            console.error("Error during full sync:", error);
            res.status(500).json({ error: "Failed to sync all data" });
        } finally {
            syncMutex.isSyncing = false;
        }
    });

    // Fetch FYC page from Notion
    app.get("/api/fyc-content", async (req, res) => {
        try {
            // Import the existing notion client
            const { notion } = await import("./notion");
            
            // Search for FYC page in all databases
            const searchResponse = await notion.search({
                query: "FYC",
                filter: {
                    value: "page",
                    property: "object"
                }
            });
            
            console.log("Search results for 'FYC':", searchResponse.results.length);
            
            // Look for a page with FYC in the title
            let fycPage: any = null;
            
            for (const result of searchResponse.results) {
                if (result.object === "page") {
                    const pageTitle = (result as any).properties?.title?.title?.[0]?.plain_text ||
                                    (result as any).properties?.Name?.title?.[0]?.plain_text || "";
                    
                    console.log("Found page:", pageTitle);
                    
                    if (pageTitle.toUpperCase().includes("FYC") || 
                        pageTitle.toUpperCase().includes("FOR YOUR CONSIDERATION") ||
                        pageTitle.toUpperCase().includes("GRAMMY")) {
                        fycPage = result;
                        break;
                    }
                }
            }
            
            if (!fycPage) {
                // Try another search for "For Your Consideration"
                const searchResponse2 = await notion.search({
                    query: "For Your Consideration",
                    filter: {
                        value: "page",
                        property: "object"
                    }
                });
                
                console.log("Search results for 'For Your Consideration':", searchResponse2.results.length);
                
                for (const result of searchResponse2.results) {
                    if (result.object === "page") {
                        const pageTitle = (result as any).properties?.title?.title?.[0]?.plain_text ||
                                        (result as any).properties?.Name?.title?.[0]?.plain_text || "";
                        
                        console.log("Found page:", pageTitle);
                        
                        if (pageTitle.toUpperCase().includes("FYC") || 
                            pageTitle.toUpperCase().includes("FOR YOUR CONSIDERATION") ||
                            pageTitle.toUpperCase().includes("GRAMMY")) {
                            fycPage = result;
                            break;
                        }
                    }
                }
            }
            
            if (!fycPage) {
                res.status(404).json({ 
                    error: "FYC page not found in Notion. Make sure you have a page with 'FYC' or 'For Your Consideration' in the title."
                });
                return;
            }
            
            // Fetch the page content
            const { fetchNotionPageContent } = await import("./notion");
            const blocks = await fetchNotionPageContent(fycPage.id);
            
            // Process blocks to extract formatted text and links
            const links: { [text: string]: string } = {};
            const content: string[] = [];
            
            for (const block of blocks) {
                if (block.type === "paragraph" && block.paragraph) {
                    const richTextArray = block.paragraph.rich_text || [];
                    
                    for (const richText of richTextArray) {
                        const text = richText.plain_text || "";
                        
                        if (richText.href) {
                            // Store the link mapping
                            links[text.trim()] = richText.href;
                        }
                    }
                }
            }
            
            console.log("Found links:", links);
            
            res.json({
                title: (fycPage as any).properties?.title?.title?.[0]?.plain_text ||
                       (fycPage as any).properties?.Name?.title?.[0]?.plain_text || "FYC",
                links: links
            });
        } catch (error) {
            console.error("Error fetching FYC content:", error);
            res.status(500).json({ error: "Failed to fetch FYC content" });
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
