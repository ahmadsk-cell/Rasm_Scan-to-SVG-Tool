"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Layers3, Clock3 } from "lucide-react";
import type { Project } from "@/types";
import { formatRelativeDate } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      <Link href={`/studio/${project.id}`}>
        <Card className="group overflow-hidden border-border/80 bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
          <div className="relative h-36 overflow-hidden border-b border-border/70 bg-muted/30 grid-dots">
            <svg viewBox="0 0 480 320" className="absolute inset-0 h-full w-full p-4 opacity-85">
              {project.layers
                .filter((l) => l.visible)
                .slice(0, 5)
                .map((layer) => (
                  <path
                    key={layer.id}
                    d={layer.pathData}
                    fill={layer.filled ? layer.color : "none"}
                    fillOpacity={layer.filled ? 0.35 : undefined}
                    stroke={layer.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-opacity group-hover:opacity-100"
                  />
                ))}
              {project.layers.length === 0 && (
                <text
                  x="240"
                  y="165"
                  textAnchor="middle"
                  className="fill-muted-foreground text-[18px]"
                >
                  Awaiting vectors
                </text>
              )}
            </svg>
          </div>
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="line-clamp-2 text-base">{project.name}</CardTitle>
              <StatusBadge status={project.status} />
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Layers3 className="h-3.5 w-3.5" />
              {project.layers.length} layers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {formatRelativeDate(project.updatedAt)}
            </span>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
