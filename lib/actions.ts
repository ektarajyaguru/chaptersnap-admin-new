"use server"

import { createClient } from "./supabase/server"
import { revalidatePath } from "next/cache"
// sharp is conditionally imported later to avoid issues in environments that don't support native modules

interface ImageMetadata {
  id: string
  path: string
  title: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  url: string // Public URL derived from path
}

// Utility function to convert Supabase storage path to public URL
function getSupabaseStorageUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'gallery'
  // Remove the bucket name if it's included in the path
  const cleanPath = storagePath.replace(new RegExp(`^${bucketName}\\/`, ''), '')
  return `${supabaseUrl}/storage/v1/object/public/${bucketName}/${cleanPath}`
}

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get("file") as File
  const title = (formData.get("title") as string) || null // Get title from form data
  const tags = formData.get("tags") ? JSON.parse(formData.get("tags") as string) : null // Get tags from form data

  if (!file) {
    return { error: "No file provided." }
  }

  // Check file size before attempting upload
  const maxSize = 1 * 1024 * 1024 // 1MB in bytes
  if (file.size > maxSize) {
    return { error: "Image file is too large. Maximum size is 1MB. Please upload a smaller file." }
  }

  let processedFile: File
  let fileName: string
  let filePath: string
  let processedBuffer: Buffer

  const originalFileName = file.name
  const fileExt = originalFileName.split(".").pop()?.toLowerCase()
  const fileNameWithoutExt = originalFileName.substring(0, originalFileName.lastIndexOf("."))
  
  // Create a safe filename in kebab-case
  const safeFileName = fileNameWithoutExt
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
  
  // Determine if running in a production-like environment
  // VERCEL_ENV is 'production' on Vercel production deployments
  // NODE_ENV is 'production' in a built Next.js app, 'development' in dev server
  const isProductionEnv = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';

  try {
    if (isProductionEnv) {
      // Production environment: Use sharp for processing
      console.log("Processing image with 'sharp' for production environment...");
      const sharp = (await import("sharp")).default; // Dynamic import of sharp

      // Convert array buffer to buffer
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      const shouldConvertToWebP = fileExt !== "webp"
      const finalFileExt = shouldConvertToWebP ? "webp" : fileExt
      fileName = `${safeFileName}.${finalFileExt}`
      filePath = `book-images/${fileName}`
      
      // Check if file already exists and add timestamp if needed
      const { data: existingFiles } = await supabase.storage
        .from("gallery")
        .list("book-images", {
          search: fileName
        })
      
      if (existingFiles && existingFiles.length > 0) {
        // File exists, add timestamp to make it unique
        const timestamp = Date.now()
        fileName = `${safeFileName}-${timestamp}.${finalFileExt}`
        filePath = `book-images/${fileName}`
      }

      let sharpInstance = sharp(buffer)
      
      // Get image metadata to check dimensions
      const metadata = await sharpInstance.metadata()
      const maxWidth = 1920 // Maximum width
      const maxHeight = 1080 // Maximum height
      
      // Resize if image is too large
      if (metadata.width && metadata.height && (metadata.width > maxWidth || metadata.height > maxHeight)) {
        sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
          fit: 'inside', // Maintain aspect ratio
          withoutEnlargement: true // Don't enlarge small images
        })
        console.log(`Resized image from ${metadata.width}x${metadata.height} to fit within ${maxWidth}x${maxHeight}`)
      }
      
      if (shouldConvertToWebP) {
        processedBuffer = await sharpInstance
          .webp({ 
            quality: 80, // Good balance between quality and size
            effort: 6,   // Higher effort = better compression but slower
            nearLossless: false
          })
          .toBuffer()
        
        // Create new File object with WebP data
        processedFile = new File([processedBuffer], fileName, {
          type: "image/webp",
          lastModified: Date.now()
        })
        
        console.log(`Converted ${file.name} to WebP format`)
      } else {
        // Already WebP, just resize if needed
        processedBuffer = await sharpInstance.toBuffer()
        
        // Create new File object with processed data
        processedFile = new File([processedBuffer], fileName, {
          type: file.type, // Keep original type if not converting to webp
          lastModified: Date.now()
        })
      }
    } else {
      // Development/Preview environment: Bypass sharp processing
      console.warn("Skipping image processing with 'sharp' in development/preview environment.");
      processedFile = file; // Use the original file directly

      // Ensure unique filename for non-processed files too
      fileName = `${safeFileName}.${fileExt}`;
      filePath = `book-images/${fileName}`;

      const { data: existingFiles } = await supabase.storage
        .from("gallery")
        .list("book-images", { search: fileName });
      
      if (existingFiles && existingFiles.length > 0) {
        const timestamp = Date.now();
        fileName = `${safeFileName}-${timestamp}.${fileExt}`;
        filePath = `book-images/${fileName}`;
      }
    }

    console.log("Uploading image to storage...")
    // 1. Upload image to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from("gallery")
      .upload(filePath, processedFile, {
        cacheControl: "3600",
        upsert: false,
      })
    console.log("Image uploaded to storage:", storageData)
    console.log("Storage error:", storageError)

    if (storageError) {
      console.error("Error uploading image to storage:", storageError)
      // Check for specific error related to file size limit
      if (storageError.message.includes("Payload Too Large") || storageError.message.includes("Body exceeded")) {
        return { error: "Image file is too large. Maximum size is 1MB. Please upload a smaller file." } // Friendly message
      }
      return { error: storageError.message }
    }

    // 2. Insert image metadata into gallery_images table
    const { data: dbData, error: dbError } = await supabase
      .from("gallery_images")
      .insert({
        path: filePath,
        title: title || file.name, // Use original filename as default title
        tags: tags,
      })
      .select()
      .single()

    if (dbError) {
      console.error("Error inserting image metadata into DB:", dbError)
      // If DB insert fails, attempt to delete the uploaded file
      await supabase.storage.from("gallery").remove([filePath])
      return { error: dbError.message || "Failed to save image metadata. File upload rolled back." }
    }

    // Return Supabase storage URL
    const storageUrl = getSupabaseStorageUrl(filePath)

    revalidatePath("/admin/dashboard/articles/new")
    revalidatePath("/admin/dashboard/articles/[id]/edit")
    revalidatePath("/admin/dashboard/gallery")
    return { url: storageUrl, path: filePath, id: dbData.id }
  } catch (error: any) {
    console.error("Caught error in uploadImage Server Action:", error)
    // This catch block will handle errors thrown *before* the supabase.storage.upload call
    // or other unexpected runtime errors within the action, including the body size limit.
    if (error.statusCode === 413 || (error.message && error.message.includes("Body exceeded 1 MB limit"))) {
      return { error: "Image file is too large. Maximum size is 1MB. Please upload a smaller file." }
    }
    return { error: error.message || "An unexpected error occurred during upload." }
  }
}

