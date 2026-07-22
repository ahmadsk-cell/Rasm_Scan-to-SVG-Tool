"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useStudioStore } from "@/store/studio-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const VIEW_LABELS = ["Side view", "Top view", "Soleplate", "Medial", "Lateral", "Detail"];

export function UploadDropzone() {
  const { images, addImages, removeImage } = useStudioStore();

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
        label: VIEW_LABELS[(images.length + index) % VIEW_LABELS.length],
      }));

      addImages(next);
      toast.success(`${accepted.length} image${accepted.length > 1 ? "s" : ""} added to batch`);
    },
    [addImages, images.length]
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
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative cursor-pointer overflow-hidden rounded-2xl border border-dashed px-6 py-12 text-center transition-all",
          isDragActive
            ? "border-primary bg-primary/10 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]"
            : "border-border bg-card/40 hover:border-primary/50 hover:bg-card/70"
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.03 } : { scale: 1 }}
          className="mx-auto flex max-w-md flex-col items-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/30">
            <ImagePlus className="h-6 w-6" />
          </div>
          <p className="font-display text-lg font-semibold">
            {isDragActive ? "Release to upload" : "Drop cleat imagery here"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Batch upload side, top, and soleplate views. PNG, JPEG, or WebP up to 25MB.
          </p>
        </motion.div>
      </div>

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {images.map((image) => (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="group relative overflow-hidden rounded-xl border border-border bg-card"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt={image.label}
                  className="h-36 w-full object-cover"
                />
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{image.label}</p>
                    <p className="truncate text-xs text-muted-foreground">{image.file.name}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Remove image"
                    onClick={() => {
                      URL.revokeObjectURL(image.previewUrl);
                      removeImage(image.id);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
