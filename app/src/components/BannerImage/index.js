import React, { useState } from "react";
import {
  Card,
  CardActions,
  CardMedia,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import "./index.css";

function BannerImage({ banners, onDelete, onToggle }) {
  const placeholderImage = require("assets/img/bookCoverPlaceholder.png");
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    open: false,
    bannerId: null,
    imagePath: null,
  });

  const handleDeleteClick = (bannerId, imagePath) => {
    setDeleteConfirmation({
      open: true,
      bannerId,
      imagePath,
    });
  };

  const handleConfirmDelete = () => {
    onDelete(deleteConfirmation.bannerId, deleteConfirmation.imagePath);
    setDeleteConfirmation({
      open: false,
      bannerId: null,
      imagePath: null,
    });
  };

  const handleCancelDelete = () => {
    setDeleteConfirmation({
      open: false,
      bannerId: null,
      imagePath: null,
    });
  };

  return (
    <div className="banner-gallery">
      <div className="gallery-container">
        {banners ? (
          <div className="gallery-images">
            {banners.map((banner) => (
              <Card key={banner.id} className="gallery-image">
                <CardMedia
                  component="img"
                  alt={`Banner ${banner.id}`}
                  height="160"
                  src={banner.imageUrl || placeholderImage}
                />
                <CardActions disableSpacing>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() =>
                      handleDeleteClick(banner.id, banner.imagePath)
                    }
                  >
                    Delete
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() =>
                      onToggle(
                        banner.id,
                        banner.status === "active" ? "inactive" : "active"
                      )
                    }
                  >
                    Make {banner.status === "active" ? "Inactive" : "Active"}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </div>
        ) : (
          <div className="loading-container">
            <CircularProgress />
            <div className="loading-massage">Loading Banners.....</div>
          </div>
        )}
      </div>
      <Dialog open={deleteConfirmation.open} onClose={handleCancelDelete}>
        <DialogTitle>Delete Banner</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this banner?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default BannerImage;
