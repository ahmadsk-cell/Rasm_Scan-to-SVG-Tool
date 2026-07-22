"use client";

import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ProcessingProgress() {
  const { isProcessing, progress, milestones } = useStudioStore();

  if (!isProcessing) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold">Vectorizing batch</p>
          <p className="text-sm text-muted-foreground">
            Edge detection → contour tracing → bezier optimization
          </p>
        </div>
        <span className="font-mono text-sm text-primary">{progress}%</span>
      </div>

      <Progress value={progress} className="mb-5" />

      <ul className="space-y-2.5">
        {milestones.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
              step.status === "active" && "bg-primary/10 text-primary",
              step.status === "done" && "text-muted-foreground",
              step.status === "pending" && "text-muted-foreground/60"
            )}
          >
            {step.status === "done" ? (
              <Check className="h-4 w-4 text-primary" />
            ) : step.status === "active" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="h-4 w-4 rounded-full border border-border" />
            )}
            {step.label}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
