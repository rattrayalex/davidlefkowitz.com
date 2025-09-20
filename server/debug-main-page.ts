import { notion } from "./notion";

const NOTION_PAGE_ID = process.env.NOTION_PAGE_ID!;

async function main() {
    try {
        console.log("Fetching main Notion page info...");
        console.log("NOTION_PAGE_ID:", NOTION_PAGE_ID);
        
        // Get the main page info
        const pageInfo = await notion.pages.retrieve({
            page_id: NOTION_PAGE_ID,
        });
        
        console.log("Main page properties:");
        console.log(JSON.stringify(pageInfo.properties, null, 2));
        
        // Try to get the content blocks from the main page
        console.log("\nFetching content blocks from main page...");
        const blocks = await notion.blocks.children.list({
            block_id: NOTION_PAGE_ID,
            page_size: 100,
        });
        
        console.log(`\nFound ${blocks.results.length} blocks:`);
        blocks.results.forEach((block: any) => {
            console.log(`  - ${block.type}: ${block.id}`);
            if (block.type === "child_page") {
                console.log(`    Title: ${JSON.stringify(block.child_page)}`);
            } else if (block.type === "child_database") {
                console.log(`    Title: ${JSON.stringify(block.child_database)}`);
            } else if (block.type === "paragraph" && block.paragraph?.rich_text) {
                const text = block.paragraph.rich_text.map((t: any) => t.plain_text).join("");
                if (text) console.log(`    Text: ${text.substring(0, 100)}...`);
            }
        });
        
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

main();