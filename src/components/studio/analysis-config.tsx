"use client";

import { useStudioStore } from "@/store/studio-store";
import { PATH_DETAIL_PRESETS } from "@/lib/trace-image";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PathDetailLevel } from "@/types";

const DETAIL_ORDER: PathDetailLevel[] = ["simple", "balanced", "detailed", "maximum"];

export function AnalysisConfig() {
  const { pathDetail, setPathDetail, removeBackground, setRemoveBackground } = useStudioStore();
  const activePreset = PATH_DETAIL_PRESETS[pathDetail];

  return (
    <aside className="flex w-full shrink-0 flex-col border-t border-border bg-card lg:w-72 lg:border-l lg:border-t-0">
      <div className="flex h-11 items-center border-b border-border px-4">
        <p className="panel-label">Develop</p>
      </div>

      <div className="space-y-5 p-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Path detail</Label>
          <div className="grid grid-cols-2 gap-1">
            {DETAIL_ORDER.map((level) => {
              const preset = PATH_DETAIL_PRESETS[level];
              const active = pathDetail === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPathDetail(level)}
                  className={cn(
                    "h-8 rounded-md px-2 text-left text-xs transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">{activePreset.hint}</p>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
          <div>
            <Label htmlFor="remove-bg" className="text-xs">
              Cut background
            </Label>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              White backdrop and floor shadow.
            </p>
          </div>
          <Switch
            id="remove-bg"
            checked={removeBackground}
            onCheckedChange={setRemoveBackground}
          />
        </div>
      </div>
    </aside>
  );
}
