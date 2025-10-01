"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor, EditorContent, ReactNodeViewRenderer } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Highlight from "@tiptap/extension-highlight";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";

import {
    BoldIcon,
    ItalicIcon,
    ListIcon,
    ListOrderedIcon,
    Heading1Icon,
    Heading2Icon,
    LinkIcon,
    UnlinkIcon,
    AlignLeftIcon,
    AlignCenterIcon,
    AlignRightIcon,
    AlignJustifyIcon,
    StrikethroughIcon,
    UnderlineIcon,
    HighlighterIcon,
    QuoteIcon,
    CodeIcon,
    MinusIcon,
    ListTodoIcon,
    UndoIcon,
    RedoIcon,
    EraserIcon,
    ImageIcon,
    EyeIcon,
    Code2Icon,
} from "lucide-react";

// import { Toggle } from "@/components/ui/toggle";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Toggle } from "@/lib/components/ui/toggle";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Separator } from "@/lib/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/components/ui/popover";


import { uploadImage } from "../../../../lib/actions";
import { useToast } from "../../../../hooks/use-toast";
import beautify from "js-beautify";
import "prosemirror-view/style/prosemirror.css";

import CodeMirror from "@uiw/react-codemirror";
import { html } from "@codemirror/lang-html";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { lineNumbers } from "@codemirror/view";
import { history, historyKeymap, defaultKeymap } from "@codemirror/commands";
import { keymap } from "@codemirror/view";
import { dracula } from "@uiw/codemirror-theme-dracula";

// import { ImageGalleryDialog } from "./image-gallery-dialog";
// import { TiptapImageNodeView } from "./tiptap-image-node-view";

