import { notFound } from 'next/navigation';
import Main from '@/components/citizen/Main';
import { isLang } from '@/lib/i18n';

// Главная для граждан (трафик из Instagram). Сайт для мастеров — /[lang]/ustalar/.
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <Main lang={lang} />;
}
