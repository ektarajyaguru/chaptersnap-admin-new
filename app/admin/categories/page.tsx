import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function CategoriesPage() {
  const supabase = await createClient();

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return <div>Error loading categories: {error.message}</div>;
  }

  const addCategory = async (formData: FormData) => {
    "use server";
    const supabase = await createClient();
    const name = (formData.get("name") as string)?.trim();
    if (!name) return;
    const { error } = await supabase.from("categories").insert({ name, status: "Active" });
    if (error) {
      console.error("Add category failed:", error);
      return;
    }
    revalidatePath("/admin/categories");
  };

  const deleteCategory = async (id: string) => {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      console.error("Delete category failed:", error);
      return;
    }
    revalidatePath("/admin/categories");
  };

  const setStatus = async (id: string, status: string) => {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.from("categories").update({ status }).eq("id", id);
    if (error) {
      console.error("Update category status failed:", error);
      return;
    }
    revalidatePath("/admin/categories");
  };

  return (
    <div className="container mt-4">
      <h2>Categories</h2>
      <form action={addCategory} className="row g-3 mb-4">
        <div className="col-auto">
          <input name="name" placeholder="New category name" className="form-control" />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary">Add</button>
        </div>
      </form>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(categories || []).map((c: any) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.status}</td>
                <td>
                  <form action={setStatus.bind(null, c.id, c.status === "Active" ? "Inactive" : "Active")} style={{ display: "inline" }}>
                    <button className="btn btn-sm btn-secondary" type="submit">
                      {c.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </form>
                  <form action={deleteCategory.bind(null, c.id)} style={{ display: "inline", marginLeft: 8 }}>
                    <button className="btn btn-sm btn-danger" type="submit">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


