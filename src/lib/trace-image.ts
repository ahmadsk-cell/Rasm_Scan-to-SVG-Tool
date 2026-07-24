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

type TraceOptions = {
  numberofcolors: number;
  pathomit: number;
  ltres: number;
  qtres: number;
  blurradius: number;
  blurdelta: number;
  colorsampling: number;
  colorquantcycles: number;
  mincolorratio: number;
  strokewidth: number;
  linefilter: boolean;
  rightangleenhance: boolean;
  roundcoords: number;
  viewbox: boolean;
  scale: number;
  maxLayers: number;
  maxDimension: number;
  /** 0–1: downscale then upscale to kill knit/mesh before tracing */
  textureKill: number;
  preBlurPasses: number;
};

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
    mincolorratio: number;
    linefilter: boolean;
    maxLayers: number;
    textureKill: number;
    preBlurPasses: number;
  }
> = {
  simple: {
    label: "Simple",
    hint: "Smooth silhouettes — scenery & quick outlines",
    maxDimension: 780,
    numberofcolors: 4,
    pathomit: 22,
    ltres: 0.85,
    qtres: 0.85,
    blurradius: 3,
    blurdelta: 48,
    colorquantcycles: 3,
    mincolorratio: 0.02,
    linefilter: true,
    maxLayers: 20,
    textureKill: 0.45,
    preBlurPasses: 2,
  },
  balanced: {
    label: "Balanced",
    hint: "Best for product photos — keeps marks, drops knit noise",
    maxDimension: 1024,
    numberofcolors: 6,
    pathomit: 16,
    ltres: 0.6,
    qtres: 0.6,
    blurradius: 4,
    blurdelta: 44,
    colorquantcycles: 3,
    mincolorratio: 0.012,
    linefilter: true,
    maxLayers: 42,
    textureKill: 0.4,
    preBlurPasses: 2,
  },
  detailed: {
    label: "Detailed",
    hint: "More regions and finer curves (still softens mesh)",
    maxDimension: 1100,
    numberofcolors: 9,
    pathomit: 9,
    ltres: 0.35,
    qtres: 0.35,
    blurradius: 2,
    blurdelta: 32,
    colorquantcycles: 3,
    mincolorratio: 0.007,
    linefilter: true,
    maxLayers: 72,
    textureKill: 0.28,
    preBlurPasses: 1,
  },
  maximum: {
    label: "Maximum",
    hint: "Highest fidelity — slower on textured photos",
    maxDimension: 1280,
    numberofcolors: 12,
    pathomit: 5,
    ltres: 0.22,
    qtres: 0.22,
    blurradius: 1,
    blurdelta: 24,
    colorquantcycles: 4,
    mincolorratio: 0.004,
    linefilter: true,
    maxLayers: 120,
    textureKill: 0.18,
    preBlurPasses: 1,
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
  if (a < 16) return true;
  if (r > 242 && g > 242 && b > 242) return true;
  // Soft gray fills that are really knocked-out shadow leftovers
  return isSoftStudioShadow(r, g, b);
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

function boxBlur(imageData: ImageData, passes: number): ImageData {
  if (passes <= 0) return imageData;
  const { width, height } = imageData;
  let src = new Uint8ClampedArray(imageData.data);
  let dst = new Uint8ClampedArray(src.length);

  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = Math.min(height - 1, Math.max(0, y + dy));
          for (let dx = -1; dx <= 1; dx++) {
            const xx = Math.min(width - 1, Math.max(0, x + dx));
            const i = (yy * width + xx) * 4;
            r += src[i];
            g += src[i + 1];
            b += src[i + 2];
            a += src[i + 3];
            n++;
          }
        }
        const o = (y * width + x) * 4;
        dst[o] = Math.round(r / n);
        dst[o + 1] = Math.round(g / n);
        dst[o + 2] = Math.round(b / n);
        dst[o + 3] = Math.round(a / n);
      }
    }
    [src, dst] = [dst, src];
  }

  return new ImageData(new Uint8ClampedArray(src), width, height);
}

function isSoftStudioShadow(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;

  // Pure / near-white backdrop
  if (min > 228) return true;
  if (min > 200 && chroma < 28) return true;

  // Soft contact shadow on white seamless — neutral gray, mid–high luminance
  // Product colors (neon red, metallic swoosh) have much higher chroma.
  if (chroma <= 18 && luma >= 145 && luma <= 245) return true;
  if (chroma <= 26 && luma >= 175 && luma <= 248) return true;
  if (chroma <= 34 && luma >= 205) return true;

  return false;
}

