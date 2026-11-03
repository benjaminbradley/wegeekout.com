# Intake review: Drupal 6 content + Astro proposal

> **Historical record.** The migration is complete. Scripts, `docs/` and `.work/` paths mentioned below were removed after the migration; the tools are in git history (commit `ddd4ea1`).

Date: 2026-11-02. Inputs reviewed:

| Input | Location | Notes |
|---|---|---|
| Drupal 6 dump | `../wegeekou_wegeekout_d6.sql` (13 MB) | Loaded into SQLite at `.work/d6.sqlite` by `scripts/load_mysql_dump.py` |
| WordPress dump | `../wegeekou_wegeekout_wp.sql` (11 MB) | Not mentioned in the brief; checked only for overlap |
| Hosting archive | `../webhosting.coop-public_html.tar.gz` (964 MB) | Listing at `.work/tarlist.txt` |
| Static WP archive | `docs/` in this repo | Live-ready GitHub Pages site, web3forms contact form |
| Gemini handoff | the Astro spec | Treated as a proposal |

`.work/` is git-ignored. The dump and the SQLite copy contain password hashes, sessions and email addresses, and this repo is public on GitHub, so neither should ever be committed.

## 1. What the Drupal database holds

- **35 nodes**: 31 blog posts (22 published, 9 unpublished) and 4 pages. Dates run from Jan 2011 to Jul 2015. See the inventory at the end.
- **Tags**: 92 free tags used by 22 posts, plus a 3-term "Draft Stage" vocabulary (Concept/Outline/Draft) used on one draft.
- **URLs**: every node has an alias of the form `/content/<slug>`.
- **One custom field**: `field_references` (image credits) on 2 posts. The Gemini script doesn't read it.
- **Images**: 14 uploaded files under `sites/wegeekout.com/files/`, used by 11 posts.
- **Comments**: none in the DB. Comments went through Disqus (the `disqus` table only holds per-node settings), so any comment history is in a Disqus account, not here.
- **Everything else** (cache, sessions, watchdog, search index, menus, Mollom, notifications) has no archival value. Your guess was right.

### Body formats

- Drupal ran the **line-break converter on both input formats**. Several posts have no `<p>` tags and rely on it. A straight HTML-to-Markdown pass would merge their paragraphs.
- **codefilter** was enabled, so `<code>` blocks were rendered specially.
- Messy content: post 11 is a pasted Gmail thread (464 `<wbr>`, Gmail spacer images); 5 posts have tables; 2 `<!--break-->` teaser markers; `<tt>`, `<pre>` and `<iframe>`.
- **Privacy**: page 21 ("Benjamin's availability") embeds a Google Calendar that exposes personal and work calendar addresses. Post 11 quotes a spam bounce that includes a third party's email address.
- **Dead links**: Yahoo Pipes, Megaupload, MediaFire, a `wegeekout.com/cgi-bin/dictlookup.pl` tool that no longer exists, and an external reactiongifs.com GIF.

## 2. Where the media is (and isn't)

**13 of the 14 Drupal images are missing from every source we have.**

- The hosting archive has no `sites/` folder. It contains the WordPress site, a separate `bmm.quest` WP install, and UpdraftPlus backups from Dec 2022 to Feb 2023. None of these hold the Drupal files.
- The `fg-drupal-to-wp` log (2017-07-18) shows the WP import brought over **0 blog posts, 0 media**, 4 pages and 92 tags. The free plugin skipped the "blog" node type. So the blog posts were never in WordPress; this dump is their only copy.
- Exception: "Committing code - best practices" was re-posted to WP on 2022-04-21 by hand. It's already in `docs/2022/04/21/...` with its image, `docs/sites/wegeekout.com/files/git-diff2-250.png`.
- Possible recovery: the Wayback Machine, or a local copy on an old computer. → Research item R1.

## 3. Review of the Gemini spec

Overall direction (Astro, content collections, Markdown + frontmatter, Tailwind, Actions deploy) is reasonable for a site this size. Its details have problems, roughly in order of impact:

### Will not work as written

