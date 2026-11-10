import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const modulePath = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = await import(modulePath);
const root = process.cwd();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp"
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    const pathname = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
    const filePath = path.resolve(root, "." + pathname);
    if (!filePath.startsWith(root + path.sep) && filePath !== path.join(root, "index.html")) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const content = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;
const browser = await chromium.launch({ headless: true });
const errors = [];

try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  page.on("pageerror", error => errors.push(error.message));
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => {
    const button = document.querySelector('[data-filter="all"]');
    return button && button.getAttribute("aria-pressed") === "true";
  });
  const total = await page.locator(".project-card").count();
  if (total !== 9) throw new Error(`Expected 9 project cards; found ${total}.`);

  const cases = [
    { key: "live", visible: 5, status: "Showing 5 of 9 projects" },
    { key: "progress", visible: 9, status: "Showing 9 of 9 projects" },
    { key: "completed", visible: 0, status: "Showing 0 of 9 projects" },
    { key: "all", visible: 9, status: "Showing all 9 projects" }
  ];

  for (const test of cases) {
    await page.locator(`[data-filter="${test.key}"]`).click();
    await page.waitForFunction(
      expected => document.querySelectorAll(".project-card:not([hidden])").length === expected,
      test.visible
    );
    const actualStatus = await page.locator("#project-filter-status").textContent();
    if (!actualStatus.includes(test.status)) {
      throw new Error(`${test.key} status mismatch: ${actualStatus}`);
    }
    const activeCount = await page.locator('.filter-button[aria-pressed="true"]').count();
    if (activeCount !== 1) throw new Error(`${test.key}: expected exactly one active category, found ${activeCount}.`);
  }

  if (await page.locator("#project-empty-state").isVisible()) {
    throw new Error("Empty state should be hidden when Everything is selected.");
  }
  if (errors.length) throw new Error("Browser JavaScript errors: " + errors.join("; "));

  console.log("PASS: Everything, Completed, Live sites and In progress filters work on a 390px mobile viewport.");
  console.log("PASS: Project counts, visible cards, active state, status text and empty state are consistent.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
