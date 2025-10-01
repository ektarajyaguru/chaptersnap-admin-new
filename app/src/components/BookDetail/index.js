import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import { fetchSingleBook, updateSingleBook } from "redux/BookListSlice";
import { fetchCategories } from "redux/CategorySlice";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min";
import { useDispatch, useSelector } from "react-redux";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import { CircularProgress } from "@mui/material";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import Notification from "components/Notification";
import AddSummary from "components/AddSummary";
import EditSummary from "components/EditSummary";

function BookDetail() {
  const { state } = useLocation();
  const bookId = state?.bookId;
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [books, setBooks] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [key, setKey] = useState(0);

  const newCategories = useSelector((state) => state.category.activeCategories);
  const formattedSelectedCategories = selectedCategories.map((c) => ({ name: c }));

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  };

  useEffect(() => {
    if (!editing) {
      setLoading(true);
      setError("");
      fetchSingleBook(bookId)
        .then((bookData) => {
          bookData.forEach((b) => setSelectedCategories(b.categories));
          setBooks(bookData);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching book:", err.message);
          setLoading(false);
        });
    }
  }, [bookId, editing]);

  useEffect(() => {
    if (editing) {
      dispatch(fetchCategories());
    }
  }, [editing, dispatch]);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  const handleChange = (field, value) => {
    setBooks((prev) => prev.map((b) => ({ ...b, [field]: value })));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const timestamp = new Date().getTime();
    const storageRef = ref(storage, `images/${timestamp}_${file.name}`);

    try {
      await uploadBytes(storageRef, file);
      const updatedData = { image: `images/${timestamp}_${file.name}` };

      setBooks((prev) => {
        const updatedBooks = prev.map((b) => ({ ...b, ...updatedData }));
        updateSingleBook(bookId, updatedData);
        return updatedBooks;
      });
    } catch (err) {
      console.error("Error uploading image:", err.message);
    }
  };

  const prepareUpdatedData = () => {
    const book = books[0] || {};
    const updatedData = {
      lastUpdatedAt: new Date().toISOString(),
      categories: selectedCategories.length ? selectedCategories : book.categories,
    };
    ["bookName", "author", "url", "metaTitle", "metaDescription"].forEach((f) => {
      if (book[f]) updatedData[f] = book[f];
    });
    if (book.bookName) updatedData.bookNameLowerCase = book.bookName.toLowerCase();
    return updatedData;
  };

  const handleSave = async () => {
    setLoading(true);
    const book = books[0];
    if (!book) {
      setError("No book data found.");
      setLoading(false);
      return;
    }

    const requiredFields = ["bookName", "author", "url", "metaTitle", "metaDescription"];
    if (requiredFields.some((f) => !book[f]?.trim()) || !selectedCategories.length) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    const updatedData = prepareUpdatedData();
    setBooks((prev) => prev.map((b) => ({ ...b, ...updatedData })));
    await updateSingleBook(bookId, updatedData);

    setKey((k) => k + 1);
    setNotification({ message: "Book successfully updated!", severity: "success" });
    setEditing(false);
    setError("");
    setLoading(false);
  };

  const handleSummaryAdded = () => setKey((k) => k + 1);

  const truncateText = (text, limit) => (text.length > limit ? text.slice(0, limit) + "..." : text);

  return (
    <Card key={key}>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          books.map((book) => (
            <React.Fragment key={book.id}>
              <div style={{ display: "flex" }}>
                {editing && (
                  <div style={{ width: "70%" }}>
                    {["bookName", "author", "url", "metaTitle", "metaDescription"].map((field) => (
                      <TextField
                        key={field}
                        label={field === "bookName" ? "Title" : field.charAt(0).toUpperCase() + field.slice(1)}
                        variant="outlined"
                        fullWidth
                        value={book[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        style={{ marginBottom: 10 }}
                      />
                    ))}
                    <Autocomplete
                      multiple
                      id="categories-autocomplete"
                      options={newCategories}
                      disableCloseOnSelect
                      value={formattedSelectedCategories}
                      onChange={(_, newValue) =>
                        setSelectedCategories([...new Set(newValue.map((c) => c.name))])
                      }
                      getOptionLabel={(option) => option.name}
                      renderOption={(props, option) => {
                        const isSelected = formattedSelectedCategories.some((c) => c.name === option.name);
                        return (
                          <li {...props}>
                            <Checkbox
                              icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                              checkedIcon={<CheckBoxIcon fontSize="small" />}
                              style={{ marginRight: 8 }}
                              checked={isSelected}
                            />
                            {option.name}
                          </li>
                        );
                      }}
                      style={{ width: "100%", marginBottom: 10 }}
                      renderInput={(params) => <TextField {...params} label="Categories" />}
                    />
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ marginBottom: 10 }} />
                  </div>
                )}

                {book.image && !editing && (
                  <img
                    src={book.image}
                    alt="Book Cover"
                    style={{
                      maxWidth: 300,
                      maxHeight: 300,
                      borderRadius: "0px 50px 50px 0px",
                      boxShadow: "10px 5px 10px rgba(0, 0, 0, 0.2)",
                    }}
                  />
                )}

                {!editing && (
                  <div
                    style={{
                      marginLeft: 20,
                      marginRight: 20,
                      border: "1px solid rgba(0, 0, 0, 0.2)",
                      padding: 20,
                      borderRadius: 20,
                      wordWrap: "break-word",
                    }}
                  >
                    {[
                      { label: "Title", value: book.bookName },
                      { label: "Author", value: book.authorName },
                      { label: "Book URL", value: book.url },
                      { label: "Meta Title", value: bookData.title },
                      { label: "Meta Description", value: book.description },
                      { label: "Category", value: book.categories.join(", ") },
                      { label: "Published at", value: formatDate(book.timestamp) },
                      { label: "Last update at", value: formatDate(book.lastUpdatedAt) },
                    ].map((item) => (
                      <p key={item.label} style={{ fontFamily: item.label === "Title" ? "Lexend Deca" : undefined }}>
                        <b>{item.label}:</b> {truncateText(item.value, 50)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div
                style={{
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  padding: 20,
                  borderRadius: 20,
                  marginTop: 20,
                }}
              >
                <EditSummary bookId={bookId} onSummaryAdded={handleSummaryAdded} />
                <AddSummary bookId={bookId} onSummaryAdded={handleSummaryAdded} />
              </div>
            </React.Fragment>
          ))
        )}

        {error && <p style={{ color: "red" }}>{error}</p>}

        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          <>
            <Button variant="outlined" color="primary" onClick={editing ? handleSave : handleEdit} style={{ marginTop: 10 }}>
              {editing ? "Save" : "Edit"}
            </Button>
            {editing && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleCancel}
                style={{ marginTop: 10, marginLeft: 10 }}
              >
                Cancel
              </Button>
            )}
          </>
        )}
      </CardContent>

      {notification && <Notification message={notification.message} severity={notification.severity} />}
    </Card>
  );
}

export default BookDetail;
