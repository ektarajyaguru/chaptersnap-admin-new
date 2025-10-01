// app/admin/book-detail/[id]/page.tsx
import { createClient } from "../../../../lib/supabase/server";
import BookDetailClient from "@/components/BookDetailClient/BookDetailClient";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createClient();

  // const { data: book, error } = await supabase
  //   .from("books")
  //   .select("*")
  //   .eq("id", id)
  //   .single();

  const { data: book, error } = await supabase
  .from("books")
  .select(`
    *,
    authors(name)
  `)
  .eq("id", id)
  .single();


  const { data: categories, error: catError } = await supabase
    .from("categories")
    .select("*");

  if (error || !book) {
    return (
      <div className="p-6 text-center text-red-500">
        Failed to load book details.
      </div>
    );
  }

  return <BookDetailClient book={book} categories={categories}/>;
}
