import { createClient } from "../../../lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function BookList() {
  const supabase = await createClient();

  const { data: books, error } = await supabase
    .from("book")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    return <div>Error loading books: {error.message}</div>;
  }

  const handleDelete = async (id: string) => {
    "use server";
    const supabase = await createClient();
    const { error: summariesError } = await supabase
      .from("summary")
      .delete()
      .eq("book_id", id);
    if (summariesError) {
      console.error("Error deleting summaries:", summariesError);
      return;
    }
    const { error: bookError } = await supabase
      .from("book")
      .delete()
      .eq("id", id);
    if (bookError) {
      console.error("Error deleting book:", bookError);
    } else {
      revalidatePath("/admin/table-list");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const options = { day: "numeric", month: "short", year: "2-digit" } as const;
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleDateString(undefined, options);
    return formattedDate;
  };

  return (
    <div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>
                <b>Title</b>
              </th>
              <th>
                <b>View Count</b>
              </th>
              <th>
                <b>Author</b>
              </th>
              <th>
                <b>Date of Created</b>
              </th>
              <th>
                <b>Action</b>
              </th>
            </tr>
          </thead>
          <tbody>
            {(books || []).map((book: any) => (
              <tr key={book.id}>
                <td>{book.bookName}</td>
                <td>{book.count}</td>
                <td>{book.author}</td>
                <td>{formatTimestamp(book.timestamp)}</td>
                <td>
                  <Link href={`/admin/book-detail/${book.id}`} className="btn btn-link">
                    <i className="fas fa-eye"></i>
                  </Link>
                  <form action={handleDelete.bind(null, book.id)} style={{ display: "inline" }}>
                    <button type="submit" className="btn btn-link">
                      <i className="fas fa-trash"></i>
                    </button>
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
