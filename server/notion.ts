import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_API_KEY!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    if (match && match[1]) {
        return match[1];
    }

    throw Error("Failed to extract page ID");
}

export const NOTION_PAGE_ID = extractPageIdFromUrl(process.env.NOTION_PAGE_URL!);

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {
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
                if (block.type === "child_database") {
                    const databaseId = block.id;

                    // Retrieve the database title
                    try {
                        const databaseInfo = await notion.databases.retrieve({
                            database_id: databaseId,
                        });

                        // Add the database to our list
                        childDatabases.push(databaseInfo);
                    } catch (error) {
                        console.error(`Error retrieving database ${databaseId}:`, error);
                    }
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

/**
 * Lists all child pages (not databases) within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of page objects with id and title
 */
export async function getNotionPages() {
    const childPages = [];
    
    try {
        let hasMore = true;
        let startCursor: string | undefined = undefined;
        
        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: NOTION_PAGE_ID,
                start_cursor: startCursor,
            });
            
            for (const block of response.results) {
                // Check if the block is a child page (not database)
                if (block.type === "child_page") {
                    const pageId = block.id;
                    
                    try {
                        const pageInfo = await notion.pages.retrieve({
                            page_id: pageId,
                        });
                        
                        // Get the page title from properties
                        const titleProperty = pageInfo.properties?.title || pageInfo.properties?.Name;
                        let title = "";
                        
                        if (titleProperty && titleProperty.type === "title" && titleProperty.title) {
                            title = titleProperty.title.map((t: any) => t.plain_text).join("");
                        }
                        
                        childPages.push({
                            id: pageId,
                            title: title || "Untitled"
                        });
                    } catch (error) {
                        console.error(`Error retrieving page ${pageId}:`, error);
                    }
                }
            }
            
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }
        
        return childPages;
    } catch (error) {
        console.error("Error listing child pages:", error);
        throw error;
    }
}

/**
 * Fetch content from a standalone Notion page
 * @param pageId - The ID of the page to fetch
 * @returns The page blocks with content
 */
export async function fetchNotionPageContent(pageId: string) {
    try {
        const blocks = [];
        let hasMore = true;
        let startCursor: string | undefined = undefined;
        
        while (hasMore) {
            const response = await notion.blocks.children.list({
                block_id: pageId,
                start_cursor: startCursor,
            });
            
            blocks.push(...response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }
        
        return blocks;
    } catch (error) {
        console.error("Error fetching page content:", error);
        throw error;
    }
}

// Find get a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        if (db.title && Array.isArray(db.title) && db.title.length > 0) {
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

    try {
        const response = await notion.databases.query({
            database_id: compositionsDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            return {
                id: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "",
                year: properties.Year?.number || null,
                duration: properties.Duration?.rich_text?.[0]?.plain_text || "",
                instrumentation: properties.Instrumentation?.rich_text?.[0]?.plain_text || "",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                score_url: properties.ScoreURL?.url || "",
                audio_url: properties.AudioURL?.url || "",
                featured_image_url:
                    properties.FeaturedImage?.files?.[0]?.external?.url ||
                    properties.FeaturedImage?.files?.[0]?.file?.url ||
                    "",
            };
        });
    } catch (error) {
        console.error("Error fetching compositions from Notion:", error);
        throw new Error("Failed to fetch compositions from Notion");
    }
}

// Get all blog posts from the Notion database
export async function getBlogPosts(blogDatabaseId: string) {
    if (!notion) {
        throw new Error("Notion client not available");
    }

    try {
        const response = await notion.databases.query({
            database_id: blogDatabaseId,
            sorts: [
                {
                    property: "PublishedDate",
                    direction: "descending",
                },
            ],
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            const publishedDate = properties.PublishedDate?.date?.start
                ? new Date(properties.PublishedDate.date.start)
                : null;

            return {
                id: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "",
                slug: properties.Slug?.rich_text?.[0]?.plain_text || "",
                excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
                published_date: publishedDate,
                is_published: properties.IsPublished?.checkbox || false,
                tags:
                    properties.Tags?.multi_select?.map((tag: any) => tag.name) ||
                    [],
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
export async function getMediaPageReviews(): Promise<string[]> {
    // Return the known 8 review excerpts from the Media page
    // These are curated professional reviews that appear under "Review Excerpts" section
    return [
        "\"David Lefkowitz...has a unique voice to present, and it is worth listening to. The subtitle for the CD is Music of Contradictions, and he makes these words meaningful via the constant use of tension in his writing. This gives much of his music an energetic sense of motion, which takes on a programmable value in a work such as The Chase Through Escher's Metamorphosen. ...Elsewhere, Lefkowitz continues to show off a fascination with the nature of movement in music, incorporating devices that are both diverse and connected, from the baroque and before to contemporary minimalism. … It is a complement to the composer that style and technique are not ends in themselves, but rather tools to be used in the larger conceptions of the music. … In all, this CD is a fine omnibus to introduce a talented and compelling young composer.\"  Peter Burwasser",
        
        "\"The most virtuosic composing and greatest breadth was achieved by California composer David Lefkowitz's A Surfer's Guide for the Perplexed (or: Jonah on the Raging Sea), which proved to be a rich contemporary tone poem.\"  Jim Lowe",
        
        "\"David Lefkowitz's three-movement Quartet for violin, cello, flute, and piano stood out for its poised, purposeful quality.  It moved relentlessly ahead on wings of ostinato figures, quasi-Oriental flavors, punctuating jabs and accents, and effectively modulating tempos.\"  Herman Trotter",
        
        "\"As it is with poets, painters and sculptors, so it is for composers—some revel in creating the perfect small gem and others work on large sweeping canvases. With this collection of new pieces, David Lefkowitz demonstrates his comfort at both scales.\"  Martin Perlich",
        
        "\"Ruminations, by Los Angeles composer David S. Lefkowitz, provided the concert's thoughtful conclusion, and while it possessed the same harmonic language as the other pieces, it was for me the most affecting. The long, sometimes sorrowing lines explored a wide pitch spectrum, often doubling back on themselves with an utterly convincing musical logic.\"  Stephen Greenbank",
        
        "\"When Sibelius Piano Trio performs Ruminations by David S. Lefkowitz, I find myself wishing I could listen to more than one movement.\"  Rushton Paul",
        
        "\"On the B-side, the single-movement, through-composed Ruminations by David S. Lefkowitz provides a fitting conclusion to this beautiful album. The emotional weight of this piece is profound.\"  Michael Leser Johnson",
        
        "\"…who write on clouds… is mysterious and evocative… I began to see the texture as a metaphor for loneliness in the midst of abundance, and also as a meditation on the fragility of communication.\"  David DeBoor Canfield"
    ];
}