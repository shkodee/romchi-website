'use client';
import { forwardRef } from 'react';
import { COLORS, archRadius, tplById, type DemoState, type OpenType } from '@/lib/demo/calc';

const r1 = (n: number) => Math.round(n * 10) / 10;

interface Props {
  s: DemoState;
  ariaLabel: string;
  onCycle?: (i: number) => void;
  typeNames: Record<OpenType, string>;
}

/** 2D-чертёж в стиле приложения: рама, створки C1/F1, линии открывания, размеры */
const Drawing = forwardRef<SVGSVGElement, Props>(function Drawing({ s, ariaLabel, onCycle, typeNames }, ref) {
  const t = tplById(s.tpl);
  const C = COLORS[s.col];
  const { W, H } = s;
  const archR = archRadius(t, W, H);
  const AW = 340, AH = 290;
  const k = Math.min(AW / W, AH / H);
  const ws = W * k, hs = H * k;
  const ox = 80 + (AW - ws) / 2, oy = 14 + (AH - hs) / 2, rs = archR * k;
  const n = t.parts.length;

  const outline = t.arch
    ? `M${r1(ox)},${r1(oy + rs)} A${r1(ws / 2)},${r1(rs)} 0 0 1 ${r1(ox + ws)},${r1(oy + rs)} L${r1(ox + ws)},${r1(oy + hs)} L${r1(ox)},${r1(oy + hs)} Z`
    : `M${r1(ox)},${r1(oy)} H${r1(ox + ws)} V${r1(oy + hs)} H${r1(ox)} Z`;
  const archGlass =
    t.arch && rs > 14
      ? `M${r1(ox + 10)},${r1(oy + rs - 4)} A${r1(ws / 2 - 10)},${r1(rs - 10)} 0 0 1 ${r1(ox + ws - 10)},${r1(oy + rs - 4)} Z`
      : null;

  let cx = ox, nC = 0, nF = 0;
  const parts = t.parts.map((p, i) => {
    const pw = p.f * ws, py = oy + rs, ph = p.h * (hs - rs);
    const ty = s.types[i] ?? 'fix';
    const open = ty !== 'fix';
    const sash = { x: cx + 6, y: py + 6, w: Math.max(4, pw - 12), h: Math.max(4, ph - 12) };
    const ins = open ? 9 : 2;
    const g = { x: r1(sash.x + ins), y: r1(sash.y + ins), w: r1(Math.max(4, sash.w - ins * 2)), h: r1(Math.max(4, sash.h - ins * 2)) };
    const apexRight = n === 1 ? true : i < n / 2;
    const ax = apexRight ? g.x + g.w : g.x, bx = apexRight ? g.x : g.x + g.w;
    const pts = ty === 'turn' || ty === 'turntilt' ? `${bx},${g.y} ${r1(ax)},${r1(g.y + g.h / 2)} ${bx},${r1(g.y + g.h)}` : '';
    const pts2 = ty === 'tilt' || ty === 'turntilt' ? `${g.x},${r1(g.y + g.h)} ${r1(g.x + g.w / 2)},${g.y} ${r1(g.x + g.w)},${r1(g.y + g.h)}` : '';
    const label = open ? `C${++nC}` : `F${++nF}`;
    const hasHandle = ty === 'turn' || ty === 'turntilt';
    const hx = apexRight ? sash.x + sash.w - 7.5 : sash.x + 1.5;
    const out = {
      i, ty, open, sash, g, pts, pts2, label, hasHandle, hx: r1(hx), hy: r1(sash.y + sash.h / 2 - 11),
      panel: p.h < 1 ? { x: r1(cx + 6), y: r1(py + ph + 6), w: r1(Math.max(4, pw - 12)), h: r1(Math.max(0, hs - rs - ph - 12)) } : null,
      dim: n > 1 ? { x1: r1(cx), x2: r1(cx + pw), t: Math.round(p.f * W) } : null,
    };
    cx += pw;
    return out;
  });

  const dimY = oy + hs + 22;
  const hy = oy + hs + (n > 1 ? 56 : 26);
  const vtx = r1(ox - 34), vty = r1(oy + hs / 2);

  return (
    <svg ref={ref} viewBox="0 0 460 420" role="img" aria-label={ariaLabel} className="h-auto max-h-[480px] w-full select-none" style={{ fontFamily: 'Manrope, sans-serif' }}>
      <path d={outline} fill={C.c} stroke={C.st} strokeWidth={1} />
      {parts.map((p) => (
        <g key={p.i}>
          <rect x={r1(p.sash.x)} y={r1(p.sash.y)} width={r1(p.sash.w)} height={r1(p.sash.h)} fill={p.open ? C.sash : C.c} stroke={C.st} strokeWidth={1} />
          {p.panel && <rect x={p.panel.x} y={p.panel.y} width={p.panel.w} height={p.panel.h} fill={C.panel} stroke={C.st} strokeWidth={1} />}
          <rect
            x={p.g.x} y={p.g.y} width={p.g.w} height={p.g.h}
            fill="#4DD0FF"
            className={onCycle ? 'cursor-pointer transition-[fill] hover:fill-[#7BDCFF] focus:outline-none focus-visible:fill-[#7BDCFF]' : ''}
            onClick={onCycle ? () => onCycle(p.i) : undefined}
            onKeyDown={onCycle ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCycle(p.i); } } : undefined}
            tabIndex={onCycle ? 0 : undefined}
            role={onCycle ? 'button' : undefined}
            aria-label={onCycle ? `${p.label}: ${typeNames[p.ty]}` : undefined}
          />
          {p.pts && <polyline points={p.pts} fill="none" stroke="#1E2BE6" strokeWidth={1} pointerEvents="none" />}
          {p.pts2 && <polyline points={p.pts2} fill="none" stroke="#1E2BE6" strokeWidth={1} pointerEvents="none" />}
          {p.hasHandle && <rect x={p.hx} y={p.hy} width={6} height={22} rx={2} fill="#2A2E35" stroke="#0B0D10" strokeWidth={0.8} />}
          <text x={r1(p.g.x + p.g.w / 2)} y={r1(p.g.y + p.g.h / 2 + 5)} textAnchor="middle" fontSize={13} fontWeight={800} fill="#0B1530" opacity={0.75} pointerEvents="none">
            {p.label}
          </text>
          {p.dim && (
            <g stroke="#0B1530" strokeWidth={1.2}>
              <line x1={p.dim.x1} y1={dimY} x2={p.dim.x2} y2={dimY} />
              <line x1={p.dim.x1} y1={dimY - 6} x2={p.dim.x1} y2={dimY + 6} />
              <line x1={p.dim.x2} y1={dimY - 6} x2={p.dim.x2} y2={dimY + 6} />
              <text x={r1((p.dim.x1 + p.dim.x2) / 2)} y={r1(dimY - 5)} textAnchor="middle" fontSize={12} fontWeight={800} fill="#0B1530" stroke="none">{p.dim.t}</text>
            </g>
          )}
        </g>
      ))}
      {archGlass && <path d={archGlass} fill="#4DD0FF" />}
      <g stroke="#0B1530" strokeWidth={1.2}>
        <line x1={r1(ox)} y1={r1(hy)} x2={r1(ox + ws)} y2={r1(hy)} />
        <line x1={r1(ox)} y1={r1(hy - 7)} x2={r1(ox)} y2={r1(hy + 7)} />
        <line x1={r1(ox + ws)} y1={r1(hy - 7)} x2={r1(ox + ws)} y2={r1(hy + 7)} />
        <text x={r1(ox + ws / 2)} y={r1(hy - 6)} textAnchor="middle" fontSize={12} fontWeight={800} fill="#0B1530" stroke="none">{W}</text>
        <line x1={r1(ox - 22)} y1={r1(oy)} x2={r1(ox - 22)} y2={r1(oy + hs)} />
        <line x1={r1(ox - 30)} y1={r1(oy)} x2={r1(ox - 14)} y2={r1(oy)} />
        <line x1={r1(ox - 30)} y1={r1(oy + hs)} x2={r1(ox - 14)} y2={r1(oy + hs)} />
        <text x={vtx} y={vty} transform={`rotate(-90 ${vtx} ${vty})`} textAnchor="middle" fontSize={12} fontWeight={800} fill="#0B1530" stroke="none">{H}</text>
      </g>
    </svg>
  );
});

export default Drawing;
