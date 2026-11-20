import Home from '@/components/sections/Home';
import { getDict, isLang } from '@/lib/i18n';
import { notFound } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <Home d={getDict(lang)} lang={lang} />;
}
