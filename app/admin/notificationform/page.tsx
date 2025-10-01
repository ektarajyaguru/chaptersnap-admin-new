import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function NotificationFormPage() {
  const supabase = await createClient();

  const sendNotification = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const title = (formData.get("title") as string) || "";
    const body = (formData.get("body") as string) || "";
    const imageUrl = (formData.get("imageUrl") as string) || null;
    const link = (formData.get("link") as string) || null;

    const { error } = await supabase.from("notifications").insert({
      title,
      body,
      imageUrl,
      link,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error("Insert notification failed:", error);
      return;
    }
    revalidatePath("/admin/notificationform");
  };

  return (
    <div className="container mt-4">
      <h2>Notification Form</h2>
      <form action={sendNotification} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Title</label>
          <input name="title" className="form-control" />
        </div>
        <div className="col-12">
          <label className="form-label">Body</label>
          <textarea name="body" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Image URL (optional)</label>
          <input name="imageUrl" className="form-control" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Link (optional)</label>
          <input name="link" className="form-control" />
        </div>
        <div className="col-12">
          <button type="submit" className="btn btn-primary">Send</button>
        </div>
      </form>
    </div>
  );
}


