import { objectStorageClient } from "./objectStorage";
import { promises as fsPromises } from "fs";
import path from "path";

// Use Replit's object storage bucket
const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";

async function migrateImagesToObjectStorage() {
    try {
        if (!bucketName) {
            console.error("No object storage bucket configured");
            return;
        }

        const localCacheDir = path.join(process.cwd(), 'server', 'media-cache');
        const bucket = objectStorageClient.bucket(bucketName);
        
        // Check if local media-cache directory exists
        try {
            await fsPromises.access(localCacheDir);
        } catch {
            console.log("No local media-cache directory found");
            return;
        }
        
        // Read all files in the local media-cache directory
        const files = await fsPromises.readdir(localCacheDir);
        console.log(`Found ${files.length} files to migrate`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const filename of files) {
            try {
                // Only process image files
                if (!/\.(jpg|jpeg|png|gif|webp)$/i.test(filename)) {
                    console.log(`Skipping non-image file: ${filename}`);
                    continue;
                }
                
                const localFilePath = path.join(localCacheDir, filename);
                const objectPath = `public/media-cache/${filename}`;
                
                const file = bucket.file(objectPath);
                
                // Check if file already exists in object storage
                const [exists] = await file.exists();
                if (exists) {
                    console.log(`File already exists in object storage, skipping: ${objectPath}`);
                    skippedCount++;
                    continue;
                }
                
                // Read the local file
                const fileContent = await fsPromises.readFile(localFilePath);
                
                // Determine content type based on extension
                let contentType = 'image/jpeg';
                if (filename.endsWith('.png')) contentType = 'image/png';
                else if (filename.endsWith('.gif')) contentType = 'image/gif';
                else if (filename.endsWith('.webp')) contentType = 'image/webp';
                
                // Upload to object storage
                await file.save(fileContent, {
                    metadata: {
                        contentType: contentType,
                        cacheControl: 'public, max-age=86400', // Cache for 24 hours
                    },
                });
                
                // Don't need to make public explicitly - Replit handles permissions
                
                console.log(`✅ Migrated: ${filename} -> ${objectPath}`);
                migratedCount++;
                
            } catch (error) {
                console.error(`Failed to migrate ${filename}:`, error);
            }
        }
        
        console.log(`\n✅ Migration complete!`);
        console.log(`   - Migrated: ${migratedCount} files`);
        console.log(`   - Skipped (already exists): ${skippedCount} files`);
        console.log(`   - Total processed: ${files.length} files`);
        
    } catch (error) {
        console.error("Error during migration:", error);
    }
}

// Run the migration
console.log("Starting migration of images to object storage...");
migrateImagesToObjectStorage()
    .then(() => {
        console.log("Migration script completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
    });