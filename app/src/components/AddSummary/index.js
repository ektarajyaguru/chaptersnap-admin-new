"use client";
// "use client";

// import React, { useState } from "react";
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Typography,
//   Button,
//   TextField,
//   CircularProgress,
//   Box,
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import SaveIcon from "@mui/icons-material/Save";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { Editor } from "react-draft-wysiwyg";
// import { EditorState, convertToRaw } from "draft-js";
// import draftToHtml from "draftjs-to-html";
// import { createClient } from "../../../../lib/supabase/client";
// import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

// function AddSummary({ bookId, onSummaryAdded }) {
//   const supabase = createClient();

//   const [summaries, setSummaries] = useState([]);
//   const [editorStates, setEditorStates] = useState([]);
//   const [expanded, setExpanded] = useState(null);
//   const [summaryErrors, setSummaryErrors] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (panel) => (_, isExpanded) => {
//     setExpanded(isExpanded ? panel : false);
//     setSummaryErrors([]);
//   };

//   const handleAddSummary = () => {
//     const newId = Math.random().toString();
//     setSummaries((prev) => [
//       ...prev,
//       { id: newId, duration: "", summaryId: null },
//     ]);
//     setEditorStates((prev) => [...prev, EditorState.createEmpty()]);
//     setExpanded(`panel${newId}`);
//   };

//   const handleDeleteAccordion = (id) => {
//     const index = summaries.findIndex((s) => s.id === id);
//     if (index !== -1) {
//       setSummaries((prev) => prev.filter((s) => s.id !== id));
//       setEditorStates((prev) => prev.filter((_, i) => i !== index));
//     }
//     if (expanded === `panel${id}`) setExpanded(null);
//   };

//   const uploadImageCallback = async (file) => {
//     try {
//       const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "public";
//       const filePath = `summary_images/${Date.now()}_${file.name}`;
//       const { error: uploadError } = await supabase.storage
//         .from(bucket)
//         .upload(filePath, file, { upsert: true });
//       if (uploadError) throw uploadError;

//       const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
//       return { data: { link: data?.publicUrl || "" } };
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       return { data: { link: "" } };
//     }
//   };

//   const customStyleMap = {
//     LEXEND_DECA: { fontFamily: "Lexend Deca" },
//   };

//   const handleSave = async (index) => {
//     setSummaryErrors([]);
//     setLoading(true);

//     const currentSummary = summaries[index];
//     const currentEditorState = editorStates[index];
//     const duration = currentSummary.duration;
//     const contentState = currentEditorState.getCurrentContent();
//     const rawContentState = convertToRaw(contentState);
//     const summaryHtml = draftToHtml(rawContentState);

//     try {
//       if (!/^\d+$/.test(duration)) {
//         setSummaryErrors((prev) => [...prev, currentSummary.id]);
//         setLoading(false);
//         return;
//       }

//       if (!rawContentState.blocks.some((block) => block.text.trim())) {
//         setSummaryErrors((prev) => [...prev, currentSummary.id]);
//         setLoading(false);
//         return;
//       }

//       const { data: inserted, error } = await supabase
//         .from("book_content")
//         .insert({
//           book_id: bookId,
//           reading_time: duration,
//           content: summaryHtml,
//         })
//         .select()
//         .single();

//       if (error) throw error;

//       setSummaries((prev) =>
//         prev.map((s) =>
//           s.id === currentSummary.id ? { ...s, summaryId: inserted?.id } : s
//         )
//       );

//       if (onSummaryAdded) onSummaryAdded();
//     } catch (err) {
//       console.error("Error saving summary:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box>
//       <Button
//         variant="contained"
//         startIcon={<AddIcon />}
//         onClick={handleAddSummary}
//         sx={{ mt: 2 }}
//       >
//         Add More Summary
//       </Button>

//       {summaries.map((section, index) => {
//         const panelKey = `panel${section.id}`;
//         const isExpanded = expanded === panelKey;

//         return (
//           <Accordion
//             key={section.id}
//             sx={{ width: "90%", mt: 2 }}
//             expanded={isExpanded}
//             onChange={handleChange(panelKey)}
//           >
//             <AccordionSummary
//               expandIcon={
//                 <i
//                   className={isExpanded ? "fa fa-caret-up" : "fa fa-caret-down"}
//                 />
//               }
//               aria-controls={`${panelKey}-content`}
//               id={`${panelKey}-header`}
//             >
//               <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
//                 <TextField
//                   id={`duration${section.id}`}
//                   placeholder="ex. 2 min"
//                   type="number"
//                   value={section.duration}
//                   error={summaryErrors.includes(section.id)}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     if (/^\d*$/.test(val)) {
//                       setSummaries((prev) =>
//                         prev.map((s) =>
//                           s.id === section.id ? { ...s, duration: val } : s
//                         )
//                       );
//                     }
//                   }}
//                   required
//                   sx={{ mr: 2 }}
//                 />
//                 <Typography sx={{ color: "text.secondary" }}>
//                   Add Summary Here
//                 </Typography>
//                 <Box
//                   onClick={() => handleDeleteAccordion(section.id)}
//                   sx={{
//                     ml: "auto",
//                     bgcolor: "white",
//                     border: "1px solid #f6acac",
//                     px: 1,
//                     py: 0.5,
//                     borderRadius: 1,
//                     cursor: "pointer",
//                     display: "flex",
//                     alignItems: "center",
//                   }}
//                 >
//                   <DeleteIcon />
//                 </Box>
//               </Box>
//             </AccordionSummary>

