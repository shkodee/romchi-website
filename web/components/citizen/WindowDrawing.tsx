'use client';
// Окно/дверь «как в приложении Romchi» (DESIGN.md → «Окно и дверь»).
// Один SVG с viewBox в пикселях: рама залита текстурой цвета (pattern) или цветом,
// стекло #80D4EC, линии открывания #1F4FD8, ручка, петли, подписи C/F поверх (HTML).
import { useId, type CSSProperties } from 'react';
import { colWidths, tpl, type Col, type Open, type TplId, type Uzor } from '@/lib/citizen/model';

export const GLASS = '#80D4EC';
export const OPEN_LINE = '#1F4FD8';

export interface Shape { tpl: TplId; W: number; H: number; cols: Col[]; uzor?: Uzor }

/** Размер чертежа (px), вписанный в коробку maxW×maxH */
export function fit(s: Pick<Shape, 'W' | 'H'>, maxW: number, maxH: number) {
  const k = Math.min(maxW / s.W, maxH / s.H);
  return { w: Math.max(8, Math.round(s.W * k)), h: Math.max(8, Math.round(s.H * k)), k };
}

export interface Geo {
  t: number;
  archR: number;
  /** секции: x, w (px), верх/низ области стекла секции, низ панели */
  secs: { x: number; w: number; y: number; h: number; panelY?: number }[];
}

export function geometry(s: Shape, w: number, h: number): Geo {
  const T = tpl(s.tpl);
  const t = Math.max(4, Math.min(13, Math.min(w, h) * 0.062));
  const archR = T.arch ? Math.min(w / 2, h * 0.6) : 0;
  const ws = colWidths({ W: s.W, cols: s.cols });
  const inner = w - 2 * t;
  const gaps = (s.cols.length - 1) * t;
  const top = archR ? archR + t / 2 : t;
  const secH = h - t - top;
  let x = t;
  const secs = s.cols.map((c, i) => {
    const sw = ((inner - gaps) * ws[i]) / s.W;
    const r = { x, w: sw, y: top, h: secH, panelY: c.panel ? top + secH * (1 - c.panel) : undefined };
    x += sw + t;
    return r;
  });
  return { t, archR, secs };
}

function openPath(o: Open, gl: number, gt: number, gr: number, gb: number) {
  const my = (gt + gb) / 2, mx = (gl + gr) / 2;
  const turn = (hingeLeft: boolean) => (hingeLeft ? `M${gl} ${gt} L${gr} ${my} L${gl} ${gb}` : `M${gr} ${gt} L${gl} ${my} L${gr} ${gb}`);
  const tilt = `M${gl} ${gb} L${mx} ${gt} L${gr} ${gb}`;
  switch (o) {
    case 'turnL': return turn(true);
    case 'turnR': return turn(false);
    case 'ttL': return `${turn(true)} ${tilt}`;
    case 'ttR': return `${turn(false)} ${tilt}`;
    case 'tilt': return tilt;
    default: return '';
  }
}

export interface DrawingProps {
  shape: Shape;
  /** id цвета (oq, c01…c17) или null — антрацит (светлая тема) / белый (тёмная) */
  color?: string | null;
  dark?: boolean;
  /** размер в px; если не задан — вписать в maxW×maxH */
  w?: number;
  h?: number;
  maxW?: number;
  maxH?: number;
  labels?: boolean;
  /** створки качаются (hero) */
  swing?: boolean;
  /** нажатие на стекло секции */
  onGlass?: (i: number) => void;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export default function WindowDrawing({ shape, color = null, dark = false, w, h, maxW = 96, maxH = 96, labels = false, swing = false, onGlass, className = '', style, title }: DrawingProps) {
  const uid = useId().replace(/:/g, '');
  const size = w && h ? { w, h } : fit(shape, maxW, maxH);
  const W = size.w, H = size.h;
  const g = geometry(shape, W, H);
  const { t, archR, secs } = g;
  const col = color ?? (dark ? 'oq' : null);
  const white = col === 'oq';
  const frameFill = col && col !== 'oq' ? `url(#tx${uid})` : white ? '#F4F6F9' : '#3D434E';
  const line = white ? '#8D99AB' : '#262A31';
  const shine = white ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.16)';
  const sw = Math.max(1, t * 0.09);

