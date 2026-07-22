import type { AnalysisMode, VectorLayer } from "@/types";

const LAYER_COLORS = ["#8fae8b", "#7a92a8", "#b8a07a", "#c4a06a", "#a88888", "#9a9a88"];

const MAX_DIMENSION = 1200;

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

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function isNearWhite(r: number, g: number, b: number, a: number) {
  return a < 16 || (r > 245 && g > 245 && b > 245);
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for tracing"));
    img.src = url;
  });
}

function imageToImageData(img: HTMLImageElement): {
  imageData: ImageData;
  width: number;
  height: number;
} {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available in this browser");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return { imageData: ctx.getImageData(0, 0, width, height), width, height };
}

function buildOptions(modes: AnalysisMode[]) {
  const detail = modes.includes("detail");
  const geometry = modes.includes("geometry");

  if (geometry && !detail) {
    return {
      numberofcolors: 4,
      pathomit: 16,
      ltres: 1.2,
      qtres: 1.2,
      blurradius: 1,
      blurdelta: 32,
      colorsampling: 2,
      colorquantcycles: 3,
      strokewidth: 0,
      linefilter: true,
      rightangleenhance: true,
      roundcoords: 1,
      viewbox: true,
      scale: 1,
    };
  }

  if (detail && !geometry) {
    return {
      numberofcolors: 12,
      pathomit: 4,
      ltres: 0.6,
      qtres: 0.6,
      blurradius: 0,
      colorsampling: 2,
      colorquantcycles: 3,
      strokewidth: 0,
      linefilter: false,
      roundcoords: 2,
      viewbox: true,
      scale: 1,
    };
  }

  // Both modes: balanced multi-layer color trace
  return {
    numberofcolors: 8,
    pathomit: 8,
    ltres: 0.8,
    qtres: 0.8,
    blurradius: 0,
    colorsampling: 2,
    colorquantcycles: 3,
    strokewidth: 0,
    linefilter: true,
    roundcoords: 1,
    viewbox: true,
    scale: 1,
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

/**
 * Trace a single raster image into editable SVG path layers using ImageTracer.
 */
export async function traceImageToLayers(
  source: TraceSource,
  modes: AnalysisMode[],
  index = 0
): Promise<TraceResult> {
  const ImageTracer = (await import("imagetracerjs")).default;
  const img = await loadImageElement(source.previewUrl);
  const { imageData, width, height } = imageToImageData(img);
  const options = buildOptions(modes);

  const traced = ImageTracer.imagedataToTracedata(imageData, options);
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

  // Fallback: if DOM parse failed, keep raw SVG as one stroke layer from getsvgstring paths
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
      `No vector paths found in “${source.label || source.file?.name || "image"}”. Try a higher-contrast image.`
    );
  }

  return { layers, svg, width, height };
}
