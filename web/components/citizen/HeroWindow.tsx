'use client';
// Окно на главной: 3D, поворачивается лицом к курсору, по наведению створка открывается.
// Чертёж показываем только если нет WebGL; пока грузится 3D — пусто, окно плавно проявляется.
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { newItem } from '@/lib/citizen/model';
import { modesFor } from '@/lib/citizen/modes';
import { useMedia } from './ui';

const Scene = dynamic(() => import('./WindowScene'), { ssr: false });

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export default function HeroWindow({ W, H, w, h, dark, live, fallback }: {
  /** размеры изделия, см */ W: number; H: number;
  /** размер на экране, px */ w: number; h: number;
  dark: boolean; live: boolean; fallback: ReactNode;
}) {
  const reduce = useMedia('(prefers-reduced-motion: reduce)');
  const item = useMemo(() => newItem('d2', W, H), [W, H]);
  // null — ещё не проверили WebGL: не рисуем ничего, чтобы не мелькал запасной чертёж
  const [gl, setGl] = useState<boolean | null>(null);
  const [ready, setReady] = useState(false);
  const [late, setLate] = useState(false); // 3D не успел за 6 с (медленная сеть/сбой) — показываем чертёж, чтобы hero не был пустым
  useEffect(() => {
    if (!live || ready) return;
    const id = setTimeout(() => setLate(true), 6000);
    return () => clearTimeout(id);
  }, [live, ready]);
  const [open, setOpen] = useState(false);
  const touched = useRef(false);
  const kind = useRef('mouse');

  useEffect(() => { if (live) setGl(webglOk()); }, [live]);

  // один раз показываем, что створка открывается
  useEffect(() => {
    if (!ready || reduce) return;
    const a = setTimeout(() => { if (!touched.current) setOpen(true); }, 900);
    const b = setTimeout(() => { if (!touched.current) setOpen(false); }, 3000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [ready, reduce]);

  const modes = useMemo(() => modesFor(item, open ? 'open' : 'closed'), [item, open]);
  const on = live && gl === true;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* чертёж — только если WebGL недоступен */}
      {live && (gl === false || (late && !ready)) && (
        <div className="rc-reveal relative" style={{ filter: 'drop-shadow(0 18px 22px rgba(11,21,48,.25))' }}>
          {fallback}
        </div>
      )}
      {on && (
        <>
          <div className="absolute inset-0" style={{ opacity: ready ? 1 : 0, transition: 'opacity .4s var(--e-out)', pointerEvents: 'none' }} aria-hidden="true">
            <Scene item={item} col={null} dark={dark} modes={modes} onTap={() => {}} reduce={reduce} variant="hero" pxH={h} onReady={() => setReady(true)} />
          </div>
          {/* зона наведения: мышь — открывает/закрывает, тач — по нажатию */}
          <div
            className="absolute"
            style={{ left: '50%', top: '50%', width: w + 50, height: h + 50, transform: 'translate(-50%,-50%)', cursor: 'pointer', touchAction: 'pan-y' }}
            aria-hidden="true"
            onPointerDown={(e) => { kind.current = e.pointerType; }}
            onPointerEnter={(e) => { if (e.pointerType !== 'touch') { touched.current = true; setOpen(true); } }}
            onPointerLeave={(e) => { if (e.pointerType !== 'touch') setOpen(false); }}
            onClick={() => { if (kind.current === 'touch') { touched.current = true; setOpen((o) => !o); } }}
          />
        </>
      )}
    </div>
  );
}
