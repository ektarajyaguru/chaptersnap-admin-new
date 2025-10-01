"use client";

import React from "react";
import { Box, Typography, TextField, Button, CircularProgress } from "@mui/material";
import { RichTextEditor } from "@/components/RichTextEditor"; // import your converted JS RichTextEditor

const CustomModal = ({
  open,
  onClose,
  editingFields,
  setEditingFields,
  loading,
  updateSummaryData,
  summaryErrors,
  selectedSummaryId,
  closeEditor,
}) => {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(15px)",
          zIndex: 1,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxHeight: "90vh",
          overflowY: "auto",
          backgroundColor: "white",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          padding: "20px",
          borderRadius: "10px",
          zIndex: 2,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Typography style={{ fontSize: "30px", color: "gray", marginBottom: "20px" }}>
          <strong>Edit Summary</strong>
        </Typography>

        {/* Duration */}
        <Typography style={{ fontSize: "18px", marginBottom: "8px" }}>Duration</Typography>
        <TextField
          required
          value={editingFields.duration || ""}
          type="number"
          inputProps={{ pattern: "\\d*", inputMode: "numeric" }}
          onChange={(e) =>
            setEditingFields((prev) => ({ ...prev, duration: e.target.value }))
          }
          fullWidth
          sx={{ mb: 2 }}
        />

        {/* RichTextEditor */}
        <Box
          sx={{
            border: "1px solid rgba(0,0,0,0.2)",
            borderRadius: "10px",
            padding: 1,
            mt: 1,
            maxHeight: "50vh",
            overflowY: "auto",
          }}
        >
          <RichTextEditor
            initialContent={editingFields.content || ""}
            onChange={(value) => setEditingFields((prev) => ({ ...prev, content: value }))}
            placeholder="Write your summary here..."
          />
        </Box>

        {/* Buttons */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Button
            onClick={closeEditor}
            color="secondary"
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={updateSummaryData}
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Save Changes"}
          </Button>
          {summaryErrors.includes(selectedSummaryId) && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
              Please provide a summary.
            </Typography>
          )}
        </Box>
      </div>
    </>
  );
};

export default CustomModal;
