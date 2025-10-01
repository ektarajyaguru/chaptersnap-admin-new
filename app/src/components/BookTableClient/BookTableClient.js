"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function BookTableClient({ books }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const router = useRouter();

  const totalPages = Math.ceil(books.length / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedBooks = books.slice(start, start + rowsPerPage);

  const handleDelete = async (id) => {
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  };

  const handleView = (id) => {
    router.push(`/admin/book-detail/${id}`);
  };

  const formatReaders = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : n);

  const formatDate = (dateStr) => {
    // consistent formatting to avoid hydration mismatch
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(new Date(dateStr));
  };

  return (
    <div>
      <table className="table-auto w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border px-3 py-2">Title</th>
            <th className="border px-3 py-2">Readers</th>
            <th className="border px-3 py-2">Author</th>
            <th className="border px-3 py-2">Created At</th>
            <th className="border px-3 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedBooks.map((book) => (
            <tr key={book.id}>
              <td className="border px-3 py-2">{book.title}</td>
              <td className="border px-3 py-2">{formatReaders(book.total_readers)}</td>
              <td className="border px-3 py-2">{book.authors?.name ?? "Unknown"}</td>
              <td className="border px-3 py-2">{formatDate(book.created_at)}</td>
              <td className="border px-3 py-2 space-x-2">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => handleView(book.id)}
                >
                  View
                </button>
                <button
                  className="text-red-500 hover:underline"
                  onClick={() => handleDelete(book.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-3 flex justify-between items-center">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
