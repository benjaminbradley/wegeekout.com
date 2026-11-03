// RSS feed at /rss.xml (the same address Drupal used for its feed).
import rss from '@astrojs/rss';
import { getPosts } from '../lib/content';

export async function GET(context) {
  const posts = (await getPosts()).filter((p) => !p.data.draft);
  return rss({
    title: 'We Geek Out!',
    description: 'Projects and writing by Benjamin Bradley.',
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.pubDate,
      description: p.data.description,
      link: p.data.path,
      categories: p.data.tags,
    })),
    customData: '<language>en-us</language>',
  });
}
