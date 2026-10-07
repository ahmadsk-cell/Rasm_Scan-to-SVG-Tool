"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useProjectStore } from "@/store/project-store";
import { WorkspaceEditor } from "@/components/studio/workspace-editor";
import { Button } from "@/components/ui/button";

export default function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const project = useProjectStore((s) => s.getProject(projectId));

  if (!project) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="font-display text-2xl font-semibold">Project not found</h1>
        <p className="text-sm text-muted-foreground">
          This vectorization job may have been removed or is unavailable.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0">
      <WorkspaceEditor project={project} />
    </div>
  );
}
