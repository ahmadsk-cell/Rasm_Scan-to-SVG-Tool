# How to use Rasm (simple guide)

<img src="../public/rasm-logo.png" alt="Rasm logo" width="120" />

**Rasm** turns regular pictures (PNG, JPEG, or WebP) into **SVG vectors** you can edit and download. You do **not** need to know GitHub or coding to use it once someone has started the app for you.

Built by **[ASK Andalus](https://github.com/ahmadsk-cell)**.

---

## What you’ll need

- A computer with a modern browser (Chrome, Edge, Firefox, or Safari)
- Image files you want to convert (logos, sketches, photos, icons, etc.)
- The Rasm app running (see “Starting Rasm” below if you’re setting it up yourself)

---

## Starting Rasm (first time / local setup)

If a developer already gave you a website link (like `https://…`), **skip this section** and open that link.

If you’re running Rasm on your own computer:

1. Install **Node.js** from [nodejs.org](https://nodejs.org) (choose the LTS version).  
   You only need this once.
2. Open the project folder on your computer (`Scan to SVG Tool` / Rasm).
3. Open a terminal in that folder (on Windows: right‑click the folder → “Open in Terminal”).
4. Type these commands, one at a time, and press Enter after each:

```text
npm install
npm run dev
```

5. When it says the app is ready, open your browser and go to:

```text
http://localhost:3000
```

Leave the terminal window open while you use Rasm. Closing it stops the app.

---

## Step 1 — Sign in

1. You’ll land on the **login** screen.
2. Enter any work email (demo mode accepts the default).
3. Click **Continue to workspace**.

You don’t need a GitHub account for this demo login.

---

## Step 2 — Open the Studio

1. On the left menu, click **Studio**.  
   (On a phone or small screen, use the bottom bar → **Studio**.)
2. This is where you upload images and turn them into vectors.

---

## Step 3 — Upload your images

1. Drag and drop files into the big dashed box, **or** click it and choose files.
2. You can upload **one image** or **many at once** (bulk upload).
3. Supported types: **PNG**, **JPEG/JPG**, **WebP** (max about 25MB each).

Tips for better results:

- Product photos on white: leave **Cut background** on and use **Balanced**.
- Busy scenery: use **Simple**.
- **Detailed** and **Maximum** keep more color regions and take longer.

---

## Step 4 — Set path detail

1. On the right under **Path detail**, pick how fine the tracing should be:
   - **Simple** — few smooth shapes  
   - **Balanced** — default for product photos  
   - **Detailed / Maximum** — more regions (slower)
2. **Cut background** removes the white backdrop and the soft floor shadow. Turn it off only if the background is part of the artwork.
3. **Project name** is optional. If you leave it blank, Rasm uses the file name.

---

## Step 5 — Start vectorization

1. Click **Trace image** (or **Trace N** if you uploaded several).
2. Watch the progress steps (preparing → tracing → assembling layers).
3. When it finishes, Rasm opens the **workspace** with your result.

---

## Step 6 — Review and edit

In the workspace you’ll see:

- **Compare slider** — original picture vs vector, lined up on the same frame  
- **Layers** — named by color (Red, Gold, Black). Hide, rename, or lock them

Drag the compare slider to check the trace against the photo.

---

## Step 7 — Download your vector

1. Click **Export**.
2. Pick a format:
   - **Optimized SVG** — best for most people (Illustrator, Figma, web, print)
   - **DXF / CAD** — for some CAD tools
   - **JSON Manifest** — for developers / pipelines
   - **AI Package** — SVG bundle friendly to Illustrator workflows
3. Click **Download**.
4. Open the file from your Downloads folder in your design tool.

---

## Finding your projects later

- Click **Dashboard** in the menu.
- You’ll see past jobs, their status (Completed / Processing / Failed), and folders.
- Click a project card to open it again.

---

## Dark / light theme

- Use the sun/moon button in the sidebar (or on the login page) to switch themes.
- The Rasm logo uses the same faded sage green as the rest of the interface so it stays visible in light and dark themes.

---

## About Rasm & ASK Andalus

**Rasm** (Arabic for drawing / sketching) is a general-purpose image-to-vector studio: upload almost any image and get editable SVG layers.

**ASK Andalus** builds the project.  
GitHub: [https://github.com/ahmadsk-cell](https://github.com/ahmadsk-cell)

If something fails, try a simpler image first, or turn **Detail Extraction** off and use **Geometry Mode** alone.

---

## Quick checklist

| Step | Action |
| --- | --- |
| 1 | Open Rasm (`localhost:3000` or your shared link) |
| 2 | Sign in |
| 3 | Go to **Studio** |
| 4 | Upload image(s) |
| 5 | (Optional) describe what to extract |
| 6 | Click **Start vectorization** |
| 7 | Review layers |
| 8 | **Export** → download SVG |