1. **The migration script exports 0 posts.** Its regex expects `INSERT INTO node VALUES`, but this dump writes `INSERT INTO \`node\` (col, …) VALUES`, so nothing matches. Even if it matched, its `node` table has 6 columns against the dump's 15, and the bare `except: continue` hides every failure.
2. **The script is a syntax error on Python 3.11** (the version in this container). It puts a backslash inside an f-string expression, which only Python 3.12+ allows.
3. **Version pins conflict.** `@astrojs/mdx@4.1.0` requires `astro ^5`, but the spec pins `astro@7.3.0`, so `npm install` fails. The Astro 7 line needs mdx 8.x. `tailwindcss@4.0.0` is the first 4.x release (Jan 2025), so the pins look stale rather than chosen with a 3-day cooldown. Current versions (npm, today): astro 7.4.5, @astrojs/mdx 8.1.2, tailwind 4.3.4, typescript 7.0.2.
4. **The dark-mode toggle is broken under Tailwind v4.** v4's `dark:` variant follows the OS setting by default. A `.dark` class does nothing until `@custom-variant dark (&:where(.dark, .dark *));` is declared, so the toggle's `dark:hidden` icons never switch. Its theme script also runs after the page draws, so dark-mode users see a light flash first.

### Gaps and data loss

5. **Drops all 9 unpublished posts** (`status = 1`), with no option to keep them as drafts.
6. **Regex HTML→Markdown loses content**: it ignores line-break paragraphs, tables, lists, `<code>`/`<pre>`, nested tags and links with extra attributes. A real converter is needed (Python `markdownify` or JS `turndown`), or keep the body as HTML.
7. **Ignores tags, URL aliases, images, the image-credits field and teasers.** `description` is just the title again.
8. **Dates depend on the build machine's timezone** (`fromtimestamp` with no zone). They should be pinned to America/Chicago.
9. **Breaks every existing URL.** It moves posts to `/blog/<date-slug>`, but the old Drupal URLs are `/content/<slug>`. It renames `/contact-me/` to `/contact`. It leaves the current WP pages (`/bureau-of-magical-mischief/`, `/chosen-family-tree/`, `/2022/04/21/...` and the others) with no route at all. GitHub Pages can't do server redirects, so every moved URL needs a redirect stub page.
10. **Doesn't migrate the current site at all.** It builds only Home/Blog/Contact. The 7 WP pages, 1 WP post and ~80 images in `docs/` aren't covered.

### Conflicts with the existing repo

11. **Deploy model.** The repo deploys today by serving `docs/` from the branch (DEPLOY.md). The spec deploys a build artifact through Actions. Switching means changing the Pages source and moving `CNAME` to `public/`, and it retires `docs/`.
12. **Web3Forms.** The spec uses a `YOUR_ACCESS_KEY` placeholder. The live form already has a key and a honeypot in `docs/contact-me/index.html`; reuse those.
13. **Identity.** The spec's header reads "Benjamin ." while the site is "We Geek Out!". Branding and the visual design aren't settled.
14. **Paths.** The spec expects `./drupal6_dump.sql` in the repo. The dump should stay outside the repo, or in the ignored `.work/`.
15. **Minor.** MDX is unnecessary if posts are plain `.md`. MDX also chokes on `{` and `<` in old content such as the regex post, so plain `.md` is safer.

## 4. Decisions needed from you

1. **Unpublished posts (9)**: import as `draft: true` (kept in the repo, not shown on the site), import some as published, or skip?
2. **Drupal pages (4)**: Welcome, Availability (exposes your calendar addresses), Website TODO, Dashboard mockup. I suggest dropping all four.
3. **Blog URL scheme**: keep `/content/<slug>/` (old links keep working, no redirects), or use a new scheme like `/blog/<slug>/` and add redirect stubs?
4. **Existing WP content**: port the current pages into Astro as part of this, or keep them as frozen HTML under `public/`?
5. **Duplicate post**: "Committing code - best practices" exists in Drupal (2015) and WP (2022). Which date and URL wins?
6. **Body format**: convert to Markdown (cleaner, needs per-post review), or keep sanitized HTML in `.md` files (faithful, less editable)? I recommend Markdown, with raw HTML kept for tables.
7. **Branding/design**: keep the "We Geek Out!" identity and the Twenty Twenty look, or a fresh design?

## 5. Proposed sequence

