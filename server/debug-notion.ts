import { getNotionPages } from "./notion";

async function main() {
    try {
        console.log("Fetching Notion pages...");
        const pages = await getNotionPages();
        console.log(`Found ${pages.length} pages:`);
        pages.forEach(page => {
            console.log(`  - ${page.title} (${page.id})`);
        });
        process.exit(0);
    } catch (error) {
        console.error("Error fetching Notion pages:", error);
        process.exit(1);
    }
}

main();