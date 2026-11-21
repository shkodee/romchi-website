'use client';
import { useMemo, useState } from 'react';
import { REGIONS } from '@/lib/masters';
import { track } from '@/lib/analytics';
import { I } from '../ui';
import type { StepProps } from '../Flow';

/** Центры областей (столицы), для «Joylashuvimni aniqlash»: берём ближайшую область, туман человек выбирает сам */
const CENTERS: [number, number, number][] = [
  [1726, 41.311, 69.28], [1727, 41.04, 69.36], [1703, 40.783, 72.344], [1706, 39.767, 64.423], [1730, 40.386, 71.786],
  [1708, 40.116, 67.842], [1714, 40.998, 71.672], [1712, 40.103, 65.374], [1710, 38.861, 65.789], [1735, 42.461, 59.61],
  [1718, 39.654, 66.959], [1724, 40.49, 68.78], [1722, 37.224, 67.278], [1733, 41.55, 60.631],
];

export default function Hudud({ t, lang, s, set, go }: StepProps) {
  const [q, setQ] = useState('');
  const [geo, setGeo] = useState<'idle' | 'busy' | 'fail'>('idle');
  const name = (x: { uz: string; ru: string }) => (lang === 'ru' ? x.ru : x.uz);
  const region = REGIONS.find((r) => r.id === s.region);
  const district = region?.d.find((d) => d.id === s.district);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (region?.d ?? []).filter((d) => !k || d.uz.toLowerCase().includes(k) || d.ru.toLowerCase().includes(k));
  }, [region, q]);

  const locate = () => {
    if (!navigator.geolocation) { setGeo('fail'); return; }
    setGeo('busy');
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: la, longitude: lo } }) => {
        let best = CENTERS[0], bd = Infinity;
        for (const c of CENTERS) { const d = (c[1] - la) ** 2 + ((c[2] - lo) * Math.cos((la * Math.PI) / 180)) ** 2; if (d < bd) { bd = d; best = c; } }
        if (bd > 4) { setGeo('fail'); return; } // дальше ~200 км от любой столицы — не в Узбекистане
        set((st) => ({ ...st, region: best[0], district: st.region === best[0] ? st.district : null }));
        setGeo('idle');
        track('geo_ok', { region: best[0] });
      },
      () => setGeo('fail'),
      { timeout: 10000, maximumAge: 600000 },
    );
  };

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-[640px] lg:py-6">
      <div className="flex items-center justify-center" style={{ padding: '26px 16px 40px' }}>
        <div className="rc-plate rc-pop" style={{ ['--r' as string]: '0deg', minWidth: 260, maxWidth: '100%' }} aria-live="polite">
          <div className="flex items-center gap-3" style={{ padding: '10px 18px 10px 14px' }}>
            {I.pin(26)}
            <div className="min-w-0">
              <div style={{ fontWeight: 700, fontSize: 17, letterSpacing: '.02em', textTransform: 'uppercase', lineHeight: 1.2 }}>{district ? name(district) : t.district}</div>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.92 }}>{region ? name(region) : t.chooseRegion}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="rc-sheet flex flex-1 flex-col gap-4" style={{ padding: '20px 18px 0' }}>
        <div>
          <h1 className="rc-disp" style={{ margin: 0, fontSize: 22 }}>{t.hTitle}</h1>
          <p className="rc-hint" style={{ margin: '4px 0 0' }}>{t.hSub}</p>
        </div>
        <button type="button" className="rc-ghost" onClick={locate} disabled={geo === 'busy'} style={{ color: 'var(--ink)' }}>
          <span style={{ color: 'var(--blue)', display: 'flex' }}>{I.locate()}</span>{geo === 'busy' ? t.geoBusy : t.geo}
        </button>
        {geo === 'fail' && <p role="status" className="rc-hint" style={{ margin: '-6px 0 0', color: '#B4231B' }}>{t.geoFail}</p>}
        <label className="flex flex-col gap-1.5">
          <span className="rc-lbl">{t.region}</span>
          <span className="rc-field relative">
            <select value={s.region ?? ''} onChange={(e) => { set((st) => ({ ...st, region: Number(e.target.value) || null, district: null })); setQ(''); }} style={{ appearance: 'none', fontWeight: 600, cursor: 'pointer' }}>
              <option value="" disabled>{t.chooseRegion}</option>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{name(r)}</option>)}
            </select>
            <span style={{ pointerEvents: 'none', color: 'var(--mute)', display: 'flex' }}>{I.chev()}</span>
          </span>
        </label>
        {region && (
          <div className="flex flex-col gap-1.5">
            <label className="flex flex-col gap-1.5">
              <span className="rc-lbl">{t.district}</span>
              <span className="rc-field">
                <span style={{ color: 'var(--mute)', display: 'flex' }}>{I.search()}</span>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.districtSearch} autoComplete="off" />
              </span>
            </label>
            <ul className="m-0 list-none overflow-hidden p-0" role="radiogroup" aria-label={t.district} style={{ border: '1.5px solid var(--line2)', borderRadius: 14, maxHeight: 290, overflowY: 'auto', background: 'var(--card)' }}>
              {list.map((d) => {
                const on = s.district === d.id;
                return (
                  <li key={d.id}>
                    <button type="button" role="radio" aria-checked={on} onClick={() => set((st) => ({ ...st, district: d.id, masters: [] }))}
                      className="flex w-full items-center justify-between gap-3 text-left"
                      style={{ minHeight: 52, padding: '0 14px', border: 0, borderBottom: '1px solid var(--line2)', background: on ? 'var(--soft)' : 'transparent', fontWeight: on ? 700 : 500, fontSize: 16, cursor: 'pointer' }}>
                      {name(d)}
                      <span className={`rc-radio ${on ? 'on' : ''}`}>{on && I.check(14)}</span>
                    </button>
                  </li>
                );
              })}
              {!list.length && <li className="rc-hint" style={{ padding: 14 }}>{t.noDistrict}</li>}
            </ul>
          </div>
        )}
        <div className="rc-bottom" style={{ margin: 'auto -18px 0' }}>
          <button type="button" className="rc-cta" disabled={!s.district} onClick={() => { track('district_pick', { district: s.district ?? 0 }); go('ustalar'); }}>{t.seeMasters} {I.arrow()}</button>
        </div>
      </div>
    </div>
  );
}
