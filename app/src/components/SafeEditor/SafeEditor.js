"use client";

import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";

const SafeEditor = ({ editorState, onEditorStateChange, ...props }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={onEditorStateChange}
      {...props}
    />
  );
};

export default SafeEditor;
