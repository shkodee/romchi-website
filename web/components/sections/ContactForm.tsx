'use client';
import { useState, type FormEvent } from 'react';
import type { Dict, Lang } from '@/lib/i18n';
import { track } from '@/lib/analytics';

/**
 * Форма заявки. Отправляет POST на NEXT_PUBLIC_LEAD_ENDPOINT (бэкенд, Чат 3 → БД + Telegram-бот).
 * Пока бэкенда нет — показывает ошибку и предлагает Telegram.
 * Поле "website" — ловушка для ботов (должно остаться пустым).
 */
export default function ContactForm({ t, lang }: { t: Dict['contact']; lang: Lang }) {
  const [state, setState] = useState<'idle' | 'sending' | 'ok' | 'err' | 'invalid'>('idle');

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get('website')) return;
    const name = String(fd.get('name') || '').trim();
    const phone = String(fd.get('phone') || '').trim();
    if (!name || phone.replace(/\D/g, '').length < 9) { setState('invalid'); return; }
    setState('sending');
    try {
      const url = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;
      if (!url) throw new Error('no endpoint');
      const res = await fetch(url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message: String(fd.get('message') || ''), lang, source: 'site', page: location.pathname }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState('ok');
      track('lead_submit', { lang });
      form.reset();
    } catch { setState('err'); }
  };

  const fld = 'flex flex-col gap-2 text-sm font-bold text-white';
  const inp = 'focus-ring rounded-[14px] border-0 bg-white px-[18px] py-4 text-base font-medium text-navy placeholder:text-[#8A93A6]';

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-[32px] border border-white/20 bg-white/10 p-6 sm:p-9">
      <div className="grid gap-3.5 sm:grid-cols-2">
        <label className={fld}>{t.name}<input name="name" type="text" autoComplete="name" required placeholder={t.namePh} className={inp} /></label>
        <label className={fld}>{t.tel}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required placeholder="+998" className={inp} /></label>
      </div>
      <label className={fld}>{t.msg}<textarea name="message" rows={3} placeholder={t.msgPh} className={inp} /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={state === 'sending'} className="btn btn-sun focus-ring border-0 disabled:opacity-60">
          {state === 'sending' ? t.sending : t.send}
        </button>
        <p role="status" aria-live="polite" className="m-0 text-[15px] font-bold text-white">
          {state === 'ok' && t.ok}
          {state === 'err' && t.err}
          {state === 'invalid' && t.required}
        </p>
      </div>
    </form>
  );
}
