"use client";

import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Snackbar,
  Alert,
  InputLabel,
  Select,
  MenuItem,
  FormControl as MuiFormControl,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NotificationForm = () => {
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationText, setNotificationText] = useState("");
  const [notificationImage, setNotificationImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [books, setBooks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const loadBooks = async () => {
      try {
        const { data, error } = await supabase
          .from("book")
          .select("id, bookName")
          .order("timestamp", { ascending: false });
        if (error) throw error;
        setBooks(data || []);
      } catch (e) {
        console.error("Failed to load books:", e);
      }
    };
    loadBooks();
  }, []);

  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImageFile(event.target.files[0]);
      setNotificationImage(URL.createObjectURL(event.target.files[0]));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!notificationTitle) {
      newErrors.title = "Notification title is required";
    }
    if (!notificationText) {
      newErrors.text = "Notification text is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSnackbar((s) => ({ ...s, open: false }));

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const payload = {
        title: notificationTitle,
        body: notificationText,
        imageUrl: notificationImage || null,
        link: null,
        bookId: selectedBook === "" ? null : selectedBook,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notifications")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      setSnackbar({
        open: true,
        message: "Notification saved successfully.",
        severity: "success",
      });

      setNotificationTitle("");
      setNotificationText("");
      setNotificationImage("");
      setImageFile(null);
      setSelectedBook("");

      // Optionally refresh any listing page
      try {
        router.refresh();
      } catch {}
    } catch (err) {
      const message = err?.message || "An unexpected error occurred.";
      setSnackbar({ open: true, message, severity: "error" });
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Card sx={{ width: "60%" }}>
      <CardContent>
        <Typography variant="h6">Compose Notification</Typography>
        <form onSubmit={handleSubmit}>
          <MuiFormControl fullWidth style={{ marginBottom: "10px" }}>
            <InputLabel sx={{ mt: 2 }} id="book-select-label">
              Select a Book
            </InputLabel>
            <Select
              sx={{ mt: 2 }}
              labelId="book-select-label"
              id="book-select"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
            >
              {books.map((book) => (
                <MenuItem key={book.id} value={book.id}>
                  {book.bookName}
                </MenuItem>
              ))}
            </Select>
          </MuiFormControl>
          <TextField
            label="Notification Title"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            label="Notification Text"
            value={notificationText}
            onChange={(e) => setNotificationText(e.target.value)}
            fullWidth
            margin="normal"
            error={!!errors.text}
            helperText={errors.text}
          />
          <Typography variant="body2" style={{ marginTop: 16 }}>
            Notification image (optional)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <TextField
              placeholder="Example: https://yourapp.com/image.png"
              value={imageFile ? "" : notificationImage}
              onChange={(e) => {
                setNotificationImage(e.target.value);
                setImageFile(null);
              }}
              fullWidth
              variant="outlined"
              size="small"
              sx={{ mr: 1 }}
            />
            {/* <Button
              component="label"
              variant="outlined"
              sx={{ minWidth: "auto", p: "8px" }}
            >
              <FileUploadIcon />
              <input
                type="file"
                hidden
                onChange={handleImageChange}
                accept="image/*"
              />
            </Button> */}
          </Box>
          {imageFile && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">Selected image:</Typography>
              <Box
                component="img"
                src={notificationImage}
                alt="Preview"
                sx={{
                  maxWidth: "100%",
                  maxHeight: "200px",
                  mt: 1,
                  borderRadius: 1,
                }}
              />
            </Box>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </form>
      </CardContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default NotificationForm;
