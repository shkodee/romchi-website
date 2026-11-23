'use client';
import { useEffect, useState } from 'react';
import { REGIONS, getMasters, sendToMasters, type Master } from '@/lib/masters';
import { encodeShare } from '@/lib/citizen/store';
import { track } from '@/lib/analytics';
import { I } from '../ui';
import type { StepProps } from '../Flow';

/** +998 XX XXX XX XX */
export function fmtPhone(raw: string) {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('998')) d = d.slice(3);
  d = d.slice(0, 9);
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return { digits: d, text: p.join(' ') };
}

const utm = (): Record<string, string> => {
  try { return JSON.parse(sessionStorage.getItem('rc-utm') ?? '{}'); } catch { return {}; }
};

export default function Ustalar({ t, lang, s, set, go }: StepProps) {
  const [masters, setMasters] = useState<Master[] | null>(null);
  const [state, setState] = useState<'idle' | 'sending' | 'error'>('idle');
  const [touched, setTouched] = useState(false);
  const name = (x: { uz: string; ru: string }) => (lang === 'ru' ? x.ru : x.uz);
  const region = REGIONS.find((r) => r.id === s.region);
  const district = region?.d.find((d) => d.id === s.district);
  const phone = fmtPhone(s.phone);
  const phoneOk = phone.digits.length === 9;

  useEffect(() => {
    if (!s.district) return;
    let off = false;
    getMasters(s.district).then((m) => { if (!off) setMasters(m); }).catch(() => !off && setMasters([]));
    return () => { off = true; };
  }, [s.district]);

  if (!district || !region) return null;
  const picked = s.masters.filter((id) => masters?.some((m) => m.id === id));
  const demo = masters?.some((m) => m.demo);

  const send = async () => {
    setTouched(true);
    if (!phoneOk || !picked.length) return;
    setState('sending');
    try {
      const r = await sendToMasters({ districtId: district.id, masterIds: picked, phone: `+998${phone.digits}`, layout: encodeShare(s), lang, utm: utm() });
      track('Lead', { district: district.id, masters: picked.length, demo: r === 'demo' });
      set((st) => ({ ...st, sent: { date: new Date().toISOString(), demo: r === 'demo', masters: picked.length } }));
      go('tayyor');
    } catch {
      setState('error');
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="rc-wrap flex flex-1 flex-col gap-3" style={{ paddingTop: 18, paddingBottom: 16, maxWidth: 640 }}>
        <div>
          <h1 className="rc-disp" style={{ margin: 0, fontSize: 22 }}>{t.uTitle}</h1>
          <p className="flex items-center gap-1.5" style={{ margin: '4px 0 0', fontSize: 14, color: 'var(--mute)' }}><span style={{ color: 'var(--blue)', display: 'flex' }}>{I.pin(16)}</span>{name(district)}, {name(region)}</p>
        </div>
        {demo && <p className="rc-note" style={{ margin: 0 }}><span style={{ display: 'flex', marginTop: 1 }}>{I.info(18)}</span>{t.demoNote}</p>}
        {!masters ? (
          <div className="flex flex-col gap-2.5" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="rc-card" style={{ height: 72, opacity: 0.6 }} />)}</div>
        ) : (
          <ul className="rc-stag m-0 flex list-none flex-col gap-2.5 p-0" role="group" aria-label={t.uTitle}>
            {masters.map((m) => {
              const on = s.masters.includes(m.id);
              return (
                <li key={m.id}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => set((st) => ({ ...st, masters: on ? st.masters.filter((x) => x !== m.id) : [...st.masters, m.id] }))}
                    className="flex w-full items-center gap-3 text-left"
                    style={{ minHeight: 72, padding: '10px 14px', borderRadius: 16, cursor: 'pointer', background: on ? 'var(--soft)' : 'var(--card)', border: on ? '2px solid #0077FF' : '1.5px solid var(--line2)', boxShadow: 'var(--shadow)', transition: 'background-color .15s, border-color .15s' }}>
                    <span className="flex flex-none items-center justify-center" style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--field)', color: 'var(--mute)' }} aria-hidden="true">{I.split(24)}</span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex flex-wrap items-center gap-2"><b style={{ fontSize: 16 }}>{m.name}</b>{m.demo && <span className="rc-demo">{t.demoTag}</span>}</span>
                      <span style={{ fontSize: 13.5, color: 'var(--mute)' }}>{t.worksIn(name(district))}</span>
                    </span>
                    <span className={`rc-check ${on ? 'on' : ''}`}>{on && I.check(16)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        <label className="flex flex-col gap-1.5" style={{ marginTop: 8 }}>
          <span className="rc-lbl">{t.phone}</span>
          <span className="rc-field">
            <span style={{ color: 'var(--mute)', display: 'flex' }}>{I.phone()}</span>
            <b className="rc-num" style={{ fontSize: 17 }}>+998</b>
            <input type="tel" inputMode="tel" autoComplete="tel-national" placeholder="90 123 45 67" value={phone.text} className="rc-num"
              onChange={(e) => set((st) => ({ ...st, phone: fmtPhone(e.target.value).digits }))} onBlur={() => setTouched(true)}
              aria-invalid={touched && !phoneOk} aria-describedby="phone-note" style={{ fontWeight: 600, letterSpacing: '.02em' }} />
          </span>
          {touched && !phoneOk
            ? <span id="phone-note" role="alert" style={{ fontSize: 13.5, color: '#B4231B' }}>{t.phoneBad}</span>
            : <span id="phone-note" className="flex items-center gap-1.5" style={{ fontSize: 13.5, color: 'var(--mute)' }}><span style={{ color: 'var(--success)', display: 'flex' }}>{I.shield()}</span>{t.phoneNote}</span>}
        </label>
        {state === 'error' && <p role="alert" style={{ margin: 0, color: '#B4231B', fontSize: 14 }}>{t.sendFail}</p>}
      </div>
      <div className="rc-bottom">
        <div style={{ maxWidth: 608, margin: '0 auto' }}>
          <button type="button" className="rc-cta" disabled={!picked.length || state === 'sending'} onClick={send}>
            {state === 'sending' ? t.sending : t.sendTo(picked.length)} {state !== 'sending' && I.arrow()}
          </button>
        </div>
      </div>
    </div>
  );
}
