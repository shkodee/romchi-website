'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Lang } from '@/lib/i18n';
import { cdict, type CDict } from '@/lib/citizen/i18n';
import { BRANDS, MAIN_TYPES, fmt, shapeOf, tpl, type TplId } from '@/lib/citizen/model';
import { captureUtm, track } from '@/lib/analytics';
import WindowDrawing from './WindowDrawing';
import HeroWindow from './HeroWindow';
import { AppTeaser } from './AppLinks';
import { Balls, LangSwitch, Logo, ThemeToggle, useDark, useMedia } from './ui';

const HERO_H = 140;
const heroPrice = (W: number) => Math.round((((W * HERO_H) / 10000) * 2140000) / 50000) * 50000;
/** размеры плиток на главной (px), как в макете */
const TILE_PX: Record<string, [number, number]> = { d1: [42, 76], d2: [78, 82], d3: [96, 88], bb: [92, 92], es: [44, 96], ar: [72, 92] };

export default function Main({ lang }: { lang: Lang }) {
  const t = cdict(lang);
  const [W, setW] = useState(130);
  const dark = useDark();
  const isDesk = useMedia('(min-width: 1024px)'); // 3D рисуем только в видимой версии hero
  const price = fmt(heroPrice(W));
  const base = `/${lang}/maket/`;
  useEffect(() => { captureUtm(); track('ViewContent', { page: 'main' }); }, []);

  const scene = (big: boolean) => {
    const h = big ? 250 : 170;
    const w = Math.round(W * (big ? 1.7 : 1.15));
    return (
      <div className="relative flex items-center justify-center" style={{ height: big ? 520 : 300 }}>
        <Balls items={big
          ? [{ c: 'b', s: 96, style: { left: '2%', top: '6%' }, f: 2 }, { c: 'y', s: 44, style: { left: '4%', top: '58%' } }, { c: 'b', s: 18, style: { right: '36%', top: '0%' }, f: 3 }, { c: 'y', s: 24, style: { right: '24%', bottom: '8%' }, f: 2 }]
          : [{ c: 'b', s: 56, style: { left: '5%', top: '8%' }, f: 2 }, { c: 'y', s: 30, style: { left: '7%', top: '58%' } }, { c: 'b', s: 18, style: { right: '40%', top: '3%' }, f: 3 }, { c: 'y', s: 16, style: { right: '22%', bottom: '4%' }, f: 2 }]} />
        <HeroWindow W={W} H={HERO_H} w={w} h={h} dark={dark} live={big === isDesk}
          fallback={<WindowDrawing shape={{ ...shapeOf(tpl('d2')), W, H: HERO_H }} w={w} h={h} dark={dark} labels swing title={`${t.tpl.d2}, ${W} × ${HERO_H} ${t.cm}`} />} />
        <div className="rc-fcard rc-pop rc-price rc-shine" style={{ ['--r' as string]: '-6deg', ['--d' as string]: '1.1s', right: '3%', top: big ? '8%' : '1%' }}>
          <div style={{ fontSize: big ? 13 : 11.5, fontWeight: 700, letterSpacing: '.06em', color: '#5A3D00' }}>{t.approx}</div>
          <div className="rc-disp rc-num" style={{ fontSize: big ? 30 : 21, lineHeight: 1.15 }} aria-live="polite">{price} <span style={{ fontSize: big ? 15 : 12 }}>{t.sum}</span></div>
        </div>
        <div className="rc-fcard rc-pop alt flex items-center gap-2" style={{ ['--r' as string]: '5deg', ['--d' as string]: '1.3s', right: '3%', bottom: '10%' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: '#0077FF' }} />
          <span className="rc-disp rc-num" style={{ fontSize: big ? 20 : 17 }}>{W} × {HERO_H} {t.cm}</span>
        </div>
        <div className="rc-fcard rc-pop flex items-center gap-2" style={{ ['--r' as string]: '-4deg', ['--d' as string]: '1.5s', left: '3%', bottom: '6%', padding: '8px 12px 8px 8px' }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundImage: 'url(/colors/c01.webp)', backgroundSize: '120px auto', boxShadow: 'inset 0 0 0 2px #fff,0 0 0 1px #D6DCE6' }} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>{t.colors18}</span>
        </div>
      </div>
    );
  };

  const slider = (
    <label className="rc-card flex flex-col gap-1.5" style={{ padding: '12px 16px 10px', borderRadius: 18 }}>
      <span className="flex items-baseline justify-between gap-3">
        <span style={{ fontWeight: 700, fontSize: 15 }}>{t.slider}</span>
        <span className="rc-disp rc-num" style={{ fontSize: 16, color: 'var(--link)' }}>{W} {t.cm}</span>
      </span>
      <input type="range" min={60} max={200} step={5} value={W} aria-label={t.sliderAria}
        onChange={(e) => setW(Number(e.target.value))}
        onPointerUp={() => track('hero_slider', { w: W })}
        style={{ width: '100%', height: 36, accentColor: '#0077FF', margin: 0, cursor: 'pointer' }} />
    </label>
  );

  const h1 = (
    <h1 className="rc-disp" style={{ margin: 0, lineHeight: 1.16, textWrap: 'balance', fontSize: 'clamp(30px, 4vw, 58px)' }}>
      {t.h1a}{' '}
      <span style={{ display: 'inline-block', background: '#FFC529', color: '#0B1531', padding: '0 .26em', borderRadius: '.26em', transform: 'rotate(-2deg)' }}>{t.h1b}</span>
      {t.h1c ? ` ${t.h1c}` : ''}
    </h1>
  );

  return (
    <div className="rc rc-grid rc-grid-anim" style={{ overflowX: 'clip' }}>
      <header className="rc-wrap relative z-10 flex items-center justify-between" style={{ paddingTop: 14, paddingBottom: 4 }}>
        <Logo lang={lang} />
        <div className="flex items-center gap-4">
          <Link href={`/${lang}/ustalar/`} className="hidden md:inline" style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 15 }}>{t.forMastersShort}</Link>
          <LangSwitch lang={lang} label={t.lang} />
          <ThemeToggle label={t.theme} />
        </div>
      </header>

      <main id="main">
        {/* мобильный hero */}
        <section className="lg:hidden">
          <div className="rc-wrap relative z-10" style={{ paddingTop: 12 }}>{h1}</div>
          {scene(false)}
          <div className="rc-wrap relative z-10">{slider}</div>
        </section>
        {/* desktop hero */}
        <section className="rc-wrap hidden items-center gap-10 lg:grid" style={{ gridTemplateColumns: '1.15fr 1fr', paddingTop: 40 }}>
          <div className="flex flex-col gap-6">
            {h1}
            <p style={{ margin: 0, fontSize: 18, lineHeight: 1.55, color: 'var(--ink2)', maxWidth: 480 }}>{t.heroSub}</p>
            <div style={{ maxWidth: 480 }}>{slider}</div>
          </div>
          {scene(true)}
        </section>

        <section className="rc-wrap relative z-10 flex flex-col gap-3.5" style={{ paddingTop: 30 }} aria-labelledby="which">
          <h2 id="which" className="rc-disp rc-h2" style={{ fontSize: 'clamp(22px, 2.4vw, 30px)' }}>{t.which}</h2>
          <Link href={`${base}?q=turi`} style={{ fontWeight: 700, fontSize: 15, alignSelf: 'flex-start' }}>{t.allSamples} →</Link>
          <div className="rc-stag grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {MAIN_TYPES.map((id: TplId) => {
              const [pw, ph] = TILE_PX[id];
              return (
                <Link key={id} href={`${base}?q=olcham&t=${id}`} className="rc-tile" style={{ minHeight: 150 }} aria-label={`${t.tpl[id]} — ${t.pick}`} data-track="type_pick" data-type={id}>
                  <div className="flex flex-1 items-center" style={{ filter: id === 'ar' ? 'drop-shadow(0 18px 20px rgba(11,21,48,.3))' : undefined }}>
                    <WindowDrawing shape={shapeOf(tpl(id))} w={pw} h={ph} dark={dark} />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{t.tpl[id]}</span>
                </Link>
              );
            })}
          </div>
          <p className="rc-hint" style={{ textAlign: 'center', fontWeight: 600, margin: '6px 0 0' }}>{t.trust}</p>
        </section>

        <AppTeaser t={t} />

        <div style={{ marginTop: 40 }} aria-hidden="true">
          <div className="rc-marq-band">
            <div className="rc-marq">
              {[...BRANDS, ...BRANDS].map((b, i) => <span key={i} className="rc-disp">{b}<i /></span>)}
            </div>
          </div>
        </div>

        <section className="rc-wrap relative" style={{ height: 230, marginTop: 24 }} aria-label="Romchi">
          <Balls items={[{ c: 'b', s: 26, style: { right: '12%', top: '4%' }, f: 2 }, { c: 'y', s: 40, style: { left: '42%', top: '42%' } }]} />
          <div className="rc-fcard" style={{ ['--r' as string]: '-4deg', left: 'max(16px, 8%)', top: 12, padding: '16px 20px' }}>
            <div className="rc-disp rc-num" style={{ fontSize: 30, color: 'var(--blue)' }}>500 000+</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)', maxWidth: 180 }}>{t.stat1}</div>
          </div>
          <div className="rc-fcard" style={{ ['--r' as string]: '5deg', right: 'max(16px, 8%)', top: 110, padding: '16px 20px' }}>
            <div className="rc-disp rc-num" style={{ fontSize: 30 }}>10 000+</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)' }}>{t.stat2}</div>
          </div>
        </section>
      </main>

      <footer style={{ background: '#0B1530', color: '#fff', marginTop: 12 }}>
        <div className="rc-wrap flex flex-col items-center gap-2 md:flex-row md:justify-between" style={{ paddingTop: 22, paddingBottom: 22 }}>
          <Link href={`/${lang}/ustalar/`} style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{t.forMasters} ›</Link>
          <span style={{ color: '#A9B4C8', fontSize: 13 }}>© 2026 Romchi · {t.slogan}</span>
        </div>
      </footer>
    </div>
  );
}
