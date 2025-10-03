"use client"

import { useState } from "react";
import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/ui/dialog";
import { ImageGalleryContent } from "@/components/image-gallery-content";
import { ImageIcon } from "lucide-react";

export default function PublishBooksPage() {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const publish = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const bookName = (formData.get("bookName") as string) || "";
    const author = (formData.get("author") as string) || "";
    const url = (formData.get("url") as string) || "";
    const metaTitle = (formData.get("metaTitle") as string) || "";
    const metaDescription = (formData.get("metaDescription") as string) || "";
    const categoriesRaw = (formData.get("categories") as string) || "";
    const image = formData.get("image") as File | null;

    let imagePath: string | null = null;

    // If an image URL is selected from gallery, use that
    if (selectedImageUrl) {
      imagePath = selectedImageUrl;
    }
    // Otherwise, handle file upload
    else if (image) {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "gallery";
      imagePath = `book-images/${Date.now()}_${image.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(imagePath, image, { upsert: true });
      if (uploadError) {
        console.error("Image upload failed:", uploadError);
        return;
      }
    }

    const { error } = await supabase.from("book").insert({
      bookName,
      bookNameLowerCase: bookName.toLowerCase(),
      author,
      url,
      metaTitle,
      metaDescription,
      categories: categoriesRaw
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      image: imagePath,
      timestamp: new Date().toISOString(),
      count: 0,
    });
    if (error) {
      console.error("Insert book failed:", error);
      return;
    }

    revalidatePath("/admin/bookslist");
  };

  const handleImageSelect = (url: string) => {
    setSelectedImageUrl(url);
    setIsGalleryOpen(false);
  };

  return (
    <div className="container mt-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Publish Book</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={publish} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input name="bookName" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <input name="author" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">URL</label>
                <input name="url" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meta Title</label>
                <input name="metaTitle" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Meta Description</label>
              <textarea name="metaDescription" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Categories (comma-separated)</label>
              <input name="categories" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cover Image</label>

              {/* Selected Image Preview */}
              {selectedImageUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected from gallery:</p>
                  <div className="relative inline-block">
                    <img
                      src={selectedImageUrl}
                      alt="Selected cover"
                      className="w-32 h-40 object-cover border border-gray-300 rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedImageUrl("")}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {/* File Upload Option */}
                <div className="flex-1">
                  <input type="file" name="image" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" accept="image/*" />
                </div>

                {/* Gallery Selection */}
                <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Select from Gallery
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select Cover Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                      <ImageGalleryContent onSelect={handleImageSelect} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                You can either upload a new image file or select an existing image from your gallery.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Publish Book
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


