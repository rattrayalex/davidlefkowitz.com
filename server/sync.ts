import { db } from "./db";
import { notion } from "./notion";
import { blogPosts, compositions, recordings, type InsertBlogPost, type InsertComposition, type InsertRecording } from "@shared/schema";
import { eq } from "drizzle-orm";

// Load database schemas
import * as fs from "fs";
const schemaData = JSON.parse(fs.readFileSync("server/notion-schemas.json", "utf-8"));

/**
 * Extract full text content from a Notion page
 */
async function extractPageContent(pageId: string): Promise<string> {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        // Get all blocks from the page
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100
        });

        let content = "";

        for (const block of blocks.results) {
            if (!('type' in block)) continue;

            switch (block.type) {
                case 'paragraph':
                    const paragraphText = block.paragraph?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (paragraphText.trim()) {
                        content += paragraphText + '\n\n';
                    }
                    break;
                
                case 'heading_1':
                    const h1Text = block.heading_1?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (h1Text.trim()) {
                        content += '# ' + h1Text + '\n\n';
                    }
                    break;
                
                case 'heading_2':
                    const h2Text = block.heading_2?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (h2Text.trim()) {
                        content += '## ' + h2Text + '\n\n';
                    }
                    break;
                
                case 'heading_3':
                    const h3Text = block.heading_3?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (h3Text.trim()) {
                        content += '### ' + h3Text + '\n\n';
                    }
                    break;
                
                case 'bulleted_list_item':
                    const bulletText = block.bulleted_list_item?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (bulletText.trim()) {
                        content += '• ' + bulletText + '\n';
                    }
                    break;
                
                case 'numbered_list_item':
                    const numberText = block.numbered_list_item?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (numberText.trim()) {
                        content += '1. ' + numberText + '\n';
                    }
                    break;

                case 'quote':
                    const quoteText = block.quote?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (quoteText.trim()) {
                        content += '> ' + quoteText + '\n\n';
                    }
                    break;

                case 'code':
                    const codeText = block.code?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (codeText.trim()) {
                        content += '```\n' + codeText + '\n```\n\n';
                    }
                    break;
            }
        }

        return content.trim();
    } catch (error) {
        console.error(`Error extracting content for page ${pageId}:`, error);
        return "";
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
        const response = await notion.databases.query({
            database_id: schemaData.databases.blog.id,
            filter: {
                property: "Status",
                status: {
                    equals: "Published"
                }
            }
        });

        console.log(`Found ${response.results.length} published blog posts`);

        for (const page of response.results) {
            if (!('properties' in page)) continue;
            
            const properties = page.properties;
            const titleProperty = properties["Post Title"] as any;
            // Concatenate all rich text parts to get the full title
            const title = titleProperty?.title?.map((part: any) => part.plain_text).join("") || "Untitled";
            
            // Skip posts with missing or invalid titles
            if (!title || title.trim() === "" || title.trim().length < 2) {
                console.log(`Skipping post ${page.id} with invalid title: "${title}"`);
                continue;
            }
            

            const publicationDateProperty = properties["Publication Date"] as any;
            const dateProperty = properties.Date as any;
            const publishedDate = publicationDateProperty?.date?.start || dateProperty?.date?.start;
            if (!publishedDate) {
                console.log(`Skipping post ${page.id} with no published date`);
                continue;
            }

            // Extract full content from the page
            console.log(`Extracting content for: ${title}`);
            const content = await extractPageContent(page.id);
            const readTime = calculateReadingTime(content);

            // Create excerpt from first paragraph or first 150 chars
            const excerpt = content.split('\n\n')[0]?.substring(0, 150) || "";

            // Parse date carefully to avoid timezone issues - use local timezone
            const [year, month, day] = publishedDate.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // Month is 0-indexed

            const blogPost: InsertBlogPost = {
                title: title.trim(),
                content: content,
                excerpt: excerpt + (excerpt.length >= 150 ? "..." : ""),
                published_date: dateObj,
                published: true,
                tags: [], // No tags in current schema, but ready for future
                read_time: readTime,
                notion_url: `https://www.notion.so/${page.id.replace(/-/g, '')}`
            };

            // Insert or update the blog post
            await db
                .insert(blogPosts)
                .values({ 
                    id: page.id,
                    title: blogPost.title,
                    content: blogPost.content,
                    excerpt: blogPost.excerpt,
                    published_date: blogPost.published_date,
                    published: blogPost.published,
                    tags: blogPost.tags,
                    read_time: blogPost.read_time,
                    notion_url: blogPost.notion_url
                })
                .onConflictDoUpdate({
                    target: blogPosts.id,
                    set: {
                        title: blogPost.title,
                        content: blogPost.content,
                        excerpt: blogPost.excerpt,
                        published_date: blogPost.published_date,
                        published: blogPost.published,
                        tags: blogPost.tags,
                        read_time: blogPost.read_time,
                        notion_url: blogPost.notion_url,
                        updated_at: new Date(),
                        last_synced: new Date()
                    }
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

    try {
        const response = await notion.databases.query({
            database_id: schemaData.databases.compositions.id,
            filter: {
                property: "Published",
                checkbox: {
                    equals: true
                }
            }
        });

        console.log(`Found ${response.results.length} published compositions`);

        for (const page of response.results) {
            if (!('properties' in page)) continue;
            
            const properties = page.properties;

            const nameProperty = properties.Name as any;
            const instrumentationProperty = properties.Instrumentation as any;
            const ensembleProperty = properties.Ensemble as any;
            const yearProperty = properties["Year ©"] as any;
            const durationProperty = properties.Duration as any;
            const publisherProperty = properties.Publisher as any;
            const premiereProperty = properties["Date of premier"] as any;
            const recordingProperty = properties.Recording as any;

            const composition: InsertComposition = {
                title: nameProperty?.title?.[0]?.plain_text || "Untitled",
                instrumentation: instrumentationProperty?.multi_select?.map((item: any) => item.name) || [],
                ensemble: ensembleProperty?.multi_select?.map((item: any) => item.name) || [],
                year: yearProperty?.number || new Date().getFullYear(),
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                publisher: publisherProperty?.multi_select?.map((item: any) => item.name) || [],
                premiere_info: premiereProperty?.date?.start || "",
                recording: recordingProperty?.rich_text?.[0]?.plain_text || "",
                published: true
            };

            // Insert or update the composition
            await db
                .insert(compositions)
                .values({ 
                    id: page.id,
                    title: composition.title,
                    instrumentation: composition.instrumentation,
                    ensemble: composition.ensemble,
                    year: composition.year,
                    duration: composition.duration,
                    publisher: composition.publisher,
                    premiere_info: composition.premiere_info,
                    recording: composition.recording,
                    published: composition.published
                })
                .onConflictDoUpdate({
                    target: compositions.id,
                    set: {
                        title: composition.title,
                        instrumentation: composition.instrumentation,
                        ensemble: composition.ensemble,
                        year: composition.year,
                        duration: composition.duration,
                        publisher: composition.publisher,
                        premiere_info: composition.premiere_info,
                        recording: composition.recording,
                        published: composition.published,
                        updated_at: new Date(),
                        last_synced: new Date()
                    }
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
 * Sync all recordings from Notion to local database
 */
export async function syncRecordings() {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    console.log("Syncing recordings from Notion...");

    try {
        const response = await notion.databases.query({
            database_id: schemaData.databases.recordings.id
        });

        console.log(`Found ${response.results.length} recordings`);

        for (const page of response.results) {
            if (!('properties' in page)) continue;
            
            const properties = page.properties;

            const nameOfAlbumProperty = properties["Name of Album"] as any;
            const performersProperty = properties.Performers as any;
            const ensembleProperty = properties.Ensemble as any;
            const instrumentationProperty = properties.Instrumentation as any;
            const yearProperty = properties["Year ©"] as any;
            const durationProperty = properties.Duration as any;
            const labelProperty = properties.Label as any;
            const linksProperty = properties.Links as any;

            const recording: InsertRecording = {
                title: nameOfAlbumProperty?.title?.[0]?.plain_text || "Untitled",
                composer: "David S. Lefkowitz",
                performers: performersProperty?.multi_select?.map((item: any) => item.name) || [],
                ensemble: ensembleProperty?.multi_select?.map((item: any) => item.name) || [],
                instrumentation: instrumentationProperty?.multi_select?.map((item: any) => item.name) || [],
                year: yearProperty?.number || new Date().getFullYear(),
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                label: labelProperty?.multi_select?.map((item: any) => item.name) || [],
                links: linksProperty?.rich_text?.[0]?.plain_text || ""
            };

            // Insert or update the recording
            await db
                .insert(recordings)
                .values({ 
                    id: page.id,
                    title: recording.title,
                    composer: recording.composer,
                    performers: recording.performers,
                    ensemble: recording.ensemble,
                    instrumentation: recording.instrumentation,
                    year: recording.year,
                    duration: recording.duration,
                    label: recording.label,
                    links: recording.links
                })
                .onConflictDoUpdate({
                    target: recordings.id,
                    set: {
                        title: recording.title,
                        composer: recording.composer,
                        performers: recording.performers,
                        ensemble: recording.ensemble,
                        instrumentation: recording.instrumentation,
                        year: recording.year,
                        duration: recording.duration,
                        label: recording.label,
                        links: recording.links,
                        updated_at: new Date(),
                        last_synced: new Date()
                    }
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
 * Sync all data from Notion to local database
 */
export async function syncAllData() {
    console.log("Starting full data sync from Notion...");
    
    await syncBlogPosts();
    await syncCompositions();
    await syncRecordings();
    
    console.log("Full data sync completed");
}