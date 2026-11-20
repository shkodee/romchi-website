'use client';
import { useEffect, useMemo, useState } from 'react';
import { REGIONS, getMasters, sendToMasters, type Master } from '@/lib/masters';
import { LINKS, type Dict, type Lang } from '@/lib/i18n';
import { track } from '@/lib/analytics';

type T = Dict['send'];

const fieldCls =
  'focus-ring h-[52px] w-full appearance-none rounded-2xl border-2 border-line bg-white pl-4 pr-11 text-base font-bold text-navy disabled:bg-grid disabled:text-muted';

/** +998 XX XXX XX XX — форматирование при вводе */
function fmtPhone(raw: string) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return { digits: d, text: p.length ? `+998 ${p.join(' ')}` : '' };
}

function Chevron() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted">
      <path d="M5 7.5l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Step({ n, title, done, children }: { n: number; title: string; done?: boolean; children: React.ReactNode }) {
  return (
    <section className="step-in flex flex-col gap-3">
      <h3 className="m-0 flex items-center gap-3 text-lg font-extrabold tracking-[-0.01em] text-navy">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${done ? 'bg-brand text-white' : 'bg-brand-soft text-brand-deep'}`}>
          {done ? (
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4"><path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          ) : n}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}

export default function SendToMasters({ t, lang, layout, summary, priceUzs }: {
  t: T; lang: Lang; layout: string; summary: string; priceUzs: string;
}) {
  const [regionId, setRegionId] = useState<number | ''>('');
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [masters, setMasters] = useState<Master[] | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [phone, setPhone] = useState({ digits: '', text: '' });
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const name = (x: { uz: string; ru: string }) => (lang === 'ru' ? x.ru : x.uz);
  const region = useMemo(() => REGIONS.find((r) => r.id === regionId), [regionId]);
  const district = region?.d.find((d) => d.id === districtId);

  useEffect(() => {
    setMasters(null);
    setPicked([]);
    if (districtId === '') return;
    let alive = true;
    getMasters(districtId).then((m) => { if (alive) { setMasters(m); setPicked(m.map((x) => x.id)); } });
    return () => { alive = false; };
  }, [districtId]);

  const canSend = districtId !== '' && picked.length > 0 && phone.digits.length === 9 && state !== 'sending';
  const demoOnly = masters?.every((m) => m.demo) ?? false;

  const send = async () => {
    if (!canSend || typeof districtId !== 'number') return;
    setState('sending');
    track('masters_send', { district: districtId, masters: picked.length });
    try {
      await sendToMasters({ districtId, masterIds: picked, phone: `+998${phone.digits}`, layout, lang, priceUzs });
      setState('done');
    } catch {
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div id="ustalar" className="step-in flex flex-col gap-5 rounded-[28px] bg-brand-deep p-6 text-white sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-white/15">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="m-0 text-[28px] font-extrabold leading-tight tracking-[-0.02em]">{t.doneTitle}</h2>
          <p className="m-0 max-w-[52ch] text-[15px] leading-relaxed text-[#DCE8FF]">{t.doneText}</p>
          <p className="m-0 text-sm font-bold text-[#DCE8FF]">{summary} · {district ? name(district) : ''}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a href={LINKS.appStore} onClick={() => track('download_click', { store: 'ios', from: 'masters' })}
            className="focus-ring flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-6 text-base font-extrabold text-brand-deep no-underline">App Store</a>
          <a href={LINKS.googlePlay} onClick={() => track('download_click', { store: 'android', from: 'masters' })}
            className="focus-ring flex min-h-[52px] items-center justify-center rounded-2xl bg-white px-6 text-base font-extrabold text-brand-deep no-underline">Google Play</a>
        </div>
      </div>
    );
  }

  return (
    <div id="ustalar" className="flex flex-col gap-6 rounded-[28px] bg-white p-5 shadow-card sm:p-8">
      <div className="flex flex-col gap-1.5">
        <h2 className="m-0 text-[26px] font-extrabold leading-tight tracking-[-0.02em] text-navy sm:text-[30px]">{t.title}</h2>
        <p className="m-0 max-w-[60ch] text-[15px] leading-relaxed text-muted">{t.sub}</p>
      </div>

      <Step n={1} title={t.where} done={districtId !== ''}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-bold text-[#3B4558]">
            {t.region}
            <span className="relative">
              <select className={fieldCls} value={regionId}
                onChange={(e) => { const v = e.target.value ? Number(e.target.value) : ''; setRegionId(v); setDistrictId(''); if (v) track('masters_region', { region: v }); }}>
                <option value="">{t.pickRegion}</option>
                {REGIONS.map((r) => <option key={r.id} value={r.id}>{name(r)}</option>)}
              </select>
              <Chevron />
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-bold text-[#3B4558]">
            {t.district}
            <span className="relative">
              <select className={fieldCls} value={districtId} disabled={!region}
                onChange={(e) => { const v = e.target.value ? Number(e.target.value) : ''; setDistrictId(v); if (v) track('masters_district', { district: v }); }}>
                <option value="">{region ? t.pickDistrict : t.pickRegionFirst}</option>
                {region?.d.map((d) => <option key={d.id} value={d.id}>{name(d)}</option>)}
              </select>
              <Chevron />
            </span>
          </label>
        </div>
      </Step>

      {districtId !== '' && (
        <Step n={2} title={t.masters} done={picked.length > 0 && masters !== null}>
          {masters === null ? (
            <div className="grid gap-2.5 sm:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-[76px] animate-pulse rounded-2xl bg-grid" />)}
            </div>
          ) : (
            <>
              {demoOnly && <p className="m-0 rounded-xl bg-cream px-4 py-3 text-[13px] leading-snug text-[#6B4E00]">{t.demoNote}</p>}
              <div className="grid gap-2.5 sm:grid-cols-3" role="group" aria-label={t.masters}>
                {masters.map((m) => {
                  const on = picked.includes(m.id);
                  return (
                    <button key={m.id} type="button" aria-pressed={on}
                      onClick={() => setPicked((p) => (on ? p.filter((x) => x !== m.id) : [...p, m.id]))}
                      className={`master-card focus-ring flex min-h-[76px] items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition-[border-color,background-color] duration-150 ${on ? 'border-brand bg-[#F2F8FF]' : 'border-line bg-white'}`}>
                      <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-grid text-muted">
                        <svg viewBox="0 0 24 24" className="h-5 w-5"><circle cx="12" cy="8.5" r="3.8" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M4.5 20c1.4-3.6 4.2-5.4 7.5-5.4s6.1 1.8 7.5 5.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <b className="truncate text-[15px] text-navy">{m.name}</b>
                        <span className="truncate text-[13px] text-muted">{district ? name(district) : ''}</span>
                      </span>
                      <span aria-hidden="true" className={`grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${on ? 'border-brand bg-brand' : 'border-line bg-white'}`}>
                        {on && <svg viewBox="0 0 20 20" className="h-4 w-4"><path d="M5 10.5l3.2 3.2L15 7" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </Step>
      )}

      {districtId !== '' && masters !== null && (
        <Step n={3} title={t.contact} done={phone.digits.length === 9}>
          <label className="flex flex-col gap-1.5 text-sm font-bold text-[#3B4558]">
            {t.phone}
            <input type="tel" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" value={phone.text}
              onChange={(e) => setPhone(fmtPhone(e.target.value))}
              className="focus-ring h-[52px] w-full rounded-2xl border-2 border-line bg-white px-4 text-lg font-bold tabular-nums text-navy" />
          </label>
          <div className="flex flex-col gap-1 rounded-2xl bg-grid px-4 py-3 text-sm text-[#3B4558]">
            <span>{t.youSend}</span>
            <b className="text-navy">{summary}</b>
            <span>{t.approx}: <b className="text-brand">{priceUzs} {lang === 'ru' ? 'сум' : 'soʻm'}</b></span>
          </div>
          <button type="button" onClick={send} disabled={!canSend}
            className="send-btn focus-ring min-h-[56px] rounded-2xl bg-brand px-6 text-[17px] font-extrabold text-white transition-[transform,background-color,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-45">
            {state === 'sending' ? t.sending : t.send}
          </button>
          {state === 'error' && <p role="alert" className="m-0 text-sm font-bold text-[#B42318]">{t.error}</p>}
          <p className="m-0 text-[13px] leading-snug text-muted">{t.privacy}</p>
        </Step>
      )}
    </div>
  );
}
