/**
 * Supabase Storage Service
 * Handles file uploads to Supabase Storage
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import * as path from "path";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("[Supabase Storage] Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set");
}

// Use service role key for server-side operations (bypasses RLS)
// This is safe because we enforce access control in our application code
const supabaseStorage: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DOCUMENTS_BUCKET = "documents";

export class SupabaseStorageService {
  /**
   * Ensure the documents bucket exists
   */
  static async ensureBucket(): Promise<void> {
    try {
      // Check if bucket exists
      const { data: buckets, error: listError } = await supabaseStorage.storage.listBuckets();
      
      if (listError) {
        console.error("[Supabase Storage] Error listing buckets:", listError);
        return;
      }

      const bucketExists = buckets?.some((b) => b.name === DOCUMENTS_BUCKET);
      
      if (!bucketExists) {
        // Create bucket (private by default for security)
        const { data, error } = await supabaseStorage.storage.createBucket(DOCUMENTS_BUCKET, {
          public: false, // Private bucket - files require authentication
          fileSizeLimit: 52428800, // 50MB
          allowedMimeTypes: [
            'application/pdf',
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
            'application/zip',
            'application/x-zip-compressed',
          ],
        });

        if (error) {
          console.error("[Supabase Storage] Error creating bucket:", error);
          throw new Error(`Failed to create storage bucket: ${error.message}`);
        }

        console.log(`[Supabase Storage] Created bucket: ${DOCUMENTS_BUCKET}`);
      } else {
        console.log(`[Supabase Storage] Bucket ${DOCUMENTS_BUCKET} already exists`);
      }
    } catch (error: any) {
      console.error("[Supabase Storage] Error ensuring bucket:", error);
      throw error;
    }
  }

  /**
   * Upload a file to Supabase Storage
   * @param file - File buffer or stream
   * @param userId - User ID for organizing files
   * @param fileName - Original file name
   * @param mimeType - File MIME type
   * @returns Public URL of the uploaded file
   */
  static async uploadFile(
    file: Buffer | Uint8Array,
    userId: string,
    fileName: string,
    mimeType: string
  ): Promise<string> {
    try {
      // Ensure bucket exists
      await this.ensureBucket();

      // Generate unique file path: userId/filename
      // Using userId ensures files are organized by user
      const fileExt = path.extname(fileName);
      const uniqueFileName = `${randomUUID()}${fileExt}`;
      const filePath = `${userId}/${uniqueFileName}`;
      
      console.log(`[Supabase Storage] Uploading file: ${filePath} for user: ${userId}`);

      // Upload file to Supabase Storage
      const { data, error } = await supabaseStorage.storage
        .from(DOCUMENTS_BUCKET)
        .upload(filePath, file, {
          contentType: mimeType,
          upsert: false, // Don't overwrite existing files
        });

      if (error) {
        console.error("[Supabase Storage] Upload error:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }

      // Return file path in format: "documents/userId/filename.ext"
      // We'll create signed URLs when serving files
      const fileUrl = `${DOCUMENTS_BUCKET}/${filePath}`;
      
      console.log(`[Supabase Storage] File uploaded: ${filePath} (${file.length} bytes)`);
      
      return fileUrl;
    } catch (error: any) {
      console.error("[Supabase Storage] uploadFile error:", error);
      throw error;
    }
  }

  /**
   * Create a signed URL for private file access
   * @param filePath - Path to the file in storage (e.g., "userId/filename.pdf")
   * @param expiresIn - Expiration time in seconds (default: 1 hour)
   * @returns Signed URL that can be used to access the file
   */
  static async createSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    try {
      // Extract the path after "documents/" if needed
      const pathInBucket = filePath.startsWith('documents/') 
        ? filePath.replace('documents/', '')
        : filePath;
      
      const { data, error } = await supabaseStorage.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUrl(pathInBucket, expiresIn);

      if (error) {
        console.error("[Supabase Storage] Error creating signed URL:", error);
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error: any) {
      console.error("[Supabase Storage] createSignedUrl error:", error);
      throw error;
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param filePath - Path to the file in storage (e.g., "documents/userId/filename.pdf")
   */
  static async deleteFile(filePath: string): Promise<void> {
    try {
      // Extract the path after "documents/" if needed
      const pathInBucket = filePath.startsWith('documents/') 
        ? filePath.replace('documents/', '')
        : filePath;
      
      const { error } = await supabaseStorage.storage
        .from(DOCUMENTS_BUCKET)
        .remove([pathInBucket]);

      if (error) {
        console.error("[Supabase Storage] Error deleting file:", error);
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      console.log(`[Supabase Storage] File deleted: ${filePath}`);
    } catch (error: any) {
      console.error("[Supabase Storage] deleteFile error:", error);
      throw error;
    }
  }

  /**
   * Get file path from URL
   * @param url - Full Supabase Storage URL
   * @returns File path (e.g., "userId/filename.pdf")
   */
  static getFilePathFromUrl(url: string): string {
    // Extract path from URL like: https://xxx.supabase.co/storage/v1/object/documents/userId/filename.pdf
    const match = url.match(/\/storage\/v1\/object\/documents\/(.+)$/);
    return match ? match[1] : url;
  }
}

// Initialize bucket on module load
SupabaseStorageService.ensureBucket().catch((error) => {
  console.error("[Supabase Storage] Failed to initialize bucket:", error);
});

