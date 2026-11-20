import '../globals.css';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope'; // Manrope локально: latin, latin-ext (oʻ, gʻ), cyrillic
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Motion from '@/components/Motion';
import Tracker from '@/components/Tracker';
import { Logo } from '@/components/ui';
import { LANGS, LINKS, getDict, isLang } from '@/lib/i18n';

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export const viewport: Viewport = { themeColor: '#0077FF', width: 'device-width', initialScale: 1 };

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = getDict(lang);
  return {
    metadataBase: new URL(LINKS.site),
    title: d.meta.title,
    description: d.meta.description,
    alternates: { canonical: `/${lang}/`, languages: { uz: '/uz/', ru: '/ru/', 'x-default': '/uz/' } },
    openGraph: { type: 'website', siteName: 'Romchi', title: d.meta.title, description: d.meta.description, locale: lang === 'ru' ? 'ru_RU' : 'uz_UZ', url: `/${lang}/` },
    icons: { icon: '/favicon.svg' },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Romchi',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Android, iOS',
    inLanguage: lang,
    description: d.meta.description,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'UZS' },
  };
  return (
    <html lang={lang}>
      <head>
        {/* reveal-анимации включаются только с JS; если GSAP не загрузился за 3 с — показываем всё */}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__motion)document.documentElement.classList.remove('js')},3000)` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      </head>
      <body className="overflow-x-clip font-sans antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-sun focus:px-4 focus:py-3 focus:font-extrabold">
          {lang === 'ru' ? 'К содержанию' : 'Asosiy qismga oʻtish'}
        </a>
        <Header t={d.nav} lang={lang} />
        <main id="main" className="overflow-x-clip">{children}</main>
        <footer className="bg-navy py-10 text-[#B8C2D6]">
          <div className="wrap flex flex-wrap items-center justify-between gap-6 text-sm">
            <Logo size={22} light star={false} />
            <span>{d.footer.slogan}</span>
            <a href={`/${lang}/ustalar/`} className="focus-ring rounded font-bold text-white underline decoration-white/40 underline-offset-4">{d.wiz.forMasters}</a>
            <span>© 2026 Romchi · {d.footer.domain}</span>
          </div>
        </footer>
        <Motion />
        <Tracker />
      </body>
    </html>
  );
}
