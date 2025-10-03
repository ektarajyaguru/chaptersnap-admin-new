import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Label } from "@/lib/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/lib/components/ui/table";
import { Badge } from "@/lib/components/ui/badge";
import { TrashIcon, PencilIcon, XIcon, CheckCircleIcon, PlusIcon } from "lucide-react";
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
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((row, index) => (
              <TableRow key={index} className="hover:bg-muted/50">
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Active" ? "default" : "destructive"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(index)}
                    className="h-8 w-8 p-0"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  {row.status === "Active" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelIconClick(index)}
                      className="h-8 w-8 p-0"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  ) : null}
                  {row.status === "Inactive" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(index)}
                      className="h-8 w-8 p-0"
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(index)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
      <Dialog open={isOpen} onOpenChange={handleCloseModal}>
        <DialogTrigger asChild>
          <Button className="mb-4">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editIndex === -1 ? "Add Category" : "Edit Category"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-input">Category Name</Label>
              <Input
                id="category-input"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Enter category name"
              />
            </div>
            {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
            <Button onClick={handleSubmit} className="w-full">
              {editIndex === -1 ? "Submit" : "Update"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
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
