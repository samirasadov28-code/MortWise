import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mortwise.netlify.app';

const LAST_UPDATED = '2026-05-28';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/calculator`,
      lastModified: LAST_UPDATED,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];
}
