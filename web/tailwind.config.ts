import type { Config } from 'tailwindcss';

// Токены из утверждённого стиля (Чат 1, ноябрь 2026)
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0A6CFF', deep: '#0A5CF0', dark: '#0A4FD0', soft: '#E1EBFF' },
        sun: { DEFAULT: '#FFC529', soft: '#FFE7A3', ink: '#7A5600' },
        navy: { DEFAULT: '#0B1530', 2: '#1A2650' },
        night: '#08112A',
        grid: '#F3F6FC',
        cream: '#FFF6DE',
        mint: '#EAF9F0',
        muted: '#5B6478',
        line: '#DCE4F2',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { wrap: '1240px' },
      borderRadius: { '4xl': '32px', '5xl': '40px' },
      boxShadow: {
        card: '0 10px 30px rgba(11,21,48,.06)',
        float: '0 24px 50px rgba(11,21,48,.18)',
        frag: '0 30px 60px rgba(11,21,48,.18)',
      },
      keyframes: {
        marquee: { from: { transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        bob: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        bob: 'bob 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
export default config;
