"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/studio/upload-dropzone";
import { AnalysisConfig } from "@/components/studio/analysis-config";
import { ProcessingProgress } from "@/components/studio/processing-progress";
import { Button } from "@/components/ui/button";
import { runVectorizationPipeline, PATH_DETAIL_PRESETS } from "@/lib/vector-engine";
import { useStudioStore } from "@/store/studio-store";
import { useProjectStore } from "@/store/project-store";
import type { Project } from "@/types";

export default function StudioPage() {
  const router = useRouter();
  const {
    images,
    batchIntent,
    modes,
    pathDetail,
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
        pathDetail,
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
        pathDetail,
      };

      setCanvasSize(result.width, result.height);
      setLayers(result.layers);
      upsertProject(project);
      toast.success(
        `Traced · ${result.layers.length} layers (${PATH_DETAIL_PRESETS[pathDetail].label})`
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
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8">
      <div className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary"
          >
            Studio
          </motion.p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-[2.35rem] sm:leading-tight">
            Trace images into vectors
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Upload one or many files, set path detail, then export clean SVG layers. Use{" "}
            <span className="text-foreground/80">Simple</span> for scenery and photos.
          </p>
        </div>
        <Button
          onClick={startProcessing}
          disabled={isProcessing || !images.length}
          size="lg"
          className="min-w-[10.5rem] shadow-sm"
        >
          <Play className="h-4 w-4" />
          {isProcessing
            ? "Tracing…"
            : images.length > 1
              ? `Trace ${images.length}`
              : "Trace image"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="space-y-5">
          <UploadDropzone />
          <ProcessingProgress />
        </div>
        <AnalysisConfig />
      </div>
    </div>
  );
}
