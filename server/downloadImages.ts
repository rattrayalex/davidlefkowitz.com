import { promises as fsPromises } from "fs";
import { createHash } from "crypto";
import path from "path";
import { db } from "./db";
import { blogPosts, compositions } from "../shared/schema";

/**
 * Download an image from a URL and cache it locally
 */
async function downloadImage(imageUrl: string, itemId: string): Promise<string> {
    try {
        // Create media-cache directory if it doesn't exist
        await fsPromises.mkdir("server/media-cache", { recursive: true });
        
        // Get file extension from URL or default to jpg
        const urlPath = new URL(imageUrl).pathname;
        const extension = path.extname(urlPath) || ".jpg";
        
        // Generate filename using item ID and hash of URL for uniqueness
        const hash = createHash('md5').update(imageUrl).digest('hex').slice(0, 8);
        const filename = `${itemId.replace(/[^a-zA-Z0-9]/g, '_')}_${hash}${extension}`;
        const filePath = path.join("server/media-cache", filename);
        
        // Check if file already exists
        try {
            await fsPromises.access(filePath);
            console.log(`Image already cached: ${filename}`);
            return `/api/media-cache/${filename}`;
        } catch {
            // File doesn't exist, download it
        }
        
        // Download the image
        console.log(`Downloading image: ${imageUrl}`);
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }
        
        // Save the image to local file
        const buffer = Buffer.from(await response.arrayBuffer());
        await fsPromises.writeFile(filePath, buffer);
        
        console.log(`Image downloaded and cached: ${filename}`);
        return `/api/media-cache/${filename}`;
    } catch (error) {
        console.error(`Failed to download image from ${imageUrl}:`, error);
        // Return original URL as fallback
        return imageUrl;
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
 * Download all images from blog posts and compositions
 */
export async function downloadAllImages(): Promise<void> {
    console.log("Starting image download process...");
    
    try {
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
                        await downloadImage(imageUrl, `blog_${post.id}`);
                        totalImagesDownloaded++;
                    } catch (error) {
                        console.error(`Failed to download image ${imageUrl}:`, error);
                    }
                }
            }
        }
        
        // Process compositions (they might have images in recording field or other text fields)
        for (const composition of allCompositions) {
            // Handle recording field (it's an array of strings) and premiere_info (string)
            const textFields: string[] = [];
            
            // Add recording field - it's an array of strings so we need to handle it differently
            if (composition.recording && Array.isArray(composition.recording)) {
                textFields.push(...composition.recording);
            }
            
            // Add premiere_info field - it's a simple string
            if (composition.premiere_info) {
                textFields.push(composition.premiere_info);
            }
            
            for (const textField of textFields) {
                if (textField && typeof textField === 'string') {
                    const imageUrls = extractImageUrls(textField);
                    if (imageUrls.length > 0) {
                        console.log(`Found ${imageUrls.length} images in composition: ${composition.title}`);
                    }
                    
                    for (const imageUrl of imageUrls) {
                        try {
                            await downloadImage(imageUrl, `comp_${composition.id}`);
                            totalImagesDownloaded++;
                        } catch (error) {
                            console.error(`Failed to download image ${imageUrl}:`, error);
                        }
                    }
                }
            }
        }
        
        console.log(`✅ Image download completed! Downloaded ${totalImagesDownloaded} images total.`);
        
    } catch (error) {
        console.error("Error during image download process:", error);
        throw error;
    }
}