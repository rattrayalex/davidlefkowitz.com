import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";

interface MediaCacheUploaderProps {
  maxFileSize?: number;
  onComplete?: () => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * A file upload component that uploads directly to object storage media-cache
 * Only asks for photo credit information
 */
export function MediaCacheUploader({
  maxFileSize = 13631488, // 13MB default
  onComplete,
  buttonClassName,
  children,
}: MediaCacheUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [photoCredits, setPhotoCredits] = useState("");

  const resetForm = () => {
    setSelectedFile(null);
    setPhotoCredits("");
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > maxFileSize) {
        alert(`File too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`);
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('photoCredits', photoCredits);

      const response = await fetch('/api/media-cache/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to upload file');
      }
      
      const result = await response.json();
      console.log('File uploaded successfully:', result.filename);

      onComplete?.();
      resetForm();
      setShowModal(false);
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button className={buttonClassName}>
          {children}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
          <DialogDescription>
            Add a new image to media cache
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Selection */}
          <div>
            <Label htmlFor="file-upload">Select Image</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="mx-auto h-32 w-auto object-contain"
                    />
                    <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="absolute -top-2 -right-2"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>Upload a file</span>
                        <Input
                          id="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to {Math.round(maxFileSize / 1024 / 1024)}MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {selectedFile && (
            <>
              {/* Photo Credits */}
              <div>
                <Label htmlFor="photo-credits">Photo Credits</Label>
                <Input
                  id="photo-credits"
                  value={photoCredits}
                  onChange={(e) => setPhotoCredits(e.target.value)}
                  placeholder="Photo credit information (optional)"
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Upload Image'
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}