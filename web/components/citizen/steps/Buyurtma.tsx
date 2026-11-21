'use client';
import { area, fmt, fmtArea, priceOf, total } from '@/lib/citizen/model';
import WindowDrawing from '../WindowDrawing';
import { I, Stepper, useDark } from '../ui';
import type { StepProps } from '../Flow';

export default function Buyurtma({ t, s, set, go }: StepProps) {
  const dark = useDark();
  const n = s.items.reduce((a, x) => a + x.qty, 0);
  const m2 = s.items.reduce((a, x) => a + area(x) * x.qty, 0);
  const sum = total(s.items, { lvl: s.lvl });

  if (!s.items.length) {
    return (
      <div className="rc-wrap flex flex-1 flex-col items-center justify-center gap-4 text-center" style={{ maxWidth: 520, padding: 32 }}>
        <p style={{ fontSize: 17, margin: 0 }}>{t.empty}</p>
        <button type="button" className="rc-cta" onClick={() => go('turi')}>{t.emptyBtn}</button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="rc-wrap flex flex-1 flex-col gap-3" style={{ paddingTop: 18, paddingBottom: 20, maxWidth: 640 }}>
        <div className="flex items-baseline justify-between gap-3">
          <h1 className="rc-disp" style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 30px)' }}>{t.oTitle}</h1>
          <span className="rc-disp rc-num" style={{ fontSize: 16, color: 'var(--mute)' }}>{t.pcs(n)} · {fmtArea(m2)} m²</span>
        </div>
        <ul className="rc-stag m-0 flex list-none flex-col gap-3 p-0">
          {s.items.map((it) => (
            <li key={it.id} className="rc-card flex gap-3" style={{ padding: 12 }}>
              <button type="button" onClick={() => { set((st) => ({ ...st, draft: { ...it }, editId: it.id })); go('olcham'); }}
                className="flex flex-none items-center justify-center rc-grid" style={{ width: 92, height: 92, borderRadius: 12, border: 0, cursor: 'pointer' }} aria-label={`${t.edit}: ${t.tpl[it.tpl]}`}>
                <WindowDrawing shape={it} maxW={76} maxH={76} color={s.col} dark={dark} />
              </button>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <b style={{ fontSize: 16, display: 'block' }}>{t.tpl[it.tpl]}</b>
                    <span className="rc-num" style={{ fontSize: 14, color: 'var(--mute)' }}>{it.W}×{it.H} {t.cm}</span>
                  </div>
                  <button type="button" aria-label={`${t.remove}: ${t.tpl[it.tpl]}`} onClick={() => set((st) => ({ ...st, items: st.items.filter((x) => x.id !== it.id) }))}
                    style={{ background: 'none', border: 0, color: 'var(--mute)', cursor: 'pointer', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '-8px -6px 0 0' }}>{I.trash()}</button>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Stepper value={it.qty} onChange={(q) => set((st) => ({ ...st, items: st.items.map((x) => (x.id === it.id ? { ...x, qty: q } : x)) }))} labels={{ less: t.less, more: t.more, qty: t.qty }} />
                  <b className="rc-num" style={{ fontSize: 16 }}>{fmt(priceOf(it, { lvl: s.lvl }) * it.qty)}</b>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => go('turi')} className="flex items-center justify-center"
          style={{ minHeight: 52, borderRadius: 16, border: '2px dashed #7FB4FF', background: 'color-mix(in srgb, var(--card) 70%, transparent)', color: 'var(--link)', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
          + {t.addMore}
        </button>
      </div>
      <div className="rc-sheet rc-bottom" style={{ animation: 'none' }}>
        <div className="flex flex-col gap-3" style={{ maxWidth: 608, margin: '0 auto' }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--mute)' }}>{t.totalApprox}</div>
            <div className="rc-disp rc-num" style={{ fontSize: 26 }}>{fmt(sum)} <span style={{ fontSize: 15, fontFamily: 'Onest Variable' }}>{t.sum}</span></div>
          </div>
          <button type="button" className="rc-cta" onClick={() => go('rang')}>{t.toColor} {I.arrow()}</button>
        </div>
      </div>
    </div>
  );
}
