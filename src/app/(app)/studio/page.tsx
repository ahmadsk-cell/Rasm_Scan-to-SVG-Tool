"use client";

import { useRouter } from "next/navigation";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/studio/upload-dropzone";
import { AnalysisConfig } from "@/components/studio/analysis-config";
import { ProcessingProgress } from "@/components/studio/processing-progress";
import { Button } from "@/components/ui/button";
import { runVectorizationPipeline, PATH_DETAIL_PRESETS } from "@/lib/vector-engine";
import { fileToPreviewDataUrl } from "@/lib/raster-preview";
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
    removeBackground,
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
      const sources = await Promise.all(
        images.map(async (img) => ({
          id: img.id,
          label: img.label,
          description: img.description,
          previewUrl: img.previewUrl,
          file: img.file,
          storedPreview: await fileToPreviewDataUrl(img.file),
        }))
      );

      const created: Project[] = [];

      for (let i = 0; i < sources.length; i++) {
        const source = sources[i];
        const result = await runVectorizationPipeline({
          modes,
          pathDetail,
          removeBackground,
          intent: batchIntent,
          sources: [source],
          onMilestone: (milestones, progress) => {
            const span = 100 / sources.length;
            setMilestones(milestones);
            setProgress(Math.round(i * span + (progress / 100) * span));
          },
        });

        const baseName = source.file?.name.replace(/\.[^.]+$/, "") || source.label || "Untitled";
        const note = batchIntent.trim();
        const project: Project = {
          id: `proj-${Date.now()}-${i}`,
          name: note && sources.length === 1 ? note : baseName,
          status: "completed",
          folderId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          views: [source.label],
          layers: result.layers,
          analysisModes: modes,
          tuning: {
            curveSmoothing: 45,
            noiseReduction: 30,
            pathSimplification: 20,
          },
          imageUrl: source.storedPreview,
          width: result.width,
          height: result.height,
          pathDetail,
        };
        created.push(project);
        upsertProject(project);
      }

      const first = created[0];
      setCanvasSize(first.width ?? 480, first.height ?? 320);
      setLayers(first.layers);
      toast.success(
        created.length > 1
          ? `Traced ${created.length} images (${PATH_DETAIL_PRESETS[pathDetail].label})`
          : `Traced ${first.layers.length} layers (${PATH_DETAIL_PRESETS[pathDetail].label})`
      );
      clearImages();
      router.push(`/studio/${first.id}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Vectorization failed. Try again.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col lg:flex-row">
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
          <p className="panel-label">Studio</p>
          <Button onClick={startProcessing} disabled={isProcessing || !images.length}>
            <Play className="h-3.5 w-3.5" />
            {isProcessing ? "Tracing…" : images.length > 1 ? `Trace ${images.length}` : "Trace"}
          </Button>
        </header>
        <div className="flex min-h-0 flex-1 flex-col bg-stage">
          <div className="min-h-0 flex-1 overflow-auto p-6">
            <UploadDropzone />
          </div>
          <ProcessingProgress />
        </div>
      </div>
      <AnalysisConfig />
    </div>
  );
}
