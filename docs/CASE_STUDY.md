# Case study — Rasm Vector Studio

**Rasm** is a public product case study: a browser-native image-to-vector studio that turns scans, logos, sketches, and photos into layered, editable SVG paths.

Built by [ASK Andalus](https://github.com/ahmadsk-cell).

---

## Problem

Design and production teams still bounce between:

1. Raster cleanup tools that don’t export clean vectors  
2. Online converters that explode scenic photos into thousands of microscopic paths  
3. Desktop suites that are overkill for “trace this mark and export layers”

The gap: a focused **studio workflow** — upload → control fidelity → inspect layers → export — that stays fast on complex imagery.

---

## Solution

Rasm ships as a Next.js app with an in-browser tracer (ImageTracer) and a product shell that feels like a workspace, not a one-shot converter.

### Product surfaces

| Screen | Role |
| --- | --- |
| Login | Branded entry + demo workspace auth |
| Dashboard | Folders, status, project cards |
| Studio | Bulk upload, path detail, geometry/detail modes |
| Workspace | Raster↔vector compare, layer list, export |

### Screenshots

![Login](screenshots/01-login.png)

![Dashboard](screenshots/02-dashboard.png)

![Studio](screenshots/03-studio.png)

![Workspace](screenshots/04-workspace.png)

---

## Key design decisions

### 1. Path detail is a first-class control

Users pick **Simple / Balanced / Detailed / Maximum** before tracing. Presets change:

- Max source dimension (downsample for speed)
- Color count & path omit thresholds
- Blur / line filtering
- Hard cap on retained layers (drops noisy micro-paths)

**Simple** is the recommended path for scenery and photographs; **Balanced** is the default for marks and product shots.

### 2. Trace in the browser first

Default pipeline runs client-side — no Python service required to try the product. An optional `VECTOR_SERVICE_URL` can proxy heavier jobs later.

### 3. Layers over a single blob

Output is a list of named path layers (visibility, lock, group, fill color) so designers can delete background junk and keep the silhouette.

### 4. Premium, quiet UI

Dark-native slate + faded sage accents, display typography, and restrained motion — built to read as a studio tool on a public GitHub page, not a generic AI landing template.

---

## Architecture (short)

```
Upload (react-dropzone)
        ↓
Studio store (Zustand) — modes, pathDetail, batch intent
        ↓
vector-engine → trace-image (ImageTracer + presets)
        ↓
Project record + workspace editor (compare, layers, export)
```

Relevant code:

- `src/lib/trace-image.ts` — presets + ImageTracer wrapper  
- `src/lib/vector-engine.ts` — pipeline / milestones  
- `src/app/(app)/studio/page.tsx` — studio entry  
- `src/components/studio/*` — upload, controls, workspace UI  

---

## Outcomes

- Public repo with a README that shows the product, not just install steps  
- Controllable fidelity so photos don’t freeze the tab or over-path every leaf  
- Demo auth + persisted projects for a believable walkthrough without a backend  

---

## Reproduce the screenshots

With the app running on port 3000:

```bash
npm run capture:case-study
```

Writes PNGs to `docs/screenshots/` using Playwright (fixture marks are generated under `docs/fixtures/`).

---

## What’s next

- Stronger semantic intent (notes currently label layers; tracing remains classical vectorization)  
- Optional server CV path for large batches  
- Production auth provider swap  

---

## Credits

**Rasm** · ASK Andalus · [github.com/ahmadsk-cell](https://github.com/ahmadsk-cell)
