"use client";

import { Check, Loader2 } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProcessingProgress() {
  const { isProcessing, progress, milestones } = useStudioStore();
  const active = milestones.find((step) => step.status === "active");

  if (!isProcessing) return null;

  return (
    <div className="shrink-0 border-t border-border bg-card px-4 py-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-xs text-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
          {active?.label ?? "Tracing…"}
        </p>
        <span className="font-mono text-[11px] text-muted-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-1" />
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {milestones.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-1.5 text-[11px]",
              step.status === "active" && "text-foreground",
              step.status === "done" && "text-muted-foreground",
              step.status === "pending" && "text-muted-foreground/50"
            )}
          >
            {step.status === "done" ? <Check className="h-3 w-3" /> : null}
            {step.label.replace("…", "")}
          </li>
        ))}
      </ul>
    </div>
  );
}
