'use client';
import { useState } from 'react';
import { TEMPLATES, newItem, shapeOf, type Cat, type TplId } from '@/lib/citizen/model';
import { track } from '@/lib/analytics';
import WindowDrawing from '../WindowDrawing';
import { useDark } from '../ui';
import type { StepProps } from '../Flow';

const CATS: (Cat | 'all')[] = ['all', 'deraza', 'eshik', 'balkon', 'boshqa'];

export default function Namunalar({ t, set, go }: StepProps) {
  const [cat, setCat] = useState<Cat | 'all'>('all');
  const dark = useDark();
  const list = TEMPLATES.filter((x) => cat === 'all' || x.cat === cat);
  const pick = (id: TplId) => {
    track('type_pick', { type: id, from: 'namunalar' });
    set((s) => ({ ...s, draft: newItem(id), editId: null }));
    go('olcham');
  };
  return (
    <div className="rc-wrap flex flex-col gap-4" style={{ paddingTop: 18, paddingBottom: 32, maxWidth: 1000 }}>
      <div className="flex flex-col gap-2">
        <h1 className="rc-disp" style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.2 }}>{t.nTitle}</h1>
        <p className="rc-hint" style={{ margin: 0, fontSize: 14 }}>{t.nSub}</p>
      </div>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="group" aria-label={t.cats.all} style={{ scrollbarWidth: 'none' }}>
        {CATS.map((c) => (
          <button key={c} type="button" className="rc-chip" aria-pressed={cat === c} onClick={() => setCat(c)}>{t.cats[c]}</button>
        ))}
      </div>
      <div className="rc-stag grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4" key={cat}>
        {list.map((x) => (
          <button key={x.id} type="button" className="rc-tile" onClick={() => pick(x.id)} style={{ minHeight: 168, padding: '14px 8px 12px' }} aria-label={`${t.tpl[x.id]}, ${x.W}×${x.H} ${t.cm}`}>
            <div className="flex flex-1 items-center justify-center" style={{ height: 110 }}>
              <WindowDrawing shape={shapeOf(x)} maxW={96} maxH={96} dark={dark} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{t.tpl[x.id]}</span>
            <span className="rc-num" style={{ fontSize: 12.5, color: 'var(--mute)', fontWeight: 600 }}>{x.W}×{x.H} {t.cm}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3" style={{ background: '#0B1530', color: '#fff', borderRadius: 20, padding: '18px 16px', marginTop: 8 }}>
        <b style={{ fontSize: 17 }}>{t.nOwnT}</b>
        <span style={{ fontSize: 14, color: '#C9D2E3', lineHeight: 1.45 }}>{t.nOwnS}</span>
        <button type="button" onClick={() => pick('d3')} className="rc-ghost inv">{t.nOwnBtn}</button>
      </div>
    </div>
  );
}
