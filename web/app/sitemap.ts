import type { MetadataRoute } from 'next';
import { LANGS, LINKS } from '@/lib/i18n';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return LANGS.flatMap((l) => [
    { url: `${LINKS.site}/${l}/`, changeFrequency: 'weekly' as const, priority: 1 },
    { url: `${LINKS.site}/${l}/maket/`, changeFrequency: 'monthly' as const, priority: 0.9 },
    { url: `${LINKS.site}/${l}/ustalar/`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${LINKS.site}/${l}/sinab/`, changeFrequency: 'monthly' as const, priority: 0.4 },
  ]);
}
