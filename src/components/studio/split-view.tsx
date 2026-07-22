"use client";

import { useStudioStore } from "@/store/studio-store";
import { applyTuning, buildSvgFromLayers } from "@/lib/vector-engine";
import { Slider } from "@/components/ui/slider";

export function SplitView({ imageUrl }: { imageUrl?: string }) {
  const { layers, tuning, comparePosition, setComparePosition } = useStudioStore();
  const tunedLayers = applyTuning(layers, tuning);
  const svg = buildSvgFromLayers(tunedLayers);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-border bg-muted/30 grid-dots">
        <div className="absolute inset-0">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="Original raster" className="h-full w-full object-contain" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Original raster preview
            </div>
          )}
        </div>

        <div
          className="absolute inset-0 overflow-hidden bg-background/90 backdrop-blur-[1px]"
          style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}
        >
          <div
            className="h-full w-full"
            dangerouslySetInnerHTML={{
              __html: svg.replace(
                '<?xml version="1.0" encoding="UTF-8"?>',
                ""
              ),
            }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary shadow-[0_0_12px_rgba(52,211,153,0.6)]"
          style={{ left: `${comparePosition}%` }}
        />

        <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
          Raster
        </div>
        <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
          Vector
        </div>
      </div>

      <div className="glass flex items-center gap-3 rounded-xl px-4 py-3">
        <span className="text-xs text-muted-foreground">Compare</span>
        <Slider
          value={[comparePosition]}
          onValueChange={(v) => setComparePosition(v[0] ?? 50)}
          min={0}
          max={100}
          step={1}
          aria-label="Compare raster and vector"
        />
      </div>
    </div>
  );
}
