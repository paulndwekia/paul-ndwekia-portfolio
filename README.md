# Paul Ndwekia — Portfolio

Personal portfolio for work across finance, data and technology.

**Live site:** https://paul-ndwekia-portfolio.vercel.app  
**GitHub:** https://github.com/paulndwekia

## How updates work

- GitHub Actions refreshes public repository activity every six hours.
- New public, non-fork repositories are discovered and added to the portfolio as **In progress** entries.
- Commit activity is shown as progress evidence only. It never marks a project complete.
- A project becomes **Completed** only after a LinkedIn publication record is submitted through the repository's **LinkedIn project publication** issue form.
- A submitted LinkedIn post may include the original image URL. The site uses that image for the project preview.
- Once the workflow commits the evidence, Vercel's Git integration can deploy the update automatically.

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
