"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/lib/components/ui/button"
import { ScrollArea } from "@/lib/components/ui/scroll-area"
import { Card } from "@/lib/components/ui/card"
import { Input } from "@/lib/components/ui/input"
import { ImageIcon, UploadIcon, Loader2Icon, FileTextIcon, XIcon, SearchIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { getImages, uploadImage, deleteImage, searchImages } from "@/lib/actions"
import { GalleryImageCard } from "@/components/gallery-image-card"
import { ImageUploadZone } from "@/components/image-upload-zone"

interface ImageItem {
  id: string
  path: string
  title: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  url: string
}

interface ImageGalleryContentProps {
  onSelect?: (url: string) => void // Optional prop for when used in a dialog
}

const IMAGES_PER_PAGE = 20 // Define how many images to fetch per page
const SEARCH_DEBOUNCE_DELAY = 500 // 500ms debounce delay for search

export function ImageGalleryContent({ onSelect }: ImageGalleryContentProps) {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]) // State for files staged for upload
  const { toast } = useToast()

  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ImageItem[]>([])
  const [searchPage, setSearchPage] = useState(0)
  const [hasMoreSearch, setHasMoreSearch] = useState(true)

  // Debounce timer ref
  const searchDebounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastImageElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (loading || isSearching) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && (debouncedSearchQuery ? hasMoreSearch : hasMore)) {
          if (debouncedSearchQuery) {
            setSearchPage((prevPage) => prevPage + 1)
          } else {
            setPage((prevPage) => prevPage + 1)
          }
        }
      })

      if (node) observer.current.observe(node)
    },
    [loading, isSearching, hasMore, hasMoreSearch, debouncedSearchQuery],
  )

  // Debounce effect for search query
  useEffect(() => {
    if (searchDebounceTimerRef.current) {
      clearTimeout(searchDebounceTimerRef.current)
    }

    searchDebounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, SEARCH_DEBOUNCE_DELAY)

    return () => {
      if (searchDebounceTimerRef.current) {
        clearTimeout(searchDebounceTimerRef.current)
      }
    }
  }, [searchQuery])

  const fetchImages = useCallback(
    async (currentPage: number, reset = false) => {
      setLoading(true)
      const {
        images: fetchedImages,
        error,
        count,
      } = await getImages({
        limit: IMAGES_PER_PAGE,
        offset: currentPage * IMAGES_PER_PAGE,
      })

      if (error) {
        toast({
          title: "Error fetching images",
          description: error,
          variant: "destructive",
        })
        setHasMore(false)
      } else {
        setImages((prevImages) => (reset ? fetchedImages : [...prevImages, ...fetchedImages]))
        setTotalCount(count)
        setHasMore(fetchedImages.length === IMAGES_PER_PAGE)
      }
      setLoading(false)
    },
    [toast],
  )

  const fetchSearchResults = useCallback(
    async (query: string, currentPage: number, reset = false) => {
      setIsSearching(true)
      const {
        images: fetchedImages,
        error,
        count,
      } = await searchImages({
        query,
        limit: IMAGES_PER_PAGE,
        offset: currentPage * IMAGES_PER_PAGE,
      })

      if (error) {
        toast({
          title: "Error searching images",
          description: error,
          variant: "destructive",
        })
        setHasMoreSearch(false)
      } else {
        setSearchResults((prevImages) => (reset ? fetchedImages : [...prevImages, ...fetchedImages]))
        setHasMoreSearch(fetchedImages.length === IMAGES_PER_PAGE)
      }
      setIsSearching(false)
    },
    [toast],
  )

  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.trim()) {
      // Reset search state and fetch results
      setSearchPage(0)
      setSearchResults([])
      setHasMoreSearch(true)
      fetchSearchResults(query, 0, true)
    } else {
      // Clear search and show all images
      setSearchResults([])
      setSearchPage(0)
      setHasMoreSearch(true)
      setPage(0)
      setImages([])
      setHasMore(true)
      setTotalCount(null)
      fetchImages(0, true)
    }
  }

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event bubbling to parent form
  }

  // Handle search input keydown
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault() // Prevent form submission
      e.stopPropagation() // Stop event bubbling to parent form
    }
  }

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults(searchQuery, searchPage)
    } else {
      fetchImages(page)
    }
  }, [page, searchPage, searchQuery, fetchImages, fetchSearchResults])

  // Debug: Log when component mounts to see if it's causing network requests
  useEffect(() => {
    console.log('ImageGalleryContent mounted')
  }, [])

  const handleFilesSelected = useCallback((files: File[]) => {
    setFilesToUpload(files)
  }, [])

  const handleRemoveFile = useCallback((indexToRemove: number) => {
    setFilesToUpload((prev) => prev.filter((_, index) => index !== indexToRemove))
  }, [])

  const handleUpload = async () => {
    if (filesToUpload.length === 0) {
      toast({
        title: "No files selected",
        description: "Please choose images to upload.",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    const uploadResults = []
    
    for (const file of filesToUpload) {
      try {
        const formData = new FormData()
        formData.append("file", file)
        // Optionally, you can add a default title or tags here if needed
        // formData.append("title", file.name.split(".")[0]);

        const result = await uploadImage(formData)
        if (result.url) {
          toast({
            title: "Upload successful",
            description: `Image "${file.name}" uploaded!`,
          })
          uploadResults.push({ success: true, file })
        } else {
          // Handle specific error types
          let errorMessage = "Unknown error occurred"
          if (result.error) {
            if (typeof result.error === "string") {
              errorMessage = result.error
            } else if (result.error.message) {
              errorMessage = result.error.message
            }
          }
          
          toast({
            title: "Upload failed",
            description: `Failed to upload "${file.name}": ${errorMessage}`,
            variant: "destructive",
          })
          uploadResults.push({ success: false, file, error: errorMessage })
        }
      } catch (error: any) {
        // Handle network errors or other unexpected errors
        let errorMessage = "Network error or unexpected error occurred"
        if (error.message) {
          errorMessage = error.message
        }
        
        toast({
          title: "Upload failed",
          description: `Failed to upload "${file.name}": ${errorMessage}`,
          variant: "destructive",
        })
        uploadResults.push({ success: false, file, error: errorMessage })
      }
    }

    // Only refresh the gallery if at least one upload was successful
    const successfulUploads = uploadResults.filter(result => result.success)
    if (successfulUploads.length > 0) {
      setFilesToUpload([]) // Clear staged files
      // Reset pagination and re-fetch from scratch to show new images at top
      setPage(0)
      setImages([])
      setHasMore(true)
      setTotalCount(null)
      fetchImages(0, true)
    }
    
    setUploading(false)
  }

  const handleDelete = async (id: string) => {
    setLoading(true) // Indicate loading while deleting
    const result = await deleteImage(id) // Pass the DB record ID
    if (result.error) {
      toast({
        title: "Deletion failed",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Image deleted",
        description: "Image removed successfully.",
      })
      // Re-fetch current page to ensure correct items are displayed after deletion
      setPage(0) // Reset page to re-fetch from beginning
      setImages([]) // Clear current images
      setHasMore(true)
      setTotalCount(null)
      fetchImages(0, true)
    }
    setLoading(false)
  }

  // Determine which images to display
  const displayImages = searchQuery ? searchResults : images
  const displayLoading = searchQuery ? isSearching : loading
  const displayHasMore = searchQuery ? hasMoreSearch : hasMore

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <ImageUploadZone onFilesSelected={handleFilesSelected} disabled={uploading} />
        {filesToUpload.length > 0 && (
          <div className="mt-4 rounded-md border bg-muted p-3">
            <h4 className="mb-2 text-sm font-medium">Files to Upload:</h4>
            <ul className="space-y-1 text-sm">
              {filesToUpload.map((file, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileTextIcon className="h-4 w-4 text-muted-foreground" />
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => handleRemoveFile(index)}
                    disabled={uploading}
                  >
                    <XIcon className="h-3 w-3" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </li>
              ))}
            </ul>
            <Button onClick={handleUpload} disabled={uploading} className="mt-3 w-full">
              {uploading ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Uploading {filesToUpload.length} file(s)...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-2 h-4 w-4" /> Upload {filesToUpload.length} file(s)
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <form onSubmit={handleSearchSubmit} className="relative" onClick={(e) => e.stopPropagation()}>
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search images by title or tags..."
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                setSearchQuery("")
              }}
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </form>
      </div>

      <div className="mb-4 text-sm text-muted-foreground">
        {searchQuery ? (
          `Found ${searchResults.length} images for "${searchQuery}"`
        ) : (
          totalCount !== null ? `Showing ${images.length} of ${totalCount} images` : "Loading image count..."
        )}
      </div>
      <ScrollArea className="flex-1 pr-4">
        {displayImages.length === 0 && displayLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: IMAGES_PER_PAGE }).map((_, i) => (
              <Card key={i} className="aspect-square flex items-center justify-center bg-muted animate-pulse">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </Card>
            ))}
          </div>
        ) : displayImages.length === 0 && !displayLoading ? (
          <div className="text-center text-muted-foreground py-8">
            {searchQuery ? "No images found matching your search." : "No images found. Upload some!"}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayImages.map((image, index) => {
              const isLastImage = displayImages.length === index + 1 && displayHasMore
              return (
                <div key={`${searchQuery ? 'search' : 'gallery'}-${image.id}-${index}`} ref={isLastImage ? lastImageElementRef : null}>
                  <GalleryImageCard image={image} onSelect={onSelect} onDelete={handleDelete} />
                </div>
              )
            })}
          </div>
        )}
        {displayLoading && displayImages.length > 0 && displayHasMore && (
          <div className="flex justify-center items-center py-4">
            <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        {!displayHasMore && displayImages.length > 0 && (
          <div className="text-center text-muted-foreground py-4">
            {searchQuery ? "No more search results." : "You've reached the end of the gallery."}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
