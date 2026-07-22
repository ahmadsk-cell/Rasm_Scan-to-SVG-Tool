"use client";

import { useStudioStore } from "@/store/studio-store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const CONTROLS = [
  {
    key: "curveSmoothing" as const,
    label: "Curve smoothing",
    hint: "Bezier fidelity",
  },
  {
    key: "noiseReduction" as const,
    label: "Noise reduction",
    hint: "Edge cleanup",
  },
  {
    key: "pathSimplification" as const,
    label: "Path simplification",
    hint: "Point density",
  },
];

export function VectorControls() {
  const { tuning, setTuning } = useStudioStore();

  return (
    <div className="glass-panel space-y-5 rounded-2xl p-4">
      <div>
        <h3 className="font-display text-sm font-semibold">Vector tuning</h3>
        <p className="text-xs text-muted-foreground">Fine-tune fidelity on the fly</p>
      </div>

      {CONTROLS.map((control) => (
        <div key={control.key} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs">{control.label}</Label>
            <span className="font-mono text-[11px] text-muted-foreground">
              {tuning[control.key]}
            </span>
          </div>
          <Slider
            value={[tuning[control.key]]}
            min={0}
            max={100}
            step={1}
            onValueChange={(v) => setTuning({ [control.key]: v[0] ?? 0 })}
            aria-label={control.label}
          />
          <p className="text-[11px] text-muted-foreground">{control.hint}</p>
        </div>
      ))}
    </div>
  );
}
