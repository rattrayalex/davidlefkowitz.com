import { db } from "./db";
import { notion } from "./notion";
import {
    blogPosts,
    compositions,
    recordings,
    media,
    type InsertBlogPost,
    type InsertComposition,
    type InsertRecording,
    type InsertMedia,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { createHash } from "crypto";
import { promises as fsPromises } from "fs";
import { objectStorageClient } from "./objectStorage";

// Helper function to generate URL-friendly slugs
function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_') // Replace non-alphanumeric chars with underscores
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
        .substring(0, 100); // Limit length
}

// Load database schemas
import * as fs from "fs";
const schemaData = JSON.parse(
    fs.readFileSync("server/notion-schemas.json", "utf-8"),
);

// Initialize object storage client
const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";

/**
 * Download an image from URL and save it to object storage
 */
async function downloadImage(imageUrl: string, mediaId: string): Promise<string> {
    try {
        if (!bucketName) {
            console.error("No object storage bucket configured");
            return imageUrl;
        }
        
        // Get file extension from URL or default to jpg
        const urlPath = new URL(imageUrl).pathname;
        const extension = path.extname(urlPath) || ".jpg";
        
        // Generate filename using media ID and hash of URL for uniqueness
        const hash = createHash('md5').update(imageUrl).digest('hex').slice(0, 8);
        const filename = `${mediaId.replace(/[^a-zA-Z0-9]/g, '_')}_${hash}${extension}`;
        const objectPath = `public/media-cache/${filename}`;
        
        const bucket = objectStorageClient.bucket(bucketName);
        const file = bucket.file(objectPath);
        
        // Check if file already exists in object storage
        const [exists] = await file.exists();
        if (exists) {
            console.log(`Image already cached in object storage: ${objectPath}`);
            return `/api/media-cache/${filename}`;
        }
        
        // Download the image
        console.log(`Downloading image to object storage: ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        
        // Upload to object storage
        const buffer = Buffer.from(await response.arrayBuffer());
        await file.save(buffer, {
            metadata: {
                contentType: response.headers.get('content-type') || 'image/jpeg',
                cacheControl: 'public, max-age=86400', // Cache for 24 hours
            },
        });
        
        // Don't need to make public explicitly - Replit handles permissions
        
        console.log(`Image uploaded to object storage: ${objectPath}`);
        return `/api/media-cache/${filename}`;
    } catch (error) {
        console.error(`Failed to download image from ${imageUrl}:`, error);
        // Return original URL as fallback
        return imageUrl;
    }
}

/**
 * Convert Notion rich text to HTML, preserving links
 */
function richTextToHtml(richTextArray: any[]): string {
    if (!richTextArray || !Array.isArray(richTextArray)) return "";
    
    return richTextArray.map(textBlock => {
        let text = textBlock.plain_text || "";
        
        // Handle hyperlinks
        if (textBlock.href) {
            text = `<a href="${textBlock.href}" target="_blank" rel="noopener noreferrer" class="text-purple hover:text-purple-700 underline">${text}</a>`;
        }
        
        // Handle formatting
        if (textBlock.annotations) {
            if (textBlock.annotations.bold) {
                text = `<strong>${text}</strong>`;
            }
            if (textBlock.annotations.italic) {
                text = `<em>${text}</em>`;
            }
            if (textBlock.annotations.code) {
                text = `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${text}</code>`;
            }
        }
        
        return text;
    }).join(""); // Join without line breaks - formatting changes are inline
}

/**
 * Extract content and purple box text from a Notion page
 * Uses last paragraph for purple box and excludes it from content for all posts
 */
async function extractContentAndPurpleBox(
    pageId: string,
    extractLastParagraph: boolean,
): Promise<{ content: string; purpleBoxText: string }> {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100,
        });

        let content = "";
        const contentBlocks = [];

        for (const block of blocks.results) {
            if (!("type" in block)) continue;

            switch (block.type) {
                case "paragraph":
                    const paragraphText = richTextToHtml(block.paragraph?.rich_text || []);
                    if (paragraphText.trim()) {
                        contentBlocks.push(paragraphText);
                    }
                    break;

                case "heading_1":
                    const h1Text = richTextToHtml(block.heading_1?.rich_text || []);
                    if (h1Text.trim()) {
                        contentBlocks.push(`<h1 class="text-3xl font-bold mt-8 mb-4">${h1Text}</h1>`);
                    }
                    break;

                case "heading_2":
                    const h2Text = richTextToHtml(block.heading_2?.rich_text || []);
                    if (h2Text.trim()) {
                        contentBlocks.push(`<h2 class="text-2xl font-bold mt-6 mb-3">${h2Text}</h2>`);
                    }
                    break;

                case "heading_3":
                    const h3Text = richTextToHtml(block.heading_3?.rich_text || []);
                    if (h3Text.trim()) {
                        contentBlocks.push(`<h3 class="text-xl font-bold mt-4 mb-2">${h3Text}</h3>`);
                    }
                    break;

                case "bulleted_list_item":
                    const bulletText = richTextToHtml(block.bulleted_list_item?.rich_text || []);
                    if (bulletText.trim()) {
                        contentBlocks.push(`<li class="ml-4 mb-1">• ${bulletText}</li>`);
                    }
                    break;

                case "numbered_list_item":
                    const numberText = richTextToHtml(block.numbered_list_item?.rich_text || []);
                    if (numberText.trim()) {
                        contentBlocks.push(`<li class="ml-4 mb-1">1. ${numberText}</li>`);
                    }
                    break;

                case "quote":
                    const quoteText = richTextToHtml(block.quote?.rich_text || []);
                    if (quoteText.trim()) {
                        contentBlocks.push(`<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">${quoteText}</blockquote>`);
                    }
                    break;

                case "code":
                    const codeText = richTextToHtml(block.code?.rich_text || []);
                    if (codeText.trim()) {
                        contentBlocks.push(`<pre class="bg-gray-100 p-4 rounded overflow-x-auto"><code>${codeText}</code></pre>`);
                    }
                    break;
            }
        }

        // For all posts: extract last paragraph for purple box if content exists
        if (contentBlocks.length > 0) {
            // Filter out any empty blocks first
            const nonEmptyBlocks = contentBlocks.filter(
                (block) => block.trim().length > 0,
            );

            if (nonEmptyBlocks.length > 0) {
                // Look for incomplete final paragraphs that need to be combined
                let purpleBoxText = "";
                let contentWithoutLast = [...nonEmptyBlocks];
                
                // Take the last block
                const lastBlock = nonEmptyBlocks[nonEmptyBlocks.length - 1];
                
                // Check if we need to combine fragments for a complete sentence
                if (nonEmptyBlocks.length >= 2) {
                    const secondToLast = nonEmptyBlocks[nonEmptyBlocks.length - 2];
                    
                    // If the second-to-last block ends with incomplete text (ellipsis, comma, or doesn't end with punctuation)
                    // and the last block looks like a continuation, combine them
                    if ((secondToLast.endsWith('…') || secondToLast.endsWith(',') || 
                         !secondToLast.match(/[.!?]$/)) && 
                        (lastBlock.startsWith(',') || lastBlock.length < 100)) {
                        
                        purpleBoxText = secondToLast + " " + lastBlock;
                        contentWithoutLast = nonEmptyBlocks.slice(0, -2);
                    } else {
                        purpleBoxText = lastBlock;
                        contentWithoutLast = nonEmptyBlocks.slice(0, -1);
                    }
                } else {
                    purpleBoxText = lastBlock;
                    contentWithoutLast = nonEmptyBlocks.slice(0, -1);
                }

                // Add tab indent to ALL paragraphs (including first)
                const indentedContent = contentWithoutLast.map((block) => {
                    // Only add tab to regular paragraphs (not headings, lists, quotes, code)
                    if (
                        !block.startsWith("#") &&
                        !block.startsWith("•") &&
                        !block.startsWith("1.") &&
                        !block.startsWith(">") &&
                        !block.startsWith("```")
                    ) {
                        // Remove existing tab if present, then add a new one for consistency
                        const cleanBlock = block.startsWith("\t")
                            ? block.substring(1)
                            : block;
                        return "\t" + cleanBlock;
                    }
                    return block;
                });

                content = indentedContent.join("\n");
                return {
                    content: content.trim(),
                    purpleBoxText: purpleBoxText.trim(),
                };
            }
        }

        return { content: "", purpleBoxText: "" };
    } catch (error) {
        console.error(`Error extracting content for page ${pageId}:`, error);
        return { content: "", purpleBoxText: "" };
    }
}

