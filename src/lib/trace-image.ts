import type { AnalysisMode, PathDetailLevel, VectorLayer } from "@/types";

const FALLBACK_COLORS = ["#c44536", "#1a1a1a", "#b08d57", "#8fae8b", "#7a92a8", "#c4a06a"];

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
    colors: number;
    pathomit: number;
    ltres: number;
    qtres: number;
    maxLayers: number;
  }
> = {
  simple: {
    label: "Simple",
    hint: "A few smooth shapes. Best for scenery and quick silhouettes.",
    maxDimension: 800,
    colors: 3,
    pathomit: 32,
    ltres: 1.8,
    qtres: 1.8,
    maxLayers: 8,
  },
  balanced: {
    label: "Balanced",
    hint: "Clean product shapes — body, sole, and main marks.",
    maxDimension: 1000,
    colors: 5,
    pathomit: 22,
    ltres: 1.55,
    qtres: 1.55,
    maxLayers: 14,
  },
  detailed: {
    label: "Detailed",
    hint: "More color regions. Still ignores knit noise and floor shadows.",
    maxDimension: 1200,
    colors: 8,
    pathomit: 8,
    ltres: 0.5,
    qtres: 0.5,
    maxLayers: 36,
  },
  maximum: {
    label: "Maximum",
    hint: "Finest regions. Slower, and textured photos get busier paths.",
    maxDimension: 1400,
    colors: 12,
    pathomit: 4,
    ltres: 0.28,
    qtres: 0.28,
    maxLayers: 64,
  },
};

function yieldToMain() {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });
}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for tracing"));
    img.src = url;
  });
}

function lumaOf(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/** White and neutral backdrop pixels. */
function isStudioBackground(r: number, g: number, b: number) {
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const luma = lumaOf(r, g, b);
  if (luma >= 242) return true;
  if (chroma <= 28 && luma >= 150) return true;
  return false;
}

/**
 * Warm contact shadows under a colored product. Saturated shoe pixels are excluded
 * so the fill stops at the upper.
 */
function isSoftContactShadow(r: number, g: number, b: number) {
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  const luma = lumaOf(r, g, b);
  if (luma < 145 || luma > 236) return false;
  if (chroma > 72) return false;
  return true;
}

/**
 * Flood from the image border through white and soft contact shadows.
 * The subject stays, because saturated pixels block the fill.
 */
function clearConnectedBackground(imageData: ImageData) {
  const { data, width, height } = imageData;
  const count = width * height;
  const seen = new Uint8Array(count);
  const qx = new Int32Array(count);
  const qy = new Int32Array(count);
  let head = 0;
  let tail = 0;

  const push = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index]) return;
    const i = index * 4;
    if (!isStudioBackground(data[i], data[i + 1], data[i + 2])) return;
    seen[index] = 1;
    qx[tail] = x;
    qy[tail] = y;
    tail++;
  };

  for (let x = 0; x < width; x++) {
    push(x, 0);
    push(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    push(0, y);
    push(width - 1, y);
  }

  while (head < tail) {
    const x = qx[head];
    const y = qy[head];
    head++;
    const i = (y * width + x) * 4;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    push(x - 1, y);
    push(x + 1, y);
    push(x, y - 1);
    push(x, y + 1);
  }

  // Continue from the cleared backdrop into the tinted floor shadow.
  head = 0;
  tail = 0;
  seen.fill(0);
  const pushShadow = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const index = y * width + x;
    if (seen[index]) return;
    const i = index * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const alreadyClear = r > 250 && g > 250 && b > 250;
    if (!alreadyClear && !isSoftContactShadow(r, g, b)) return;
    seen[index] = 1;
    qx[tail] = x;
    qy[tail] = y;
    tail++;
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250) pushShadow(x, y);
    }
  }
  while (head < tail) {
    const x = qx[head];
    const y = qy[head];
    head++;
    const i = (y * width + x) * 4;
    data[i] = 255;
    data[i + 1] = 255;
    data[i + 2] = 255;
    pushShadow(x - 1, y);
    pushShadow(x + 1, y);
    pushShadow(x, y - 1);
    pushShadow(x, y + 1);
  }
}

