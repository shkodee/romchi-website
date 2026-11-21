// Мастера по районам.
// СЕЙЧАС: базы нет — возвращаем демо-карточки, помеченные как «Namuna» (без выдуманных имён и цифр).
// ПОТОМ: подключить базу Romchi — заменить тело getMasters() запросом к API
//   GET {NEXT_PUBLIC_API}/masters?district=<soato_id>  →  Master[]
// и sendToMasters() — POST {NEXT_PUBLIC_API}/requests. Интерфейс компонента менять не нужно.

import regions from './geo/uz-regions.json';

export interface District { id: number; uz: string; ru: string; city: boolean }
export interface Region { id: number; uz: string; ru: string; d: District[] }
export const REGIONS = regions as Region[];

export interface Master {
  id: string;
  name: string;
  /** true — демо-карточка, пока база не подключена */
  demo?: boolean;
  districtId: number;
}

export interface MasterRequest {
  districtId: number;
  masterIds: string[];
  phone: string;
  /** состояние макета (та же строка, что в ссылке-поделиться) */
  layout: string;
  lang: string;
  priceUzs: string;
  /** UTM из рекламы (utm_source, utm_campaign …) */
  utm?: Record<string, string>;
}

const API = process.env.NEXT_PUBLIC_API;

export async function getMasters(districtId: number): Promise<Master[]> {
  if (API) {
    const r = await fetch(`${API}/masters?district=${districtId}`);
    if (r.ok) return (await r.json()) as Master[];
  }
  return [1, 2, 3].map((n) => ({ id: `demo-${districtId}-${n}`, name: `Namuna usta ${n}`, demo: true, districtId }));
}

/** Отправка макета мастерам. Без API — ничего не отправляет и возвращает 'demo'. */
export async function sendToMasters(req: MasterRequest): Promise<'sent' | 'demo'> {
  if (!API) return 'demo';
  const r = await fetch(`${API}/requests`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return 'sent';
}
