// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import drupal from './src/data/drupal.json' with { type: 'json' };

// Old URLs that now live elsewhere. GitHub Pages can't send real 301s, so
// Astro writes a small meta-refresh page at each old path.
const redirects = {
  ...drupal.redirects,
  '/category/uncategorized': '/blog/',
  '/author/geeks': '/blog/',
};
delete redirects['/blog']; // /blog/ is a real page now

export default defineConfig({
  site: 'https://wegeekout.com',
  trailingSlash: 'ignore',
  redirects,
  integrations: [sitemap()],
  // Keep the original straight quotes and dashes in old posts.
  markdown: {
    smartypants: false,
    // Code blocks follow the light/dark theme (see .astro-code rules in global.css).
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' } },
  },
  vite: { plugins: [tailwindcss()] },
});
