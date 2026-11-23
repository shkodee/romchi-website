'use client';
// Социальные сети Romchi (Instagram, YouTube). Ссылки на скачивание приложения убраны по просьбе команды.
import type { CDict } from '@/lib/citizen/i18n';
import { LINKS } from '@/lib/i18n';
import { I } from './ui';

/** Instagram и YouTube Romchi: круглые кнопки-иконки (44px), открываются в новой вкладке */
export function Socials({ t, from, onDark = false }: { t: CDict; from: string; onDark?: boolean }) {
  const style = {
    width: 44, height: 44, borderRadius: '50%', display: 'grid', placeItems: 'center',
    color: onDark ? '#fff' : 'var(--ink)', border: onDark ? '1.5px solid rgba(255,255,255,.28)' : '1.5px solid var(--line)',
    background: onDark ? 'transparent' : 'var(--card)',
  } as const;
  return (
    <div className="flex items-center gap-2.5" role="group" aria-label={t.social}>
      <a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label={t.instaAria} title="Instagram" className="rc-social" style={style} data-track="social_click" data-network="instagram" data-from={from}>{I.instagram(22)}</a>
      <a href={LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label={t.ytAria} title="YouTube" className="rc-social" style={style} data-track="social_click" data-network="youtube" data-from={from}>{I.youtube(22)}</a>
    </div>
  );
}
