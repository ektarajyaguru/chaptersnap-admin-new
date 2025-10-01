import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Button,
  CircularProgress,
  Container,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { uploadBanner, fetchBannersWithUrls } from "redux/BannerSlice";
import BannerImage from "components/BannerImage";
import { fetchBooks } from "redux/BookListSlice";
import { toggleBannerStatus } from "redux/BannerSlice";
import { deleteBanner } from "redux/BannerSlice";

const UploadBannerForm = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBook, setSelectedBook] = useState("");
  const [isLoading, setIsLoading] = useState(null);
  const dispatch = useDispatch();
  const banners = useSelector((state) => state.banner.bannersWithUrls);
  const books = useSelector((state) => state.book.books);

  // useEffect(() => {
  //   if (banners.length === 0) {
  //     dispatch(fetchBannersWithUrls());
  //     dispatch(fetchBooks());
  //   }
  // }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (selectedFile && selectedBook) {
      setIsLoading(true);
      try {
        await dispatch(uploadBanner(selectedFile, selectedBook));
        setSelectedFile(null);
        setSelectedBook("");
        await dispatch(fetchBannersWithUrls());
        setIsLoading(false);
      } catch (error) {
        console.error("Error uploading banner:", error.message);
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (bannerId, imagePath) => {
    await dispatch(deleteBanner(bannerId, imagePath));
    await dispatch(fetchBannersWithUrls());
  };

  const handleStatusChange = async (bannerId, status) => {
    await dispatch(toggleBannerStatus(bannerId, status));
    await dispatch(fetchBannersWithUrls());
  };

  return (
    <>
      <Container maxWidth="md" style={{ marginTop: "40px" }}>
        <Paper elevation={3} style={{ padding: "20px" }}>
          <Typography variant="h5" gutterBottom>
            Upload Banner
          </Typography>
          <FormControl fullWidth style={{ marginBottom: "10px" }}>
            <InputLabel id="book-select-label">Select a Book</InputLabel>
            <Select
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
          </FormControl>

          <input
            accept="image/*"
            style={{ display: "none" }}
            id="contained-button-file"
            type="file"
            onChange={handleFileChange}
            required
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" component="span" disabled={isLoading}>
              Choose File
            </Button>
          </label>
          <Typography variant="body1" style={{ marginTop: "10px" }}>
            {selectedFile
              ? `Selected File: ${selectedFile.name}`
              : "No file selected"}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: "20px" }}
            onClick={handleUpload}
            disabled={isLoading || !selectedFile || !selectedBook}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload"
            )}
          </Button>
        </Paper>
      </Container>
      <div style={{ marginTop: "20px" }}>
        <BannerImage
          banners={banners}
          isLoading={isLoading}
          onDelete={handleDelete}
          onToggle={handleStatusChange}
        />
      </div>
    </>
  );
};

export default UploadBannerForm;
