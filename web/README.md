# Romchi — сайт (фронтенд, Чат 2)

Next.js 15 (App Router, статический экспорт) · TypeScript · Tailwind CSS · GSAP + ScrollTrigger · Lenis · three.js / React Three Fiber.
Стиль — по утверждённым макетам Чата 1 (светлая сетка, #0A6CFF / #FFC529 / #0B1530, Manrope 800).

## Запуск

```bash
npm install
npm run dev        # http://localhost:3000 → /uz/
npm run build      # статический сайт в out/ (можно положить на любой хостинг/CDN, nginx, Vercel)
```

## Страницы

| Путь | Что |
|---|---|
| `/` | редирект на `/uz/` или `/ru/` по языку браузера (на своём сервере лучше 302 в nginx) |
| `/uz/`, `/ru/` | **сайт для граждан**: «Derazangiz narxini 1 daqiqada bilib oling», ползунок ширины, 6 типов (DESIGN.md) |
| `/uz/maket/?q=turi…tayyor` | путь гражданина: Namunalar → Konstruktor → Buyurtma → Rang → Narx → Hudud → Ustalar → Tayyor |
| `/uz/ustalar/`, `/ru/ustalar/` | старая главная для мастеров (hero с 3D, story-блоки, Premium, FAQ) |
| `/uz/sinab/`, `/ru/sinab/` | старый демо-калькулятор для мастеров |

## Структура

Сайт для граждан:
```
components/citizen/Main.tsx         главная для граждан
components/citizen/Flow.tsx         путь по шагам (?q=…), шапка с 5 сегментами, тосты (sonner)
components/citizen/steps/*.tsx      Namunalar, Konstruktor, Buyurtma, Rang, Narx, Hudud, Ustalar, Tayyor
components/citizen/WindowDrawing.tsx окно/дверь/арка «как в приложении» (SVG, текстура цвета)
components/citizen/View3D.tsx       лёгкий 3D-вид (CSS), полное 3D/AR — в приложении
lib/citizen/model.ts                шаблоны (16), цвета (18), уровни, бренды, ДЕМО-цена priceOf()
lib/citizen/store.ts                состояние (localStorage) и ссылка «Ulashish» (?m=…)
lib/citizen/i18n.ts                 тексты uz/ru
app/citizen.css                     стили rc-* (светлая и тёмная тема)
```

Сайт для мастеров (старый):

```
app/[lang]/layout.tsx      шапка, футер, SEO (hreflang, Open Graph, JSON-LD), Motion, Tracker
app/[lang]/page.tsx        главная
app/[lang]/sinab/page.tsx  демо
components/sections/Home.tsx   все секции главной
components/demo/Demo.tsx       демо: шаблоны, ползунки, профиль, цвет, цена, раскрой, сравнение, PDF, ссылка
components/demo/Drawing.tsx    2D-чертёж в стиле приложения (C1/F1, линии открывания, размеры)
components/Window3D.tsx        процедурное 3D-окно (R3F); створки открываются по прогрессу скролла
components/Lazy3D.tsx          ленивая загрузка 3D: только у экрана, при наличии WebGL и без reduced-motion
components/Motion.tsx          Lenis + GSAP: data-reveal, data-parallax, data-tilt
lib/demo/calc.ts               ВСЯ логика расчёта демо (чистые функции)
lib/i18n.ts                    тексты uz/ru + ссылки (сторы, Telegram, домен)
lib/analytics.ts               события → dataLayer (GTM/GA4) и Яндекс Метрика
public/screens/                скриншоты (сейчас заглушки)
```

## Что заменить перед запуском

1. **Скриншоты**: положить реальные картинки в `public/screens/` с теми же именами (`hero-ochilish.jpg`, `buyurtma-karta.jpg`, …, список — в `components/ui.tsx`, тип `ScreenKey`) и поставить `SCREEN_EXT = 'jpg'`. Желательно WebP/JPG ≤ 150 КБ.
2. **Ссылки**: `LINKS` в `lib/i18n.ts` — App Store, Google Play, Telegram, домен.
3. **Плейсхолдеры в текстах** `[...]`: цена Premium, пункты бесплатного тарифа, ответы FAQ, телефон.
4. **Формулы демо**: когда команда приложения отдаст формулы и шаблоны (JSON), заменить `TEMPLATES / PROFILES / COLORS / FURN` и функции `compute / cutList` в `lib/demo/calc.ts`. Интерфейс менять не нужно.
5. **Переменные окружения** (`.env.local`):
   - `NEXT_PUBLIC_LEAD_ENDPOINT` — URL API заявок (Чат 3: БД + Telegram-бот). Тело: `{name, phone, message, lang, source, page}`.
   - `NEXT_PUBLIC_YM_ID` — ID Яндекс Метрики (опционально).

## Анимации и скорость

- Появление при скролле: атрибут `data-reveal` (`left`, `right`, `scale`), задержка `data-reveal-delay`. Параллакс: `data-parallax="0.15"`. Покачивание карточек: `data-tilt`.
- Без JS и при `prefers-reduced-motion` всё видно сразу, 3D заменяется статичной иллюстрацией.
- В браузере Telegram Lenis отключён (нативный скролл надёжнее).
- three.js грузится отдельным чанком только когда 3D-блок рядом с экраном. Первая загрузка главной ≈ 109 КБ JS.
- Шрифт Manrope подключён локально (`@fontsource-variable/manrope`, латиница + кириллица), без Google Fonts.

## Демо

- Ссылка-поделиться: `/uz/sinab/?t=bb&w=2200&h=2100&p=imzo&c=lam&o=turntilt.fix` — состояние восстанавливается.
- «PDF olish»: печатная форма через диалог печати браузера («Сохранить как PDF»). Настоящий PDF-файл — задача бэкенда (Чат 3).
- Курс сума — `DEFAULT_RATE` (демо), позже брать из API.

## События аналитики

`demo_open, demo_template, demo_resize, demo_profile, demo_color, demo_compare, demo_pdf, demo_share, demo_cta, download_click, telegram_click, lead_submit`

## Дальше (следующие шаги фронтенда)

- Реальные скриншоты и видео-демо (секция 7 плана).
- Галерея примеров (секция 6) — после API/CMS.
- GLB-модели из Romchi 3D вместо процедурного окна (Чат 5), затем `<model-viewer>` + AR.
- Lighthouse-проверка на реальном хостинге (цель 90+ на мобильном).
