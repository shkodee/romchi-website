import type { MetadataRoute } from 'next';
import { LANGS, LINKS } from '@/lib/i18n';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.flatMap((l) => [
    { url: `${LINKS.site}/${l}/`, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${LINKS.site}/${l}/sinab/`, changeFrequency: 'monthly' as const, priority: 0.8 },
  ]);
}
