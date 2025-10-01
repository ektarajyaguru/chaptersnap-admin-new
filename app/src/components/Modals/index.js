import React from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

const ConfirmationModal = ({
  isOpen,
  handleConfirmDelete,
  handleCancelDelete,
  title,
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={handleCancelDelete}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {title}
        </Typography>
        <div style={{ marginTop: "20px", textAlign: "right" }}>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
          >
            Yes
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ConfirmationModal;
