'use client';
import { useRef, useState } from 'react';
import { COLOR_NAMES, area, fmtArea } from '@/lib/citizen/model';
import { colorSummary, encodeShare, itemCol } from '@/lib/citizen/store';
import { logoSvgString } from '@/lib/brand';
import { track } from '@/lib/analytics';
import WindowDrawing from '../WindowDrawing';
import View3D from '../View3D';
import ItemTabs from '../ItemTabs';
import { Balls, I, useDark, useMedia } from '../ui';
import type { StepProps } from '../Flow';

const esc = (x: string) => x.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));

export default function Narx({ t, lang, s, go, notify }: StepProps) {
  const dark = useDark();
  const isDesk = useMedia('(min-width: 1024px)');
  const [show3d, setShow3d] = useState(false);
  const draw = useRef<HTMLDivElement>(null);
  const [selId, setSelId] = useState('');
  const it = s.items.find((x) => x.id === selId) ?? s.items[0];
  if (!it) return null;
  const m2 = fmtArea(s.items.reduce((a, x) => a + area(x) * x.qty, 0));
  const many = s.items.length > 1;
  const profile = `${t.lvl[s.lvl][0]}${s.brand ? ` · ${s.brand}` : ''}`;
  const rows: [string, string, () => void][] = [
    [many ? t.rowItems : t.rowType, many ? t.pcs(s.items.reduce((a, x) => a + x.qty, 0)) : t.tpl[it.tpl], () => go(many ? 'buyurtma' : 'turi')],
    ...(!many ? [[t.rowSize, `${it.W} × ${it.H} ${t.cm}`, () => go('buyurtma')] as [string, string, () => void]] : []),
    [t.rowColor, colorSummary(s, t.colorsN), () => go('rang')],
    [t.rowProfile, profile, () => go('rang')],
  ];

  const share = async () => {
    const url = `${window.location.origin}/${lang}/maket/?m=${encodeShare(s)}`;
    track('share', { items: s.items.length });
    try {
      if (navigator.share) { await navigator.share({ title: 'Romchi', text: `${t.pdfTitle} · ${m2} m²`, url }); return; }
    } catch { /* отмена */ return; }
    try { await navigator.clipboard.writeText(url); notify(t.copied); } catch { window.prompt(t.share, url); }
  };

  const pdf = () => {
    track('pdf', { items: s.items.length });
    const svg = (draw.current?.querySelector('svg')?.outerHTML ?? '').replace(/href="\/colors\//g, `href="${window.location.origin}/colors/`);
    const list = s.items.map((x) => `<tr><td>${esc(t.tpl[x.tpl])}</td><td>${x.W} × ${x.H} ${t.cm}</td><td>${x.qty}</td><td>${esc(COLOR_NAMES[itemCol(x, s) ?? 'oq'])}</td></tr>`).join('');
    const dt = new Date();
    const date = `${String(dt.getDate()).padStart(2, '0')}.${String(dt.getMonth() + 1).padStart(2, '0')}.${dt.getFullYear()}`;
    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(t.pdfTitle)}</title>
<style>@page{size:A4;margin:16mm}body{font-family:Arial,sans-serif;color:#0B1530;margin:0}.logo{font-weight:800;font-size:26px;letter-spacing:-.04em;margin-bottom:14px}.logo b{background:#0077FF;color:#fff;border-radius:7px;padding:0 6px 2px}
h1{font-size:20px;margin:0 0 4px}.m{color:#56627A;font-size:13px;margin:0 0 16px}.svg{background:#F3F6FC;border-radius:14px;padding:24px;margin-bottom:16px;text-align:center}.svg svg{max-width:100%;height:auto;max-height:300px}
table{width:100%;border-collapse:collapse;font-size:14px;margin-bottom:14px}td{padding:8px 0;border-bottom:1px solid #E1E8F4}.lbl{font-size:12px;font-weight:700;letter-spacing:.08em;color:#56627A}.tot{font-size:30px;font-weight:800;margin:4px 0 0}</style></head>
<body><div class="logo">${logoSvgString(30)}</div><h1>${esc(t.pdfTitle)}</h1><p class="m">${date} · ${esc(colorSummary(s, t.colorsN))} · ${esc(profile)}</p>
<div class="svg">${svg}</div><table>${list}</table><div class="lbl">${esc(t.areaLbl)}</div><div class="tot">${m2} m²</div></body></html>`;
    const fr = document.createElement('iframe');
    fr.setAttribute('aria-hidden', 'true');
    fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
    document.body.appendChild(fr);
    const d = fr.contentWindow!.document;
    d.open(); d.write(html); d.close();
    setTimeout(() => { fr.contentWindow!.focus(); fr.contentWindow!.print(); setTimeout(() => fr.remove(), 1500); }, 400);
  };

  return (
    <div className="flex flex-1 flex-col lg:mx-auto lg:w-full lg:max-w-[1100px] lg:flex-row lg:items-start lg:gap-8 lg:px-10 lg:py-8">
      <div className="relative flex flex-col items-center justify-center gap-4 lg:flex-1" style={{ minHeight: isDesk ? 480 : 260, padding: isDesk ? '24px 16px' : '24px 16px 70px' }}>
        <Balls items={[{ c: 'y', s: 22, style: { left: '10%', top: '22%' } }, { c: 'b', s: 46, style: { right: '8%', top: '14%' }, f: 2 }]} />
        <div ref={draw} className="rc-reveal" style={{ filter: 'drop-shadow(0 18px 22px rgba(11,21,48,.22))', animationDelay: '0s' }}>
          <WindowDrawing shape={it} maxW={isDesk ? 420 : 260} maxH={isDesk ? 340 : 170} color={itemCol(it, s)} dark={dark} labels title={`${t.tpl[it.tpl]}, ${it.W} × ${it.H} ${t.cm}`} />
        </div>
        <ItemTabs t={t} s={s} sel={it.id} onSel={setSelId} dark={dark} />
      </div>
      <div className="relative flex flex-1 flex-col lg:max-w-[480px]">
        <div className="rc-fcard rc-price rc-shine rc-pop rc-narx-price" style={{ position: 'relative', ['--r' as string]: '-2deg', zIndex: 2, padding: '14px 18px', borderRadius: 18, animation: 'rcPop .55s var(--e-spring) .2s both' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.06em', color: '#5A3D00' }}>{t.areaLbl}</div>
          <div className="rc-disp rc-num" style={{ fontSize: 'clamp(28px, 8vw, 36px)', lineHeight: 1.15 }}>{m2} <span style={{ fontSize: 16 }}>m²</span></div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#5A3D00', marginTop: 2 }}>{t.measureNote}</div>
        </div>
        <div className="rc-sheet flex flex-1 flex-col" style={{ padding: '40px 18px 0', marginTop: -30 }}>
          <dl className="m-0 flex flex-col">
            {rows.map(([k, v, fn]) => (
              <div key={k} className="rc-row">
                <dt style={{ color: 'var(--ink2)', fontSize: 15 }}>{k}</dt>
                <dd className="m-0 flex items-center gap-3 text-right">
                  <b style={{ fontSize: 15.5 }}>{v}</b>
                  <button type="button" className="rc-link" style={{ fontSize: 14, minHeight: 40 }} onClick={fn} aria-label={`${k}: ${t.change}`}>{t.change}</button>
                </dd>
              </div>
            ))}
          </dl>
          <div className="rc-bottom flex flex-col gap-2.5" style={{ margin: 'auto -18px 0', paddingTop: 24 }}>
            <button type="button" className="rc-cta" onClick={() => { track('maket_cta', { m2 }); go('hudud'); }}>{t.toMasters} {I.arrow()}</button>
            <div className="grid grid-cols-3 gap-2">
              <button type="button" className="rc-ghost" onClick={() => { setShow3d(true); track('view_3d', { from: 'narx' }); }}>{I.play()} 3D</button>
              <button type="button" className="rc-ghost" onClick={pdf}>{I.file()} {t.pdf}</button>
              <button type="button" className="rc-ghost" onClick={share}>{I.share()} {t.share}</button>
            </div>
          </div>
        </div>
      </div>
      {show3d && <View3D t={t} item={it} col={itemCol(it, s)} onClose={() => setShow3d(false)} />}
    </div>
  );
}
