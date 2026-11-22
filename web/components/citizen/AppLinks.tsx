'use client';
// Витрина функций приложения: сайт — быстрый расчёт, остальное — в приложении Romchi.
// Кнопка «Ilovada ochish»: приложение установлено — открывается оно; нет — сразу магазин устройства
// (iPhone → App Store, Android → Google Play). На компьютере показываем оба магазина.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { CDict } from '@/lib/citizen/i18n';
import { LINKS } from '@/lib/i18n';
import { I } from './ui';

type Os = 'ios' | 'android' | 'other';
const PKG = 'com.conamobile.romchi2';

function detect(): Os {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'other';
}

/** платформа посетителя (до проверки — 'other', чтобы на сервере и первом кадре совпало) */
export function useOs(): Os {
  const [os, setOs] = useState<Os>('other');
  useEffect(() => setOs(detect()), []);
  return os;
}

/** встроенные браузеры (Instagram, Telegram, Facebook, WebView): intent-ссылки там часто не работают */
const inAppBrowser = () => /Instagram|FBAN|FBAV|FB_IAB|Telegram|; wv\)/i.test(navigator.userAgent || '');

/**
 * Открыть приложение или магазин.
 * Android (Chrome): запуск приложения по имени пакета, если не установлено — Chrome сам откроет Google Play.
 * Встроенные браузеры и iPhone: страница магазина (там кнопка «Открыть», если приложение уже стоит).
 * Возвращает false на компьютере — там нужен выбор магазина.
 */
export function openApp(os: Os): boolean {
  if (os === 'android') {
    window.location.href = inAppBrowser()
      ? LINKS.googlePlay
      : `intent:#Intent;package=${PKG};S.browser_fallback_url=${encodeURIComponent(LINKS.googlePlay)};end`;
    return true;
  }
  if (os === 'ios') { window.location.href = LINKS.appStore; return true; }
  return false;
}

/** кнопки: на телефоне одна «Ilovada ochish» (сама решает: открыть или в магазин), на компьютере оба магазина */
export function StoreButtons({ t, from }: { t: CDict; from: string }) {
  const os = useOs();
  if (os === 'ios' || os === 'android') {
    return (
      <button type="button" className="rc-dark-btn" style={{ width: '100%', border: 0, cursor: 'pointer' }} data-track="download_click" data-store={os === 'ios' ? 'app_store' : 'google_play'} data-from={from} onClick={() => openApp(os)}>
        {os === 'ios' ? I.apple() : I.play()} {t.openApp}
      </button>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <a href={LINKS.appStore} className="rc-dark-btn" data-track="download_click" data-store="app_store" data-from={from}>{I.apple()} App Store</a>
      <a href={LINKS.googlePlay} className="rc-dark-btn" data-track="download_click" data-store="google_play" data-from={from}>{I.play()} Google Play</a>
    </div>
  );
}

/** окошко «Где скачать?» — только на компьютере */
export function StoreSheet({ t, from, onClose }: { t: CDict; from: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);
  return (
    <div className="rc-modal" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t.getApp} className="rc-sheet flex flex-col gap-4" style={{ padding: '18px 16px calc(20px + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3">
          <b className="rc-disp" style={{ fontSize: 19 }}>{t.getApp}</b>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="rc-ghost" style={{ minHeight: 40, width: 40, padding: 0 }}>{I.x()}</button>
        </div>
        <StoreButtons t={t} from={from} />
      </div>
    </div>
  );
}

function Card({ icon, title, text, inApp, onOpen, from }: { icon: ReactNode; title: string; text: string; inApp: string; onOpen: () => void; from: string }) {
  return (
    <button type="button" onClick={onOpen} className="rc-card flex flex-col gap-2.5 text-left" style={{ padding: 16, color: 'var(--ink)', border: 0, cursor: 'pointer', font: 'inherit' }} data-track="app_open" data-from={from}>
      <span className="flex w-full items-center justify-between">
        <span className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 14, background: 'var(--soft)', color: 'var(--blue)' }}>{icon}</span>
        <span className="rc-chip" style={{ pointerEvents: 'none', minHeight: 30, padding: '0 10px', fontSize: 12.5 }}>{inApp} ↗</span>
      </span>
      <b style={{ fontSize: 16.5, lineHeight: 1.25 }}>{title}</b>
      <span style={{ fontSize: 14, lineHeight: 1.45, color: 'var(--ink2)' }}>{text}</span>
    </button>
  );
}

