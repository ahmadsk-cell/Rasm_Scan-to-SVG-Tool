"use client";

import { Box, ScanSearch, Gauge } from "lucide-react";
import { useStudioStore } from "@/store/studio-store";
import { PATH_DETAIL_PRESETS } from "@/lib/trace-image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { PathDetailLevel } from "@/types";

const DETAIL_ORDER: PathDetailLevel[] = ["simple", "balanced", "detailed", "maximum"];

export function AnalysisConfig() {
  const { modes, toggleMode, pathDetail, setPathDetail } = useStudioStore();
  const activePreset = PATH_DETAIL_PRESETS[pathDetail];

  return (
    <aside className="space-y-5 rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-sm">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Controls
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold tracking-tight">Trace setup</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tune fidelity before you run — lower detail is faster on photos.
        </p>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">Path detail</Label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DETAIL_ORDER.map((level) => {
            const preset = PATH_DETAIL_PRESETS[level];
            const active = pathDetail === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => setPathDetail(level)}
                className={cn(
                  "rounded-xl border px-3 py-2.5 text-left transition-all",
                  active
                    ? "border-primary/50 bg-primary/10 shadow-sm"
                    : "border-border/80 bg-muted/20 hover:border-border hover:bg-muted/40"
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {preset.label}
                </p>
              </button>
            );
          })}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{activePreset.hint}</p>
        {pathDetail === "maximum" && (
          <p className="text-xs text-amber-600 dark:text-amber-400/90">
            Maximum can be slow on scenic photos — try Simple or Balanced first.
          </p>
        )}
      </div>

      <Separator />

      <div
        className={cn(
          "rounded-xl border p-4 transition-colors",
          modes.includes("geometry")
            ? "border-primary/35 bg-primary/5"
            : "border-border/80 bg-muted/15"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-lg bg-background/80 p-2 text-primary ring-1 ring-border/60">
              <Box className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor="geometry-mode" className="text-sm font-semibold">
                Geometry
              </Label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Prefer outer silhouettes and fewer color regions.
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
            ? "border-primary/35 bg-primary/5"
            : "border-border/80 bg-muted/15"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex gap-3">
            <div className="mt-0.5 rounded-lg bg-background/80 p-2 text-primary ring-1 ring-border/60">
              <ScanSearch className="h-4 w-4" />
            </div>
            <div>
              <Label htmlFor="detail-mode" className="text-sm font-semibold">
                Internal detail
              </Label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Keep more interior shapes and color breaks.
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
