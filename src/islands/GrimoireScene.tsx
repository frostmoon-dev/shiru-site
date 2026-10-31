import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { PerformanceMonitor, RoundedBox } from '@react-three/drei';
import { gsap } from 'gsap';
import { DoubleSide, Group, Mesh, MeshLambertMaterial, PlaneGeometry, Shape, type WebGLProgramParametersWithUniforms } from 'three';
import { FOV, PAGE_H, PAGE_W, fit } from './bookLayout';
import { embossTexture, leatherTexture, paperTexture } from './textures';

export type Turn = { dir: 'next' | 'prev'; id: number } | null;

type Props = {
  open: boolean;
  turn: Turn;
  aspect: number;
  duration: number;
  onLost: () => void;
  onReady: () => void;
};

const T = 0.07; // board thickness
const BLOCK = 0.1; // page block thickness

/** A page sheet whose vertices curl around the spine (x = 0) as uAngle goes 0 → π. */
function useCurlMaterial(map: ReturnType<typeof paperTexture>) {
  return useMemo(() => {
    const uniforms = { uAngle: { value: 0 }, uCurl: { value: 0.55 }, uW: { value: PAGE_W } };
    const mat = new MeshLambertMaterial({ map, side: DoubleSide });
    mat.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          `#include <common>
          uniform float uAngle; uniform float uCurl; uniform float uW;
          float curlAngle(float x) { float k = x / uW; return uAngle + uCurl * sin(uAngle) * k * k; }`,
        )
        .replace(
          '#include <beginnormal_vertex>',
          `float ca = curlAngle(position.x);
          vec3 objectNormal = vec3(-sin(ca), 0.0, cos(ca));`,
        )
        .replace(
          '#include <begin_vertex>',
          `vec3 transformed = vec3(cos(ca) * position.x, position.y, sin(ca) * position.x + 0.004);`,
        );
    };
    return { mat, uniforms };
  }, [map]);
}

