"use client";

import { useStudioStore } from "@/store/studio-store";
import { buildSvgFromLayers } from "@/lib/vector-engine";
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
  const { layers, comparePosition, setComparePosition, selectedLayerId } = useStudioStore();
  const svg = buildSvgFromLayers(layers, width, height, selectedLayerId);

  return (
    <div className="flex h-full min-h-0 flex-col bg-stage">
      <div className="relative min-h-0 flex-1 [container-type:size]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="relative bg-white shadow-[0_18px_60px_rgba(0,0,0,0.5)]"
            style={{
              aspectRatio: `${width} / ${height}`,
              width: `min(88cqw, calc(84cqh * ${width} / ${height}))`,
            }}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="Original" className="absolute inset-0 h-full w-full object-contain" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">
                Original unavailable
              </div>
            )}

            <div
              className="absolute inset-0 bg-white"
              style={{ clipPath: `inset(0 0 0 ${comparePosition}%)` }}
            >
              <div
                className="h-full w-full [&_svg]:h-full [&_svg]:w-full"
                dangerouslySetInnerHTML={{
                  __html: svg.replace('<?xml version="1.0" encoding="UTF-8"?>', ""),
                }}
              />
            </div>

            <div
              className="pointer-events-none absolute inset-y-0 w-px bg-black/80"
              style={{ left: `${comparePosition}%` }}
            />
            <div className="pointer-events-none absolute left-2 top-2 bg-black/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
              Before
            </div>
            <div className="pointer-events-none absolute right-2 top-2 bg-black/70 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-white">
              After
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-10 shrink-0 items-center gap-3 border-t border-border bg-card px-4">
        <span className="w-14 text-[10px] uppercase tracking-wider text-muted-foreground">Compare</span>
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
