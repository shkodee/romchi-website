'use client';
// Настоящее 3D окна/двери из данных конструктора (React Three Fiber).
// Свет, тени, дерево (повтор 150 мм) и анимация открывания повторяют вьюер приложения Romchi
// (3d.romchi.uz): сначала ручка 400 мс, затем створка 600 мс; откидывание 1500 мс; ease accelerate-decelerate.
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer, OrbitControls, useCursor, useTexture } from '@react-three/drei';
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { COLORS, clamp, colWidths, tpl, type Item, type Open } from '@/lib/citizen/model';
import { canTilt, canTurn, type Mode } from '@/lib/citizen/modes';
export { hasTilt, hasTurn, modesFor, nextMode, type Cmd, type Mode } from '@/lib/citizen/modes';


// ---------- геометрия ----------
interface Layout {
  W: number; H: number; t: number; archR: number; cy: number; arch: boolean; sill: boolean;
  secs: { x: number; w: number; y0: number; y1: number; open: Open; panel: number }[];
}

function layout(it: Item): Layout {
  const T = tpl(it.tpl);
  const W = it.W / 100, H = it.H / 100;
  const t = clamp(Math.min(W, H) * 0.052, 0.05, 0.075);
  const archR = T.arch ? Math.min(W / 2, H * 0.6) : 0;
  const cy = H / 2 - archR;
  const top = archR ? cy - t : H / 2 - t;
  const bot = -H / 2 + t;
  const ws = colWidths(it);
  const avail = W - 2 * t - (it.cols.length - 1) * t;
  let x = -W / 2 + t;
  const secs = it.cols.map((c, i) => {
    const w = (avail * ws[i]) / it.W;
    const s = { x, w, y0: bot, y1: top, open: c.open, panel: c.panel ? (top - bot) * c.panel : 0 };
    x += w + t;
    return s;
  });
  return { W, H, t, archR, cy, arch: !!archR, sill: T.cat === 'deraza' || T.cat === 'boshqa', secs };
}

const rectPath = (p: THREE.Path, x0: number, y0: number, x1: number, y1: number) => {
  p.moveTo(x0, y0); p.lineTo(x1, y0); p.lineTo(x1, y1); p.lineTo(x0, y1); p.closePath();
};
/** контур стеклянной арки над импостом */
const archPath = (p: THREE.Path, L: Layout) => {
  const rx = L.W / 2 - L.t, ry = L.archR - L.t;
  p.moveTo(-rx, L.cy); p.lineTo(rx, L.cy); p.absellipse(0, L.cy, rx, ry, 0, Math.PI, false, 0); p.closePath();
};
function outerShape(L: Layout) {
  const s = new THREE.Shape();
  const w = L.W / 2, h = L.H / 2;
  if (L.arch) { s.moveTo(-w, -h); s.lineTo(w, -h); s.lineTo(w, L.cy); s.absellipse(0, L.cy, w, L.archR, 0, Math.PI, false, 0); s.closePath(); }
  else rectPath(s, -w, -h, w, h);
  return s;
}

const SEG = 28;
/** выдавливание со скошенной кромкой; габарит по глубине = depth, габарит контура = shape */
function extrude(shape: THREE.Shape, depth: number, bevel = 0.003) {
  const d = depth - 2 * bevel;
  const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 2, curveSegments: SEG });
  g.translate(0, 0, -d / 2);
  return g;
}
function ringGeo(w: number, h: number, ins: number, depth: number) {
  const s = new THREE.Shape(); rectPath(s, -w / 2, -h / 2, w / 2, h / 2);
  const hole = new THREE.Path(); rectPath(hole, -w / 2 + ins, -h / 2 + ins, w / 2 - ins, h / 2 - ins);
  s.holes.push(hole);
  return extrude(s, depth, 0);
}
function useGeo(make: () => THREE.BufferGeometry, deps: unknown[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const g = useMemo(make, deps);
  useEffect(() => () => g.dispose(), [g]);
  return g;
}

// ---------- материалы ----------
function Tex({ id }: { id: string }) {
  const map = useTexture(`/colors/${id}.webp`);
  useMemo(() => {
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1 / 0.15, 1 / 0.15); // как в приложении: 150 мм
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = 8;
    map.needsUpdate = true;
  }, [map]);
  return <meshStandardMaterial map={map} roughness={0.6} metalness={0} />;
}
function Profile({ col, dark }: { col: string | null; dark: boolean }) {
  const id = col ?? (dark ? 'oq' : null);
  if (id && id !== 'oq') {
    const avg = COLORS.find((c) => c.id === id)?.avg;
    return <Suspense fallback={<meshStandardMaterial color={avg} roughness={0.6} />}><Tex id={id} /></Suspense>;
  }
  const white = id === 'oq';
  return <meshPhysicalMaterial color={white ? '#F4F6F9' : '#3D434E'} roughness={white ? 0.42 : 0.5} metalness={white ? 0 : 0.12} clearcoat={0.25} clearcoatRoughness={0.45} />;
}
const GlassMat = () => <meshPhysicalMaterial color="#9ED8EC" emissive="#2F7FA3" emissiveIntensity={0.35} roughness={0.06} metalness={0} transparent opacity={0.4} envMapIntensity={1.5} clearcoat={1} clearcoatRoughness={0.05} depthWrite={false} />;
const Rubber = () => <meshStandardMaterial color="#121416" roughness={0.9} />;
const Metal = () => <meshStandardMaterial color="#B3B9C1" metalness={0.8} roughness={0.32} />;

