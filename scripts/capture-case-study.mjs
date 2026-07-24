/**
 * Captures product screenshots for the public GitHub case-study package.
 * Requires the Next.js app running at BASE_URL (default http://localhost:3000).
 *
 * Usage: node scripts/capture-case-study.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs", "screenshots");
const FIXTURES = path.join(ROOT, "docs", "fixtures");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function dismissToasts(page) {
  const closeButtons = page.locator("[data-sonner-toast] button");
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    await closeButtons.nth(i).click().catch(() => {});
  }
  await page.waitForTimeout(300);
}

async function createFixtures(page) {
  await mkdir(FIXTURES, { recursive: true });

  const buffers = await page.evaluate(async () => {
    function canvasToPng(width, height, paint) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      paint(ctx, width, height);
      const dataUrl = canvas.toDataURL("image/png");
      const binary = atob(dataUrl.split(",")[1]);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return Array.from(bytes);
    }

    const mark = canvasToPng(640, 480, (ctx, w, h) => {
      ctx.fillStyle = "#f4f6f5";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#2f4a38";
      ctx.beginPath();
      ctx.moveTo(w * 0.22, h * 0.72);
      ctx.lineTo(w * 0.5, h * 0.18);
      ctx.lineTo(w * 0.78, h * 0.72);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#8fae8b";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.58, w * 0.11, 0, Math.PI * 2);
      ctx.fill();
    });

    const icon = canvasToPng(512, 512, (ctx, w, h) => {
      ctx.fillStyle = "#121416";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#8fae8b";
      const r = 48;
      ctx.beginPath();
      ctx.moveTo(r, 96);
      ctx.arcTo(w - 96, 96, w - 96, h - 96, r);
      ctx.arcTo(w - 96, h - 96, 96, h - 96, r);
      ctx.arcTo(96, h - 96, 96, 96, r);
      ctx.arcTo(96, 96, w - 96, 96, r);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#121416";
      ctx.fillRect(180, 170, 152, 28);
      ctx.fillRect(180, 242, 152, 28);
      ctx.fillRect(180, 314, 100, 28);
    });

    return { mark, icon };
  });

  await writeFile(path.join(FIXTURES, "sample-mark.png"), Buffer.from(buffers.mark));
  await writeFile(path.join(FIXTURES, "sample-icon.png"), Buffer.from(buffers.icon));
  return {
    mark: path.join(FIXTURES, "sample-mark.png"),
    icon: path.join(FIXTURES, "sample-icon.png"),
  };
}

async function settle(page, ms = 500) {
  await page.waitForTimeout(ms);
  await page.waitForLoadState("networkidle").catch(() => {});
}

async function shot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  console.log(`✓ ${name}.png`);
  return file;
}

async function forceDark(page) {
  await page.addInitScript(() => {
    localStorage.setItem("theme", "dark");
  });
}

async function signIn(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await settle(page, 400);
  // Capture login before submitting
  await shot(page, "01-login");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await settle(page, 700);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await forceDark(page);

  // Warm app + create fixtures in a blank page first
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  const fixtures = await createFixtures(page);

  // Fresh auth state on the app origin
  await context.clearCookies();
  await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("theme", "dark");
  });

  await signIn(page);

  await page.goto(`${BASE_URL}/studio`, { waitUntil: "networkidle" });
  await settle(page, 600);

  // Upload sample mark so Studio looks populated
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles([fixtures.mark, fixtures.icon]);
  await settle(page, 900);
  await dismissToasts(page);

  // Ensure Balanced/Simple detail UI is visible
  await page.getByText("Path detail", { exact: true }).scrollIntoViewIfNeeded().catch(() => {});
  await settle(page, 400);
  await shot(page, "03-studio");

  // Prefer Simple for a fast, clean trace
  const simpleBtn = page.getByRole("button", { name: "Simple" });
  if (await simpleBtn.count()) {
    await simpleBtn.click();
    await settle(page, 200);
  }

  await page.getByRole("button", { name: /Trace/i }).first().click();

  // Wait for navigation into workspace
  await page.waitForURL(/\/studio\/proj-/, { timeout: 120000 });
  await settle(page, 1400);
  await dismissToasts(page);
  await settle(page, 400);
  await shot(page, "04-workspace");

  // Projects overview (seed + traced jobs)
  await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle" });
  await settle(page, 900);
  await dismissToasts(page);
  await shot(page, "02-dashboard");

  await browser.close();
  console.log(`\nScreenshots written to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
