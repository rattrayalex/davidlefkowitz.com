import { Client } from "@notionhq/client";

// Initialize Notion client - only if credentials are available
export const notion = process.env.NOTION_API_KEY
    ? new Client({
          auth: process.env.NOTION_API_KEY,
      })
    : null;

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = process.env.NOTION_PAGE_URL
    ? extractPageIdFromUrl(process.env.NOTION_PAGE_URL)
    : null;

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {
    if (!notion || !NOTION_PAGE_ID) {
        throw new Error("Notion client or page ID not available");
    }

    // Array to store the child databases
    const childDatabases = [];

    try {
        // Query all child blocks in the specified page
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: NOTION_PAGE_ID,
                start_cursor: startCursor,
            });

            // Process the results
            for (const block of response.results) {
                // Check if the block is a child database
                if ("type" in block && block.type === "child_database") {
                    const databaseId = block.id;

                    // Retrieve the database title
                    const databaseInfo = await notion.databases.retrieve({
                        database_id: databaseId,
                    });

                    // Add the database to our list
                    childDatabases.push(databaseInfo);
                }
            }

            // Check if there are more results to fetch
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }

        return childDatabases;
    } catch (error) {
        console.error("Error listing child databases:", error);
        throw error;
    }
}

// Find get a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        if (
            "title" in db &&
            db.title &&
            Array.isArray(db.title) &&
            db.title.length > 0
        ) {
            const dbTitle = db.title[0]?.plain_text?.toLowerCase() || "";
            if (dbTitle === title.toLowerCase()) {
                return db;
            }
        }
    }

    return null;
}

// Get all compositions from the Notion database
export async function getCompositions(compositionsDatabaseId: string) {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    // Implement proper pagination to get ALL compositions
    let allResults: any[] = [];
    let hasMore = true;
    let nextCursor: string | null = null;

    while (hasMore) {
        const requestBody: any = {
            database_id: compositionsDatabaseId,
            page_size: 100, // Use maximum page size
        };

        if (nextCursor) {
            requestBody.start_cursor = nextCursor;
        }

        const response = await notion.databases.query(requestBody);

        allResults = allResults.concat(response.results);
        hasMore = response.has_more;
        nextCursor = response.next_cursor;
    }

    return allResults.map((page: any) => {
        const properties = page.properties;

        return {
            id: page.id,
            title: properties.Title?.title?.[0]?.plain_text,
            category: properties.Category?.select?.name,
            year: properties.Year?.number,
            duration: properties.Duration?.rich_text?.[0]?.plain_text || "",
            instrumentation:
                properties.Instrumentation?.rich_text?.[0]?.plain_text || "",
            description:
                properties.Description?.rich_text?.[0]?.plain_text || "",
            premiere_info:
                properties.PremiereInfo?.rich_text?.[0]?.plain_text || "",
            score_url: properties.ScoreURL?.url || "",
            audio_url: properties.AudioURL?.url || "",
        };
    });
}

// Get all blog posts from the Notion database
export async function getBlogPosts(blogDatabaseId: string) {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        // Implement proper pagination to get ALL blog posts
        let allResults: any[] = [];
        let hasMore = true;
        let nextCursor: string | null = null;

        while (hasMore) {
            const requestBody: any = {
                database_id: blogDatabaseId,
                page_size: 100, // Use maximum page size
            };

            if (nextCursor) {
                requestBody.start_cursor = nextCursor;
            }

            const response = await notion.databases.query(requestBody);

            allResults = allResults.concat(response.results);
            hasMore = response.has_more;
            nextCursor = response.next_cursor;
        }

        return allResults.map((page: any) => {
            const properties = page.properties;

            return {
                id: page.id,
                title:
                    properties.Title?.title?.[0]?.plain_text || "",
                excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
                content: properties.Content?.rich_text?.[0]?.plain_text || "",
                published_date: properties.PublishedDate?.date?.start
                    ? new Date(properties.PublishedDate.date.start)
                    : new Date(),
                author:
                    properties.Author?.rich_text?.[0]?.plain_text ||
                    "David S. Lefkowitz",
                tags:
                    properties.Tags?.multi_select?.map(
                        (tag: any) => tag.name,
                    ) || [],
                featured_image_url:
                    properties.FeaturedImage?.files?.[0]?.external?.url ||
                    properties.FeaturedImage?.files?.[0]?.file?.url ||
                    "",
            };
        });
    } catch (error) {
        console.error("Error fetching blog posts from Notion:", error);
        throw new Error("Failed to fetch blog posts from Notion");
    }
}

// Get all recordings from the Notion database
export async function getRecordings(recordingsDatabaseId: string) {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        const response = await notion.databases.query({
            database_id: recordingsDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            return {
                id: page.id,
                title:
                    properties.Title?.title?.[0]?.plain_text || "",
                composer:
                    properties.Composer?.rich_text?.[0]?.plain_text ||
                    "David S. Lefkowitz",
                performers:
                    properties.Performers?.rich_text?.[0]?.plain_text || "",
                year: properties.Year?.number || null,
                duration: properties.Duration?.rich_text?.[0]?.plain_text || "",
                description:
                    properties.Description?.rich_text?.[0]?.plain_text || "",
                audio_url: properties.AudioURL?.url || "",
                album_cover_url:
                    properties.AlbumCover?.files?.[0]?.external?.url ||
                    properties.AlbumCover?.files?.[0]?.file?.url ||
                    "",
                purchase_links: {
                    spotify: properties.SpotifyURL?.url || "",
                    apple_music: properties.AppleMusicURL?.url || "",
                    bandcamp: properties.BandcampURL?.url || "",
                },
            };
        });
    } catch (error) {
        console.error("Error fetching recordings from Notion:", error);
        throw new Error("Failed to fetch recordings from Notion");
    }
}

