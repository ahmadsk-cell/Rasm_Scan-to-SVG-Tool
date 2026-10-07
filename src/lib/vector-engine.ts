import type {
  AnalysisMode,
  PathDetailLevel,
  ProcessingMilestone,
  VectorLayer,
  VectorTuning,
} from "@/types";
import { PATH_DETAIL_PRESETS, traceImageToLayers, type TraceSource } from "@/lib/trace-image";

export { PATH_DETAIL_PRESETS };

export const PROCESSING_STEPS: Omit<ProcessingMilestone, "status">[] = [
  { id: "prepare", label: "Preparing the image…" },
  { id: "background", label: "Removing backdrop and shadow…" },
  { id: "trace", label: "Tracing shapes…" },
  { id: "layers", label: "Building layers…" },
];

export function buildSvgFromLayers(
  layers: VectorLayer[],
  width = 480,
  height = 320,
  selectedId?: string | null
): string {
  const paths = layers
    .filter((l) => l.visible)
    .map((l) => {
      const selected = l.id === selectedId;
      if (l.filled) {
        return `<path id="${l.id}" data-name="${l.name}" d="${l.pathData}" fill="${l.color}" fill-opacity="1" stroke="${selected ? "#111111" : l.color}" stroke-width="${selected ? 1.75 : 0.35}" stroke-linejoin="round"/>`;
      }
      return `<path id="${l.id}" data-name="${l.name}" d="${l.pathData}" fill="none" stroke="${l.color}" stroke-width="${selected ? 3 : 2}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <g id="rasm-layers">
    ${paths}
  </g>
</svg>`;
}

export function applyTuning(layers: VectorLayer[], _tuning: VectorTuning): VectorLayer[] {
  return layers;
}

export function generateCoordinateManifest(layers: VectorLayer[]) {
  return {
    version: "1.0",
    generator: "Rasm",
    units: "px",
    coordinateSystem: "svg-viewbox",
    layers: layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      group: layer.group ?? null,
      visible: layer.visible,
      path: layer.pathData,
      color: layer.color,
      filled: Boolean(layer.filled),
    })),
  };
}

function sampleSvgPath(d: string): Array<[number, number]> {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) ?? [];
  const points: Array<[number, number]> = [];
  let i = 0;
  let cmd = "M";
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  const isCmd = (token: string) => /^[a-zA-Z]$/.test(token);
  const read = () => Number(tokens[i++]);

  while (i < tokens.length) {
    if (isCmd(tokens[i])) {
      cmd = tokens[i++];
      if (cmd === "Z" || cmd === "z") {
        points.push([sx, sy]);
        cx = sx;
        cy = sy;
      }
      continue;
    }

    const rel = cmd === cmd.toLowerCase();
    const kind = cmd.toUpperCase();
    if (kind === "M" || kind === "L") {
      const x = read();
      const y = read();
      cx = rel ? cx + x : x;
      cy = rel ? cy + y : y;
      if (kind === "M") {
        sx = cx;
        sy = cy;
      }
      points.push([cx, cy]);
      if (kind === "M") cmd = rel ? "l" : "L";
    } else if (kind === "H") {
      const x = read();
      cx = rel ? cx + x : x;
      points.push([cx, cy]);
    } else if (kind === "V") {
      const y = read();
      cy = rel ? cy + y : y;
      points.push([cx, cy]);
    } else if (kind === "C") {
      const x1 = read();
      const y1 = read();
      const x2 = read();
      const y2 = read();
      const x = read();
      const y = read();
      const p1x = rel ? cx + x1 : x1;
      const p1y = rel ? cy + y1 : y1;
      const p2x = rel ? cx + x2 : x2;
      const p2y = rel ? cy + y2 : y2;
      const p3x = rel ? cx + x : x;
      const p3y = rel ? cy + y : y;
      for (let step = 1; step <= 6; step++) {
        const t = step / 6;
        const m = 1 - t;
        points.push([
          m * m * m * cx + 3 * m * m * t * p1x + 3 * m * t * t * p2x + t * t * t * p3x,
          m * m * m * cy + 3 * m * m * t * p1y + 3 * m * t * t * p2y + t * t * t * p3y,
        ]);
      }
      cx = p3x;
      cy = p3y;
    } else if (kind === "Q") {
      const x1 = read();
      const y1 = read();
      const x = read();
      const y = read();
      const p1x = rel ? cx + x1 : x1;
      const p1y = rel ? cy + y1 : y1;
      const p3x = rel ? cx + x : x;
      const p3y = rel ? cy + y : y;
      for (let step = 1; step <= 4; step++) {
        const t = step / 4;
        const m = 1 - t;
        points.push([
          m * m * cx + 2 * m * t * p1x + t * t * p3x,
          m * m * cy + 2 * m * t * p1y + t * t * p3y,
        ]);
      }
      cx = p3x;
      cy = p3y;
    } else {
      i++;
    }
  }

  return points;
}

