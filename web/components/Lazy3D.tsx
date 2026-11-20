'use client';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const Window3D = dynamic(() => import('./Window3D'), { ssr: false });

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

/**
 * Грузит three.js только когда блок рядом с экраном, есть WebGL и нет reduced-motion.
 * Иначе показывает fallback (статичная иллюстрация).
 * scrollOpen — створки открываются по мере прокрутки секции.
 */
export default function Lazy3D({
  label, fallback, interactive = false, scrollOpen = false, className = '',
}: { label: string; fallback: ReactNode; interactive?: boolean; scrollOpen?: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const progress = useRef(0.12);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !webglOk()) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!scrollOpen || !show) return;
    const section = box.current?.closest('section');
    if (!section) return;
    let raf = 0;
    const update = () => {
      const r = section.getBoundingClientRect();
      const k = Math.min(1, Math.max(0, -r.top / (r.height * 0.55)));
      progress.current = 0.12 + k * 0.88;
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [scrollOpen, show]);

  return (
    <div ref={box} className={`relative ${className}`}>
      {show ? (
        <Window3D label={label} interactive={interactive} progress={interactive ? undefined : progress} className="absolute inset-0" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">{fallback}</div>
      )}
    </div>
  );
}
