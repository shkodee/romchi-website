'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Плавный скролл (Lenis) + появление при скролле (GSAP ScrollTrigger).
 * Разметка:  data-reveal            — появление снизу
 *            data-reveal="left|right|scale"
 *            data-reveal-delay="0.1"
 *            data-parallax="0.15"  — параллакс (доля от высоты экрана)
 *            data-tilt             — плавающая карточка: лёгкое покачивание при скролле
 * При prefers-reduced-motion ничего не анимируется.
 */
export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }, { default: Lenis }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('lenis'),
      ]);
      if (cancelled) return;
      (window as unknown as { __motion?: boolean }).__motion = true;
      gsap.registerPlugin(ScrollTrigger);

      // Lenis только не в Telegram WebView (там нативный скролл надёжнее)
      const inTelegram = /Telegram/i.test(navigator.userAgent) || 'TelegramWebviewProxy' in window;
      let lenis: InstanceType<typeof Lenis> | null = null;
      const tick = (time: number) => lenis?.raf(time * 1000);
      if (!inTelegram) {
        lenis = new Lenis({ duration: 1.1, smoothWheel: true });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        // якоря через Lenis
        document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
          a.addEventListener('click', (e) => {
            const id = a.getAttribute('href')!;
            const el = id.length > 1 ? document.querySelector(id) : null;
            if (el) { e.preventDefault(); lenis!.scrollTo(el as HTMLElement, { offset: -80 }); history.replaceState(null, '', id); }
          });
        });
      }

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          const kind = el.dataset.reveal;
          const from: gsap.TweenVars =
            kind === 'left' ? { x: -60, y: 0 } : kind === 'right' ? { x: 60, y: 0 } : kind === 'scale' ? { scale: 0.92, y: 20 } : { y: 40 };
          gsap.fromTo(el, { opacity: 0, ...from }, {
            opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'power3.out',
            delay: Number(el.dataset.revealDelay || 0),
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
        gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
          const k = Number(el.dataset.parallax || 0.1);
          gsap.fromTo(el, { yPercent: 0 }, {
            y: () => -window.innerHeight * k, ease: 'none',
            scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: true },
          });
        });
        gsap.utils.toArray<HTMLElement>('[data-tilt]').forEach((el, i) => {
          gsap.to(el, {
            rotate: `+=${i % 2 ? 4 : -4}`, ease: 'none',
            scrollTrigger: { trigger: el.closest('section') ?? el, start: 'top bottom', end: 'bottom top', scrub: 1 },
          });
        });
      });
      ScrollTrigger.refresh();

      cleanup = () => {
        ctx.revert();
        gsap.ticker.remove(tick);
        lenis?.destroy();
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => { cancelled = true; cleanup(); };
  }, [pathname]);

  return null;
}
