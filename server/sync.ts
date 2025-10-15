import { db } from "./db";
import { notion, getNotionPages } from "./notion";
import {
    blogPosts,
    compositions,
    recordings,
    media,
    profile,
    aboutContent,
    type InsertBlogPost,
    type InsertComposition,
    type InsertRecording,
    type InsertMedia,
    type InsertProfile,
    type InsertAboutContent,
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
        
        // Generate a unique filename using media ID and content hash
        const hash = createHash('md5').update(imageUrl).digest('hex').substring(0, 8);
        const fileName = `media_${mediaId.replace(/-/g, '_')}_${hash}${extension}`;
        const objectKey = `public/media-cache/${fileName}`;
        
        // Check if the file already exists in object storage
        try {
            await objectStorageClient.headObject({
                Bucket: bucketName,
                Key: objectKey,
            });
            
            console.log(`Image already cached: ${objectKey}`);
            return `/api/media-cache/${fileName}`;
        } catch (headError: any) {
            // File doesn't exist, proceed with download
            if (headError.name !== 'NotFound') {
                console.error('Error checking object existence:', headError);
            }
        }
        
        // Download the image
        console.log(`Downloading image to object storage: ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Determine content type
        let contentType = 'image/jpeg';
        if (extension.toLowerCase() === '.png') {
            contentType = 'image/png';
        } else if (extension.toLowerCase() === '.gif') {
            contentType = 'image/gif';
        } else if (extension.toLowerCase() === '.webp') {
            contentType = 'image/webp';
        }
        
        // Upload to object storage
        await objectStorageClient.putObject({
            Bucket: bucketName,
            Key: objectKey,
            Body: buffer,
            ContentType: contentType,
        });
        
        console.log(`Image uploaded to object storage: ${objectKey}`);
        
        // Return the URL path that will be served by our API
        return `/api/media-cache/${fileName}`;
    } catch (error) {
        console.error(`Error downloading/caching image: ${error}`);
        // Return original URL as fallback
        return imageUrl;
    }
}

/**
 * Convert Notion rich text to HTML
 */
function richTextToHtml(richText: any[], includeLinks = false): string {
    if (!richText || !Array.isArray(richText)) return "";

    const htmlSegments: string[] = [];

    for (const segment of richText) {
        if (!segment.plain_text) continue;

        let html = segment.plain_text;

        // Escape HTML entities
        html = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        // Apply formatting - order matters!
        if (segment.annotations?.code) {
            html = `<code>${html}</code>`;
        }
        if (segment.annotations?.bold) {
            html = `<strong>${html}</strong>`;
        }
        if (segment.annotations?.italic) {
            html = `<em>${html}</em>`;
        }
        if (segment.annotations?.strikethrough) {
            html = `<s>${html}</s>`;
        }
        if (segment.annotations?.underline) {
            html = `<u>${html}</u>`;
        }

        // Handle links
        if (includeLinks && segment.href) {
            html = `<a href="${segment.href}">${html}</a>`;
        } else if (segment.text?.link?.url) {
            // Extract URL for composition links
            html = segment.text.link.url;
        }

        htmlSegments.push(html);
    }

    // Join segments and replace newlines with <br> tags
    const result = htmlSegments.join("").replace(/\n/g, "<br>");
    return result;
}

/**
 * Extract a value from a Notion property with flexible type handling
 */
function extractPropertyValue(property: any, fieldName?: string): any {
    if (!property) return null;

    // Direct access for known property types
    if (property.type === "number") return property.number;
    if (property.type === "checkbox") return property.checkbox;
    if (property.type === "date") return property.date?.start;
    if (property.type === "rich_text") return property.rich_text?.[0]?.plain_text || "";
    if (property.type === "title") return property.title?.[0]?.plain_text || "";
    if (property.type === "select") return property.select?.name || "";
    if (property.type === "multi_select") return property.multi_select || [];
    if (property.type === "files") return property.files || [];

    // Attempt property-less extraction for special fields
    if (property.number !== undefined) return property.number;
    if (property.checkbox !== undefined) return property.checkbox;
    if (property.date !== undefined) return property.date?.start;
    if (property.rich_text !== undefined) return property.rich_text?.[0]?.plain_text || "";
    if (property.title !== undefined) return property.title?.[0]?.plain_text || "";
    if (property.select !== undefined) return property.select?.name || "";
    if (property.multi_select !== undefined) return property.multi_select || [];
    if (property.files !== undefined) return property.files || [];

    // Log for debugging if we couldn't extract
    if (fieldName) {
        console.log(`Could not extract value for field: ${fieldName}`, property);
    }

    return null;
}

/**
 * Sync blog posts from Notion to local database
 */
export async function syncBlogPosts() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing blog posts from Notion...");

    try {
        const pages = await getNotionPages(schemaData.databases.blog.id);
        console.log(`Found ${pages.length} published blog posts`);

        // Clear all existing blog posts
        await db.delete(blogPosts);

        for (const page of pages) {
            if (!("properties" in page)) continue;

            const properties = page.properties;
            const titleProperty = properties["Post Title"] || properties.Name;
            const dateProperty = properties["Publication Date"] || properties.Date;
            const compositionProperty = properties.Composition;

            const title = titleProperty?.title?.[0]?.plain_text || "Untitled";

            console.log(`Extracting content for: ${title}`);

            // Extract the content and purple box text
            const extractedContent = await extractContentAndPurpleBox(page.id, false);

            // Generate slug from title
            const slug = generateSlug(title);

            const blogPost: InsertBlogPost = {
                title,
                date: dateProperty?.date?.start ? new Date(dateProperty.date.start) : null,
                content: extractedContent.content,
                purple_box_text: extractedContent.purpleBoxText,
                composition_id: compositionProperty?.relation?.[0]?.id || null,
                slug,
            };

            // Insert the blog post (no need for conflict handling since we cleared all records)
            await db
                .insert(blogPosts)
                .values({
                    ...blogPost,
                    id: page.id,
                });

            console.log(`✓ Synced blog post: ${blogPost.title}`);
        }

        console.log("Blog sync completed");
    } catch (error) {
        console.error("Error syncing blog posts:", error);
        throw error;
    }
}

/**
 * Extract content and purple box text from a Notion page
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
                        contentBlocks.push(
                            `<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">${quoteText}</blockquote>`,
                        );
                    }
                    break;

                case "code":
                    const codeText = richTextToHtml(block.code?.rich_text || []);
                    if (codeText.trim()) {
                        contentBlocks.push(`<pre class="bg-gray-100 p-4 rounded my-4"><code>${codeText}</code></pre>`);
                    }
                    break;

                case "image":
                    // Download and cache the image
                    let imageUrl = "";
                    if (block.image.type === "file") {
                        imageUrl = block.image.file?.url || "";
                    } else if (block.image.type === "external") {
                        imageUrl = block.image.external?.url || "";
                    }
                    
                    if (imageUrl) {
                        const localImageUrl = await downloadImage(imageUrl, `blog_${pageId}_${block.id.substring(0, 8)}`);
                        
                        // Get caption if available
                        let caption = "";
                        if (block.image.caption && Array.isArray(block.image.caption)) {
                            caption = richTextToHtml(block.image.caption);
                        }
                        
                        // Add image with caption
                        if (caption) {
                            contentBlocks.push(
                                `<figure class="my-6">
                                    <img src="${localImageUrl}" alt="${caption}" class="w-full rounded-lg" />
                                    <figcaption class="text-sm text-gray-600 mt-2 text-center">${caption}</figcaption>
                                </figure>`
                            );
                        } else {
                            contentBlocks.push(
                                `<img src="${localImageUrl}" alt="" class="w-full rounded-lg my-6" />`
                            );
                        }
                    }
                    break;

                // Add other block types as needed
            }
        }

        // Join all content blocks
        content = contentBlocks.join("\n");

        // Extract purple box text (last paragraph or specific content)
        let purpleBoxText = "";
        if (extractLastParagraph && contentBlocks.length > 0) {
            // Find the last paragraph (not heading or other element)
            for (let i = contentBlocks.length - 1; i >= 0; i--) {
                const block = contentBlocks[i];
                // Check if it's a paragraph (doesn't start with HTML tags for headings, lists, etc.)
                if (block && !block.startsWith("<h") && !block.startsWith("<li") && !block.startsWith("<blockquote") && !block.startsWith("<pre")) {
                    purpleBoxText = block;
                    // Remove this paragraph from the main content
                    contentBlocks.splice(i, 1);
                    content = contentBlocks.join("\n");
                    break;
                }
            }
        }

        // Wrap list items in proper list containers
        content = content.replace(/(<li.*?<\/li>\n?)+/g, (match) => {
            if (match.includes("•")) {
                return `<ul class="list-none space-y-1 my-4">${match}</ul>`;
            } else {
                return `<ol class="list-none space-y-1 my-4">${match}</ol>`;
            }
        });

        return { content: content.trim(), purpleBoxText: purpleBoxText.trim() };
    } catch (error) {
        console.error(`Error extracting content for page ${pageId}:`, error);
        return { content: "", purpleBoxText: "" };
    }
}

