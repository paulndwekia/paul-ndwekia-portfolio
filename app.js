(() => {
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
  const owner = "paulndwekia";
  const data = { projects: [], evidence: [], github: null, profile: null };
  let activeProjectFilter = "all";
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  const menu = $("#primary-nav"), toggle = $(".menu-toggle");
  if (menu && toggle) {
    const setMenuOpen = open => {
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    };

    toggle.addEventListener("click", () => {
      setMenuOpen(!menu.classList.contains("is-open"));
    });

    $$("a", menu).forEach(link => link.addEventListener("click", () => setMenuOpen(false)));

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && menu.classList.contains("is-open")) {
        setMenuOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", event => {
      if (!menu.classList.contains("is-open")) return;
      if (!menu.contains(event.target) && !toggle.contains(event.target)) {
        setMenuOpen(false);
      }
    });
  }

  const dateLabel = value => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" :
      date.toLocaleDateString("en-KE", { day:"numeric", month:"short", year:"numeric" });
  };
  const relative = value => {
    const hours = Math.floor((Date.now() - new Date(value).getTime()) / 3600000);
    if (!Number.isFinite(hours) || hours < 0) return "recently";
    if (hours < 1) return "less than an hour ago";
    if (hours < 24) return hours + "h ago";
    if (hours < 168) return Math.floor(hours/24) + "d ago";
    return dateLabel(value);
  };
  const slugify = value => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const evidenceFor = slug => data.evidence.find(item => item.project_slug === slug && item.post_url);

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  const defaultProfileImage = "https://avatars.githubusercontent.com/u/270900506?v=4";
  function renderProfile() {
    const customPath = data.profile?.photo_path;
    const photo = customPath
      ? customPath + (customPath.includes("?") ? "&" : "?") + "v=" + encodeURIComponent(data.profile?.updated_at || "1")
      : defaultProfileImage;
    $$(".profile-avatar").forEach(image => {
      image.onerror = () => { image.onerror = null; image.src = defaultProfileImage; };
      image.src = photo;
      image.alt = "Paul Ndwekia profile picture";
    });
    const status = $("#profile-photo-status");
    if (status) status.textContent = customPath
      ? "Custom profile photo · GitHub remains the fallback"
      : "GitHub photo is the default";
  }
  function buildProjectCover(project) {
    const cover = create("div", "cover-art");
    const motif = create("div", "cover-ornament");
    motif.setAttribute("aria-hidden", "true");
    cover.append(motif);
    cover.append(
      create("span", "", project.cover_kicker || project.category || "Selected work"),
      create("strong", "", project.cover_title || project.name)
    );
    return cover;
  }

  function projectPreview(project, evidence) {
    const panel = create("div", "project-preview " + (project.preview_class || "preview-github"));
    const imageUrl = evidence?.image_url || project.preview_image_url || project.preview_image;
    if (imageUrl) {
      const image = create("img");
      image.alt = project.name + (evidence?.image_url ? " — original LinkedIn project image" : " — project preview");
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", () => {
        panel.replaceChildren(buildProjectCover(project));
      }, { once:true });
      panel.append(image, create("span","preview-label",
        evidence?.image_url ? "LinkedIn project image" : "Live project preview"));
      image.src = imageUrl;
      return panel;
    }

    // A designed editorial cover is the intentional fallback for private and research projects.
    panel.append(buildProjectCover(project));
    return panel;
  }
  function renderProjects() {
    const grid = $("#project-grid");
    if (!grid) return;
    grid.replaceChildren();
    const evidence = data.evidence;
    data.projects.forEach(project => {
      const record = evidenceFor(project.slug);
      const completed = Boolean(record);
      const repo = (data.github?.repositories || []).find(item => item.name === project.repository);
      const card = create("article","project-card");
      card.dataset.completed = String(completed);
      card.dataset.live = String(Boolean(project.live_url));
      card.dataset.progress = String(!completed);
      card.append(projectPreview(project, record));
      const body = create("div","project-body");
      const meta = create("p","project-meta", completed ? "Completed · LinkedIn publication verified" : (project.stage_label || "In progress"));
      const heading = create("h3","",project.name);
      const description = create("p","",project.description || repo?.description || "A project in the finance, data and technology space.");
      const tags = create("div","tag-list");
      (project.stack || (repo?.language ? [repo.language] : [])).forEach(tag => tags.append(create("span","",tag)));
      const signal = create("p","repo-signal");
      if (repo) {
        const activityAge = (Date.now() - new Date(repo.pushed_at).getTime()) / 86400000;
        signal.textContent = "GitHub · " + (activityAge < 7 ? "Updated this week" : activityAge < 30 ? "Updated this month" : "No recent public activity") + " · pushed " + dateLabel(repo.pushed_at);
        if (activityAge < 7) signal.classList.add("is-active");
      } else if (project.repository) {
        signal.textContent = "Private repository · details are not exposed publicly.";
      } else {
        signal.textContent = "Project record · GitHub source not linked.";
      }
      const links = create("div","project-links");
      if (project.live_url) {
        const visit = create("a","",project.live_label || "Visit project");
        visit.href = project.live_url; visit.target = "_blank"; visit.rel = "noopener"; links.append(visit);
      }
      if (repo?.html_url) {
        const source = create("a","","Source code");
        source.href = repo.html_url; source.target = "_blank"; source.rel = "noopener"; links.append(source);
      } else if (project.repository && !repo) {
        links.append(create("span","link-note","Private source"));
      }
      if (record?.post_url) {
        const post = create("a","","LinkedIn announcement");
        post.href = record.post_url; post.target = "_blank"; post.rel = "noopener"; links.append(post);
      }
      body.append(meta, heading, description, tags, signal, links);
      card.append(body); grid.append(card);
    });
    applyFilter(activeProjectFilter);
  }
  const filterDefinitions = {
    all: { label: "Everything", matches: () => true },
    completed: { label: "Completed", matches: card => card.dataset.completed === "true" },
    live: { label: "Live sites", matches: card => card.dataset.live === "true" },
    progress: { label: "In progress", matches: card => card.dataset.progress === "true" }
  };

  function applyFilter(value) {
    activeProjectFilter = filterDefinitions[value] ? value : "all";
    const definition = filterDefinitions[activeProjectFilter];
    const cards = $$(".project-card");
    const counts = {
      all: cards.length,
      completed: cards.filter(card => card.dataset.completed === "true").length,
      live: cards.filter(card => card.dataset.live === "true").length,
      progress: cards.filter(card => card.dataset.progress === "true").length
    };

    $$(".filter-button").forEach(button => {
      const key = button.dataset.filter;
      const active = key === activeProjectFilter;
      const count = counts[key] ?? 0;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
      button.setAttribute("aria-label", (filterDefinitions[key]?.label || "Projects") + ", " + count + " projects");
      const countNode = $("[data-filter-count]", button);
      if (countNode) countNode.textContent = String(count);
    });

    let visible = 0;
    cards.forEach(card => {
      const matches = definition.matches(card);
      card.hidden = !matches;
      if (matches) visible++;
    });

    const status = $("#project-filter-status");
    if (status) {
      status.textContent = activeProjectFilter === "all"
        ? "Showing all " + visible + " projects"
        : "Showing " + visible + " of " + cards.length + " projects · " + definition.label;
    }

    const empty = $("#project-empty-state");
    if (empty) empty.hidden = visible !== 0;
  }

  $$(".filter-button").forEach(button => {
    button.addEventListener("click", () => applyFilter(button.dataset.filter));
  });

  function renderGitHub() {
    const list = $("#github-activity"), status = $("#github-sync-text"), dot = $("#github-state-dot");
    if (!list) return;
    if (!data.github || !Array.isArray(data.github.repositories)) {
      // Keep the pre-rendered last-synced activity visible if the live refresh is unavailable.
      if (status) status.textContent = "Showing the latest saved public activity";
      return;
    }
    list.replaceChildren();
    const repositories = data.github.repositories || [];
    if (!repositories.length) {
      list.append(create("p","activity-message","No public repository activity is available yet."));
    }
    repositories.slice(0,7).forEach(repo => {
      const row = create("article","activity-item");
      const top = create("div","activity-top");
      const link = create("a","",repo.name);
      link.href = repo.html_url; link.target = "_blank"; link.rel = "noopener";
      const time = create("time","",relative(repo.pushed_at));
      top.append(link,time);
      row.append(top);
      row.append(create("div","activity-commit",repo.latest_commit || repo.description || "Public repository"));
      row.append(create("div","activity-meta",[repo.language || "Repository", (repo.stars || 0) + " stars", "pushed " + dateLabel(repo.pushed_at)].join(" · ")));
      list.append(row);
    });
    if (status) status.textContent = "GitHub data refreshed " + dateLabel(data.github.generated_at);
    if (dot) dot.classList.add("is-live");
  }

  // Static HTML already contains project screenshots. Attach a fallback immediately so
  // even a failed external image becomes its designed project cover without a broken-image icon.
  function wireStaticPreviewFallbacks() {
    $$("#project-grid .project-preview img").forEach(image => {
      image.addEventListener("error", () => {
        const panel = image.closest(".project-preview");
        if (!panel) return;
        const project = {
          preview_class: panel.className,
          cover_kicker: image.dataset.coverKicker,
          cover_title: image.dataset.coverTitle,
          name: image.alt
        };
        panel.replaceChildren(buildProjectCover(project));
      }, { once:true });
    });
  }
  wireStaticPreviewFallbacks();

  async function fetchJson(path, retries = 1) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(path + " returned " + response.status);
        return await response.json();
      } catch (error) {
        if (attempt === retries) {
          console.warn("Portfolio data unavailable:", path, error);
          return null;
        }
      }
    }
    return null;
  }

  async function load() {
    // Selected work is rendered independently and immediately from its own small data file.
    const projectsPromise = fetchJson("/data/projects.json").then(projects => {
      if (Array.isArray(projects?.projects) && projects.projects.length) {
        data.projects = projects.projects;
        renderProjects();
      }
    });

    const evidencePromise = fetchJson("/data/linkedin-evidence.json").then(evidence => {
      if (Array.isArray(evidence?.evidence)) {
        data.evidence = evidence.evidence;
        if (data.projects.length) renderProjects();
      }
    });

    const githubPromise = fetchJson("/data/github-progress.json", 2).then(github => {
      if (Array.isArray(github?.repositories)) {
        data.github = github;
        renderGitHub();
        if (data.projects.length) renderProjects();
      } else {
        renderGitHub(); // retain the last synced activity already in the HTML
      }
    });

    const profilePromise = fetchJson("/data/profile.json", 1).then(profile => {
      if (profile && typeof profile === "object") {
        data.profile = profile;
        renderProfile();
      }
    });

    await Promise.all([projectsPromise,evidencePromise,githubPromise,profilePromise]);
    if (data.projects.length) renderProjects();
  }

  $("#github-refresh")?.addEventListener("click", async () => {
    const status = $("#github-sync-text");
    if (status) status.textContent = "The feed refreshes automatically every six hours. Refresh this page for the latest saved data.";
    await load();
  });

  const notice = $("#cookie-notice"), dismiss = $("#cookie-dismiss");
  try {
    if (notice && !localStorage.getItem("pn-essential-notice")) notice.hidden = false;
    dismiss?.addEventListener("click", () => { localStorage.setItem("pn-essential-notice","seen"); notice.hidden = true; });
  } catch (_) { if (notice) notice.hidden = true; }
  load();
})();