function cleanupStudioBackground(imageData: ImageData): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const { width, height } = imageData;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (isSoftStudioShadow(r, g, b)) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      continue;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const chroma = max - min;

    // Pull dark marks (swoosh outline) slightly darker; keep reds punchy
    if (max < 90 && chroma < 40) {
      data[i] = Math.max(0, r - 12);
      data[i + 1] = Math.max(0, g - 12);
      data[i + 2] = Math.max(0, b - 12);
    } else if (chroma > 22) {
      data[i] = Math.max(0, Math.min(255, Math.round((r - 128) * 1.1 + 128)));
      data[i + 1] = Math.max(0, Math.min(255, Math.round((g - 128) * 1.1 + 128)));
      data[i + 2] = Math.max(0, Math.min(255, Math.round((b - 128) * 1.1 + 128)));
    }
  }

  return new ImageData(data, width, height);
}

/** Drop leftover shadow blobs that survived cleanup (neutral gray fills). */
function isShadowLayerColor(hex: string) {
  const rgb = hex.replace("#", "").match(/\w\w/g)?.map((h) => parseInt(h, 16));
  if (!rgb || rgb.length < 3) return false;
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return chroma <= 28 && luma >= 120 && luma <= 235;
}

/**
 * Downscale → upscale removes high-frequency knit/mesh while keeping logos & silhouette.
 */
function killTexture(imageData: ImageData, amount: number): ImageData {
  if (amount <= 0.05) return imageData;
  const { width, height } = imageData;
  const factor = Math.max(0.22, Math.min(0.7, amount));
  const smallW = Math.max(8, Math.round(width * factor));
  const smallH = Math.max(8, Math.round(height * factor));

  const src = document.createElement("canvas");
  src.width = width;
  src.height = height;
  const sctx = src.getContext("2d", { willReadFrequently: true });
  if (!sctx) return imageData;
  sctx.putImageData(imageData, 0, 0);

  const mid = document.createElement("canvas");
  mid.width = smallW;
  mid.height = smallH;
  const mctx = mid.getContext("2d");
  if (!mctx) return imageData;
  mctx.imageSmoothingEnabled = true;
  mctx.imageSmoothingQuality = "high";
  mctx.drawImage(src, 0, 0, smallW, smallH);

  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const octx = out.getContext("2d", { willReadFrequently: true });
  if (!octx) return imageData;
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(mid, 0, 0, width, height);
  return octx.getImageData(0, 0, width, height);
}

function imageToImageData(
  img: HTMLImageElement,
  maxDimension: number,
  textureKill: number,
  preBlurPasses: number
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

  let imageData = ctx.getImageData(0, 0, width, height);
  imageData = cleanupStudioBackground(imageData);
  imageData = killTexture(imageData, textureKill);
  imageData = boxBlur(imageData, preBlurPasses);

  return { imageData, width, height };
}

