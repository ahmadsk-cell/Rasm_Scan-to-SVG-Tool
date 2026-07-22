const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const svg = fs.readFileSync(path.join(root, "public", "rasm-logo.svg"), "utf8");
const body = svg
  .replace(/^<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .trim();

const out = `import { cn } from "@/lib/utils";

/** Filled calligraphic mark — paths traced from the logo PNG, colored via currentColor (theme sage). */
export function RasmMarkSvg({
  size = 44,
  className,
  title = "Rasm",
}: {
  size?: number;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 286 250"
      width={size}
      height={Math.round(size * (250 / 286))}
      fill="currentColor"
      className={cn("shrink-0 text-primary", className)}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      ${body}
    </svg>
  );
}
`;

fs.writeFileSync(path.join(root, "src", "components", "layout", "rasm-mark-svg.tsx"), out);
console.log("wrote rasm-mark-svg.tsx", out.length);