/** блок на главной: 3 функции приложения + кнопки магазинов */
export function AppTeaser({ t }: { t: CDict }) {
  const os = useOs();
  const [from, setFrom] = useState<string | null>(null);
  const open = (f: string) => { if (!openApp(os)) setFrom(f); }; // телефон — сразу приложение или магазин, компьютер — выбор
  return (
    <section className="rc-wrap relative z-10 flex flex-col gap-4" style={{ paddingTop: 36 }} aria-labelledby="app-h">
      <div className="flex flex-col gap-1">
        <h2 id="app-h" className="rc-disp rc-h2" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)' }}>{t.appTitle}</h2>
        <p style={{ margin: 0, color: 'var(--ink2)', fontSize: 15.5 }}>{t.appSub}</p>
      </div>
      <div className="rc-stag grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card icon={I.cube(22)} title={t.arT} text={t.arD} inApp={t.inApp} onOpen={() => open('teaser_ar')} from="teaser_ar" />
        <Card icon={I.pin(22)} title={t.dealT} text={t.dealD} inApp={t.inApp} onOpen={() => open('teaser_dealers')} from="teaser_dealers" />
        <Card icon={I.file(22)} title={t.ordT} text={t.ordD} inApp={t.inApp} onOpen={() => open('teaser_orders')} from="teaser_orders" />
      </div>
      <div style={{ maxWidth: 480 }}><StoreButtons t={t} from="teaser" /></div>
      {from && <StoreSheet t={t} from={from} onClose={() => setFrom(null)} />}
    </section>
  );
}

/** компактная плашка в конструкторе: AR — только в приложении */
export function AppChip({ t }: { t: CDict }) {
  const os = useOs();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => { if (!openApp(os)) setOpen(true); }} className="rc-ghost" style={{ justifyContent: 'space-between', minHeight: 52, padding: '0 14px', textAlign: 'left', width: '100%' }} data-track="app_open" data-from="konstruktor_ar">
        <span className="flex items-center gap-2.5"><span style={{ color: 'var(--blue)', display: 'flex' }}>{I.cube(20)}</span><span style={{ fontSize: 14.5 }}>{t.arT}</span></span>
        <span className="rc-chip" style={{ pointerEvents: 'none', minHeight: 28, padding: '0 10px', fontSize: 12.5 }}>{t.inApp} ↗</span>
      </button>
      {open && <StoreSheet t={t} from="konstruktor_ar" onClose={() => setOpen(false)} />}
    </>
  );
}

/** Instagram и YouTube Romchi: круглые кнопки-иконки (44px), открываются в новой вкладке */
export function Socials({ t, from, onDark = false }: { t: CDict; from: string; onDark?: boolean }) {
  const style = {
    width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center',
    color: onDark ? '#fff' : 'var(--ink)', border: onDark ? '1.5px solid rgba(255,255,255,.28)' : '1.5px solid var(--line)',
    background: onDark ? 'transparent' : 'var(--card)',
  } as const;
  return (
    <div className="flex items-center gap-2.5" role="group" aria-label={t.social}>
      <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label={t.instaAria} title="Instagram" className="rc-social" style={style} data-track="social_click" data-network="instagram" data-from={from}>{I.instagram(22)}</a>
      <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label={t.ytAria} title="YouTube" className="rc-social" style={style} data-track="social_click" data-network="youtube" data-from={from}>{I.youtube(22)}</a>
    </div>
  );
}
