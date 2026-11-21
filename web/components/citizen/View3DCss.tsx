'use client';
// Лёгкий 3D-вид без WebGL: чертёж в CSS-перспективе, створки открываются, поворот пальцем.
// Полное 3D и AR — в приложении Romchi (ссылка внизу).
import { useEffect, useRef, useState } from 'react';
import type { CDict } from '@/lib/citizen/i18n';
import type { Item } from '@/lib/citizen/model';
import WindowDrawing, { fit } from './WindowDrawing';
import { I, useDark } from './ui';
import { StoreButtons } from './AppLinks';

export default function View3DCss({ t, item, col, onClose }: { t: CDict; item: Item; col: string | null; onClose: () => void }) {
  const dark = useDark();
  const [rot, setRot] = useState(-22);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { w, h } = fit(item, 280, 300);

  useEffect(() => {
    closeRef.current?.focus();
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [onClose]);

  const layers = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="rc-modal" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={t.m3dTitle} className="rc-sheet flex flex-col gap-3" style={{ padding: '14px 16px calc(18px + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <b className="rc-disp" style={{ fontSize: 18 }}>{t.m3dTitle}</b>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t.close} className="rc-ghost" style={{ minHeight: 40, width: 40, padding: 0 }}>{I.x()}</button>
        </div>
        <div className="rc-grid flex items-center justify-center" style={{ height: 360, borderRadius: 18, perspective: 900, touchAction: 'pan-y', cursor: 'grab', overflow: 'hidden' }}
          onPointerDown={(e) => { drag.current = { x: e.clientX, r: rot }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
          onPointerMove={(e) => { if (drag.current) setRot(Math.max(-70, Math.min(70, drag.current.r + (e.clientX - drag.current.x) * 0.4))); }}
          onPointerUp={() => { drag.current = null; }}
          onPointerCancel={() => { drag.current = null; }}>
          <div style={{ position: 'relative', width: w, height: h, transformStyle: 'preserve-3d', transform: `rotateX(6deg) rotateY(${rot}deg)`, transition: drag.current ? 'none' : 'transform .5s var(--e-out)' }}>
            {layers.map((i) => (
              <div key={i} aria-hidden="true" style={{ position: 'absolute', inset: 0, transform: `translateZ(${-i * 2}px)`, filter: `brightness(${0.75 - i * 0.04})` }}>
                <WindowDrawing shape={item} w={w} h={h} color={col} dark={dark} />
              </div>
            ))}
            <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(1px)' }}>
              <WindowDrawing shape={item} w={w} h={h} color={col} dark={dark} swing labels />
            </div>
          </div>
        </div>
        <input type="range" min={-70} max={70} value={Math.round(rot)} onChange={(e) => setRot(Number(e.target.value))} aria-label={t.m3dTitle} style={{ width: '100%', accentColor: '#0077FF', height: 32 }} />
        <p className="rc-hint" style={{ margin: 0 }}>{t.m3dHint}</p>
        <StoreButtons t={t} from="3d" />
      </div>
    </div>
  );
}
