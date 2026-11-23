'use client';
import { useEffect, useRef, useState } from 'react';
import {
  LIMITS, LOWER_MIN, OPENS, QUICK, SLIDES, UZORS, archMax, archRise, area, colUzor, colWidths, equalize, fmt, fmtArea, isOpenable, newItem, priceOf,
  setColW, setCount, setH, setLower, setW, tpl, type Item, type Lower, type Open, type Uzor,
} from '@/lib/citizen/model';
import { itemCol } from '@/lib/citizen/store';
import { track } from '@/lib/analytics';
import WindowDrawing, { fit, geometry } from '../WindowDrawing';
import View3D from '../View3D';
import { AppChip } from '../AppLinks';
import { I, Stepper, useDark, useMedia } from '../ui';
import type { StepProps } from '../Flow';

type Tab = 'bolish' | 'ochilish' | 'uzor';
type Edit = { k: 'W' | 'H' } | { k: 'col'; i: number } | null;

/** маленькие иконки типов открывания (как в приложении) */
export function OpenIcon({ o, s = 30 }: { o: Open; s?: number }) {
  const p = 5, a = s - p;
  const m = s / 2;
  const d: Record<string, string> = {
    turnL: `M${p} ${p} L${a} ${m} L${p} ${a}`, turnR: `M${a} ${p} L${p} ${m} L${a} ${a}`, tilt: `M${p} ${a} L${m} ${p} L${a} ${a}`,
    ttL: `M${p} ${p} L${a} ${m} L${p} ${a} M${p} ${a} L${m} ${p} L${a} ${a}`, ttR: `M${a} ${p} L${p} ${m} L${a} ${a} M${p} ${a} L${m} ${p} L${a} ${a}`, fix: '',
    // surma: стрелки
    slideL: `M${a - 2} ${m} H${p + 2} M${p + 7} ${m - 5} L${p + 2} ${m} L${p + 7} ${m + 5}`,
    slideR: `M${p + 2} ${m} H${a - 2} M${a - 7} ${m - 5} L${a - 2} ${m} L${a - 7} ${m + 5}`,
    slideLR: `M${p + 2} ${m} H${a - 2} M${p + 7} ${m - 5} L${p + 2} ${m} L${p + 7} ${m + 5} M${a - 7} ${m - 5} L${a - 2} ${m} L${a - 7} ${m + 5}`,
  };
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <rect x="2" y="2" width={s - 4} height={s - 4} rx="3" />
      {d[o] && <path d={d[o]} strokeWidth="1.8" />}
    </svg>
  );
}
function SplitIcon({ n, s = 30 }: { n: number; s?: number }) {
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width={s - 4} height={s - 4} rx="3" />
      {Array.from({ length: n - 1 }, (_, k) => { const x = 2 + ((s - 4) * (k + 1)) / n; return <path key={k} d={`M${x} 2 V${s - 2}`} />; })}
    </svg>
  );
}
function LowerIcon({ k, s = 20 }: { k: 'none' | Lower; s?: number }) {
  const y = s * 0.62;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginRight: 6, flex: 'none' }}>
      <rect x="2" y="1.5" width={s - 4} height={s - 3} rx="2" />
      {k !== 'none' && <path d={`M2 ${y} H${s - 2}`} />}
      {k === 'panel' && <rect x="4" y={y + 2} width={s - 8} height={s - y - 5.5} fill="currentColor" opacity=".35" stroke="none" />}
    </svg>
  );
}
function UzorIcon({ u, s = 30 }: { u: Uzor; s?: number }) {
  const a = 2 + (s - 4) / 3, b = 2 + (2 * (s - 4)) / 3;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="2" width={s - 4} height={s - 4} rx="3" />
      {(u === 'v' || u === 'grid') && <path d={`M${a} 2 V${s - 2} M${b} 2 V${s - 2}`} />}
      {(u === 'h' || u === 'grid') && <path d={`M2 ${a} H${s - 2} M2 ${b} H${s - 2}`} />}
      {u === 'cross' && <path d={`M${s / 2} 2 V${s - 2} M2 ${s / 2} H${s - 2}`} />}
    </svg>
  );
}

