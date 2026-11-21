'use client';
// Выбор изделия из заказа (когда окон несколько): мини-чертёж в своём цвете.
import type { CDict } from '@/lib/citizen/i18n';
import { COLOR_NAMES, type Item } from '@/lib/citizen/model';
import { itemCol, type S } from '@/lib/citizen/store';
import WindowDrawing from './WindowDrawing';

export default function ItemTabs({ t, s, sel, onSel, dark }: { t: CDict; s: S; sel: string; onSel: (id: string) => void; dark: boolean }) {
  if (s.items.length < 2) return null;
  return (
    <div className="flex gap-2 overflow-x-auto" role="group" aria-label={t.rangWhich} style={{ scrollbarWidth: 'none', padding: '2px 2px 4px' }}>
      {s.items.map((it: Item, i) => {
        const on = it.id === sel;
        const c = itemCol(it, s);
        return (
          <button key={it.id} type="button" aria-pressed={on} aria-label={`${i + 1}. ${t.tpl[it.tpl]}, ${COLOR_NAMES[c ?? 'oq']}`} onClick={() => onSel(it.id)}
            className="flex flex-none flex-col items-center gap-1"
            style={{ width: 76, padding: '8px 6px 6px', borderRadius: 14, cursor: 'pointer', background: on ? 'var(--soft)' : 'var(--card)', border: on ? '2px solid #0077FF' : '1.5px solid var(--line)', boxShadow: on ? '0 0 0 4px rgba(0,119,255,.12)' : 'none', transition: 'transform .14s var(--e-out)' }}>
            <WindowDrawing shape={it} maxW={52} maxH={46} color={c} dark={dark} />
            <span className="rc-num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink2)' }}>{i + 1}. {it.W}×{it.H}</span>
          </button>
        );
      })}
    </div>
  );
}
