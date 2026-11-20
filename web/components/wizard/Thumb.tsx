import { tplById, type TplId } from '@/lib/demo/calc';

/** Мини-картинка типа окна для карточек первого экрана */
export default function Thumb({ id, className = '' }: { id: TplId; className?: string }) {
  const t = tplById(id);
  const box = 100;
  const k = Math.min(84 / t.W, 84 / t.H);
  const w = t.W * k, h = t.H * k;
  const x0 = (box - w) / 2, y0 = (box - h) / 2;
  const r = t.arch ? Math.min(w / 2, h * 0.35) : 0;
  const frame = '#2B3442';
  let cx = x0;
  return (
    <svg viewBox={`0 0 ${box} ${box}`} className={className} aria-hidden="true">
      {t.arch ? (
        <path d={`M${x0},${y0 + r} A${w / 2},${r} 0 0 1 ${x0 + w},${y0 + r} V${y0 + h} H${x0} Z`} fill={frame} />
      ) : (
        <rect x={x0} y={y0} width={w} height={h} rx={1.5} fill={frame} />
      )}
      {t.arch && <path d={`M${x0 + 3},${y0 + r} A${w / 2 - 3},${r - 3} 0 0 1 ${x0 + w - 3},${y0 + r} Z`} fill="#7FDBFF" />}
      {t.parts.map((p, i) => {
        const pw = p.f * w;
        const ph = p.h * (h - r);
        const g = { x: cx + 2.6, y: y0 + r + 2.6, w: pw - 5.2, h: ph - 5.2 };
        const open = (t.def[i] ?? 'fix') !== 'fix';
        const el = (
          <g key={i}>
            <rect x={g.x} y={g.y} width={g.w} height={g.h} fill="#7FDBFF" />
            {open && (
              <polyline points={`${g.x},${g.y} ${g.x + g.w},${g.y + g.h / 2} ${g.x},${g.y + g.h}`} fill="none" stroke="#0A4FD0" strokeWidth={0.9} />
            )}
            {p.h < 1 && <rect x={cx + 2.6} y={y0 + r + ph + 2.6} width={pw - 5.2} height={h - r - ph - 5.2} fill="#5A6576" />}
          </g>
        );
        cx += pw;
        return el;
      })}
    </svg>
  );
}
