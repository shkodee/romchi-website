'use client';
import { useMemo } from 'react';
import { REGIONS } from '@/lib/masters';
import { fmt, total } from '@/lib/citizen/model';
import { colorSummary, itemCol } from '@/lib/citizen/store';
import { LINKS } from '@/lib/i18n';
import WindowDrawing from '../WindowDrawing';
import { I, LangSwitch, Logo, useDark } from '../ui';
import type { StepProps } from '../Flow';

export default function Tayyor({ t, lang, s, set, go }: StepProps) {
  const dark = useDark();
  const it = s.items[0];
  const region = REGIONS.find((r) => r.id === s.region);
  const district = region?.d.find((d) => d.id === s.district);
  const name = (x?: { uz: string; ru: string }) => (x ? (lang === 'ru' ? x.ru : x.uz) : '—');
  const conf = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    left: `${(i * 37) % 100}%`, w: 6 + ((i * 7) % 6), h: 10 + ((i * 5) % 8), c: ['#FFC529', '#0077FF', '#80D4EC', '#1F9D5B'][i % 4], d: `${(i % 7) * 0.18}s`, t: `${2.2 + (i % 5) * 0.35}s`,
  })), []);
  if (!it || !s.sent) return null;
  const dt = new Date(s.sent.date);
  const date = `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
  const rows: [string, string][] = [
    [t.rowType, s.items.length > 1 ? t.pcs(s.items.reduce((a, x) => a + x.qty, 0)) : t.tpl[it.tpl]],
    ...(s.items.length === 1 ? [[t.rowSize, `${it.W} × ${it.H} ${t.cm}`] as [string, string]] : []),
    [t.rowColor, colorSummary(s, t.colorsN)],
    [t.rowDistrict, name(district).replace(/ tumani$| район$/, '')],
    [t.rowMasters, t.pcs(s.sent.masters)],
  ];
  const restart = () => {
    set((st) => ({ ...st, items: [], draft: null, editId: null, masters: [], sent: null }));
    go('turi');
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {conf.map((c, i) => <span key={i} className="rc-conf" style={{ left: c.left, width: c.w, height: c.h, background: c.c, ['--d' as string]: c.d, ['--t' as string]: c.t }} />)}
      </div>
      <div className="rc-wrap flex items-center justify-between" style={{ paddingTop: 14, maxWidth: 560 }}>
        <Logo lang={lang} />
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1" style={{ color: 'var(--success)', fontWeight: 700, fontSize: 14 }}>{I.check(16)} {t.sent}</span>
          <LangSwitch lang={lang} label={t.lang} />
        </span>
      </div>
      <div className="rc-wrap flex flex-1 flex-col gap-5" style={{ maxWidth: 560, paddingTop: 22, paddingBottom: 28 }}>
        {/* «принтер» и чек-макет */}
        <div className="relative">
          <div aria-hidden="true" style={{ height: 14, borderRadius: 8, background: '#0B1530', margin: '0 2px', position: 'relative', zIndex: 2 }} />
          <div className="rc-print rc-card relative" style={{ margin: '-6px 14px 0', padding: '20px 18px 16px', borderRadius: '0 0 16px 16px' }}>
            <div className="flex items-center justify-between">
              <b style={{ fontSize: 15, letterSpacing: '.04em' }}>{t.maket}</b>
              <span className="rc-num" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--mute)' }}>{date}</span>
            </div>
            <div className="rc-grid flex items-center justify-center" style={{ height: 150, margin: '12px 0', borderRadius: 8 }}>
              <WindowDrawing shape={it} maxW={180} maxH={124} color={itemCol(it, s)} dark={dark} labels />
            </div>
            <dl className="m-0">
              {rows.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3" style={{ padding: '6px 0', borderBottom: '1px dashed var(--line2)', fontSize: 14 }}>
                  <dt style={{ color: 'var(--ink2)' }}>{k}</dt><dd className="m-0" style={{ fontWeight: 700, textAlign: 'right' }}>{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3" style={{ paddingTop: 10 }}>
                <dt style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink2)' }}>{t.approx.charAt(0) + t.approx.slice(1).toLowerCase()}</dt>
                <dd className="rc-disp rc-num m-0" style={{ fontSize: 18, whiteSpace: 'nowrap' }}>≈ {fmt(total(s.items, { lvl: s.lvl }))} {t.sum}</dd>
              </div>
            </dl>
            <div aria-hidden="true" className="rc-stamp absolute" style={{ right: 18, top: 70, border: '3px solid #1F9D5B', color: '#1F9D5B', borderRadius: 10, padding: '4px 10px', fontWeight: 800, fontSize: 18, letterSpacing: '.08em', background: 'rgba(255,255,255,.6)' }}>{t.stamp}</div>
          </div>
        </div>

        <div className="rc-stag flex flex-col gap-2">
          {Array.from({ length: Math.min(3, s.sent.masters) }, (_, i) => (
            <div key={i} className="rc-card flex items-center justify-between gap-3" style={{ padding: '10px 14px' }}>
              <span className="flex items-center gap-2"><b style={{ fontSize: 15 }}>{lang === 'ru' ? 'Мастер-образец' : 'Namuna usta'} {i + 1}</b>{s.sent!.demo && <span className="rc-demo">{t.demoTag}</span>}</span>
              <span style={{ fontSize: 13.5, color: 'var(--mute)' }}>{t.writing}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="rc-disp" style={{ margin: 0, fontSize: 26 }}>{t.doneT}</h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5, color: 'var(--ink2)' }}>{t.doneS}</p>
          {s.sent.demo && <p className="rc-note" style={{ margin: '4px 0 0' }}>{t.doneDemo}</p>}
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <a href={LINKS.appStore} className="rc-dark-btn" data-track="download_click" data-store="app_store" data-from="tayyor">{I.apple()} App Store</a>
          <a href={LINKS.googlePlay} className="rc-dark-btn" data-track="download_click" data-store="google_play" data-from="tayyor">{I.play()} Google Play</a>
        </div>
        <button type="button" className="rc-link" onClick={restart} style={{ alignSelf: 'center', fontSize: 16, minHeight: 44 }}>{t.restart}</button>
      </div>
    </div>
  );
}
