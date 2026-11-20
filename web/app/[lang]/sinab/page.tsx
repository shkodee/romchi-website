import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Demo from '@/components/demo/Demo';
import { Pill, StoreButtons } from '@/components/ui';
import { getDict, isLang } from '@/lib/i18n';

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const d = getDict(lang);
  return {
    title: d.meta.demoTitle,
    description: d.meta.demoDescription,
    alternates: { canonical: `/${lang}/sinab/`, languages: { uz: '/uz/sinab/', ru: '/ru/sinab/' } },
  };
}

export default async function DemoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const d = getDict(lang);
  const t = d.demo;
  return (
    <div className="g-light py-10 sm:py-16">
      <div className="wrap flex flex-col gap-6">
        <Link href={`/${lang}/`} className="focus-ring self-start rounded text-sm font-bold text-brand-deep no-underline">{t.back}</Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-4">
            <Pill>{t.pill}</Pill>
            <h1 className="m-0 font-extrabold leading-[1.02] tracking-[-0.04em]" style={{ fontSize: 'clamp(34px,4.6vw,60px)' }}>
              {t.t1} <span className="text-brand">{t.t2}</span>{t.t3 ? ` ${t.t3}` : ''}
            </h1>
          </div>
          <p className="m-0 max-w-[380px] rounded-[14px] bg-cream px-4 py-3 text-sm text-muted">{t.note}</p>
        </div>

        <Demo t={t} lang={lang} />

        <div className="flex flex-col gap-5 rounded-[28px] bg-brand-deep px-6 py-7 text-white sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <b className="text-2xl font-extrabold tracking-[-0.02em]">{t.ctaT1} <span className="text-sun">{t.ctaT2}</span></b>
            <p className="m-0 mt-1.5 text-[15px] text-[#DCE8FF]">{t.ctaSub}</p>
          </div>
          <StoreButtons t={d.hero} />
        </div>
      </div>
    </div>
  );
}
