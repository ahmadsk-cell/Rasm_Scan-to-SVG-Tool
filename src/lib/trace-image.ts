import type { AnalysisMode, PathDetailLevel, VectorLayer } from "@/types";

const LAYER_COLORS = ["#8fae8b", "#7a92a8", "#b8a07a", "#c4a06a", "#a88888", "#9a9a88"];

export interface TraceSource {
  id: string;
  label: string;
  description: string;
  previewUrl: string;
  file?: File;
}

export interface TraceResult {
  layers: VectorLayer[];
  svg: string;
  width: number;
  height: number;
}

export const PATH_DETAIL_PRESETS: Record<
  PathDetailLevel,
  {
    label: string;
    hint: string;
    maxDimension: number;
    numberofcolors: number;
    pathomit: number;
    ltres: number;
    qtres: number;
    blurradius: number;
    blurdelta: number;
    colorquantcycles: number;
    linefilter: boolean;
    maxLayers: number;
  }
> = {
  simple: {
    label: "Simple",
    hint: "Fast silhouettes — best for logos, icons, and photos",
    maxDimension: 560,
    numberofcolors: 3,
    pathomit: 36,
    ltres: 2.4,
    qtres: 2.4,
    blurradius: 3,
    blurdelta: 48,
    colorquantcycles: 2,
    linefilter: true,
    maxLayers: 18,
  },
  balanced: {
    label: "Balanced",
    hint: "Clean shapes with moderate detail",
    maxDimension: 720,
    numberofcolors: 5,
    pathomit: 18,
    ltres: 1.4,
    qtres: 1.4,
    blurradius: 1,
    blurdelta: 32,
    colorquantcycles: 2,
    linefilter: true,
    maxLayers: 40,
  },
  detailed: {
    label: "Detailed",
    hint: "More regions and finer curves",
    maxDimension: 960,
    numberofcolors: 8,
    pathomit: 8,
    ltres: 0.9,
    qtres: 0.9,
    blurradius: 0,
    blurdelta: 20,
    colorquantcycles: 3,
    linefilter: true,
    maxLayers: 72,
  },
  maximum: {
    label: "Maximum",
    hint: "Highest fidelity — slower on complex photos",
    maxDimension: 1100,
    numberofcolors: 12,
    pathomit: 3,
    ltres: 0.55,
    qtres: 0.55,
    blurradius: 0,
    blurdelta: 20,
    colorquantcycles: 3,
    linefilter: false,
    maxLayers: 120,
  },
};

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function isNearWhite(r: number, g: number, b: number, a: number) {
  return a < 16 || (r > 242 && g > 242 && b > 242);
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for tracing"));
    img.src = url;
  });
}

function yieldToMain() {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback !== "undefined") {
      requestIdleCallback(() => resolve(), { timeout: 80 });
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function imageToImageData(
  img: HTMLImageElement,
  maxDimension: number
): { imageData: ImageData; width: number; height: number } {
  const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available in this browser");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);

  return { imageData: ctx.getImageData(0, 0, width, height), width, height };
}

function buildOptions(modes: AnalysisMode[], detail: PathDetailLevel) {
  const preset = PATH_DETAIL_PRESETS[detail];
  const geometryOnly = modes.includes("geometry") && !modes.includes("detail");
  const detailOnly = modes.includes("detail") && !modes.includes("geometry");

  let colors = preset.numberofcolors;
  let pathomit = preset.pathomit;
  let blur = preset.blurradius;

  if (geometryOnly) {
    colors = Math.max(2, Math.min(colors, 4));
    pathomit = Math.max(pathomit, 20);
    blur = Math.max(blur, 1);
  } else if (detailOnly) {
    colors = Math.min(16, colors + 2);
    pathomit = Math.max(2, pathomit - 2);
  }

  return {
    numberofcolors: colors,
    pathomit,
    ltres: preset.ltres,
    qtres: preset.qtres,
    blurradius: blur,
    blurdelta: preset.blurdelta,
    colorsampling: 2,
    colorquantcycles: preset.colorquantcycles,
    strokewidth: 0,
    linefilter: preset.linefilter,
    rightangleenhance: true,
    roundcoords: 1,
    viewbox: true,
    scale: 1,
    maxLayers: preset.maxLayers,
    maxDimension: preset.maxDimension,
  };
}

function extractPathD(pathElement: string): string | null {
  const match = pathElement.match(/\sd="([^"]+)"/);
  return match?.[1]?.trim() || null;
}