// ---------- узоры (раскладка) ----------
const GoldMat = () => <meshStandardMaterial color="#D9A93A" metalness={0.75} roughness={0.32} />;
function Bars({ w, h, uzor, x = 0, y = 0 }: { w: number; h: number; uzor: Item['uzor']; x?: number; y?: number }) {
  if (uzor === 'none') return null;
  const bw = 0.016;
  const nv = Math.max(1, Math.round(w / Math.max(0.4, h / 3)));
  const bars: { px: number; py: number; sw: number; sh: number }[] = [];
  if (uzor === 'v' || uzor === 'grid') for (let k = 1; k <= nv; k++) bars.push({ px: -w / 2 + (w * k) / (nv + 1), py: 0, sw: bw, sh: h });
  if (uzor === 'h' || uzor === 'grid') for (let k = 1; k <= 2; k++) bars.push({ px: 0, py: -h / 2 + (h * k) / 3, sw: w, sh: bw });
  if (uzor === 'cross') { bars.push({ px: 0, py: 0, sw: bw, sh: h }); bars.push({ px: 0, py: 0, sw: w, sh: bw }); }
  return (
    <group position={[x, y, 0]}>
      {bars.map((b, i) => (
        <mesh key={i} position={[b.px, b.py, 0]} castShadow><boxGeometry args={[b.sw, b.sh, 0.022]} /><GoldMat /></mesh>
      ))}
    </group>
  );
}

// ---------- рама ----------
function Frame({ L, col, dark }: { L: Layout; col: string | null; dark: boolean }) {
  const D = 0.07;
  const geo = useGeo(() => {
    const s = outerShape(L);
    if (L.arch) { const h = new THREE.Path(); archPath(h, L); s.holes.push(h); }
    for (const c of L.secs) { const h = new THREE.Path(); rectPath(h, c.x, c.open === 'fix' ? c.y0 + c.panel : c.y0, c.x + c.w, c.y1); s.holes.push(h); }
    return extrude(s, D);
  }, [L]);
  return <mesh geometry={geo} castShadow receiveShadow><Profile col={col} dark={dark} /></mesh>;
}

/** глухая секция: стекло в раме + уплотнитель + панель */
function FixedSec({ L, c, uzor, col, dark }: { L: Layout; c: Layout['secs'][number]; uzor: Item['uzor']; col: string | null; dark: boolean }) {
  const gy0 = c.y0 + c.panel, gh = c.y1 - gy0, cx = c.x + c.w / 2, cyy = gy0 + gh / 2;
  const ring = useGeo(() => ringGeo(c.w, gh, 0.014, 0.016), [c.w, gh]);
  return (
    <group>
      <mesh position={[cx, cyy, 0]}><boxGeometry args={[c.w + 0.02, gh + 0.02, 0.012]} /><GlassMat /></mesh>
      <mesh geometry={ring} position={[cx, cyy, 0.012]}><Rubber /></mesh>
      <Bars w={c.w - 0.03} h={gh - 0.03} uzor={uzor} x={cx} y={cyy} />
      {c.panel > 0 && (
        <mesh position={[cx, c.y0 + c.panel / 2, 0.035 + 0.005]} castShadow receiveShadow>
          <boxGeometry args={[c.w - L.t * 1.3, c.panel - L.t * 0.9, 0.012]} /><Profile col={col} dark={dark} />
        </mesh>
      )}
    </group>
  );
}

// ---------- створка ----------
type Ch = 'lever' | 'frame' | 'tilt';
interface Tw { ch: Ch; from: number; to: number; dur: number; t0: number; then?: () => void }
const easeAD = (p: number) => Math.cos((p + 1) * Math.PI) / 2 + 0.5;
const phase = (x: number, s: number, e: number) => (x <= s ? 0 : x >= e ? 1 : (x - s) / (e - s));

