"use client"
import Image from "next/image"
import type React from "react"

import { Card, CardContent, CardFooter } from "@/lib/components/ui/card"
import { Badge } from "@/lib/components/ui/badge"
import { Trash2Icon } from "lucide-react"
import { Button } from "@/lib/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/lib/components/ui/alert-dialog"

interface GalleryImageCardProps {
  image: {
    id: string
    url: string
    title: string | null
    tags: string[] | null
  }
  onSelect?: (url: string) => void
  onDelete: (id: string) => void
}

export function GalleryImageCard({ image, onSelect, onDelete }: GalleryImageCardProps) {
  // Extract file extension from URL
  const getFileExtension = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase()
    return extension || 'unknown'
  }

  const fileExtension = getFileExtension(image.url)

  // Get badge color based on file type
  const getBadgeVariant = (extension: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (extension) {
      case 'webp':
        return 'default'
      case 'png':
        return 'secondary'
      case 'jpg':
      case 'jpeg':
        return 'outline'
      case 'gif':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const handleSelectClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent event bubbling to the card
    if (onSelect) {
      onSelect(image.url)
    }
  }

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(image.url)
    }
  }

  return (
    <Card className="relative group cursor-pointer overflow-hidden">
      <CardContent className="p-0 aspect-square flex items-center justify-center" onClick={handleCardClick}>
        <Image
          src={image.url || "/placeholder.svg"}
          alt={image.title || "Gallery Image"}
          width={200}
          height={200}
          className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-105"
          loading="lazy" // Enable lazy loading
        />
        
        {/* Image type badge */}
        <Badge 
          variant={getBadgeVariant(fileExtension)}
          className="absolute top-2 left-2 text-xs font-mono backdrop-blur-sm bg-black/70 border border-white/30 shadow-lg text-white font-semibold"
        >
          {fileExtension.toUpperCase()}
        </Badge>
      </CardContent>
      {onSelect && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSelectClick}
            className="pointer-events-auto" // Re-enable pointer events for the button
          >
            Select
          </Button>
        </div>
      )}
      <CardFooter className="p-2 flex flex-col items-start gap-1">
        <h3 className="text-sm font-medium truncate w-full">{image.title || "Untitled"}</h3>
        {image.tags && image.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {image.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
            onClick={(e) => e.stopPropagation()} // Prevent selecting image when clicking delete
          >
            <Trash2Icon className="h-3 w-3" />
            <span className="sr-only">Delete image</span>
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the image metadata from the database and the
              file from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(image.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
