# wegeekout.com

Source for **We Geek Out!**, Benjamin Bradley's portfolio and blog, built with [Astro](https://astro.build) and published on GitHub Pages at https://wegeekout.com.

The content comes from two earlier versions of the site:

- **Drupal 6 blog (2011–2015).** Posts keep their old `/content/<slug>/` URLs.
- **WordPress site (2017–2026).** Pages keep their URLs.

The migration was done in November 2026. The one-time import tools were removed afterwards and can be found in git history (commit `ddd4ea1`). `planning/` records the decisions made along the way.

## Quick start

Requires Node.js 22.23.4 or newer.

```sh
npm install        # once, and after pulling dependency changes
npm run dev        # http://localhost:4321, live reload; drafts are visible here
npm run build      # static site -> dist/ (drafts are left out)
npm run check      # after a build: finds broken internal links and lost legacy URLs
npm run preview    # serve dist/ locally
```

## Repository layout

```text
src/
  content/
    blog/          blog posts, one Markdown file each
    pages/         standalone pages (home, project pages, ...)
  content.config.ts  frontmatter schema for both collections
  pages/
    [...path].astro    renders every post/page at its `path`
    blog/index.astro   /blog/ – all posts by year
    category/tags/[tag].astro  tag pages (old Drupal URLs)
    index.astro        the home page (content from pages/home.md)
    rss.xml.js         RSS feed at /rss.xml
    contact-me.astro   contact form (web3forms)
    404.astro
  layouts/Base.astro   header, nav, footer, dark-mode script
  components/          ThemeToggle, PostList, TagCloud
  styles/global.css    theme, plus styles for legacy post markup
  data/drupal.json     old Drupal tag URLs and redirects for old URLs
public/            copied as-is: images, CNAME
  sites/wegeekout.com/files/   Drupal-era images (URLs kept)
  wp-content/uploads/          WordPress-era images (URLs kept)
scripts/
  check-links.mjs  `npm run check`
  legacy-urls.txt  old public URLs that must keep working
planning/          migration notes and decisions (historical)
astro.config.mjs   site config and redirects
```

## Writing a new blog post

1. Create `src/content/blog/<slug>.md`:

   ```markdown
   ---
   title: "My new post"
   pubDate: 2026-11-15
   path: "/blog/my-new-post/"
   description: "One or two sentences for the blog list and search results."
   tags: ["programming", "howto"]
   draft: true
   ---

   Write the post in Markdown here.
   ```

2. Run `npm run dev` and open the post at its `path`. Drafts show a yellow banner.
3. When it's ready, set `draft: false` (or delete the line), then commit and push.

Notes:

- **`path` is the post's public URL.** It must start and end with `/` and be unique; the build fails on duplicates. New posts use `/blog/<slug>/`. Old posts keep `/content/<slug>/`. **Never change the `path` of a published post.** If you must, add a redirect (see below).
- **`pubDate`** can be a date (`2026-11-15`) or a date and time with offset (`2026-11-15T09:30:00-06:00`). Add `updatedDate:` for significant revisions.
- **Tags** are free text. A new tag gets its page at `/category/tags/<tag-slug>/` automatically. Reuse existing tags where you can (see `src/data/drupal.json`).
- **Images:** put files in `public/images/blog/<slug>/` and reference them as `![Alt text](/images/blog/<slug>/photo.jpg)`. For a floated thumbnail like the old posts, use raw HTML:
  `<img src="/images/blog/<slug>/thumb.jpg" alt="…" width="250" height="150" class="float-right">`
  (`float-left` also works). Floats stack on phones.
- **Other raw HTML** is fine in Markdown when needed: tables, `<small>`, iframes.
- The file name doesn't affect the URL, but keep it equal to the slug.

## Adding a page

Same as a post, but in `src/content/pages/<slug>.md`, without `pubDate` or `tags`:

```markdown
---
title: "New Project"
path: "/new-project/"
description: "What it is, in a sentence."
---
```

To add it to the top menu, edit `nav` in `src/layouts/Base.astro`.

## The home page

`src/content/pages/home.md` holds:

- **The "geek·out" definition:** the Markdown body.
- **The portfolio cards:** the `portfolio:` list in the frontmatter. To add a project, add an entry with `title`, `href`, `blurb` and an optional `image` (about 300×200; cards without an image show a strip of the banner).

`src/pages/index.astro` lays these out and adds the five most recent posts.

## Look and feel

- **Header:** the original 2011 banner, `public/images/theme/banner.gif`, recovered from the Internet Archive. A CSS gradient continues its colors on wide screens.
- **Favicon:** `public/favicon.png`, the robot from the banner.
- **Colors:** teal from the old Drupal theme, defined as CSS variables (light and dark) at the top of `src/styles/global.css`.
- **Fonts:** Oswald for headings (self-hosted via `@fontsource-variable/oswald`), Georgia for body text.

## Redirects

To move a URL, add `'/old-path': '/new-path/'` to `redirects` in `astro.config.mjs`. GitHub Pages can't send real HTTP redirects, so Astro writes a small page at the old path that forwards visitors (and search engines) to the new one. If the old URL was public, also add it to `scripts/legacy-urls.txt` so `npm run check` keeps guarding it.

## Contact form

`/contact-me/` posts to [web3forms](https://web3forms.com). The access key in `src/pages/contact-me.astro` is public by design. In the web3forms dashboard, restrict it to `wegeekout.com`.

## Deploying

Every push to `main` builds the site and deploys it to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Progress shows in the repo's **Actions** tab. To redeploy without a change, use **Run workflow** there.

The Action runs `npm run check` after building and won't deploy if links are broken or an old URL disappears. Run `npm run build && npm run check` locally before pushing to catch that early.

- **Repo settings:** Settings → Pages → Source must be **GitHub Actions**, with the custom domain `wegeekout.com` and **Enforce HTTPS** on.
- **DNS:** the domain's `A`/`AAAA` records point at GitHub Pages (185.199.108–111.153), and `www` is a CNAME to `benjaminbradley.github.io`.
- **Preview address:** the site uses root-relative URLs, so `benjaminbradley.github.io/wegeekout.com/` won't render correctly. Use the custom domain.

## Privacy

The repository is public. Never commit the old database dumps or anything else holding password hashes, sessions, private email addresses or calendars. `.work/` is git-ignored for local scratch files like these.
