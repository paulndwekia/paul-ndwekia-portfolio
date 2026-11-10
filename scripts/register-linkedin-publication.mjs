import { readFile, writeFile } from "node:fs/promises";

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) throw new Error("GITHUB_EVENT_PATH is not set.");
const event = JSON.parse(await readFile(eventPath,"utf8"));
const issue = event.issue;
if (issue?.user?.login !== "paulndwekia") throw new Error("Only the portfolio owner can change LinkedIn completion evidence.");
if (!issue?.body) throw new Error("Issue body is missing.");

function field(name) {
  const section = issue.body.split(/\n### /).find(part => part.startsWith(name + "\n"));
  return section ? section.slice(name.length + 1).split(/\n### /)[0].trim() : "";
}
const slug = field("Project");
if (!slug || slug.toLowerCase() === "select a project") throw new Error("Choose a project in the issue form.");
const path = "data/linkedin-evidence.json";
const registry = JSON.parse(await readFile(path,"utf8"));
registry.evidence ||= [];
registry.withdrawals ||= [];

if (issue.title.startsWith("Withdraw LinkedIn evidence:")) {
  const existing = registry.evidence.find(item => item.project_slug === slug);
  if (!existing) throw new Error("No active LinkedIn publication evidence exists for " + slug + ".");
  registry.evidence = registry.evidence.filter(item => item.project_slug !== slug);
  registry.withdrawals.push({
    project_slug: slug,
    withdrawn_at: new Date().toISOString(),
    issue_url: issue.html_url,
    reason: "Owner reported that the LinkedIn publication was deleted or withdrawn."
  });
  registry.updated_at = new Date().toISOString();
  await writeFile(path,JSON.stringify(registry,null,2) + "\n");
  console.log("Withdrawn LinkedIn publication evidence for " + slug + ".");
} else if (issue.title.startsWith("LinkedIn publication:")) {
  const postUrl = field("LinkedIn post URL");
  const imageUrl = field("Original project image URL (optional)");
  const publishedInput = field("Publication date (optional)");
  const publishedAt = !publishedInput || publishedInput.toLowerCase() === "none" ? new Date().toISOString().slice(0,10) : publishedInput;
  let parsed;
  try { parsed = new URL(postUrl); } catch { throw new Error("Enter a valid LinkedIn post URL."); }
  if (parsed.protocol !== "https:" || !/(^|\.)linkedin\.com$/i.test(parsed.hostname)) {
    throw new Error("The publication URL must be an https://www.linkedin.com/... URL.");
  }
  let parsedImage = null;
  if (imageUrl && imageUrl.toLowerCase() !== "none") {
    try { parsedImage = new URL(imageUrl); } catch { throw new Error("The image URL is not valid."); }
    if (parsedImage.protocol !== "https:") throw new Error("The image URL must use HTTPS.");
  }
  const record = {
    project_slug: slug,
    post_url: parsed.toString(),
    image_url: parsedImage?.toString() || null,
    published_at: publishedAt,
    issue_url: issue.html_url,
    recorded_at: new Date().toISOString()
  };
  registry.evidence = registry.evidence.filter(item => item.project_slug !== slug);
  registry.evidence.push(record);
  registry.updated_at = new Date().toISOString();
  await writeFile(path,JSON.stringify(registry,null,2) + "\n");
  console.log("Registered LinkedIn publication evidence for " + slug + ".");
} else {
  throw new Error("Unsupported evidence action.");
}