import React, { useEffect, useMemo, useState } from "react";
import projectData from "../data/projects.json";
import githubData from "../data/github-progress.json";
import linkedinData from "../data/linkedin-evidence.json";
import SpotlightCard from "./components/SpotlightCard";

const projects=[...(projectData.projects||[])].sort((a,b)=>(a.display_order??999)-(b.display_order??999));
const repositories=githubData.repositories||[];
const publications=linkedinData.evidence||[];
const githubUrl="https://github.com/paulndwekia";
const linkedinUrl="https://www.linkedin.com/in/kieru-ndwekia-447023409/";
const photoIssueUrl="https://github.com/paulndwekia/paul-ndwekia-portfolio/issues/new?template=change-profile-photo.yml";
const publicationIssueUrl="https://github.com/paulndwekia/paul-ndwekia-portfolio/issues/new?template=linkedin-project-publication.yml";
const withdrawalIssueUrl="https://github.com/paulndwekia/paul-ndwekia-portfolio/issues/new?template=withdraw-linkedin-evidence.yml";
const completionEvidence=new Set(publications.filter(x=>x.post_url||x.source_url).map(x=>x.project_slug));
const isCompleted=p=>p.portfolio_status==="completed"||completionEvidence.has(p.slug);
const isLive=p=>p.site_status==="live"&&Boolean(p.live_url);
const isInProgress=p=>p.portfolio_status==="in-progress"&&!isCompleted(p);
const dateLabel=value=>{if(!value)return"";const d=new Date(value);return Number.isNaN(d.getTime())?"":d.toLocaleDateString("en-KE",{day:"numeric",month:"short",year:"numeric"});};
const external=url=>/^https?:/i.test(url||"");
function A({href,children,className="",...props}){
  return <a href={href} className={className} {...(external(href)?{target:"_blank",rel:"noopener noreferrer"}:{})} {...props}>{children}</a>;
}
function useReducedMotion(){
  const [reduced,setReduced]=useState(false);
  useEffect(()=>{
    const m=window.matchMedia("(prefers-reduced-motion: reduce)");
    const update=()=>setReduced(m.matches);
    update();m.addEventListener?.("change",update);
    return()=>m.removeEventListener?.("change",update);
  },[]);
  return reduced;
}
function Reveal({children,className=""}){
  return <div className={className}>{children}</div>;
}
function Header({research=false}){
  const [open,setOpen]=useState(false);
  useEffect(()=>{
    const close=e=>{if(e.key==="Escape")setOpen(false);};
    document.addEventListener("keydown",close);return()=>document.removeEventListener("keydown",close);
  },[]);
  const close=()=>setOpen(false);
  return <header className="site-header"><div className="header-inner">
    <A href="/" className="brand" aria-label="Paul Ndwekia home" onClick={close}><span className="brand-mark">PN</span><span className="brand-copy"><strong>Paul Ndwekia</strong><small>Finance · Data · Technology</small></span></A>
    <button className={"menu-toggle"+(open?" is-open":"")} type="button" aria-expanded={open} aria-controls="primary-nav" aria-label={open?"Close navigation":"Open navigation"} onClick={()=>setOpen(v=>!v)}><span/><span/></button>
    <nav id="primary-nav" className={"primary-nav"+(open?" is-open":"")} aria-label="Main navigation">
      <A href="/#work" onClick={close} aria-current={!research?"page":undefined}>Selected work</A>
      <A href="/research/" onClick={close} aria-current={research?"page":undefined}>Research & reports</A>
      <A href="/#progress" onClick={close}>In the work</A><A href="/#about" onClick={close}>About</A>
      <A href="/#contact" className="nav-contact" onClick={close}>Contact <span aria-hidden="true"></span></A>
    </nav>
  </div>{open&&<button className="nav-scrim" aria-label="Close navigation" onClick={close}/>}</header>;
}
function StatusPills({project}){
  return <div className="status-pills">
    <span className={"status-pill "+(isCompleted(project)?"status-complete":"status-progress")}><i aria-hidden="true"/>{isCompleted(project)?"Completed":"In progress"}</span>
    {isLive(project)&&<span className="status-pill status-live"><i aria-hidden="true"/>Live site</span>}
  </div>;
}
const repoLinks={
  "Kenya-Financial-Analytics":"https://github.com/paulndwekia/Kenya-Financial-Analytics",
  "gdp-dashboard":"https://github.com/paulndwekia/gdp-dashboard",
  "fintel-kenya-financial-intelligence":"https://github.com/paulndwekia/fintel-kenya-financial-intelligence",
  "Rock_Investment_Outlook_2026":"https://github.com/paulndwekia/Rock_Investment_Outlook_2026",
  "nkaulele-contractors-website":"https://github.com/paulndwekia/nkaulele-contractors-website"
};
function ProjectCard({project}){
  const repo=repoLinks[project.repository]||project.source_url;
  const publication=publications.find(x=>x.project_slug===project.slug);
  return <Reveal className={"project-reveal"+(project.featured?" project-reveal-featured":"")}>
    <SpotlightCard className={"project-card"+(project.featured?" is-featured":"")} theme="light" spotlightColor="rgba(69,111,149,0.5)" intensity={0.18} spotlightSize={260} borderGlow={0.3} smoothing={0.24} flare={false} grain={0}>
      <div className="project-media">
        <div className="project-image-fallback"><span>{project.discipline_label||project.category}</span><strong>{project.name}</strong></div>
        <span className="media-caption">{project.preview_label||"Project preview"}</span>
      </div>
      <div className="project-copy">
        <div className="project-topline"><span className="discipline-label">{project.discipline_label||project.category}</span><StatusPills project={project}/></div>
        <h3>{project.name}</h3><p className="project-description">{project.description}</p>
        {project.project_story&&<p className="project-story">{project.project_story}</p>}
        <p className="project-scope">{project.project_scope||(project.stack||[]).slice(0,6).join(" · ")}</p>
        <div className="project-actions">
          {project.live_url&&<A href={project.live_url} className="project-action-primary">{project.live_label||"Open live project"} <span></span></A>}
          {repo&&<A href={repo} className="project-action-link">Source repository</A>}
          {project.case_study_url&&<A href={project.case_study_url} className="project-action-link">Case study</A>}
          {project.report_url&&<A href={project.report_url} className="project-action-link">Research output</A>}
          {project.progress_url&&<A href={project.progress_url} className="project-action-link">Development notes</A>}
          {publication?.post_url&&<A href={publication.post_url} className="project-action-link">LinkedIn post</A>}
        </div>
      </div>
    </SpotlightCard>
  </Reveal>;
}
const statusFilters=[["all","Everything"],["completed","Completed"],["live","Live sites"],["progress","In progress"]];
const disciplineFilters=[["all","All disciplines"],["markets","Markets & fixed income"],["research","Research & macro"],["systems","Financial technology"],["products","Digital products"],["client","Client work"]];
function matchesDiscipline(p,f){
  const d=p.discipline||"";
  if(f==="all")return true;
  if(f==="markets")return["financial-markets","fixed-income"].includes(d);
  if(f==="research")return["macroeconomic-research","investment-research"].includes(d);
  if(f==="systems")return["fintech-platforms","financial-infrastructure"].includes(d);
  if(f==="products")return d==="digital-products";
  if(f==="client")return d==="client-work";
  return true;
}
function WorkSection(){
  const [status,setStatus]=useState("all"),[discipline,setDiscipline]=useState("all");
  const visible=useMemo(()=>projects.filter(p=>(status==="all"||(status==="completed"&&isCompleted(p))||(status==="live"&&isLive(p))||(status==="progress"&&isInProgress(p)))&&matchesDiscipline(p,discipline)),[status,discipline]);
  const featured=visible.filter(p=>p.featured),other=visible.filter(p=>!p.featured);
  return <section className="work-section section-wrap" id="work">
    <div className="section-heading work-heading">
      <Reveal><p className="eyebrow">Selected work · 2024—2026</p><h2>Things I’ve been working on.</h2></Reveal>
      <Reveal delay={0.08}><p className="section-intro">A mix of financial tools, research dashboards and products. Some are finished; others are live while I keep improving them. I try to be clear about the difference.</p></Reveal>
    </div>
    <div className="filter-panel">
      <div className="filter-group"><span className="filter-caption">Project status</span><div className="filter-list" role="group" aria-label="Filter projects by status">{statusFilters.map(([key,label])=><button key={key} type="button" data-status-filter={key} aria-pressed={status===key} className={"filter-button"+(status===key?" is-active":"")} onClick={()=>setStatus(key)}>{label}</button>)}</div></div>
      <div className="filter-group"><span className="filter-caption">Area of work</span><div className="filter-list filter-list-secondary" role="group" aria-label="Filter projects by discipline">{disciplineFilters.map(([key,label])=><button key={key} type="button" data-discipline-filter={key} aria-pressed={discipline===key} className={"filter-button filter-button-soft"+(discipline===key?" is-active":"")} onClick={()=>setDiscipline(key)}>{label}</button>)}</div></div>
    </div>
    <p className="filter-status" role="status" aria-live="polite" data-filter-status>Showing {visible.length} {visible.length===1?"project":"projects"} · {statusFilters.find(x=>x[0]===status)?.[1]} · {disciplineFilters.find(x=>x[0]===discipline)?.[1]}</p>
    {visible.length?<div className="project-grid">{featured.map(p=><ProjectCard key={p.slug} project={p}/>)}{other.map(p=><ProjectCard key={p.slug} project={p}/>)}</div>:<div className="empty-state">Nothing in this combination yet. Try another filter.</div>}
  </section>;
}
function FocusSection(){
  const items=[
    ["Financial markets","Most of my recent work is close to Kenya’s FX, Treasury and fixed-income data. I’m interested in the story behind the observations, not just the chart."],
    ["Research & analysis","Macroeconomic comparisons, yield curves, valuation and risk. I like making assumptions and data limitations visible rather than hiding them in the footnotes."],
    ["Software that helps","I build interfaces and data systems that turn an analytical idea into something another person can actually explore and use."]
  ];
  return <section className="focus-section"><div className="section-wrap"><Reveal><p className="eyebrow eyebrow-light">Where the interests meet</p><h2 className="focus-title">I tend to start with a question.</h2></Reveal><div className="focus-grid">{items.map(([title,copy],i)=><Reveal key={title} delay={i*.07}><article className="focus-item"><h3>{title}</h3><p>{copy}</p></article></Reveal>)}</div></div></section>;
}
function ProgressSection(){
  const recent=[...repositories].sort((a,b)=>new Date(b.pushed_at)-new Date(a.pushed_at)).slice(0,4);
  const verified=publications.filter(x=>x.post_url||x.source_url);
  return <section className="progress-section" id="progress"><div className="section-wrap">
    <div className="section-heading"><Reveal><p className="eyebrow">A little behind the scenes</p><h2>Work in motion.</h2></Reveal><Reveal><p className="section-intro">I keep a public trail of repositories and published work. Activity is evidence of development, not proof that every feature is finished.</p></Reveal></div>
    <div className="progress-grid">
      <Reveal><div className="activity-panel"><div className="panel-heading"><div><span className="panel-kicker">GitHub</span><h3>Recent development</h3></div><A href={githubUrl} className="panel-link">My repositories </A></div><div className="activity-list">{recent.map(r=><article className="activity-item" key={r.name}><span className="activity-dot"/><div className="activity-copy"><A href={r.html_url} className="activity-repo">{r.name.replaceAll("-"," ")}</A><p>{r.latest_commit||r.description||"Public repository update"}</p><small>{dateLabel(r.pushed_at)}{r.language?" · "+r.language:""}</small></div></article>)}</div><p className="panel-footnote">Public GitHub activity refreshed by the portfolio workflow.</p></div></Reveal>
      <Reveal delay={0.1}><div className="publication-panel"><div className="panel-heading"><div><span className="panel-kicker">LinkedIn</span><h3>Published work</h3></div><A href={linkedinUrl} className="panel-link">My profile </A></div>
        {verified.length?<div className="publication-list">{verified.map((p,i)=><article className="publication-item" key={p.project_slug+i}><span className="publication-mark">in</span><div><strong>{p.profile_project_title||p.project_slug.replaceAll("-"," ")}</strong><p>{p.source_description||"Publication evidence linked to my LinkedIn profile."}</p><A href={p.post_url||p.source_url} className="small-link">{p.post_url?"Read publication":"View LinkedIn profile"} </A></div></article>)}</div>:<p className="publication-empty">I’ll add project publication links here as they are verified.</p>}
        <div className="publication-actions"><A href={publicationIssueUrl} className="small-link">Register a project post </A><A href={withdrawalIssueUrl} className="small-link">Withdraw deleted evidence </A></div>
      </div></Reveal>
    </div>
  </div></section>;
}
function AboutSection(){
  return <section className="about-section section-wrap" id="about">
    <div className="section-heading"><Reveal><p className="eyebrow">A little about me</p><h2>Still learning. Still building.</h2></Reveal><Reveal><p className="section-intro">I’m a Financial Engineering student at JKUAT. The software I build is often connected to something I’m trying to understand more deeply.</p></Reveal></div>
    <div className="about-layout">
      
      <Reveal className="about-copy" delay={0.1}>
        <div className="about-identity"><span className="about-avatar-mark" aria-hidden="true">PN</span><div><strong>Paul Ndwekia</strong><span>Financial Engineering · JKUAT · Expected 2029</span><A href={photoIssueUrl} className="small-link">Change profile photo </A></div></div>
        <p>I study Financial Engineering at Jomo Kenyatta University of Agriculture and Technology. Building software is one of the ways I work through what I’m learning — especially when a financial idea can become a tool someone else can use.</p>
        <p>I’m particularly interested in Kenyan capital markets, fixed income, foreign exchange and quantitative research. I enjoy understanding where the data comes from, checking the assumptions and making the result easier to work with.</p>
        <p>I’ve also built products outside finance and delivered a website for a real business. Those projects have taught me as much about product decisions and finishing details as they have about code.</p>
        <p>I’d rather show what a project can actually do — and what still needs work — than pretend every module is finished.</p>
        <div className="about-facts"><div><span>Studying</span><strong>Financial Engineering</strong></div><div><span>University</span><strong>JKUAT · Juja</strong></div><div><span>Working with</span><strong>Python · TypeScript · React · SQL</strong></div><div><span>Interested in</span><strong>Markets · Fixed income · Data systems</strong></div></div>
      </Reveal>
    </div>
  </section>;
}
function CampusGallery(){
  const photos=[
    {alt:"The JKUAT main campus entrance gate with its red gear sculpture",title:"The main gate",place:"JKUAT · Juja",position:"0% 0%"},
    {alt:"The road between JKUAT campus buildings, with flags along the central driveway",title:"The campus road",place:"Juja",position:"100% 0%"},
    {alt:"One of the academic buildings at JKUAT and its courtyard",title:"The academic block",place:"JKUAT"},
    {alt:"Paul Ndwekia looking at his phone outside a campus building",title:"Between lectures",place:"Juja · JKUAT",position:"100% 100%"}
  ];
  return <section className="campus-gallery section-wrap" id="campus">
    <div className="section-heading">
      <Reveal><p className="eyebrow">Outside the screen</p><h2>A few corners of JKUAT.</h2></Reveal>
      <Reveal><p className="section-intro">The place behind a lot of the work. These are photographs from the campus itself.</p></Reveal>
    </div>
    <div className="campus-gallery-grid">{photos.map(photo=><figure className="campus-gallery-item" key={photo.title}>
      <div className="campus-gallery-image" role="img" aria-label={photo.alt} style={{backgroundImage:"url(/assets/campus-gallery.webp)",backgroundPosition:photo.position||"0% 100%"}}/>
      <figcaption><strong>{photo.title}</strong><span>{photo.place}</span></figcaption>
    </figure>)}</div>
  </section>;
}
function ContactSection(){
  const wa="https://wa.me/254745120235?text=Hello%20Paul%2C%20I%27m%20contacting%20you%20regarding%20a%20business%20enquiry.";
  return <section className="contact-section" id="contact"><div className="section-wrap contact-inner"><Reveal><p className="eyebrow eyebrow-light">Get in touch</p><h2>Have something worth working through?</h2><p>I’m glad to hear from people working on financial research, useful software and ideas that deserve a closer look.</p><div className="contact-actions"><A href="mailto:p98001630@gmail.com" className="button button-light">Email me <span></span></A><A href={wa} className="button button-outline-light">WhatsApp · Business enquiries</A></div><div className="contact-socials"><A href={linkedinUrl}>LinkedIn </A><A href={githubUrl}>GitHub </A></div></Reveal></div></section>;
}
function Footer(){
  return <footer className="site-footer"><div className="section-wrap footer-inner">
    <A href="/" className="footer-brand"><span className="brand-mark">PN</span><span><strong>Paul Ndwekia</strong><small>Nairobi, Kenya · Finance · Data · Technology</small></span></A>
    <nav className="footer-links" aria-label="Legal and social links"><A href="/privacy/">Privacy</A><A href="/terms/">Terms</A><A href="/security/">Security</A><A href={githubUrl}>GitHub</A></nav>
    <small>Financial Engineering · JKUAT · Expected 2029</small><small>© {new Date().getFullYear()} Paul Ndwekia</small>
  </div></footer>;
}
function CookieNotice(){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{try{setVisible(!localStorage.getItem("pn-essential-notice"));}catch{setVisible(false);}},[]);
  if(!visible)return null;
  return <aside className="cookie-notice" aria-label="Cookie notice"><p>This site uses essential browser storage only to remember whether you dismissed this notice. No analytics or marketing trackers are active.</p><button type="button" onClick={()=>{try{localStorage.setItem("pn-essential-notice","seen");}catch{}setVisible(false);}}>Okay</button></aside>;
}
function HomePage(){
  return <><Header/><main>
    <section className="hero"><div className="hero-grid section-wrap">
      <div className="hero-copy"><p className="eyebrow eyebrow-light">Nairobi, Kenya <span className="eyebrow-divider">/</span> JKUAT</p><p className="hero-kicker">FINANCIAL ENGINEERING · SOFTWARE · RESEARCH</p>
        <div className="hero-heading"><h1>I build financial tools that make the numbers easier to understand.</h1></div>
        <p className="hero-lede">I’m Paul Ndwekia. I study Financial Engineering and build software around the questions I keep coming back to: how do Kenyan markets behave, what is the data telling us, and how can we make it useful?</p>
        <div className="hero-actions"><A href="#work" className="button button-primary">Explore my work <span></span></A><A href="#about" className="hero-text-link">A little about me <span></span></A></div>
        <div className="hero-foot"><span>Financial markets</span><span>Quantitative research</span><span>Software products</span></div>
      </div>
      <figure className="hero-portrait">
        <div className="hero-monogram-card" aria-label="Paul Ndwekia"><span className="hero-monogram-mark">PN</span><strong>PAUL NDWEKIA</strong><small>FINANCE · DATA · TECHNOLOGY</small></div>
        <figcaption className="hero-photo-caption"><span>Paul Ndwekia</span><span>Juja · JKUAT</span></figcaption>
      </figure>
    </div><div className="hero-bottom section-wrap"><span>FINANCE <i>×</i> DATA <i>×</i> TECHNOLOGY</span><span className="hero-bottom-note">A personal portfolio of projects and research</span></div></section>
    <FocusSection/><WorkSection/><ProgressSection/><AboutSection/><ContactSection/>
  </main><Footer/><CookieNotice/></>;
}

