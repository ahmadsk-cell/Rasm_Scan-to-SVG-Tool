"use client";

import { Box, ScanSearch } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AnalysisConfig() {
  const { modes, toggleMode } = useStudioStore();

  return (
    <aside className="glass-panel space-y-5 rounded-2xl p-5">
      <div>
        <h2 className="font-display text-lg font-semibold">AI analysis</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure extraction before processing your batch.
        </p>
      </div>

      <Separator />

      <div
        className={cn(
          "rounded-xl border p-4 transition-colors",
          modes.includes("geometry")
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-muted/20"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-lg bg-primary/15 p-2 text-primary">
              <Box className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor="geometry-mode" className="text-sm font-semibold">
                Geometry Mode
              </Label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Isolate outer silhouettes — soleplate and upper profiles — while preserving aspect
                ratio and scale coordinates.
              </p>
            </div>
          </div>
          <Switch
            id="geometry-mode"
            checked={modes.includes("geometry")}
            onCheckedChange={() => toggleMode("geometry")}
          />
        </div>
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 transition-colors",
          modes.includes("detail")
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-muted/20"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-lg bg-cyan-500/15 p-2 text-cyan-400">
              <ScanSearch className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor="detail-mode" className="text-sm font-semibold">
                Detail Extraction
              </Label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Detect logos, stitching patterns, and panel breaks into separate editable SVG
                sub-layers.
              </p>
            </div>
          </div>
          <Switch
            id="detail-mode"
            checked={modes.includes("detail")}
            onCheckedChange={() => toggleMode("detail")}
          />
        </div>
      </div>
    </aside>
  );
}
