'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import type { Lang } from '@/lib/i18n';
import LogoMark from '../LogoMark';
/** Оригинальный логотип Romchi (logo.svg команды); «Rom» — цвета текста темы */
export function Logo({ lang, size = 24 }: { lang: Lang; size?: number }) {
  return (
    <Link href={`/${lang}/`} className="rc-logo" aria-label="Romchi">
      <LogoMark height={Math.round(size * 1.25)} />
    </Link>
  );
}

/** UZ / RU: та же страница и те же параметры в другом языке */
export function LangSwitch({ lang, label }: { lang: Lang; label: string }) {
  const path = usePathname() || `/${lang}/`;
  const [q, setQ] = useState('');
  useEffect(() => {
    const upd = () => setQ(window.location.search);
    upd();
    window.addEventListener('rc:url', upd);
    window.addEventListener('popstate', upd);
    return () => { window.removeEventListener('rc:url', upd); window.removeEventListener('popstate', upd); };
  }, []);
  const to = (l: Lang) => path.replace(/^\/(uz|ru)(?=\/|$)/, `/${l}`) + q;
  return (
    <nav className="rc-lang" aria-label={label}>
      {(['uz', 'ru'] as const).map((l) => (
        <Link key={l} href={to(l)} replace scroll={false} hrefLang={l} lang={l} aria-current={l === lang ? 'true' : undefined}>{l.toUpperCase()}</Link>
      ))}
    </nav>
  );
}

const sub = (cb: () => void) => {
  window.addEventListener('rc:theme', cb);
  return () => window.removeEventListener('rc:theme', cb);
};
/** медиазапрос (на сервере — false) */
export function useMedia(q: string) {
  return useSyncExternalStore(
    (cb) => { const m = window.matchMedia(q); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb); },
    () => window.matchMedia(q).matches,
    () => false,
  );
}

/** текущая тема сайта: data-theme на <html> (рамы окон в тёмной теме белые) */
export const useDark = () => useSyncExternalStore(sub, () => document.documentElement.dataset.theme === 'dark', () => false);

/** Переключатель светлая ↔ тёмная; выбор запоминается, по умолчанию — тема системы */
export function ThemeToggle({ label }: { label: string }) {
  const dark = useDark();
  const toggle = () => {
    const next = dark ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('rc-theme', next); } catch {}
    document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute('content', next === 'dark' ? '#0F1013' : '#F3F6FC');
    window.dispatchEvent(new Event('rc:theme'));
  };
  return (
    <button type="button" className="rc-theme" onClick={toggle} aria-label={label} aria-pressed={dark} title={label} data-track="theme_toggle">
      <svg className="sun" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
      <svg className="moon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" /></svg>
    </button>
  );
}

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const I = {
  arrow: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={2.4}><path d="M5 12h14M13 6l6 6-6 6" /></svg>,
  back: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={2.4}><path d="M15 5l-7 7 7 7" /></svg>,
  undo: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M9 14L4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>,
  cube: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></svg>,
  split: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M12 3v18" /></svg>,
  open: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 7l10 5-10 5" /></svg>,
  grid: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></svg>,
  check: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={3}><path d="M5 12l5 5 9-10" /></svg>,
  pin: (s = 22) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>,
  locate: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="2.5" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></svg>,
  search: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>,
  chev: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M6 9l6 6 6-6" /></svg>,
  phone: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></svg>,
  shield: (s = 16) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>,
  info: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
  play: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M7 4l13 8-13 8z" /></svg>,
  file: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M14 3H6v18h12V7z" /><path d="M14 3v4h4" /></svg>,
  share: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></svg>,
  apple: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.4 12.6c0-2.5 2-3.6 2.1-3.7-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.9 1.2 1.9 2.6 3.2 2.6 1.3-.1 1.8-.8 3.3-.8 1.6 0 2 .8 3.4.8 1.4 0 2.3-1.3 3.1-2.5 1-1.4 1.4-2.8 1.4-2.9-.1 0-2.9-1.1-2.9-4.3zM13.9 5.1c.7-.9 1.2-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" /></svg>,
  x: (s = 20) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M6 6l12 12M18 6L6 18" /></svg>,
  trash: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>,
};

export function Stepper({ value, onChange, min = 1, max = 99, labels }: { value: number; onChange: (n: number) => void; min?: number; max?: number; labels: { less: string; more: string; qty: string } }) {
  return (
    <div className="rc-step" role="group" aria-label={labels.qty}>
      <button type="button" aria-label={labels.less} disabled={value <= min} onClick={() => onChange(value - 1)}>−</button>
      <span className="rc-num" aria-live="polite">{value}</span>
      <button type="button" aria-label={labels.more} disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}

export function Balls({ items }: { items: { c: 'b' | 'y'; s: number; style: React.CSSProperties; f?: 1 | 2 | 3 }[] }) {
  return <>{items.map((b, i) => <div key={i} className={`rc-ball ${b.c} rc-f${b.f ?? 1}`} style={{ width: b.s, height: b.s, ...b.style }} aria-hidden="true" />)}</>;
}

export function Shell({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rc rc-grid ${className}`}>{children}</div>;
}
