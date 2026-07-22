"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Play, Sparkles } from "lucide-react";
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
    modes,
    isProcessing,
    setProcessing,
    setProgress,
    setMilestones,
    resetMilestones,
    setLayers,
    clearImages,
  } = useStudioStore();
  const upsertProject = useProjectStore((s) => s.upsertProject);

  async function startProcessing() {
    if (!images.length) {
      toast.error("Add at least one product image to begin.");
      return;
    }

    resetMilestones();
    setProcessing(true);

    try {
      const result = await runVectorizationPipeline({
        modes,
        onMilestone: (milestones, progress) => {
          setMilestones(milestones);
          setProgress(progress);
        },
      });

      const projectId = `proj-${Date.now()}`;
      const project: Project = {
        id: projectId,
        name: images[0]?.file.name.replace(/\.[^.]+$/, "") || "Untitled Cleat Scan",
        status: "completed",
        folderId: "folder-cleats",
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
      };

      setLayers(result.layers);
      upsertProject(project);
      toast.success("Vectorization complete");
      clearImages();
      router.push(`/studio/${projectId}`);
    } catch {
      toast.error("Vectorization failed. Try again.");
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
            <Sparkles className="h-3.5 w-3.5" />
            The Studio
          </motion.p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Upload & process
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Drop high-res footwear scans, choose geometry or detail extraction, and generate
            multi-layer SVG paths with live progress feedback.
          </p>
        </div>
        <Button onClick={startProcessing} disabled={isProcessing || !images.length} size="lg">
          <Play className="h-4 w-4" />
          {isProcessing ? "Processing…" : "Start vectorization"}
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
