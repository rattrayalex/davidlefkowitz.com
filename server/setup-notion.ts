import { Client } from "@notionhq/client";
import { notion, NOTION_PAGE_ID, createDatabaseIfNotExists, findDatabaseByTitle } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

if (!process.env.NOTION_PAGE_URL) {
    throw new Error("NOTION_PAGE_URL is not defined. Please add it to your environment variables.");
}

async function setupNotionDatabases() {
    console.log("Setting up Notion databases...");
    
    // Create Compositions database
    await createDatabaseIfNotExists("Compositions", {
        Title: {
            title: {}
        },
        Instrumentation: {
            rich_text: {}
        },
        Description: {
            rich_text: {}
        },
        Year: {
            number: {}
        },
        Category: {
            select: {
                options: [
                    { name: "Chamber Music", color: "blue" },
                    { name: "Orchestral", color: "green" },
                    { name: "Solo", color: "purple" },
                    { name: "Electronic", color: "orange" },
                    { name: "Vocal", color: "red" },
                    { name: "Collaborative", color: "yellow" }
                ]
            }
        },
        Duration: {
            rich_text: {}
        },
        PremiereInfo: {
            rich_text: {}
        },
        ScoreURL: {
            url: {}
        },
        AudioURL: {
            url: {}
        }
    });

    // Create Recordings database
    await createDatabaseIfNotExists("Recordings", {
        Title: {
            title: {}
        },
        Performer: {
            rich_text: {}
        },
        Description: {
            rich_text: {}
        },
        ReleaseDate: {
            date: {}
        },
        AudioURL: {
            url: {}
        },
        VideoURL: {
            url: {}
        },
        AlbumCover: {
            url: {}
        },
        Duration: {
            rich_text: {}
        }
    });

    // Create Blog Posts database
    await createDatabaseIfNotExists("BlogPosts", {
        Title: {
            title: {}
        },
        Excerpt: {
            rich_text: {}
        },
        Content: {
            rich_text: {}
        },
        PublishedDate: {
            date: {}
        },
        ReadTime: {
            number: {}
        },
        Tags: {
            multi_select: {
                options: [
                    { name: "Composition", color: "blue" },
                    { name: "Theory", color: "green" },
                    { name: "Teaching", color: "purple" },
                    { name: "Performance", color: "orange" },
                    { name: "Technology", color: "red" },
                    { name: "Research", color: "yellow" }
                ]
            }
        },
        Published: {
            checkbox: {}
        }
    });

    // Create Profile page (single page, not database)
    try {
        await notion.pages.create({
            parent: {
                page_id: NOTION_PAGE_ID
            },
            properties: {
                title: {
                    title: [
                        {
                            text: {
                                content: "Profile"
                            }
                        }
                    ]
                }
            },
            children: [
                {
                    object: "block",
                    type: "heading_1",
                    heading_1: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: "David S. Lefkowitz"
                                }
                            }
                        ]
                    }
                },
                {
                    object: "block",
                    type: "paragraph",
                    paragraph: {
                        rich_text: [
                            {
                                type: "text",
                                text: {
                                    content: "Composer, Professor of Music Composition & Theory | UCLA Herb Alpert School of Music"
                                }
                            }
                        ]
                    }
                }
            ]
        });
        console.log("Created Profile page");
    } catch (error) {
        console.log("Profile page may already exist or error occurred:", error);
    }

    console.log("Database setup complete!");
}

// Run the setup
setupNotionDatabases().then(() => {
    console.log("Setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});
