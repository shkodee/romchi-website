'use client';
// 3D-вид изделия. Настоящее WebGL-3D грузится только при открытии (three.js ~ отдельным чанком);
// без WebGL — лёгкий CSS-вид (View3DCss).
import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { CDict } from '@/lib/citizen/i18n';
import type { Item } from '@/lib/citizen/model';

interface Props { t: CDict; item: Item; col: string | null; onClose: () => void }

const Gl = dynamic(() => import('./View3DGL'), {
  ssr: false,
  loading: () => (
    <div className="rc-modal" aria-busy="true">
      <div className="rc-sheet" style={{ padding: 24, minHeight: 200, display: 'grid', placeItems: 'center' }}>
        <div className="rc-spin" role="status" aria-label="Loading" />
      </div>
    </div>
  ),
});
const Css = dynamic(() => import('./View3DCss'), { ssr: false });

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch { return false; }
}

export default function View3D(props: Props) {
  const [gl] = useState(() => typeof document !== 'undefined' && webglOk());
  return gl ? <Gl {...props} /> : <Css {...props} />;
}
