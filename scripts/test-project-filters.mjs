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
  page.on("console", message => { if (message.type() === "error") errors.push("console: " + message.text()); });
  await page.goto(origin, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.documentElement.dataset.filtersReady === "true" && document.documentElement.dataset.projectCatalogueReady === "true");
  const sourceProjects = JSON.parse(await readFile("data/projects.json", "utf8")).projects || [];
  const sourceEvidence = JSON.parse(await readFile("data/linkedin-evidence.json", "utf8")).evidence || [];
  const evidenceSlugs = new Set(sourceEvidence
    .filter(item => item.post_url || item.source_url)
    .map(item => item.project_slug));
  const statusOf = project => project.portfolio_status || (project.live_url ? "live" : "in-progress");
  const completed = project => evidenceSlugs.has(project.slug) || ["completed", "live"].includes(statusOf(project));
  const expectedGroups = {
    live: sourceProjects.filter(project => project.site_status === "live" && Boolean(project.live_url)),
    progress: sourceProjects.filter(project => !completed(project) && statusOf(project) !== "live"),
    completed: sourceProjects.filter(completed),
    all: sourceProjects
  };
  const total = await page.locator(".project-card").count();
  if (total !== sourceProjects.length) {
    throw new Error(`Project catalogue mismatch: expected ${sourceProjects.length} cards from data/projects.json; found ${total}.`);
  }

  const cases = [
    { key: "live", status: "Showing public project websites and demos", slugs: expectedGroups.live.map(project => project.slug) },
    { key: "progress", status: "Showing projects still being built or researched", slugs: expectedGroups.progress.map(project => project.slug) },
    { key: "completed", status: "Showing completed projects, including all live sites and showcases", slugs: expectedGroups.completed.map(project => project.slug) },
    { key: "all", status: "Showing all projects", slugs: expectedGroups.all.map(project => project.slug) }
  ];

  for (const test of cases) {
    await page.locator(`[data-filter="${test.key}"]`).click();
    await page.waitForTimeout(250);
    const observed = await page.evaluate(() => ({
      visible: document.querySelectorAll(".project-card:not([hidden])").length,
      total: document.querySelectorAll(".project-card").length,
      status: document.querySelector("#project-filter-status")?.textContent || "missing status",
      active: [...document.querySelectorAll(".filter-button[aria-pressed='true']")].map(button => button.dataset.filter),
      slugs: [...document.querySelectorAll(".project-card:not([hidden])")].map(card => card.dataset.projectSlug)
    }));
    if (observed.visible !== test.slugs.length) {
      throw new Error(`${test.key} filter mismatch: expected ${test.slugs.length} visible from portfolio data; observed ${JSON.stringify(observed)}; browser errors: ${errors.join(" | ")}`);
    }
    if (!observed.status.includes(test.status)) {
      throw new Error(`${test.key} status mismatch: ${observed.status}`);
    }
    if (test.slugs && JSON.stringify([...observed.slugs].sort()) !== JSON.stringify([...test.slugs].sort())) {
      throw new Error(`${test.key} shows the wrong projects: ${JSON.stringify(observed.slugs)}`);
    }
    const activeCount = await page.locator('.filter-button[aria-pressed="true"]').count();
    if (activeCount !== 1) throw new Error(`${test.key}: expected exactly one active category, found ${activeCount}.`);
  }

  if (await page.locator("#project-empty-state").isVisible()) {
    throw new Error("Empty state should be hidden when Everything is selected.");
  }
  const buttonTexts = await page.locator(".filter-button").allTextContents();
  if (buttonTexts.some(text => /\d/.test(text))) throw new Error("Project filter buttons should not display numbers.");
  const colors = await page.locator(".filter-button").evaluateAll(nodes => nodes.map(node => getComputedStyle(node).backgroundColor));
  if (new Set(colors).size !== 4) throw new Error("Each project category should have its own background colour.");
  const liveWithUrls = sourceProjects.filter(project => Boolean(project.live_url));
  if (liveWithUrls.some(project => project.site_status !== "live")) {
    throw new Error("Every project with a configured public website must remain in Live sites.");
  }
  if (liveWithUrls.some(project => !project.preview_image || !project.preview_image.endsWith(".jpg"))) {
    throw new Error("Every public live website must have a correctly named JPEG capture path.");
  }
  const staticHtml = await readFile("index.html", "utf8");
  for (const project of liveWithUrls) {
    if (!staticHtml.includes(`src="${project.preview_image}"`)) {
      throw new Error(`${project.slug} is not wired to its configured live capture image in the initial page markup.`);
    }
  }
  for (const project of liveWithUrls) {
    const image = page.locator(`[data-project-slug="${project.slug}"] .project-preview img`);
    await image.waitFor({ state: "attached" });
    await image.evaluate(async node => {
      node.loading = "eager";
      await node.decode();
      if (!node.naturalWidth || !node.naturalHeight) throw new Error("Preview image decoded without dimensions.");
    });
  }
  if (!expectedGroups.live.some(project => project.slug === "nkaulele-contractors")) {
    throw new Error("Nkaulele Contractors must remain in Live sites.");
  }
  for (const slug of ["standpoint-financial-intelligence","buzz-social-discovery","kenya-yield-curve-risk-engine","kenya-financial-analytics","nkaulele-contractors","kenya-investment-intelligence"]) {
    if (!expectedGroups.live.some(project => project.slug === slug)) {
      throw new Error(`${slug} is missing from Live sites.`);
    }
  }

  const buzz = JSON.parse(await readFile("data/projects.json","utf8")).projects.find(project => project.slug === "buzz-social-discovery");
  if (!buzz || buzz.live_url !== "https://buzz-social-platformbuzz-social-platform.onrender.com/" || buzz.preview_url !== "https://buzz-social-platformbuzz-social-platform.onrender.com/" || buzz.preview_image !== "/assets/previews/buzz-social-discovery.jpg" || buzz.portfolio_status !== "live") {
    throw new Error("Buzz's original preview source was not preserved.");
  }
  const buzzCard = page.locator('[data-project-slug="buzz-social-discovery"] .project-preview img');
  if (await buzzCard.getAttribute("src") !== "/assets/previews/buzz-social-discovery.jpg") throw new Error("Buzz preview image is not attached to its card.");
  const buzzProjectCard = page.locator('[data-project-slug="buzz-social-discovery"]');
  if (await buzzProjectCard.getAttribute("data-live") !== "true" || await buzzProjectCard.getAttribute("data-progress") !== "false") throw new Error("Buzz must appear under Live sites and not In progress.");
  if (errors.length) throw new Error("Browser JavaScript errors: " + errors.join("; "));

  console.log("PASS: All four coloured project filters work on a 390px mobile viewport.");
  console.log("PASS: No number counters appear; counts, active state, empty state and Buzz preview are correct.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
