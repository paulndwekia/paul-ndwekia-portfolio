import { readFile, writeFile } from "node:fs/promises";

const owner = process.env.GITHUB_OWNER || "paulndwekia";
const token = process.env.GITHUB_TOKEN;
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
};
async function api(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}
const projectsFile = "data/projects.json";
const projectsData = JSON.parse(await readFile(projectsFile,"utf8"));
const projects = projectsData.projects || [];
const repos = await api(`/users/${owner}/repos?per_page=100&type=public&sort=updated`);
const publicRepos = repos.filter(repo => !repo.fork && !repo.archived && repo.name !== "paul-ndwekia-portfolio");
const repoByName = new Map(publicRepos.map(repo => [repo.name, repo]));

// Discover new public repositories. New discoveries are always unverified/in progress.
for (const repo of publicRepos) {
  if (projects.some(project => project.repository === repo.name)) continue;
  const slug = repo.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  projects.push({
    slug,
    name: repo.name.replace(/[-_]+/g," "),
    repository: repo.name,
    live_url: null,
    description: repo.description || "A public GitHub project by Paul Ndwekia. Project details will be expanded as the work develops.",
    category: "GitHub project",
    stage_label: "In progress · discovered on GitHub",
    stack: repo.language ? [repo.language] : [],
    cover_kicker: "Public GitHub project",
    cover_title: repo.name.replace(/[-_]+/g," ")
  });
}
projectsData.projects = projects;
await writeFile(projectsFile, JSON.stringify(projectsData,null,2)+"\n");

// Only public metadata is written to the public website feed.
const selected = publicRepos.sort((a,b) => new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,12);
const activity = await Promise.all(selected.map(async repo => {
  let latest_commit = repo.description || "Public repository";
  try {
    const commits = await api(`/repos/${owner}/${encodeURIComponent(repo.name)}/commits?per_page=1`);
    latest_commit = commits[0]?.commit?.message?.split("\n")[0] || latest_commit;
  } catch (error) {
    latest_commit = "Recent commit details unavailable";
  }
  return {
    name: repo.name,
    html_url: repo.html_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    pushed_at: repo.pushed_at,
    latest_commit
  };
}));
const payload = { owner, generated_at: new Date().toISOString(), repositories: activity };
await writeFile("data/github-progress.json", JSON.stringify(payload,null,2)+"\n");

console.log(`Synced ${activity.length} public repositories; catalogue contains ${projects.length} projects.`);