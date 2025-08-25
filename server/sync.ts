import { db } from "./db";
import { notion } from "./notion";
import { blogPosts, compositions, recordings, type InsertBlogPost, type InsertComposition, type InsertRecording } from "@shared/schema";
import { eq } from "drizzle-orm";

// Load database schemas
import * as fs from "fs";
const schemaData = JSON.parse(fs.readFileSync("server/notion-schemas.json", "utf-8"));

/**
 * Extract content and purple box text from a Notion page
 * Uses last paragraph for purple box and excludes it from content for all posts
 */
async function extractContentAndPurpleBox(pageId: string, extractLastParagraph: boolean): Promise<{content: string, purpleBoxText: string}> {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        const blocks = await notion.blocks.children.list({
            block_id: pageId,
            page_size: 100
        });

        let content = "";
        const contentBlocks = [];

        for (const block of blocks.results) {
            if (!('type' in block)) continue;

            switch (block.type) {
                case 'paragraph':
                    const paragraphText = block.paragraph?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (paragraphText.trim()) {
                        contentBlocks.push(paragraphText);
                    }
                    break;
                
                case 'heading_1':
                    const h1Text = block.heading_1?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (h1Text.trim()) {
                        contentBlocks.push('# ' + h1Text);
                    }
                    break;
                
                case 'heading_2':
                    const h2Text = block.heading_2?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (h2Text.trim()) {
                        contentBlocks.push('## ' + h2Text);
                    }
                    break;
                
                case 'heading_3':
                    const h3Text = block.heading_3?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (h3Text.trim()) {
                        contentBlocks.push('### ' + h3Text);
                    }
                    break;
                
                case 'bulleted_list_item':
                    const bulletText = block.bulleted_list_item?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (bulletText.trim()) {
                        contentBlocks.push('• ' + bulletText);
                    }
                    break;
                
                case 'numbered_list_item':
                    const numberText = block.numbered_list_item?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (numberText.trim()) {
                        contentBlocks.push('1. ' + numberText);
                    }
                    break;

                case 'quote':
                    const quoteText = block.quote?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (quoteText.trim()) {
                        contentBlocks.push('> ' + quoteText);
                    }
                    break;

                case 'code':
                    const codeText = block.code?.rich_text?.map(t => t.plain_text).join('') || '';
                    if (codeText.trim()) {
                        contentBlocks.push('```\n' + codeText + '\n```');
                    }
                    break;
            }
        }

        // For all posts: extract last paragraph for purple box if content exists
        if (contentBlocks.length > 0) {
            // Filter out any empty blocks first
            const nonEmptyBlocks = contentBlocks.filter(block => block.trim().length > 0);
            
            if (nonEmptyBlocks.length > 0) {
                // Take the very last non-empty block for purple box
                const purpleBoxText = nonEmptyBlocks[nonEmptyBlocks.length - 1];
                const contentWithoutLast = nonEmptyBlocks.slice(0, -1);
                
                // Add tab indent to ALL paragraphs (including first)
                const indentedContent = contentWithoutLast.map(block => {
                    // Only add tab to regular paragraphs (not headings, lists, quotes, code)
                    if (!block.startsWith('#') && !block.startsWith('•') && !block.startsWith('1.') && !block.startsWith('>') && !block.startsWith('```')) {
                        // Remove existing tab if present, then add a new one for consistency
                        const cleanBlock = block.startsWith('\t') ? block.substring(1) : block;
                        return '\t' + cleanBlock;
                    }
                    return block;
                });
                
                content = indentedContent.join('\n');
                return { content: content.trim(), purpleBoxText: purpleBoxText.trim() };
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
            

            const commentProperty = properties["Comment"] as any;
            
            const publicationDateProperty = properties["Publication Date"] as any;
            const dateProperty = properties.Date as any;
            const publishedDate = publicationDateProperty?.date?.start || dateProperty?.date?.start;
            if (!publishedDate) {
                console.log(`Skipping post ${page.id} with no published date`);
                continue;
            }

            // Extract content and purple box text
            console.log(`Extracting content for: ${title}`);
            const { content, purpleBoxText } = await extractContentAndPurpleBox(page.id, true);
            const readTime = calculateReadingTime(content);
            
            // Use purple box text if available, otherwise fall back to comment property
            const comment = purpleBoxText || commentProperty?.rich_text?.map((part: any) => part.plain_text).join("") || "";

            // Create excerpt from first paragraph or first 150 chars
            const excerpt = content.split('\n\n')[0]?.substring(0, 150) || "";

            // Parse date carefully to avoid timezone issues - use local timezone
            const [year, month, day] = publishedDate.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // Month is 0-indexed

            const blogPost: InsertBlogPost = {
                title: title.trim(),
                content: content,
                excerpt: excerpt + (excerpt.length >= 150 ? "..." : ""),
                comment: comment,
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
                    ...blogPost,
                    id: page.id
                })
                .onConflictDoUpdate({
                    target: blogPosts.id,
                    set: {
                        ...blogPost,
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

            // Parse year with improved handling
            let year = new Date().getFullYear(); // default to current year
            
            if (yearProperty) {
                // Try multiple ways to parse the year
                if (yearProperty.number) {
                    year = yearProperty.number;
                } else if (yearProperty.rich_text?.[0]?.plain_text) {
                    // Try to parse year from text
                    const textValue = yearProperty.rich_text[0].plain_text.trim();
                    const parsedYear = parseInt(textValue, 10);
                    if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= new Date().getFullYear()) {
                        year = parsedYear;
                    }
                } else if (yearProperty.formula?.number) {
                    year = yearProperty.formula.number;
                }
            }

            const composition: InsertComposition = {
                title: nameProperty?.title?.[0]?.plain_text || "Untitled",
                instrumentation: instrumentationProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                ensemble: ensembleProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                year: year,
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                publisher: publisherProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                premiere_info: premiereProperty?.date?.start || "",
                recording: recordingProperty?.rich_text?.[0]?.plain_text || "",
                published: true
            };

            // Insert or update the composition
            await db
                .insert(compositions)
                .values({
                    ...composition,
                    id: page.id
                })
                .onConflictDoUpdate({
                    target: compositions.id,
                    set: {
                        ...composition,
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
                performers: performersProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                ensemble: ensembleProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                instrumentation: instrumentationProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                year: yearProperty?.number || new Date().getFullYear(),
                duration: durationProperty?.rich_text?.[0]?.plain_text || "",
                label: labelProperty?.multi_select?.map((item: any) => item.name) as string[] || [],
                links: linksProperty?.rich_text?.[0]?.plain_text || ""
            };

            // Insert or update the recording
            await db
                .insert(recordings)
                .values({
                    ...recording,
                    id: page.id
                })
                .onConflictDoUpdate({
                    target: recordings.id,
                    set: {
                        ...recording,
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