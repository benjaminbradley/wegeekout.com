import { getCollection } from 'astro:content';
import drupal from '../data/drupal.json';

// Drafts are visible in `npm run dev` (for review) but never built for the live site.
const visible = (e: { data: { draft: boolean } }) => import.meta.env.DEV || !e.data.draft;

export async function getPosts() {
  const posts = await getCollection('blog', visible);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPages() {
  return getCollection('pages', visible);
}

const tagPaths: Record<string, string> = drupal.tags;

// Tag pages keep their old Drupal URLs (/category/tags/<name>/).
export function tagPath(tag: string) {
  return tagPaths[tag] ?? `/category/tags/${tag.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`;
}

export function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });
}
