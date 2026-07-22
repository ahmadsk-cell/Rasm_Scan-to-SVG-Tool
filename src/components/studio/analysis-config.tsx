"use client";

import { Box, ScanSearch, Info } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AnalysisConfig() {
  const { modes, toggleMode } = useStudioStore();

  return (
    <aside className="glass-panel space-y-5 rounded-xl p-5">
      <div>
        <h2 className="font-display text-lg font-semibold">Extraction</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose what to pull from your batch before tracing.
        </p>
      </div>

      <Separator />

      <div
        className={cn(
          "rounded-lg border p-4 transition-colors",
          modes.includes("geometry")
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-muted/20"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-md bg-muted p-2 text-primary">
              <Box className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor="geometry-mode" className="text-sm font-semibold">
                Geometry Mode
              </Label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Classical contour tracing — outer silhouettes without needing AI. Works from
                edges and contrast alone on any image.
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
          "rounded-lg border p-4 transition-colors",
          modes.includes("detail")
            ? "border-primary/40 bg-primary/5"
            : "border-border bg-muted/20"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-md bg-muted p-2 text-primary">
              <ScanSearch className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor="detail-mode" className="text-sm font-semibold">
                Detail Extraction
              </Label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Logos, line work, and internal shapes. Text prompts help when a vision model is
                connected; classical CV alone cannot understand “find the logo.”
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

      <div className="flex gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          <span className="font-medium text-foreground">Live tracing: </span>
          Rasm vectorizes in your browser with color quantization + path tracing (ImageTracer).
          Geometry uses fewer colors for cleaner silhouettes; Detail keeps more layers. Text
          prompts label targets — true semantic “find X” still needs a vision model later.
        </p>
      </div>
    </aside>
  );
}
