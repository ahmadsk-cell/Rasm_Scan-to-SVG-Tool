"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/store/studio-store";
import type { Project } from "@/types";
import { SplitView } from "@/components/studio/split-view";
import { LayerPanel } from "@/components/studio/layer-panel";
import { VectorControls } from "@/components/studio/vector-controls";
import { ExportModal } from "@/components/studio/export-modal";
import { StatusBadge } from "@/components/dashboard/status-badge";

export function WorkspaceEditor({ project }: { project: Project }) {
  const { setLayers, setTuning, setActiveProjectId, layers, setCanvasSize } = useStudioStore();

  useEffect(() => {
    setActiveProjectId(project.id);
    setLayers(project.layers);
    setTuning(project.tuning);
    setCanvasSize(project.width ?? 480, project.height ?? 320);
  }, [project, setActiveProjectId, setLayers, setTuning, setCanvasSize]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-5 py-8 sm:px-8">
      <div className="flex flex-col gap-4 border-b border-border/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={project.status} />
            {project.pathDetail && (
              <span className="rounded-md border border-border/80 bg-muted/40 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {project.pathDetail}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[2rem] sm:leading-tight">
            {project.name}
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {layers.length} editable layers
            {project.intent ? ` · “${project.intent}”` : ""}
          </p>
        </div>
        <ExportModal width={project.width} height={project.height} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <SplitView
          imageUrl={project.imageUrl}
          width={project.width}
          height={project.height}
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 xl:content-start">
          <div className="min-h-[320px]">
            <LayerPanel />
          </div>
          <VectorControls />
        </div>
      </div>
    </div>
  );
}
