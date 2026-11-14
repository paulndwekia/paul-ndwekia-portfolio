import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const playwrightPath = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = await import(playwrightPath);
const projectsData = JSON.parse(await readFile("data/projects.json", "utf8"));
const projects = (projectsData.projects || []).filter(project => (project.preview_url || project.live_url) && project.preview_image);
const outputDir = path.resolve("assets/previews");
await mkdir(outputDir, { recursive: true });

if (!projects.length) {
  console.log("No hosted projects have preview paths configured.");
  process.exit(0);
}

const browser = await chromium.launch({ headless: true });
let captured = 0;
let failed = 0;

try {
  for (const project of projects) {
    // All browser captures are JPEGs. Never put JPEG bytes behind an SVG/PNG extension.
    const configuredName = path.basename(project.preview_image);
    const jpegName = configuredName.replace(/\\.(?:svg|png|webp|jpe?g)$/i, ".jpg");
    const outputPath = path.join(outputDir, jpegName);
    const context = await browser.newContext({
      viewport: { width: 1440, height: 960 },
      deviceScaleFactor: 1,
      ignoreHTTPSErrors: true,
      reducedMotion: "reduce"
    });
    const page = await context.newPage();
    try {
      const captureUrl = project.preview_url || project.live_url;
      console.log(`Capturing ${project.name}: ${captureUrl}`);
      let response = null;
      let navigationError = null;
      for (let attempt = 1; attempt <= 4; attempt++) {
        try {
          response = await page.goto(captureUrl, {
            waitUntil: "domcontentloaded",
            timeout: 90000
          });
          if (response && response.status() >= 500) throw new Error(`Website returned HTTP ${response.status()}`);
          if (response && response.status() >= 400) throw new Error(`Permanent website response HTTP ${response.status()}`);
          navigationError = null;
          break;
        } catch (error) {
          navigationError = error;
          if (attempt < 4 && !String(error.message).startsWith("Permanent website response")) {
            console.warn(`Attempt ${attempt}/4 failed for ${project.name}: ${error.message}; retrying in 20 seconds.`);
            await page.waitForTimeout(20000);
          }
        }
      }
      if (navigationError) throw navigationError;
      try {
        await page.waitForLoadState("networkidle", { timeout: 12000 });
      } catch {
        // Some dashboards keep connections open; a stable visible render is sufficient.
      }
      await page.waitForTimeout(5000);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: outputPath,
        type: "jpeg",
        quality: 84,
        fullPage: false,
        animations: "disabled"
      });
      const file = await stat(outputPath);
      if (file.size < 12000) throw new Error(`Screenshot unexpectedly small (${file.size} bytes)`);
      const signature = await readFile(outputPath);
      if (signature[0] !== 0xff || signature[1] !== 0xd8 || signature[2] !== 0xff) {
        throw new Error("Captured file does not have a JPEG signature.");
      }
      console.log(`Saved ${outputPath} (${file.size} bytes)`);
      captured++;
    } catch (error) {
      console.warn(`Could not capture ${project.name}: ${error.message}`);
      failed++;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

console.log(`Project screenshots: ${captured} captured, ${failed} unavailable.`);
