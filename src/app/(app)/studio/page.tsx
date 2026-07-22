"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, PenTool } from "lucide-react";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/studio/upload-dropzone";
import { AnalysisConfig } from "@/components/studio/analysis-config";
import { ProcessingProgress } from "@/components/studio/processing-progress";
import { Button } from "@/components/ui/button";
import { runVectorizationPipeline } from "@/lib/vector-engine";
import { useStudioStore } from "@/store/studio-store";
import { useProjectStore } from "@/store/project-store";
import type { Project } from "@/types";

export default function StudioPage() {
  const router = useRouter();
  const {
    images,
    batchIntent,
    modes,
    isProcessing,
    setProcessing,
    setProgress,
    setMilestones,
    resetMilestones,
    setLayers,
    clearImages,
    setCanvasSize,
  } = useStudioStore();
  const upsertProject = useProjectStore((s) => s.upsertProject);

  async function startProcessing() {
    if (!images.length) {
      toast.error("Add at least one image to begin.");
      return;
    }

    resetMilestones();
    setProcessing(true);

    try {
      const result = await runVectorizationPipeline({
        modes,
        intent: batchIntent,
        sources: images.map((img) => ({
          id: img.id,
          label: img.label,
          description: img.description,
          previewUrl: img.previewUrl,
          file: img.file,
        })),
        onMilestone: (milestones, progress) => {
          setMilestones(milestones);
          setProgress(progress);
        },
      });

      const projectId = `proj-${Date.now()}`;
      const baseName =
        images.length > 1
          ? `Batch · ${images.length} images`
          : images[0]?.file.name.replace(/\.[^.]+$/, "") || "Untitled vector";

      const project: Project = {
        id: projectId,
        name: batchIntent.trim()
          ? `${baseName} — ${batchIntent.trim().slice(0, 40)}`
          : baseName,
        status: "completed",
        folderId: "folder-recent",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: images.map((img) => img.label),
        layers: result.layers,
        analysisModes: modes,
        tuning: {
          curveSmoothing: 45,
          noiseReduction: 30,
          pathSimplification: 20,
        },
        imageUrl: images[0]?.previewUrl,
        svgPreview: result.svg,
        intent: batchIntent.trim() || undefined,
        width: result.width,
        height: result.height,
      };

      setCanvasSize(result.width, result.height);
      setLayers(result.layers);
      upsertProject(project);
      toast.success(
        images.length > 1
          ? `Traced ${images.length} images · ${result.layers.length} layers`
          : `Traced · ${result.layers.length} layers`
      );
      clearImages();
      router.push(`/studio/${projectId}`);
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Vectorization failed. Try again."
      );
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary"
          >
            <PenTool className="h-3.5 w-3.5" />
            The Studio
          </motion.p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Bulk upload & process
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Drop any images and Rasm will trace them into real editable SVG layers in your
            browser.
          </p>
        </div>
        <Button onClick={startProcessing} disabled={isProcessing || !images.length} size="lg">
          <Play className="h-4 w-4" />
          {isProcessing
            ? "Tracing…"
            : images.length > 1
              ? `Trace ${images.length} images`
              : "Start vectorization"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <UploadDropzone />
          <ProcessingProgress />
        </div>
        <AnalysisConfig />
      </div>
    </div>
  );
}