/**
 * Extract content from a Notion page
 */
async function extractAboutContent(pageId: string): Promise<string> {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
        });

        const contentParts = [];

        for (const block of blocks.results) {
            if (!("type" in block)) continue;

            if (block.type === "paragraph") {
                const text = block.paragraph?.rich_text
                    ?.map((t: any) => t.plain_text)
                    .join("");
                if (text?.trim()) {
                    contentParts.push(text);
                }
            }
        }

        return contentParts.join("\n\n");
    } catch (error) {
        console.error(`Error extracting about content for page ${pageId}:`, error);
        throw error;
    }
}

/**
 * Look for a photo in the current block, following blocks, or columns
 */
async function findCompositionPhoto(blockId: string): Promise<string | null> {
    if (!notion) return null;
    
    try {
        const blocks = await notion.blocks.children.list({
            block_id: blockId,
            page_size: 10, // Look at a few following blocks
        });

        for (const block of blocks.results) {
            if (!("type" in block)) continue;

            // Direct image block
            if (block.type === "image") {
                let imageUrl = "";
                if (block.image.type === "file") {
                    imageUrl = block.image.file?.url || "";
                } else if (block.image.type === "external") {
                    imageUrl = block.image.external?.url || "";
                }
                if (imageUrl) {
                    console.log(`Found photo in block: ${imageUrl.substring(0, 50)}...`);
                    return imageUrl;
                }
            }

            // Check column blocks
            if (block.type === "column_list" && block.has_children) {
                const columnBlocks = await notion.blocks.children.list({
                    block_id: block.id,
                });

                for (const column of columnBlocks.results) {
                    if (!("type" in column) || column.type !== "column") continue;
                    if (!column.has_children) continue;

                    const columnContents = await notion.blocks.children.list({
                        block_id: column.id,
                    });

                    for (const content of columnContents.results) {
                        if (!("type" in content)) continue;
                        
                        if (content.type === "image") {
                            let imageUrl = "";
                            if (content.image.type === "file") {
                                imageUrl = content.image.file?.url || "";
                            } else if (content.image.type === "external") {
                                imageUrl = content.image.external?.url || "";
                            }
                            if (imageUrl) {
                                console.log(`Found photo in column: ${imageUrl.substring(0, 50)}...`);
                                return imageUrl;
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error finding composition photo:", error);
    }

    return null;
}

/**
 * Extract content from a composition page including images and formatted text
 */
async function extractCompositionContent(pageId: string): Promise<{ 
    description: string; 
    reviews: string;
    reviews_purple: string;
    photo: string | null;
}> {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    const debugTitle = pageId; // For debug logging

    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100,
        });

        let description = "";
        let reviews = "";
        let reviews_purple = "";
        let photo: string | null = null;
        let foundReviewHeading = false;
        let captureNextAsPurple = false;

        const descriptionParts: string[] = [];
        const reviewParts: string[] = [];
        const purpleBoxParts: string[] = [];

        for (const block of blocks.results) {
            if (!("type" in block)) continue;

            const blockType = block.type;
            const blockId = block.id;

            // Check for Review/Praise heading
            if ((blockType === "heading_2" || blockType === "heading_3" || blockType === "heading_1") && 
                block[blockType]?.rich_text) {
                const headingText = block[blockType].rich_text
                    .map((t: any) => t.plain_text)
                    .join("")
                    .toLowerCase();
                
                if (headingText.includes("review") || headingText.includes("praise") || headingText.includes("press")) {
                    foundReviewHeading = true;
                    captureNextAsPurple = true;
                    console.log(`Found review section in ${debugTitle}: "${headingText}"`);
                    continue;
                }
            }

            // Handle paragraphs
            if (blockType === "paragraph" && block.paragraph?.rich_text) {
                const text = richTextToHtml(block.paragraph.rich_text);
                if (text.trim()) {
                    if (foundReviewHeading) {
                        if (captureNextAsPurple) {
                            // First paragraph after review heading goes to purple box
                            purpleBoxParts.push(text);
                            captureNextAsPurple = false;
                            console.log(`Added to purple box: ${text.substring(0, 50)}...`);
                        } else {
                            // Subsequent paragraphs go to reviews
                            reviewParts.push(text);
                            console.log(`Added to reviews: ${text.substring(0, 50)}...`);
                        }
                    } else {
                        descriptionParts.push(text);
                    }
                }
            }

            // Handle quotes (always go to reviews if found after review heading)
            if (blockType === "quote" && block.quote?.rich_text) {
                const quoteText = richTextToHtml(block.quote.rich_text);
                if (quoteText.trim()) {
                    const formattedQuote = `<blockquote class="border-l-4 border-purple-500 pl-4 italic">${quoteText}</blockquote>`;
                    
                    if (foundReviewHeading) {
                        reviewParts.push(formattedQuote);
                        console.log(`Added quote to reviews: ${quoteText.substring(0, 50)}...`);
                    } else {
                        descriptionParts.push(formattedQuote);
                    }
                }
            }

            // Handle lists
            if (blockType === "bulleted_list_item" && block.bulleted_list_item?.rich_text) {
                const text = richTextToHtml(block.bulleted_list_item.rich_text);
                if (text.trim()) {
                    const listItem = `• ${text}`;
                    if (foundReviewHeading) {
                        reviewParts.push(listItem);
                    } else {
                        descriptionParts.push(listItem);
                    }
                }
            }

            // Look for photo - only if we haven't found one yet
            if (!photo && blockType === "image") {
                let imageUrl = "";
                if (block.image.type === "file") {
                    imageUrl = block.image.file?.url || "";
                } else if (block.image.type === "external") {
                    imageUrl = block.image.external?.url || "";
                }
                if (imageUrl) {
                    photo = imageUrl;
                    console.log(`Found photo for ${debugTitle}: ${imageUrl.substring(0, 50)}...`);
                }
            }

            // Check column_list blocks for images
            if (!photo && blockType === "column_list" && block.has_children) {
                const foundPhoto = await findCompositionPhoto(blockId);
                if (foundPhoto) {
                    photo = foundPhoto;
                }
            }
        }

        // Join the parts with appropriate spacing
        description = descriptionParts.join("\n");
        reviews = reviewParts.join("\n");
        reviews_purple = purpleBoxParts.join("\n");

        // Add some default structure to reviews if empty but purple box has content
        if (!reviews && reviews_purple) {
            reviews = reviews_purple;
            reviews_purple = "";
        }

        console.log(`Extracted for ${debugTitle}:`);
        console.log(`  - Description: ${description.length} chars`);
        console.log(`  - Reviews: ${reviews.length} chars`);
        console.log(`  - Purple box: ${reviews_purple.length} chars`);
        console.log(`  - Photo: ${photo ? "Found" : "Not found"}`);

        return { 
            description: description.trim(), 
            reviews: reviews.trim(),
            reviews_purple: reviews_purple.trim(),
            photo
        };
    } catch (error) {
        console.error(`Error extracting composition content for ${pageId}:`, error);
        return { 
            description: "", 
            reviews: "",
            reviews_purple: "",
            photo: null
        };
    }
}

/**
 * Sync compositions from Notion to local database
 */
export async function syncCompositions() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing compositions from Notion...");

    try {
        const pages = await getNotionPages(schemaData.databases.compositions.id);
        console.log(`Found ${pages.length} published compositions`);

        // Clear all existing compositions
        await db.delete(compositions);

        for (const page of pages) {
            if (!("properties" in page)) continue;

            const properties = page.properties;
            const titleProperty = properties.Name || properties["Name of Page"];
            const yearProperty = properties["Year ©"];
            const durationProperty = properties.Duration;
            const ensembleProperty = properties.Ensemble;
            const publisherProperty = properties.Publisher;
            const instrumentationProperty = properties["Instrumentation Text"];
            const dateOfPremierProperty = properties["Date of premier"];
            const recordingProperty = properties.Recording;
            const rankingProperty = properties["Ranking within year"];

            const title = titleProperty?.title?.[0]?.plain_text || "Untitled";

            // Extract the ranking value using flexible extraction
            const rankingValue = extractPropertyValue(rankingProperty, "Ranking within year");

            console.log(`Extracting content for composition: ${title}`);

            // Extract extended content including reviews and photo
            const extractedContent = await extractCompositionContent(page.id);
            
            // Cache the photo if found
            let cachedPhoto = null;
            if (extractedContent.photo) {
                cachedPhoto = await downloadImage(extractedContent.photo, `comp_${page.id}`);
            }

            const composition: InsertComposition = {
                title,
                year: yearProperty?.number || null,
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                ensemble: ensembleProperty?.multi_select?.map((e: any) => e.name).join(", ") || "",
                publisher: publisherProperty?.multi_select?.map((p: any) => p.name).join(", ") || "",
                instrumentation_text: instrumentationProperty?.rich_text?.[0]?.plain_text || "",
                date_of_premier: dateOfPremierProperty?.date?.start
                    ? new Date(dateOfPremierProperty.date.start)
                    : null,
                recording_info: recordingProperty?.rich_text?.[0]?.plain_text || "",
                description: extractedContent.description,
                reviews: extractedContent.reviews,
                reviews_purple: extractedContent.reviews_purple,
                photo: cachedPhoto,
                ranking_within_year: rankingValue,
            };

            // Insert the composition (no need for conflict handling since we cleared all records)
            await db
                .insert(compositions)
                .values({
                    ...composition,
                    id: page.id,
                });

            console.log(`✓ Synced composition: ${composition.title}`);
        }

        console.log("Compositions sync completed");
    } catch (error) {
        console.error("Error syncing compositions:", error);
        throw error;
    }
}

/**
 * Sync recordings from Notion to local database
 */
export async function syncRecordings() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing recordings from Notion...");

    try {
        const pages = await getNotionPages(schemaData.databases.recordings.id);
        console.log(`Found ${pages.length} recordings`);

        // Clear all existing recordings
        await db.delete(recordings);

        for (const page of pages) {
            if (!("properties" in page)) continue;

            const properties = page.properties;
            const titleProperty = properties["Name of Album"];
            const yearProperty = properties["Year ©"];
            const labelProperty = properties.Label;
            const performersProperty = properties.Performers;
            const ensembleProperty = properties.Ensemble;
            const instrumentationProperty = properties.Instrumentation;
            const durationProperty = properties.Duration;
            const linksProperty = properties["Streaming Links"];
            const albumCoverProperty = properties["Album Cover"];
            const compositionProperty = properties.Composition;
            const albumTrackListingProperty = properties["Album Track Listing"];

            const title = titleProperty?.title?.[0]?.plain_text || "Untitled";

            console.log(`===== DEBUG: HARP'S DESIRE COMPOSITION DATA =====`);
            console.log(`Recording title: ${title}`);
            if (title.includes("Harp") || title.includes("Prix de Fukui")) {
                console.log("Composition rich_text from Notion:", JSON.stringify(compositionProperty?.rich_text, null, 2));
            }
            console.log(`===== END DEBUG =====`);

            // Generate slug from title - replace spaces and special characters with underscores
            const slug = title
                .replace(/[^a-zA-Z0-9\s&]/g, '')  // Remove special chars except & and spaces
                .replace(/\s+/g, '_')              // Replace spaces with underscores
                .replace(/_+/g, '_')               // Replace multiple underscores with single
                .replace(/^_+|_+$/g, '');          // Remove leading/trailing underscores

            // Handle album cover
            let cachedAlbumCover = null;
            if (albumCoverProperty?.files && Array.isArray(albumCoverProperty.files) && albumCoverProperty.files.length > 0) {
                const file = albumCoverProperty.files[0];
                let imageUrl = "";
                if (file.type === "file") {
                    imageUrl = file.file?.url || "";
                } else if (file.type === "external") {
                    imageUrl = file.external?.url || "";
                }
                if (imageUrl) {
                    cachedAlbumCover = await downloadImage(imageUrl, `recording_${page.id}`);
                }
            }

            // Handle album track listings (multiple images)
            const cachedTrackListings = [];
            if (albumTrackListingProperty?.files && Array.isArray(albumTrackListingProperty.files)) {
                for (let i = 0; i < albumTrackListingProperty.files.length; i++) {
                    const file = albumTrackListingProperty.files[i];
                    let imageUrl = "";
                    if (file.type === "file") {
                        imageUrl = file.file?.url || "";
                    } else if (file.type === "external") {
                        imageUrl = file.external?.url || "";
                    }
                    if (imageUrl) {
                        const cachedUrl = await downloadImage(imageUrl, `recording_${page.id}_tracklist_${i}`);
                        cachedTrackListings.push(cachedUrl);
                    }
                }
            }

            const recording: InsertRecording = {
                title,
                year: yearProperty?.number || null,
                label: labelProperty?.rich_text?.[0]?.plain_text || "",
                performers: performersProperty?.rich_text?.[0]?.plain_text || "",
                ensemble: ensembleProperty?.multi_select?.map((e: any) => e.name).join(", ") || "",
                instrumentation: instrumentationProperty?.multi_select?.map((i: any) => i.name).join(", ") || "",
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                links: richTextToHtml(linksProperty?.rich_text || []),
                album_cover: cachedAlbumCover,
                composition: richTextToHtml(compositionProperty?.rich_text || [], true),
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

    console.log("Syncing media from Notion Media page...");

    try {
        // The Media page contains both reviews and photos as blocks
        // We need to extract the photo blocks from the page
        const mediaPageId = schemaData.databases.media.id;
        
        // Get all blocks from the Media page
        const response = await notion.blocks.children.list({
            block_id: mediaPageId,
            page_size: 100,
        });

        console.log(`Found ${response.results.length} blocks in Media page`);
        
        const mediaItems: InsertMedia[] = [];
        let imageCount = 0;

        for (const block of response.results) {
            if (!("type" in block)) continue;

            // Process all image blocks from the page
            if (block.type === "image") {
                imageCount++;
                console.log(`Found image block #${imageCount}`);
                
                // Extract image URL
                let imageUrl = "";
                let caption = "";
                
                if (block.image.type === "file") {
                    imageUrl = block.image.file?.url || "";
                } else if (block.image.type === "external") {
                    imageUrl = block.image.external?.url || "";
                }
                
                // Extract caption if available
                if (block.image.caption && Array.isArray(block.image.caption)) {
                    caption = block.image.caption.map((text: any) => text.plain_text).join(" ");
                }
                
                if (!imageUrl) {
                    console.log(`Skipping image block without URL`);
                    continue;
                }
                
                // Download and cache the image locally
                const localImageUrl = await downloadImage(imageUrl, block.id);
                
                // Create media item from image block
                // Extract photo credit from caption if it contains "Photo:" or "Credit:"
                let photoCredits = "";
                if (caption) {
                    const creditMatch = caption.match(/(?:Photo|Credit):\s*(.+)/i);
                    if (creditMatch) {
                        photoCredits = creditMatch[1].trim();
                        // Remove the credit from the caption for the title
                        caption = caption.replace(creditMatch[0], "").trim();
                    }
                }
                
                const mediaItem: InsertMedia = {
                    title: caption || `Photo ${imageCount}`,
                    description: caption || "",
                    image_url: localImageUrl,
                    alt_text: caption || "",
                    category: "Photo",
                    date_taken: null,
                    photo_credits: photoCredits, // Don't default to any specific credit
                    published: true,
                };
                
                mediaItems.push(mediaItem);
                console.log(`✓ Found media photo: ${mediaItem.title}`);
            }
        }

        if (mediaItems.length > 0) {
            // Clear existing media items
            await db.delete(media);
            
            // Insert all new media items with proper display order
            for (let i = 0; i < mediaItems.length; i++) {
                await db.insert(media).values({
                    ...mediaItems[i],
                    id: `media_photo_${i + 1}_${Date.now()}`,
                    display_order: i + 1,
                });
            }
            
            console.log(`Media sync completed: synced ${mediaItems.length} photos`);
        } else {
            console.log("No photos found in Media page");
        }
        
        // After syncing, handle reordering if needed
        const allMediaItems = await db
            .select()
            .from(media)
            .orderBy(media.display_order);
        
        // Check if we have new photos to reorder
        if (allMediaItems.length >= 4) {
            console.log(`Total media items: ${allMediaItems.length}`);
            
            // The reordering logic can be adjusted based on specific needs
            // For now, we keep the natural order from Notion
        }
    } catch (error) {
        console.error("Error syncing media:", error);
        throw error;
    }
}

/**
 * Sync About page content from Notion
 */
export async function syncAboutContent() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing about content from Notion...");

    try {
        const aboutPageId = "2683907b-2ee6-80f0-9a5f-c4cadbafae36";

        const content = await extractAboutContent(aboutPageId);

        // Clear existing about content
        await db.delete(aboutContent);

        // Insert new about content
        await db.insert(aboutContent).values({
            id: aboutPageId,
            content,
        });

        console.log("About content sync completed");
    } catch (error) {
        console.error("Error syncing about content:", error);
        throw error;
    }
}

/**
 * Sync profile content from Notion
 */
export async function syncProfile() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing profile from Notion...");

    try {
        // Extract content from Home page (contains bio)
        const homePageId = "2343907b-2ee6-8077-b74f-f2bc7cfca7d0";
        const homeContent = await extractContentAndPurpleBox(homePageId, true);

        // Clear existing profile
        await db.delete(profile);

        // Insert new profile
        await db.insert(profile).values({
            id: "default",
            name: "David S. Lefkowitz",
            title: "Composer",
            bio: homeContent.content,
            purple_box_text: homeContent.purpleBoxText,
            email: "",
            social_links: {},
        });

        console.log("Profile sync completed");
    } catch (error) {
        console.error("Error syncing profile:", error);
        throw error;
    }
}

/**
 * Download and process blog images
 */
export async function downloadBlogImages() {
    console.log("Starting image download process...");
    
    try {
        // Get all blog posts
        const posts = await db.select().from(blogPosts);
        console.log(`Found ${posts.length} blog posts to check for images`);
        
        let totalImages = 0;
        
        for (const post of posts) {
            if (!post.content) continue;
            
            // Find all img tags in the content
            const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
            const matches = [...post.content.matchAll(imgRegex)];
            
            if (matches.length > 0) {
                console.log(`Found ${matches.length} images in blog post: ${post.title}`);
                
                let updatedContent = post.content;
                
                for (const match of matches) {
                    const originalUrl = match[1];
                    
                    // Skip if already cached
                    if (originalUrl.startsWith('/api/media-cache/')) {
                        console.log(`Image already cached: ${originalUrl}`);
                        continue;
                    }
                    
                    // Download and cache the image
                    const cachedUrl = await downloadImage(originalUrl, `blog_${post.id}_${totalImages}`);
                    
                    // Replace the URL in content
                    updatedContent = updatedContent.replace(originalUrl, cachedUrl);
                    totalImages++;
                }
                
                // Update the blog post with cached image URLs
                if (updatedContent !== post.content) {
                    await db
                        .update(blogPosts)
                        .set({ content: updatedContent })
                        .where(eq(blogPosts.id, post.id));
                    
                    console.log(`Updated blog post with cached images: ${post.title}`);
                }
            }
        }
        
        // Also check compositions for images
        const comps = await db.select().from(compositions);
        console.log(`Found ${comps.length} compositions to check for images`);
        
        for (const comp of comps) {
            // Check description
            if (comp.description) {
                const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
                const matches = [...comp.description.matchAll(imgRegex)];
                
                if (matches.length > 0) {
                    console.log(`Found ${matches.length} images in composition: ${comp.title}`);
                    
                    let updatedDescription = comp.description;
                    
                    for (const match of matches) {
                        const originalUrl = match[1];
                        
                        // Skip if already cached
                        if (originalUrl.startsWith('/api/media-cache/')) {
                            console.log(`Image already cached: ${originalUrl}`);
                            continue;
                        }
                        
                        // Download and cache the image
                        const cachedUrl = await downloadImage(originalUrl, `comp_desc_${comp.id}_${totalImages}`);
                        
                        // Replace the URL in content
                        updatedDescription = updatedDescription.replace(originalUrl, cachedUrl);
                        totalImages++;
                    }
                    
                    // Update the composition with cached image URLs
                    if (updatedDescription !== comp.description) {
                        await db
                            .update(compositions)
                            .set({ description: updatedDescription })
                            .where(eq(compositions.id, comp.id));
                        
                        console.log(`Updated composition description with cached images: ${comp.title}`);
                    }
                }
            }
            
            // Check reviews
            if (comp.reviews) {
                const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
                const matches = [...comp.reviews.matchAll(imgRegex)];
                
                if (matches.length > 0) {
                    let updatedReviews = comp.reviews;
                    
                    for (const match of matches) {
                        const originalUrl = match[1];
                        
                        if (originalUrl.startsWith('/api/media-cache/')) {
                            continue;
                        }
                        
                        const cachedUrl = await downloadImage(originalUrl, `comp_review_${comp.id}_${totalImages}`);
                        updatedReviews = updatedReviews.replace(originalUrl, cachedUrl);
                        totalImages++;
                    }
                    
                    if (updatedReviews !== comp.reviews) {
                        await db
                            .update(compositions)
                            .set({ reviews: updatedReviews })
                            .where(eq(compositions.id, comp.id));
                    }
                }
            }
        }
        
        console.log(`✅ Image download completed! Downloaded ${totalImages} images total.`);
        
    } catch (error) {
        console.error("Error downloading images:", error);
    }
}

/**
 * Main sync function
 */
export async function syncAllContent(options?: { skipImages?: boolean }) {
    console.log("Starting Notion sync...");

    try {
        await syncProfile();
        await syncBlogPosts();
        await syncCompositions();
        await syncAboutContent();
        await syncRecordings();
        
        // Download images unless explicitly skipped
        if (!options?.skipImages) {
            await downloadBlogImages();
        }

        console.log("✅ Notion sync completed successfully!");
    } catch (error) {
        console.error("❌ Error during Notion sync:", error);
        throw error;
    }
}