import { Storage } from "@google-cloud/storage";
import { createHash } from "crypto";
import path from "path";
import { db } from "./db";
import { blogPosts, compositions, recordings } from "../shared/schema";
import { eq } from "drizzle-orm";

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID || "";

/**
 * Download an image from a URL and save it to object storage
 */
async function downloadImageToObjectStorage(imageUrl: string, itemId: string, itemType: string = "image"): Promise<string> {
    try {
        if (!bucketName) {
            console.error("No object storage bucket configured");
            return imageUrl;
        }

        // Get file extension from URL or default to jpg
        const urlPath = new URL(imageUrl).pathname;
        const extension = path.extname(urlPath) || ".jpg";
        
        // Generate filename using item ID and hash of URL for uniqueness
        const hash = createHash('md5').update(imageUrl).digest('hex').slice(0, 8);
        const filename = `${itemType}_${itemId.replace(/[^a-zA-Z0-9]/g, '_')}_${hash}${extension}`;
        const objectPath = `public/media-cache/${filename}`;
        
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(objectPath);
        
        // Check if file already exists in object storage
        const [exists] = await file.exists();
        if (exists) {
            console.log(`Image already cached in object storage: ${objectPath}`);
            return `/api/media-cache/${filename}`;
        }
        
        // Download the image
        console.log(`Downloading image to object storage: ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        
        // Upload to object storage
        const buffer = Buffer.from(await response.arrayBuffer());
        await file.save(buffer, {
            metadata: {
                contentType: response.headers.get('content-type') || 'image/jpeg',
                cacheControl: 'public, max-age=86400', // Cache for 24 hours
            },
        });
        
        // Make the file publicly accessible
        await file.makePublic();
        
        console.log(`Image uploaded to object storage: ${objectPath}`);
        return `/api/media-cache/${filename}`;
    } catch (error) {
        console.error(`Failed to download image from ${imageUrl}:`, error);
        // Return original URL as fallback
        return imageUrl;
    }
}

/**
 * Download recording cover images and track listing to object storage
 */
export async function downloadRecordingImages(): Promise<void> {
    console.log("Starting recording image download to object storage...");
    
    try {
        const allRecordings = await db.select().from(recordings);
        console.log(`Found ${allRecordings.length} recordings to process`);
        
        let totalImagesDownloaded = 0;
        
        for (const recording of allRecordings) {
            // Download album cover
            if (recording.album_cover && recording.album_cover.startsWith('http')) {
                const localPath = await downloadImageToObjectStorage(recording.album_cover, recording.id, 'recording');
                
                // Update the database with the local path
                if (localPath !== recording.album_cover) {
                    await db.update(recordings)
                        .set({ album_cover: localPath })
                        .where(eq(recordings.id, recording.id));
                    totalImagesDownloaded++;
                }
            }
            
            // Download track listing images
            if (recording.album_track_listing && Array.isArray(recording.album_track_listing)) {
                const updatedTrackListing: string[] = [];
                
                for (let i = 0; i < recording.album_track_listing.length; i++) {
                    const trackUrl = recording.album_track_listing[i];
                    if (trackUrl && trackUrl.startsWith('http')) {
                        const localPath = await downloadImageToObjectStorage(trackUrl, `${recording.id}_tracklist_${i}`, 'recording');
                        updatedTrackListing.push(localPath);
                        if (localPath !== trackUrl) {
                            totalImagesDownloaded++;
                        }
                    } else {
                        updatedTrackListing.push(trackUrl);
                    }
                }
                
                // Update the database with local paths if any were changed
                if (updatedTrackListing.some((url, i) => url !== recording.album_track_listing![i])) {
                    await db.update(recordings)
                        .set({ album_track_listing: updatedTrackListing })
                        .where(eq(recordings.id, recording.id));
                }
            }
        }
        
        console.log(`✅ Recording images download to object storage completed! Downloaded ${totalImagesDownloaded} images.`);
    } catch (error) {
        console.error("Error downloading recording images to object storage:", error);
        throw error;
    }
}

/**
 * Extract image URLs from text content
 */
function extractImageUrls(content: string): string[] {
    if (!content) return [];
    
    // Match various image URL patterns
    const imageUrlPatterns = [
        // Notion image URLs
        /https:\/\/[^"\s]*\.notion\.so[^"\s]*/g,
        // Other image URLs
        /https?:\/\/[^"\s]*\.(jpg|jpeg|png|gif|webp|svg)[^"\s]*/gi,
        // Notion file URLs
        /https:\/\/file\.notion\.so[^"\s]*/g
    ];
    
    const urls: string[] = [];
    
    for (const pattern of imageUrlPatterns) {
        const matches = content.match(pattern);
        if (matches) {
            urls.push(...matches);
        }
    }
    
    return Array.from(new Set(urls)); // Remove duplicates
}

/**
 * Download all images from blog posts and compositions to object storage
 */
export async function downloadAllImagesToObjectStorage(): Promise<void> {
    console.log("Starting image download process to object storage...");
    
    try {
        // Download recording images first
        await downloadRecordingImages();
        
        // Get all blog posts
        const allBlogPosts = await db.select().from(blogPosts);
        console.log(`Found ${allBlogPosts.length} blog posts to check for images`);
        
        // Get all compositions  
        const allCompositions = await db.select().from(compositions);
        console.log(`Found ${allCompositions.length} compositions to check for images`);
        
        let totalImagesDownloaded = 0;
        
        // Process blog posts
        for (const post of allBlogPosts) {
            if (post.content) {
                const imageUrls = extractImageUrls(post.content);
                console.log(`Found ${imageUrls.length} images in blog post: ${post.title}`);
                
                for (const imageUrl of imageUrls) {
                    try {
                        await downloadImageToObjectStorage(imageUrl, post.id, 'blog');
                        totalImagesDownloaded++;
                    } catch (error) {
                        console.error(`Failed to download image ${imageUrl}:`, error);
                    }
                }
            }
        }
        
        // Process compositions (they might have images in recording field or other text fields)
        for (const composition of allCompositions) {
            const textFields = [composition.recording, composition.premiere_info].filter(Boolean);
            
            for (const textField of textFields) {
                if (textField) {
                    const imageUrls = extractImageUrls(textField);
                    console.log(`Found ${imageUrls.length} images in composition: ${composition.title}`);
                    
                    for (const imageUrl of imageUrls) {
                        try {
                            await downloadImageToObjectStorage(imageUrl, composition.id, 'comp');
                            totalImagesDownloaded++;
                        } catch (error) {
                            console.error(`Failed to download image ${imageUrl}:`, error);
                        }
                    }
                }
            }
        }
        
        console.log(`✅ All image downloads to object storage completed! Downloaded ${totalImagesDownloaded} images total.`);
        
    } catch (error) {
        console.error("Error during image download process to object storage:", error);
        throw error;
    }
}