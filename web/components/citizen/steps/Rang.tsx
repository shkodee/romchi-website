'use client';
import { useEffect, useState } from 'react';
import { BRANDS, COLORS, COLOR_NAMES } from '@/lib/citizen/model';
import { track } from '@/lib/analytics';
import WindowDrawing from '../WindowDrawing';
import { I, useDark } from '../ui';
import ItemTabs from '../ItemTabs';
import { itemCol } from '@/lib/citizen/store';
import type { StepProps } from '../Flow';

export default function Rang({ t, s, set, go }: StepProps) {
  const dark = useDark();
  const [open, setOpen] = useState(!!s.brand);
  const [selId, setSelId] = useState<string>('');
  const it = s.items.find((x) => x.id === selId) ?? s.items[0];
  const cur = it ? itemCol(it, s) : s.col;
  // каждому окну — свой цвет; у новых по умолчанию общий (или c01)
  useEffect(() => {
    if (!s.col || s.items.some((x) => !x.col)) set((st) => ({ ...st, col: st.col ?? 'c01', items: st.items.map((x) => (x.col ? x : { ...x, col: st.col ?? 'c01' })) }));
  }, [s.col, s.items, set]);
  if (!it) return null;
  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-[1100px] lg:flex-row lg:gap-8 lg:px-10 lg:py-8">
      <div className="flex flex-col items-center justify-center gap-4 lg:flex-1 lg:rounded-3xl" style={{ minHeight: 220, padding: '24px 16px 36px' }}>
        <div style={{ filter: 'drop-shadow(0 18px 22px rgba(11,21,48,.22))' }}>
          <WindowDrawing shape={it} maxW={260} maxH={180} color={cur} dark={dark} labels title={`${t.tpl[it.tpl]}, ${COLOR_NAMES[cur ?? 'oq']}`} />
          <div aria-hidden="true" style={{ height: 6, margin: '0 -10px', background: 'var(--line2)', borderRadius: 3 }} />
        </div>
        <ItemTabs t={t} s={s} sel={it.id} onSel={setSelId} dark={dark} />
      </div>
      <div className="rc-sheet flex flex-1 flex-col gap-5 lg:rounded-3xl" style={{ padding: '20px 18px 0' }}>
        <section className="flex flex-col gap-3" aria-labelledby="rang-h">
          <div className="flex items-baseline justify-between gap-3">
            <h1 id="rang-h" className="rc-disp" style={{ margin: 0, fontSize: 20 }}>{t.rang}</h1>
            <span style={{ fontWeight: 600, fontSize: 14.5, color: 'var(--ink2)', textAlign: 'right' }}>{COLOR_NAMES[cur ?? 'oq']}</span>
          </div>
          {it.qty > 1 && (
            <button type="button" className="rc-ghost" style={{ alignSelf: 'flex-start', minHeight: 44, padding: '0 16px' }}
              onClick={() => { set((st) => ({ ...st, items: st.items.flatMap((x) => (x.id !== it.id ? [x] : Array.from({ length: x.qty }, (_, k) => ({ ...x, qty: 1, col: cur, id: k === 0 ? x.id : Math.random().toString(36).slice(2, 9) })))) })); track('color_split', { n: it.qty }); }}>
              {t.rangSplit(it.qty)}
            </button>
          )}
          {s.items.length > 1 && s.items.some((x) => itemCol(x, s) !== cur) && (
            <button type="button" className="rc-link" style={{ alignSelf: 'flex-start', fontSize: 15, minHeight: 40 }} onClick={() => set((st) => ({ ...st, items: st.items.map((x) => ({ ...x, col: cur })) }))}>{t.rangAll}</button>
          )}
          <div className="grid gap-2.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(44px, 1fr))', justifyItems: 'center' }} role="group" aria-label={t.rang}>
            {COLORS.map((c) => (
              <button key={c.id} type="button" className="rc-swatch" aria-pressed={cur === c.id} aria-label={COLOR_NAMES[c.id]} title={COLOR_NAMES[c.id]}
                style={c.id === 'oq' ? { background: '#F4F6F9' } : { backgroundImage: `url(/colors/${c.id}.webp)`, backgroundColor: c.avg }}
                onClick={() => { set((st) => ({ ...st, col: c.id, items: st.items.map((x) => (x.id === it.id ? { ...x, col: c.id } : x)) })); track('color_pick', { color: c.id }); }} />
            ))}
          </div>
        </section>
        <section className="flex flex-col gap-3" aria-labelledby="lvl-h">
          <h2 id="lvl-h" className="rc-disp" style={{ margin: 0, fontSize: 20 }}>{t.rowProfile}</h2>
          <button type="button" className="rc-link flex items-center justify-between" aria-expanded={open} onClick={() => setOpen(!open)} style={{ fontSize: 16, fontWeight: 700, minHeight: 44 }}>
            {s.brand ? `${t.brand}: ${s.brand}` : t.brandMine}
            <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s var(--e-out)', display: 'flex' }}>{I.chev()}</span>
          </button>
          {open && (
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2">
                {BRANDS.map((b) => (
                  <button key={b} type="button" className="rc-chip" aria-pressed={s.brand === b} onClick={() => { set((st) => ({ ...st, brand: st.brand === b ? null : b })); track('brand_pick', { brand: b }); }}>{b}</button>
                ))}
              </div>
              <p className="rc-hint" style={{ margin: 0 }}>{t.brandNote}</p>
            </div>
          )}
        </section>
        <div className="rc-bottom" style={{ margin: '0 -18px', marginTop: 'auto' }}>
          <button type="button" className="rc-cta" onClick={() => go('narx')}>{t.seePrice} {I.arrow()}</button>
        </div>
      </div>
    </div>
  );
}
