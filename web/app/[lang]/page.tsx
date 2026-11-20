import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Wizard from '@/components/wizard/Wizard';
import { getDict, isLang } from '@/lib/i18n';

// Главная для граждан (трафик из Instagram): сразу конструктор окна.
// Старая главная для мастеров — /[lang]/ustalar/.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = getDict(lang);
  return {
    title: d.wiz.metaTitle,
    description: d.wiz.metaDesc,
    alternates: { canonical: `/${lang}/`, languages: { uz: '/uz/', ru: '/ru/', 'x-default': '/uz/' } },
    openGraph: { title: d.wiz.metaTitle, description: d.wiz.metaDesc },
  };
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  return <Wizard t={d.wiz} demo={d.demo} send={d.send} lang={lang} />;
}
