import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EditIcon from "@mui/icons-material/Edit";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import ConfirmationModal from "components/Modals";
import Notification from "components/Notification";
import {
  fetchCategories,
  addCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
} from "../../redux/CategorySlice";

export default function StickyHeadTable() {
  const [inputValue, setInputValue] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [isOpen, setIsOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(-1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmInactive, setConfirmInactive] = useState(false);
  const [notification, setNotification] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const categories = useSelector((state) => state.category.categories);

  const dispatch = useDispatch();

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch]);

  const handleInputChange = (event) => {
    let inputValue = event.target.value;
    if (inputValue.length > 0 && inputValue[0] === " ") {
      inputValue = inputValue.trimStart();
    }
    const formattedInput =
      inputValue.length === 0
        ? ""
        : inputValue.charAt(0).toUpperCase() + inputValue.slice(1);

    setInputValue(formattedInput);
    setErrorMessage("");
  };

  const showNotification = (message, severity) => {
    setNotification({
      message,
      severity,
    });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleSubmit = async () => {
    if (inputValue.trim()) {
      if (editIndex === -1) {
        const newCategory = {
          name: inputValue,
          status: "Active",
        };
        dispatch(addCategory(newCategory)).then(() => {
          showNotification("Category successfully published!", "success");
        });
      } else {
        const updatedCategory = {
          id: categories[editIndex].id,
          name: inputValue,
        };
        dispatch(updateCategory(updatedCategory)).then(() => {
          showNotification("Category successfully updated!", "success");
        });
      }
      setInputValue("");
      handleCloseModal();
    } else {
      setErrorMessage("Please provide a valid input.");
      showNotification(
        "Something went wrong! Please provide a valid input.",
        "error"
      );
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setInputValue(categories[index].name);
    handleOpenModal();
  };

  const handleToggleStatus = (index) => {
    const categoryId = categories[index].id;
    dispatch(toggleCategoryStatus(categoryId));
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    const categoryId = categories[deleteIndex].id;
    dispatch(deleteCategory(categoryId)).then(() => {
      showNotification("Category successfully Delete!", "error");
    });
    setConfirmDelete(false);
    setDeleteIndex(-1);
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setDeleteIndex(-1);
  };

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setInputValue("");
    setEditIndex(-1);
  };

  const handleCancelIconClick = (index) => {
    setDeleteIndex(index);
    setConfirmInactive(true);
  };

  const handleConfirmInactive = () => {
    const categoryId = categories[deleteIndex].id;
    dispatch(toggleCategoryStatus(categoryId));
    setConfirmInactive(false);
    setDeleteIndex(-1);
  };

  const handleCancelInactive = () => {
    setConfirmInactive(false);
    setDeleteIndex(-1);
  };

  const renderValues = () => {
    return (
      <div className="page-container">
        <TableContainer className="table-container">
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow
                sx={{
                  "&th": {
                    color: "rgba(96, 96, 96)",
                    backgroundColor: "rgba(228, 228, 234, 0.688)",
                  },
                }}
              >
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    <Chip
                      variant="outlined"
                      label={row.status}
                      color={row.status === "Active" ? "success" : "error"}
                    />
                  </TableCell>
                  <TableCell>
                    <EditIcon
                      sx={{ marginRight: "15px" }}
                      onClick={() => handleEdit(index)}
                      color="primary"
                    />
                    {row.status === "Active" ? (
                      <CancelIcon
                        sx={{ marginRight: "15px" }}
                        color="warning"
                        onClick={() => handleCancelIconClick(index)}
                      />
                    ) : null}
                    {row.status === "Inactive" ? (
                      <CheckCircleIcon
                        onClick={() => handleToggleStatus(index)}
                        color="success"
                      />
                    ) : null}
                    <DeleteIcon
                      onClick={() => handleDelete(index)}
                      color="error"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  };

  return (
    <div>
      {notification && (
        <Notification
          message={notification.message}
          severity={notification.severity}
        />
      )}
      <Button
        variant="contained"
        onClick={handleOpenModal}
        style={{ marginBottom: "15px" }}
      >
        Add Category
      </Button>
      <Modal open={isOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            minWidth: 350,
          }}
        >
          <Stack spacing={3}>
            <TextField
              label="Enter a value"
              value={inputValue}
              onChange={handleInputChange}
            />
            {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
            <Button variant="contained" onClick={handleSubmit}>
              {editIndex === -1 ? "Submit" : "Update"}
            </Button>
          </Stack>
        </Box>
      </Modal>
      {renderValues()}
      {confirmDelete && (
        <ConfirmationModal
          title="Do you want to delete this category?"
          isOpen={confirmDelete}
          handleConfirmDelete={handleConfirmDelete}
          handleCancelDelete={handleCancelDelete}
        />
      )}
      {confirmInactive && (
        <ConfirmationModal
          title="Do you want to mark this category as inactive?"
          isOpen={confirmInactive}
          handleConfirmDelete={handleConfirmInactive}
          handleCancelDelete={handleCancelInactive}
        />
      )}
    </div>
  );
}
