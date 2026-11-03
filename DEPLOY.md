# Deploying wegeekout.com

The site deploys to GitHub Pages from `github.com/benjaminbradley/wegeekout.com`.

- **Now (before cutover):** Pages serves the static WordPress archive in `docs/` from the `main` branch ("Deploy from a branch"). The Astro site isn't live.
- **After cutover:** a GitHub Actions workflow (`.github/workflows/deploy.yml`) builds Astro and deploys `dist/` on every push to `main`.

## Cutover from `docs/` to Astro

1. **Commit and push** the Astro work to `main`. This doesn't change the live site; Pages keeps serving `docs/`.
2. **Switch the source:** repo → Settings → Pages → Build and deployment → Source: **GitHub Actions**. The custom domain setting stays as it is.
3. **Deploy straight away:** Actions tab → "Deploy Astro site to GitHub Pages" → **Run workflow** on `main`. Wait for both jobs to go green (about a minute).
4. **Check the live site:**
   - The home page, `/blog/`, a few old posts (e.g. `/content/happiness-math/`), a tag page (`/category/tags/programming/`), `/contact-me/`, and a redirect (`/node/18` should land on Happiness Math).
   - Submit a test message through the contact form. If the web3forms key is domain-restricted, `wegeekout.com` must be allowed.
   - Locally, `npm run build && npm run check` must pass before you push.
5. **Turn on automatic deploys:** in `.github/workflows/deploy.yml`, change the trigger to:

   ```yaml
   on:
     push:
       branches: [main]
     workflow_dispatch:
   ```

   Commit and push. From now on, every push to `main` redeploys.
6. **Later, once you're happy:** delete `docs/` in a commit. All its pages and images now live in `src/content/` and `public/`. (`scripts/import-wp-pages.mjs` reads `docs/` and will stop working, which is expected.) Also cancel the old hosting, after taking a final backup.

**Rollback:** Settings → Pages → Source: *Deploy from a branch*, `main`, `/docs`. This works for as long as `docs/` exists.

## Notes

- The site uses root-relative URLs, so the `benjaminbradley.github.io/wegeekout.com/` preview address won't render correctly. Use the custom domain.
- `public/CNAME` is kept for reference. With Actions deploys, the custom domain comes from the repo settings.
- Pages has no server-side redirects. Old URLs are handled by small redirect pages that Astro generates (see `redirects` in `astro.config.mjs`).
