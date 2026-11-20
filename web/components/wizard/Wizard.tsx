'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Drawing, { type EditTarget } from '@/components/demo/Drawing';
import SendToMasters from '@/components/demo/SendToMasters';
import Thumb from './Thumb';
import {
  COLORS, DEFAULT_RATE, LIMITS, ORDER, PROFILES, TEMPLATES,
  compute, equalize, fmt, fromQuery, initialState, setHeight, setPartWidth, setWidth, toQuery, tplById,
  type ColId, type DemoState, type ProfId, type TplId,
} from '@/lib/demo/calc';
import { printEstimate } from '@/lib/demo/pdf';
import { LINKS, type Dict, type Lang } from '@/lib/i18n';
import { track } from '@/lib/analytics';

type Step = 0 | 1 | 2 | 3 | 4;
const STEP_EVENTS = ['wiz_type', 'wiz_size', 'wiz_color', 'wiz_price', 'wiz_masters'] as const;

/** Округление цены для граждан: до 10 000 сум (точная цена — от мастера) */
const roundUzs = (n: number) => Math.round(n / 10000) * 10000;

export default function Wizard({ t, demo, send, lang }: { t: Dict['wiz']; demo: Dict['demo']; send: Dict['send']; lang: Lang }) {
  const [step, setStep] = useState<Step>(0);
  const [s, setS] = useState<DemoState>(() => initialState('d2'));
  const svgRef = useRef<SVGSVGElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const restored = useRef(false);

  // ссылка-поделиться: восстановить макет и открыть шаг цены
  useEffect(() => {
    const q = window.location.search;
    const fromUrl = fromQuery(q);
    if (fromUrl) {
      setS(fromUrl);
      const st = Number(new URLSearchParams(q).get('st'));
      setStep((st >= 1 && st <= 4 ? st : 3) as Step);
    }
    restored.current = true;
    track('wiz_open', { lang, shared: Boolean(fromUrl) });
  }, [lang]);

  // состояние → в адрес (без перезагрузки), чтобы можно было поделиться и вернуться
  useEffect(() => {
    if (!restored.current) return;
    const url = step === 0 ? window.location.pathname : `${window.location.pathname}?${toQuery(s)}&st=${step}`;
    window.history.replaceState(null, '', url);
  }, [s, step]);

  const go = useCallback((n: Step) => {
    setStep(n);
    track(STEP_EVENTS[n], {});
    requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: 'start' }));
  }, []);

  const tpl = tplById(s.tpl);
  const r = useMemo(() => compute(s), [s]);
  const total = roundUzs(r.totalUsd * DEFAULT_RATE);
  const sum = lang === 'ru' ? 'сум' : 'soʻm';
  const totalTxt = `${fmt(total)} ${sum}`;
  const cm = (mm: number) => Math.round(mm / 10);
  const tname = demo.tpl[s.tpl];
  const cname = COLORS[s.col].n;
  const pname = PROFILES[s.prof].n;
  const summary = `${tname} · ${cm(s.W)} × ${cm(s.H)} sm · ${pname} · ${cname}`;

  const pickType = (id: TplId) => {
    const x = tplById(id);
    setS((p) => ({ ...p, tpl: id, W: x.W, H: x.H, types: x.def.slice(), fr: x.parts.map((q) => q.f) }));
    track('demo_template', { tpl: id });
    go(1);
  };

  const onEdit = useCallback((target: EditTarget, mm: number) => {
    setS((p) => (target.k === 'W' ? setWidth(p, mm) : target.k === 'H' ? setHeight(p, mm) : setPartWidth(p, target.i, mm)));
    track('demo_resize', { dim: target.k === 'part' ? `part${target.i}` : target.k, via: 'drawing' });
  }, []);
  const onEqualize = useCallback(() => { setS((p) => equalize(p)); track('demo_equalize', {}); }, []);
  const cycle = useCallback((i: number) => {
    setS((p) => {
      const ts = p.types.slice();
      ts[i] = ORDER[(ORDER.indexOf(ts[i] ?? 'fix') + 1) % ORDER.length];
      return { ...p, types: ts };
    });
  }, []);

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?${toQuery(s)}&st=3`;
    track('demo_share', { tpl: s.tpl });
    try {
      if (navigator.share) { await navigator.share({ title: 'Romchi', text: `${summary} · ${totalTxt}`, url }); return; }
    } catch { return; }
    try { await navigator.clipboard.writeText(url); alertCopied(); } catch { window.prompt(t.share, url); }
  };
  const [copied, setCopied] = useState(false);
  const alertCopied = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const pdf = () => {
    track('demo_pdf', { tpl: s.tpl });
    printEstimate({ svg: svgRef.current, lang, title: demo.pdfTitle, line: summary, totalLabel: t.approx, total: totalTxt, note: demo.pdfNote, site: LINKS.site });
  };

  const labels = [t.sSize, t.sColor, t.sPrice, t.sMasters];

  return (
    <div className="wiz min-h-[calc(100svh-68px)] bg-[#F4F7FB] pb-28">
      <div ref={topRef} className="scroll-mt-[76px]" />

      {step > 0 && (
        <div className="sticky top-[68px] z-30 border-b border-line/70 bg-[#F4F7FB]/92 backdrop-blur-md sm:top-[76px]">
          <div className="mx-auto flex max-w-[720px] items-center gap-3 px-5 py-3">
            <button type="button" onClick={() => go((step - 1) as Step)} aria-label={t.back}
              className="press focus-ring grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-navy shadow-[0_1px_2px_rgba(11,21,48,.08)]">
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5"><path d="M12.5 4.5L7 10l5.5 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <ol className="m-0 flex flex-1 list-none gap-1.5 p-0" aria-label={t.progress}>
              {labels.map((l, i) => (
                <li key={l} className="flex flex-1 flex-col gap-1.5" aria-current={step === i + 1 ? 'step' : undefined}>
                  <span className={`h-1.5 rounded-full transition-colors duration-200 ${i + 1 <= step ? 'bg-brand' : 'bg-line'}`} />
                  <span className={`hidden text-[12px] font-bold sm:block ${i + 1 === step ? 'text-navy' : 'text-muted'}`}>{l}</span>
                </li>
              ))}
            </ol>
            <span className="shrink-0 text-[13px] font-extrabold tabular-nums text-muted sm:hidden">{step}/4</span>
          </div>
        </div>
      )}

      <div key={step} className="step-in mx-auto flex max-w-[720px] flex-col gap-5 px-5 pt-6 sm:pt-10">
        {/* 0 — что нужно (первые 5 секунд) */}
        {step === 0 && (
          <>
            <div className="flex flex-col gap-3 pt-2">
              <h1 className="m-0 text-balance text-[34px] font-extrabold leading-[1.04] tracking-[-0.035em] text-navy sm:text-[48px]">
                {t.h1a} <span className="text-brand">{t.h1b}</span>
              </h1>
              <p className="m-0 max-w-[46ch] text-[16px] leading-relaxed text-[#3B4558] sm:text-[18px]">{t.lead}</p>
            </div>
            <h2 className="m-0 mt-1 text-[20px] font-extrabold tracking-[-0.01em] text-navy">{t.q}</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {TEMPLATES.map((x) => (
                <button key={x.id} type="button" onClick={() => pickType(x.id)}
                  className="type-card press focus-ring flex flex-col items-center gap-2 rounded-[22px] border-2 border-transparent bg-white p-3 pb-4 text-center shadow-[0_1px_2px_rgba(11,21,48,.06),0_8px_24px_rgba(11,21,48,.06)]">
                  <Thumb id={x.id} className="h-auto w-full max-w-[132px]" />
                  <b className="text-[16px] font-extrabold leading-tight text-navy">{demo.tpl[x.id]}</b>
                </button>
              ))}
            </div>
            <ul className="m-0 mt-1 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-[14px] font-bold text-[#3B4558]">
              {t.perks.map((p) => (
                <li key={p} className="flex items-center gap-2">
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4 text-brand"><path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {p}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* 1 — размер */}
        {step === 1 && (
          <>
            <StepTitle title={t.sizeT} sub={t.sizeSub} />
            <div className="flex flex-col gap-3 rounded-[24px] bg-[#DCE3EC] p-3 sm:p-5">
              <Drawing ref={svgRef} s={s} unit="cm" ariaLabel={summary} onCycle={cycle} typeNames={demo.types}
                onEdit={onEdit} onEqualize={onEqualize} labels={{ edit: demo.editDim, equalize: demo.equalize }} />
              <Hints demo={demo} many={tpl.parts.length > 1} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['W', 'H'] as const).map((k) => (
                <div key={k} className="flex flex-col gap-2 rounded-[20px] bg-white p-4 shadow-[0_1px_2px_rgba(11,21,48,.06)]">
                  <label htmlFor={`w-${k}`} className="text-sm font-bold text-[#3B4558]">{k === 'W' ? demo.width : demo.height}</label>
                  <div className="flex items-baseline gap-1.5">
                    <CmInput id={`w-${k}`} mm={s[k]} onCommit={(mm) => setS((p) => (k === 'W' ? setWidth(p, mm) : setHeight(p, mm)))} />
                    <span className="text-[15px] font-bold text-muted">sm</span>
                  </div>
                  <input type="range" min={LIMITS[k][0]} max={LIMITS[k][1]} step={10} value={s[k]} aria-label={k === 'W' ? demo.width : demo.height}
                    onChange={(e) => { const v = Number(e.target.value); setS((p) => (k === 'W' ? setWidth(p, v) : setHeight(p, v))); }}
                    className="h-7 w-full accent-brand" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* 2 — цвет и профиль */}
        {step === 2 && (
          <>
            <StepTitle title={t.colorT} sub={t.colorSub} />
            <div className="flex flex-col gap-4 rounded-[24px] bg-white p-4 shadow-[0_1px_2px_rgba(11,21,48,.06)] sm:p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="text-sm font-bold text-[#3B4558]">{demo.color}</span>
                <b className="text-[15px] font-extrabold text-brand-deep">{cname}</b>
              </div>
              <div className="grid grid-cols-5 gap-2.5 sm:grid-cols-6">
                {(Object.keys(COLORS) as ColId[]).map((id) => {
                  const c = COLORS[id];
                  const on = id === s.col;
                  return (
                    <button key={id} type="button" aria-pressed={on} aria-label={c.n} title={c.n}
                      onClick={() => { setS((p) => ({ ...p, col: id })); track('demo_color', { col: id }); }}
                      className={`swatch press focus-ring relative aspect-square min-h-[48px] rounded-2xl ring-1 ring-black/10 ${on ? 'shadow-[0_0_0_2px_#fff,0_0_0_4.5px_#0077FF]' : ''}`}
                      style={{ backgroundColor: c.c, backgroundImage: c.tex ? `url(${c.tex})` : undefined, backgroundSize: 'cover' }}>
                      {on && (
                        <svg aria-hidden="true" viewBox="0 0 20 20" className="absolute inset-0 m-auto h-6 w-6 drop-shadow-[0_1px_2px_rgba(0,0,0,.5)]">
                          <path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-3 rounded-[24px] bg-white p-4 shadow-[0_1px_2px_rgba(11,21,48,.06)] sm:p-6">
              <span className="text-sm font-bold text-[#3B4558]">{t.profile}</span>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(PROFILES) as ProfId[]).map((id) => {
                  const on = id === s.prof;
                  return (
                    <button key={id} type="button" aria-pressed={on}
                      onClick={() => { setS((p) => ({ ...p, prof: id })); track('demo_profile', { prof: id }); }}
                      className={`press focus-ring min-h-[56px] rounded-2xl border-2 text-[17px] font-extrabold ${on ? 'border-brand bg-[#F2F8FF] text-brand-deep' : 'border-line bg-white text-navy'}`}>
                      {PROFILES[id].n}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[24px] bg-[#DCE3EC] p-3 sm:p-5">
              <Drawing ref={svgRef} s={s} unit="cm" ariaLabel={summary} typeNames={demo.types} />
            </div>
          </>
        )}

        {/* 3 — цена */}
        {step === 3 && (
          <>
            <div className="flex flex-col gap-1 rounded-[26px] bg-navy p-6 text-white sm:p-8">
              <span className="text-[14px] font-bold text-[#B8C2D6]">{t.approx}</span>
              <b className="text-[40px] font-extrabold leading-none tracking-[-0.03em] tabular-nums sm:text-[52px]">
                {fmt(total)} <span className="text-[22px] sm:text-[26px]">{sum}</span>
              </b>
              <span className="mt-2 max-w-[46ch] text-[14px] leading-snug text-[#B8C2D6]">{t.priceNote}</span>
            </div>
            <div className="rounded-[24px] bg-[#DCE3EC] p-3 sm:p-5">
              <Drawing ref={svgRef} s={s} unit="cm" ariaLabel={summary} typeNames={demo.types} />
            </div>
            <dl className="m-0 grid gap-0 rounded-[24px] bg-white px-4 py-1 shadow-[0_1px_2px_rgba(11,21,48,.06)] sm:px-6">
              {([
                [t.rType, tname, 0],
                [t.rSize, `${cm(s.W)} × ${cm(s.H)} sm`, 1],
                [t.rColor, cname, 2],
                [t.rProfile, pname, 2],
              ] as const).map(([k, v, st]) => (
                <div key={k} className="flex items-center justify-between gap-3 border-b border-line py-3.5 last:border-0">
                  <dt className="text-[14px] text-muted">{k}</dt>
                  <dd className="m-0 flex items-center gap-3 text-right">
                    <b className="text-[15px] text-navy">{v}</b>
                    <button type="button" onClick={() => go(st as Step)} className="focus-ring rounded-lg px-1.5 py-1 text-[13px] font-extrabold text-brand-deep">{t.change}</button>
                  </dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={pdf} className="press focus-ring min-h-[52px] rounded-2xl bg-white text-[15px] font-extrabold text-navy shadow-[0_1px_2px_rgba(11,21,48,.06)]">{t.pdf}</button>
              <button type="button" onClick={share} className="press focus-ring min-h-[52px] rounded-2xl bg-white text-[15px] font-extrabold text-navy shadow-[0_1px_2px_rgba(11,21,48,.06)]">{copied ? demo.copied : t.share}</button>
            </div>
          </>
        )}

        {/* 4 — мастера */}
        {step === 4 && (
          <>
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-[14px] shadow-[0_1px_2px_rgba(11,21,48,.06)]">
              <span className="min-w-0 truncate text-[#3B4558]">{summary}</span>
              <b className="shrink-0 tabular-nums text-brand">{totalTxt}</b>
            </div>
            <SendToMasters t={send} lang={lang} layout={toQuery(s)} priceUzs={fmt(total)} summary={summary} />
          </>
        )}
      </div>

      {/* нижняя кнопка «дальше» — под большой палец */}
      {step >= 1 && step <= 3 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line/70 bg-white/95 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mx-auto flex max-w-[720px] items-center gap-4 px-5">
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[12px] font-bold text-muted">{t.approx}</span>
              <b className="truncate text-[19px] font-extrabold tabular-nums text-navy">{totalTxt}</b>
            </div>
            <button type="button" onClick={() => go((step + 1) as Step)}
              className="press focus-ring min-h-[54px] shrink-0 rounded-2xl bg-brand px-6 text-[17px] font-extrabold text-white shadow-[0_6px_18px_rgba(0,119,255,.32)]">
              {step === 3 ? t.toMasters : t.next}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h1 className="m-0 text-balance text-[28px] font-extrabold leading-[1.08] tracking-[-0.03em] text-navy sm:text-[36px]">{title}</h1>
      <p className="m-0 max-w-[52ch] text-[15px] leading-relaxed text-[#3B4558]">{sub}</p>
    </div>
  );
}

function Hints({ demo, many }: { demo: Dict['demo']; many: boolean }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl bg-white/75 px-4 py-3 text-[13px] leading-snug text-[#3B4558]">
      <p className="m-0 flex items-start gap-2.5">
        <svg aria-hidden="true" width="26" height="18" viewBox="0 0 26 18" className="mt-px shrink-0"><rect x="1" y="2" width="24" height="14" rx="4" fill="#fff" stroke="#0077FF" strokeWidth="1.2" strokeDasharray="3 2" /><text x="13" y="12.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#0B1530">50</text></svg>
        <span>{demo.hintEdit}</span>
      </p>
      {many && (
        <p className="m-0 flex items-start gap-2.5">
          <svg aria-hidden="true" width="26" height="18" viewBox="0 0 26 18" className="mt-px shrink-0"><circle cx="13" cy="9" r="7.5" fill="#0077FF" /><line x1="9.6" y1="7.3" x2="16.4" y2="7.3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /><line x1="9.6" y1="10.7" x2="16.4" y2="10.7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
          <span>{demo.hintEqual}</span>
        </p>
      )}
      <p className="m-0 pl-[36px] text-muted">{demo.clickHint}</p>
    </div>
  );
}

/** Поле в сантиметрах (внутри всё хранится в мм) */
function CmInput({ id, mm, onCommit }: { id: string; mm: number; onCommit: (mm: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const commit = () => {
    if (draft !== null) {
      const v = Number(draft.replace(',', '.'));
      if (Number.isFinite(v) && v > 0) onCommit(Math.round(v * 10));
    }
    setDraft(null);
  };
  return (
    <input id={id} type="number" inputMode="decimal" value={draft ?? String(Math.round(mm / 10))}
      onFocus={(e) => e.currentTarget.select()} onChange={(e) => setDraft(e.target.value)} onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
      className="focus-ring h-12 w-full min-w-0 rounded-xl border-2 border-line bg-[#F8FAFD] px-3 text-[22px] font-extrabold tabular-nums text-navy focus:border-brand" />
  );
}