function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function NumField({ label, value, onCommit, step = 5, min, max, unit }: { label: string; value: number; onCommit: (n: number) => void; step?: number; min: number; max: number; unit: string }) {
  const [txt, setTxt] = useState(String(value));
  useEffect(() => setTxt(String(value)), [value]);
  const commit = () => { const n = Number(txt.replace(/\D/g, '')); if (n > 0) onCommit(n); else setTxt(String(value)); };
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="rc-lbl">{label}</span>
      <span className="rc-field" style={{ padding: '0 4px', gap: 2 }}>
        <button type="button" className="rc-opt" style={{ width: 40, height: 40, border: 0, fontSize: 22, flex: 'none' }} aria-label={`${label} −${step}`} disabled={value <= min} onClick={() => onCommit(value - step)}>−</button>
        <input inputMode="numeric" pattern="[0-9]*" size={3} value={txt} aria-label={`${label}, ${unit}`} className="rc-disp rc-num" style={{ textAlign: 'center', fontSize: 20, width: '100%' }}
          onChange={(e) => setTxt(e.target.value.replace(/\D/g, '').slice(0, 4))} onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); } }} />
        <button type="button" className="rc-opt" style={{ width: 40, height: 40, border: 0, fontSize: 22, flex: 'none' }} aria-label={`${label} +${step}`} disabled={value >= max} onClick={() => onCommit(value + step)}>+</button>
      </span>
    </label>
  );
}

