import { ImageGalleryContent } from "@/components/image-gallery-content"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/lib/components/ui/card"

export default function GalleryPage() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Image Gallery</CardTitle>
        <CardDescription>Manage and select images for your blog.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <ImageGalleryContent />
      </CardContent>
    </Card>
  )
}
