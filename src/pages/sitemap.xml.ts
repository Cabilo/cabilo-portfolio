import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getLocaleFromId, getLocalizedId, getLocalizedPath } from '../lib/i18n';

const site = 'https://cabilo.vercel.app';

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;');

export const GET: APIRoute = async () => {
  const [projects, learning, tags, software] = await Promise.all([
    getCollection('projects'),
    getCollection('learning'),
    getCollection('tags'),
    getCollection('software'),
  ]);

  const paths = new Set<string>(['/', '/about', '/contact', '/tutorials', '/breakdowns']);

  for (const project of projects) {
    paths.add(getLocalizedPath(getLocaleFromId(project.id), `projects/${getLocalizedId(project.id)}`));
  }

  for (const doc of learning) {
    paths.add(getLocalizedPath(getLocaleFromId(doc.id), `${doc.data.type.toLowerCase()}s/${getLocalizedId(doc.id)}`));
  }

  for (const entry of [...tags, ...software]) {
    paths.add(`/tags/${entry.id}`);
    paths.add(`/pt-br/tags/${entry.id}`);
  }

  const urls = [...paths].map((path) => {
    const englishPath = path.startsWith('/pt-br') ? path.replace(/^\/pt-br/, '') || '/' : path;
    const portuguesePath = englishPath === '/' ? '/pt-br/' : `/pt-br${englishPath}`;

    return `  <url>
    <loc>${escapeXml(new URL(path, site).href)}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(new URL(englishPath, site).href)}" />
    <xhtml:link rel="alternate" hreflang="pt-BR" href="${escapeXml(new URL(portuguesePath, site).href)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(new URL(englishPath, site).href)}" />
  </url>`;
  }).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
