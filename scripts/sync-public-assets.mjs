import { mkdir, cp, copyFile } from "node:fs/promises";

await mkdir("public", { recursive: true });
await cp("assets", "public/assets", { recursive: true, force: true });
for (const folder of ["privacy", "terms", "security", ".well-known"]) {
  await cp(folder, `public/${folder}`, { recursive: true, force: true });
}
for (const file of ["favicon.svg", "robots.txt", "sitemap.xml"]) {
  await copyFile(file, `public/${file}`);
}
console.log("Copied original portraits, authentic project screenshots, custom profile uploads, legal pages and security files for the React build.");
