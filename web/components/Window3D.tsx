'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Float, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei';
import { useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';

/**
 * Процедурное 3D-окно в стиле Romchi: антрацитовая рама, голубое стекло, 3 створки.
 * C1 — поворотная (влево), F1 — глухая, C2 — поворотно-откидная.
 * progress (0..1) — степень открытия, обычно прогресс скролла секции.
 * Позже заменить на GLB-модели из Romchi 3D (Чат 5), API компонента сохранится.
 */

const FRAME = '#3A4250';
const W = 1.5, H = 1.5, D = 0.07, F = 0.065; // метры: 1500×1500, профиль 70 мм

function Glass({ w, h }: { w: number; h: number }) {
  return (
    <mesh>
      <boxGeometry args={[w, h, 0.012]} />
      <meshPhysicalMaterial color="#7FD6FF" transmission={0.55} roughness={0.05} metalness={0} thickness={0.02} transparent opacity={0.72} clearcoat={1} />
    </mesh>
  );
}

function Sash({ w, h, handle }: { w: number; h: number; handle?: 'left' | 'right' }) {
  const s = 0.055;
  return (
    <group>
      <RoundedBox args={[w, s, D * 0.85]} radius={0.006} position={[0, h / 2 - s / 2, 0]}><meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.25} /></RoundedBox>
      <RoundedBox args={[w, s, D * 0.85]} radius={0.006} position={[0, -h / 2 + s / 2, 0]}><meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.25} /></RoundedBox>
      <RoundedBox args={[s, h, D * 0.85]} radius={0.006} position={[-w / 2 + s / 2, 0, 0]}><meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.25} /></RoundedBox>
      <RoundedBox args={[s, h, D * 0.85]} radius={0.006} position={[w / 2 - s / 2, 0, 0]}><meshStandardMaterial color={FRAME} roughness={0.45} metalness={0.25} /></RoundedBox>
      <Glass w={w - s * 2 + 0.01} h={h - s * 2 + 0.01} />
      {handle && (
        <mesh position={[handle === 'right' ? w / 2 - s / 2 : -w / 2 + s / 2, 0, D * 0.55]}>
          <boxGeometry args={[0.018, 0.13, 0.03]} />
          <meshStandardMaterial color="#C9CED6" metalness={0.9} roughness={0.25} />
        </mesh>
      )}
    </group>
  );
}

function Window({ progress, interactive }: { progress: MutableRefObject<number>; interactive?: boolean }) {
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const root = useRef<THREE.Group>(null);
  const cw = (W - F * 2) / 3; // ширина ячейки
  const ch = H - F * 2;
  const p = useRef(0);

  useFrame((state, dt) => {
    // плавно догоняем целевой прогресс
    p.current = THREE.MathUtils.damp(p.current, progress.current, 4, dt);
    const k = p.current;
    if (left.current) left.current.rotation.y = -k * 1.25;
    if (right.current) right.current.rotation.y = k * 1.05;
    if (root.current && !interactive) {
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, -0.35 + state.pointer.x * 0.25 + k * 0.3, 3, dt);
      root.current.rotation.x = THREE.MathUtils.damp(root.current.rotation.x, 0.05 - state.pointer.y * 0.12, 3, dt);
    }
  });

  const frameMat = useMemo(() => new THREE.MeshStandardMaterial({ color: FRAME, roughness: 0.45, metalness: 0.25 }), []);

  return (
    <group ref={root} rotation={[0.05, -0.35, 0]}>
      {/* рама */}
      <mesh position={[0, H / 2 - F / 2, 0]} material={frameMat}><boxGeometry args={[W, F, D]} /></mesh>
      <mesh position={[0, -H / 2 + F / 2, 0]} material={frameMat}><boxGeometry args={[W, F, D]} /></mesh>
      <mesh position={[-W / 2 + F / 2, 0, 0]} material={frameMat}><boxGeometry args={[F, H, D]} /></mesh>
      <mesh position={[W / 2 - F / 2, 0, 0]} material={frameMat}><boxGeometry args={[F, H, D]} /></mesh>
      {/* импосты */}
      <mesh position={[-W / 2 + F + cw, 0, 0]} material={frameMat}><boxGeometry args={[0.05, ch, D]} /></mesh>
      <mesh position={[-W / 2 + F + cw * 2, 0, 0]} material={frameMat}><boxGeometry args={[0.05, ch, D]} /></mesh>
      {/* подоконник */}
      <mesh position={[0, -H / 2 - 0.015, 0.09]}>
        <boxGeometry args={[W + 0.12, 0.03, 0.22]} />
        <meshStandardMaterial color="#F4F6F9" roughness={0.6} />
      </mesh>

      {/* C1: петли слева */}
      <group ref={left} position={[-W / 2 + F, 0, 0.005]}>
        <group position={[cw / 2, 0, 0]}><Sash w={cw - 0.02} h={ch - 0.02} handle="right" /></group>
      </group>
      {/* F1: глухая */}
      <group position={[0, 0, 0]}><Glass w={cw - 0.05} h={ch - 0.03} /></group>
      {/* C2: петли справа */}
      <group ref={right} position={[W / 2 - F, 0, 0.005]}>
        <group position={[-cw / 2, 0, 0]}><Sash w={cw - 0.02} h={ch - 0.02} handle="left" /></group>
      </group>
    </group>
  );
}

export default function Window3D({
  progress,
  interactive = false,
  className = '',
  label,
}: {
  progress?: MutableRefObject<number>;
  interactive?: boolean;
  className?: string;
  label: string;
}) {
  const own = useRef(0);
  const prog = progress ?? own;
  const [open, setOpen] = useState(false);

  return (
    <div className={className} role="img" aria-label={label}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.1, 3.1], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onPointerDown={interactive ? () => { setOpen((o) => { own.current = o ? 0 : 1; return !o; }); } : undefined}
        style={{ touchAction: interactive ? 'pan-y' : 'auto' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 4, 5]} intensity={1.6} />
        {/* локальное окружение, без загрузки HDR из сети */}
        <Environment resolution={128}>
          <Lightformer intensity={2} position={[0, 3, 2]} scale={[6, 2, 1]} />
          <Lightformer intensity={1.2} color="#CFE0FF" position={[-4, 0, 2]} scale={[2, 4, 1]} />
          <Lightformer intensity={1} color="#FFE7A3" position={[4, 1, 1]} scale={[2, 3, 1]} />
        </Environment>
        {interactive ? (
          <>
            <Window progress={own} interactive />
            <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={Math.PI / 1.8} autoRotate={!open} autoRotateSpeed={0.8} />
          </>
        ) : (
          <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.35}>
            <Window progress={prog} />
          </Float>
        )}
        <ContactShadows position={[0, -0.95, 0]} opacity={0.35} scale={4} blur={2.4} far={2} />
      </Canvas>
    </div>
  );
}
