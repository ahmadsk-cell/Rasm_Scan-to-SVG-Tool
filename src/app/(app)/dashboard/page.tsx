"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const FILTERS: Array<{ id: ProjectStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "draft", label: "Draft" },
];

export default function DashboardPage() {
  const { statusFilter, searchQuery, setStatusFilter, setSearchQuery, filteredProjects } =
    useProjectStore();
  const projects = filteredProjects();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-border px-4">
        <p className="panel-label">Library</p>
        <Button asChild size="sm">
          <Link href="/studio">
            <Plus className="h-3.5 w-3.5" />
            New trace
          </Link>
        </Button>
      </header>

      <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-2">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={cn(
                "h-7 rounded-md px-2.5 text-xs",
                statusFilter === filter.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-stage p-4">
        {projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