  const outer = archR
    ? `M0 ${H} L0 ${archR} A${W / 2} ${archR} 0 0 1 ${W} ${archR} L${W} ${H} Z`
    : `M0 0 H${W} V${H} H0 Z`;

  let cN = 0, fN = 0;
  const marks: { x: number; y: number; s: string }[] = [];

  const uzor = (gl: number, gt: number, gr: number, gb: number, key: string) => {
    if (!shape.uzor || shape.uzor === 'none') return null;
    const bw = Math.max(1.2, t * 0.22);
    const out = [];
    const nv = Math.max(1, Math.round((gr - gl) / Math.max(40, (gb - gt) / 3)));
    if (shape.uzor === 'v' || shape.uzor === 'grid') for (let k = 1; k <= nv; k++) { const x = gl + ((gr - gl) * k) / (nv + 1); out.push(<rect key={`${key}v${k}`} x={x - bw / 2} y={gt} width={bw} height={gb - gt} fill="#F4F6F9" opacity=".92" />); }
    if (shape.uzor === 'h' || shape.uzor === 'grid') for (let k = 1; k <= 2; k++) { const y = gt + ((gb - gt) * k) / 3; out.push(<rect key={`${key}h${k}`} x={gl} y={y - bw / 2} width={gr - gl} height={bw} fill="#F4F6F9" opacity=".92" />); }
    return out;
  };

