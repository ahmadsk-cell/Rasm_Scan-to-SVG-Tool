<p align="center">
  <img src="public/rasm-logo.png" alt="Rasm" width="140" />
</p>

# Rasm

General image-to-vector studio — upload any image and turn it into multi-layered, editable SVG paths.

Built by [ASK Andalus](https://github.com/ahmadsk-cell).

> **New here?** Start with the plain-language guide:  
> **[guides/HOW_TO_USE_RASM.md](guides/HOW_TO_USE_RASM.md)** — step-by-step for people who don’t use GitHub.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + Shadcn-style Radix primitives
- **Framer Motion** micro-interactions
- **Zustand** for project / studio state
- Demo auth (swap-in ready for Clerk or NextAuth)
- Browser tracing via ImageTracer (optional `VECTOR_SERVICE_URL` for a CV microservice)

## Getting started (developers)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in on `/login`, then open **Studio**.

## App routes

| Route | Description |
| --- | --- |
| `/login` | Workspace sign-in |
| `/dashboard` | Project grid, folders, status filters |
| `/studio` | Bulk upload, extraction intent, processing |
| `/studio/[projectId]` | Split-view editor, layers, export |
| `/settings` | Workspace, about/credits, integrations |
| `POST /api/vectorize` | Optional upstream CV service proxy |

## Vector engine

The Studio traces images **in the browser** with [ImageTracer](https://github.com/jankovicsandras/imagetracerjs) (color quantization → contour paths → SVG layers). No Python service required for basic use.

Optional: set `VECTOR_SERVICE_URL` to proxy heavier jobs to an OpenCV/Potrace microservice.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```
