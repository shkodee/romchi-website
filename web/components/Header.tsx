'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Logo } from './ui';
import type { Dict, Lang } from '@/lib/i18n';

export default function Header({ t, lang }: { t: Dict['nav']; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const path = usePathname() || `/${lang}/`;
  const other: Lang = lang === 'uz' ? 'ru' : 'uz';
  const otherPath = path.replace(/^\/(uz|ru)(?=\/|$)/, `/${other}`);
  const home = `/${lang}/`;
  const onHome = path === home || path === `/${lang}`;
  const anchor = (id: string) => (onHome ? `#${id}` : `${home}#${id}`);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const links = [
    ['imk', t.features], ['sinab', t.try], ['kim', t.who], ['premium', t.premium], ['faq', t.faq],
  ] as const;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-brand-deep/10 bg-grid/85 backdrop-blur-md">
      <div className="wrap flex min-h-[68px] items-center justify-between gap-4 sm:min-h-[76px]">
        <Link href={home} aria-label={t.home} className="focus-ring rounded-lg no-underline"><Logo size={26} /></Link>
        <nav aria-label={t.menu} className="hidden gap-7 lg:flex">
          {links.map(([id, label]) => (
            <a key={id} href={id === 'sinab' ? `${home}sinab/` : anchor(id)} className="focus-ring rounded text-[15px] font-bold text-navy no-underline hover:text-brand-deep">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <Link href={otherPath} hrefLang={other} lang={other} aria-label={t.switchLang}
            className="focus-ring inline-flex min-h-[44px] items-center rounded-xl border border-line bg-white px-3.5 text-sm font-extrabold text-navy no-underline">
            <span className={lang === 'uz' ? 'text-brand' : ''}>UZ</span><span className="mx-1 text-muted">·</span><span className={lang === 'ru' ? 'text-brand' : ''}>RU</span>
          </Link>
          <a href={anchor('yukla')} data-track="download_click" data-store="header"
            className="focus-ring hidden min-h-[44px] items-center rounded-xl bg-brand px-[18px] text-[15px] font-extrabold text-white no-underline hover:brightness-110 sm:inline-flex">
            {t.download}
          </a>
          <button type="button" className="focus-ring inline-flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white lg:hidden"
            aria-expanded={open} aria-controls="mnav" aria-label={open ? t.close : t.open} onClick={() => setOpen((o) => !o)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <nav id="mnav" aria-label={t.menu} className="wrap flex flex-col gap-1 pb-5 lg:hidden">
          {links.map(([id, label]) => (
            <a key={id} href={id === 'sinab' ? `${home}sinab/` : anchor(id)} onClick={() => setOpen(false)}
              className="focus-ring rounded-2xl bg-white px-5 py-4 text-lg font-extrabold text-navy no-underline">{label}</a>
          ))}
          <a href={anchor('yukla')} onClick={() => setOpen(false)} className="btn btn-blue mt-2">{t.download}</a>
        </nav>
      )}
    </header>
  );
}