/**
 * Calculate estimated reading time based on content
 */
function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return Math.max(1, minutes); // At least 1 minute
}

/**
 * Sync all blog posts from Notion to local database
 */
export async function syncBlogPosts() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing blog posts from Notion...");

    try {
        // Implement proper pagination to get ALL published blog posts
        let allResults: any[] = [];
        let hasMore = true;
        let nextCursor: string | null = null;

        while (hasMore) {
            const requestBody: any = {
                database_id: schemaData.databases.blog.id,
                page_size: 100, // Use maximum page size
                filter: {
                    property: "Status",
                    status: {
                        equals: "Published",
                    },
                },
            };
            
            if (nextCursor) {
                requestBody.start_cursor = nextCursor;
            }

            const response = await notion.databases.query(requestBody);
            
            allResults = allResults.concat(response.results);
            hasMore = response.has_more;
            nextCursor = response.next_cursor;
            
            console.log(`Retrieved ${response.results.length} blog posts, has_more: ${hasMore}`);
        }

        console.log(`Found ${allResults.length} published blog posts`);

        for (const page of allResults) {
            if (!("properties" in page)) continue;

            const properties = page.properties;
            const titleProperty = properties["Post Title"] as any;
            // Concatenate all rich text parts to get the full title
            const rawTitle =
                titleProperty?.title
                    ?.map((part: any) => part.plain_text)
                    .join("") || "";
            // Clean the title by removing newlines and trimming whitespace
            const title = rawTitle.replace(/\n/g, ' ').trim();

            // Skip posts with missing or invalid titles
            if (!title || title.trim() === "" || title.trim().length < 2) {
                console.log(
                    `Skipping post ${page.id} with invalid title: "${title}"`,
                );
                continue;
            }

            const commentProperty = properties["Comment"] as any;
            const nameOfPageProperty = properties["Name of Page"] as any;

            const publicationDateProperty = properties[
                "Publication Date"
            ] as any;
            const dateProperty = properties.Date as any;
            const publishedDate =
                publicationDateProperty?.date?.start ||
                dateProperty?.date?.start;
            if (!publishedDate) {
                console.log(`Skipping post ${page.id} with no published date`);
                continue;
            }

            // Extract content and purple box text
            console.log(`Extracting content for: ${title}`);
            const { content, purpleBoxText } = await extractContentAndPurpleBox(
                page.id,
                true,
            );
            const readTime = calculateReadingTime(content);

            // Use purple box text if available, otherwise fall back to comment property
            const comment =
                purpleBoxText ||
                commentProperty?.rich_text
                    ?.map((part: any) => part.plain_text)
                    .join("") ||
                "";

            // Create excerpt from first paragraph or first 150 chars
            const excerpt = content.split("\n\n")[0]?.substring(0, 150) || "";

            // Parse date carefully to avoid timezone issues - use local timezone
            const [year, month, day] = publishedDate.split("-");
            const dateObj = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day),
            ); // Month is 0-indexed

            // Use "Name of Page" from Notion for the slug
            const nameOfPage = nameOfPageProperty?.rich_text
                ?.map((part: any) => part.plain_text)
                .join("") || "";
            const slug = nameOfPage || generateSlug(title);
            
            const blogPost: InsertBlogPost = {
                title: title.trim(),
                slug: slug,
                content: content,
                excerpt: excerpt + (excerpt.length >= 150 ? "..." : ""),
                comment: comment,
                published_date: dateObj,
                published: true,
                tags: [], // No tags in current schema, but ready for future
                read_time: readTime,
                notion_url: `https://www.notion.so/${page.id.replace(/-/g, "")}`,
            };

            // Insert or update the blog post
            await db
                .insert(blogPosts)
                .values({
                    ...blogPost,
                    id: page.id,
                })
                .onConflictDoUpdate({
                    target: blogPosts.id,
                    set: {
                        ...blogPost,
                        updated_at: new Date(),
                        last_synced: new Date(),
                    },
                });

            console.log(`✓ Synced blog post: ${title}`);
        }

        console.log("Blog posts sync completed");
    } catch (error) {
        console.error("Error syncing blog posts:", error);
        throw error;
    }
}

