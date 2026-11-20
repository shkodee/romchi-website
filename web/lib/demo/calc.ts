// Демо-расчёт Romchi. ЦЕНЫ И ФОРМУЛЫ ПРИМЕРНЫЕ.
// Когда команда приложения отдаст формулы и шаблоны (JSON), заменить TEMPLATES/PROFILES/COLORS
// и функции priceOf/cutList — интерфейс менять не придётся.

export type OpenType = 'turn' | 'tilt' | 'turntilt' | 'fix';
export type TplId = 'd1' | 'd2' | 'd3' | 'bb' | 'es' | 'ar';
export type ProfId = 'akfa' | 'alutex';
export type ColId = 'oq' | 'ant' | 'lam';

export interface Template {
  id: TplId;
  W: number;
  H: number;
  arch?: boolean;
  /** f — доля ширины, h — доля высоты (h<1 → снизу глухая панель, балконный блок) */
  parts: { f: number; h: number }[];
  def: OpenType[];
}

export const TEMPLATES: Template[] = [
  { id: 'd1', W: 700, H: 1300, parts: [{ f: 1, h: 1 }], def: ['turntilt'] },
  { id: 'd2', W: 1300, H: 1400, parts: [{ f: 0.5, h: 1 }, { f: 0.5, h: 1 }], def: ['fix', 'turntilt'] },
  { id: 'd3', W: 1500, H: 1500, parts: [{ f: 1 / 3, h: 1 }, { f: 1 / 3, h: 1 }, { f: 1 / 3, h: 1 }], def: ['turn', 'fix', 'turntilt'] },
  { id: 'bb', W: 2100, H: 2100, parts: [{ f: 0.35, h: 1 }, { f: 0.65, h: 0.62 }], def: ['turn', 'fix'] },
  { id: 'es', W: 900, H: 2100, parts: [{ f: 1, h: 1 }], def: ['turn'] },
  { id: 'ar', W: 1400, H: 1800, arch: true, parts: [{ f: 0.5, h: 1 }, { f: 0.5, h: 1 }], def: ['fix', 'turn'] },
];

/** r — $ за погонный метр профиля (демо) */
export const PROFILES: Record<ProfId, { n: string; r: number }> = {
  akfa: { n: 'Akfa', r: 3.9 },
  alutex: { n: 'Alutex', r: 6.2 },
};

/** k — коэффициент цены за цвет; остальное — цвета для чертежа */
export const COLORS: Record<ColId, { k: number; c: string; st: string; sash: string; panel: string }> = {
  oq: { k: 1, c: '#F4F6F9', st: '#9AA6B6', sash: '#FBFCFD', panel: '#E6EAF0' },
  ant: { k: 1.22, c: '#464A52', st: '#2B2E34', sash: '#4D525B', panel: '#5A606A' },
  lam: { k: 1.18, c: '#7A4E2D', st: '#4E311C', sash: '#855835', panel: '#94653F' },
};

export const FURN: Record<OpenType, number> = { turn: 22, tilt: 18, turntilt: 30, fix: 0 };
export const ORDER: OpenType[] = ['turn', 'tilt', 'turntilt', 'fix'];
export const BAR = 6000; // длина хлыста, мм
export const LIMITS = { W: [400, 3000], H: [400, 2600] } as const;
export const MIN_PART = 300; // мин. ширина секции, мм
export const DEFAULT_RATE = 12800; // сум за $ (демо)

export interface DemoState {
  tpl: TplId;
  W: number;
  H: number;
  prof: ProfId;
  col: ColId;
  types: OpenType[];
  /** доли ширины секций (сумма = 1); задаются пользователем */
  fr: number[];
}

export const tplById = (id: TplId) => TEMPLATES.find((t) => t.id === id)!;

export const initialState = (id: TplId = 'd3'): DemoState => {
  const t = tplById(id);
  return { tpl: id, W: t.W, H: t.H, prof: 'akfa', col: 'ant', types: t.def.slice(), fr: t.parts.map((p) => p.f) };
};

/** Ширины секций в мм (последняя добирает остаток, чтобы сумма = W) */
export function partWidths(s: DemoState): number[] {
  const ws = s.fr.map((f) => Math.round(f * s.W));
  if (ws.length) ws[ws.length - 1] = s.W - ws.slice(0, -1).reduce((a, b) => a + b, 0);
  return ws;
}

/** Все секции поровну */
export const equalize = (s: DemoState): DemoState => ({ ...s, fr: s.fr.map(() => 1 / s.fr.length) });

/** Новая ширина секции i (мм): остальные секции сохраняют свои мм, общая ширина меняется */
export function setPartWidth(s: DemoState, i: number, mm: number): DemoState {
  const ws = partWidths(s);
  const others = s.W - ws[i];
  const max = Math.max(MIN_PART, LIMITS.W[1] - others);
  ws[i] = Math.min(max, Math.max(MIN_PART, Math.round(mm)));
  const W = ws.reduce((a, b) => a + b, 0);
  return { ...s, W, fr: ws.map((w) => w / W) };
}

