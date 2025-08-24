import { createDatabaseIfNotExists } from "./notion.js";

// Environment variables validation
if (!process.env.NOTION_API_KEY) {
    console.error("NOTION_API_KEY is not defined. Please add it to your environment variables.");
    process.exit(1);
}

if (!process.env.NOTION_PAGE_URL) {
    console.error("NOTION_PAGE_URL is not defined. Please add it to your environment variables.");
    process.exit(1);
}

async function setupComposerDatabases() {
    try {
        console.log("Setting up Notion databases for composer website...");

        // Create Compositions database
        console.log("Creating Compositions database...");
        await createDatabaseIfNotExists("Compositions", {
            Title: {
                title: {}
            },
            Category: {
                select: {
                    options: [
                        { name: "Chamber Music", color: "blue" },
                        { name: "Orchestral", color: "green" },
                        { name: "Electronic", color: "purple" },
                        { name: "Vocal", color: "orange" },
                        { name: "Solo", color: "red" },
                        { name: "Other", color: "gray" }
                    ]
                }
            },
            Year: {
                number: {}
            },
            Duration: {
                rich_text: {}
            },
            Instrumentation: {
                rich_text: {}
            },
            Description: {
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

        // Create Blog Posts database
        console.log("Creating Blog Posts database...");
        await createDatabaseIfNotExists("Blog Posts", {
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
            Author: {
                rich_text: {}
            },
            Tags: {
                multi_select: {
                    options: [
                        { name: "Composition", color: "blue" },
                        { name: "Theory", color: "green" },
                        { name: "Performance", color: "orange" },
                        { name: "Technology", color: "purple" },
                        { name: "Teaching", color: "red" },
                        { name: "Personal", color: "gray" }
                    ]
                }
            },
            FeaturedImage: {
                files: {}
            }
        });

        // Create Recordings database
        console.log("Creating Recordings database...");
        await createDatabaseIfNotExists("Recordings", {
            Title: {
                title: {}
            },
            Composer: {
                rich_text: {}
            },
            Performers: {
                rich_text: {}
            },
            Year: {
                number: {}
            },
            Duration: {
                rich_text: {}
            },
            Description: {
                rich_text: {}
            },
            AudioURL: {
                url: {}
            },
            AlbumCover: {
                files: {}
            },
            SpotifyURL: {
                url: {}
            },
            AppleMusicURL: {
                url: {}
            },
            BandcampURL: {
                url: {}
            }
        });

        console.log("✅ All databases created successfully!");
        console.log("\nNext steps:");
        console.log("1. Go to your Notion page and add content to the databases");
        console.log("2. The website will automatically display your content");
        
    } catch (error) {
        console.error("❌ Error setting up databases:", error);
        process.exit(1);
    }
}

// Run the setup
setupComposerDatabases().then(() => {
    console.log("🎵 Composer website database setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});