/**
 * Sync all compositions from Notion to local database
 */
export async function syncCompositions() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing compositions from Notion...");

    // Implement proper pagination to get ALL compositions
    let allResults: any[] = [];
    let hasMore = true;
    let nextCursor: string | null = null;

    while (hasMore) {
        const requestBody: any = {
            database_id: schemaData.databases.compositions.id,
            page_size: 100, // Use maximum page size
        };
        
        if (nextCursor) {
            requestBody.start_cursor = nextCursor;
        }

        const response = await notion.databases.query(requestBody);
        
        allResults = allResults.concat(response.results);
        hasMore = response.has_more;
        nextCursor = response.next_cursor;
        
        console.log(`Retrieved ${response.results.length} compositions, has_more: ${hasMore}`);
    }

    console.log(
        `Found ${allResults.length} total compositions in Notion database`,
    );

    for (const page of allResults) {
        if (!("properties" in page)) continue;

        const properties = page.properties;

        const nameProperty = properties.Name as any;
        const instrumentationProperty = properties["Instrumentation Text"] as any;
        const ensembleProperty = properties.Ensemble as any;
        const yearProperty = properties["Year ©"] as any;
        const durationProperty = properties.Duration as any;
        const publisherProperty = properties.Publisher as any;
        const premiereProperty = properties["Date of premier"] as any;
        const recordingProperty = properties.Recording as any;
        const streamingLinksProperty = properties["Additional Streaming Links"] as any;
        const programNoteProperty = properties["Program Note"] as any;
        const nameOfPageProperty = properties["Name of Page"] as any;

        // Parse year - trust Notion to provide a number
        const year = yearProperty?.number || null;

        // Use "Name of Page" from Notion for the slug
        const title = nameProperty?.title?.[0]?.plain_text || "";
        const nameOfPage = nameOfPageProperty?.rich_text
            ?.map((part: any) => part.plain_text)
            .join("") || "";
        
        // Process nameOfPage through slug generation to make it URL-safe
        // Use the original nameOfPage if it exists, but convert spaces/special chars
        const slug = nameOfPage ? nameOfPage.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '') : generateSlug(title);

        const composition: InsertComposition = {
            slug: slug,
            title: title,
            instrumentation: instrumentationProperty?.rich_text?.[0]?.plain_text ? [instrumentationProperty.rich_text[0].plain_text] : [],
            ensemble:
                (ensembleProperty?.multi_select?.map(
                    (item: any) => item.name,
                ) as string[]) || [],
            year: year,
            duration: durationProperty?.rich_text?.[0]?.plain_text || "",
            publisher:
                (publisherProperty?.multi_select?.map(
                    (item: any) => item.name,
                ) as string[]) || [],
            premiere_info: premiereProperty?.date?.start || "",
            recording: recordingProperty?.rich_text
                ?.map((part: any) => part.plain_text?.trim())
                .filter((r: string) => r && r.length > 0) || [],
            streaming_links: streamingLinksProperty?.rich_text?.[0]?.plain_text || "",
            program_note: programNoteProperty?.rich_text?.map((part: any) => part.plain_text).join("") || "",
            published: true,
        };

        // Insert or update the composition
        await db
            .insert(compositions)
            .values({
                id: page.id,
                ...composition,
            })
            .onConflictDoUpdate({
                target: compositions.id,
                set: {
                    slug: composition.slug,
                    title: composition.title,
                    instrumentation: composition.instrumentation,
                    ensemble: composition.ensemble,
                    year: composition.year,
                    duration: composition.duration,
                    publisher: composition.publisher,
                    premiere_info: composition.premiere_info,
                    recording: composition.recording,
                    streaming_links: composition.streaming_links,
                    program_note: composition.program_note,
                    published: composition.published,
                    updated_at: new Date(),
                    last_synced: new Date(),
                },
            });

        console.log(`✓ Synced composition: ${composition.title}`);
    }

    // Delete compositions that no longer exist in Notion
    const notionIds = allResults.map(page => page.id);
    const localCompositions = await db.select({ id: compositions.id }).from(compositions);
    
    for (const localComp of localCompositions) {
        if (!notionIds.includes(localComp.id)) {
            await db.delete(compositions).where(eq(compositions.id, localComp.id));
            console.log(`✗ Deleted composition: ${localComp.id} (no longer in Notion)`);
        }
    }

    console.log("Compositions sync completed");
}