/** Новая общая ширина: секции масштабируются пропорционально */
export function setWidth(s: DemoState, mm: number): DemoState {
  const n = s.fr.length;
  const W = Math.min(LIMITS.W[1], Math.max(Math.max(LIMITS.W[0], n * MIN_PART), Math.round(mm)));
  return { ...s, W };
}

export const setHeight = (s: DemoState, mm: number): DemoState => ({
  ...s, H: Math.min(LIMITS.H[1], Math.max(LIMITS.H[0], Math.round(mm))),
});

export const archRadius = (t: Template, W: number, H: number) => (t.arch ? Math.min(W / 2, H * 0.35) : 0);

/** Список отрезков профиля в мм (рама, импосты, створки), отсортирован по убыванию */
export function cutList(s: DemoState): number[] {
  const t = tplById(s.tpl);
  const { W, H } = s;
  const archR = archRadius(t, W, H);
  const rectH = H - archR;
  const pcs: number[] = [];
  if (t.arch) {
    const a = W / 2, b = archR;
    pcs.push(Math.PI * Math.sqrt((a * a + b * b) / 2), W, rectH, rectH);
  } else pcs.push(W, W, H, H);
  const pw = partWidths(s);
  t.parts.forEach((p, i) => {
    if (i > 0) pcs.push(rectH); // импост
    if (p.h < 1) pcs.push(pw[i]); // горизонтальный импост над панелью
    const ty = s.types[i] ?? 'fix';
    if (ty !== 'fix') {
      const sw = pw[i] - 40, sh = p.h * rectH - 40;
      pcs.push(sw, sw, sh, sh);
    }
  });
  return pcs.map((x) => Math.round(x)).sort((a, b) => b - a);
}

export interface Bar { segs: number[]; rest: number }

/** First-fit decreasing: раскладка отрезков по хлыстам 6000 мм */
export function packBars(pcs: number[], bar = BAR): Bar[] {
  const bars: Bar[] = [];
  for (const L of pcs) {
    let b = bars.find((q) => q.rest >= L);
    if (!b) { b = { segs: [], rest: bar }; bars.push(b); }
    b.segs.push(L);
    b.rest -= L;
  }
  return bars;
}

export interface Result {
  pcs: number[];
  bars: Bar[];
  used: number;
  eff: number; // %
  waste: number; // мм
  meters: number;
  area: number; // м²
  glassArea: number;
  profC: number;
  glassC: number;
  furnC: number;
  labor: number;
  totalUsd: number;
}

export function compute(s: DemoState): Result {
  const t = tplById(s.tpl);
  const pcs = cutList(s);
  const bars = packBars(pcs);
  const used = pcs.reduce((a, b) => a + b, 0);
  const eff = bars.length ? (used / (bars.length * BAR)) * 100 : 0;
  const waste = bars.reduce((a, b) => a + b.rest, 0);
  const meters = used / 1000;
  const area = (s.W * s.H) / 1e6;
  const glassArea = area * 0.85;
  const profC = meters * PROFILES[s.prof].r * COLORS[s.col].k;
  const glassC = glassArea * 16;
  const furnC = t.parts.reduce((acc, _p, i) => acc + FURN[s.types[i] ?? 'fix'], 0);
  const labor = area * 9;
  return { pcs, bars, used, eff, waste, meters, area, glassArea, profC, glassC, furnC, labor, totalUsd: profC + glassC + furnC + labor };
}

export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const usd = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

// ---- ссылка-поделиться: ?t=d3&w=1500&h=1500&p=akfa&c=ant&o=turn.fix.turntilt
export function toQuery(s: DemoState): string {
  const q = new URLSearchParams({ t: s.tpl, w: String(s.W), h: String(s.H), p: s.prof, c: s.col, o: s.types.join('.'), s: partWidths(s).join('.') });
  return q.toString();
}

const clamp = (v: number, [a, b]: readonly [number, number]) => Math.min(b, Math.max(a, v));

export function fromQuery(search: string): DemoState | null {
  const q = new URLSearchParams(search);
  const id = q.get('t') as TplId | null;
  if (!id || !TEMPLATES.some((t) => t.id === id)) return null;
  const base = initialState(id);
  const W = Number(q.get('w')), H = Number(q.get('h'));
  const p = q.get('p') as ProfId | null, c = q.get('c') as ColId | null;
  const o = (q.get('o') ?? '').split('.').filter((x): x is OpenType => (ORDER as string[]).includes(x));
  const Wv = Number.isFinite(W) && W > 0 ? clamp(Math.round(W), LIMITS.W) : base.W;
  const sw = (q.get('s') ?? '').split('.').map(Number);
  const swOk = sw.length === base.fr.length && sw.every((x) => Number.isFinite(x) && x >= MIN_PART);
  const swSum = swOk ? sw.reduce((a, b) => a + b, 0) : 0;
  return {
    ...base,
    W: swOk ? clamp(swSum, LIMITS.W) : Wv,
    fr: swOk ? sw.map((x) => x / swSum) : base.fr,
    H: Number.isFinite(H) && H > 0 ? clamp(Math.round(H), LIMITS.H) : base.H,
    prof: p && p in PROFILES ? p : base.prof,
    col: c && c in COLORS ? c : base.col,
    types: o.length === base.types.length ? o : base.types,
  };
}