function slugify(text: string, fallback: string) {
  const cleaned = text
    .trim()
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 40);
  return cleaned || fallback;
}

function pathComplexity(d: string) {
  return d.length;
}

/**
 * Trace a single raster image into editable SVG path layers using ImageTracer.
 */
export async function traceImageToLayers(
  source: TraceSource,
  modes: AnalysisMode[],
  index = 0,
  detail: PathDetailLevel = "balanced"
): Promise<TraceResult> {
  const ImageTracer = (await import("imagetracerjs")).default;
  await yieldToMain();

  const img = await loadImageElement(source.previewUrl);
  const options = buildOptions(modes, detail);
  const { imageData, width, height } = imageToImageData(img, options.maxDimension);

  await yieldToMain();
  const traced = ImageTracer.imagedataToTracedata(imageData, options);
  await yieldToMain();
  const svg = ImageTracer.getsvgstring(traced, options);

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const pathNodes = Array.from(doc.querySelectorAll("path"));

  const layers: VectorLayer[] = [];
  const groupBase = source.label || `Image_${index + 1}`;
  const intentHint = source.description.trim();

  pathNodes.forEach((path, pathIndex) => {
    const d = path.getAttribute("d");
    if (!d || d.length < 8) return;

    const fill = path.getAttribute("fill") || "";
    const rgb = fill.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const r = rgb ? Number(rgb[1]) : 140;
    const g = rgb ? Number(rgb[2]) : 160;
    const b = rgb ? Number(rgb[3]) : 140;
    const opacityAttr = path.getAttribute("opacity");
    const opacity = opacityAttr ? Number(opacityAttr) : 1;

    if (isNearWhite(r, g, b, Math.round(opacity * 255))) return;

    const color = rgb ? rgbToHex(r, g, b) : LAYER_COLORS[pathIndex % LAYER_COLORS.length];
    const name =
      pathIndex === 0 && intentHint
        ? slugify(intentHint, "Target")
        : `${slugify(groupBase, "Layer")}_${pathIndex + 1}`;

    layers.push({
      id: `trace-${source.id}-${pathIndex}`,
      name,
      visible: true,
      locked: false,
      pathData: d,
      color,
      group: groupBase,
      filled: true,
    });
  });

  if (!layers.length) {
    const rawPaths = svg.match(/<path\b[^>]*>/g) ?? [];
    rawPaths.forEach((raw, pathIndex) => {
      const d = extractPathD(raw);
      if (!d) return;
      layers.push({
        id: `trace-${source.id}-fallback-${pathIndex}`,
        name: `${slugify(groupBase, "Layer")}_${pathIndex + 1}`,
        visible: true,
        locked: false,
        pathData: d,
        color: LAYER_COLORS[pathIndex % LAYER_COLORS.length],
        group: groupBase,
        filled: true,
      });
    });
  }

  if (!layers.length) {
    throw new Error(
      `No vector paths found in “${source.label || source.file?.name || "image"}”. Try Simple detail or a higher-contrast image.`
    );
  }

  // Keep the most substantial paths first — drops tiny noise on scenery
  layers.sort((a, b) => pathComplexity(b.pathData) - pathComplexity(a.pathData));
  const capped = layers.slice(0, options.maxLayers).map((layer, i) => ({
    ...layer,
    id: `trace-${source.id}-${i}`,
  }));

  return { layers: capped, svg, width, height };
}
