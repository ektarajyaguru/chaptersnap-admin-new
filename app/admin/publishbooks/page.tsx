import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function PublishBooksPage() {
  const supabase = await createClient();

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
    if (image) {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "public";
      imagePath = `images/${Date.now()}_${image.name}`;
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

  return (
    <div className="container mt-4">
      <h2>Publish Book</h2>
      <form action={publish} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Title</label>
          <input name="bookName" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Author</label>
          <input name="author" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">URL</label>
          <input name="url" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Meta Title</label>
          <input name="metaTitle" className="form-control" />
        </div>
        <div className="col-12">
          <label className="form-label">Meta Description</label>
          <textarea name="metaDescription" className="form-control" />
        </div>
        <div className="col-12">
          <label className="form-label">Categories (comma-separated)</label>
          <input name="categories" className="form-control" />
        </div>
        <div className="col-12">
          <label className="form-label">Cover Image</label>
          <input type="file" name="image" className="form-control" accept="image/*" />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Publish</button>
        </div>
      </form>
    </div>
  );
}


