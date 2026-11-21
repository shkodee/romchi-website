import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Home from '@/components/sections/Home';
import MasterShell from '@/components/MasterShell';
import { getDict, isLang } from '@/lib/i18n';

// Страница для мастеров (бывшая главная): возможности приложения, Premium, FAQ.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = getDict(lang);
  return { title: d.meta.title, description: d.meta.description, alternates: { canonical: `/${lang}/ustalar/`, languages: { uz: '/uz/ustalar/', ru: '/ru/ustalar/' } } };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <MasterShell lang={lang}><Home d={getDict(lang)} lang={lang} /></MasterShell>;
}