/**
 * Sync all recordings from Notion to local database
 */
export async function syncRecordings() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing recordings from Notion...");

    try {
        // First, delete all existing recordings to avoid duplicates
        await db.delete(recordings);
        console.log("Cleared existing recordings");

        const response = await notion.databases.query({
            database_id: schemaData.databases.recordings.id,
        });

        console.log(`Found ${response.results.length} recordings`);

        for (const page of response.results) {
            if (!("properties" in page)) continue;

            const properties = page.properties;
            

            const nameOfAlbumProperty = properties["Name of Album"] as any;
            const performersProperty = properties.Performers as any;
            const ensembleProperty = properties.Ensemble as any;
            const instrumentationProperty = properties.Instrumentation as any;
            const yearProperty = properties["Year ©"] as any;
            const durationProperty = properties.Duration as any;
            const labelProperty = properties.Label as any;
            const linksProperty = properties["Streaming Links"] as any;
            const albumCoverProperty = properties["Album Cover"] as any;
            const compositionProperty = properties.Composition as any;
            const albumTrackListingProperty = properties["Album Track Listing"] as any;
            const nameOfPageProperty = properties["Name of Page"] as any;
            const rankingWithinYearProperty = properties["Ranking within year"] as any;

            // Download and cache album cover if it exists
            let cachedAlbumCover = null;
            const albumCoverUrl = albumCoverProperty?.files?.[0]?.file?.url || albumCoverProperty?.files?.[0]?.external?.url;
            if (albumCoverUrl) {
                cachedAlbumCover = await downloadImage(albumCoverUrl, `recording_${page.id}`);
            }

            // Download and cache album track listing images
            const cachedTrackListings: string[] = [];
            if (albumTrackListingProperty?.files) {
                for (let i = 0; i < albumTrackListingProperty.files.length; i++) {
                    const file = albumTrackListingProperty.files[i];
                    const trackListingUrl = file?.file?.url || file?.external?.url;
                    if (trackListingUrl) {
                        const cachedUrl = await downloadImage(trackListingUrl, `recording_${page.id}_tracklist_${i}`);
                        if (cachedUrl) {
                            cachedTrackListings.push(cachedUrl);
                        }
                    }
                }
            }

            // Clean the title by removing newlines and trimming whitespace
            const rawTitle = nameOfAlbumProperty?.title?.[0]?.plain_text || "";
            const recordingTitle = rawTitle.replace(/\n/g, ' ').trim();
            
            // Use "Name of Page" from Notion for the slug
            const nameOfPage = nameOfPageProperty?.rich_text
                ?.map((part: any) => part.plain_text)
                .join("") || "";
            const slug = nameOfPage || generateSlug(recordingTitle);
            
            // Extract ranking from various possible property types
            const extractRanking = (): number | null => {
                if (!rankingWithinYearProperty) return null;
                
                // Try direct number property
                if (rankingWithinYearProperty.number !== undefined) {
                    return rankingWithinYearProperty.number;
                }
                
                // Try formula property
                if (rankingWithinYearProperty.formula?.number !== undefined) {
                    return rankingWithinYearProperty.formula.number;
                }
                
                // Try rollup property
                if (rankingWithinYearProperty.rollup?.number !== undefined) {
                    return rankingWithinYearProperty.rollup.number;
                }
                
                // Try select property
                if (rankingWithinYearProperty.select?.name) {
                    const num = parseInt(rankingWithinYearProperty.select.name, 10);
                    return Number.isFinite(num) ? num : null;
                }
                
                // Try rich text property
                if (rankingWithinYearProperty.rich_text?.[0]?.plain_text) {
                    const num = parseInt(rankingWithinYearProperty.rich_text[0].plain_text, 10);
                    return Number.isFinite(num) ? num : null;
                }
                
                return null;
            };

            const recording: InsertRecording = {
                title: recordingTitle,
                slug: slug,
                composer: "David S. Lefkowitz",
                performers:
                    performersProperty?.rich_text?.map((item: any) => item.plain_text).join("") || "",
                ensemble:
                    (ensembleProperty?.multi_select?.map(
                        (item: any) => item.name,
                    ) as string[]) || [],
                instrumentation:
                    (instrumentationProperty?.multi_select?.map(
                        (item: any) => item.name,
                    ) as string[]) || [],
                year: yearProperty?.number || null,
                ranking_within_year: extractRanking(),
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                label:
                    labelProperty?.rich_text?.map((item: any) => item.plain_text).join("") || "",
                label_url: labelProperty?.rich_text?.[0]?.href || null,
                links: richTextToHtml(linksProperty?.rich_text || []),
                album_cover: cachedAlbumCover,
                composition: compositionProperty?.rich_text?.map((item: any) => item.plain_text).join("") || "",
                album_track_listing: cachedTrackListings,
            };

            // Insert the recording (no need for conflict handling since we cleared all records)
            await db
                .insert(recordings)
                .values({
                    ...recording,
                    id: page.id,
                });

            console.log(`✓ Synced recording: ${recording.title}`);
        }

        console.log("Recordings sync completed");
    } catch (error) {
        console.error("Error syncing recordings:", error);
        throw error;
    }
}