function Sash({ L, c, mode, uzor, col, dark, reduce, onTap }: {
  L: Layout; c: Layout['secs'][number]; mode: Mode; uzor: Item['uzor']; col: string | null; dark: boolean; reduce: boolean; onTap: () => void;
}) {
  const o = c.open;
  const slide = o.startsWith('slide');
  const hingeLeft = o === 'turnL' || o === 'ttL';
  const turnType = canTurn(o) && !slide;
  const tiltOnly = o === 'tilt';
  const g = 0.004, ts = L.t * 0.8;
  const Ds = slide ? 0.05 : 0.058;
  const sw = c.w - 2 * g, sh = c.y1 - c.y0 - 2 * g;
  const cx = c.x + c.w / 2, cyS = (c.y0 + c.y1) / 2;
  const yb = c.y0 + g; // низ створки в мировых координатах
  const hb = -sh / 2 + (c.panel > 0 ? c.panel + ts * 0.6 : ts); // низ проёма (локально)
  const ht = sh / 2 - ts;
  const hw = sw - 2 * ts, hh = ht - hb, hcy = (hb + ht) / 2;
  const hingeX = hingeLeft ? c.x + g : c.x + c.w - g;
  const px = turnType ? hingeX + (hingeLeft ? 0.028 : -0.028) : cx;
  const lane = slide ? (o === 'slideR' ? 0.026 : -0.026) : 0.004;

  const body = useGeo(() => {
    const s = new THREE.Shape(); rectPath(s, -sw / 2, -sh / 2, sw / 2, sh / 2);
    const h = new THREE.Path(); rectPath(h, -hw / 2, hb, hw / 2, ht); s.holes.push(h);
    return extrude(s, Ds);
  }, [sw, sh, hw, hb, ht, Ds]);
  const ring = useGeo(() => ringGeo(hw, hh, 0.012, 0.02), [hw, hh]);

  const g1 = useRef<THREE.Group>(null);
  const g2 = useRef<THREE.Group>(null);
  const hd = useRef<THREE.Group>(null);
  const val = useRef<Record<Ch, number>>({ lever: 0, frame: 0, tilt: 0 });
  const tws = useRef<Tw[]>([]);
  const [hover, setHover] = useState(false);
  useCursor(hover);

  const apply = () => {
    const v = val.current;
    if (g1.current) {
      if (slide) g1.current.position.x = px + (o === 'slideR' ? 1 : -1) * c.w * 0.9 * v.frame;
      else g1.current.rotation.y = (hingeLeft ? -1 : 1) * 1.5 * v.frame;
    }
    if (g2.current) g2.current.rotation.x = 0.21 * phase(v.tilt, 0.27, 1);
    if (hd.current) {
      const th = phase(v.tilt, 0, 0.27) * (tiltOnly ? Math.PI / 2 : Math.PI);
      hd.current.rotation.z = v.lever * (hingeLeft ? -1 : 1) * (Math.PI / 2) + th;
    }
  };

  const tween = (ch: Ch, to: number, dur: number, then?: () => void) => {
    tws.current = tws.current.filter((t) => t.ch !== ch);
    tws.current.push({ ch, from: val.current[ch], to, dur: reduce ? 1 : dur, then, t0: performance.now() });
  };

  useEffect(() => {
    const wantTurn = mode === 'turn', wantTilt = mode === 'tilt';
    tws.current = tws.current.filter((t) => t.ch === 'tilt');
    if (slide) tween('frame', wantTurn ? 1 : 0, 900);
    else if (turnType) {
      // как в приложении: открыть = ручка 400 мс → створка 600 мс; закрыть = створка → ручка
      if (wantTurn) tween('lever', 1, 400, () => tween('frame', 1, 600));
      else tween('frame', 0, 600, () => tween('lever', 0, 400));
    }
    if (canTilt(o)) tween('tilt', wantTilt ? 1 : 0, 1500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useLayoutEffect(apply);
  useFrame(() => {
    const list = tws.current;
    if (!list.length) return;
    const now = performance.now();
    const done: Tw[] = [];
    for (const tw of list) {
      const p = Math.min(1, (now - tw.t0) / tw.dur);
      val.current[tw.ch] = tw.from + (tw.to - tw.from) * easeAD(p);
      if (p >= 1) done.push(tw);
    }
    if (done.length) { tws.current = list.filter((t) => !done.includes(t)); for (const d of done) d.then?.(); }
    apply();
  });

  return (
    <group ref={g1} position={[px, cyS, lane]}>
      <group ref={g2} position={[0, yb - cyS, 0]}>
        <group
          position={[cx - px, cyS - yb, 0]}
          onClick={(e) => { e.stopPropagation(); if (e.delta <= 6) onTap(); }}
          onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
          onPointerOut={() => setHover(false)}
        >
          <mesh geometry={body} castShadow receiveShadow><Profile col={col} dark={dark} /></mesh>
          <mesh position={[0, hcy, 0]}><boxGeometry args={[hw + 0.02, hh + 0.02, 0.012]} /><GlassMat /></mesh>
          <mesh geometry={ring} position={[0, hcy, 0.01]}><Rubber /></mesh>
          <Bars w={hw - 0.03} h={hh - 0.03} uzor={uzor} y={hcy} />
          {c.panel > 0 && (
            <mesh position={[0, -sh / 2 + ts * 0.5 + (c.panel - ts * 0.9) / 2, Ds / 2 + 0.004]} castShadow receiveShadow>
              <boxGeometry args={[sw - ts * 1.8, c.panel - ts * 0.9, 0.012]} /><Profile col={col} dark={dark} />
            </mesh>
          )}
          {/* ручка */}
          {(turnType || tiltOnly || canTilt(o) || slide) && (
            <group ref={hd} position={tiltOnly ? [0, sh / 2 - ts / 2, Ds / 2] : [hingeLeft || o === 'slideL' ? sw / 2 - ts / 2 : -sw / 2 + ts / 2, hcy, Ds / 2]}>
              <mesh position={[0, 0, 0.003]} castShadow><boxGeometry args={[0.034, 0.05, 0.006]} /><Metal /></mesh>
              <mesh position={[0, -0.04, 0.015]} castShadow><capsuleGeometry args={[0.009, 0.075, 4, 10]} /><Metal /></mesh>
            </group>
          )}
          {/* петли */}
          {turnType && [0.14, -0.14].map((k, i) => (
            <mesh key={i} position={[hingeLeft ? -sw / 2 + 0.006 : sw / 2 - 0.006, k < 0 ? hb + 0.1 : ht - 0.1, Ds / 2 + 0.002]} castShadow>
              <boxGeometry args={[0.018, 0.075, 0.012]} /><Metal />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// ---------- сцена ----------
function Fit({ L, resetKey }: { L: Layout; resetKey: number }) {
  const { camera, size } = useThree();
  const controls = useThree((s) => s.controls) as unknown as { update?: () => void; target?: THREE.Vector3; minDistance: number; maxDistance: number } | null;
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const tn = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const a = size.width / Math.max(1, size.height);
    const d = Math.max((L.H * 1.5) / 2 / tn, (L.W * 1.5) / 2 / (tn * a));
    cam.position.set(d * 0.45, d * 0.2, d);
    cam.near = d / 50; cam.far = d * 40; cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);
    if (controls) { controls.target?.set(0, 0, 0); controls.minDistance = d * 0.5; controls.maxDistance = d * 1.8; controls.update?.(); }
  }, [camera, size.width, size.height, L, controls, resetKey]);
  return null;
}

/** hero: окно поворачивается лицом к курсору (на тач и без движения мыши — мягко покачивается) */
function Rig({ on, children }: { on: boolean; children: React.ReactNode }) {
  const g = useRef<THREE.Group>(null);
  const gl = useThree((s) => s.gl);
  const tgt = useRef({ x: 0, y: 0, last: 0 });
  useEffect(() => {
    if (!on) return;
    const mv = (e: PointerEvent) => {
      const r = gl.domElement.getBoundingClientRect();
      tgt.current.y = clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth * 0.5), -1, 1) * 0.55;
      tgt.current.x = clamp((e.clientY - (r.top + r.height / 2)) / (window.innerHeight * 0.5), -1, 1) * 0.28;
      tgt.current.last = performance.now();
    };
    window.addEventListener('pointermove', mv, { passive: true });
    return () => window.removeEventListener('pointermove', mv);
  }, [on, gl]);
  useFrame((s, dt) => {
    if (!on || !g.current) return;
    const idle = performance.now() - tgt.current.last > 2500;
    const ty = idle ? Math.sin(s.clock.elapsedTime * 0.6) * 0.3 : tgt.current.y;
    const tx = idle ? Math.sin(s.clock.elapsedTime * 0.45) * 0.08 : tgt.current.x;
    g.current.rotation.y = THREE.MathUtils.damp(g.current.rotation.y, ty, 4, dt);
    g.current.rotation.x = THREE.MathUtils.damp(g.current.rotation.x, tx, 4, dt);
  });
  return <group ref={g}>{children}</group>;
}

/** hero: окно занимает ровно pxH пикселей по высоте canvas (совпадает с чертёжными линиями) */
function FitHero({ L, pxH }: { L: Layout; pxH: number }) {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const tn = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const d = (L.H * size.height) / (pxH * 2 * tn);
    cam.position.set(0, 0, d);
    cam.near = d / 50; cam.far = d * 40; cam.updateProjectionMatrix();
    cam.lookAt(0, 0, 0);
  }, [camera, size.height, L, pxH]);
  return null;
}

/** сообщает, что сцена отрисовала несколько кадров (можно прятать запасной чертёж) */
function Ready({ cb }: { cb?: () => void }) {
  const n = useRef(0);
  useFrame(() => { if (n.current < 3 && ++n.current === 3) cb?.(); });
  return null;
}

export default function WindowScene({ item, col, dark, modes, onTap, rotate, onUserRotate, resetKey, reduce, variant = 'view', pxH = 200, onReady }: {
  item: Item; col: string | null; dark: boolean; modes: Mode[]; onTap: (i: number) => void;
  rotate?: boolean; onUserRotate?: () => void; resetKey?: number; reduce: boolean;
  variant?: 'view' | 'hero'; pxH?: number; onReady?: () => void;
}) {
  const L = useMemo(() => layout(item), [item]);
  const M = Math.max(L.W, L.H);
  const r = M * 0.75;
  const hero = variant === 'hero';
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ fov: hero ? 26 : 30, position: [0, 0, 5] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 1.05; }}
      style={{ touchAction: hero ? 'pan-y' : 'none' }}
    >
      <hemisphereLight args={[0xdfe8f5, 0x6b7178, 0.75]} />
      <directionalLight position={[M * 0.7, M * 1.3, M * 0.9]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004}
        shadow-camera-left={-r} shadow-camera-right={r} shadow-camera-top={r} shadow-camera-bottom={-r} shadow-camera-near={M * 0.05} shadow-camera-far={M * 5} />
      <directionalLight position={[-2, -0.5, -1.5]} intensity={0.35} color="#EAF0FF" />
      <directionalLight position={[-1, 1.5, -2]} intensity={0.5} />
      {/* локальное окружение (без загрузки HDR): отражения в стекле и металле */}
      <Environment resolution={128} environmentIntensity={0.9}>
        <Lightformer intensity={2} position={[0, 3, 3]} scale={[6, 2, 1]} />
        <Lightformer intensity={1.2} color="#CFE0FF" position={[-4, 0, 2]} scale={[2, 4, 1]} />
        <Lightformer intensity={1} color="#FFE7A3" position={[4, 1, 1]} scale={[2, 3, 1]} />
      </Environment>

      <Rig on={hero && !reduce}>
        <Frame L={L} col={col} dark={dark} />
        {L.arch && (
          <ArchGlass L={L} />
        )}
        {L.secs.map((c, i) =>
          c.open === 'fix'
            ? <FixedSec key={i} L={L} c={c} uzor={item.uzor} col={col} dark={dark} />
            : <Sash key={i} L={L} c={c} mode={modes[i] ?? 'closed'} uzor={item.uzor} col={col} dark={dark} reduce={reduce} onTap={() => onTap(i)} />,
        )}
        {L.sill && (
          <mesh position={[0, -L.H / 2 - 0.0175, 0.075]} castShadow receiveShadow>
            <boxGeometry args={[L.W + 0.14, 0.035, 0.2]} /><meshStandardMaterial color="#F4F6F9" roughness={0.45} />
          </mesh>
        )}
      </Rig>
      {hero ? (
        <>
          <FitHero L={L} pxH={pxH} />
          <Ready cb={onReady} />
        </>
      ) : (
        <>
          <ContactShadows position={[0, -L.H / 2 - (L.sill ? 0.06 : 0.01), 0]} opacity={0.32} scale={M * 2.4} blur={2.4} far={M * 0.8} resolution={512} />
          <OrbitControls makeDefault enablePan={false} enableDamping minPolarAngle={0.9} maxPolarAngle={2.0} autoRotate={rotate} autoRotateSpeed={1} onStart={onUserRotate} />
          <Fit L={L} resetKey={resetKey ?? 0} />
        </>
      )}
    </Canvas>
  );
}

function ArchGlass({ L }: { L: Layout }) {
  const geo = useGeo(() => {
    const s = new THREE.Shape(); archPath(s, L);
    return new THREE.ExtrudeGeometry(s, { depth: 0.012, bevelEnabled: false, curveSegments: SEG }).translate(0, 0, -0.006);
  }, [L]);
  return <mesh geometry={geo}><GlassMat /></mesh>;
}
