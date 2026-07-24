"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useStudioStore } from "@/store/studio-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const VIEW_LABELS = ["Front", "Side", "Detail", "Crop", "Reference", "Variant"];

export function UploadDropzone() {
  const {
    images,
    batchIntent,
    addImages,
    removeImage,
    updateImage,
    setBatchIntent,
  } = useStudioStore();

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
        description: "",
      }));

      addImages(next);
      toast.success(
        `${accepted.length} image${accepted.length > 1 ? "s" : ""} added to batch`
      );
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
            ? "border-primary bg-primary/8"
            : "border-border/90 bg-card/50 hover:border-primary/40 hover:bg-card/80"
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { scale: 1.015 } : { scale: 1 }}
          className="mx-auto flex max-w-md flex-col items-center"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <ImagePlus className="h-5 w-5" />
          </div>
          <p className="font-display text-lg font-semibold tracking-tight">
            {isDragActive ? "Release to upload" : "Drop images to vectorize"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Logos, sketches, photos, icons — bulk upload supported. PNG, JPEG, or WebP up to
            25MB each.
          </p>
        </motion.div>
      </div>

      {images.length > 0 && (
        <div className="space-y-2 rounded-xl border border-border bg-card p-4">
          <Label htmlFor="batch-intent">What are you looking for?</Label>
          <Textarea
            id="batch-intent"
            value={batchIntent}
            onChange={(e) => setBatchIntent(e.target.value)}
            placeholder="e.g. Clean outer silhouette, logo mark, and internal line work"
            className="min-h-[72px] resize-y"
          />
          <p className="text-[11px] text-muted-foreground">
            Applies to the whole batch. Optionally refine each image below.
          </p>
        </div>
      )}

      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">
                Batch queue · {images.length} image{images.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {images.map((image) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="overflow-hidden rounded-xl border border-border bg-card"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.previewUrl}
                    alt={image.label}
                    className="h-32 w-full object-cover"
                  />
                  <div className="space-y-2 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <Label htmlFor={`label-${image.id}`} className="text-xs">
                          Label
                        </Label>
                        <Input
                          id={`label-${image.id}`}
                          value={image.label}
                          onChange={(e) =>
                            updateImage(image.id, { label: e.target.value })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="mt-5 shrink-0"
                        aria-label="Remove image"
                        onClick={() => {
                          URL.revokeObjectURL(image.previewUrl);
                          removeImage(image.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`desc-${image.id}`} className="text-xs">
                        Extract from this image
                      </Label>
                      <Textarea
                        id={`desc-${image.id}`}
                        value={image.description}
                        onChange={(e) =>
                          updateImage(image.id, { description: e.target.value })
                        }
                        placeholder="Optional — e.g. just the icon, ignore background text"
                        className="min-h-[56px] resize-y text-sm"
                      />
                    </div>
                    <p className="truncate text-[11px] text-muted-foreground">
                      {image.file.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
