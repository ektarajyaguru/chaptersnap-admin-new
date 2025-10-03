import React, { useCallback } from "react"
import { Button } from "@/lib/components/ui/button"
import { UploadIcon } from "lucide-react"

interface ImageUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
}

export function ImageUploadZone({ onFilesSelected, disabled }: ImageUploadZoneProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return

    const files = Array.from(e.dataTransfer.files)
    onFilesSelected(files)
  }, [onFilesSelected, disabled])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return

    const files = Array.from(e.target.files || [])
    onFilesSelected(files)
  }, [onFilesSelected, disabled])

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        disabled
          ? "border-gray-300 bg-gray-50 cursor-not-allowed"
          : "border-gray-300 hover:border-gray-400 cursor-pointer"
      }`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        disabled={disabled}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="cursor-pointer">
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {disabled ? "Upload disabled" : "Drag and drop images here, or click to select"}
        </p>
      </label>
    </div>
  )
}

