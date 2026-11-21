import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Flow from '@/components/citizen/Flow';
import { isLang } from '@/lib/i18n';
import { cdict } from '@/lib/citizen/i18n';

// Конструктор и путь до мастеров. Шаг — в ?q=…, состояние — в localStorage.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = cdict(lang);
  return {
    title: `${t.kTitle} — ${t.meta.title}`,
    description: t.meta.desc,
    alternates: { canonical: `/${lang}/maket/`, languages: { uz: '/uz/maket/', ru: '/ru/maket/' } },
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <Flow lang={lang} />;
}
