// Оригинальный логотип Romchi. «Rom» берёт цвет текста (currentColor): чёрный на светлом, белый на тёмном.
import { BRAND_BLUE, LOGO_BOX, LOGO_CHI, LOGO_H, LOGO_ROM, LOGO_STAR, LOGO_W } from '@/lib/brand';

export default function LogoMark({ height = 28, className }: { height?: number; className?: string }) {
  return (
    <svg width={(height * LOGO_W) / LOGO_H} height={height} viewBox={`0 0 ${LOGO_W} ${LOGO_H}`} role="img" aria-label="Romchi" className={className} style={{ display: 'block', flex: 'none' }}>
      <path d={LOGO_ROM} fill="currentColor" />
      <path d={LOGO_BOX} fill={BRAND_BLUE} />
      <path d={LOGO_CHI} fill="#fff" />
      <path d={LOGO_STAR} fill="#fff" />
    </svg>
  );
}
