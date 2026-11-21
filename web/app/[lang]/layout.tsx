import '../globals.css';
import '../citizen.css';
import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/manrope'; // сайт для мастеров
import '@fontsource-variable/onest'; // сайт для граждан: текст
import '@fontsource/unbounded/700.css'; // сайт для граждан: заголовки и цифры
import { notFound } from 'next/navigation';
import Tracker from '@/components/Tracker';
import { LANGS, LINKS, isLang } from '@/lib/i18n';
import { cdict } from '@/lib/citizen/i18n';

// Meta Pixel ID — в .env (NEXT_PUBLIC_META_PIXEL_ID). Пусто — пиксель не грузится.
const PIXEL = (process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '').replace(/\D/g, '');

export const dynamicParams = false;
export const generateStaticParams = () => LANGS.map((lang) => ({ lang }));

export const viewport: Viewport = {
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#0F1013' }, { color: '#F3F6FC' }],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = cdict(lang);
  return {
    metadataBase: new URL(LINKS.site),
    title: t.meta.title,
    description: t.meta.desc,
    alternates: { canonical: `/${lang}/`, languages: { uz: '/uz/', ru: '/ru/', 'x-default': '/uz/' } },
    openGraph: { type: 'website', siteName: 'Romchi', title: t.meta.title, description: t.meta.desc, locale: lang === 'ru' ? 'ru_RU' : 'uz_UZ', url: `/${lang}/` },
    icons: { icon: '/favicon.svg' },
  };
}

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = cdict(lang);
  return (
    <html lang={lang}>
      <head>
        {/* reveal-анимации сайта мастеров включаются только с JS; если GSAP не загрузился за 3 с — показываем всё */}
        {PIXEL && (
          <script dangerouslySetInnerHTML={{ __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${PIXEL}');fbq('track','PageView');` }} />
        )}
        <script dangerouslySetInnerHTML={{ __html: `document.documentElement.classList.add('js');setTimeout(function(){if(!window.__motion)document.documentElement.classList.remove('js')},3000)` }} />
      </head>
      <body className="overflow-x-clip antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-sun focus:px-4 focus:py-3 focus:font-extrabold">{t.skip}</a>
        {children}
        <Tracker />
      </body>
    </html>
  );
}