export function RichTextEditor({ initialContent, onChange, placeholder }) {
    const [isClient, setIsClient] = useState(false);
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState("preview");
    const [htmlCode, setHtmlCode] = useState(initialContent);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isReplacingImage, setIsReplacingImage] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const checkDarkMode = () => {
            const isDark =
                (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
                document.documentElement.classList.contains("dark");
            setIsDarkMode(isDark);
        };
        checkDarkMode();
        window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkDarkMode);
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => {
            window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", checkDarkMode);
            observer.disconnect();
        };
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                blockquote: true,
                codeBlock: true,
                history: true,
                bulletList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: false,
                },
                listItem: {
                    HTMLAttributes: {
                        class: 'prose-list-item',
                    },
                },
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { target: "_blank", rel: "noopener noreferrer" },
            }),
            Placeholder.configure({ placeholder: placeholder || "Write your article content here..." }),
            TextAlign.configure({ types: ["heading", "paragraph", "image"] }),
            Underline,
            Strike,
            Highlight.configure({ multicolor: true }),
            TaskList,
            TaskItem.configure({ nested: true }),
            Image.configure({
                inline: false,
                allowBase64: false,
                HTMLAttributes: { width: "string", "data-align": "string" },
            }).extend({
                addAttributes() {
                    return {
                        ...this.parent?.(),
                        href: {
                            default: null,
                            parseHTML: (element) =>
                                element.parentElement?.tagName === "A" ? element.parentElement.getAttribute("href") : null,
                        },
                    };
                },
                renderHTML({ HTMLAttributes }) {
                    const { href, ...rest } = HTMLAttributes;
                    const imgTag = ["img", rest];
                    if (href) {
                        return ["a", { href, target: "_blank", rel: "noopener noreferrer" }, imgTag];
                    }
                    return imgTag;
                },
                addNodeView() {
                    return ReactNodeViewRenderer((props) => (
                        <TiptapImageNodeView
                            {...props}
                            openGalleryForReplace={(currentSrc) => {
                                setIsReplacingImage(true);
                                setIsGalleryOpen(true);
                            }}
                        />
                    ));
                },
            }),
        ],
        content: initialContent || '<p></p>',
        parseOptions: {
            preserveWhitespace: false,
        },
        onUpdate: ({ editor }) => {
            const currentHtml = editor.getHTML();
            console.log('Editor content updated:', currentHtml);
            onChange(currentHtml);
            setHtmlCode(currentHtml);
        },
        editorProps: {
            attributes: {
                class: "ProseMirror focus:outline-none",
                tabindex: "0"
            }
        },
        immediatelyRender: false,
    });

    // Set initial content only when editor is first created and empty
    useEffect(() => {
        if (editor && initialContent && !editor.getHTML().trim() && initialContent.trim()) {
            editor.commands.setContent(initialContent, false);
        }
    }, [editor]);

    // Sync external content changes (when content is loaded from outside)
    useEffect(() => {
        if (editor && initialContent && initialContent.trim()) {
            const currentContent = editor.getHTML();
            if (currentContent !== initialContent && currentContent.trim() === "") {
                // Only set content if editor is empty and we have external content
                editor.commands.setContent(initialContent, false);
            }
        }
    }, [editor, initialContent]);

    useEffect(() => {
        if (editor && viewMode === "code") {
            setHtmlCode(beautify.html(editor.getHTML(), { indent_size: 2 }));
        }
    }, [viewMode, editor]);

    const handleCodeChange = (value) => {
        setHtmlCode(value);
        onChange(value);
    };

    const [linkUrl, setLinkUrl] = useState("");
    const [linkOpen, setLinkOpen] = useState(false);

    const setLink = () => {
        if (linkUrl) {
            editor?.chain().focus().setLink({ href: linkUrl, target: "_blank" }).run();
        } else {
            editor?.chain().focus().unsetLink().run();
        }
        setLinkUrl("");
        setLinkOpen(false);
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(formData);
        if (result.url) {
            editor?.chain().focus().setImage({ src: result.url }).run();
            toast({ title: "Image Uploaded!", description: "Image successfully uploaded and inserted." });
        } else {
            toast({ title: "Image Upload Failed", description: result.error || "Unknown error.", variant: "destructive" });
        }
        setLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImageSelectFromGallery = useCallback(
        (url) => {
            if (!editor) return;
            if (isReplacingImage && editor.isActive("image")) {
                editor.chain().focus().updateAttributes("image", { src: url }).run();
                toast({ title: "Image Replaced!", description: "Image in content replaced from gallery." });
            } else {
                editor.chain().focus().setImage({ src: url }).run();
                toast({ title: "Image Inserted!", description: "Image from gallery inserted into content." });
            }
            setIsGalleryOpen(false);
            setIsReplacingImage(false);
        },
        [editor, isReplacingImage, toast]
    );

    if (!isClient) return <div className="border rounded-md p-4 min-h-[200px]">Loading editor...</div>;
    if (!editor) return <div className="border rounded-md p-4 min-h-[200px]">Initializing editor...</div>;

    return (
        <div className="border rounded-md" onClick={() => editor?.commands.focus()}>
            <div className="flex flex-wrap items-center gap-1 p-2 border-b">
                {/* Basic Formatting */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive("bold")}
                    onPressedChange={() => editor.chain().focus().toggleBold().run()}
                    aria-label="Toggle bold"
                >
                    <BoldIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("italic")}
                    onPressedChange={() => editor.chain().focus().toggleItalic().run()}
                    aria-label="Toggle italic"
                >
                    <ItalicIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("underline")}
                    onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
                    aria-label="Toggle underline"
                >
                    <UnderlineIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("strike")}
                    onPressedChange={() => editor.chain().focus().toggleStrike().run()}
                    aria-label="Toggle strikethrough"
                >
                    <StrikethroughIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("highlight")}
                    onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
                    aria-label="Toggle highlight"
                >
                    <HighlighterIcon className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Headings */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive("heading", { level: 1 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    aria-label="Toggle H1"
                >
                    <Heading1Icon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("heading", { level: 2 })}
                    onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    aria-label="Toggle H2"
                >
                    <Heading2Icon className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Lists */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive("bulletList")}
                    onPressedChange={() => {
                        console.log('Toggle bullet list, isActive:', editor.isActive("bulletList"));
                        editor.chain().focus().toggleBulletList().run();
                    }}
                    aria-label="Toggle bullet list"
                >
                    <ListIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("orderedList")}
                    onPressedChange={() => {
                        console.log('Toggle ordered list, isActive:', editor.isActive("orderedList"));
                        editor.chain().focus().toggleOrderedList().run();
                    }}
                    aria-label="Toggle ordered list"
                >
                    <ListOrderedIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("taskList")}
                    onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
                    aria-label="Toggle task list"
                >
                    <ListTodoIcon className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Alignment */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: "left" })}
                    onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}
                    aria-label="Align left"
                >
                    <AlignLeftIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: "center" })}
                    onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}
                    aria-label="Align center"
                >
                    <AlignCenterIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: "right" })}
                    onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}
                    aria-label="Align right"
                >
                    <AlignRightIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive({ textAlign: "justify" })}
                    onPressedChange={() => editor.chain().focus().setTextAlign("justify").run()}
                    aria-label="Align justify"
                >
                    <AlignJustifyIcon className="h-4 w-4" />
                </Toggle>

                <Separator orientation="vertical" className="h-6" />

                {/* Block Elements */}
                <Toggle
                    size="sm"
                    pressed={editor.isActive("blockquote")}
                    onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
                    aria-label="Toggle blockquote"
                >
                    <QuoteIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={editor.isActive("codeBlock")}
                    onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
                    aria-label="Toggle code block"
                >
                    <CodeIcon className="h-4 w-4" />
                </Toggle>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    aria-label="Insert horizontal rule"
                >
                    <MinusIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* Links */}
                <Popover open={linkOpen} onOpenChange={setLinkOpen}>
                    <PopoverTrigger asChild>
                        <Toggle
                            size="sm"
                            pressed={editor.isActive("link")}
                            onPressedChange={() => {
                                if (editor.isActive("link")) {
                                    editor.chain().focus().unsetLink().run()
                                } else {
                                    setLinkUrl(editor.getAttributes("link").href || "")
                                    setLinkOpen(true)
                                }
                            }}
                            aria-label="Toggle link"
                        >
                            {editor.isActive("link") ? <UnlinkIcon className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
                        </Toggle>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2 flex gap-2">
                        <Input
                            type="url"
                            placeholder="Enter URL"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    setLink()
                                }
                            }}
                        />
                        <Button type="button" size="sm" onClick={setLink}>
                            Apply
                        </Button>
                    </PopoverContent>
                </Popover>

                <Separator orientation="vertical" className="h-6" />

                {/* Image Upload & Gallery */}
                <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                />
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    aria-label="Insert image"
                >
                    <ImageIcon className="h-4 w-4" />
                </Button>

               { /*  <ImageGalleryDialog
                    open={isGalleryOpen}
                    onOpenChange={setIsGalleryOpen}
                    onSelect={handleImageSelectFromGallery}
                >
                    <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label="Open image gallery"
                        onClick={() => {
                            setIsReplacingImage(false) // Ensure we're inserting, not replacing
                            setIsGalleryOpen(true)
                        }}
                    >
                        <ImageIcon className="h-4 w-4" />
                        <span className="ml-1">Gallery</span>
                    </Button>
                </ImageGalleryDialog> */}

                <Separator orientation="vertical" className="h-6" />

                {/* Undo/Redo & Clear */}
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    aria-label="Undo"
                >
                    <UndoIcon className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    aria-label="Redo"
                >
                    <RedoIcon className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                    aria-label="Clear formatting"
                >
                    <EraserIcon className="h-4 w-4" />
                </Button>

                <Separator orientation="vertical" className="h-6" />

                {/* View Mode Toggles */}
                <Toggle
                    size="sm"
                    pressed={viewMode === "preview"}
                    onPressedChange={() => {
                        if (editor) {
                            editor.commands.setContent(htmlCode, false)
                        }
                        setViewMode("preview")
                    }}
                    aria-label="Preview mode"
                >
                    <EyeIcon className="h-4 w-4" />
                </Toggle>
                <Toggle
                    size="sm"
                    pressed={viewMode === "code"}
                    onPressedChange={() => {
                        if (editor) {
                            const currentHtml = editor.getHTML()
                            setHtmlCode(beautify.html(currentHtml, { indent_size: 2 }))
                        }
                        setViewMode("code")
                    }}
                    aria-label="Code mode"
                >
                    <Code2Icon className="h-4 w-4" />
                </Toggle>
            </div>

            {viewMode === "preview" ? (
                <div
                    className="min-h-[200px] max-h-[500px] overflow-y-auto prose prose-sm sm:prose lg:prose-lg focus-within:outline-none"
                    onClick={() => editor?.commands.focus()}
                    style={{
                        cursor: 'text',
                        padding: '12px',
                        lineHeight: '1.6'
                    }}
                >
                    <EditorContent editor={editor} />
                </div>
            ) : (
                <CodeMirror
                    value={htmlCode}
                    height="500px" // Set fixed height for code view as well
                    theme={isDarkMode ? dracula : "light"} // Conditionally apply dracula theme for dark mode
                    extensions={[
                        html(),
                        lineNumbers(),
                        history(),
                        keymap.of([...defaultKeymap, ...historyKeymap]),
                        EditorView.lineWrapping,
                        EditorState.tabSize.of(2),
                    ]}
                    onChange={handleCodeChange}
                    className="font-mono text-sm"
                />
            )}
        </div>
    );
}
