"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import { createClient } from "../../../../lib/supabase/client";
import CustomModal from "@/components/CustomModal";

function EditSummary({ bookId, onSummaryAdded }) {
  const supabase = createClient();

  const [summaries, setSummaries] = useState([]);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingFields, setEditingFields] = useState({ duration: "", content: "" });
  const [summaryErrors, setSummaryErrors] = useState([]);

  // Fetch summaries
  useEffect(() => {
    let isMounted = true;

    const fetchSummaries = async () => {
      try {
        const { data, error } = await supabase
          .from("book_content")
          .select("id, reading_time, content")
          .eq("book_id", bookId)
          .order("reading_time", { ascending: true });

        if (error) throw error;

        if (isMounted) {
          const formatted = data.map((item) => ({
            id: item.id,
            data: { summary: item.content, duration: item.reading_time },
          }));
          setSummaries(formatted);
        }
      } catch (err) {
        console.error("Error fetching summaries:", err.message || err);
      }
    };

    fetchSummaries();

    return () => {
      isMounted = false;
    };
  }, [bookId, supabase]);

  // Open editor
  const openEditor = (summaryId, initialContent, duration) => {
    setSelectedSummaryId(summaryId);
    setEditingFields({ content: initialContent, duration });
    setEditMode(true);
  };

  // Close editor
  const closeEditor = () => {
    setSelectedSummaryId(null);
    setEditingFields({ content: "", duration: "" });
    setEditMode(false);
    setSummaryErrors([]);
  };

  // Upload image callback (optional)
  const uploadImageCallback = async (file) => {
    try {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "public";
      const filePath = `summary_images/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { data: { link: data.publicUrl || "" } };
    } catch (err) {
      console.error("Error uploading image:", err);
      return { data: { link: "" } };
    }
  };

  // Update summary
  const updateSummaryData = async () => {
    setLoading(true);
    try {
      if (!editingFields.content || !editingFields.content.trim()) {
        setSummaryErrors([selectedSummaryId]);
        setLoading(false);
        return;
      }

      await supabase
        .from("book_content")
        .update({ content: editingFields.content, reading_time: editingFields.duration || null })
        .eq("id", selectedSummaryId);

      closeEditor();
      if (onSummaryAdded) onSummaryAdded();
    } catch (err) {
      console.error("Error updating summary:", err.message || err);
    } finally {
      setLoading(false);
    }
  };

  // Delete summary
  const handleDeleteSummary = async (summaryId) => {
    setLoading(true);
    try {
      await supabase.from("book_content").delete().eq("id", summaryId);
      setSummaries((prev) => prev.filter((s) => s.id !== summaryId));
    } catch (err) {
      console.error("Error deleting summary:", err.message || err);
    } finally {
      setLoading(false);
      closeDeleteConfirmation();
    }
  };

  const openDeleteConfirmation = (summaryId) => {
    setSelectedSummaryId(summaryId);
    setDeleteConfirmationOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSelectedSummaryId(null);
    setDeleteConfirmationOpen(false);
  };

  const confirmDeleteSummary = () => {
    handleDeleteSummary(selectedSummaryId);
  };

  return (
    <>
      {summaries.map((summary, index) => (
        <Accordion key={summary.id}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Summary: {index + 1}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography><strong>Duration:</strong> {summary.data.duration} mins</Typography>
            <Typography dangerouslySetInnerHTML={{ __html: summary.data.summary }} />
          </AccordionDetails>
          <Button onClick={() => openEditor(summary.id, summary.data.summary, summary.data.duration)}>Edit</Button>
          <IconButton onClick={() => openDeleteConfirmation(summary.id)}><DeleteIcon /></IconButton>
        </Accordion>
      ))}

      <Dialog open={deleteConfirmationOpen} onClose={closeDeleteConfirmation}>
        <DialogTitle>Delete Summary</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this summary?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteConfirmation} disabled={loading}>Cancel</Button>
          <Button onClick={confirmDeleteSummary} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      <CustomModal
        open={editMode}
        onClose={closeEditor}
        editingFields={editingFields}
        setEditingFields={setEditingFields}
        uploadImageCallback={uploadImageCallback}
        loading={loading}
        updateSummaryData={updateSummaryData}
        summaryErrors={summaryErrors}
        selectedSummaryId={selectedSummaryId}
        closeEditor={closeEditor}
      />
    </>
  );
}

export default EditSummary;
