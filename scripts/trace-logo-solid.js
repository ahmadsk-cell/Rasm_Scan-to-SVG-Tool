const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const ImageTracer = require("imagetracerjs");

const root = path.join(__dirname, "..");
const png = PNG.sync.read(fs.readFileSync(path.join(root, "public", "rasm-logo.png")));
const { width, height } = png;

function idx(x, y) {
  return (width * y + x) << 2;
}

// 1) Binary mask of ink
const ink = new Uint8Array(width * height);
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = idx(x, y);
    ink[y * width + x] = png.data[i + 3] > 20 ? 1 : 0;
  }
}

// 2) Dilate several times so calligraphy strokes become solid, chunky shapes
function dilate(src, radius) {
  const out = new Uint8Array(src.length);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      for (let dy = -radius; dy <= radius && !on; dy++) {
        for (let dx = -radius; dx <= radius && !on; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (src[ny * width + nx]) on = 1;
        }
      }
      out[y * width + x] = on;
    }
  }
  return out;
}

// Gentle thicken: 4-connected expand once (lighter than full radius-1 square)
function dilateOrtho(src) {
  const out = new Uint8Array(src.length);
  const dirs = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let on = 0;
      for (const [dx, dy] of dirs) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        if (src[ny * width + nx]) {
          on = 1;
          break;
        }
      }
      out[y * width + x] = on;
    }
  }
  return out;
}

let fat = dilateOrtho(ink);

// 3) Build ImageData: black ink on white
const data = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const on = fat[i];
  const o = i * 4;
  const v = on ? 0 : 255;
  data[o] = v;
  data[o + 1] = v;
  data[o + 2] = v;
  data[o + 3] = 255;
}

const traced = ImageTracer.imagedataToTracedata(
  { width, height, data },
  {
    numberofcolors: 2,
    pathomit: 2,
    ltres: 0.8,
    qtres: 0.8,
    blurradius: 0,
    colorsampling: 0,
    colorquantcycles: 1,
    strokewidth: 0,
    viewbox: true,
    scale: 1,
    roundcoords: 1,
    linefilter: false,
    rightangleenhance: true,
    pal: [
      { r: 0, g: 0, b: 0, a: 255 },
      { r: 255, g: 255, b: 255, a: 255 },
    ],
  }
);

const svg = ImageTracer.getsvgstring(traced, {
  viewbox: true,
  strokewidth: 0,
  roundcoords: 1,
  scale: 1,
});

const paths = [...svg.matchAll(/<path[^>]*>/g)].map((m) => m[0]);
const blackPaths = paths.filter((p) => !/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/.test(p));

/**
 * Keep only the first subpath (outer contour) so shapes fill solid,
 * instead of hollow ribbons from hole contours.
 */
function outerOnly(d) {
  const parts = d.split(/(?=[Mm])/).filter(Boolean);
  return (parts[0] || d).trim();
}

const pathEls = blackPaths
  .map((p) => {
    const dMatch = p.match(/\sd="([^"]+)"/);
    if (!dMatch) return null;
    const d = outerOnly(dMatch[1]);
    if (d.length < 12) return null;
    return `<path d="${d}" />`;
  })
  .filter(Boolean)
  .join("\n      ");

const sage = "#8fae8b";

const react = `import { cn } from "@/lib/utils";

/** Solid filled Rasm mark (dilated + outer contours only). */
export function RasmMarkSvg({
  size = 48,
  className,
  title = "Rasm",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const height = Math.round(size * (${height} / ${width}));
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      width={size}
      height={height}
      className={cn("shrink-0", className)}
      role="img"
      aria-label={title || undefined}
    >
      {title ? <title>{title}</title> : null}
      <g fill="${sage}" stroke="${sage}" strokeWidth={0.5} strokeLinejoin="round">
        ${pathEls}
      </g>
    </svg>
  );
}
`;

const plain = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <g fill="${sage}" stroke="${sage}" stroke-width="0.5" stroke-linejoin="round">
    ${pathEls}
  </g>
</svg>
`;

fs.writeFileSync(path.join(root, "src", "components", "layout", "rasm-mark-svg.tsx"), react);
fs.writeFileSync(path.join(root, "public", "rasm-logo.svg"), plain);
console.log({ paths: blackPaths.length, emitted: pathEls.split("\n").length });
