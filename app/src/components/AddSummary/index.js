"use client";

import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { createClient } from "../../../../lib/supabase/client";
import { RichTextEditor } from "@/components/RichTextEditor";

function AddSummary({ bookId, onSummaryAdded }) {
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [editorContents, setEditorContents] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [summaryErrors, setSummaryErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ensure Editor only loads after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
    setSummaryErrors([]);
  };

  const handleAddSummary = () => {
    const newId = Math.random().toString();
    setSummaries((prev) => [
      ...prev,
      { id: newId, duration: "", summaryId: null },
    ]);
    setEditorContents((prev) => [...prev, ""]);
    setExpanded(`panel${newId}`);
  };

  const handleDeleteAccordion = (id) => {
    const index = summaries.findIndex((s) => s.id === id);
    if (index !== -1) {
      setSummaries((prev) => prev.filter((s) => s.id !== id));
      setEditorContents((prev) => prev.filter((_, i) => i !== index));
    }
    if (expanded === `panel${id}`) setExpanded(null);
  };


  const handleSave = async (index) => {
    setSummaryErrors([]);
    setLoading(true);

    const currentSummary = summaries[index];
    const currentEditorContent = editorContents[index];
    const duration = currentSummary.duration;

    try {
      if (!/^\d+$/.test(duration)) {
        setSummaryErrors((prev) => [...prev, currentSummary.id]);
        setLoading(false);
        return;
      }

      if (!currentEditorContent || !currentEditorContent.trim()) {
        setSummaryErrors((prev) => [...prev, currentSummary.id]);
        setLoading(false);
        return;
      }

      const { data: inserted, error } = await supabase
        .from("book_content")
        .insert({
          book_id: bookId,
          reading_time: duration,
          content: currentEditorContent,
        })
        .select()
        .single();

      if (error) throw error;

      setSummaries((prev) =>
        prev.map((s) =>
          s.id === currentSummary.id ? { ...s, summaryId: inserted?.id } : s
        )
      );

      if (onSummaryAdded) onSummaryAdded();
    } catch (err) {
      console.error("Error saving summary:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null; // ✅ Prevents Editor rendering before mount

  return (
    <Box>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAddSummary}
        sx={{ mt: 2 }}
      >
        Add More Summary
      </Button>

      {summaries.map((section, index) => {
        const panelKey = `panel${section.id}`;
        const isExpanded = expanded === panelKey;

        return (
          <Accordion
            key={section.id}
            sx={{ width: "90%", mt: 2 }}
            expanded={isExpanded}
            onChange={handleChange(panelKey)}
          >
            <AccordionSummary
              expandIcon={
                <i
                  className={isExpanded ? "fa fa-caret-up" : "fa fa-caret-down"}
                />
              }
              aria-controls={`${panelKey}-content`}
              id={`${panelKey}-header`}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <TextField
                  id={`duration${section.id}`}
                  placeholder="ex. 2 min"
                  type="number"
                  value={section.duration}
                  error={summaryErrors.includes(section.id)}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^\d*$/.test(val)) {
                      setSummaries((prev) =>
                        prev.map((s) =>
                          s.id === section.id ? { ...s, duration: val } : s
                        )
                      );
                    }
                  }}
                  required
                  sx={{ mr: 2 }}
                />
                <Typography sx={{ color: "text.secondary" }}>
                  Add Summary Here
                </Typography>
                <Box
                  onClick={() => handleDeleteAccordion(section.id)}
                  sx={{
                    ml: "auto",
                    bgcolor: "white",
                    border: "1px solid #f6acac",
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <DeleteIcon />
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              {isExpanded && (
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
                    initialContent={editorContents[index] || ""}
                    onChange={(value) =>
                      setEditorContents((prev) =>
                        prev.map((content, idx) => (idx === index ? value : content))
                      )
                    }
                    placeholder="Write your summary here..."
                  />
                </Box>
              )}
            </AccordionDetails>

            {summaryErrors.includes(section.id) && (
              <Typography variant="caption" color="error">
                Please provide a valid duration and summary.
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={() => handleSave(index)}
              sx={{ mt: 1 }}
            >
              {!loading ? "Save" : <CircularProgress size={24} color="inherit" />}
            </Button>
          </Accordion>
        );
      })}
    </Box>
  );
}

export default AddSummary;