/**
 * Sync media from Notion to local database
 */
export async function syncMedia() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing media from Notion...");

    try {
        const response = await notion.databases.query({
            database_id: schemaData.databases.media.id,
        });

        console.log(`Found ${response.results.length} media items`);

        for (const page of response.results) {
            if (!("properties" in page)) continue;

            const properties = page.properties;

            const titleProperty = properties.Title as any;
            const descriptionProperty = properties.Description as any;
            const imageProperty = properties.Image as any;
            const altTextProperty = properties["Alt Text"] as any;
            const categoryProperty = properties.Category as any;
            const dateTakenProperty = properties["Date Taken"] as any;
            const photoCreditsProperty = properties["Photo Credits"] as any;
            const publishedProperty = properties.Published as any;

            // Extract image URL from files property
            let imageUrl = "";
            if (imageProperty?.files && Array.isArray(imageProperty.files) && imageProperty.files.length > 0) {
                const file = imageProperty.files[0];
                if (file.type === "file") {
                    imageUrl = file.file?.url || "";
                } else if (file.type === "external") {
                    imageUrl = file.external?.url || "";
                }
            }

            // Skip if no image URL
            if (!imageUrl) {
                console.log(`Skipping media item without image: ${titleProperty?.title?.[0]?.plain_text || "Untitled"}`);
                continue;
            }

            // Download and cache the image locally
            const localImageUrl = await downloadImage(imageUrl, page.id);

            const mediaItem: InsertMedia = {
                title: titleProperty?.title?.[0]?.plain_text || "",
                description: descriptionProperty?.rich_text?.[0]?.plain_text || "",
                image_url: localImageUrl, // Use local cached URL instead of Notion URL
                alt_text: altTextProperty?.rich_text?.[0]?.plain_text || "",
                category: categoryProperty?.select?.name || "",
                date_taken: dateTakenProperty?.date?.start ? new Date(dateTakenProperty.date.start) : null,
                photo_credits: photoCreditsProperty?.rich_text?.[0]?.plain_text || "",
                published: publishedProperty?.checkbox || false,
            };

            // Insert or update the media item
            await db
                .insert(media)
                .values({
                    ...mediaItem,
                    id: page.id,
                })
                .onConflictDoUpdate({
                    target: media.id,
                    set: {
                        ...mediaItem,
                        updated_at: new Date(),
                        last_synced: new Date(),
                    },
                });

            console.log(`✓ Synced media: ${mediaItem.title}`);
        }

        console.log("Media sync completed");
    } catch (error) {
        console.error("Error syncing media:", error);
        throw error;
    }
}

/**
 * Sync all data from Notion to local database
 */
export async function syncAllData() {
    console.log("Starting full data sync from Notion...");

    await syncBlogPosts();
    await syncCompositions();
    await syncRecordings();
    await syncMedia();

    console.log("Full data sync completed");
}