export default function Konstruktor({ t, s, set, go, notify }: StepProps) {
  const dark = useDark();
  const draft: Item = s.draft ?? newItem('d2');
  const [hist, setHist] = useState<Item[]>([]);
  const [tab, setTab] = useState<Tab>('ochilish');
  const [sel, setSel] = useState(() => Math.max(0, draft.cols.findIndex((c) => isOpenable(c.open))));
  const [edit, setEdit] = useState<Edit>(null);
  const [show3d, setShow3d] = useState(false);
  const winRef = useRef<HTMLDivElement>(null); // чертёж с размерами: реальный край окна на экране
  const drag = useRef<{ axis: 'W' | 'H'; dx: number; dy: number; moved: boolean } | null>(null);
  const [boxRef, boxW] = useBox<HTMLDivElement>();

  const upd = (fn: (d: Item) => Item) => {
    setHist((h) => [...h.slice(-29), draft]);
    set((st) => ({ ...st, draft: fn(st.draft ?? draft) }));
  };
  const undo = () => {
    const prev = hist[hist.length - 1];
    if (!prev) return;
    setHist((h) => h.slice(0, -1));
    set((st) => ({ ...st, draft: prev }));
  };
  const selI = Math.min(sel, draft.cols.length - 1);
  const isSl = draft.tpl === 'sl';
  const isArch = !!tpl(draft.tpl).arch;
  const selCol = draft.cols[selI];
  const selLower: Lower | 'none' = selCol?.panel ? selCol.lower ?? 'panel' : 'none';
  const paneLbl = (hint: string) => (draft.cols.length > 1 ? `${hint} · ${t.pane} ${selI + 1}` : hint);
  /** узор: старый общий узор изделия раскладывается по стёклам, дальше — у каждого стекла свой */
  const setUzor = (u: Uzor, all = false) => upd((d) => ({
    ...d, uzor: 'none', cols: d.cols.map((c, k) => (all || k === selI ? { ...c, uzor: u } : { ...c, uzor: colUzor(d, k) })),
  }));

  // размер чертежа
  const isDesk = useMedia('(min-width: 1024px)');
  const maxW = Math.max(120, (boxW || 340) - (isDesk ? 220 : 120));
  const maxH = isDesk ? 380 : 210;
  const fitted = fit(draft, maxW, maxH);
  const w = fitted.w;
  const h = fitted.h;
  const g = geometry(draft, w, h);
  const ws = colWidths(draft);
  const price = priceOf(draft, { lvl: s.lvl }) * draft.qty;

  // ---- ручки на концах размерных линий: тянем — размер меняется сразу. Каждое движение подтягивает край окна к пальцу
  // (так ручка идёт за пальцем при любой раскладке, а когда чертёж упёрся в рамку и масштаб уменьшается — размер растёт плавно до 1000 см)
  const startDrag = (axis: 'W' | 'H') => (e: React.PointerEvent<HTMLElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = winRef.current?.getBoundingClientRect();
    // смещение пальца от края окна: ручка не «прыгает» под палец
    drag.current = { axis, dx: r ? e.clientX - r.right : 0, dy: r ? e.clientY - r.bottom : 0, moved: false };
  };
  const moveDrag = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    const r = winRef.current?.getBoundingClientRect();
    if (!d || !r || !fitted.k) return;
    if (!d.moved) { d.moved = true; setHist((hh) => [...hh.slice(-29), draft]); }
    const err = d.axis === 'W' ? e.clientX - d.dx - r.right : e.clientY - d.dy - r.bottom; // px до пальца
    const size = d.axis === 'W' ? draft.W : draft.H;
    const lim = Math.max(2, Math.round(size * 0.04)); // не больше ~4% за событие: без рывков у больших размеров
    const cm = size + Math.max(-lim, Math.min(lim, err / fitted.k));
    set((st) => ({ ...st, draft: d.axis === 'W' ? setW(st.draft ?? draft, cm) : setH(st.draft ?? draft, cm) }));
  };
  const endDrag = () => { drag.current = null; };
  const keyDim = (axis: 'W' | 'H') => (e: React.KeyboardEvent) => {
    const inc = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0;
    if (!inc) return;
    e.preventDefault();
    const stp = e.shiftKey ? 10 : 1;
    upd((d) => (axis === 'W' ? setW(d, d.W + inc * stp) : setH(d, d.H + inc * stp)));
  };
  const minW = Math.max(LIMITS.W[0], draft.cols.length * LIMITS.col);

  const commit = () => {
    set((st) => {
      const d = st.draft ?? draft;
      const items = st.editId && st.items.some((x) => x.id === st.editId)
        ? st.items.map((x) => (x.id === st.editId ? { ...d, id: st.editId! } : x))
        : [...st.items, { ...d, id: Math.random().toString(36).slice(2, 9), ...(d.col || st.col ? { col: d.col ?? st.col } : {}) }];
      return { ...st, items, draft: null, editId: null };
    });
    track('item_add', { type: draft.tpl, w: draft.W, h: draft.H, qty: draft.qty });
  };

  const dims = (
    <div ref={winRef} className="relative" style={{ width: w, height: h }}>
      {/* верх: ширины частей */}
      {draft.cols.length > 1 && (
        <div aria-label={t.equalHint}>
          <svg className="absolute" style={{ left: 0, top: -32, overflow: 'visible' }} width={w} height={20} aria-hidden="true">
            <path d={`M0 10 H${w}`} stroke="#0077FF" strokeWidth="1.25" strokeLinecap="round" className="rc-dim" />
          </svg>
          {[0, ...g.secs.slice(0, -1).map((sc) => sc.x + sc.w + g.t / 2), w].map((x, k) => (
            <button key={k} type="button" onClick={() => upd(equalize)} title={t.equalize} aria-label={t.equalize}
              className="absolute" style={{ left: x - 14, top: -36, width: 28, height: 28, background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
              <span style={{ display: 'block', margin: '7px auto', width: 12, height: 12, borderRadius: '50%', border: '2px solid #0077FF', background: 'var(--card)' }} />
            </button>
          ))}
          {g.secs.map((sc, i) => (
            <button key={i} type="button" className="rc-pill rc-num absolute" style={{ left: sc.x + sc.w / 2, top: -37, transform: 'translateX(-50%)' }}
              onClick={() => setEdit({ k: 'col', i })} aria-label={`${t.secW(i + 1)}: ${ws[i]} ${t.cm}`}>{ws[i]}</button>
          ))}
        </div>
      )}
      <WindowDrawing shape={draft} w={w} h={h} color={itemCol(draft, s)} dark={dark} labels onGlass={(i) => setSel(i)} title={`${t.tpl[draft.tpl]}, ${draft.W} × ${draft.H} ${t.cm}`} />
      {/* выбранное стекло */}
      {draft.cols.length > 1 && g.secs[selI] && (
        <div aria-hidden="true" className="pointer-events-none absolute" style={{ left: g.secs[selI].x - 2, top: g.secs[selI].y - 2, width: g.secs[selI].w + 4, height: g.secs[selI].h + 4, border: '3px solid #FFC529', borderRadius: 4, boxShadow: '0 0 0 3px rgba(255,197,41,.3)' }} />
      )}
      {/* справа: высота */}
      <svg className="absolute" style={{ left: w + 22, top: 0, overflow: 'visible' }} width={16} height={h} aria-hidden="true">
        <path d={`M-22 0 H4 M-22 ${h} H4`} className="rc-ext" />
        <path d={`M8 1 V${h - 1} M4 8 L8 1 L12 8 M4 ${h - 8} L8 ${h - 1} L12 ${h - 8}`} className="rc-dim" />
      </svg>
      <button type="button" className="rc-pill rc-num absolute" style={{ left: w + 30, top: h / 2, transform: 'translate(-50%,-50%)' }} onClick={() => setEdit({ k: 'H' })} aria-label={`${t.boyi}: ${draft.H} ${t.cm}`}>{draft.H}</button>
      <div role="slider" tabIndex={0} aria-orientation="vertical" aria-label={t.boyi} aria-valuemin={LIMITS.H[0]} aria-valuemax={LIMITS.H[1]} aria-valuenow={draft.H} aria-valuetext={`${draft.H} ${t.cm}`}
        className="rc-grip" style={{ left: w + 30, top: h, cursor: 'ns-resize' }} onPointerDown={startDrag('H')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={keyDim('H')} />
      {/* снизу: общая ширина */}
      <svg className="absolute" style={{ left: 0, top: h + 18, overflow: 'visible' }} width={w} height={16} aria-hidden="true">
        <path d={`M0 -18 V4 M${w} -18 V4`} className="rc-ext" />
        <path d={`M1 8 H${w - 1} M8 4 L1 8 L8 12 M${w - 8} 4 L${w - 1} 8 L${w - 8} 12`} className="rc-dim" />
      </svg>
      <button type="button" className="rc-pill solid rc-num absolute" style={{ left: Math.min(w / 2, w - 54), top: h + 26, transform: 'translate(-50%,-50%)' }} onClick={() => setEdit({ k: 'W' })} aria-label={`${t.eni}: ${draft.W} ${t.cm}`}>{draft.W} {t.cm}</button>
      <div role="slider" tabIndex={0} aria-orientation="horizontal" aria-label={t.eni} aria-valuemin={minW} aria-valuemax={LIMITS.W[1]} aria-valuenow={draft.W} aria-valuetext={`${draft.W} ${t.cm}`}
        className="rc-grip" style={{ left: w, top: h + 26, cursor: 'ew-resize' }} onPointerDown={startDrag('W')} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={keyDim('W')} />
    </div>
  );

  const canvas = (
    <div ref={boxRef} className="relative flex items-center justify-center rc-grid" style={{ minHeight: isDesk ? 620 : 300, padding: isDesk ? '60px 20px' : '56px 12px 52px', borderRadius: isDesk ? 24 : 0, boxShadow: isDesk ? 'inset 0 0 0 1px var(--line2)' : undefined }}>
      <button type="button" onClick={undo} disabled={!hist.length} className="rc-ghost absolute" style={{ left: isDesk ? 20 : 14, top: isDesk ? 20 : 12, minHeight: 40, padding: isDesk ? '0 14px' : '0 10px', opacity: hist.length ? 1 : 0.5 }} aria-label={t.undo}>
        {I.undo()}<span className={isDesk ? '' : 'sr-only'}>{t.undo}</span>
      </button>
      <button type="button" onClick={() => { setShow3d(true); track('view_3d', { from: 'konstruktor' }); }} className="absolute flex items-center gap-2" style={{ right: isDesk ? 20 : 14, top: isDesk ? 20 : 12, height: 40, padding: '0 14px', borderRadius: 12, border: 0, background: '#0B1530', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
        <span style={{ color: '#80D4EC' }}>{I.cube()}</span>{isDesk ? t.view3d : '3D'}
      </button>
      <div style={{ filter: 'drop-shadow(0 18px 22px rgba(11,21,48,.18))', marginRight: 40 }}>{dims}</div>
    </div>
  );

  const tabs = (
    <div className="grid grid-cols-3 gap-2" role="tablist">
      {(['bolish', 'ochilish', 'uzor'] as Tab[]).map((k) => (
        <button key={k} type="button" role="tab" aria-selected={tab === k} className="rc-tab" onClick={() => setTab(k)}>
          {k === 'bolish' ? I.split() : k === 'ochilish' ? I.open() : I.grid()}{t.tabs[k]}
        </button>
      ))}
    </div>
  );

  const tabBody = (
    <div className="flex flex-col gap-2.5" role="tabpanel">
      {tab === 'bolish' && (<>
        <span className="rc-lbl">{t.bolishHint}</span>
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button key={n} type="button" className="rc-opt" aria-pressed={draft.cols.length === n} aria-label={`${n}`} onClick={() => { upd((d) => setCount(d, n)); setSel(0); }}><SplitIcon n={n} /></button>
          ))}
        </div>
        {/* горизонтальный импост: снизу панель (алюкобонд) или стекло */}
        <span className="rc-lbl" style={{ marginTop: 6 }}>{paneLbl(t.lowerLbl)}</span>
        <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label={t.lowerLbl}>
          {(['none', 'panel', 'glass'] as const).map((k) => (
            <button key={k} type="button" role="radio" className="rc-chip" style={{ justifyContent: 'center' }} aria-checked={selLower === k} aria-pressed={selLower === k}
              onClick={() => upd((d) => setLower(d, selI, k === 'none' ? null : k))}>
              <LowerIcon k={k} />{t.lowers[k]}
            </button>
          ))}
        </div>
        {selLower !== 'none' && selCol?.panel && (
          <div className="flex gap-3">
            <NumField label={t.lowerH} unit={t.cm} value={Math.round(selCol.panel * draft.H)} min={LOWER_MIN} max={Math.max(LOWER_MIN, draft.H - 30)}
              onCommit={(n) => upd((d) => setLower(d, selI, selLower, n))} />
          </div>
        )}
        {isArch && (
          <div className="flex gap-3" style={{ marginTop: 6 }}>
            <NumField label={t.archH} unit={t.cm} value={archRise(draft)} min={10} max={archMax(draft)}
              onCommit={(n) => upd((d) => ({ ...d, archH: Math.min(n, archMax(d)) }))} />
          </div>
        )}
      </>)}
      {tab === 'ochilish' && (<>
        <span className="rc-lbl">{draft.cols.length > 1 ? `${t.ochilishHint} · ${t.pane} ${selI + 1}` : t.ochilishHint}</span>
        <div className={`grid gap-2 ${isSl ? 'grid-cols-4' : 'grid-cols-6'}`}>
          {(isSl ? SLIDES : OPENS).map((o) => (
            <button key={o} type="button" className="rc-opt" aria-pressed={draft.cols[selI]?.open === o} aria-label={t.open[o]} title={t.open[o]}
              onClick={() => upd((d) => ({ ...d, cols: d.cols.map((c, k) => (k === selI ? { ...c, open: o } : c)) }))}><OpenIcon o={o} /></button>
          ))}
        </div>
        <span className="rc-hint">{t.open[draft.cols[selI]?.open ?? 'fix']}</span>
      </>)}
      {tab === 'uzor' && (<>
        <span className="rc-lbl">{paneLbl(t.uzorHint)}</span>
        <div className="grid grid-cols-5 gap-2">
          {UZORS.map((u) => (
            <button key={u} type="button" className="rc-opt" aria-pressed={colUzor(draft, selI) === u} aria-label={t.uzors[u]} title={t.uzors[u]} onClick={() => setUzor(u)}><UzorIcon u={u} /></button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="rc-hint">{t.uzors[colUzor(draft, selI)]} · {t.uzorNote}</span>
          {draft.cols.length > 1 && (
            <button type="button" className="rc-chip" onClick={() => setUzor(colUzor(draft, selI), true)}>{t.allPanes}</button>
          )}
        </div>
      </>)}
    </div>
  );

  const sizes = (
    <>
      <div className="flex gap-3">
        <NumField label={t.eni} unit={t.cm} value={draft.W} min={Math.max(LIMITS.W[0], draft.cols.length * LIMITS.col)} max={LIMITS.W[1]} onCommit={(n) => upd((d) => setW(d, n))} />
        <NumField label={t.boyi} unit={t.cm} value={draft.H} min={LIMITS.H[0]} max={LIMITS.H[1]} onCommit={(n) => upd((d) => setH(d, n))} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="rc-lbl">{t.quick}</span>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(([qw, qh]) => (
            <button key={`${qw}x${qh}`} type="button" className="rc-chip rc-num" aria-pressed={draft.W === qw && draft.H === qh} onClick={() => upd((d) => setH(setW(d, qw), qh))}>{qw}×{qh}</button>
          ))}
        </div>
      </div>
    </>
  );

  const priceLine = (
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--mute)' }}>{t.approx} · {fmtArea(area(draft))} m²</div>
      <div className="rc-disp rc-num" style={{ fontSize: 22, whiteSpace: 'nowrap' }} aria-live="polite">{fmt(price)} <span style={{ fontSize: 13, fontFamily: 'Onest Variable' }}>{t.sum}</span></div>
    </div>
  );
  const qtyRow = (
    <div className="flex gap-2.5">
      <Stepper value={draft.qty} onChange={(q) => set((st) => ({ ...st, draft: { ...(st.draft ?? draft), qty: q } }))} labels={{ less: t.less, more: t.more, qty: t.qty }} />
      <button type="button" className="rc-ghost flex-1" onClick={() => { commit(); notify(t.added); go('turi'); }}>+ {t.addToOrder}</button>
    </div>
  );
  const priceBlock = (
    <div className="flex flex-col gap-3">
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--mute)' }}>{t.approx} · {fmtArea(area(draft))} m²</div>
        <div className="rc-disp rc-num" style={{ fontSize: 24 }} aria-live="polite">{fmt(price)} <span style={{ fontSize: 14, fontFamily: 'Onest Variable' }}>{t.sum}</span></div>
      </div>
      <div className="flex gap-2.5">
        <Stepper value={draft.qty} onChange={(q) => set((st) => ({ ...st, draft: { ...(st.draft ?? draft), qty: q } }))} labels={{ less: t.less, more: t.more, qty: t.qty }} />
        <button type="button" className="rc-ghost flex-1" onClick={() => { commit(); notify(t.added); go('turi'); }}>+ {t.addToOrder}</button>
      </div>
      <button type="button" className="rc-cta" onClick={() => { commit(); go('buyurtma'); }}>{t.next} {I.arrow()}</button>
    </div>
  );

  const info = (
    <div className="flex gap-3" style={{ background: 'var(--soft)', borderRadius: 14, padding: '12px 14px' }}>
      <span className="flex flex-none items-center justify-center" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--blue)', color: '#fff' }}>{I.info(16)}</span>
      <span style={{ fontSize: 13.5, lineHeight: 1.45 }}><b>{t.info}</b> {t.infoNote}</span>
    </div>
  );

  return (
    <>
      {!isDesk ? (
      <div className="flex flex-1 flex-col">
        {canvas}
        <div className="rc-sheet flex flex-1 flex-col gap-4" style={{ padding: '16px 16px 0', marginTop: -8 }}>
          {tabs}
          {tabBody}
          {sizes}
          <AppChip t={t} />
          {qtyRow}
          <div className="rc-bottom flex items-center gap-3" style={{ margin: '0 -16px', paddingTop: 12 }}>
            <div className="min-w-0 flex-1">{priceLine}</div>
            <button type="button" className="rc-cta" style={{ width: 'auto', flex: 'none', padding: '0 18px', fontSize: 17 }} onClick={() => { commit(); go('buyurtma'); }}>{t.next} {I.arrow(20)}</button>
          </div>
        </div>
      </div>
      ) : (
      <div className="rc-wrap grid gap-8" style={{ gridTemplateColumns: '1.25fr 1fr', paddingTop: 28, paddingBottom: 40 }}>
        {canvas}
        <div className="flex flex-col gap-4">
          <h1 className="rc-disp" style={{ margin: 0, fontSize: 30 }}>{t.kTitle}</h1>
          <p style={{ margin: 0, color: 'var(--ink2)', lineHeight: 1.5 }}>{t.kSub}</p>
          {tabs}
          {tabBody}
          {sizes}
          {info}
          <AppChip t={t} />
          <div style={{ marginTop: 'auto' }}>{priceBlock}</div>
        </div>
      </div>
      )}

      {edit && (
        <EditDialog t={t}
          label={edit.k === 'col' ? t.secW(edit.i + 1) : edit.k === 'W' ? t.eni : t.boyi}
          value={edit.k === 'col' ? ws[edit.i] : edit.k === 'W' ? draft.W : draft.H}
          onClose={() => setEdit(null)}
          onSave={(n) => {
            const e = edit;
            upd((d) => (e.k === 'col' ? setColW(d, e.i, n) : e.k === 'W' ? setW(d, n) : setH(d, n)));
            setEdit(null);
          }} />
      )}
      {show3d && <View3D t={t} item={draft} col={itemCol(draft, s)} onClose={() => setShow3d(false)} />}
    </>
  );
}

function EditDialog({ t, label, value, onSave, onClose }: { t: StepProps['t']; label: string; value: number; onSave: (n: number) => void; onClose: () => void }) {
  const [v, setV] = useState(String(value));
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus(); ref.current?.select();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const ok = () => { const n = Number(v); if (n > 0) onSave(n); };
  return (
    <div className="rc-modal" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={label} className="rc-sheet flex flex-col gap-4" style={{ padding: '20px 16px calc(20px + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <label className="flex flex-col gap-2">
          <span className="rc-disp" style={{ fontSize: 18 }}>{label}</span>
          <span className="rc-field">
            <input ref={ref} inputMode="numeric" pattern="[0-9]*" value={v} onChange={(e) => setV(e.target.value.replace(/\D/g, '').slice(0, 4))}
              onKeyDown={(e) => e.key === 'Enter' && ok()} className="rc-disp rc-num" style={{ fontSize: 26 }} aria-label={`${label}, ${t.cm}`} />
            <span style={{ fontWeight: 600, color: 'var(--mute)' }}>{t.cm}</span>
          </span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" className="rc-ghost" onClick={onClose}>{t.cancel}</button>
          <button type="button" className="rc-cta" style={{ minHeight: 48, fontSize: 17 }} onClick={ok}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}