interface GetImagesOptions {
  limit?: number
  offset?: number
}

export async function getImages({ limit = 20, offset = 0 }: GetImagesOptions = {}) {
  "use server"
  const supabase = await createClient()

  // Fetch image metadata from gallery_images table
  const { data, error, count } = await supabase
    .from("gallery_images")
    .select("*", { count: "exact" }) // Select all columns and get exact count
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1) // Apply pagination

  if (error) {
    console.error("Error listing images from DB:", error)
    return { error: error.message, images: [], count: 0 }
  }

  // Construct CDN URLs for each image
  const imagesWithUrls: ImageMetadata[] = data.map((item) => {
    return {
      ...item,
      url: getSupabaseStorageUrl(item.path),
    }
  })

  return { images: imagesWithUrls, error: null, count: count || 0 }
}

interface SearchImagesOptions {
  query: string
  limit?: number
  offset?: number
}

export async function searchImages({ query, limit = 20, offset = 0 }: SearchImagesOptions) {
  "use server"
  const supabase = await createClient()

  // Search in title and tags with proper JSON syntax
  const { data, error, count } = await supabase
    .from("gallery_images")
    .select("*", { count: "exact" })
    .or(`title.ilike.%${query}%,tags.cs.${JSON.stringify([query])}`)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error searching images from DB:", error)
    return { error: error.message, images: [], count: 0 }
  }

  // Construct CDN URLs for each image
  const imagesWithUrls: ImageMetadata[] = data.map((item) => {
    return {
      ...item,
      url: getSupabaseStorageUrl(item.path),
    }
  })

  return { images: imagesWithUrls, error: null, count: count || 0 }
}

export async function deleteImage(id: string) {
  "use server"
  const supabase = await createClient()

  // 1. Get the path from the database record
  const { data: imageData, error: fetchError } = await supabase
    .from("gallery_images")
    .select("path")
    .eq("id", id)
    .single()

  if (fetchError || !imageData) {
    console.error("Error fetching image path for deletion:", fetchError)
    return { error: fetchError?.message || "Image not found for deletion." }
  }

  const imagePath = imageData.path

  // 2. Delete the record from the gallery_images table
  const { error: dbError } = await supabase.from("gallery_images").delete().eq("id", id)

  if (dbError) {
    console.error("Error deleting image metadata from DB:", dbError)
    return { error: dbError.message }
  }

  // 3. Delete the actual file from storage
  const { error: storageError } = await supabase.storage.from("gallery").remove([imagePath])

  if (storageError) {
    console.error("Error deleting image from storage:", storageError)
    // Note: If storage deletion fails but DB deletion succeeded, the DB record is gone.
    // You might want to log this for manual cleanup or implement a retry mechanism.
    return { error: storageError.message }
  }

  revalidatePath("/admin/dashboard/articles/new")
  revalidatePath("/admin/dashboard/articles/[id]/edit")
  revalidatePath("/admin/dashboard/gallery")
  return { error: null }
}
