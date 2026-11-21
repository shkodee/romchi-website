import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Motion from '@/components/Motion';
import { Logo } from '@/components/ui';
import { getDict, type Lang } from '@/lib/i18n';

/** Оболочка старого сайта для мастеров (/ustalar/, /sinab/): шапка, подвал, Lenis + GSAP */
export default function MasterShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  const d = getDict(lang);
  return (
    <div className="font-sans">
      <Header t={d.nav} lang={lang} />
      <main id="main" className="overflow-x-clip">{children}</main>
      <footer className="bg-navy py-10 text-[#B8C2D6]">
        <div className="wrap flex flex-wrap items-center justify-between gap-6 text-sm">
          <Logo size={22} light star={false} />
          <span>{d.footer.slogan}</span>
          <a href={`/${lang}/`} className="focus-ring rounded font-bold text-white underline decoration-white/40 underline-offset-4">{lang === 'ru' ? 'Расчёт окна для покупателей' : 'Xaridorlar uchun deraza hisobi'}</a>
          <span>© 2026 Romchi · {d.footer.domain}</span>
        </div>
      </footer>
      <Motion />
    </div>
  );
}
