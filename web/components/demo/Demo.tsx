'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Drawing, { type EditTarget } from './Drawing';
import {
  COLORS, DEFAULT_RATE, LIMITS, ORDER, PROFILES, TEMPLATES, BAR,
  compute, equalize, fmt, fromQuery, initialState, setHeight, setPartWidth, setWidth, toQuery, tplById,
  type ColId, type DemoState, type ProfId, type TplId,
} from '@/lib/demo/calc';
import type { Dict, Lang } from '@/lib/i18n';
import { track } from '@/lib/analytics';
import { LINKS } from '@/lib/i18n';

interface Cmp { key: string; name: string; size: string; prof: string; col: string; uzs: string }

const chipCls = (on: boolean) =>
  `focus-ring min-h-[44px] rounded-xl border-2 px-4 text-sm font-bold transition ${
    on ? 'border-brand bg-white text-brand' : 'border-transparent bg-grid text-navy hover:border-[#B9CCF2]'
  }`;

export default function Demo({ t, lang, rate = DEFAULT_RATE, compact = false }: { t: Dict['demo']; lang: Lang; rate?: number; compact?: boolean }) {
  const [s, setS] = useState<DemoState>(() => initialState('d3'));
  const [cmp, setCmp] = useState<Cmp[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const resizeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // восстановление из ссылки-поделиться
  useEffect(() => {
    const fromUrl = fromQuery(window.location.search);
    if (fromUrl) setS(fromUrl);
    track('demo_open', { lang, shared: Boolean(fromUrl), compact });
  }, [lang, compact]);

  const tpl = tplById(s.tpl);
  const r = useMemo(() => compute(s), [s]);
  const tname = t.tpl[s.tpl];
  const pname = PROFILES[s.prof].n;
  const cname = t.cols[s.col];
  const uzs = fmt(r.totalUsd * rate);

  const pickTpl = (id: TplId) => {
    const x = tplById(id);
    setS((p) => ({ ...p, tpl: id, W: x.W, H: x.H, types: x.def.slice(), fr: x.parts.map((q) => q.f) }));
    track('demo_template', { tpl: id });
  };
  const setDim = (k: 'W' | 'H', v: number) => {
    setS((p) => (k === 'W' ? setWidth(p, v) : setHeight(p, v)));
    clearTimeout(resizeTimer.current);
    resizeTimer.current = setTimeout(() => track('demo_resize', { dim: k, value: v }), 600);
  };
  const onEdit = useCallback((target: EditTarget, mm: number) => {
    setS((p) => (target.k === 'W' ? setWidth(p, mm) : target.k === 'H' ? setHeight(p, mm) : setPartWidth(p, target.i, mm)));
    track('demo_resize', { dim: target.k === 'part' ? `part${target.i}` : target.k, value: mm, via: 'drawing' });
  }, []);
  const onEqualize = useCallback(() => {
    setS((p) => equalize(p));
    track('demo_equalize', {});
  }, []);

  const cycle = useCallback((i: number) => {
    setS((p) => {
      const ts = p.types.slice();
      const cur = ts[i] ?? 'fix';
      ts[i] = ORDER[(ORDER.indexOf(cur) + 1) % ORDER.length];
      return { ...p, types: ts };
    });
  }, []);

  const addCmp = () => {
    const item: Cmp = { key: toQuery(s) + Date.now(), name: tname, size: `${s.W} × ${s.H}`, prof: pname, col: cname, uzs };
    setCmp((c) => [...c, item].slice(-3));
    track('demo_compare', { tpl: s.tpl });
  };

  const flash = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${toQuery(s)}`;
    track('demo_share', { tpl: s.tpl });
    try {
      if (navigator.share) { await navigator.share({ title: 'Romchi', text: `${tname} · ${s.W} × ${s.H} mm · ${uzs} ${lang === 'ru' ? 'сум' : 'soʻm'}`, url }); return; }
    } catch { /* пользователь закрыл окно */ return; }
    try { await navigator.clipboard.writeText(url); flash(t.copied); } catch { window.prompt(t.share, url); }
  };

  const pdf = () => {
    track('demo_pdf', { tpl: s.tpl });
    // в PDF — чистый чертёж без кнопок редактирования
    const clone = svgRef.current?.cloneNode(true) as SVGSVGElement | undefined;
    clone?.querySelectorAll('[data-ui]').forEach((el) => el.remove());
    const svg = clone?.outerHTML ?? '';
    const date = new Date().toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ');
    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${t.pdfTitle}</title>
<style>@page{size:A4;margin:16mm}body{font-family:Manrope,Arial,sans-serif;color:#0B1530;margin:0}
h1{font-size:22px;margin:0 0 4px}.m{color:#5B6478;font-size:13px;margin:0 0 18px}
.logo{font-weight:800;font-size:26px;letter-spacing:-.04em;margin-bottom:14px}.logo b{background:#0A6CFF;color:#fff;border-radius:7px;padding:0 6px 2px}
.svg{background:#DCE3EC;border-radius:14px;padding:8px;margin-bottom:16px}svg{width:100%;height:auto;max-height:330px}
.lbl{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#5B6478;margin-top:6px}
.tot{font-size:30px;font-weight:800;color:#0077FF;margin:4px 0 2px}.n{margin-top:18px;font-size:12px;color:#5B6478;background:#FFF6DE;padding:10px 12px;border-radius:10px}</style></head>
<body><div class="logo">Rom<b>chi</b></div><h1>${t.pdfTitle}</h1>
<p class="m">${tname} · ${s.W} × ${s.H} mm · ${pname} · ${cname} · ${r.area.toFixed(2)} m² · ${date}</p>
<div class="svg">${svg}</div>
<div class="lbl">${t.total}</div><div class="tot">${uzs} ${lang === 'ru' ? 'сум' : 'soʻm'}</div>
<p class="n">${t.pdfNote} ${LINKS.site}</p></body></html>`;
    const fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(fr);
    const d = fr.contentWindow!.document;
    d.open(); d.write(html); d.close();
    setTimeout(() => { fr.contentWindow!.focus(); fr.contentWindow!.print(); setTimeout(() => fr.remove(), 1500); }, 250);
  };

  const aria = `${tname}, ${s.W} × ${s.H} mm, ${pname}, ${cname}`;
  const sum = lang === 'ru' ? 'сум' : 'soʻm';

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* шаблоны */}
      <div className="-mx-5 flex gap-2.5 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label={t.pickTpl}>
        {TEMPLATES.map((x) => (
          <button
            key={x.id} type="button" aria-pressed={x.id === s.tpl} onClick={() => pickTpl(x.id)}
            className={`focus-ring min-h-[48px] shrink-0 rounded-[14px] px-[18px] text-[15px] font-extrabold shadow-[0_6px_18px_rgba(11,21,48,.06)] transition ${
              x.id === s.tpl ? 'bg-brand text-white' : 'bg-white text-navy hover:text-brand'
            }`}
          >
            {t.tpl[x.id]}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* чертёж — первым на мобильном */}
        <div className="order-1 flex flex-col gap-3 rounded-[28px] bg-[#DCE3EC] p-5 sm:p-6 lg:order-2">
          <div className="flex items-center justify-between gap-3">
            <p className="m-0 text-xs font-extrabold uppercase tracking-[.14em] text-brand-deep">{t.drawing}</p>
            <span className="text-[13px] font-bold text-[#3B4558]">{tname} · {s.W} × {s.H} mm</span>
          </div>
          <Drawing ref={svgRef} s={s} ariaLabel={aria} onCycle={cycle} typeNames={t.types}
            onEdit={onEdit} onEqualize={onEqualize} labels={{ edit: t.editDim, equalize: t.equalize }} />
          <div className="flex flex-col gap-1.5 rounded-2xl bg-white/70 px-4 py-3 text-[13px] leading-snug text-[#3B4558]">
            <p className="m-0 flex items-start gap-2.5">
              <svg aria-hidden="true" width="26" height="18" viewBox="0 0 26 18" className="mt-px shrink-0"><rect x="1" y="2" width="24" height="14" rx="4" fill="#fff" stroke="#0077FF" strokeWidth="1.2" strokeDasharray="3 2" /><text x="13" y="12.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#0B1530">500</text></svg>
              <span>{t.hintEdit}</span>
            </p>
            {tpl.parts.length > 1 && (
              <p className="m-0 flex items-start gap-2.5">
                <svg aria-hidden="true" width="26" height="18" viewBox="0 0 26 18" className="mt-px shrink-0"><circle cx="13" cy="9" r="7.5" fill="#0077FF" /><line x1="9.6" y1="7.3" x2="16.4" y2="7.3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /><line x1="9.6" y1="10.7" x2="16.4" y2="10.7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                <span>{t.hintEqual}</span>
              </p>
            )}
            <p className="m-0 pl-[36px] text-muted">{t.clickHint}</p>
          </div>
        </div>

        {/* управление */}
        <div className="order-2 flex flex-col gap-5 rounded-[28px] bg-white p-5 shadow-card sm:p-6 lg:order-1">
          {(['W', 'H'] as const).map((k) => (
            <div key={k} className="flex flex-col gap-1.5 text-sm font-bold text-[#3B4558]">
              <div className="flex items-center justify-between gap-3">
                <label htmlFor={`dim-${k}`}>{k === 'W' ? t.width : t.height}</label>
                <span className="flex items-center gap-1.5">
                  <NumInput id={`dim-${k}`} value={s[k]} onCommit={(v) => setDim(k, v)} />
                  <span className="text-muted">mm</span>
                </span>
              </div>
              <input
                type="range" min={LIMITS[k][0]} max={LIMITS[k][1]} step={10} value={s[k]}
                onChange={(e) => setDim(k, Number(e.target.value))}
                aria-label={k === 'W' ? t.width : t.height}
                className="h-7 w-full accent-brand"
              />
            </div>
          ))}
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2.5 p-0 text-sm font-bold text-[#3B4558]">{t.profile}</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PROFILES) as ProfId[]).map((id) => (
                <button key={id} type="button" aria-pressed={id === s.prof} className={chipCls(id === s.prof)}
                  onClick={() => { setS((p) => ({ ...p, prof: id })); track('demo_profile', { prof: id }); }}>
                  {PROFILES[id].n}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2.5 p-0 text-sm font-bold text-[#3B4558]">{t.color}</legend>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(COLORS) as ColId[]).map((id) => (
                <button key={id} type="button" aria-pressed={id === s.col} className={chipCls(id === s.col)}
                  onClick={() => { setS((p) => ({ ...p, col: id })); track('demo_color', { col: id }); }}>
                  <span aria-hidden="true" className="mr-2 inline-block h-3 w-3 rounded-full align-[-1px] ring-1 ring-black/15" style={{ background: COLORS[id].c }} />
                  {t.cols[id]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2.5 p-0 text-sm font-bold text-[#3B4558]">{t.allSashes}</legend>
            <div className="flex flex-wrap gap-2">
              {ORDER.map((ty) => (
                <button key={ty} type="button" className={chipCls(false)} onClick={() => setS((p) => ({ ...p, types: tpl.parts.map(() => ty) }))}>
                  {t.types[ty]}
                </button>
              ))}
            </div>
            <p className="mb-0 mt-2.5 text-[13px] text-muted">{t.clickHint}</p>
          </fieldset>
        </div>

        {/* цена */}
        <div className="order-3 flex flex-col gap-1.5 rounded-[28px] bg-white p-5 shadow-card sm:p-6" aria-live="polite">
          <p className="m-0 mb-2 text-xs font-extrabold uppercase tracking-[.14em] text-brand-deep">{t.total}</p>
          <div className="text-[34px] font-extrabold tracking-[-0.03em] text-brand">{uzs} <span className="text-lg">{sum}</span></div>
          <div className="mb-2 flex flex-wrap gap-2 text-[13px] font-extrabold">
            <span className="rounded-[10px] bg-brand-soft px-3 py-1.5 text-brand-deep">{pname}</span>
            <span className="rounded-[10px] bg-[#F3E8FF] px-3 py-1.5 text-[#7E22CE]">{cname}</span>
            <span className="rounded-[10px] bg-[#E3F7EA] px-3 py-1.5 text-[#0A6B36]">{r.area.toFixed(2)} m²</span>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button type="button" onClick={addCmp} className="focus-ring min-h-[48px] rounded-[14px] bg-brand px-[18px] text-[15px] font-extrabold text-white">{t.addCmp}</button>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={pdf} className="focus-ring min-h-[48px] rounded-[14px] bg-grid px-3 text-sm font-extrabold text-navy hover:text-brand">{t.pdf}</button>
              <button type="button" onClick={share} className="focus-ring min-h-[48px] rounded-[14px] bg-grid px-3 text-sm font-extrabold text-navy hover:text-brand">{t.share}</button>
            </div>
          </div>
        </div>
      </div>

      {/* раскрой */}
      <div className="flex flex-col gap-3.5 rounded-[28px] bg-white p-5 shadow-card sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="m-0 text-xs font-extrabold uppercase tracking-[.14em] text-brand-deep">✂ {t.cutting} · {pname}</p>
          <div className="flex flex-wrap gap-2.5 text-sm font-bold">
            <span className="rounded-xl bg-cream px-3.5 py-2">{t.eff} <b className="text-lg text-[#C27A00]">{r.eff.toFixed(1)}%</b></span>
            <span className="rounded-xl bg-grid px-3.5 py-2">{t.cuts} <b>{r.pcs.length}</b></span>
            <span className="rounded-xl bg-grid px-3.5 py-2">{t.rest} <b>{r.waste} mm</b></span>
          </div>
        </div>
        {r.bars.map((b, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-7 text-[13px] font-extrabold text-muted">#{i + 1}</span>
            <div className="flex flex-1 overflow-hidden rounded-lg">
              {b.segs.map((L, j) => (
                <div key={j} title={`p${j + 1} · ${L} mm`} style={{ width: `${(L / BAR) * 100}%` }}
                  className="flex h-[30px] items-center justify-center overflow-hidden whitespace-nowrap border-r-2 border-white bg-[#64B5F6] text-[11px] font-bold text-navy">
                  {L}
                </div>
              ))}
              <div style={{ width: `${(b.rest / BAR) * 100}%`, background: 'repeating-linear-gradient(45deg,#FFC529 0 4px,#FFF1C2 4px 9px)' }}
                className="flex h-[30px] items-center justify-center overflow-hidden text-[11px] font-extrabold text-[#6B4E00]">
                {b.rest > 350 ? b.rest : ''}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* сравнение */}
      <div className="flex flex-col gap-3.5 rounded-[28px] bg-white p-5 shadow-card sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="m-0 text-xs font-extrabold uppercase tracking-[.14em] text-brand-deep">{t.compare}</p>
          <button type="button" onClick={() => setCmp([])} className={chipCls(false)}>{t.clear}</button>
        </div>
        {cmp.length === 0 ? (
          <p className="m-0 text-[15px] text-muted">{t.cmpEmpty}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {cmp.map((c) => (
              <div key={c.key} className="flex flex-col gap-1.5 rounded-[20px] bg-grid p-[18px]">
                <b className="text-base">{c.name}</b>
                <span className="text-sm text-muted">{c.size} mm · {c.prof} · {c.col}</span>
                <span className="mt-1.5 text-[22px] font-extrabold text-brand">{c.uzs} {sum}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && (
        <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl bg-navy px-5 py-3 text-sm font-bold text-white shadow-float">{toast}</div>
      )}
    </div>
  );
}

/** Поле ввода размера: правка без прыжков, применение по Enter / уходу с поля */
function NumInput({ id, value, onCommit }: { id: string; value: number; onCommit: (v: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null) {
      const v = Number(draft);
      if (Number.isFinite(v) && v > 0) onCommit(v);
    }
    setDraft(null);
  };
  return (
    <input
      id={id} type="number" inputMode="numeric" value={draft ?? String(value)}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      className="focus-ring h-10 w-[88px] rounded-xl border-2 border-line bg-white text-center text-base font-extrabold text-brand-deep tabular-nums focus:border-brand"
    />
  );
}
