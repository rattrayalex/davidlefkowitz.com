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
                    properties.Title?.title?.[0]?.plain_text || "Untitled Post",
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
                    properties.Title?.title?.[0]?.plain_text ||
                    "Untitled Recording",
                composer:
                    properties.Composer?.rich_text?.[0]?.plain_text ||
                    "David S. Lefkowitz",
                performers:
                    properties.Performers?.rich_text?.[0]?.plain_text || "",
                year: properties.Year?.number || new Date().getFullYear(),
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
