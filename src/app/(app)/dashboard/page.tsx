"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Folder, Plus, Search } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { ProjectCard } from "@/components/dashboard/project-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const FILTERS: Array<{ id: ProjectStatus | "all"; label: string }> = [
  { id: "all", label: "All" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
  { id: "draft", label: "Draft" },
];

export default function DashboardPage() {
  const {
    folders,
    statusFilter,
    searchQuery,
    selectedFolderId,
    setStatusFilter,
    setSearchQuery,
    setSelectedFolderId,
    filteredProjects,
  } = useProjectStore();

  const projects = filteredProjects();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-5 py-9 sm:px-8">
      <div className="flex flex-col gap-5 border-b border-border/70 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary"
          >
            Workspace
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-[2.35rem] sm:leading-tight"
          >
            Projects
          </motion.h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Recent jobs and folders — open a card to refine layers and export.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-sm">
          <Link href="/studio">
            <Plus className="h-4 w-4" />
            New trace
          </Link>
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-2xl border border-border/80 bg-card/70 p-3.5 shadow-sm backdrop-blur-sm">
          <p className="px-2 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Folders
          </p>
          <button
            onClick={() => setSelectedFolderId(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
              !selectedFolderId
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Folder className="h-4 w-4" />
            All projects
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                selectedFolderId === folder.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Folder className="h-4 w-4" />
                {folder.name}
              </span>
              <span className="text-xs opacity-70">{folder.projectCount}</span>
            </button>
          ))}
        </aside>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects…"
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setStatusFilter(filter.id)}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    statusFilter === filter.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  )}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {projects.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {projects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
