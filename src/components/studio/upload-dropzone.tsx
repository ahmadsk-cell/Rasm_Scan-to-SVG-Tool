"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useStudioStore } from "@/store/studio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function UploadDropzone() {
  const { images, batchIntent, addImages, removeImage, setBatchIntent } = useStudioStore();

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (!accepted.length) {
        toast.error("Use PNG, JPEG, or WebP images under 25MB.");
        return;
      }

      const next = accepted.map((file, index) => ({
        id: `${file.name}-${Date.now()}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
        label: file.name.replace(/\.[^.]+$/, "") || "Image",
        description: "",
      }));

      addImages(next);
      toast.success(`${accepted.length} image${accepted.length > 1 ? "s" : ""} added`);
    },
    [addImages]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxSize: 25 * 1024 * 1024,
    multiple: true,
  });

  return (
    <div className="mx-auto flex h-full min-h-[420px] w-full max-w-5xl flex-col">
      <div
        {...getRootProps()}
        className={cn(
          "flex flex-1 cursor-pointer items-center justify-center border border-dashed transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-foreground/15 bg-black/20 hover:border-foreground/30"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex max-w-sm flex-col items-center px-6 text-center">
          <ImagePlus className="mb-3 h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-foreground">
            {isDragActive ? "Release to import" : "Drop images to trace"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, or WebP · 25MB</p>
        </div>
      </div>

      {images.length > 0 && (
        <div className="mt-4 space-y-3">
          <Input
            value={batchIntent}
            onChange={(e) => setBatchIntent(e.target.value)}
            placeholder="Project name"
            className="h-8 max-w-xs bg-card text-xs"
          />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative h-20 w-28 shrink-0 overflow-hidden border border-border bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.previewUrl} alt={image.label} className="h-full w-full object-contain" />
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-1 top-1 h-6 w-6 opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                  onClick={() => {
                    URL.revokeObjectURL(image.previewUrl);
                    removeImage(image.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
