'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CDict } from '@/lib/citizen/i18n';
import type { Item } from '@/lib/citizen/model';
import WindowScene, { hasTilt, hasTurn, modesFor, nextMode, type Cmd, type Mode } from './WindowScene';
import { I, useDark, useMedia } from './ui';
import { StoreButtons } from './AppLinks';

export default function View3DGL({ t, item, col, onClose }: { t: CDict; item: Item; col: string | null; onClose: () => void }) {
  const dark = useDark();
  const reduce = useMedia('(prefers-reduced-motion: reduce)');
  const closeRef = useRef<HTMLButtonElement>(null);
  const [modes, setModes] = useState<Mode[]>(() => modesFor(item, 'closed'));
  const [rotate, setRotate] = useState(!reduce);
  const [resetKey, setResetKey] = useState(0);
  const turn = hasTurn(item), tilt = hasTilt(item);

  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);

  // один раз показываем, как окно открывается (если можно и не просили меньше движения)
  useEffect(() => {
    if (reduce || !turn) return;
    const id = setTimeout(() => setModes(modesFor(item, 'open')), 700);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active: Cmd = modes.includes('tilt') ? 'tilt' : modes.includes('turn') ? 'open' : 'closed';
  const toggle = (c: Exclude<Cmd, 'closed'>) => setModes(modesFor(item, active === c ? 'closed' : c));
  const onTap = useCallback((i: number) => setModes((m) => m.map((x, k) => (k === i ? nextMode(item.cols[i].open, x) : x))), [item]);
  const stopSpin = useCallback(() => setRotate(false), []);

  return (
    <div className="rc-modal" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t.m3dTitle} className="rc-sheet flex flex-col gap-3" style={{ padding: '14px 16px calc(18px + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <b className="rc-disp" style={{ fontSize: 18 }}>{t.m3dTitle}</b>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="rc-ghost" style={{ minHeight: 40, width: 40, padding: 0 }}>{I.x()}</button>
        </div>
        <div className="rc-grid" style={{ height: 'min(52dvh, 420px)', borderRadius: 18, overflow: 'hidden', cursor: 'grab' }}>
          <WindowScene item={item} col={col} dark={dark} modes={modes} onTap={onTap} rotate={rotate} onUserRotate={stopSpin} resetKey={resetKey} reduce={reduce} />
        </div>
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${2 + Number(turn) + Number(tilt)}, 1fr)` }}>
          {turn && <button type="button" className="rc-ghost" aria-pressed={active === 'open'} onClick={() => toggle('open')}>{t.m3dOpen}</button>}
          {tilt && <button type="button" className="rc-ghost" aria-pressed={active === 'tilt'} onClick={() => toggle('tilt')}>{t.m3dTilt}</button>}
          <button type="button" className="rc-ghost" aria-pressed={rotate} onClick={() => setRotate((r) => !r)}>{t.m3dSpin}</button>
          <button type="button" className="rc-ghost" onClick={() => { setResetKey((k) => k + 1); setRotate(false); }}>{t.m3dReset}</button>
        </div>
        <p className="rc-hint" style={{ margin: 0 }}>{t.m3dHint}</p>
        <StoreButtons t={t} from="3d" />
      </div>
    </div>
  );
}
