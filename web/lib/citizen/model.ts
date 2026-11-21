// Модель сайта для граждан: шаблоны изделий, цвета, уровни профиля, цена.
// ЦЕНЫ ДЕМО: ставка 2 140 000 soʻm/m² (из макета). Когда команда даст реальные цены —
// заменить priceOf(), интерфейс компонентов менять не придётся.

export type Open = 'fix' | 'turnL' | 'turnR' | 'tilt' | 'ttL' | 'ttR' | 'slideL' | 'slideR';
/** L — петли слева, ручка справа; R — наоборот */
export const OPENS: Open[] = ['turnL', 'turnR', 'tilt', 'ttL', 'ttR', 'fix'];
export const isOpenable = (o: Open) => o !== 'fix';

export type Uzor = 'none' | 'v' | 'h' | 'grid';
export const UZORS: Uzor[] = ['none', 'v', 'h', 'grid'];

export interface Col {
  /** доля общей ширины */
  f: number;
  open: Open;
  /** доля высоты снизу под глухую панель (двери, балконный блок), 0 — нет */
  panel?: number;
  /** доля высоты: секция занимает только верх (окно балконного блока над панелью) */
}

export type Cat = 'deraza' | 'eshik' | 'balkon' | 'boshqa';
export type TplId =
  | 'd1' | 'd2' | 'd2t' | 'd3' | 'd3f' | 'd4' | 'f1' | 'd1t'
  | 'bb' | 'bb2' | 'es' | 'es2' | 'esg' | 'sl' | 'vt' | 'ar';

export interface Template {
  id: TplId;
  cat: Cat;
  /** см */
  W: number;
  H: number;
  cols: Col[];
  arch?: boolean;
}

export const TEMPLATES: Template[] = [
  { id: 'd1', cat: 'deraza', W: 70, H: 130, cols: [{ f: 1, open: 'ttL' }] },
  { id: 'd2', cat: 'deraza', W: 130, H: 140, cols: [{ f: 0.5, open: 'fix' }, { f: 0.5, open: 'ttR' }] },
  { id: 'd2t', cat: 'deraza', W: 130, H: 140, cols: [{ f: 0.5, open: 'turnL' }, { f: 0.5, open: 'ttR' }] },
  { id: 'd3', cat: 'deraza', W: 150, H: 150, cols: [{ f: 1 / 3, open: 'turnL' }, { f: 1 / 3, open: 'fix' }, { f: 1 / 3, open: 'ttR' }] },
  { id: 'd3f', cat: 'deraza', W: 190, H: 150, cols: [{ f: 64 / 190, open: 'turnL' }, { f: 62 / 190, open: 'fix' }, { f: 64 / 190, open: 'turnR' }] },
  { id: 'd4', cat: 'deraza', W: 240, H: 140, cols: [{ f: 0.25, open: 'turnL' }, { f: 0.25, open: 'fix' }, { f: 0.25, open: 'fix' }, { f: 0.25, open: 'ttR' }] },
  { id: 'f1', cat: 'deraza', W: 100, H: 100, cols: [{ f: 1, open: 'fix' }] },
  { id: 'd1t', cat: 'deraza', W: 70, H: 60, cols: [{ f: 1, open: 'tilt' }] },
  { id: 'bb', cat: 'balkon', W: 210, H: 210, cols: [{ f: 0.34, open: 'turnL' }, { f: 0.66, open: 'fix', panel: 0.42 }] },
  { id: 'bb2', cat: 'balkon', W: 210, H: 210, cols: [{ f: 0.66, open: 'fix', panel: 0.42 }, { f: 0.34, open: 'turnR' }] },
  { id: 'es', cat: 'eshik', W: 90, H: 210, cols: [{ f: 1, open: 'turnL', panel: 0.45 }] },
  { id: 'es2', cat: 'eshik', W: 160, H: 210, cols: [{ f: 0.5, open: 'turnL', panel: 0.45 }, { f: 0.5, open: 'turnR', panel: 0.45 }] },
  { id: 'esg', cat: 'eshik', W: 90, H: 210, cols: [{ f: 1, open: 'turnL' }] },
  { id: 'sl', cat: 'boshqa', W: 200, H: 150, cols: [{ f: 0.5, open: 'slideR' }, { f: 0.5, open: 'slideL' }] },
  { id: 'vt', cat: 'boshqa', W: 240, H: 200, cols: [{ f: 0.5, open: 'fix' }, { f: 0.5, open: 'fix' }] },
  { id: 'ar', cat: 'boshqa', W: 140, H: 180, arch: true, cols: [{ f: 0.5, open: 'fix' }, { f: 0.5, open: 'turnR' }] },
];
/** 6 типов на главной */
export const MAIN_TYPES: TplId[] = ['d1', 'd2', 'd3', 'bb', 'es', 'ar'];
export const tpl = (id: TplId) => TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[1];
export const isTpl = (x: unknown): x is TplId => TEMPLATES.some((t) => t.id === x);

export const LIMITS = { W: [30, 400], H: [30, 300], col: 20 } as const;
export const QUICK: [number, number][] = [[100, 100], [130, 140], [150, 150], [190, 150], [210, 210]];

