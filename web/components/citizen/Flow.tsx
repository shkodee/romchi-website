'use client';
// Путь гражданина: Namunalar → Konstruktor → Buyurtma → Rang → Narx → Hudud → Ustalar → Tayyor.
// Шаг в адресе (?q=…), кнопка «Назад» браузера работает; состояние — в localStorage.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import type { Lang } from '@/lib/i18n';
import { cdict, type CDict } from '@/lib/citizen/i18n';
import { isTpl, newItem, type TplId } from '@/lib/citizen/model';
import { SEG, decodeShare, initial, isStep, load, save, type S, type Step } from '@/lib/citizen/store';
import { captureUtm, track } from '@/lib/analytics';
import { I, LangSwitch, Logo } from './ui';
import Namunalar from './steps/Namunalar';
import Konstruktor from './steps/Konstruktor';
import Buyurtma from './steps/Buyurtma';
import Rang from './steps/Rang';
import Narx from './steps/Narx';
import Hudud from './steps/Hudud';
import Ustalar from './steps/Ustalar';
import Tayyor from './steps/Tayyor';

export interface StepProps {
  t: CDict;
  lang: Lang;
  s: S;
  set: (fn: (s: S) => S) => void;
  go: (st: Step, extra?: Record<string, string>) => void;
  notify: (msg: string) => void;
}

const PREV: Partial<Record<Step, Step>> = { olcham: 'turi', buyurtma: 'turi', rang: 'buyurtma', narx: 'rang', hudud: 'narx', ustalar: 'hudud' };

function readUrl(): { q: Step; t?: TplId; m?: string; w?: number } {
  const p = new URLSearchParams(window.location.search);
  const q = p.get('q');
  const t = p.get('t');
  const w = Number(p.get('w'));
  return { q: isStep(q) ? q : 'turi', t: isTpl(t) ? t : undefined, m: p.get('m') ?? undefined, w: w > 0 ? w : undefined };
}

export default function Flow({ lang }: { lang: Lang }) {
  const t = cdict(lang);
  const [s, setS] = useState<S | null>(null);
  const [step, setStep] = useState<Step>('turi');
  const top = useRef<HTMLDivElement>(null);

  const set = useCallback((fn: (s: S) => S) => setS((prev) => { const n = fn(prev ?? initial); save(n); return n; }), []);

  const go = useCallback((st: Step, extra: Record<string, string> = {}) => {
    const p = new URLSearchParams({ q: st, ...extra });
    window.history.pushState({ q: st }, '', `?${p.toString()}`);
    window.dispatchEvent(new Event('rc:url'));
    setStep(st);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    track('step_view', { step: st });
  }, []);

  // старт: состояние из localStorage + параметры ссылки
  useEffect(() => {
    let st = load();
    const u = readUrl();
    captureUtm();
    let q = u.q;
    if (u.m) {
      const shared = decodeShare(u.m);
      if (shared) { st = { ...st, ...shared, sent: null }; q = 'narx'; }
    }
    if (q === 'olcham' && u.t) st = { ...st, draft: newItem(u.t, u.w), editId: null };
    if (q === 'olcham' && !st.draft) st = { ...st, draft: newItem('d2'), editId: null };
    if (['buyurtma', 'rang', 'narx', 'hudud', 'ustalar'].includes(q) && !st.items.length) q = st.draft ? 'olcham' : 'turi';
    if (q === 'tayyor' && !st.sent) q = st.items.length ? 'narx' : 'turi';
    if (q === 'ustalar' && !st.district) q = 'hudud';
    save(st);
    setS(st);
    setStep(q);
    window.history.replaceState({ q }, '', `?q=${q}`);
    window.dispatchEvent(new Event('rc:url'));
    track('step_view', { step: q });
    const onPop = () => {
      const r = readUrl();
      setStep(r.q);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const notify = useCallback((msg: string) => { toast.success(msg); }, []);

  const back = () => {
    const prev = PREV[step];
    if (!prev) { window.location.href = `/${lang}/`; return; }
    if (step === 'olcham' && s?.editId) { go('buyurtma'); return; }
    go(prev);
  };

  const seg = SEG[step];
  const props: StepProps | null = s ? { t, lang, s, set, go, notify } : null;

  return (
    <div className="rc rc-grid flex min-h-[100dvh] flex-col" ref={top}>
      {step !== 'tayyor' && (
        <div className="rc-top rc-noprint">
          <div className="rc-wrap flex items-center gap-6" style={{ paddingTop: 12, paddingBottom: 12 }}>
            <div className="hidden lg:block"><Logo lang={lang} /></div>
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex items-center justify-between lg:hidden">
                <button type="button" onClick={back} className="flex items-center gap-1.5" style={{ background: 'none', border: 0, padding: '6px 0', fontWeight: 600, fontSize: 16, cursor: 'pointer', minHeight: 40 }}>
                  {I.back(20)} {t.back}
                </button>
                <span className="rc-num" style={{ fontWeight: 600, fontSize: 14, color: 'var(--mute)' }}>{seg} / 5</span>
              </div>
              <div className="rc-seg" role="list" aria-label={`${seg} / 5`}>
                {t.steps.map((name, i) => (
                  <div key={name} role="listitem" className={`${i < seg ? 'on' : ''} ${i === seg - 1 ? 'cur' : ''}`} aria-current={i === seg - 1 ? 'step' : undefined}>
                    <span><span className="hidden lg:inline">{i + 1}. </span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hidden lg:block"><LangSwitch lang={lang} label={t.lang} /></div>
          </div>
        </div>
      )}
      <main id="main" className="flex flex-1 flex-col">
        {!props ? <div className="flex-1" aria-busy="true" /> : (
          <div key={step} className="flex flex-1 flex-col">
            {step === 'turi' && <Namunalar {...props} />}
            {step === 'olcham' && <Konstruktor {...props} />}
            {step === 'buyurtma' && <Buyurtma {...props} />}
            {step === 'rang' && <Rang {...props} />}
            {step === 'narx' && <Narx {...props} />}
            {step === 'hudud' && <Hudud {...props} />}
            {step === 'ustalar' && <Ustalar {...props} />}
            {step === 'tayyor' && <Tayyor {...props} />}
          </div>
        )}
      </main>
      <Toaster position="top-center" richColors={false} toastOptions={{ style: { background: '#1F9D5B', color: '#fff', border: 0, borderRadius: 14, fontFamily: 'inherit', fontWeight: 600, fontSize: 15 } }} />
    </div>
  );
}
