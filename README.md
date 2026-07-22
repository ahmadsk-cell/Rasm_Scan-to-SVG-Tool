# VectorPath AI

Enterprise footwear vectorization studio — convert product imagery (optimized for sports cleats) into multi-layered, geometrically precise SVG paths.

## Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS 4** + Shadcn-style Radix primitives
- **Framer Motion** micro-interactions
- **Zustand** for project / studio state
- Demo auth (swap-in ready for Clerk or NextAuth)
- Vector pipeline with microservice hook (`VECTOR_SERVICE_URL`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign in with the demo credentials on `/login`, then explore the dashboard and Studio.

## App routes

| Route | Description |
| --- | --- |
| `/login` | Workspace sign-in |
| `/dashboard` | Project grid, folders, status filters |
| `/studio` | Upload, analysis modes, processing |
| `/studio/[projectId]` | Split-view editor, layers, tuning, export |
| `/settings` | Workspace + integration notes |
| `POST /api/vectorize` | Vectorization API |

## Vector engine

The in-app pipeline simulates production CV milestones (background isolation → contour detection → bezier optimization) and emits structured SVG layers. For live inference, set:

```bash
VECTOR_SERVICE_URL=https://your-cv-service.example.com
```

The API route will proxy to `{VECTOR_SERVICE_URL}/vectorize`.

## Scripts

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint
```
