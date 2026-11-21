// Режимы открывания створок для 3D (без three.js, чтобы можно было импортировать до ленивой загрузки сцены).
import type { Item, Open } from './model';

export type Mode = 'closed' | 'turn' | 'tilt';
export type Cmd = 'closed' | 'open' | 'tilt';

export const canTurn = (o: Open) => o === 'turnL' || o === 'turnR' || o === 'ttL' || o === 'ttR' || o.startsWith('slide');
export const canTilt = (o: Open) => o === 'tilt' || o === 'ttL' || o === 'ttR';
export const hasTurn = (it: Pick<Item, 'cols'>) => it.cols.some((c) => canTurn(c.open));
export const hasTilt = (it: Pick<Item, 'cols'>) => it.cols.some((c) => canTilt(c.open));

/** режим каждой секции для общей команды «Ochish» / «Shamollatish» / закрыть */
export const modesFor = (it: Pick<Item, 'cols'>, cmd: Cmd): Mode[] =>
  it.cols.map((c) => (cmd === 'open' && canTurn(c.open) ? 'turn' : cmd === 'tilt' && canTilt(c.open) ? 'tilt' : 'closed'));

/** тап по створке: закрыто → открыто → (откидное) → закрыто */
export function nextMode(o: Open, m: Mode): Mode {
  if (m === 'closed') return canTurn(o) ? 'turn' : 'tilt';
  if (m === 'turn') return canTilt(o) ? 'tilt' : 'closed';
  return 'closed';
}
