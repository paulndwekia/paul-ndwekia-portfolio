import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
const modulePath=process.env.PLAYWRIGHT_MODULE||"playwright";
const {chromium}=await import(modulePath);
const root=path.resolve("dist");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".jpg":"image/jpeg",".webp":"image/webp",".png":"image/png"};
const server=createServer(async(req,res)=>{
  try{
    let pathname=decodeURIComponent(new URL(req.url||"/","http://127.0.0.1").pathname);
    if(pathname==="/")pathname="/index.html";
    if(pathname==="/research"||pathname==="/research/")pathname="/research/index.html";
    const file=path.resolve(root,"."+pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403).end("Forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"Content-Type":mime[path.extname(file)]||"application/octet-stream"});res.end(bytes);
  }catch{res.writeHead(404).end("Not found");}
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const origin=`http://127.0.0.1:${server.address().port}`;
const browser=await chromium.launch({headless:true});
const errors=[];
async function waitReady(page){
  await page.waitForFunction(()=>document.documentElement.dataset.appReady==="true",{timeout:15000});
  await page.locator(".site-header").waitFor({state:"visible"});
}
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  page.on("pageerror",e=>errors.push(e.message));
  page.on("console",m=>{if(m.type()==="error"&&!m.text().includes("fonts.googleapis.com"))errors.push(m.text());});
  await page.goto(origin,{waitUntil:"domcontentloaded"});await waitReady(page);
  const source=JSON.parse(await readFile("data/projects.json","utf8")).projects;
  if(await page.locator(".project-card").count()!==source.length||source.length!==8)throw new Error("Expected all eight preserved project cards.");
  const counts={completed:6,live:8,progress:2};
  for(const [filter,expected] of Object.entries(counts)){
    await page.locator(`[data-status-filter="${filter}"]`).click();
    const actual=await page.locator(".project-card").evaluateAll(nodes=>nodes.filter(n=>n.offsetParent!==null).length);
    if(actual!==expected)throw new Error(`${filter} filter expected ${expected}, observed ${actual}.`);
  }
  await page.locator('[data-status-filter="all"]').click();
  const projectDisciplineCounts={markets:2,research:2,systems:2,products:1,client:1};
  for(const [filter,expected] of Object.entries(projectDisciplineCounts)){
    await page.locator(`[data-discipline-filter="${filter}"]`).click();
    const actual=await page.locator(".project-card").evaluateAll(nodes=>nodes.filter(n=>n.offsetParent!==null).length);
    if(actual!==expected)throw new Error(`Project discipline ${filter} expected ${expected}, observed ${actual}.`);
  }
  await page.locator('[data-discipline-filter="all"]').click();
  const imageResults=await page.locator(".project-image").evaluateAll(nodes=>nodes.map(n=>({src:n.getAttribute("src"),width:n.naturalWidth,height:n.naturalHeight})));
  if(imageResults.length!==8||imageResults.some(x=>!x.width||!x.height))throw new Error("One or more actual project screenshots did not load.");
  const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(desktopOverflow)throw new Error("Horizontal overflow on desktop.");
  await page.setViewportSize({width:390,height:844});
  const mobileOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(mobileOverflow)throw new Error("Horizontal overflow on a 390px mobile viewport.");
  await page.locator(".menu-toggle").click();
  if(await page.locator(".menu-toggle").getAttribute("aria-expanded")!=="true")throw new Error("The mobile navigation did not open.");
  await page.locator(".menu-toggle").click();
  if(await page.locator(".menu-toggle").getAttribute("aria-expanded")!=="false")throw new Error("The mobile navigation did not close.");
  await page.setViewportSize({width:360,height:800});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw new Error("Horizontal overflow at 360px.");
  await page.locator('a[href="/research/"]').first().click();
  await page.waitForURL("**/research/");await waitReady(page);
  if(await page.locator(".research-card").count()!==8)throw new Error("The research archive must show eight case studies.");
  const researchCounts={all:8,markets:2,macro:2,systems:1,products:3};
  for(const [filter,expected] of Object.entries(researchCounts)){
    await page.locator(`[data-research-filter="${filter}"]`).click();
    const actual=await page.locator(".research-card").evaluateAll(nodes=>nodes.filter(n=>n.offsetParent!==null).length);
    if(actual!==expected)throw new Error(`Research filter ${filter} expected ${expected}, observed ${actual}.`);
  }
  await page.locator('[data-research-filter="all"]').click();
  if(await page.locator(".report-row").count()!==4)throw new Error("Expected four research reports and technical notes.");
  const researchOverflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(researchOverflow)throw new Error("Horizontal overflow on the research page.");
  if(errors.length)throw new Error("Browser JavaScript errors: "+errors.join(" | "));
  console.log("PASS: eight project cards; Completed, Live sites and In progress classifications.");
  console.log("PASS: project discipline filters, eight research case studies and five research filters.");
  console.log("PASS: actual preview images, four reports, menu interactions and desktop / 390px / 360px layouts.");
  console.log("PASS: no uncaught browser JavaScript errors.");
}finally{
  await browser.close();await new Promise(resolve=>server.close(resolve));
}
