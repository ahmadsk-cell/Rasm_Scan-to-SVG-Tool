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
    <div className="mx-auto max-w-[1600px] space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2">
            <StatusBadge status={project.status} />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive vector workspace · {layers.length} editable layers
            {project.intent ? ` · “${project.intent}”` : ""}
          </p>
        </div>
        <ExportModal width={project.width} height={project.height} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_280px]">
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