function buildPassOptions(
  modes: AnalysisMode[],
  detail: PathDetailLevel,
  pass: "single" | "silhouette" | "marks"
): TraceOptions {
  const preset = PATH_DETAIL_PRESETS[detail];
  const geometryOnly = modes.includes("geometry") && !modes.includes("detail");
  const detailOnly = modes.includes("detail") && !modes.includes("geometry");

  let colors = preset.numberofcolors;
  let pathomit = preset.pathomit;
  let blur = preset.blurradius;
  let preBlur = preset.preBlurPasses;
  let textureKill = preset.textureKill;
  let mincolorratio = preset.mincolorratio;
  let ltres = preset.ltres;
  let qtres = preset.qtres;
  let maxLayers = preset.maxLayers;

  if (pass === "silhouette" || geometryOnly) {
    colors = Math.max(3, Math.min(4, colors));
    pathomit = Math.max(pathomit, 22);
    blur = Math.max(blur, 5);
    preBlur = Math.max(preBlur, 3);
    textureKill = Math.max(textureKill, 0.48);
    mincolorratio = Math.max(mincolorratio, 0.022);
    // Higher thresholds after heavy blur → fewer stair-step segments
    ltres = Math.max(ltres, 1.35);
    qtres = Math.max(qtres, 1.35);
    maxLayers = Math.min(maxLayers, 14);
  } else if (pass === "marks") {
    // Focus on logos / dark accents — less texture kill so swoosh survives
    colors = Math.min(10, Math.max(6, colors + 1));
    pathomit = Math.max(10, pathomit - 2);
    blur = Math.max(1, blur - 1);
    textureKill = Math.min(textureKill, 0.3);
    preBlur = Math.max(1, preBlur - 1);
    mincolorratio = Math.max(0.006, mincolorratio * 0.7);
    ltres = Math.min(ltres, 0.45);
    qtres = Math.min(qtres, 0.45);
    maxLayers = Math.min(maxLayers, 28);
  } else if (detailOnly) {
    colors = Math.min(14, colors + 2);
    pathomit = Math.max(4, pathomit - 4);
    textureKill = Math.max(0.15, textureKill * 0.7);
  }

  return {
    numberofcolors: colors,
    pathomit,
    ltres,
    qtres,
    blurradius: blur,
    blurdelta: preset.blurdelta,
    colorsampling: 2,
    colorquantcycles: preset.colorquantcycles,
    mincolorratio,
    strokewidth: 0,
    linefilter: preset.linefilter,
    rightangleenhance: false,
    roundcoords: 2,
    viewbox: true,
    scale: 1,
    maxLayers,
    maxDimension: preset.maxDimension,
    textureKill,
    preBlurPasses: preBlur,
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

function pathBBoxArea(d: string): number {
  const nums = d.match(/-?\d*\.?\d+/g);
  if (!nums || nums.length < 4) return 0;
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = Number(nums[i]);
    const y = Number(nums[i + 1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX)) return 0;
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}

function pathCommandCount(d: string) {
  return (d.match(/[MLCQZmlcqz]/g) || []).length;
}

function colorDistance(a: string, b: string) {
  const pa = a.match(/\w\w/g)?.map((h) => parseInt(h, 16)) ?? [0, 0, 0];
  const pb = b.match(/\w\w/g)?.map((h) => parseInt(h, 16)) ?? [0, 0, 0];
  const dr = pa[0] - pb[0];
  const dg = pa[1] - pb[1];
  const db = pa[2] - pb[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function isAccentColor(hex: string) {
  const rgb = hex.match(/\w\w/g)?.map((h) => parseInt(h, 16)) ?? [0, 0, 0];
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  // Dark outlines / metallic / non-red accents
  if (max < 110) return true;
  if (chroma > 55 && (r + g > b * 1.8 || b > r)) return true;
  // Bronze/gold swoosh: mid luminance, high chroma, red+green dominant
  if (chroma > 40 && r > 120 && g > 80 && b < 120) return true;
  return false;
}

function layersFromSvg(
  svg: string,
  source: TraceSource,
  index: number,
  width: number,
  height: number,
  namePrefix: string,
  options: { minAreaRatio: number; accentOnly?: boolean; maxLayers: number }
): VectorLayer[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const pathNodes = Array.from(doc.querySelectorAll("path"));
  const groupBase = source.label || `Image_${index + 1}`;
  const intentHint = source.description.trim();
  const minArea = width * height * options.minAreaRatio;
  const layers: VectorLayer[] = [];

  pathNodes.forEach((path, pathIndex) => {
    const d = path.getAttribute("d");
    if (!d || d.length < 8) return;

    const area = pathBBoxArea(d);
    if (area > 0 && area < minArea) return;

    const fill = path.getAttribute("fill") || "";
    const rgb = fill.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const r = rgb ? Number(rgb[1]) : 140;
    const g = rgb ? Number(rgb[2]) : 160;
    const b = rgb ? Number(rgb[3]) : 140;
    const opacityAttr = path.getAttribute("opacity");
    const opacity = opacityAttr ? Number(opacityAttr) : 1;
    if (isNearWhite(r, g, b, Math.round(opacity * 255))) return;

    const color = rgb ? rgbToHex(r, g, b) : LAYER_COLORS[pathIndex % LAYER_COLORS.length];
    if (isShadowLayerColor(color)) return;
    if (options.accentOnly && !isAccentColor(color)) {
      // Keep medium-sized non-body shapes that aren't the giant red fill
      const canvasArea = width * height;
      if (area > canvasArea * 0.35) return;
      if (!isAccentColor(color) && area > canvasArea * 0.12) return;
    }

    const name =
      pathIndex === 0 && intentHint && namePrefix === "Body"
        ? slugify(intentHint, "Target")
        : `${slugify(groupBase, "Layer")}_${namePrefix}_${pathIndex + 1}`;

    layers.push({
      id: `trace-${source.id}-${namePrefix}-${pathIndex}`,
      name,
      visible: true,
      locked: false,
      pathData: d,
      color,
      group: groupBase,
      filled: true,
    });
  });

  layers.sort((a, b) => pathBBoxArea(b.pathData) - pathBBoxArea(a.pathData));
  return layers.slice(0, options.maxLayers);
}

async function runTracerPass(
  // ImageTracer's published types are looser than our TraceOptions bag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ImageTracer: any,
  imageData: ImageData,
  options: TraceOptions
) {
  await yieldToMain();
  const traced = ImageTracer.imagedataToTracedata(imageData, options);
  await yieldToMain();
  return ImageTracer.getsvgstring(traced, options) as string;
}

function dedupeLayers(layers: VectorLayer[]): VectorLayer[] {
  const kept: VectorLayer[] = [];
  for (const layer of layers) {
    const area = pathBBoxArea(layer.pathData);
    const cmds = pathCommandCount(layer.pathData);
    const duplicate = kept.some((other) => {
      const otherArea = pathBBoxArea(other.pathData);
      if (Math.abs(area - otherArea) / Math.max(area, otherArea, 1) > 0.08) return false;
      if (colorDistance(layer.color, other.color) > 40) return false;
      return Math.abs(cmds - pathCommandCount(other.pathData)) < 8;
    });
    if (!duplicate) kept.push(layer);
  }
  return kept;
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
  const useDualPass = modes.includes("geometry") && modes.includes("detail");

  let layers: VectorLayer[] = [];
  let width = 480;
  let height = 320;
  let svg = "";

  if (useDualPass) {
    const silOpts = buildPassOptions(modes, detail, "silhouette");
    const markOpts = {
      ...buildPassOptions(modes, detail, "marks"),
      maxDimension: silOpts.maxDimension,
    };

    const silPrepared = imageToImageData(
      img,
      silOpts.maxDimension,
      silOpts.textureKill,
      silOpts.preBlurPasses
    );
    width = silPrepared.width;
    height = silPrepared.height;

    const silSvg = await runTracerPass(ImageTracer, silPrepared.imageData, silOpts);
    const bodyLayers = layersFromSvg(silSvg, source, index, width, height, "Body", {
      minAreaRatio: 0.0012,
      maxLayers: silOpts.maxLayers,
    });

    const markPrepared = imageToImageData(
      img,
      markOpts.maxDimension,
      markOpts.textureKill,
      markOpts.preBlurPasses
    );
    const markSvg = await runTracerPass(ImageTracer, markPrepared.imageData, markOpts);
    const markLayers = layersFromSvg(markSvg, source, index, width, height, "Mark", {
      minAreaRatio: 0.0008,
      accentOnly: true,
      maxLayers: markOpts.maxLayers,
    });

    layers = dedupeLayers([...bodyLayers, ...markLayers]);
    const maxLayers = PATH_DETAIL_PRESETS[detail].maxLayers;
    layers = layers
      .sort((a, b) => pathBBoxArea(b.pathData) - pathBBoxArea(a.pathData))
      .slice(0, maxLayers);
    svg = silSvg;
  } else {
    const options = buildPassOptions(
      modes,
      detail,
      modes.includes("geometry") ? "silhouette" : "single"
    );
    const prepared = imageToImageData(
      img,
      options.maxDimension,
      options.textureKill,
      options.preBlurPasses
    );
    width = prepared.width;
    height = prepared.height;
    svg = await runTracerPass(ImageTracer, prepared.imageData, options);
    layers = layersFromSvg(svg, source, index, width, height, "Layer", {
      minAreaRatio: 0.0004,
      maxLayers: options.maxLayers,
    });
  }

  if (!layers.length) {
    const rawPaths = svg.match(/<path\b[^>]*>/g) ?? [];
    rawPaths.forEach((raw, pathIndex) => {
      const d = extractPathD(raw);
      if (!d) return;
      layers.push({
        id: `trace-${source.id}-fallback-${pathIndex}`,
        name: `${slugify(source.label || "Layer", "Layer")}_${pathIndex + 1}`,
        visible: true,
        locked: false,
        pathData: d,
        color: LAYER_COLORS[pathIndex % LAYER_COLORS.length],
        group: source.label || `Image_${index + 1}`,
        filled: true,
      });
    });
  }

  if (!layers.length) {
    throw new Error(
      `No vector paths found in “${source.label || source.file?.name || "image"}”. Try Balanced detail or a higher-contrast image.`
    );
  }

  const capped = layers.map((layer, i) => ({
    ...layer,
    id: `trace-${source.id}-${i}`,
  }));

  return { layers: capped, svg, width, height };
}
