'use client';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';

/** Клики по элементам с data-track="событие" (+ data-* как параметры) уходят в аналитику */
export default function Tracker() {
  useEffect(() => {
    const on = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>('[data-track]');
      if (!el) return;
      const { track: ev, ...rest } = el.dataset;
      track(ev!, rest);
    };
    document.addEventListener('click', on);
    return () => document.removeEventListener('click', on);
  }, []);
  return null;
}
