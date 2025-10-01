import { createClient } from "../../../lib/supabase/server";
import { BookTableClient } from "@/components/BookTableClient/BookTableClient";

export default async function BookListPage() {
  const supabase = await createClient();

  const { data: books, error } = await supabase
    .from("books")
    .select(`
      id,
      title,
      total_readers,
      created_at,
      authors!books_author_id_fkey (
        name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return <div>Error loading books: {error.message}</div>;

  return (
    <div className="container mt-5">
      <h2 className="text-2xl font-bold mb-4">Books List</h2>
      <BookTableClient books={books || []} />
    </div>
  );
}
