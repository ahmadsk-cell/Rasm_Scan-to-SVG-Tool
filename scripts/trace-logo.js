const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const ImageTracer = require("imagetracerjs");

const root = path.join(__dirname, "..");
const input = path.join(root, "public", "rasm-logo.png");
const png = PNG.sync.read(fs.readFileSync(input));
const { width, height, data } = png;

const imgd = {
  width,
  height,
  data: Buffer.from(data),
};

for (let i = 0; i < imgd.data.length; i += 4) {
  const a = imgd.data[i + 3];
  if (a > 20) {
    imgd.data[i] = 0;
    imgd.data[i + 1] = 0;
    imgd.data[i + 2] = 0;
    imgd.data[i + 3] = 255;
  } else {
    imgd.data[i] = 255;
    imgd.data[i + 1] = 255;
    imgd.data[i + 2] = 255;
    imgd.data[i + 3] = 255;
  }
}

const options = {
  numberofcolors: 2,
  pathomit: 0,
  ltres: 0.4,
  qtres: 0.4,
  blurradius: 0,
  colorsampling: 0,
  colorquantcycles: 1,
  strokewidth: 0,
  viewbox: true,
  scale: 1,
  roundcoords: 2,
  linefilter: false,
  rightangleenhance: false,
  pal: [
    { r: 0, g: 0, b: 0, a: 255 },
    { r: 255, g: 255, b: 255, a: 255 },
  ],
};

const traced = ImageTracer.imagedataToTracedata(imgd, options);
const svg = ImageTracer.getsvgstring(traced, options);
const paths = [...svg.matchAll(/<path[^>]*>/g)].map((m) => m[0]);

const kept = paths.filter((p) => !/rgb\(\s*255\s*,\s*255\s*,\s*255\s*\)/.test(p));

const filled = kept
  .map((p) => {
    let next = p.replace(/\s(fill|stroke|stroke-width|opacity)="[^"]*"/g, "");
    next = next.replace("<path", '<path fill="currentColor" stroke="none"');
    return next;
  })
  .join("\n  ");

const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="currentColor" role="img" aria-label="Rasm">
  ${filled}
</svg>
`;

fs.writeFileSync(path.join(root, "public", "rasm-logo.svg"), out);
fs.writeFileSync(path.join(root, "src", "components", "layout", "rasm-mark.svg"), out);

console.log({ width, height, totalPaths: paths.length, kept: kept.length, bytes: out.length });