| # | Step | Who |
|---|---|---|
| 0 | Answer the decisions in §4 | You |
| 1 | Send research handoff R1–R6 (below) to Gemini | You + Gemini |
| 2 | Write the real migration script on the SQLite loader: tags, aliases, drafts, line-break conversion, code blocks, image-credits field, pinned timezone, proper HTML→MD. Output to `src/content/blog/` and review the diff post by post. | Claude |
| 3 | Content cleanup pass: privacy items, dead links (link to archive.org copies or mark them), missing images (restore from R1 or add a placeholder note) | Claude, then you review |
| 4 | Scaffold Astro next to `docs/` using verified version pins (R4). The live site stays untouched until cutover. | Claude |
| 5 | Port the current WP pages, post and images; carry over the web3forms form and key | Claude |
| 6 | URL preservation: keep or redirect every URL in `docs/` and every `/content/<slug>`; add a link checker to the build | Claude |
| 7 | Theme/design pass (Tailwind v4 dark mode done right) | Claude + you |
| 8 | Cutover: Actions workflow, switch the Pages source, move CNAME, remove `docs/` | You (repo settings) + Claude |

## 6. Research handoff for Gemini (draft)

- **R1 Missing images**: Does the Wayback Machine have any of these files under `wegeekout.com/sites/wegeekout.com/files/`? scavengeroo-screencap.png, frets-small.jpg, strum-small.jpg, notes-small.jpg, CMD32.png, android_200.jpg, batteries-IMG_2129_250.jpg, happiness-activities.png, happiness-activities_matrix.png, happiness-hours.png, "yahoo pipes.png", pacworld-thumb150.png, seated_man_thinks_of_clipboard.png. Give the snapshot URLs. (A direct `web.archive.org/cdx` query may be quickest.)
- **R2 Disqus**: Is there still a way to export comments from a Disqus forum for a long-dead site? What's the format?
- **R3 Redirects on GitHub Pages**: What's the best current practice for many old-URL redirects on static GitHub Pages (meta-refresh stubs, Astro's `redirects` config output, canonical tags)? Any SEO caveats?
- **R4 Version pins**: Give a compatible set for Astro 7.x + @astrojs/mdx (if used) + @astrojs/sitemap + Tailwind 4.x + TypeScript, each at least 3 days old. Note `@astrojs/mdx@8` peers on `astro ^7.2.10`. What changed in Astro 7 (content layer, the new `@astrojs/markdown-satteri` dependency) that affects the spec's `content.config.ts`?
- **R5 Tailwind v4 dark mode**: What's the recommended class-based dark-mode setup in v4, and how do you avoid the light flash in Astro?
- **R6 HTML→Markdown**: Which converter handles legacy Drupal HTML best (tables, `<tt>`, autop-dependent text): markdownify, html2text, pandoc or turndown?

## Appendix: Drupal content inventory

Dates are in America/Chicago. "images" counts attached uploads.

