# Paul Ndwekia — Finance, Data & Technology

Personal portfolio for my work across financial engineering, Kenyan markets, data and software.

**Production website:** https://paul-ndwekia-portfolio.vercel.app  
**Source repository:** https://github.com/paulndwekia/paul-ndwekia-portfolio

## Application structure

- React 19 with Vite, built as a two-page application: the homepage and the research archive.
- `data/projects.json` is the project catalogue and remains the source of project status, discipline, links and screenshots.
- `data/github-progress.json`, `data/linkedin-evidence.json` and `data/profile.json` continue to feed GitHub activity, publication evidence and the custom-profile-photo workflow.
- Privacy, terms, security, `.well-known/security.txt`, favicon, robots and sitemap are copied through to the production build.
- The original user-supplied photographs and actual project interface captures are served from the repository. Project screenshots use contain-style framing so the interface stays readable.

## Design and interaction

The visual system restores the blue identity: navy `#10243A`, slate blue `#456F95`, off-white `#F3F2ED`, white `#FFFFFF`, muted blue-grey `#687783` and soft borders `#D9DEDF`.

The React implementation uses the actual React Bits components for BlurText, FadeContent, SpotlightCard and TiltedCard. Their original source files and licence notice are kept in the repository. Motion is restrained and checks the reduced-motion preference.

## Project status rule

Completion and hosting are separate concepts:

- `portfolio_status: "completed"` means the project is finished.
- `portfolio_status: "in-progress"` means development or research is still underway.
- `site_status: "live"` means a public website or demonstration is available.

A project can therefore be both **Live site** and **In progress** without being labelled completed.

The completed portfolio includes Kenya Financial Analytics, StandPoint, GDP Atlas / GDP Research Dashboard, Kenya Yield Curve & Interest Rate Risk Engine, Buzz and Nkaulele Contractors Limited. GDP Atlas is completed and deployed on Vercel; Streamlit is not its hosting platform. FINTEL and Kenya Investment Intelligence remain live development projects with unfinished work clearly documented. Kenya Investment Intelligence is collaborative work with Edward Chege Waweru.

## Development

- `npm install` installs the application dependencies.
- `npm run dev` starts the Vite development server.
- `npm run build` copies the original public assets and builds both pages into `dist/`.
- `npm run preview` serves the production build locally.
- `npm run test:portfolio` runs the Playwright browser checks when Playwright is installed.

## Existing automation and owner controls

The GitHub Actions workflow refreshes public GitHub activity every six hours, captures the actual public project screens and handles LinkedIn publication evidence, deleted-publication withdrawals and the custom profile photo.

The LinkedIn workflow is owner-submitted. Free official integrations do not grant unrestricted access to personal LinkedIn posts, so this site does not scrape LinkedIn or ask for a LinkedIn password. A deleted LinkedIn post can be withdrawn using the issue form so it no longer supports a completed status.

The profile photo can still be changed through the owner-only GitHub issue form. JPEG, PNG and WebP uploads are validated, and the GitHub avatar is retained as fallback.

## Privacy and security

- Only public GitHub repository metadata and commit summaries are shown.
- Private repositories are not read by the public sync workflow.
- No personal access token is embedded in the frontend.
- Essential browser storage only remembers dismissal of the cookie notice; there are no analytics or marketing trackers.
- Security headers and the existing privacy, terms and security pages are preserved.
