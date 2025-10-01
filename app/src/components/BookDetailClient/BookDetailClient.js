"use client";

import React, { useState, useRef } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { CircularProgress } from "@mui/material";
import Notification from "../Notification";
import dynamic from "next/dynamic";
import { uploadImage } from "../../../../lib/actions";
import { createClient } from "../../../../lib/supabase/client";

// Fix SSR issue for draft editor components
const EditSummary = dynamic(() => import("../EditSummary"), { ssr: false });
const AddSummary = dynamic(() => import("../AddSummary"), { ssr: false });

const BookDetailClient = ({ book, categories }) => {
  console.log("book==========", book)
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [bookData, setBookData] = useState(book);
  const [selectedCategories, setSelectedCategories] = useState([book.category_id]);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [key, setKey] = useState(0);
  const fileInputRef = useRef(null);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Invalid Date";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  const handleChange = (field, value) => {
    setBookData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(formData);
      if (result.url) {
        setBookData((prev) => ({ ...prev, image_url: result.url }));
        setNotification({ message: "Image uploaded successfully!", severity: "success" });
      } else {
        setNotification({ message: result.error || "Failed to upload image", severity: "error" });
      }
    } catch (err) {
      console.error(err);
      setNotification({ message: "Failed to upload image.", severity: "error" });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!bookData.title?.trim() || !bookData.summary?.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {

      const dataToUpdate = {
        title: bookData.title,
        slug: bookData.slug,
        description: bookData.description || null,
        summary: bookData.summary || null,
        published_date: bookData.published_date || null,
        image_url: bookData.image_url || null,
        author_id: bookData.author_id || null,
        category_id: selectedCategories[0] || null, // single category
        updated_at: new Date().toISOString(),
      };

      // Update book
      const { data, error: updateError } = await supabase
        .from("books")
        .update(dataToUpdate)
        .eq("id", bookData.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setNotification({ message: "Book updated successfully!", severity: "success" });
      setEditing(false);
      setKey((prev) => prev + 1);

      // Invalidate cache
      try {
        await fetch("/api/cache/invalidate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tag: `book:${bookData.slug}` }),
        });
        console.log(`Cache invalidated for book:${bookData.slug}`);
      } catch (e) {
        console.warn("Cache invalidation failed", e);
      }

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update book.");
      setNotification({ message: err.message || "Failed to update book.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    setEditing(false);
    setBookData(book);
    setSelectedCategories([book.category_id]);
    setError("");
  };

  const handleSummaryAdded = () => setKey((prev) => prev + 1);

  return (
    <Card key={key} sx={{ padding: 2 }}>
      <CardContent>
        {loading ? (
          <CircularProgress />
        ) : (
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {/* IMAGE LEFT */}
            {bookData.image_url && (
              <img
                src={bookData.image_url}
                alt={bookData.title}
                style={{
                  maxWidth: "300px",
                  maxHeight: "400px",
                  borderRadius: "8px",
                  objectFit: "cover",
                  flexShrink: 0,
                }}
              />
            )}

            {/* DATA RIGHT */}
            <div style={{ flex: 1, minWidth: "300px" }}>
              {editing ? (
                <>
                  <TextField
                    label="Title"
                    fullWidth
                    value={bookData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Author"
                    fullWidth
                    value={bookData.authors.name}
                    onChange={(e) => handleChange("author", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Book URL"
                    fullWidth
                    value={bookData.slug}
                    onChange={(e) => handleChange("slug", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Meta Title"
                    fullWidth
                    value={bookData.title || ""}
                    onChange={(e) => handleChange("metaTitle", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Meta Description"
                    fullWidth
                    value={bookData.description || ""}
                    onChange={(e) => handleChange("metaDescription", e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <Autocomplete
                    multiple
                    options={categories}
                    value={categories.filter((cat) => selectedCategories.includes(cat.id))}
                    onChange={(_, newValue) => setSelectedCategories(newValue.map((cat) => cat.id))}
                    getOptionLabel={(option) => option.name}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          checked={selected}
                          sx={{ mr: 1 }}
                        />
                        {option.name}
                      </li>
                    )}
                    renderInput={(params) => <TextField {...params} label="Categories" />}
                    sx={{ mb: 2 }}
                  />
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} />
                </>
              ) : (
                <div
                  style={{
                    border: "1px solid rgba(0,0,0,0.2)",
                    padding: "20px",
                    borderRadius: "20px",
                    wordWrap: "break-word",
                  }}
                >
                  <p><b>Title:</b> {bookData.title}</p>
                  <p><b>Author:</b> {bookData.authors.name || "Unknown"}</p>
                  <p><b>Book URL:</b> {bookData.slug}</p>
                  <p><b>Meta Title:</b> {bookData.metaTitle || `${bookData.title} - Full Chapter Summary`}</p>
                  <p><b>Meta Description:</b> {bookData.metaDescription || bookData.description}</p>
                  <p>
                    <b>Category:</b>{" "}
                    {categories.find((cat) => cat.id === bookData.category_id)?.name || ""}
                  </p>
                  <p><b>Published at:</b> {formatDate(bookData.published_date)}</p>
                  <p><b>Last update at:</b> {formatDate(bookData.updated_at)}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUMMARIES */}
        <div
          style={{
            border: "1px solid rgba(0,0,0,0.2)",
            padding: "20px",
            borderRadius: "20px",
            marginTop: "20px",
          }}
        >
          <EditSummary bookId={bookData.id} onSummaryAdded={handleSummaryAdded} />
          <AddSummary bookId={bookData.id} onSummaryAdded={handleSummaryAdded} />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* BUTTONS */}
        <div style={{ marginTop: "20px" }}>
          <Button variant="outlined" color="primary" onClick={editing ? handleSave : () => setEditing(true)} sx={{ mr: 2 }}>
            {editing ? "Save" : "Edit"}
          </Button>
          {editing && (
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>

        {notification && <Notification message={notification.message} severity={notification.severity} />}
      </CardContent>
    </Card>
  );
};

export default BookDetailClient;
