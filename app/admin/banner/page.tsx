import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function BannerPage() {
  const supabase = await createClient();
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "public";

  const { data: banners, error } = await supabase
    .from("banner")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    return <div>Error loading banners: {error.message}</div>;
  }

  const uploadBanner = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const file = formData.get("image") as File | null;
    const bookId = (formData.get("bookId") as string) || null;
    if (!file) return;
    const imagePath = `banners/${Date.now()}_${file.name}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(imagePath, file, { upsert: true });
    if (uploadError) {
      console.error("Upload failed:", uploadError);
      return;
    }

    const { error: insertError } = await supabase
      .from("banner")
      .insert({ imagePath, timestamp: new Date().toISOString(), bookId, status: "active" });
    if (insertError) {
      console.error("Insert failed:", insertError);
      return;
    }
    revalidatePath("/admin/banner");
  };

  const deleteBanner = async (id: string, imagePath: string) => {
    "use server";
    const supabase = await createClient();
    const { error: deleteError } = await supabase.from("banner").delete().eq("id", id);
    if (deleteError) {
      console.error("Delete failed:", deleteError);
      return;
    }
    await supabase.storage.from(bucket).remove([imagePath]);
    revalidatePath("/admin/banner");
  };

  const publicUrlFor = (path: string) => {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  return (
    <div className="container mt-4">
      <h2>Banner Image</h2>
      <form action={uploadBanner} className="row g-3 mb-4">
        <div className="col-md-6">
          <input type="file" name="image" className="form-control" accept="image/*" />
        </div>
        <div className="col-md-4">
          <input name="bookId" className="form-control" placeholder="Book ID (optional)" />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">Upload</button>
        </div>
      </form>

      <div className="row g-3">
        {(banners || []).map((b: any) => (
          <div className="col-md-3" key={b.id}>
            <div className="card">
              <img className="card-img-top" src={publicUrlFor(b.imagePath)} alt="banner" />
              <div className="card-body d-flex justify-content-between">
                <small className="text-muted">{b.status}</small>
                <form action={deleteBanner.bind(null, b.id, b.imagePath)}>
                  <button className="btn btn-sm btn-danger" type="submit">Delete</button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


