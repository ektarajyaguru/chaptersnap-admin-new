"use client"

import { useState, useEffect } from "react";
import { publishBook } from "../../../lib/actions";
import { createClient } from "../../../lib/supabase/client";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/ui/dialog";
import { ImageGalleryContent } from "@/components/image-gallery-content";
import { RichTextEditor } from "../../src/components/RichTextEditor/index";
import { ImageIcon, PlusIcon, TrashIcon, ChevronDownIcon } from "lucide-react";
import { Input } from "@/lib/components/ui/input";
import { Label } from "@/lib/components/ui/label";
import { Textarea } from "@/lib/components/ui/textarea";
import { Checkbox } from "@/lib/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/lib/components/ui/select";

// Category type
interface Category {
  id: string;
  name: string;
  status: string;
}

// Summary section type
interface SummarySection {
  id: number;
  summary: string;
  duration: string;
}

export default function PublishBooksPage() {
  const supabase = createClient();

  // State management
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isUrlGalleryOpen, setIsUrlGalleryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categoryError, setCategoryError] = useState(false);
  const [summaryErrors, setSummaryErrors] = useState<number[]>([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [summarySections, setSummarySections] = useState<SummarySection[]>([
    { id: 1, summary: "", duration: "" }
  ]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading categories:", error);
      } else {
        setCategories(data || []);
      }
    };

    loadCategories();
  }, []);

  // Handlers
  const handleImageSelect = (url: string) => {
    setSelectedImageUrl(url);
    setIsGalleryOpen(false);
  };

  const handleUrlSelect = (url: string) => {
    setSelectedUrl(url);
    setIsUrlGalleryOpen(false);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setCategoryError(false);
  };

  const handleAddSummary = () => {
    const newId = Math.max(...summarySections.map(s => s.id), 0) + 1;
    setSummarySections(prev => [...prev, { id: newId, summary: "", duration: "" }]);
  };

  const handleDeleteSummary = (id: number) => {
    if (summarySections.length > 1) {
      setSummarySections(prev => prev.filter(section => section.id !== id));
    }
  };

  const handleSummaryChange = (id: number, field: keyof SummarySection, value: string) => {
    setSummarySections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    );

    if (summaryErrors.includes(id)) {
      setSummaryErrors(prev => prev.filter(errorId => errorId !== id));
    }
  };

  const handleExpandedChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Validation
  const validateInputs = (formData: FormData) => {
    const bookName = formData.get("bookName")?.toString().trim();
    const author = formData.get("author")?.toString().trim();

    if (!bookName) {
      alert("Please enter book name.");
      return false;
    }

    if (/^\s/.test(bookName)) {
      alert("Invalid book name.");
      return false;
    }

    if (!author) {
      alert("Please enter author name.");
      return false;
    }

    if (/^\s/.test(author)) {
      alert("Invalid author name.");
      return false;
    }

    const hasEmptySummary = summarySections.some(section => !section.summary.trim());
    if (hasEmptySummary) {
      setSummaryErrors(summarySections.filter(section => !section.summary.trim()).map(s => s.id));
      alert("Please provide content for all summary sections.");
      return false;
    }

    return true;
  };

  // Form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSummaryErrors([]);
    setCategoryError(false);

    if (!selectedCategory) {
      setCategoryError(true);
      setIsSubmitting(false);
      alert("Please select a category.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    if (!validateInputs(formData)) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Update form data with current state
      formData.set("selectedImageUrl", selectedImageUrl);
      formData.set("selectedUrl", selectedUrl);
      formData.set("categories", JSON.stringify([selectedCategory]));
      formData.set("summarySections", JSON.stringify(summarySections));

      const result = await publishBook(formData);

      if (result.error) {
        alert("Error publishing book: " + result.error);
      } else {
        alert("Book published successfully!");

        // Reset form
        event.currentTarget.reset();
        setSelectedImageUrl("");
        setSelectedUrl("");
        setSelectedCategory("");
        setSummarySections([{ id: 1, summary: "", duration: "" }]);
        setExpanded(false);
      }
    } catch (error) {
      console.error("Error publishing book:", error);
      alert("Error publishing book. Please try again.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="container mt-4">
      <Card className="max-w-5xl mx-auto">
        <CardHeader className="bg-gray-100">
          <CardTitle className="text-2xl">Publish Book</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bookName">Book Name *</Label>
                <Input
                  id="bookName"
                  name="bookName"
                  placeholder="Enter book name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    name="url"
                    value={selectedUrl}
                    onChange={(e) => setSelectedUrl(e.target.value)}
                    placeholder="Enter URL or select from gallery"
                    className="flex-1"
                  />
                  <Dialog open={isUrlGalleryOpen} onOpenChange={setIsUrlGalleryOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="icon">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>Select URL Image</DialogTitle>
                      </DialogHeader>
                      <div className="flex-1 overflow-hidden">
                        <ImageGalleryContent onSelect={handleUrlSelect} />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  name="metaTitle"
                  placeholder="Enter meta title"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                name="metaDescription"
                placeholder="Enter meta description"
                rows={3}
              />
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label>Categories *</Label>
              {categoryError && (
                <p className="text-sm text-red-600">Please select a category.</p>
              )}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>

              {/* Selected Image Preview */}
              {selectedImageUrl && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Selected from gallery:</p>
                  <div className="relative inline-block">
                    <img
                      src={selectedImageUrl}
                      alt="Selected cover"
                      className="w-32 h-40 object-cover border border-gray-300 rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                      onClick={() => setSelectedImageUrl("")}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                {/* File Upload Option */}
                <div className="flex-1">
                  <Input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="w-full"
                  />
                </div>

                {/* Gallery Selection */}
                <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="outline" className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Select from Gallery
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Select Cover Image</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 overflow-hidden">
                      <ImageGalleryContent onSelect={handleImageSelect} />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <p className="text-sm text-gray-500">
                You can either upload a new image file or select an existing image from your gallery.
              </p>
            </div>

            {/* Summary Sections */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">Summary Sections</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSummary}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Summary
                </Button>
              </div>

              {summarySections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Section {index + 1}</span>
                      {summaryErrors.includes(section.id) && (
                        <span className="text-sm text-red-600">Please provide summary content</span>
                      )}
                    </div>
                    {summarySections.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSummary(section.id)}
                        className="flex items-center gap-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        Delete
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`duration-${section.id}`} className="text-sm">
                          Duration (minutes)
                        </Label>
                        <Input
                          id={`duration-${section.id}`}
                          type="number"
                          min="1"
                          value={section.duration}
                          onChange={(e) => handleSummaryChange(section.id, "duration", e.target.value)}
                          placeholder="e.g., 2"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm">Summary Content</Label>
                      <div className="mt-1">
                        <RichTextEditor
                          initialContent={section.summary}
                          onChange={(html: string) => handleSummaryChange(section.id, "summary", html)}
                          placeholder="Write your summary content here..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? "Publishing..." : "Publish Book"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


