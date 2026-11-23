'use client';
// Окно/дверь «как в приложении Romchi» (DESIGN.md → «Окно и дверь»).
// Один SVG с viewBox в пикселях: рама залита текстурой цвета (pattern) или цветом,
// стекло #80D4EC, линии открывания #1F4FD8, ручка, петли, подписи C/F поверх (HTML).
import { useId, type CSSProperties } from 'react';
import { archRise, colUzor, colWidths, isSlide, tpl, type Col, type Open, type TplId, type Uzor } from '@/lib/citizen/model';

export const GLASS = '#80D4EC';
export const OPEN_LINE = '#1F4FD8';
/** золото раскладки */
export const GOLD = '#D9A93A';
export const GOLD_DK = '#9A6F12';

export interface Shape { tpl: TplId; W: number; H: number; cols: Col[]; uzor?: Uzor; archH?: number }

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
  const archR = T.arch ? Math.min(h * 0.85, (archRise(s) * h) / s.H) : 0;
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

  const uzor = (gl: number, gt: number, gr: number, gb: number, key: string, u: Uzor) => {
    if (!u || u === 'none') return null;
    const bw = Math.max(1.4, t * 0.24);
    const out = [];
    const bar = (k: string, x: number, y: number, w: number, h: number) => (
      <rect key={k} x={x} y={y} width={w} height={h} fill={GOLD} stroke={GOLD_DK} strokeWidth={0.4} />
    );
    const cx = (gl + gr) / 2, cy = (gt + gb) / 2;
    const nv = Math.max(1, Math.round((gr - gl) / Math.max(40, (gb - gt) / 3)));
    if (u === 'v' || u === 'grid') for (let k = 1; k <= nv; k++) { const x = gl + ((gr - gl) * k) / (nv + 1); out.push(bar(`${key}v${k}`, x - bw / 2, gt, bw, gb - gt)); }
    if (u === 'h' || u === 'grid') for (let k = 1; k <= 2; k++) { const y = gt + ((gb - gt) * k) / 3; out.push(bar(`${key}h${k}`, gl, y - bw / 2, gr - gl, bw)); }
    if (u === 'cross') { out.push(bar(`${key}cv`, cx - bw / 2, gt, bw, gb - gt)); out.push(bar(`${key}ch`, gl, cy - bw / 2, gr - gl, bw)); }
    return out;
  };

  /** стекло: градиент, косой блик (один раз пробегает) и фаска (тень сверху-слева, свет снизу-справа) */
  const glass = (gl: number, gt: number, gr: number, gb: number, key: string) => {
    const w = gr - gl, h = gb - gt, cid = `cp${uid}${key}`, b = Math.max(1, t * 0.14);
    return (
      <g key={`gl${key}`}>
        <rect x={gl} y={gt} width={w} height={h} fill={`url(#gl${uid})`} stroke={line} strokeWidth={sw} />
        <clipPath id={cid}><rect x={gl} y={gt} width={w} height={h} /></clipPath>
        <g clipPath={`url(#${cid})`}>
          <g className="rc-gloss" style={{ transformBox: 'fill-box' }}>
            <path d={`M${gl + w * 0.12} ${gb} L${gl + w * 0.34} ${gb} L${gl + w * 0.88} ${gt} L${gl + w * 0.66} ${gt}Z`} fill="#fff" opacity=".26" />
            <path d={`M${gl + w * 0.4} ${gb} L${gl + w * 0.47} ${gb} L${gl + w * 0.99} ${gt} L${gl + w * 0.92} ${gt}Z`} fill="#fff" opacity=".16" />
          </g>
        </g>
        <path d={`M${gl} ${gb} V${gt} H${gr}`} fill="none" stroke="rgba(0,0,0,.28)" strokeWidth={b * 1.4} />
        <path d={`M${gr} ${gt} V${gb} H${gl}`} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth={b} />
      </g>
    );
  };

  /** глухая панель (алюкобонд) под импостом */
  const panelRect = (x0: number, y0: number, x1: number, y1: number, key: string) => (
    <g key={key}>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill={white ? '#E3E7EE' : 'rgba(0,0,0,.16)'} stroke={line} strokeWidth={sw} />
      <path d={`M${x0 + 2} ${y0 + 2} H${x1 - 2}`} stroke="rgba(255,255,255,.35)" strokeWidth={1} />
    </g>
  );

  /** стрелки surma: ← → или ↔, ниже подписи C1 */
  const slideArrow = (o: Open, gl: number, gt: number, gr: number, gb: number) => {
    const ay = gt + (gb - gt) * 0.7, half = Math.max(8, Math.min(34, (gr - gl) * 0.3)), cx = (gl + gr) / 2;
    const hd = Math.max(4, Math.min(8, half * 0.4)), x0 = cx - half, x1 = cx + half;
    const head = (x: number, dir: number) => `M${x - dir * hd} ${ay - hd * 0.8} L${x} ${ay} L${x - dir * hd} ${ay + hd * 0.8}`;
    const d = `M${x0} ${ay} H${x1} ${o !== 'slideL' ? head(x1, 1) : ''} ${o !== 'slideR' ? head(x0, -1) : ''}`;
    return <path key="a" d={d} fill="none" stroke={OPEN_LINE} strokeWidth={Math.max(1.6, t * 0.16)} strokeLinecap="round" strokeLinejoin="round" />;
  };

  const sections = secs.map((s, i) => {
    const c = shape.cols[i];
    const o = c.open;
    const bottom = s.y + s.h;
    const els = [];
    const label = o === 'fix' ? `F${++fN}` : `C${++cN}`;
    const slide = isSlide(o);
    const sash = o !== 'fix' && !slide;
    const u = colUzor(shape, i);
    const hingeLeft = o === 'turnL' || o === 'ttL';
    const pane = [];
    // область стекла: целиком (gl..gb) и верх над импостом (gbTop)
    const ins = sash || slide ? t * 0.82 : Math.max(1.4, t * 0.3);
    const gl = s.x + ins, gt = s.y + ins, gr = s.x + s.w - ins, gb = bottom - ins;
    const low = s.panelY !== undefined;
    const imp = Math.max(2, t * 0.7) / 2; // половина импоста
    const gbTop = low ? s.panelY! - imp : gb;
    if (sash || slide) pane.push(<rect key="so" x={s.x + 1} y={s.y + 1} width={s.w - 2} height={bottom - s.y - 2} fill="none" stroke={line} strokeWidth={sw} />);
    pane.push(glass(gl, gt, gr, gbTop, `g${i}`));
    pane.push(...(uzor(gl, gt, gr, gbTop, `u${i}`, u) ?? []));
    if (low) {
      const ly = s.panelY! + imp;
      if (c.lower === 'glass') pane.push(glass(gl, ly, gr, gb, `l${i}`));
      else pane.push(panelRect(gl, ly, gr, gb, `pn${i}`));
    }
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
    }
    if (slide) pane.push(slideArrow(o, gl, gt, gr, gbTop));
    marks.push({ x: (gl + gr) / 2, y: slide ? gt + (gbTop - gt) * 0.38 : (gt + gbTop) / 2, s: label });

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
    if (onGlass) {
      els.push(<rect key="hit" x={s.x} y={s.y} width={s.w} height={bottom - s.y} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onGlass(i)} />);
    }
    return <g key={i}>{els}</g>;
  });

  const arch = archR ? (
    <g>
      <path d={`M${t} ${archR - t / 2} A${W / 2 - t} ${archR - t} 0 0 1 ${W - t} ${archR - t / 2} Z`} fill={`url(#gl${uid})`} stroke={line} strokeWidth={sw} />
    </g>
  ) : null;

  return (
    <div className={`rc-win ${className}`} style={{ position: 'relative', width: W, height: H, flex: 'none', ...style }} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <linearGradient id={`gl${uid}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#B4E8F8" /><stop offset=".55" stopColor={GLASS} /><stop offset="1" stopColor="#62BCDB" />
          </linearGradient>
          {col && col !== 'oq' && (
            <pattern id={`tx${uid}`} patternUnits="userSpaceOnUse" width="120" height="120">
              <image href={`/colors/${col}.webp`} width="120" height="120" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>
        <path d={outer} fill={frameFill} stroke={line} strokeWidth={sw} />
        {!archR && <path d={`M${sw} ${H - sw} V${sw} H${W - sw}`} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth={Math.max(1, t * 0.16)} />}
        {!archR && <path d={`M${W - sw} ${sw} V${H - sw} H${sw}`} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth={Math.max(1, t * 0.16)} />}
        {arch}
        {sections}
      </svg>
      {labels && marks.map((m) => (
        <span key={m.s} className="rc-wl" style={{ left: m.x, top: m.y, fontSize: Math.max(9, Math.min(14, t * 1.1)) }}>{m.s}</span>
      ))}
    </div>
  );
}
