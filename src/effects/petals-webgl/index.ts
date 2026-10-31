import {
  DoubleSide,
  InstancedBufferAttribute,
  InstancedMesh,
  Matrix4,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
} from 'three';
import type { EffectFactory } from '../types';
import { stage, type StageView } from '../_webgl/stage';
import { tokenRGB } from '../_shared/color';

/**
 * Falling rose petals. One instanced mesh; all motion (fall, wind, tumble, cursor push) is
 * computed in the vertex shader from per-instance seeds, so the CPU does nothing per petal.
 * Options: { count?: number }
 */
const vert = /* glsl */ `
attribute vec4 aSeed;
uniform float uTime;
uniform vec2 uHalf;      // half visible width/height at z=0
uniform vec2 uMouse;     // world units at z=0
uniform float uMouseOn;
uniform float uWind;
varying vec2 vUv;
varying float vShade;
varying float vTint;

mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0,0.0,0.0, 0.0,c,s, 0.0,-s,c); }
mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c,0.0,-s, 0.0,1.0,0.0, s,0.0,c); }
mat3 rotZ(float a) { float c = cos(a), s = sin(a); return mat3(c,s,0.0, -s,c,0.0, 0.0,0.0,1.0); }

void main() {
  vUv = uv;
  vTint = aSeed.w;
  vec3 p = position;
  p.z += (uv.x - 0.5) * (uv.x - 0.5) * 0.35 + (uv.y - 0.2) * 0.12;   // cupped petal
  float size = 0.05 + 0.05 * aSeed.z;
  p *= size;

  float speed = 0.05 + 0.06 * aSeed.y;
  float life = fract(uTime * speed + aSeed.x * 7.13);
  float t = uTime + aSeed.x * 40.0;
  mat3 R = rotZ(t * (0.4 + aSeed.y)) * rotX(t * (0.7 + aSeed.z * 0.8)) * rotY(t * 0.5);
  p = R * p;
  vShade = 0.55 + 0.45 * abs((R * vec3(0.0, 0.0, 1.0)).z);

  vec3 world;
  world.x = mix(-uHalf.x * 1.15, uHalf.x * 1.15, fract(aSeed.x * 3.71 + aSeed.y));
  world.x += sin(t * 0.35 + aSeed.z * 6.0) * 0.18 + uWind * life * 0.9;
  world.y = mix(uHalf.y * 1.2, -uHalf.y * 1.2, life);
  world.z = mix(-0.9, 0.7, aSeed.z);

  vec2 away = world.xy - uMouse;
  float dist = length(away);
  world.xy += uMouseOn * normalize(away + 1e-4) * smoothstep(0.45, 0.0, dist) * 0.22;

  gl_Position = projectionMatrix * viewMatrix * vec4(world + p, 1.0);
}
`;

const frag = /* glsl */ `
precision highp float;
uniform vec3 uBlood;
uniform vec3 uOx;
varying vec2 vUv;
varying float vShade;
varying float vTint;
void main() {
  vec2 q = vUv - vec2(0.5, 0.42);
  q.x *= 1.35 + q.y * 0.6;                       // teardrop
  float notch = smoothstep(0.06, 0.0, abs(vUv.x - 0.5)) * smoothstep(0.82, 0.95, vUv.y) * 0.18;
  float d = length(q) - 0.42 + notch;
  if (d > 0.0) discard;
  float edge = smoothstep(-0.12, 0.0, d);
  vec3 col = mix(uBlood, uOx, 0.35 + 0.4 * vTint);
  col = mix(col, uOx * 0.6, edge * 0.7);
  col += vec3(0.05, 0.0, 0.0) * smoothstep(0.03, 0.0, abs(vUv.x - 0.5)) * (1.0 - vUv.y); // vein
  gl_FragColor = vec4(col * vShade, 0.92);
}
`;

const petals: EffectFactory = () => {
  let view: StageView | undefined;
  let mesh: InstancedMesh | undefined;
  let material: ShaderMaterial | undefined;
  let onMove: ((e: PointerEvent) => void) | undefined;
  let host: HTMLElement | undefined;

  return {
    name: 'petals-webgl',
    mount(el, opts, env) {
      host = el;
      const count =
        typeof opts.count === 'number' ? opts.count : env.lowPower ? 32 : env.small ? 46 : 120;
      const geometry = new PlaneGeometry(1, 1.25, 4, 2);
      const seeds = new Float32Array(count * 4);
      for (let i = 0; i < count * 4; i++) seeds[i] = Math.random();
      geometry.setAttribute('aSeed', new InstancedBufferAttribute(seeds, 4));

      material = new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        transparent: true,
        depthWrite: false,
        side: DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uHalf: { value: new Vector2(1, 1) },
          uMouse: { value: new Vector2(99, 99) },
          uMouseOn: { value: 0 },
          uWind: { value: 0.25 },
          uBlood: { value: new Vector3(...tokenRGB('--blood', '#a3141b')) },
          uOx: { value: new Vector3(...tokenRGB('--oxblood', '#5c0e12')) },
        },
      });
      mesh = new InstancedMesh(geometry, material, count);
      const identity = new Matrix4();
      for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity);
      mesh.frustumCulled = false;
      const scene = new Scene();
      scene.add(mesh);
      const camera = new PerspectiveCamera(40, 1, 0.1, 20);
      camera.position.set(0, 0, 3);
      const half = material.uniforms.uHalf!.value as Vector2;
      const mouse = material.uniforms.uMouse!.value as Vector2;
      const target = new Vector2(99, 99);
      const m = material;

      if (!env.coarsePointer) {
        onMove = (e) => {
          const r = el.getBoundingClientRect();
          const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
          const ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
          target.set(nx * half.x, ny * half.y);
          m.uniforms.uMouseOn!.value = 1;
        };
        window.addEventListener('pointermove', onMove, { passive: true });
      }

      view = {
        el,
        render(renderer, rect, time, dt) {
          if (camera.aspect !== rect.width / rect.height) {
            camera.aspect = rect.width / rect.height;
            camera.updateProjectionMatrix();
          }
          half.y = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
          half.x = half.y * camera.aspect;
          mouse.lerp(target, Math.min(dt * 3, 1)); // petals respond slowly, like air
          m.uniforms.uTime!.value = time;
          m.uniforms.uWind!.value = 0.25 + Math.sin(time * 0.07) * 0.2;
          renderer.render(scene, camera);
        },
        onLost: () => {
          view = undefined;
          host?.removeAttribute('data-webgl');
        },
      };
      stage.add(view);
      el.dataset.webgl = 'on';
    },
    unmount() {
      if (view) stage.remove(view);
      view = undefined;
      if (onMove) window.removeEventListener('pointermove', onMove);
      mesh?.geometry.dispose();
      material?.dispose();
      mesh?.dispose();
      mesh = undefined;
      material = undefined;
      host?.removeAttribute('data-webgl');
    },
    reducedMotion(el) {
      el.dataset.static = 'true';
    },
  };
};

export default petals;