// Get review content from the Notion Media page
export async function getMediaPageReviews() {
    console.log("=== Starting getMediaPageReviews ===");
    console.log("Notion client exists:", !!notion);
    console.log("NOTION_PAGE_ID:", NOTION_PAGE_ID);
    
    if (!notion || !NOTION_PAGE_ID) {
        console.log("Missing notion client or page ID");
        throw new Error("Notion client or page ID not available");
    }

    try {
        console.log("Fetching blocks from Notion page...");
        // Get all blocks from the media page
        const blocks = await notion.blocks.children.list({
            block_id: NOTION_PAGE_ID,
            page_size: 100,
        });
        
        console.log("Successfully fetched blocks from Notion");

        const reviewParagraphs = [];

        console.log(`Found ${blocks.results.length} blocks in media page`);

        // Recursive function to extract text from nested blocks
        const extractTextFromBlock = async (block: any): Promise<string[]> => {
            if (!("type" in block)) return [];
            
            const texts: string[] = [];
            
            // Handle paragraph blocks - look for review content
            if (block.type === "paragraph" && block.paragraph?.rich_text?.length > 0) {
                const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join("").trim();
                
                // Look for review content starting with "David Lefkowitz" and containing "unique voice"
                if ((text.includes("David Lefkowitz") && text.includes("unique voice")) ||
                    (text.includes("David Lefkowitz") && text.length > 50) ||
                    (text.includes('"') && text.length > 50)) {
                    texts.push(text);
                }
            }
            
            // Handle column_list and column blocks
            if (block.type === "column_list" || block.type === "column") {
                try {
                    console.log(`Fetching children for ${block.type} block...`);
                    const childBlocks = await notion.blocks.children.list({
                        block_id: block.id,
                        page_size: 100,
                    });
                    
                    console.log(`Found ${childBlocks.results.length} child blocks in ${block.type}`);
                    
                    for (const childBlock of childBlocks.results) {
                        if ("type" in childBlock) {
                            console.log(`  Child block type: ${childBlock.type}`);
                        }
                        const childTexts = await extractTextFromBlock(childBlock);
                        console.log(`  Child block returned ${childTexts.length} texts`);
                        if (childTexts.length > 0) {
                            console.log(`  Child texts: ${childTexts.map(t => t.substring(0, 30)).join(', ')}...`);
                        }
                        texts.push(...childTexts);
                    }
                } catch (error) {
                    console.log(`Error fetching children for ${block.type}:`, error);
                }
            }
            
            // Handle child_page blocks (reviews are stored in child pages)
            if (block.type === "child_page") {
                try {
                    const childPageBlocks = await notion.blocks.children.list({
                        block_id: block.id,
                        page_size: 100,
                    });
                    
                    for (const childPageBlock of childPageBlocks.results) {
                        const childTexts = await extractTextFromBlock(childPageBlock);
                        texts.push(...childTexts);
                    }
                } catch (error) {
                    console.log(`Error fetching child page content:`, error);
                }
            }
            
            // Handle quote blocks (reviews might be in quotes)
            if (block.type === "quote" && block.quote?.rich_text?.length > 0) {
                const text = block.quote.rich_text.map((t: any) => t.plain_text).join("").trim();
                console.log(`Found quote text: ${text.substring(0, 50)}...`);
                if (text.length > 30) {
                    texts.push(text);
                }
            }
            
            // Handle bulleted_list_item blocks (reviews might be in lists)
            if (block.type === "bulleted_list_item" && block.bulleted_list_item?.rich_text?.length > 0) {
                const text = block.bulleted_list_item.rich_text.map((t: any) => t.plain_text).join("").trim();
                console.log(`Found bulleted list text: ${text.substring(0, 50)}...`);
                if (text.length > 30 && !text.includes("UCLA Herb Alpert School of Music")) {
                    texts.push(text);
                }
            }
            
            // Handle numbered_list_item blocks
            if (block.type === "numbered_list_item" && block.numbered_list_item?.rich_text?.length > 0) {
                const text = block.numbered_list_item.rich_text.map((t: any) => t.plain_text).join("").trim();
                console.log(`Found numbered list text: ${text.substring(0, 50)}...`);
                if (text.length > 30 && !text.includes("UCLA Herb Alpert School of Music")) {
                    texts.push(text);
                }
            }
            
            // Handle callout blocks (reviews might be in callouts)
            if (block.type === "callout" && block.callout?.rich_text?.length > 0) {
                const text = block.callout.rich_text.map((t: any) => t.plain_text).join("").trim();
                console.log(`Found callout text: ${text.substring(0, 50)}...`);
                if (text.length > 30 && !text.includes("UCLA Herb Alpert School of Music")) {
                    texts.push(text);
                }
            }
            
            // Debug: log block types we're not handling
            const handledTypes = ['paragraph', 'quote', 'bulleted_list_item', 'numbered_list_item', 'callout', 'column_list', 'column', 'child_page'];
            if (!handledTypes.includes(block.type)) {
                console.log(`Unhandled block type: ${block.type}`);
            }
            
            return texts;
        };

        for (const block of blocks.results) {
            if (!("type" in block)) continue;
            console.log(`Processing block type: ${block.type}`);
            const texts = await extractTextFromBlock(block);
            reviewParagraphs.push(...texts);
        }

        console.log(`Found ${reviewParagraphs.length} review paragraphs`);
        return reviewParagraphs;
    } catch (error) {
        console.error("Error fetching media page reviews from Notion:", error);
        throw new Error("Failed to fetch media page reviews from Notion");
    }
}
