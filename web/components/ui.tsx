import type { ReactNode } from 'react';
import { LINKS, type Dict } from '@/lib/i18n';
import LogoMark from './LogoMark';

// Скриншоты: сейчас подписанные заглушки .svg. Положите реальные картинки
// в public/screens/<имя>.jpg и поменяйте SCREEN_EXT на 'jpg' (или пропишите расширение по ключу).
export const SCREEN_EXT: string = 'svg';
export type ScreenKey =
  | 'hero-konstruktor' | 'hero-ochilish' | 'romchi-3d' | 'buyurtma-karta' | 'fason-turlari' | 'fasonlar-royxat'
  | 'kesish-xaritasi' | 'hisob-foyda' | 'ar-xona' | 'bosh-ekran'
  | 'ekran-fasonlar' | 'ekran-konstruktor' | 'ekran-buyurtma' | 'ekran-omborxona';
export const screen = (k: ScreenKey) => `/screens/${k}.${SCREEN_EXT}`;

export function Shot({ k, alt, className = '', eager = false }: { k: ScreenKey; alt: string; className?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={screen(k)} alt={alt} className={className} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
}

/** Оригинальный логотип Romchi (logo.svg команды): «Rom» тёмно-синее или белое (light) */
export function Logo({ size = 28, light = false }: { size?: number; light?: boolean; star?: boolean }) {
  return (
    <span className={light ? "text-white" : "text-navy"} style={{ display: "inline-flex" }}>
      <LogoMark height={Math.round(size * 1.25)} />
    </span>
  );
}

export const Pill = ({ children, tone = 'l' }: { children: ReactNode; tone?: 'l' | 'b' | 'y' | 'g' | 'd' }) => {
  const c = {
    l: 'bg-brand-soft text-brand-deep',
    b: 'bg-white/15 text-white',
    y: 'bg-sun-soft text-sun-ink',
    g: 'bg-[#CDF1DC] text-[#0A6B36]',
    d: 'bg-white/10 text-white',
  }[tone];
  return <div><span className={`pill ${c}`}>{children}</span></div>;
};

const ico = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
export const IconPhone = () => (<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...ico}><rect x="6" y="2" width="12" height="20" rx="3" /><path d="M11 18h2" /></svg>);
export const IconPlay = () => (<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...ico}><path d="M5 3l14 9-14 9z" /></svg>);
export const IconBolt = ({ s = 16 }: { s?: number }) => (<svg width={s} height={s} viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={2.4}><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>);
export const IconHome = () => (<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={2.2}><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-6h6v6" /></svg>);
export const IconPin = () => (<svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={2.2}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>);
export const IconSend = () => (<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" {...ico} strokeWidth={2.2}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4z" /></svg>);

export function StoreButtons({ t }: { t: Dict['hero'] }) {
  const cls = 'focus-ring inline-flex min-h-[58px] items-center gap-3 rounded-2xl bg-navy px-[22px] text-white no-underline transition hover:bg-navy-2';
  return (
    <div className="flex flex-wrap gap-3">
      <a className={cls} href={LINKS.appStore} data-track="download_click" data-store="app_store">
        <IconPhone />
        <span><small className="block text-[11px] font-semibold text-[#B8C2D6]">{t.storeSmall}</small><b className="block text-[17px] font-extrabold">App Store</b></span>
      </a>
      <a className={cls} href={LINKS.googlePlay} data-track="download_click" data-store="google_play">
        <IconPlay />
        <span><small className="block text-[11px] font-semibold text-[#B8C2D6]">{t.storeSmall}</small><b className="block text-[17px] font-extrabold">Google Play</b></span>
      </a>
    </div>
  );
}

/** Статичная иллюстрация окна — fallback для 3D (reduced-motion / нет WebGL) */
export function WindowArt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} aria-hidden="true">
      <rect x="20" y="20" width="260" height="260" rx="4" fill="#3A4250" />
      <rect x="34" y="34" width="72" height="232" fill="#4DD0FF" />
      <rect x="114" y="34" width="72" height="232" fill="#4DD0FF" />
      <rect x="194" y="34" width="72" height="232" fill="#4DD0FF" />
      <polyline points="34,34 106,150 34,266" fill="none" stroke="#0A4FD0" strokeWidth="1.5" strokeDasharray="5 4" />
      <polyline points="266,34 194,150 266,266" fill="none" stroke="#0A4FD0" strokeWidth="1.5" strokeDasharray="5 4" />
      <polyline points="194,266 230,34 266,266" fill="none" stroke="#0A4FD0" strokeWidth="1.5" strokeDasharray="5 4" />
    </svg>
  );
}