/** Peel a couple of light-gray pixels sitting against the cleared backdrop. */
function peelBackgroundFringe(imageData: ImageData, passes = 2) {
  const { data, width, height } = imageData;
  for (let pass = 0; pass < passes; pass++) {
    const kill: number[] = [];
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = (y * width + x) * 4;
        if (!isStudioBackground(data[i], data[i + 1], data[i + 2])) continue;
        const up = ((y - 1) * width + x) * 4;
        const dn = ((y + 1) * width + x) * 4;
        const lf = (y * width + (x - 1)) * 4;
        const rt = (y * width + (x + 1)) * 4;
        const touchesWhite =
          data[up] > 250 || data[dn] > 250 || data[lf] > 250 || data[rt] > 250;
        if (touchesWhite) kill.push(i);
      }
    }
    for (const i of kill) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
}

function posterize(imageData: ImageData, colorCount: number) {
  const { data, width, height } = imageData;
  const samples: Array<[number, number, number]> = [];
  const pixels = width * height;
  const step = Math.max(1, Math.floor(pixels / 9000));

  for (let p = 0; p < pixels; p += step) {
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 248 && g > 248 && b > 248) continue;
    samples.push([r, g, b]);
  }

  if (samples.length < colorCount) return;

  const centroids: Array<[number, number, number]> = [];
  centroids.push(samples[Math.floor(samples.length / 2)]);
  while (centroids.length < colorCount) {
    let best = 0;
    let bestDist = -1;
    for (let s = 0; s < samples.length; s += 3) {
      const sample = samples[s];
      let nearest = Infinity;
      for (const c of centroids) {
        const dr = sample[0] - c[0];
        const dg = sample[1] - c[1];
        const db = sample[2] - c[2];
        nearest = Math.min(nearest, dr * dr + dg * dg + db * db);
      }
      if (nearest > bestDist) {
        bestDist = nearest;
        best = s;
      }
    }
    centroids.push([...samples[best]]);
  }

  const sums = centroids.map(() => [0, 0, 0, 0]);
  for (let iter = 0; iter < 7; iter++) {
    for (const row of sums) row.fill(0);
    for (const sample of samples) {
      let best = 0;
      let bestDist = Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const dr = sample[0] - centroids[c][0];
        const dg = sample[1] - centroids[c][1];
        const db = sample[2] - centroids[c][2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < bestDist) {
          bestDist = dist;
          best = c;
        }
      }
      sums[best][0] += sample[0];
      sums[best][1] += sample[1];
      sums[best][2] += sample[2];
      sums[best][3] += 1;
    }
    for (let c = 0; c < centroids.length; c++) {
      const n = sums[c][3] || 1;
      centroids[c] = [
        Math.round(sums[c][0] / n),
        Math.round(sums[c][1] / n),
        Math.round(sums[c][2] / n),
      ];
    }
  }

  for (let p = 0; p < pixels; p++) {
    const i = p * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r > 248 && g > 248 && b > 248) continue;
    let best = 0;
    let bestDist = Infinity;
    for (let c = 0; c < centroids.length; c++) {
      const dr = r - centroids[c][0];
      const dg = g - centroids[c][1];
      const db = b - centroids[c][2];
      const dist = dr * dr + dg * dg + db * db;
      if (dist < bestDist) {
        bestDist = dist;
        best = c;
      }
    }
    data[i] = centroids[best][0];
    data[i + 1] = centroids[best][1];
    data[i + 2] = centroids[best][2];
  }
}

function prepareImage(
  img: HTMLImageElement,
  maxDimension: number,
  colors: number,
  removeBackground: boolean
) {
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

  const imageData = ctx.getImageData(0, 0, width, height);
  if (removeBackground) {
    clearConnectedBackground(imageData);
    peelBackgroundFringe(imageData);
    // Drop leftover gray pixels that are not the subject, without blurring
    // (a blur mixes the sole back into the shadow and recreates the puddle).
    const { data, width, height } = imageData;
    for (let p = 0; p < width * height; p++) {
      const i = p * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const luma = lumaOf(r, g, b);
      if (chroma < 18 && luma > 90 && luma < 250) {
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
      }
    }
  }
  posterize(imageData, colors);
  return { imageData, width, height };
}

