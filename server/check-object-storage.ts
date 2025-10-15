import { objectStorageClient } from "./objectStorage";

async function listObjectStorageFiles() {
    try {
        const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "replit-objstore-2036f845-9133-4980-ad50-29c551f1ef47";
        const bucket = objectStorageClient.bucket(bucketName);
        
        console.log(`Listing files in bucket: ${bucketName}/public/media-cache/`);
        
        const [files] = await bucket.getFiles({
            prefix: 'public/media-cache/',
            maxResults: 100
        });
        
        console.log(`Found ${files.length} files in object storage:`);
        files.forEach((file, index) => {
            console.log(`${index + 1}. ${file.name} (${(file.metadata.size / 1024).toFixed(2)} KB)`);
        });
        
        return files;
    } catch (error) {
        console.error("Error listing object storage files:", error);
        throw error;
    }
}

// Run the function
listObjectStorageFiles().then(() => process.exit(0)).catch(() => process.exit(1));