//             <AccordionDetails>
//               {/* Render editor only when expanded */}
//               {isExpanded && (
//                 <Editor
//                   key={section.id}
//                   editorState={editorStates[index]}
//                   onEditorStateChange={(state) =>
//                     setEditorStates((prev) =>
//                       prev.map((s, idx) => (idx === index ? state : s))
//                     )
//                   }
//                   wrapperClassName="wrapperClassName"
//                   editorClassName="editorClassName"
//                   toolbarClassName="toolbarClassName"
//                   toolbar={{
//                     options: [
//                       "inline",
//                       "blockType",
//                       "fontSize",
//                       "fontFamily",
//                       "list",
//                       "textAlign",
//                       "colorPicker",
//                       "link",
//                       "embedded",
//                       "image",
//                       "history",
//                     ],
//                     fontFamily: {
//                       options: ["Lexend Deca", "Arial", "Georgia"],
//                     },
//                     image: {
//                       uploadCallback: uploadImageCallback,
//                       alt: { present: true, mandatory: true },
//                     },
//                   }}
//                   customStyleMap={customStyleMap}
//                 />
//               )}
//             </AccordionDetails>

//             {summaryErrors.includes(section.id) && (
//               <Typography variant="caption" color="error">
//                 Please provide a valid duration and summary.
//               </Typography>
//             )}

//             <Button
//               variant="contained"
//               color="primary"
//               startIcon={<SaveIcon />}
//               onClick={() => handleSave(index)}
//               sx={{ mt: 1 }}
//             >
//               {!loading ? "Save" : <CircularProgress size={24} color="inherit" />}
//             </Button>
//           </Accordion>
//         );
//       })}
//     </Box>
//   );
// }

// export default AddSummary;


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
import dynamic from "next/dynamic";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { createClient } from "../../../../lib/supabase/client";

// ✅ Dynamically import Editor to avoid SSR + unmounted state issues
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

function AddSummary({ bookId, onSummaryAdded }) {
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [editorStates, setEditorStates] = useState([]);
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
    setEditorStates((prev) => [...prev, EditorState.createEmpty()]);
    setExpanded(`panel${newId}`);
  };

  const handleDeleteAccordion = (id) => {
    const index = summaries.findIndex((s) => s.id === id);
    if (index !== -1) {
      setSummaries((prev) => prev.filter((s) => s.id !== id));
      setEditorStates((prev) => prev.filter((_, i) => i !== index));
    }
    if (expanded === `panel${id}`) setExpanded(null);
  };

  const uploadImageCallback = async (file) => {
    try {
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "public";
      const filePath = `summary_images/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return { data: { link: data?.publicUrl || "" } };
    } catch (error) {
      console.error("Error uploading image:", error);
      return { data: { link: "" } };
    }
  };

  const customStyleMap = {
    LEXEND_DECA: { fontFamily: "Lexend Deca" },
  };

  const handleSave = async (index) => {
    setSummaryErrors([]);
    setLoading(true);

    const currentSummary = summaries[index];
    const currentEditorState = editorStates[index];
    const duration = currentSummary.duration;
    const contentState = currentEditorState.getCurrentContent();
    const rawContentState = convertToRaw(contentState);
    const summaryHtml = draftToHtml(rawContentState);

    try {
      if (!/^\d+$/.test(duration)) {
        setSummaryErrors((prev) => [...prev, currentSummary.id]);
        setLoading(false);
        return;
      }

      if (!rawContentState.blocks.some((block) => block.text.trim())) {
        setSummaryErrors((prev) => [...prev, currentSummary.id]);
        setLoading(false);
        return;
      }

      const { data: inserted, error } = await supabase
        .from("book_content")
        .insert({
          book_id: bookId,
          reading_time: duration,
          content: summaryHtml,
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
                <Editor
                  key={section.id}
                  editorState={editorStates[index]}
                  onEditorStateChange={(state) =>
                    setEditorStates((prev) =>
                      prev.map((s, idx) => (idx === index ? state : s))
                    )
                  }
                  wrapperClassName="wrapperClassName"
                  editorClassName="editorClassName"
                  toolbarClassName="toolbarClassName"
                  toolbar={{
                    options: [
                      "inline",
                      "blockType",
                      "fontSize",
                      "fontFamily",
                      "list",
                      "textAlign",
                      "colorPicker",
                      "link",
                      "embedded",
                      "image",
                      "history",
                    ],
                    fontFamily: {
                      options: ["Lexend Deca", "Arial", "Georgia"],
                    },
                    image: {
                      uploadCallback: uploadImageCallback,
                      alt: { present: true, mandatory: true },
                    },
                  }}
                  customStyleMap={customStyleMap}
                />
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
