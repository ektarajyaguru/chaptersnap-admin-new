"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Label } from "@/lib/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/lib/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/lib/components/ui/card";
import { Separator } from "@/lib/components/ui/separator";
import { Badge } from "@/lib/components/ui/badge";
import { PlusIcon, TrashIcon, SaveIcon, ChevronDownIcon, LoaderIcon } from "lucide-react";
import { createClient } from "../../../../lib/supabase/client";
import { RichTextEditor } from "@/components/RichTextEditor";

function AddSummary({ bookId, onSummaryAdded }) {
  const supabase = createClient();

  const [mounted, setMounted] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [editorContents, setEditorContents] = useState([]);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [summaryErrors, setSummaryErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ ensure Editor only loads after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (panel: string) => {
    setExpanded(expanded === panel ? false : panel);
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

  const handleDeleteAccordion = (id: string) => {
    const index = summaries.findIndex((s) => s.id === id);
    if (index !== -1) {
      setSummaries((prev) => prev.filter((s) => s.id !== id));
      setEditorContents((prev) => prev.filter((_, i) => i !== index));
    }
    if (expanded === `panel${id}`) setExpanded(false);
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
    <div className="space-y-4">
      <Button onClick={handleAddSummary} className="w-full">
        <PlusIcon className="w-4 h-4 mr-2" />
        Add More Summary
      </Button>

      {summaries.map((section, index) => {
        const isExpanded = expanded === `panel${section.id}`;

        return (
          <Card key={section.id} className="w-full">
            <Collapsible open={isExpanded} onOpenChange={() => handleChange(`panel${section.id}`)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="space-y-1">
                        <Label htmlFor={`duration${section.id}`} className="text-xs text-muted-foreground">
                          Duration (minutes)
                        </Label>
                        <Input
                          id={`duration${section.id}`}
                          placeholder="ex. 2 min"
                          type="number"
                          value={section.duration}
                          className={`w-24 ${summaryErrors.includes(section.id) ? 'border-destructive' : ''}`}
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
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Summary {index + 1}</Badge>
                        <span className="text-sm text-muted-foreground">Click to expand</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAccordion(section.id);
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <RichTextEditor
                      key={`editor-${section.id}`}
                      initialContent={editorContents[index] || ""}
                      onChange={(value) =>
                        setEditorContents((prev) =>
                          prev.map((content, idx) => (idx === index ? value : content))
                        )
                      }
                      placeholder="Write your summary here..."
                    />
                  </div>

                  {summaryErrors.includes(section.id) && (
                    <p className="text-sm text-destructive mt-2">
                      Please provide a valid duration and summary.
                    </p>
                  )}

                  <Button
                    onClick={() => handleSave(index)}
                    className="mt-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <LoaderIcon className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

export default AddSummary;
