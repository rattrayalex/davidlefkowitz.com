#!/usr/bin/env tsx

/**
 * Initial data population script to sync all Notion data to local database
 */

import { syncAllData } from "./sync";

async function main() {
    try {
        console.log("Starting initial data population...");
        await syncAllData();
        console.log("✅ Initial data population completed successfully");
    } catch (error) {
        console.error("❌ Error during data population:", error);
        process.exit(1);
    }
}

main();