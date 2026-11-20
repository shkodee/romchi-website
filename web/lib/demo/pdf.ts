// Печатная форма (PDF через диалог печати браузера): чертёж + общая цена. Без разбивки цены.

export function printEstimate(opts: {
  svg: SVGSVGElement | null;
  lang: string;
  title: string;
  line: string;
  totalLabel: string;
  total: string;
  note: string;
  site: string;
}) {
  const clone = opts.svg?.cloneNode(true) as SVGSVGElement | undefined;
  clone?.querySelectorAll('[data-ui]').forEach((el) => el.remove());
  const svg = (clone?.outerHTML ?? '').replace(/href="\/colors\//g, `href="${window.location.origin}/colors/`);
  const date = new Date().toLocaleDateString(opts.lang === 'ru' ? 'ru-RU' : 'uz-UZ');
  const html = `<!doctype html><html lang="${opts.lang}"><head><meta charset="utf-8"><title>${opts.title}</title>
<style>@page{size:A4;margin:16mm}body{font-family:Manrope,Arial,sans-serif;color:#0B1530;margin:0}
.logo{font-weight:800;font-size:26px;letter-spacing:-.04em;margin-bottom:14px}.logo b{background:#0077FF;color:#fff;border-radius:7px;padding:0 6px 2px}
h1{font-size:22px;margin:0 0 4px}.m{color:#5B6478;font-size:13px;margin:0 0 18px}
.svg{background:#DCE3EC;border-radius:14px;padding:8px;margin-bottom:16px}svg{width:100%;height:auto;max-height:360px}
.lbl{font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#5B6478}
.tot{font-size:32px;font-weight:800;color:#0077FF;margin:4px 0 0}
.n{margin-top:18px;font-size:12px;color:#5B6478;background:#FFF6DE;padding:10px 12px;border-radius:10px}</style></head>
<body><div class="logo">Rom<b>chi</b></div><h1>${opts.title}</h1>
<p class="m">${opts.line} · ${date}</p>
<div class="svg">${svg}</div>
<div class="lbl">${opts.totalLabel}</div><div class="tot">${opts.total}</div>
<p class="n">${opts.note} ${opts.site}</p></body></html>`;
  const fr = document.createElement('iframe');
  fr.setAttribute('aria-hidden', 'true');
  fr.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(fr);
  const d = fr.contentWindow!.document;
  d.open(); d.write(html); d.close();
  setTimeout(() => { fr.contentWindow!.focus(); fr.contentWindow!.print(); setTimeout(() => fr.remove(), 1500); }, 300);
}
