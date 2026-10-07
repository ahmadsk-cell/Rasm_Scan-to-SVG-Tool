"use client";

import Link from "next/link";
import type { Project } from "@/types";
import { formatRelativeDate } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project; index: number }) {
  const width = project.width ?? 480;
  const height = project.height ?? 320;

  return (
    <Link
      href={`/studio/${project.id}`}
      className="group block overflow-hidden border border-border bg-card transition-colors hover:border-foreground/30"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#1a1a1a]">
        <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 h-full w-full bg-white">
          {project.layers
            .filter((layer) => layer.visible)
            .slice(0, 8)
            .map((layer) => (
              <path
                key={layer.id}
                d={layer.pathData}
                fill={layer.filled ? layer.color : "none"}
                stroke={layer.color}
                strokeWidth="1.25"
              />
            ))}
        </svg>
      </div>
      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
        <p className="truncate text-xs text-foreground">{project.name}</p>
        <p className="shrink-0 text-[10px] text-muted-foreground">
          {formatRelativeDate(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}
