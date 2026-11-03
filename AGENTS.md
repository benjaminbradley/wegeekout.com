# AGENTS.md — notes for AI coding sessions

Read `README.md` first for the layout and the authoring workflow. This file covers the rules and traps that aren't obvious from the code.

## What this is

Benjamin Bradley's personal site, We Geek Out!, at wegeekout.com: an Astro 7 static site on GitHub Pages. The content was migrated from a Drupal 6 blog (2011–2015) and a WordPress site (2017–2026). The migration was finished in November 2026. Its history and every content decision are in `planning/` (historical; the import tools mentioned there were removed and live in git history at commit `ddd4ea1`). Read those notes before changing migrated content.

The **repository is public**.

## Hard rules

1. **URLs are permanent.** Every entry's URL is its `path` frontmatter. Don't change a published `path`, rename the `/content/` or `/category/tags/` URL schemes, or remove redirects in `astro.config.mjs`. `scripts/legacy-urls.txt` lists the URLs that must keep resolving, and `npm run check` enforces it.
2. **Never commit secrets or personal data.** That includes the SQL dumps (outside the repo), `.work/` (git-ignored: SQLite copy, raw bodies, archives), and anything holding password hashes, sessions or private email addresses or calendars. A personal calendar embed was removed deliberately; don't bring it back.
3. **Content files are the source of truth.** Edit `src/content/**` directly. Nothing regenerates it. `src/data/drupal.json` (old tag URLs and redirects) is also hand-maintained now. Don't resurrect the one-time import scripts from git history; re-running them would overwrite months of edits.
4. **Faithful rendering of old posts.** The user wants old posts to look as they did (layout, spacing, formatting) under the new theme. Don't "improve" old prose, fix spelling, or restructure posts unless asked. Raw HTML in old posts (`img.float-right`, `div.popquote`, `pre.ascii-art`, `<small>`, `.text-large`, tables) is deliberate; it's styled in `src/styles/global.css`.
5. **Ask before publishing a draft, deleting content, committing or pushing.** The user reviews drafts themselves and has asked to review before commits.
6. **Text you write into a post must be flagged.** If you complete a sentence or add content to an old post, say exactly what you wrote so the user can review it.

## Conventions

- **Drafts:** `draft: true`. Visible in `npm run dev`, excluded from `npm run build`. Drafts are still public in the git repo.
- **Posts that were unpublished on Drupal and published later** keep their original `pubDate`, have `legacy.publishedFromDraft`, and end with the standard note: *"This post was originally left as an unpublished draft. Published as work-in-progress in November 2026 for historical reference."*
- **New posts:** `path: "/blog/<slug>/"`. **New pages:** `path: "/<slug>/"`.
- **Images:** new ones go in `public/images/...`. Legacy images stay at `/sites/wegeekout.com/files/` (Drupal) and `/wp-content/uploads/` (WordPress) because old URLs point there.
- **Dates** are America/Chicago.
- **Typography:** `markdown.smartypants` is off on purpose, to keep the original straight quotes.
- **Dependencies are pinned to exact versions**, each released at least 3 days before it was added. Check peer dependencies before upgrading (e.g. `@astrojs/mdx` majors track Astro majors). Don't add MDX or TypeScript tooling without a reason; posts are plain `.md`.
- **Styling:** Tailwind v4 plus `@tailwindcss/typography`. Dark mode is class-based (`@custom-variant dark` in `global.css`), with a blocking inline script in `Base.astro` to prevent the light flash.

## Verify every change

```sh
npm run build && npm run check
```

`check` fails on broken internal links or lost legacy URLs. There's no browser in the dev container, so say when you couldn't check something visually.

## Environment traps

- **`node_modules` may be built for macOS.** The user also runs `npm install` on their Mac host, in the same folder. In the Linux dev container the build then fails with errors like `Cannot find module './rolldown-binding…'` / `oxide`. Don't reinstall in place, because that breaks the Mac. Instead, copy the repo without `node_modules`, `dist`, `.work` and `.git` into a scratch directory, run `npm ci` there, and build and check there.
- **The dev container has an egress firewall.** npm and GitHub are reachable; archive.org and most of the web are not. For Internet Archive work, write a script for the user to run on the host (the earlier `scripts/wayback-fetch.sh` in git history is an example). Don't trust archive URLs that another tool supplies without verifying them. An earlier research handoff invented Wayback timestamps.

## Deployment

Pushing to `main` deploys automatically (`.github/workflows/deploy.yml`, which also runs `npm run check`). Pushing means publishing, so never push without the user's go-ahead.
