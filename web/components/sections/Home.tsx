import Link from 'next/link';
import type { Dict, Lang } from '@/lib/i18n';
import { LINKS } from '@/lib/i18n';
import { IconBolt, IconHome, IconPin, IconSend, Pill, Shot, StoreButtons, WindowArt } from '../ui';
import Lazy3D from '../Lazy3D';
import ContactForm from './ContactForm';

type P = { d: Dict; lang: Lang };
const Y = ({ c }: { c: string }) => <span className="text-sun">{c}</span>;
const B = ({ c }: { c: string }) => <span className="text-brand">{c}</span>;
const sp = (s: string) => (s ? ` ${s}` : '');

/* ---------------- HERO ---------------- */
function Hero({ d, lang }: P) {
  const h = d.hero;
  return (
    <section id="top" className="g-light relative overflow-hidden pb-24 pt-10 sm:pt-16">
      <div className="ball ball-y animate-bob right-[6%] top-14 hidden h-[72px] w-[72px] sm:block" aria-hidden="true" />
      <div className="ball ball-b bottom-28 -left-12 h-[140px] w-[140px] opacity-70 blur-[2px]" aria-hidden="true" data-parallax="0.12" />
      <div className="wrap story">
        <div className="flex flex-col gap-7">
          <div data-reveal><Pill><IconBolt />{h.pill}</Pill></div>
          <h1 className="h1" data-reveal data-reveal-delay="0.05">{h.title1} <B c={h.title2} /></h1>
          <p className="sub max-w-[540px] text-muted" data-reveal data-reveal-delay="0.1">{h.sub}</p>
          <div id="yukla" className="scroll-mt-28" data-reveal data-reveal-delay="0.15"><StoreButtons t={h} /></div>
          <Link href={`/${lang}/sinab/`} className="btn btn-white focus-ring self-start" data-reveal data-reveal-delay="0.2" data-track="demo_cta" data-from="hero">
            {h.tryBtn}
          </Link>
        </div>

        <div className="relative min-h-[420px] sm:min-h-[560px]" data-reveal="scale">
          {/* большое 3D-окно: створки открываются при скролле */}
          <Lazy3D
            label={`Romchi 3D — 1500 × 1500 mm`}
            scrollOpen
            className="absolute inset-x-0 top-0 h-[380px] sm:h-[520px]"
            fallback={<WindowArt className="h-[78%] w-auto drop-shadow-2xl" />}
          />
          <div className="frag absolute left-0 top-2 hidden w-[190px] -rotate-[4deg] border-4 lg:block" data-tilt>
            <Shot k="hero-ochilish" alt="Ochilish turlari paneli" eager />
          </div>
          <div className="fcard bottom-24 left-0 -rotate-[5deg] sm:bottom-16" data-tilt>
            <small>{d.s1.area}</small><div className="text-[26px] font-extrabold">2.25 m²</div>
          </div>
          <div className="tag -right-1 bottom-2 rotate-[5deg] sm:-right-4 sm:bottom-6" data-tilt>
            <small>{h.total}</small>
            <div className="text-[28px] font-extrabold tracking-[-0.03em] sm:text-[34px]">4 438 320 <span className="text-[17px]">{h.sum}</span></div>
            <div className="text-base font-bold text-brand-dark">$ 368.32</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- MARQUEE ---------------- */
function Marquee({ d }: P) {
  const row = d.marquee.flatMap((w, i) => [<span key={`w${i}`}>{w}</span>, <span key={`s${i}`} className="text-sun" aria-hidden="true">✦</span>]);
  return (
    <div className="relative z-10 -mx-5 -mt-7 -rotate-2 overflow-hidden bg-navy py-[18px]" aria-label={d.marquee.join(', ')}>
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-[22px] font-extrabold tracking-[-0.01em] text-white" aria-hidden="true">
        {row}{row}
      </div>
    </div>
  );
}

/* ---------------- STORY 1: NARX ---------------- */
function Narx({ d }: P) {
  const s = d.s1;
  return (
    <section id="imk" className="g-blue relative -mt-6 scroll-mt-16 overflow-hidden pb-[104px] pt-[120px] text-white">
      <div className="ball ball-y right-[4%] top-[90px] hidden h-[110px] w-[110px] md:block" aria-hidden="true" data-parallax="0.2" />
      <div className="wrap story">
        <div className="flex flex-col gap-6" data-reveal="left">
          <Pill tone="b">{s.pill}</Pill>
          <h2 className="h2">{s.t1} <Y c={s.t2} />{sp(s.t3)}</h2>
          <p className="sub text-[#DCE8FF]">{s.sub}</p>
          <div className="flex flex-wrap gap-2">{s.chips.map((c) => <span key={c} className="chip bg-white/15">{c}</span>)}</div>
        </div>
        <div className="relative flex justify-center py-5">
          <div className="frag w-[340px] max-w-[78%] -rotate-3" data-reveal="scale"><Shot k="buyurtma-karta" alt="Buyurtma kartasi: chizma, Akfa, 4 438 320 soʻm" /></div>
          <div className="fcard left-0 top-20 -rotate-[5deg]" data-tilt><small>{s.area}</small><div className="text-[30px] font-extrabold">2.25 m²</div></div>
          <div className="tag bottom-16 right-0 rotate-[4deg]" data-tilt>
            <small>{d.hero.total}</small>
            <div className="text-[28px] font-extrabold tracking-[-0.03em]">4 438 320 <span className="text-[15px]">{d.hero.sum}</span></div>
            <div className="text-[15px] font-bold text-brand-dark">$ 368.32</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STORY 2: FASONLAR ---------------- */
function Fasonlar({ d }: P) {
  const s = d.s2;
  return (
    <section className="g-light overflow-hidden py-[104px]">
      <div className="wrap story story-rev">
        <div className="flex flex-col gap-6" data-reveal="right">
          <Pill>{s.pill}</Pill>
          <h2 className="h2">{s.t1} <B c={s.t2} /></h2>
          <p className="sub text-muted">{s.sub}</p>
          <div className="flex flex-wrap gap-2">{s.chips.map((c) => <span key={c} className="chip bg-white">{c}</span>)}</div>
        </div>
        <div className="relative pb-16 pt-2.5">
          <div className="frag w-[88%] -rotate-2" data-reveal="scale"><Shot k="fason-turlari" alt="Fason turlari: Oynalar, Eshiklar, Arkalar" /></div>
          <div className="frag absolute bottom-0 right-0 w-[52%] rotate-3" data-reveal data-reveal-delay="0.15"><Shot k="fasonlar-royxat" alt="Tayyor fasonlar roʻyxati" /></div>
          <div className="fcard bottom-10 left-[6%] flex -rotate-3 items-center gap-2.5" data-tilt>
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-brand-soft font-extrabold text-brand-deep" aria-hidden="true">✦</span>
            <b className="text-lg">{s.badge}</b>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STORY 3: KESISH ---------------- */
function Kesish({ d }: P) {
  const s = d.s3;
  const stat = 'rounded-[22px] bg-white px-6 py-[18px] shadow-[0_12px_30px_rgba(122,86,0,.1)]';
  return (
    <section className="g-cream overflow-hidden py-[104px]">
      <div className="wrap story">
        <div className="flex flex-col gap-6" data-reveal="left">
          <Pill tone="y">{s.pill}</Pill>
          <h2 className="h2">{s.t1} <B c={s.t2} />{sp(s.t3)}</h2>
          <p className="sub text-[#5E4A1A]">{s.sub}</p>
          <div className="flex flex-wrap gap-4">
            <div className={stat}><small className="text-[13px] font-semibold text-[#6B5A33]">{s.eff}</small><div className="text-[44px] font-extrabold tracking-[-0.03em] text-[#C27A00]">95.9%</div></div>
            <div className={stat}><small className="text-[13px] font-semibold text-[#6B5A33]">{s.cuts}</small><div className="text-[44px] font-extrabold tracking-[-0.03em]">{s.cutsVal}</div></div>
          </div>
        </div>
        <div className="relative py-5">
          <div className="frag rotate-2" data-reveal="scale"><Shot k="kesish-xaritasi" alt="Kesish xaritasi: Akfa 6000, samaradorlik va qoldiqlar" /></div>
          <div className="fcard -right-2 -top-1.5 rotate-[5deg]" data-tilt>
            <small>{s.rest}</small><div className="text-[28px] font-extrabold">1900 mm</div>
            <div aria-hidden="true" className="mt-2 h-2.5 rounded-[5px]" style={{ background: 'repeating-linear-gradient(45deg,#FFC529 0 5px,#FFF1C2 5px 10px)' }} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STORY 4: FOYDA ---------------- */
function Foyda({ d }: P) {
  const s = d.s4;
  return (
    <section className="g-mint overflow-hidden py-[104px]">
      <div className="wrap story story-rev">
        <div className="flex flex-col gap-6" data-reveal="right">
          <Pill tone="g">{s.pill}</Pill>
          <h2 className="h2">{s.t1} <B c={s.t2} />{sp(s.t3)}</h2>
          <p className="sub text-[#3F5A4B]">{s.sub}</p>
          <div>
            <small className="text-sm font-extrabold tracking-[.14em] text-[#0A6B36]">{s.label}</small>
            <div className="font-extrabold leading-[1.05] tracking-[-0.04em] text-[#0B8A44]" style={{ fontSize: 'clamp(44px,6vw,80px)' }}>
              +1 244 505 <span className="text-[28px]">{d.hero.sum}</span>
            </div>
            <div className="text-[22px] font-bold text-[#3F5A4B]">$ 103.27</div>
          </div>
        </div>
        <div className="relative pb-12 pt-7">
          <div className="frag -rotate-2" data-reveal="scale"><Shot k="hisob-foyda" alt="Hisob: umumiy $368.32, tannarx $258.13, foyda $103.27" /></div>
          <div className="fcard -left-2 bottom-0 -rotate-[4deg]" data-tilt>
            <small>{s.cost}</small>
            <div className="text-[28px] font-extrabold text-brand">3 111 259 <span className="text-sm">{d.hero.sum}</span></div>
            <div className="text-sm font-bold text-muted">$ 258.13</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STORY 5: 3D + AR ---------------- */
function ThreeD({ d }: P) {
  const s = d.s5;
  const fig = 'm-0 overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1736]';
  return (
    <section className="g-night relative overflow-hidden py-[104px] text-white">
      <div className="ball ball-y right-[8%] top-[70px] hidden h-[90px] w-[90px] md:block" aria-hidden="true" data-parallax="0.18" />
      <div className="wrap flex flex-col gap-12">
        <div className="flex max-w-[820px] flex-col gap-5" data-reveal>
          <Pill tone="d">{s.pill}</Pill>
          <h2 className="h2">{s.t1} <Y c={s.t2} />{sp(s.t3)}</h2>
          <p className="sub text-[#B8C2D6]">{s.sub}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <figure className={fig} data-reveal="left">
            {/* живое 3D: вращать пальцем, нажать — открыть створки */}
            <Lazy3D
              label={`${s.c1} ${s.c1s}`}
              interactive
              className="h-[420px] bg-[radial-gradient(circle_at_50%_40%,#F7F8FA,#DDE3EC)] sm:h-[560px]"
              fallback={<Shot k="romchi-3d" alt="Romchi 3D: derazaning 3D modeli" className="h-full w-full object-cover" />}
            />
            <figcaption className="px-7 py-[22px] text-xl font-extrabold">
              {s.c1} <span className="text-base font-medium text-[#B8C2D6]">{s.c1s}</span>
              <span className="mt-1 block text-[13px] font-semibold text-[#8C98B3]">↻ {s.hint}</span>
            </figcaption>
          </figure>
          <figure className={fig} data-reveal="right">
            <Shot k="ar-xona" alt="AR: deraza kamera orqali xonaga joylashtirilgan" className="block h-[420px] w-full object-cover sm:h-[560px]" />
            <figcaption className="px-7 py-[22px] text-xl font-extrabold">
              {s.c2} <span className="text-base font-medium text-[#B8C2D6]">{s.c2s} <span className="text-sun">{s.live}</span></span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STORY 6: BIZNES ---------------- */
function Biznes({ d }: P) {
  const s = d.s6;
  return (
    <section className="g-blue overflow-hidden py-[104px] text-white">
      <div className="wrap story story-rev">
        <div className="flex flex-col gap-6" data-reveal="right">
          <Pill tone="b">{s.pill}</Pill>
          <h2 className="h2">{s.t1} <Y c={s.t2} /></h2>
          <p className="sub text-[#DCE8FF]">{s.sub}</p>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {s.chips.map((c) => <span key={c} className="chip bg-white text-center text-navy">{c}</span>)}
          </div>
        </div>
        <div data-reveal="scale"><Shot k="bosh-ekran" alt="Romchi bosh ekrani" className="block h-auto w-full rounded-[32px]" /></div>
      </div>
    </section>
  );
}

/* ---------------- APP SCREENS ---------------- */
function Screens({ d }: P) {
  const s = d.screens;
  const keys = ['ekran-fasonlar', 'ekran-konstruktor', 'ekran-buyurtma', 'ekran-omborxona'] as const;
  return (
    <section className="bg-white py-[104px]">
      <div className="wrap flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-5" data-reveal>
          <div className="flex flex-col gap-[18px]"><Pill>{s.pill}</Pill><h2 className="h2">{s.t1} <B c={s.t2} /></h2></div>
          <p className="sub max-w-[380px] text-[17px] text-muted">{s.sub}</p>
        </div>
        <div className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 pt-2 sm:gap-7 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-1">
          {keys.map((k, i) => (
            <figure key={k} className="m-0 flex w-[220px] shrink-0 snap-start flex-col gap-3.5 lg:w-auto" data-reveal data-reveal-delay={String(i * 0.08)}>
              <div className="overflow-hidden rounded-[36px] border-8 border-navy bg-navy shadow-[0_20px_40px_rgba(11,21,48,.15)]">
                <Shot k={k} alt={s.items[i]} className="block w-full rounded-[28px]" />
              </div>
              <figcaption className="text-base font-extrabold">{s.items[i]}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRY TEASER ---------------- */
function Try({ d, lang }: P) {
  const s = d.tryBlock;
  const tpls = ['d1', 'd2', 'bb', 'es', 'ar'] as const;
  return (
    <section id="sinab" className="g-light scroll-mt-16 py-28">
      <div className="wrap">
        <div className="relative flex flex-col gap-12 rounded-[40px] bg-white p-7 shadow-[0_30px_80px_rgba(11,21,48,.08)] sm:p-14 lg:flex-row lg:items-center" data-reveal="scale">
          <div className="ball ball-y -right-5 -top-5 h-16 w-16" aria-hidden="true" />
          <div className="flex flex-col gap-[22px] lg:flex-1">
            <Pill>{s.pill}</Pill>
            <h2 className="h2">{s.t1} <B c={s.t2} />{sp(s.t3)}</h2>
            <p className="sub text-muted">{s.sub}</p>
            <div><Link className="btn btn-blue focus-ring" href={`/${lang}/sinab/`} data-track="demo_cta" data-from="teaser">{s.btn}</Link></div>
          </div>
          <Link href={`/${lang}/sinab/?t=d2`} className="focus-ring flex flex-col gap-[18px] rounded-[28px] bg-grid p-7 no-underline lg:flex-1" aria-label={s.btn}>
            <div className="flex flex-wrap gap-2">
              {tpls.map((id) => (
                <span key={id} className={`chip ${id === 'd2' ? 'bg-brand text-white' : 'bg-white text-navy'}`}>{d.demo.tpl[id]}</span>
              ))}
            </div>
            <svg viewBox="0 0 380 260" aria-hidden="true" className="h-auto w-full">
              <rect x="90" y="10" width="200" height="210" rx="3" fill="#3A4250" />
              <rect x="102" y="22" width="84" height="186" fill="#4CC9FF" />
              <rect x="194" y="22" width="84" height="186" fill="#4CC9FF" />
              <polyline points="194,22 236,208 278,22" fill="none" stroke="#0A4FD0" strokeWidth="1.5" strokeDasharray="5 4" />
              <line x1="90" y1="240" x2="290" y2="240" stroke="#0A6CFF" strokeWidth="2" />
              <text x="190" y="258" fill="#0A5CF0" fontSize="14" fontWeight="800" textAnchor="middle">1300</text>
              <line x1="66" y1="10" x2="66" y2="220" stroke="#0A6CFF" strokeWidth="2" />
              <text x="54" y="115" transform="rotate(-90 54 115)" fill="#0A5CF0" fontSize="14" fontWeight="800" textAnchor="middle">1400</text>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- STEPS ---------------- */
function Steps({ d }: P) {
  const s = d.steps;
  const st = [
    { bg: 'g-light', c: 'text-brand', r: '-rotate-[1.5deg]' },
    { bg: 'g-cream', c: 'text-[#C27A00]', r: 'rotate-1' },
    { bg: 'g-mint', c: 'text-[#0B8A44]', r: '-rotate-1' },
  ];
  return (
    <section className="bg-white py-[104px]">
      <div className="wrap flex flex-col gap-12">
        <h2 className="h2 max-w-[760px]" data-reveal>{s.t1} <B c={s.t2} /></h2>
        <div className="grid gap-5 md:grid-cols-3">
          {s.items.map((it, i) => (
            <div key={it.h} className={`card ${st[i].bg} ${st[i].r} shadow-none`} data-reveal data-reveal-delay={String(i * 0.1)}>
              <div className={`text-[72px] font-extrabold leading-none tracking-[-0.05em] ${st[i].c}`}>0{i + 1}</div>
              <h3 className="mt-4">{it.h}</h3><p>{it.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHO ---------------- */
function Who({ d }: P) {
  const s = d.who;
  const ic = [
    { bg: 'bg-brand-soft text-brand-deep', i: <IconBolt s={26} /> },
    { bg: 'bg-sun-soft text-sun-ink', i: <IconHome /> },
    { bg: 'bg-[#CDF1DC] text-[#0A6B36]', i: <IconPin /> },
  ];
  return (
    <section id="kim" className="g-light scroll-mt-16 py-[104px]">
      <div className="wrap flex flex-col gap-12">
        <div className="flex flex-col gap-[18px]" data-reveal><Pill>{s.pill}</Pill><h2 className="h2">{s.title}</h2></div>
        <div className="grid gap-5 md:grid-cols-3">
          {s.items.map((it, i) => (
            <div key={it.h} className="card" data-reveal data-reveal-delay={String(i * 0.1)}>
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${ic[i].bg}`}>{ic[i].i}</div>
              <h3>{it.h}</h3><p>{it.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- PREMIUM ---------------- */
function Premium({ d }: P) {
  const s = d.premium;
  const tick = (c: string) => <span aria-hidden="true" className={`font-extrabold ${c}`}>✓</span>;
  return (
    <section id="premium" className="scroll-mt-16 bg-white py-[104px]">
      <div className="wrap flex flex-col gap-12">
        <h2 className="h2" data-reveal>{s.t1} <B c={s.t2} /> {s.t3}</h2>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="card g-light flex flex-col gap-[22px] p-10 shadow-none" data-reveal="left">
            <div><h3>{s.free}</h3><div className="text-5xl font-extrabold tracking-[-0.04em]">{s.freePrice}</div></div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0 text-[#3B4558]">
              {s.freeList.map((x) => <li key={x} className="flex gap-2.5 text-base">{tick('text-brand')}{x}</li>)}
            </ul>
            <a className="btn btn-navy focus-ring mt-auto" href="#yukla" data-track="download_click" data-store="premium_free">{d.nav.download}</a>
          </div>
          <div className="card g-blue relative flex flex-col gap-[22px] p-10 text-white shadow-[0_30px_60px_rgba(10,92,240,.3)]" data-reveal="right">
            <span className="absolute right-6 top-6 rounded-full bg-sun px-3.5 py-2 text-[13px] font-extrabold text-navy">PREMIUM</span>
            <div><h3 className="!text-white">{s.prem}</h3><div className="text-5xl font-extrabold tracking-[-0.04em]">{s.premPrice} <span className="text-lg font-semibold text-[#DCE8FF]">{s.perMonth}</span></div></div>
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {s.premList.map((x) => <li key={x} className="flex gap-2.5 text-base">{tick('text-sun')}{x}</li>)}
            </ul>
            <a className="btn btn-sun focus-ring mt-auto" href="#yukla" data-track="download_click" data-store="premium">{s.premBtn}</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ (details/summary — работает без JS) ---------------- */
function Faq({ d }: P) {
  const s = d.faq;
  return (
    <section id="faq" className="g-light scroll-mt-16 py-[104px]">
      <div className="wrap flex flex-col gap-12 lg:flex-row">
        <div className="flex flex-col gap-[18px] lg:flex-1" data-reveal><Pill>{s.pill}</Pill><h2 className="h2">{s.title}</h2></div>
        <div className="flex flex-col gap-2.5 lg:flex-[2]">
          {s.items.map((it, i) => (
            <details key={it.q} className="group rounded-[18px] bg-white" open={i === 0} data-reveal data-reveal-delay={String(i * 0.05)}>
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-4 rounded-[18px] px-[26px] py-[22px] text-lg font-bold text-navy [&::-webkit-details-marker]:hidden">
                {it.q}
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[22px] text-brand-deep transition group-open:rotate-45 group-open:bg-brand group-open:text-white">+</span>
              </summary>
              <p className="m-0 px-[26px] pb-[22px] text-base leading-relaxed text-muted">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CONTACT ---------------- */
function Contact({ d, lang }: P) {
  const s = d.contact;
  return (
    <section id="aloqa" className="g-blue relative overflow-hidden py-[104px] text-white">
      <div className="ball ball-y bottom-[60px] right-[6%] h-[120px] w-[120px]" aria-hidden="true" data-parallax="0.15" />
      <div className="wrap flex flex-col gap-12 lg:flex-row lg:items-start">
        <div className="flex flex-col gap-[22px] lg:flex-1" data-reveal="left">
          <h2 className="h2">{s.t1} <Y c={s.t2} /></h2>
          <p className="sub text-[#DCE8FF]">{s.sub}</p>
          <div className="flex flex-wrap gap-3">
            <a className="btn focus-ring bg-white text-brand-deep" href={LINKS.telegram} target="_blank" rel="noopener" data-track="telegram_click">
              <IconSend />{s.tg}
            </a>
            <span className="inline-flex min-h-[56px] items-center text-xl font-extrabold">{s.phone}</span>
          </div>
        </div>
        <div className="lg:flex-[1.2]" data-reveal="right"><ContactForm t={s} lang={lang} /></div>
      </div>
    </section>
  );
}

export default function Home(p: P) {
  return (
    <>
      <Hero {...p} />
      <Marquee {...p} />
      <Narx {...p} />
      <Fasonlar {...p} />
      <Kesish {...p} />
      <Foyda {...p} />
      <ThreeD {...p} />
      <Biznes {...p} />
      <Screens {...p} />
      <Try {...p} />
      <Steps {...p} />
      <Who {...p} />
      <Premium {...p} />
      <Faq {...p} />
      <Contact {...p} />
    </>
  );
}