function rgbToHex(r: number, g: number, b: number) {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

function colorName(hex: string) {
  const rgb = hex.match(/\w\w/g)?.map((h) => parseInt(h, 16)) ?? [0, 0, 0];
  const [r, g, b] = rgb;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  if (luma < 42) return "Black";
  if (chroma < 18) {
    if (luma > 190) return "Highlight";
    if (luma > 115) return "Gray";
    return "Charcoal";
  }
  if (r >= g && r >= b) {
    if (g > 95 && b < 150 && g > r * 0.62) return "Gold";
    if (g > 70 && r > 150) return "Orange";
    return "Red";
  }
  if (g >= r && g >= b) return "Green";
  return "Blue";
}

function pathBounds(d: string) {
  const nums = d.match(/-?\d*\.?\d+/g);
  if (!nums || nums.length < 4) return null;
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
  if (!Number.isFinite(minX)) return null;
  return { minX, maxX, minY, maxY };
}

function pathArea(d: string) {
  const bounds = pathBounds(d);
  if (!bounds) return 0;
  return Math.max(0, bounds.maxX - bounds.minX) * Math.max(0, bounds.maxY - bounds.minY);
}

/** Wide, short shape sitting under the subject — leftover floor shadow. */
function isFloorShadow(d: string, width: number, height: number) {
  const bounds = pathBounds(d);
  if (!bounds) return false;
  const w = bounds.maxX - bounds.minX;
  const h = bounds.maxY - bounds.minY;
  const midY = (bounds.minY + bounds.maxY) / 2;
  return midY > height * 0.78 && h < height * 0.14 && w > width * 0.18;
}

function isNearWhite(r: number, g: number, b: number) {
  return r > 242 && g > 242 && b > 242;
}

function isLeftoverShadow(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  return max - min <= 22 && luma >= 140 && luma <= 235;
}

/**
 * Trace one image into filled SVG layers.
 * Studio backgrounds and contact shadows are removed before colors are simplified.
 */
export async function traceImageToLayers(
  source: TraceSource,
  _modes: AnalysisMode[],
  index = 0,
  detail: PathDetailLevel = "balanced",
  removeBackground = true
): Promise<TraceResult> {
  const ImageTracer = (await import("imagetracerjs")).default;
  const preset = PATH_DETAIL_PRESETS[detail];
  await yieldToMain();

  const img = await loadImageElement(source.previewUrl);
  const { imageData, width, height } = prepareImage(
    img,
    preset.maxDimension,
    preset.colors,
    removeBackground
  );

  const options = {
    numberofcolors: preset.colors + 1,
    pathomit: preset.pathomit,
    ltres: preset.ltres,
    qtres: preset.qtres,
    blurradius: 0,
    blurdelta: 32,
    colorsampling: 2,
    colorquantcycles: 1,
    mincolorratio: 0.008,
    strokewidth: 0,
    linefilter: true,
    rightangleenhance: false,
    roundcoords: 1,
    viewbox: true,
    scale: 1,
  };

  await yieldToMain();
  const traced = ImageTracer.imagedataToTracedata(imageData, options);
  await yieldToMain();
  const svg = ImageTracer.getsvgstring(traced, options) as string;

  const doc = new DOMParser().parseFromString(svg, "image/svg+xml");
  const group = source.label || `Image ${index + 1}`;
  const minArea = width * height * 0.0015;
  const layers: VectorLayer[] = [];
  const nameCounts = new Map<string, number>();

  doc.querySelectorAll("path").forEach((path, pathIndex) => {
    const d = path.getAttribute("d");
    if (!d || d.length < 12) return;
    if (pathArea(d) < minArea) return;
    if (removeBackground && isFloorShadow(d, width, height)) return;

    const fill = path.getAttribute("fill") || "";
    const rgb = fill.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    const r = rgb ? Number(rgb[1]) : 180;
    const g = rgb ? Number(rgb[2]) : 60;
    const b = rgb ? Number(rgb[3]) : 40;
    if (isNearWhite(r, g, b) || isLeftoverShadow(r, g, b)) return;

    const color = rgb ? rgbToHex(r, g, b) : FALLBACK_COLORS[pathIndex % FALLBACK_COLORS.length];
    const base = colorName(color);
    const seen = (nameCounts.get(base) ?? 0) + 1;
    nameCounts.set(base, seen);
    layers.push({
      id: `trace-${source.id}-${pathIndex}`,
      name: seen === 1 ? base : `${base} ${seen}`,
      visible: true,
      locked: false,
      pathData: d,
      color,
      group,
      filled: true,
    });
  });

  if (!layers.length) {
    throw new Error(
      `No shapes found in “${source.label || "image"}”. Try a higher-contrast image, or turn background removal off.`
    );
  }

  layers.sort((a, b) => pathArea(b.pathData) - pathArea(a.pathData));
  const capped = layers.slice(0, preset.maxLayers).map((layer, i) => ({
    ...layer,
    id: `trace-${source.id}-${i}`,
  }));

  return { layers: capped, svg, width, height };
}
