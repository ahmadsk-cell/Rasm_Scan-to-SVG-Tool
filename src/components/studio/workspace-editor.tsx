"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { useProjectStore } from "@/store/project-store";
import type { Project } from "@/types";
import { SplitView } from "@/components/studio/split-view";
import { LayerPanel } from "@/components/studio/layer-panel";
import { ExportModal } from "@/components/studio/export-modal";
import { Button } from "@/components/ui/button";

export function WorkspaceEditor({ project }: { project: Project }) {
  const { setLayers, setTuning, setActiveProjectId, layers, setCanvasSize, activeProjectId } =
    useStudioStore();
  const upsertProject = useProjectStore((s) => s.upsertProject);
  const projectRef = useRef(project);
  const skipSync = useRef(true);
  projectRef.current = project;

  useEffect(() => {
    skipSync.current = true;
    const current = projectRef.current;
    setActiveProjectId(current.id);
    setLayers(current.layers);
    setTuning(current.tuning);
    setCanvasSize(current.width ?? 480, current.height ?? 320);
  }, [project.id, setActiveProjectId, setLayers, setTuning, setCanvasSize]);

  useEffect(() => {
    if (activeProjectId !== projectRef.current.id) return;
    if (skipSync.current) {
      skipSync.current = false;
      return;
    }
    const current = projectRef.current;
    upsertProject({
      ...current,
      layers,
      updatedAt: new Date().toISOString(),
    });
  }, [layers, activeProjectId, upsertProject]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 shrink-0 items-center gap-3 border-b border-border px-3">
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard">
            <ArrowLeft className="h-3.5 w-3.5" />
            Library
          </Link>
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="min-w-0 truncate text-sm font-medium">{project.name}</h1>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {layers.length} layer{layers.length === 1 ? "" : "s"}
          {project.pathDetail ? ` · ${project.pathDetail}` : ""}
        </span>
        <div className="ml-auto">
          <ExportModal width={project.width} height={project.height} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1">
          <SplitView imageUrl={project.imageUrl} width={project.width} height={project.height} />
        </div>
        <LayerPanel />
      </div>
    </div>
  );
}
