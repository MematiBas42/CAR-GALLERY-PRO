"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { generateThumbHashFromFile } from "@/lib/thumbhash-client";
import { createPngDataUri } from "unlazy/thumbhash";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface SimpleImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export const SimpleImageUploader = ({ value, onChange, className }: SimpleImageUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
        // Generate blurhash/preview immediately
        const hash = await generateThumbHashFromFile(file);
        const base64 = createPngDataUri(hash);
        setPreview(base64); // Show blurhash initially

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/images/single-upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Upload failed");
        }

        const data = await response.json();
        
        if (data.url) {
             setPreview(data.url);
             onChange(data.url);
             toast.success("Image uploaded successfully");
        } else {
            throw new Error("No URL returned from server");
        }

    } catch (error) {
        console.error("Error processing file:", error);
        toast.error(error instanceof Error ? error.message : "Upload failed");
        setPreview(null);
    } finally {
        setIsUploading(false);
    }
  }, [onChange]);

  const handleRemove = () => {
    setPreview(null);
    onChange("");
  };

  return (
    <div className={cn("w-full", className)}>
      {preview ? (
        <div className="relative aspect-video w-full rounded-md border overflow-hidden bg-muted">
          <img
            src={preview}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {isUploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                 <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
          )}
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Click to upload logo</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
};