'use client';
// Тема не должна слетать при переходах (смена языка, шаги): <html data-theme> ставит скрипт при полной загрузке,
// а клиентский переход может пересоздать <html>. Здесь тема восстанавливается при каждой смене адреса.
import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeSync() {
  const path = usePathname();
  useLayoutEffect(() => {
    try {
      let t = localStorage.getItem('rc-theme');
      if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const root = document.documentElement;
      if (root.dataset.theme !== t) { root.dataset.theme = t; window.dispatchEvent(new Event('rc:theme')); }
      document.querySelector('meta[name="theme-color"]:not([media])')?.setAttribute('content', t === 'dark' ? '#0F1013' : '#F3F6FC');
    } catch { /* приватный режим — остаётся тема по умолчанию */ }
  }, [path]);
  return null;
}