// ---- цвета профиля: Oq + 17 из приложения (текстуры в /public/colors)
export const COLORS: { id: string; avg: string }[] = [
  { id: 'oq', avg: '#F4F6F9' },
  ...['#826748', '#76665B', '#526285', '#4D515B', '#637392', '#7A6E60', '#758298', '#9EAEC8', '#856E63', '#B49574', '#5C6D91', '#99A9C3', '#8092AF', '#C4B294', '#9399A8', '#D5B586', '#131B1D']
    .map((avg, i) => ({ id: `c${String(i + 1).padStart(2, '0')}`, avg })),
];
export const COLOR_NAMES: Record<string, string> = {
  oq: 'Oq', c01: 'Zal-dub', c02: 'Dub mokko 2048', c03: 'Alyuks antrasit 1012', c04: 'Antratsit',
  c05: 'Metbrash seriy 1006', c06: 'Orex 2012', c07: 'Sheffildskiy betoniy dub 3003', c08: 'Sheffildskiy vicokogorniy dub 3002',
  c09: 'Ternoviy orex 9036', c10: 'Vinchester 3077', c11: 'Matteks antrasit 6003', c12: 'Metbrash platin 1004',
  c13: 'Metbrash kvarz', c14: 'Svetliy dub 2025', c15: 'Sheffildskiy seriy dub 5F01', c16: 'Solodoviy dub 3001', c17: 'Painted Coal grey',
};
export const isColor = (x: unknown): x is string => typeof x === 'string' && x in COLOR_NAMES;

// ---- уровни профиля и бренды (только romchi.uz, без Imzo)
export type Lvl = 'ekonom' | 'standart' | 'premium';
export const LEVELS: Lvl[] = ['ekonom', 'standart', 'premium'];
/** ДЕМО-коэффициенты уровня, пока нет реальных цен */
const LVL_K: Record<Lvl, number> = { ekonom: 0.85, standart: 1, premium: 1.25 };
export const BRANDS = ['Akfa', 'Alpro', 'Alsys', 'Alta Plast', 'Alu Best', 'Alutex', 'Ark', 'Biko', 'Ekopen', 'Innova', 'Lega', 'Neom', 'Retpen', 'Rossen', 'Tayhu', 'Tower Plast', 'Vitrage'];

// ---- изделие в заказе
export interface Item {
  id: string;
  tpl: TplId;
  W: number;
  H: number;
  cols: Col[];
  uzor: Uzor;
  qty: number;
}

export const newItem = (id: TplId, W?: number, H?: number): Item => {
  const t = tpl(id);
  return { id: Math.random().toString(36).slice(2, 9), tpl: id, W: W ?? t.W, H: H ?? t.H, cols: t.cols.map((c) => ({ ...c })), uzor: 'none', qty: 1 };
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** ширины секций в см, сумма = W */
export function colWidths(it: Pick<Item, 'W' | 'cols'>): number[] {
  const ws = it.cols.map((c) => Math.round(c.f * it.W));
  if (ws.length) ws[ws.length - 1] = it.W - ws.slice(0, -1).reduce((a, b) => a + b, 0);
  return ws;
}

export function setW(it: Item, W: number): Item {
  return { ...it, W: clamp(Math.round(W), Math.max(LIMITS.W[0], it.cols.length * LIMITS.col), LIMITS.W[1]) };
}
export const setH = (it: Item, H: number): Item => ({ ...it, H: clamp(Math.round(H), LIMITS.H[0], LIMITS.H[1]) });

/** новая ширина секции i: остальные секции сохраняют свои см, общая ширина меняется */
export function setColW(it: Item, i: number, cm: number): Item {
  const ws = colWidths(it);
  const others = it.W - ws[i];
  ws[i] = clamp(Math.round(cm), LIMITS.col, LIMITS.W[1] - others);
  const W = ws.reduce((a, b) => a + b, 0);
  return { ...it, W, cols: it.cols.map((c, k) => ({ ...c, f: ws[k] / W })) };
}
export const equalize = (it: Item): Item => ({ ...it, cols: it.cols.map((c) => ({ ...c, f: 1 / it.cols.length })) });

/** «Boʻlish»: число секций; новые секции — глухие, крайние сохраняют открывание */
export function setCount(it: Item, n: number): Item {
  n = clamp(n, 1, 4);
  if (n === it.cols.length) return it;
  const old = it.cols;
  const panel = old[0]?.panel;
  const cols: Col[] = Array.from({ length: n }, (_, k) => {
    const src = k === 0 ? old[0] : k === n - 1 ? old[old.length - 1] : undefined;
    return { f: 1 / n, open: src && (k === 0 || k === n - 1) ? src.open : 'fix', ...(panel ? { panel } : {}) };
  });
  if (n === 1) cols[0].open = old.find((c) => c.open !== 'fix')?.open ?? 'fix';
  return { ...it, W: Math.max(it.W, n * LIMITS.col), cols };
}

export const area = (it: Pick<Item, 'W' | 'H'>) => (it.W * it.H) / 10000;

export interface PriceOpts { lvl: Lvl }
/** ДЕМО-цена одного изделия (без количества), soʻm, округлено до 50 000 */
export function priceOf(it: Pick<Item, 'W' | 'H'>, o: PriceOpts = { lvl: 'standart' }): number {
  return Math.round((area(it) * 2140000 * LVL_K[o.lvl]) / 50000) * 50000;
}
export const total = (items: Item[], o?: PriceOpts) => items.reduce((s, it) => s + priceOf(it, o) * it.qty, 0);
export const fmt = (n: number) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
export const fmtArea = (m2: number) => (Math.round(m2 * 100) / 100).toString();
/** шаблон → форма для чертежа */
export const shapeOf = (x: Template) => ({ tpl: x.id, W: x.W, H: x.H, cols: x.cols });