  const sections = secs.map((s, i) => {
    const c = shape.cols[i];
    const o = c.open;
    const bottom = s.panelY ?? s.y + s.h;
    const els = [];
    const label = o === 'fix' ? `F${++fN}` : `C${++cN}`;
    const sash = o !== 'fix' && !o.startsWith('slide');
    const slide = o.startsWith('slide');
    // область секции (стекло + створка)
    const hingeLeft = o === 'turnL' || o === 'ttL';
    let gl: number, gt: number, gr: number, gb: number;
    const pane = [];
    if (sash || slide) {
      const ins = t * 0.82;
      pane.push(<rect key="so" x={s.x + 1} y={s.y + 1} width={s.w - 2} height={bottom - s.y - 2} fill="none" stroke={line} strokeWidth={sw} />);
      gl = s.x + ins; gt = s.y + ins; gr = s.x + s.w - ins; gb = bottom - ins;
      pane.push(<rect key="g" x={gl} y={gt} width={gr - gl} height={gb - gt} fill={GLASS} stroke={line} strokeWidth={sw} />);
      if (sash) {
        pane.push(<path key="o" d={openPath(o, gl, gt, gr, gb)} fill="none" stroke={OPEN_LINE} strokeWidth={Math.max(1, t * 0.11)} />);
        const hw = Math.max(2, t * 0.42), hh = Math.max(6, (gb - gt) * 0.13);
        if (o === 'tilt') {
          pane.push(<rect key="h" x={(gl + gr) / 2 - hh / 2} y={s.y + (gt - s.y - hw) / 2} width={hh} height={hw} rx={1} fill="#15181D" stroke="#8B93A0" strokeWidth={0.6} />);
        } else {
          const hx = hingeLeft ? gr + (s.x + s.w - gr - hw) / 2 : s.x + (gl - s.x - hw) / 2;
          pane.push(<rect key="h" x={hx} y={(gt + gb) / 2 - hh / 2} width={hw} height={hh} rx={1} fill="#15181D" stroke="#8B93A0" strokeWidth={0.6} />);
          const px = hingeLeft ? s.x + 0.8 : s.x + s.w - 0.8 - Math.max(1.6, t * 0.4);
          const ph = Math.max(3, t * 0.85);
          pane.push(<rect key="p1" x={px} y={gt + (gb - gt) * 0.12} width={Math.max(1.6, t * 0.4)} height={ph} fill="#15181D" />);
          pane.push(<rect key="p2" x={px} y={gb - (gb - gt) * 0.12 - ph} width={Math.max(1.6, t * 0.4)} height={ph} fill="#15181D" />);
        }
      } else {
        const ay = (gt + gb) / 2, aw = Math.min(18, (gr - gl) * 0.22), dir = o === 'slideR' ? 1 : -1, cx = (gl + gr) / 2;
        pane.push(<path key="a" d={`M${cx - (dir * aw) / 2} ${ay} H${cx + (dir * aw) / 2} M${cx + (dir * aw) / 2 - dir * 4} ${ay - 3.5} L${cx + (dir * aw) / 2} ${ay} L${cx + (dir * aw) / 2 - dir * 4} ${ay + 3.5}`} fill="none" stroke={OPEN_LINE} strokeWidth={1.3} />);
      }
    } else {
      const ins = Math.max(1.4, t * 0.3);
      gl = s.x + ins; gt = s.y + ins; gr = s.x + s.w - ins; gb = bottom - ins;
      pane.push(<rect key="g" x={gl} y={gt} width={gr - gl} height={gb - gt} fill={GLASS} stroke={line} strokeWidth={sw} />);
    }
    pane.push(...(uzor(gl, gt, gr, gb, `u${i}`) ?? []));
    marks.push({ x: (gl + gr) / 2, y: (gt + gb) / 2, s: label });

    els.push(<rect key="bg" x={s.x} y={s.y} width={s.w} height={s.h} fill="none" stroke={shine} strokeWidth={1} />);
    if (swing && sash) {
      els.push(<rect key="hole" x={s.x} y={s.y} width={s.w} height={bottom - s.y} fill="#1D3B6E" />);
      els.push(
        <g key="sw" className={hingeLeft ? 'rc-swing-l' : 'rc-swing-r'} style={{ transformOrigin: `${hingeLeft ? s.x : s.x + s.w}px ${(s.y + bottom) / 2}px` }}>
          <rect x={s.x} y={s.y} width={s.w} height={bottom - s.y} fill={frameFill} />
          {pane}
        </g>,
      );
    } else els.push(<g key="p">{pane}</g>);
    if (s.panelY !== undefined) {
      const pi = t * 0.7;
      els.push(<rect key="pn" x={s.x + pi} y={s.panelY + pi} width={s.w - 2 * pi} height={s.y + s.h - s.panelY - 2 * pi} fill="rgba(0,0,0,.14)" stroke={line} strokeWidth={sw} />);
    }
    if (onGlass) {
      els.push(<rect key="hit" x={s.x} y={s.y} width={s.w} height={bottom - s.y} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onGlass(i)} />);
    }
    return <g key={i}>{els}</g>;
  });

  const arch = archR ? (
    <g>
      <path d={`M${t} ${archR - t / 2} A${W / 2 - t} ${archR - t} 0 0 1 ${W - t} ${archR - t / 2} Z`} fill={GLASS} stroke={line} strokeWidth={sw} />
    </g>
  ) : null;

  return (
    <div className={`rc-win ${className}`} style={{ position: 'relative', width: W, height: H, flex: 'none', ...style }} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        {col && col !== 'oq' && (
          <defs>
            <pattern id={`tx${uid}`} patternUnits="userSpaceOnUse" width="120" height="120">
              <image href={`/colors/${col}.webp`} width="120" height="120" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </defs>
        )}
        <path d={outer} fill={frameFill} stroke={line} strokeWidth={sw} />
        {arch}
        {sections}
      </svg>
      {labels && marks.map((m) => (
        <span key={m.s} className="rc-wl" style={{ left: m.x, top: m.y, fontSize: Math.max(9, Math.min(14, t * 1.1)) }}>{m.s}</span>
      ))}
    </div>
  );
}