| nid | type | status | date | title | old URL | tags | images |
|---|---|---|---|---|---|---|---|
| 1 | page | published | 2011-01-28 | Welcome to We Geek Out | /content/welcome-we-geek-out |  |  |
| 2 | blog | published | 2011-02-07 | The Geek Way | /content/geek-way | api, google, programming |  |
| 3 | blog | published | 2011-02-14 | Knowing the Unknown | /content/knowing-unknown | knowledge, philosophy, religion, science, spirit |  |
| 4 | blog | **unpublished** | 2011-02-17 | Pages - a possible future | /content/pages-possible-future | creative, culture, entities, facebook, future, identity, internet, organisms, organizations |  |
| 5 | blog | published | 2011-03-02 | Twitter as a Distributed, Threaded Conversation Forum | /content/twitter-distributed-threaded-conversation-forum | communication, conversation, distributed, forums, social, tags, threaded, twitter |  |
| 6 | blog | published | 2011-03-11 | sxsw2011 / sched.org mobile fail / android win | /content/sxsw2011-schedorg-mobile-fail-android-win | android, fail, sxsw, tricks, web, win |  |
| 7 | blog | published | 2011-04-11 | How to be a lazy dishwasher, successfully! | /content/how-be-lazy-dishwasher-successfully | calculated-slacking, domestic, howto, rules |  |
| 8 | blog | published | 2011-05-02 | Our weekend project Scavengeroo.com launches | /content/our-weekend-project-scavengeroocom-launches | games, mobile, programming, qr codes, ruby on rails, scavengeroo | 1 |
| 10 | blog | **unpublished** | 2011-05-19 | What is a Game? | /content/what-game | culture, games, memes, meta, rules, solutions |  |
| 9 | blog | published | 2011-06-06 | Learning to play Guitar Hero | /content/learning-play-guitar-hero | games, learning, skills, video games | 3 |
| 11 | blog | published | 2011-06-11 | Where you see junk, I see a battlefield. | /content/where-you-see-junk-i-see-battlefield | robots, spam, sysadmin, war, web |  |
| 14 | blog | published | 2011-06-25 | Microsoft's broken command line interpretation | /content/microsofts-broken-command-line-interpretation | broken, command-line, microsoft, textmode | 1 |
| 12 | blog | published | 2011-07-20 | Rooting and Installing a custom ROM on a virgin Samsung Moment | /content/rooting-and-installing-custom-rom-virgin-samsung-moment | hacks, mobile, root | 1 |
| 15 | blog | published | 2011-07-27 | The universe is huge and old | /content/universe-huge-and-old | magic, math, perspective, universe, wonder | 1 |
| 17 | blog | **unpublished** | 2011-08-10 | The Emperor Has No Clothes, but Now We're All Nudists | /content/emperor-has-no-clothes-now-were-all-nudists |  |  |
| 18 | blog | published | 2011-09-21 | Happiness Math | /content/happiness-math | happiness, math, science, spirit, spreadsheets | 3 |
| 19 | blog | published | 2011-09-28 | Screen Fast | /content/screen-fast | self-hacking |  |
| 20 | blog | published | 2011-12-27 | Using Regular Expressions to find a Ham Radio Vanity Call Sign | /content/using-regular-expressions-find-ham-radio-vanity-call-sign | ham, pattern matching, patterns, programming, radio, search |  |
| 21 | page | published | 2012-02-21 | Benjamin's availability | /content/benjamins-availability |  |  |
| 22 | blog | published | 2012-03-09 | How NOT to spam Facebook with your SXSWi Tweets | /content/how-not-spam-facebook-your-sxswi-tweets | facebook, sxsw, twitter |  |
| 23 | blog | **unpublished** | 2012-03-16 | How to pick good sessions at SXSW interactive | /content/how-pick-good-sessions-sxsw-interactive | howto, sxsw |  |
| 24 | blog | published | 2012-04-15 | complete sentences are overrated | /content/complete-sentences-are-overrated | communication, language, shorties, writing |  |
| 25 | blog | **unpublished** | 2012-05-14 | What is Attachment Parenting? | /content/what-attachment-parenting | culture, domestic, parenting |  |
| 26 | blog | published | 2012-06-25 | Freefalling into Fatherhood | /content/freefalling-fatherhood | domestic, expectations, parenting |  |
| 27 | blog | published | 2012-08-24 | Website mashups using Yahoo! Pipes | /content/website-mashups-using-yahoo-pipes | hacks, maps, mashups | 1 |
| 28 | blog | **unpublished** | 2012-12-04 | exploring brand popularity with Google Trends (and a broken ankle) | /content/exploring-brand-popularity-google-trends-and-broken-ankle | data, science, search, self-hacking |  |
| 29 | blog | published | 2013-08-03 | My first github project! | /content/my-first-github-project | git, github, open-source, programming, python | 1 |
| 30 | blog | **unpublished** | 2013-10-25 | Fun Secure Password Generation | /content/secure-password-selection | howto, passwords, security |  |
| 31 | blog | **unpublished** | 2014-01-03 | Next Economy Conference - Jan 25, 2014 | /content/next-economy-conference-jan-25-2014 | culture, economy, events |  |
| 33 | blog | published | 2014-11-22 | My Body Developed a New Sense | /content/my-body-developed-new-sense | body, learning, technology | 1 |
| 34 | blog | published | 2014-12-15 | How to Merge into Traffic - the Right Way | /content/how-merge-traffic-authoritative-answer | driving, howto, traffic |  |
| 35 | blog | published | 2015-04-09 | Committing code - best practices | /content/committing-code-best-practices | howto, programming, tips | 1 |
| 36 | page | **unpublished** | 2015-04-09 | Website TODO | /content/website-todo |  |  |
| 37 | blog | **unpublished** | 2015-04-10 | freedom and responsibility | /content/freedom-and-responsibility | Concept |  |
| 38 | page | **unpublished** | 2015-07-26 | Personal Dashboard mockup | /content/personal-dashboard-mockup |  |  |