function Book({ open, turn, duration, onReady }: Omit<Props, 'aspect' | 'onLost'>) {
  const invalidate = useThree((s) => s.invalidate);
  const root = useRef<Group>(null);
  const cover = useRef<Group>(null);
  const sheet = useRef<Mesh>(null);

  const tex = useMemo(() => ({ leather: leatherTexture(), emboss: embossTexture(), paper: paperTexture() }), []);
  const { mat: sheetMat, uniforms } = useCurlMaterial(tex.paper);
  const sheetGeo = useMemo(() => {
    const g = new PlaneGeometry(PAGE_W, PAGE_H, 28, 1);
    g.translate(PAGE_W / 2, 0, 0);
    return g;
  }, []);
  const corner = useMemo(() => {
    const s = new Shape();
    s.moveTo(0, 0);
    s.lineTo(0.17, 0);
    s.lineTo(0, 0.17);
    s.closePath();
    return s;
  }, []);

  useEffect(() => {
    onReady();
    return () => {
      Object.values(tex).forEach((t) => t.dispose());
      sheetMat.dispose();
      sheetGeo.dispose();
    };
  }, [tex, sheetMat, sheetGeo, onReady]);

  // Open / close: slide to centre, flatten, swing the cover over the spine.
  useEffect(() => {
    if (!root.current || !cover.current) return;
    const d = duration / 1000;
    const tl = gsap.timeline({ onUpdate: invalidate, onComplete: invalidate });
    tl.to(root.current.position, { x: open ? 0 : -PAGE_W / 2, duration: d, ease: 'power2.inOut' }, 0)
      .to(root.current.rotation, { x: open ? 0 : -0.16, y: open ? 0 : 0.32, duration: d, ease: 'power2.inOut' }, 0)
      .to(cover.current.rotation, { y: open ? -Math.PI : 0, duration: d * 1.1, ease: 'power3.inOut' }, d * 0.15);
    return () => {
      tl.kill();
    };
  }, [open, duration, invalidate]);

  // Page turn.
  useEffect(() => {
    if (!turn || !sheet.current) return;
    const from = turn.dir === 'next' ? 0 : Math.PI;
    const to = turn.dir === 'next' ? Math.PI : 0;
    uniforms.uAngle.value = from;
    sheet.current.visible = true;
    const tw = gsap.to(uniforms.uAngle, {
      value: to,
      duration: duration / 1000,
      ease: 'power2.inOut',
      onUpdate: invalidate,
      onComplete: () => {
        if (sheet.current) sheet.current.visible = false;
        invalidate();
      },
    });
    return () => {
      tw.kill();
    };
  }, [turn, duration, uniforms, invalidate]);

  const brass = <meshStandardMaterial color="#c9a24a" metalness={0.85} roughness={0.35} />;
  const corners: [number, number, number][] = [
    [PAGE_W + 0.01, PAGE_H / 2 + 0.01, Math.PI],
    [PAGE_W + 0.01, -PAGE_H / 2 - 0.01, Math.PI / 2],
  ];

  return (
    <group ref={root} position={[-PAGE_W / 2, 0, 0]} rotation={[-0.16, 0.32, 0]}>
      {/* back board + right-hand page block */}
      <RoundedBox args={[PAGE_W + 0.04, PAGE_H + 0.06, T]} radius={0.02} position={[PAGE_W / 2, 0, -BLOCK - T / 2]}>
        <meshStandardMaterial color="#2b1215" roughness={0.8} />
      </RoundedBox>
      <mesh position={[PAGE_W / 2 - 0.01, 0, -BLOCK / 2]}>
        <boxGeometry args={[PAGE_W - 0.02, PAGE_H - 0.03, BLOCK]} />
        <meshLambertMaterial color="#d9c9a3" />
      </mesh>
      <mesh position={[PAGE_W / 2, 0, 0.001]}>
        <planeGeometry args={[PAGE_W - 0.02, PAGE_H - 0.03]} />
        <meshLambertMaterial map={tex.paper} />
      </mesh>
      {/* spine */}
      <mesh position={[-0.01, 0, -BLOCK / 2]}>
        <boxGeometry args={[0.04, PAGE_H + 0.06, BLOCK + T * 2]} />
        <meshStandardMaterial color="#1f0c0f" roughness={0.75} />
      </mesh>

      {/* front cover, hinged at the spine; carries the read pages on its inside */}
      <group ref={cover}>
        <group position={[0, 0, T / 2 + 0.002]}>
          {/* plain box: its UVs are 0–1 per face, so the tooled cover art lands where it should */}
          <mesh position={[PAGE_W / 2, 0, 0]}>
            <boxGeometry args={[PAGE_W + 0.04, PAGE_H + 0.06, T]} />
            <meshStandardMaterial map={tex.leather} bumpMap={tex.emboss} bumpScale={4} roughness={0.75} />
          </mesh>
          {corners.map(([x, y, r], i) => (
            <mesh key={i} position={[x, y, T / 2 + 0.003]} rotation={[0, 0, r]}>
              <extrudeGeometry args={[corner, { depth: 0.012, bevelEnabled: false }]} />
              {brass}
            </mesh>
          ))}
        </group>
        <mesh position={[PAGE_W / 2 - 0.01, 0, -0.012]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[PAGE_W - 0.02, PAGE_H - 0.03]} />
          <meshLambertMaterial map={tex.paper} />
        </mesh>
      </group>

      <mesh ref={sheet} geometry={sheetGeo} material={sheetMat} visible={false} />
    </group>
  );
}

function CameraFit({ aspect }: { aspect: number }) {
  const camera = useThree((s) => s.camera);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    camera.position.set(0, 0, fit(aspect).distance);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [aspect, camera, invalidate]);
  return null;
}

export default function GrimoireScene({ open, turn, aspect, duration, onLost, onReady }: Props) {
  const lostRef = useRef(onLost);
  lostRef.current = onLost;
  const [dpr, setDpr] = useState(1.5);
  return (
    <Canvas
      flat
      frameloop="demand"
      dpr={dpr}
      camera={{ fov: FOV, near: 0.1, far: 50, position: [0, 0, fit(aspect).distance] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          lostRef.current();
        });
      }}
      aria-hidden="true"
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <CameraFit aspect={aspect} />
      <ambientLight intensity={1.1} color="#ffe9cc" />
      <directionalLight position={[-2.5, 3, 4]} intensity={2.4} color="#ffd9a8" />
      <directionalLight position={[3, -2, 2]} intensity={0.5} color="#9a8fb8" />
      <Book open={open} turn={turn} duration={duration} onReady={onReady} />
    </Canvas>
  );
}
