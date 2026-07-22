"use client";

import { useStudioStore } from "@/store/studio-store";
import { applyTuning, buildSvgFromLayers } from "@/lib/vector-engine";
import { Slider } from "@/components/ui/slider";

export function SplitView({
  imageUrl,
  width = 480,
  height = 320,
}: {
  imageUrl?: string;
  width?: number;
  height?: number;
}) {
  const { layers, tuning, comparePosition, setComparePosition } = useStudioStore();
  const tunedLayers = applyTuning(layers, tuning);
  const svg = buildSvgFromLayers(tunedLayers, width, height);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/2] overflow-hidden rounded-xl border border-border bg-muted/30 grid-dots">
        <div className="absolute inset-0 flex items-center justify-center p-2">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Original raster"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-sm text-muted-foreground">Original raster preview</div>
          )}
        </div>

        <div
          className="absolute inset-0 overflow-hidden bg-background/92"
          style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}
        >
          <div className="flex h-full w-full items-center justify-center p-2">
            <div
              className="max-h-full max-w-full [&_svg]:h-auto [&_svg]:max-h-full [&_svg]:w-full [&_svg]:max-w-full"
              dangerouslySetInnerHTML={{
                __html: svg.replace('<?xml version="1.0" encoding="UTF-8"?>', ""),
              }}
            />
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-primary/80"
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