export function exportAsDxf(layers: VectorLayer[], height = 0): string {
  const lines = ["0", "SECTION", "2", "ENTITIES"];
  layers
    .filter((layer) => layer.visible)
    .forEach((layer) => {
      const points = sampleSvgPath(layer.pathData);
      if (points.length < 2) return;
      const name = layer.name.replace(/\s+/g, "_").slice(0, 40);
      lines.push("0", "LWPOLYLINE", "8", name, "90", String(points.length), "70", "1");
      points.forEach(([x, y]) => {
        const flipped = height > 0 ? height - y : y;
        lines.push("10", x.toFixed(3), "20", flipped.toFixed(3));
      });
    });
  lines.push("0", "ENDSEC", "0", "EOF");
  return lines.join("\n");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runVectorizationPipeline(options: {
  modes: AnalysisMode[];
  pathDetail?: PathDetailLevel;
  removeBackground?: boolean;
  intent?: string;
  sources: TraceSource[];
  onMilestone?: (milestones: ProcessingMilestone[], progress: number) => void;
}): Promise<{
  layers: VectorLayer[];
  svg: string;
  width: number;
  height: number;
}> {
  if (typeof window === "undefined") {
    throw new Error("Vectorization must run in the browser");
  }

  if (!options.sources.length) {
    throw new Error("No images to vectorize");
  }

  const pathDetail = options.pathDetail ?? "balanced";
  const preset = PATH_DETAIL_PRESETS[pathDetail];
  const removeBackground = options.removeBackground !== false;

  const milestones: ProcessingMilestone[] = PROCESSING_STEPS.map((step, index) => ({
    ...step,
    label:
      step.id === "trace"
        ? `Tracing shapes (${preset.label})…`
        : step.id === "background" && !removeBackground
          ? "Keeping the original background…"
          : step.label,
    status: index === 0 ? "active" : "pending",
  }));

  const bump = async (index: number, progress: number) => {
    for (let i = 0; i <= index; i++) milestones[i].status = "done";
    if (index + 1 < milestones.length) milestones[index + 1].status = "active";
    options.onMilestone?.([...milestones], progress);
    await sleep(40);
  };

  options.onMilestone?.([...milestones], 6);
  await bump(0, 18);
  await bump(1, 32);

  const allLayers: VectorLayer[] = [];
  let width = 480;
  let height = 320;

  for (let i = 0; i < options.sources.length; i++) {
    const source = options.sources[i];
    const traced = await traceImageToLayers(
      source,
      options.modes,
      i,
      pathDetail,
      removeBackground
    );
    allLayers.push(...traced.layers);
    if (i === 0) {
      width = traced.width;
      height = traced.height;
    }
    const mid = 32 + Math.round(((i + 1) / options.sources.length) * 52);
    options.onMilestone?.([...milestones], mid);
  }

  await bump(2, 92);
  await bump(3, 100);
  milestones.forEach((m) => {
    m.status = "done";
  });
  options.onMilestone?.([...milestones], 100);

  return {
    layers: allLayers,
    svg: buildSvgFromLayers(allLayers, width, height),
    width,
    height,
  };
}
