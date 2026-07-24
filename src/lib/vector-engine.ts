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
  { id: "bg", label: "Preparing images…" },
  { id: "edges", label: "Simplifying colors…" },
  { id: "semantic", label: "Matching extraction targets…" },
  { id: "trace", label: "Tracing vector paths…" },
  { id: "bezier", label: "Optimizing curves…" },
  { id: "layers", label: "Assembling editable layers…" },
];

export function buildSvgFromLayers(
  layers: VectorLayer[],
  width = 480,
  height = 320
): string {
  const paths = layers
    .filter((l) => l.visible)
    .map((l) => {
      if (l.filled) {
        return `<path id="${l.id}" data-name="${l.name}" d="${l.pathData}" fill="${l.color}" fill-opacity="0.88" stroke="${l.color}" stroke-width="0.4" stroke-linejoin="round"/>`;
      }
      return `<path id="${l.id}" data-name="${l.name}" d="${l.pathData}" fill="none" stroke="${l.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
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

export function exportAsDxf(layers: VectorLayer[]): string {
  const lines = ["0", "SECTION", "2", "ENTITIES"];
  layers
    .filter((l) => l.visible)
    .forEach((layer) => {
      lines.push("0", "LWPOLYLINE", "8", layer.name, "100", "AcDbEntity", "100", "AcDbPolyline");
      lines.push("1", layer.pathData.slice(0, 120));
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

  const milestones: ProcessingMilestone[] = PROCESSING_STEPS.map((step, index) => {
    let label = step.label;
    if (step.id === "semantic" && options.intent?.trim()) {
      label = `Matching “${options.intent.trim().slice(0, 42)}”…`;
    }
    if (step.id === "trace") {
      label =
        options.sources.length > 1
          ? `Tracing ${options.sources.length} images (${preset.label})…`
          : `Tracing paths (${preset.label})…`;
    }
    return {
      ...step,
      label,
      status: index === 0 ? "active" : "pending",
    };
  });

  const bump = async (index: number, progress: number) => {
    for (let i = 0; i <= index; i++) milestones[i].status = "done";
    if (index + 1 < milestones.length) milestones[index + 1].status = "active";
    options.onMilestone?.([...milestones], progress);
    await sleep(60);
  };

  options.onMilestone?.([...milestones], 4);
  await bump(0, 12);

  const allLayers: VectorLayer[] = [];
  let width = 480;
  let height = 320;

  await bump(1, 22);

  if (options.intent?.trim()) {
    await bump(2, 30);
  } else {
    milestones[2].status = "done";
    options.onMilestone?.([...milestones], 28);
  }

  milestones[3].status = "active";
  options.onMilestone?.([...milestones], 35);

  for (let i = 0; i < options.sources.length; i++) {
    const source = options.sources[i];
    const traced = await traceImageToLayers(source, options.modes, i, pathDetail);
    allLayers.push(...traced.layers);
    if (i === 0) {
      width = traced.width;
      height = traced.height;
    }

    const mid = 35 + Math.round(((i + 1) / options.sources.length) * 45);
    options.onMilestone?.([...milestones], mid);
  }

  await bump(3, 82);
  await bump(4, 90);

  if (options.intent?.trim() && allLayers.length) {
    allLayers[0] = {
      ...allLayers[0],
      name: options.intent.trim().slice(0, 40).replace(/\s+/g, "_") || allLayers[0].name,
    };
  }

  await bump(5, 100);
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
