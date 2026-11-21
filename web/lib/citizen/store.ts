// Состояние пути гражданина: заказ, цвет, уровень, район, мастера, телефон.
// Хранится в localStorage (возврат на сайт — всё на месте) и кодируется в ссылку «Ulashish».
import { COLORS, COLOR_NAMES, LEVELS, isColor, isTpl, newItem, clamp, LIMITS, type Item, type Lvl, type Open, type Uzor, OPENS, UZORS } from './model';

export type Step = 'turi' | 'olcham' | 'buyurtma' | 'rang' | 'narx' | 'hudud' | 'ustalar' | 'tayyor';
export const STEPS: Step[] = ['turi', 'olcham', 'buyurtma', 'rang', 'narx', 'hudud', 'ustalar', 'tayyor'];
export const isStep = (x: unknown): x is Step => STEPS.includes(x as Step);
/** номер сегмента в шапке (1–5) */
export const SEG: Record<Step, number> = { turi: 1, olcham: 2, buyurtma: 2, rang: 3, narx: 4, hudud: 5, ustalar: 5, tayyor: 5 };

export interface S {
  items: Item[];
  /** изделие в конструкторе */
  draft: Item | null;
  /** id изделия из заказа, которое редактируется (null — новое) */
  editId: string | null;
  col: string | null;
  lvl: Lvl;
  brand: string | null;
  region: number | null;
  district: number | null;
  masters: string[];
  phone: string;
  sent: { date: string; demo: boolean; masters: number } | null;
}

export const initial: S = { items: [], draft: null, editId: null, col: null, lvl: 'standart', brand: null, region: null, district: null, masters: [], phone: '', sent: null };

const KEY = 'romchi-maket-v1';

const OPEN_SET = new Set<string>([...OPENS, 'slideL', 'slideR']);
function cleanItem(x: unknown): Item | null {
  if (!x || typeof x !== 'object') return null;
  const o = x as Partial<Item>;
  if ((o.tpl as string) === 'esg') o.tpl = 'es'; // «стеклянная дверь» слилась с «дверь» (панели у дверей убрали)
  if (!isTpl(o.tpl) || !Array.isArray(o.cols) || !o.cols.length || o.cols.length > 4) return null;
  const cols = o.cols.map((c) => ({
    f: Number(c?.f) > 0 ? Number(c.f) : 1 / o.cols!.length,
    open: (OPEN_SET.has(String(c?.open)) ? c.open : 'fix') as Open,
    ...(Number(c?.panel) > 0 && Number(c.panel) < 1 ? { panel: Number(c.panel) } : {}),
  }));
  const sum = cols.reduce((a, c) => a + c.f, 0);
  cols.forEach((c) => (c.f /= sum));
  return {
    id: typeof o.id === 'string' ? o.id : Math.random().toString(36).slice(2, 9),
    tpl: o.tpl,
    W: clamp(Math.round(Number(o.W) || 100), LIMITS.W[0], LIMITS.W[1]),
    H: clamp(Math.round(Number(o.H) || 100), LIMITS.H[0], LIMITS.H[1]),
    cols,
    uzor: (UZORS.includes(o.uzor as Uzor) ? o.uzor : (o.uzor as string) === 'crossFlower' ? 'cross' : 'none') as Uzor,
    qty: clamp(Math.round(Number(o.qty) || 1), 1, 99),
    ...(isColor(o.col) ? { col: o.col } : {}),
  };
}

export function load(): S {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initial;
    const p = JSON.parse(raw) as Partial<S>;
    return {
      ...initial,
      items: (p.items ?? []).map(cleanItem).filter((x): x is Item => !!x),
      draft: cleanItem(p.draft),
      editId: typeof p.editId === 'string' ? p.editId : null,
      col: isColor(p.col) ? p.col : null,
      lvl: LEVELS.includes(p.lvl as Lvl) ? (p.lvl as Lvl) : 'standart',
      brand: typeof p.brand === 'string' ? p.brand : null,
      region: typeof p.region === 'number' ? p.region : null,
      district: typeof p.district === 'number' ? p.district : null,
      masters: Array.isArray(p.masters) ? p.masters.filter((m) => typeof m === 'string') : [],
      phone: typeof p.phone === 'string' ? p.phone : '',
      sent: p.sent ?? null,
    };
  } catch { return initial; }
}

export function save(s: S) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* приватный режим — без сохранения */ }
}

// ---- ссылка «Ulashish»: ?m=<base64url(JSON)>
const b64 = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeShare(s: S): string {
  const items = s.items.map(({ tpl, W, H, cols, uzor, qty, col }) => ({ tpl, W, H, cols: cols.map((c) => ({ f: +c.f.toFixed(4), open: c.open, ...(c.panel ? { panel: c.panel } : {}) })), uzor, qty, ...(col ? { col } : {}) }));
  return b64(JSON.stringify({ items, col: s.col, lvl: s.lvl, brand: s.brand }));
}

export function decodeShare(m: string): Partial<S> | null {
  try {
    const p = JSON.parse(unb64(m)) as Partial<S>;
    const items = (p.items ?? []).map(cleanItem).filter((x): x is Item => !!x);
    if (!items.length) return null;
    return {
      items,
      col: isColor(p.col) ? p.col : initial.col,
      lvl: LEVELS.includes(p.lvl as Lvl) ? (p.lvl as Lvl) : 'standart',
      brand: typeof p.brand === 'string' ? p.brand : null,
    };
  } catch { return null; }
}

export { newItem, COLORS };

/** цвет изделия: свой, иначе общий */
export const itemCol = (it: Pick<Item, 'col'>, s: Pick<S, 'col'>) => it.col ?? s.col;

/** «Zal-dub» или «3 xil rang», если окна разных цветов */
export function colorSummary(s: S, many: (n: number) => string): string {
  const ids = new Set(s.items.map((x) => itemCol(x, s) ?? 'oq'));
  return ids.size > 1 ? many(ids.size) : COLOR_NAMES[[...ids][0] ?? s.col ?? 'oq'];
}
