import type {
  AnalysisMode,
  ProcessingMilestone,
  VectorLayer,
  VectorTuning,
} from "@/types";

export const PROCESSING_STEPS: Omit<ProcessingMilestone, "status">[] = [
  { id: "bg", label: "Isolating background…" },
  { id: "edges", label: "Detecting contours…" },
  { id: "semantic", label: "Segmenting semantic regions…" },
  { id: "trace", label: "Tracing vector paths…" },
  { id: "bezier", label: "Optimizing bezier curves…" },
  { id: "layers", label: "Assembling editable layers…" },
];

const LAYER_TEMPLATES: Record<AnalysisMode, Omit<VectorLayer, "id">[]> = {
  geometry: [
    {
      name: "Soleplate_Outer",
      visible: true,
      locked: false,
      pathData:
        "M48,190 C95,235 230,250 365,205 C405,180 422,125 378,85 C315,25 175,35 95,78 C40,110 22,155 48,190 Z",
      color: "#34d399",
      group: "Silhouette",
    },
    {
      name: "Upper_Profile",
      visible: true,
      locked: false,
      pathData:
        "M78,155 C125,95 245,72 345,115 C368,135 355,172 305,182 C220,205 125,195 78,155 Z",
      color: "#38bdf8",
      group: "Silhouette",
    },
  ],
  detail: [
    {
      name: "Brand_Mark",
      visible: true,
      locked: false,
      pathData: "M125,145 C168,122 230,118 285,135 C255,152 195,160 145,155 Z",
      color: "#a78bfa",
      group: "Brand",
    },
    {
      name: "Stitch_Panel_Break",
      visible: true,
      locked: false,
      pathData: "M165,105 C185,138 195,168 188,198",
      color: "#fbbf24",
      group: "Construction",
    },
    {
      name: "Lace_Cage",
      visible: true,
      locked: false,
      pathData: "M200,95 L215,130 L200,160 L185,130 Z",
      color: "#fb7185",
      group: "Construction",
    },
  ],
};

function simplifyPath(path: string, threshold: number): string {
  if (threshold < 10) return path;
  // Lightweight demo simplification: drop intermediate control points at higher thresholds
  if (threshold > 70) {
    return path.replace(/C[\d.,\s-]+Z/g, "Z").replace(/C[\d.,\s-]+(?=[ML])/g, "");
  }
  return path;
}

function applySmoothing(path: string, smoothing: number): string {
  // Demo transform: nudge curve control points slightly based on smoothing
  if (smoothing < 20) return path;
  return path.replace(/(\d+\.?\d*)/g, (match, num: string, offset: number) => {
    const value = Number(num);
    if (Number.isNaN(value) || offset % 7 === 0) return match;
    const nudge = (smoothing - 50) * 0.02;
    return String(Math.round((value + nudge) * 10) / 10);
  });
}

export function buildSvgFromLayers(
  layers: VectorLayer[],
  width = 480,
  height = 320
): string {
  const paths = layers
    .filter((l) => l.visible)
    .map(
      (l) =>
        `<path id="${l.id}" data-name="${l.name}" d="${l.pathData}" fill="none" stroke="${l.color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`
    )
    .join("\n    ");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <g id="vectorpath-layers">
    ${paths}
  </g>
</svg>`;
}

export function applyTuning(layers: VectorLayer[], tuning: VectorTuning): VectorLayer[] {
  return layers.map((layer) => ({
    ...layer,
    pathData: applySmoothing(
      simplifyPath(layer.pathData, tuning.pathSimplification),
      tuning.curveSmoothing
    ),
  }));
}

export function generateCoordinateManifest(layers: VectorLayer[]) {
  return {
    version: "1.0",
    generator: "VectorPath AI",
    units: "px",
    coordinateSystem: "svg-viewbox",
    layers: layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      group: layer.group ?? null,
      visible: layer.visible,
      path: layer.pathData,
      color: layer.color,
    })),
  };
}

export function exportAsDxf(layers: VectorLayer[]): string {
  const lines = ["0", "SECTION", "2", "ENTITIES"];
  layers
    .filter((l) => l.visible)
    .forEach((layer) => {
      lines.push("0", "LWPOLYLINE", "8", layer.name, "100", "AcDbEntity", "100", "AcDbPolyline");
      lines.push("1", layer.pathData.slice(0, 80));
    });
  lines.push("0", "ENDSEC", "0", "EOF");
  return lines.join("\n");
}

export async function runVectorizationPipeline(options: {
  modes: AnalysisMode[];
  onMilestone?: (milestones: ProcessingMilestone[], progress: number) => void;
}): Promise<{ layers: VectorLayer[]; svg: string }> {
  const milestones: ProcessingMilestone[] = PROCESSING_STEPS.map((step, index) => ({
    ...step,
    status: index === 0 ? "active" : "pending",
  }));

  options.onMilestone?.(milestones, 5);

  for (let i = 0; i < milestones.length; i++) {
    await new Promise((r) => setTimeout(r, 550 + Math.random() * 350));
    milestones[i].status = "done";
    if (i + 1 < milestones.length) milestones[i + 1].status = "active";
    options.onMilestone?.(
      [...milestones],
      Math.round(((i + 1) / milestones.length) * 100)
    );
  }

  const layers: VectorLayer[] = options.modes.flatMap((mode, modeIndex) =>
    LAYER_TEMPLATES[mode].map((template, index) => ({
      ...template,
      id: `layer-${mode}-${modeIndex}-${index}`,
    }))
  );

  return {
    layers,
    svg: buildSvgFromLayers(layers),
  };
}
