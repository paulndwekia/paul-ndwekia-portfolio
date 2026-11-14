# Paul Ndwekia — Portfolio

Personal portfolio for work across finance, data and technology.

**Live site:** https://paul-ndwekia-portfolio.vercel.app  
**GitHub:** https://github.com/paulndwekia

## Deployment

The existing Vercel project `paul-ndwekia-portfolio` is connected to this repository. Commits pushed to the `main` branch trigger Vercel deployments automatically. The production domain remains https://paul-ndwekia-portfolio.vercel.app.

## How updates work

- GitHub Actions refreshes public repository activity every six hours.
- New public, non-fork repositories are discovered and added to the portfolio as **In progress** entries.
- Commit activity is shown as progress evidence only. It never marks a project complete.
- A project can become **Completed** when its LinkedIn profile Projects entry or public project announcement is recorded as evidence. A LinkedIn profile project listing is linked to the public profile; a post announcement can be registered with the **LinkedIn project publication** issue form.
- A submitted LinkedIn post may include the original image URL. The site uses that image for the project preview.
- The workflow captures the public homepages of hosted projects with a headless browser and stores real screenshots in `assets/previews/`.
- Previews are static images served by this portfolio; visitors do not need to call a third-party screenshot service.
- Projects without a public demo or supplied image are clearly shown as having no public preview rather than being represented by a fabricated screenshot.
- Once the workflow commits the evidence and preview images, Vercel's Git integration deploys the update automatically.

## Changing the portfolio profile photo

Open [Change portfolio profile photo](https://github.com/paulndwekia/paul-ndwekia-portfolio/issues/new?template=change-profile-photo.yml), choose **Upload a new profile photo**, attach a JPEG, PNG or WebP image (8 MB maximum), confirm and submit. The owner-only GitHub Actions workflow copies the image into this repository and updates the header, introduction, About section and footer for all visitors. The GitHub avatar remains the default and can be restored from the same form. Uploaded photos become public as part of this public repository.

## Registering a LinkedIn project post

1. Publish the project announcement on your personal LinkedIn profile.
2. Open [New LinkedIn publication evidence](https://github.com/paulndwekia/paul-ndwekia-portfolio/issues/new?template=linkedin-project-publication.yml).
3. Choose the project, paste the public LinkedIn post URL and, if available, the original public image URL.
4. Submit. GitHub Actions validates the LinkedIn URL, records the evidence and refreshes the site data.

This step is required because free official integrations do not provide unrestricted access to read personal LinkedIn posts. The workflow does not scrape LinkedIn or store LinkedIn login credentials. The repository owner can use the **Withdraw deleted LinkedIn evidence** issue form if a post is deleted; this removes the active completion evidence so the project no longer qualifies as Completed.

LinkedIn does not provide a reliable anonymous way to distinguish a deleted post from a login wall, privacy restriction or anti-bot response. The free setup therefore does not automatically downgrade a project based on an inconclusive HTTP check. The owner-triggered withdrawal form is the reliable deletion path.

## Privacy and security

- Only public GitHub repository metadata and commit summaries are published.
- Private repositories are not read by the public sync workflow.
- No personal access token is embedded in the website.
- The GitHub Actions token is scoped to this repository and used only by the workflow.
- Do not put secrets, private URLs or confidential material in issue submissions.

## Local preview

This is a static site. Open `index.html` in a browser or serve the repository root with any local static server. No package installation is needed.


## Project filters

The four project filters remain **Everything**, **Completed**, **Live sites**, and **In progress**. **Completed** intentionally includes every project explicitly marked completed, every project marked live (including private showcases such as Buzz), and projects with LinkedIn publication evidence. **Live sites** remains a separate overlapping category, so a live project appears in both Completed and Live sites. **In progress** contains projects explicitly marked as still being built or researched. The selected filter is preserved when project data refreshes; the controls also support keyboard and touch interaction. The filter controls have individual colours and no numeric counters.


The project filters retain the original four categories with restrained coloured surfaces and no numerical counters. Their click behaviour is covered by a Playwright mobile-browser check in the GitHub Actions workflow; the test checks all four categories, visible card counts, active state, empty state and Buzz's Live-sites classification.


**Category rule:** `Completed` reflects project completion evidence and manually verified completion status. `Live sites` is independent: every project with a configured public website or demo is listed there, even when development is still in progress. A live in-progress build can appear under both `Live sites` and `In progress` without being labelled completed. Finished projects such as StandPoint, Buzz, Kenya Yield Curve, Kenya Financial Analytics, Nkaulele Contractors and Rock Investment Outlook remain in `Completed`; live sites among them also appear in `Live sites`.


## Live project captures

Every configured public project URL has its own JPEG screenshot in `assets/previews/`. The six-hour GitHub Actions workflow visits each URL with Playwright and captures the visible first screen. Capture files are always stored with a `.jpg` extension and checked for a valid JPEG signature before they are committed. A project without a configured public website is not given a fabricated live screenshot.
