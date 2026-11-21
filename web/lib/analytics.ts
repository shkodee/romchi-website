// События аналитики (план, п. 5). Пишем в dataLayer — подключается GTM/GA4 или Яндекс Метрика.
// Список событий: demo_open, demo_template, demo_resize, demo_profile, demo_color, demo_compare,
// demo_pdf, demo_share, download_click, telegram_click, lead_submit
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window { dataLayer?: unknown[]; ym?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void }
}

export function track(event: string, params: Params = {}) {
  if (typeof window === 'undefined') return;
  (window.dataLayer ||= []).push({ event, ...params });
  const ymId = process.env.NEXT_PUBLIC_YM_ID;
  if (ymId && window.ym) window.ym(Number(ymId), 'reachGoal', event, params);
  // Meta Pixel (реклама в Instagram): стандартные события + свои шаги воронки
  if (window.fbq) {
    if (event === 'ViewContent' || event === 'Lead') window.fbq('track', event, params);
    else window.fbq('trackCustom', event, params);
  }
  if (process.env.NODE_ENV === 'development') console.debug('[track]', event, params);
}

/** UTM и fbclid из рекламы — в sessionStorage, уходят вместе с заявкой */
export function captureUtm() {
  try {
    const sp = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries([...sp].filter(([k]) => k.startsWith('utm_') || k === 'fbclid'));
    if (Object.keys(utm).length) sessionStorage.setItem('rc-utm', JSON.stringify(utm));
  } catch { /* нет sessionStorage */ }
}
