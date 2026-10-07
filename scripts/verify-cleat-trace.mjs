/**
 * Traces the sample cleat through the running app and saves a workspace screenshot.
 * Usage: node scripts/verify-cleat-trace.mjs
 */
import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir } from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CLEAT = path.join(ROOT, "docs", "fixtures", "sample-cleat.png");
const OUT = path.join(ROOT, "docs", "screenshots", "06-cleat-trace.png");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

async function main() {
  await mkdir(path.dirname(OUT), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    colorScheme: "dark",
  });
  const page = await context.newPage();
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));

  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem("theme", "dark");
  });
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle" });
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/dashboard");

  await page.goto(`${BASE_URL}/studio`, { waitUntil: "networkidle" });
  await page.locator('input[type="file"]').setInputFiles(CLEAT);
  await page.waitForTimeout(600);

  await page.getByRole("button", { name: "Balanced" }).click();
  const bgSwitch = page.locator("#remove-bg");
  if (await bgSwitch.count()) {
    const checked = await bgSwitch.getAttribute("data-state");
    if (checked !== "checked") await bgSwitch.click();
  }

  await page.getByRole("button", { name: /Trace/i }).first().click();
  await page.waitForURL(/\/studio\/proj-/, { timeout: 180000 });
  await page.waitForTimeout(1800);

  // Dismiss toasts
  const closes = page.locator("[data-sonner-toast] button");
  for (let i = 0; i < (await closes.count()); i++) {
    await closes.nth(i).click().catch(() => {});
  }
  await page.waitForTimeout(400);

  // Show more of the vector side for review
  const slider = page.getByRole("slider", { name: /Compare/i });
  if (await slider.count()) {
    await slider.fill("32");
  }
  await page.waitForTimeout(300);

  await page.screenshot({ path: OUT, fullPage: false });
  const layerText = await page.locator("text=/\\d+ layers?/i").first().textContent();
  console.log(`Saved ${OUT}`);
  console.log(`Workspace: ${layerText}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
