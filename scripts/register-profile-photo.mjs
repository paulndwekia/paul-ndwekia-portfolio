import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const eventPath = process.env.GITHUB_EVENT_PATH;
if (!eventPath) throw new Error("GITHUB_EVENT_PATH is not set.");
const event = JSON.parse(await readFile(eventPath, "utf8"));
const issue = event.issue;

if (issue?.user?.login !== "paulndwekia") {
  throw new Error("Only the portfolio owner can change the public profile photo.");
}
if (!issue?.title?.startsWith("Profile photo update:")) {
  throw new Error("This is not a profile photo update issue.");
}

function field(name) {
  const section = issue.body?.split(/\n### /).find(part => part.startsWith(name + "\n"));
  return section ? section.slice(name.length + 1).split(/\n### /)[0].trim() : "";
}

const action = field("Action").toLowerCase();
const configPath = "data/profile.json";
const profileDir = "assets/profile";
await mkdir(profileDir, { recursive: true });

async function removePreviousPhoto() {
  for (const extension of ["jpg", "png", "webp"]) {
    await unlink(path.join(profileDir, "profile-photo." + extension)).catch(() => {});
  }
}

if (action.includes("restore")) {
  await removePreviousPhoto();
  const config = {
    photo_path: null,
    photo_source: "github-default",
    updated_at: new Date().toISOString()
  };
  await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
  console.log("Restored the GitHub profile photo as the default.");
  process.exit(0);
}

if (!action.includes("upload") && !action.includes("new")) {
  throw new Error("Choose either upload a new profile photo or restore the GitHub default.");
}

const imageField = field("Profile photo image");
const embedded = issue.body?.match(/!\[[^\]]*\]\((https:\/\/[^)\s]+)\)/);
const raw = imageField.match(/https:\/\/[^\s)>]+/)?.[0];
const imageUrl = (embedded?.[1] || raw || "").replace(/[.,]+$/, "");
if (!imageUrl) {
  throw new Error("Attach a photo in the Profile photo image field, or paste its public HTTPS image URL.");
}

let parsed;
try { parsed = new URL(imageUrl); } catch { throw new Error("The photo URL is invalid."); }

const permittedHost =
  (parsed.hostname === "github.com" && parsed.pathname.startsWith("/user-attachments/assets/")) ||
  parsed.hostname === "user-images.githubusercontent.com";

if (parsed.protocol !== "https:" || !permittedHost) {
  throw new Error("For safety, upload the image directly to this GitHub issue form. Only GitHub issue image attachments are accepted.");
}

const response = await fetch(parsed.toString(), {
  redirect: "follow",
  headers: { "User-Agent": "PaulNdwekiaPortfolioProfilePhoto/1.0" }
});
if (!response.ok) throw new Error("GitHub could not retrieve the uploaded image (HTTP " + response.status + ").");

const mime = (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
const extensions = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};
const extension = extensions[mime];
if (!extension) {
  throw new Error("Use a JPEG, PNG or WebP image. SVG and other file types are not accepted.");
}

const declaredSize = Number(response.headers.get("content-length") || 0);
if (declaredSize > 8 * 1024 * 1024) throw new Error("The uploaded photo must be 8 MB or smaller.");
const bytes = Buffer.from(await response.arrayBuffer());
if (!bytes.length || bytes.length > 8 * 1024 * 1024) throw new Error("The uploaded photo is empty or exceeds 8 MB.");

const signatures = {
  jpg: bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  png: bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
  webp: bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP"
};
if (!signatures[extension]) throw new Error("The file content does not match its declared image type.");

await removePreviousPhoto();
const filename = "profile-photo." + extension;
await writeFile(path.join(profileDir, filename), bytes);

const config = {
  photo_path: "/assets/profile/" + filename,
  photo_source: "custom-upload",
  updated_at: new Date().toISOString()
};
await writeFile(configPath, JSON.stringify(config, null, 2) + "\n");
console.log("Stored the new portfolio profile photo at " + config.photo_path + ".");