const researchItems=[
 {id:"kenya-financial-analytics",slug:"kenya-financial-analytics",discipline:"markets",label:"Financial markets",title:"Kenya Financial Analytics",status:"Completed · live",image:"/assets/previews/kenya-financial-analytics.jpg",caption:"Kenyan capital markets · Quantitative tools",lede:"A research terminal for exploring Kenya’s financial markets through official Central Bank of Kenya observations. It brings currency markets, Treasury-bill auctions, yield curves and practical valuation and risk tools into one connected workspace.",question:"Can market observations and financial models sit in one place without losing the source and context behind each number?",work:"A Next.js and React application with TypeScript, Python services, Neon PostgreSQL and charting. Its workspaces cover FX analysis, market intelligence, yield curves, Treasury bills, bond pricing, options and Greeks, backtesting, risk analysis and reporting.",integrity:"Historical observations remain distinguishable from calculations. The downloadable workbook documents CBK source lineage, quote conventions, sampling rules and limitations; missing observations are not silently replaced with zero.",tags:["Next.js","React","TypeScript","Python","PostgreSQL","CBK data"],links:[["Open live terminal","https://kenya-financial-analytics.vercel.app/"],["Source repository","https://github.com/paulndwekia/Kenya-Financial-Analytics"],["Download Excel report","https://kenya-financial-analytics.vercel.app/api/report"]]},
 {id:"yield-curve",slug:"kenya-yield-curve-risk-engine",discipline:"markets",label:"Fixed income",title:"Kenya Yield Curve & Interest Rate Risk Engine",status:"Completed · live",image:"/assets/previews/kenya-yield-curve-risk-engine.jpg",caption:"Fixed income · Yield curve · Interest-rate risk",lede:"A focused fixed-income research environment for studying the relationship between Treasury yields, maturity and bond valuation. It connects observed Treasury-market information with the mathematics used to assess price and interest-rate sensitivity.",question:"How do changing yields and maturity affect the value and risk of a fixed-income instrument?",work:"Treasury-bill observations, curve construction, bond cash flows and pricing, yield to maturity, duration, modified duration, convexity and DV01. The project reflects fixed-income topics I study and apply through financial engineering.",integrity:"The terminal is a research and learning tool. Observed data and model outputs should be read with their dates and assumptions, rather than treated as forward-looking guarantees.",tags:["Fixed income","Python","JavaScript","CBK data","Yield curves","Risk measures"],links:[["Open research terminal","https://kenya-yield-research-terminal.vercel.app/"]]},
 {id:"gdp-research",slug:"gdp-dashboard",discipline:"macro",label:"Macroeconomic research",title:"GDP Atlas — GDP Research Dashboard",status:"Completed · live on Vercel",image:"/assets/previews/gdp-research-dashboard.jpg",caption:"GDP Atlas · Global macroeconomic research",lede:"A completed macroeconomic dashboard for exploring the size, growth and distribution of economic activity across countries and regions. It keeps indicator definitions and source coverage visible.",question:"How can someone compare economies without mixing different measures, observation years or reported data with forecasts?",work:"A Next.js, React and TypeScript product with a global overview, country explorer, comparison tools, rankings, regional analysis, a data explorer and CSV downloads. World Bank reported indicators remain distinct from IMF World Economic Outlook estimates and projections.",integrity:"The dashboard is deployed on Vercel. Observation years are not presented as the current calendar year by default; missing values are omitted rather than converted to zero, and units and source methodology remain part of the exploration.",tags:["Next.js","React","TypeScript","World Bank","IMF WEO","Recharts"],links:[["Open GDP Atlas","https://gdp-research-dashboard-paulkieru-7166.vercel.app/"],["Source repository","https://github.com/paulndwekia/gdp-dashboard"]]},
 {id:"kenya-investment-intelligence",slug:"kenya-investment-intelligence",discipline:"macro",label:"Collaborative investment research",title:"Kenya Investment Intelligence",status:"Live dashboard · in progress",image:"/assets/previews/kenya-investment-intelligence-dashboard.jpg",caption:"Kenyan markets · Investment outlook · Collaborative research",lede:"A Kenyan market research platform developed alongside the Kenya Investment Outlook 2026 and the Rock Investment Bank Research Challenge 2026. This is collaborative work with Edward Chege Waweru, bringing together equity-market analysis, fixed income, macroeconomic indicators and risk research.",question:"How can market evidence, macroeconomic context and risk analysis share one research environment without overstating what the data supports?",work:"The October 2026 report documents a Rock Data Plus dataset with 181,554 retained NSE observations across 74 securities or series, covering 3 January 2017 to 29 June 2026. Raw source data is not redistributed through this portfolio.",integrity:"Approved data integration, report validation and automatic deployment from GitHub remain in progress. Earlier security-level outputs contained non-finite values and unstable risk results; those rankings are withheld pending validation rather than presented as investment signals.",tags:["Next.js","React","Python","PostgreSQL","Quantitative research","Macroeconomics"],links:[["Open live dashboard","https://kenya-investment-intelligence.vercel.app/"],["Project repository","https://github.com/paulndwekia/Rock_Investment_Outlook_2026"],["Read Kenya Investment Outlook 2026","https://github.com/paulndwekia/Rock_Investment_Outlook_2026/blob/main/report/Rock_Investment_Outlook_2026_Report.md"]]},
 {id:"fintel",slug:"fintel-kenya-financial-intelligence",discipline:"systems",label:"Financial technology",title:"FINTEL — Kenya Financial Intelligence",status:"Live build · in progress",image:"/assets/previews/fintel-market-intelligence.jpg",caption:"FINTEL · Financial intelligence systems",lede:"A Kenyan financial intelligence workspace built around official Central Bank of Kenya data, a persistent market-data layer and a separate quantitative engine. Its architecture connects ingestion, validation, storage, calculations and an analytical interface.",question:"What would it take to turn separate financial-market datasets and calculations into one dependable research workspace?",work:"Official FX, Treasury-bill, Treasury-bond and yield-curve ingestion; source lineage and duplicate handling; a React and TypeScript terminal; Express and tRPC APIs; MySQL/TiDB persistence; and Python models for bond pricing, options and portfolio risk.",integrity:"CRM and research/news feeds, some macro and cross-market modules, historical curve replay and report export remain unfinished. Portfolio risk requires authorised positions and aligned history. The live build is actively being developed; not every module is complete.",tags:["React 19","TypeScript","Express","Python","Drizzle","MySQL / TiDB"],links:[["Visit FINTEL","https://fintel-kenya-financial-intelligence.onrender.com/"],["Source repository","https://github.com/paulndwekia/fintel-kenya-financial-intelligence"],["Technical project manifest","https://github.com/paulndwekia/fintel-kenya-financial-intelligence/blob/main/FINTEL_PROJECT_MANIFEST.md"]]},
 {id:"standpoint",slug:"standpoint-financial-intelligence",discipline:"products",label:"Fintech & education",title:"StandPoint — Financial Intelligence",status:"Completed · live",image:"/assets/previews/standpoint-yield-curve-nov-2026.jpg",caption:"StandPoint · Financial intelligence and campus experience",lede:"A Kenyan financial intelligence and campus platform that brings market monitoring, quantitative tools, financial learning and student-focused services into one product.",question:"Can financial information and useful campus tools sit within one product instead of asking students to move between unrelated services?",work:"The product combines market-facing features with a student experience. It demonstrates product thinking, full-stack development and the connection between finance tools and the day-to-day needs of a campus community.",integrity:"The source repository is private, so this page links to the live product rather than implying public source access.",tags:["React","TypeScript","Python","Express","PostgreSQL"],links:[["Visit StandPoint","https://standpoint-2aze.onrender.com/"]]},
 {id:"buzz",slug:"buzz-social-discovery",discipline:"products",label:"Digital product",title:"Buzz — Entertainment & Social Discovery",status:"Completed · private showcase",image:"/assets/previews/buzz-social-discovery.jpg",caption:"Buzz · Entertainment and social discovery",lede:"A social discovery product built around finding, sharing and exploring things worth watching and listening to. It reflects a different side of my work: consumer-facing product thinking beyond finance.",question:"How can people find, share and explore things worth watching and listening to?",work:"Translating a discovery problem into a complete digital product, with a focus on how people find and share entertainment.",integrity:"The completed project is available as a private showcase. This page uses the actual stored project preview rather than inventing a public demonstration.",tags:["Product design","Discovery","Social","Next.js"],links:[["Project link","https://buzz-social-platformbuzz-social-platform.onrender.com/"]]},
 {id:"nkaulele",slug:"nkaulele-contractors",discipline:"products",label:"Client delivery",title:"Nkaulele Contractors Limited",status:"Completed · live",image:"/assets/previews/nkaulele-contractors-home-2026.jpg",caption:"Nkaulele Contractors · Client website",lede:"A company website for a construction and civil engineering business based in Nkoilale, Maasai Mara. The site introduces the company, its construction-materials and construction-service offering, and a clear route for project enquiries.",question:"How can the company's services and project work be explained clearly to potential clients?",work:"Adapting the design and content to a real business, working with company imagery and building a website that explains services clearly rather than relying on a generic template.",integrity:"This was client work for Nkaulele Contractors Limited. The case study describes the website delivered, not ownership of the company’s construction work.",tags:["Next.js","React","JavaScript","CSS","Vercel"],links:[["Visit company website","https://nkaulele-contractors-website.vercel.app/"]]}
];
const researchFilters=[["all","All work"],["markets","Markets & fixed income"],["macro","Macroeconomics"],["systems","Financial systems"],["products","Products & client work"]];
function ResearchCard({item}){
  return <Reveal className="research-reveal"><article className="research-card" id={item.id}>
    <figure className="research-visual"><div className="project-image-fallback research-image-fallback"><span>{item.label}</span><strong>{item.title}</strong></div><figcaption>{item.caption}</figcaption></figure>
    <div className="research-copy"><div className="research-eyebrow"><span className={"discipline-tag discipline-"+item.discipline}>{item.label}</span><span className="research-status">{item.status}</span></div>
      <h3>{item.title}</h3><p className="research-lede">{item.lede}</p>
      <div className="research-detail"><strong>The question</strong><p>{item.question}</p></div>
      <div className="research-detail"><strong>What I worked on</strong><p>{item.work}</p></div>
      <div className="research-detail research-integrity"><strong>Scope & research integrity</strong><p>{item.integrity}</p></div>
      <div className="research-tags">{item.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
      <div className="research-links">{item.links.map(([label,url])=><A key={url} href={url}>{label} </A>)}</div>
    </div>
  </article></Reveal>;
}
function ResearchPage(){
  const [filter,setFilter]=useState("all");
  const visible=researchItems.filter(item=>filter==="all"||item.discipline===filter);
  const reports=[
    ["Excel · Live report","Kenya Financial Analytics — Market Research Report","A generated workbook based on stored CBK foreign-exchange and Treasury-bill observations. It includes a summary, source-linked history tables and a methodology sheet. The database must be available when the report is requested.","https://kenya-financial-analytics.vercel.app/api/report","Download workbook"],
    ["Research report · 03 Oct 2026","Kenya Investment Outlook 2026","Quantitative research on the Kenyan equity market and macro environment, including data scope, risk and return methodology, cross-market framework, scenarios and governance notes. Preliminary measures are flagged and rankings that did not pass validation are withheld.","https://github.com/paulndwekia/Rock_Investment_Outlook_2026/blob/main/report/Rock_Investment_Outlook_2026_Report.md","Read report"],
    ["Technical documentation","FINTEL — Architecture, Quantitative Models & Data Lineage","Project documentation covering architecture, source ingestion, model catalogue, current data states, security foundation and handover status. It explains what is in place and what remains to be completed.","https://github.com/paulndwekia/fintel-kenya-financial-intelligence/blob/main/FINTEL_PROJECT_MANIFEST.md","Browse technical notes"],
    ["Methodology & product notes","GDP Atlas — Data definitions and research approach","The dashboard keeps World Bank reported indicators and IMF projections separate, documents definitions and coverage, and explains missing-value handling.","/research/#gdp-research","Read project notes"]
  ];
  return <><Header research/><main className="research-page">
    <section className="research-hero section-wrap"><div><p className="eyebrow">Research archive · Project notes</p><h1>More than the interface.</h1><p className="research-intro">The reasoning, data choices and unfinished edges behind the work. I keep the project notes here so a dashboard is not the only thing you have to judge.</p></div><aside className="research-aside"><span className="aside-kicker">A note on the work</span><strong>Good analysis should be traceable.</strong><p>Observed data, derived calculations and forward-looking scenarios are not interchangeable. I try to show the source, sample period, method and known limitation beside the result.</p></aside></section>
    <nav className="research-index section-wrap" aria-label="Research page contents"><a href="#case-studies">Case studies</a><a href="#reports">Reports & publications</a><a href="#method">Methodology</a><a href="/#work">Selected projects</a></nav>
    <section className="research-section section-wrap" id="case-studies"><div className="section-heading"><Reveal><p className="eyebrow">Project case studies</p><h2>What went into the work.</h2></Reveal><Reveal><p className="section-intro">Each project has a different reason for existing. I’ve kept the notes specific to the work rather than forcing every one into the same story.</p></Reveal></div>
      <div className="research-filters" role="group" aria-label="Filter research case studies">{researchFilters.map(([key,label])=><button key={key} type="button" data-research-filter={key} aria-pressed={filter===key} className={filter===key?"is-active":""} onClick={()=>setFilter(key)}>{label}</button>)}</div>
      <p className="research-filter-status" role="status" aria-live="polite" data-research-count>Showing {visible.length} case studies</p><div className="research-list">{visible.map(item=><ResearchCard item={item} key={item.id}/>)}</div>
    </section>
    <section className="research-section section-wrap" id="reports"><div className="section-heading"><Reveal><p className="eyebrow">Reports & publications</p><h2>Research you can read.</h2></Reveal><Reveal><p className="section-intro">A short catalogue of deliverables connected to the projects above. Live data-generated reports are labelled separately from fixed-date research documents.</p></Reveal></div>
      <div className="report-library">{reports.map(([kind,title,desc,url,action])=><article className="report-row" key={title}><span className="report-kind">{kind}</span><div><h3>{title}</h3><p>{desc}</p></div><A href={url} className="report-action">{action} </A></article>)}</div>
    </section>
    <section className="method-section"><div className="method-copy"><p className="eyebrow eyebrow-light">One rule across the research</p><h2>Show the source.<br/>Show the assumption.</h2><p>Historical observations, modelled results and forward-looking scenarios have different meanings. When I can, I keep the origin of the data, sample period and method close to the output. If the evidence is incomplete, the honest answer is to say so.</p></div><div className="method-points"><div><strong>Know where the numbers came from.</strong><p>Sources, dates and definitions should be visible.</p></div><div><strong>Show what the model is doing.</strong><p>Calculations need their assumptions and limitations.</p></div><div><strong>Keep unfinished work honest.</strong><p>A live link is not the same as a finished module.</p></div></div></section>
    <section className="research-contact section-wrap"><p className="eyebrow">Questions or corrections</p><h2>Good research gets better when it is questioned.</h2><p>For questions about a project, a source or an assumption, the best route is to get in touch directly.</p><A href="/#contact" className="button button-primary">Contact me <span></span></A></section>
  </main><Footer/><CookieNotice/></>;
}
export default function App(){
  const research=window.location.pathname.startsWith("/research");
  useEffect(()=>{document.documentElement.dataset.appReady="true";document.title=research?"Research & Reports — Paul Ndwekia":"Paul Ndwekia — Finance, Data & Technology";},[research]);
  return research?<ResearchPage/>:<HomePage/>;
}
