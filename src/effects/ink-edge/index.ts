import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector3 } from 'three';
import type { EffectFactory } from '../types';
import { stage, type StageView } from '../_webgl/stage';
import { tokenRGB } from '../_shared/color';

/**
 * Liquid ink along the bottom of the hero. A signed-distance shader on one quad: a wavy ink
 * line, drips that lengthen, sag, drop and shorten, and ink creeping in from both corners.
 * Scrolling past the hero stretches everything further down (scroll-linked, smoothed).
 *
 * Fallback (no WebGL, context loss, reduced motion): the inline SVG inside the element.
 * Options: { rest?: number }  where the ink line sits, as a fraction of the element height.
 */
const vert = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = (n: number) => /* glsl */ `
precision highp float;
#define N ${n}
varying vec2 vUv;
uniform float uTime;
uniform float uAspect;
uniform float uRest;
uniform float uStretch;
uniform float uPx;
uniform vec3 uColor;
uniform vec3 uSheen;

float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}
float sdCapsule(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}
float edgeAt(float u, float t) {
  float e = uRest + 0.012 * sin(u * 11.0 + t * 0.35) + 0.008 * sin(u * 27.0 - t * 0.5) + 0.004 * sin(u * 63.0 + t);
  float cl = smoothstep(0.34, 0.0, u);
  float cr = smoothstep(0.66, 1.0, u);
  float creep = (0.08 + 0.2 * uStretch) * (0.8 + 0.2 * sin(t * 0.21));
  return e + creep * (cl * cl + cr * cr);
}

void main() {
  float u = vUv.x;
  float v = 1.0 - vUv.y;
  vec2 p = vec2(u * uAspect, v);
  float t = uTime;
  float d = v - edgeAt(u, t);

  for (int i = 0; i < N; i++) {
    float fi = float(i);
    float xu = 0.03 + 0.94 * hash(fi + 1.0);
    float x = xu * uAspect;
    float r = 0.005 + 0.011 * hash(fi + 7.0);
    float speed = 0.035 + 0.06 * hash(fi + 3.0);
    float cyc = fract(t * speed + hash(fi + 11.0));
    float grow = smoothstep(0.0, 0.62, cyc) - 0.85 * smoothstep(0.66, 1.0, cyc);
    float maxLen = (0.05 + 0.2 * hash(fi + 5.0)) * (1.0 + 1.5 * uStretch);
    float len = maxLen * grow;
    float top = edgeAt(xu, t) - 0.02;
    vec2 b = vec2(x, top + len);
    float dd = sdCapsule(p, vec2(x, top), b, r * (0.75 + 0.25 * grow));
    dd = min(dd, length(p - b) - r * 1.5 * clamp(grow * 1.6, 0.0, 1.0));
    d = smin(d, dd, 0.03);
    float fall = clamp((cyc - 0.62) / 0.3, 0.0, 1.0);
    if (fall > 0.0 && fall < 1.0) {
      vec2 c = vec2(x, top + maxLen * 0.95 + fall * fall * 0.55);
      d = smin(d, length(p - c) - r * 1.3 * (1.0 - fall * 0.6), 0.01);
    }
  }

  float alpha = 1.0 - smoothstep(-uPx, uPx, d);
  alpha *= smoothstep(0.0, uRest * 0.85, v);
  float rim = exp(-abs(d) / 0.007) * step(d, 0.0);
  vec3 col = uColor + uSheen * rim * 0.32;
  gl_FragColor = vec4(col, alpha);
}
`;

const inkEdge: EffectFactory = () => {
  let view: StageView | undefined;
  let material: ShaderMaterial | undefined;
  let geometry: PlaneGeometry | undefined;
  let host: HTMLElement | undefined;
  let stretch = 0;

  const fallback = () => {
    if (view) stage.remove(view);
    view = undefined;
    host?.removeAttribute('data-webgl');
  };

  return {
    name: 'ink-edge',
    mount(el, opts, env) {
      host = el;
      const rest = typeof opts.rest === 'number' ? opts.rest : 0.18;
      geometry = new PlaneGeometry(2, 2);
      material = new ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag(env.small || env.lowPower ? 9 : 16),
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAspect: { value: 1 },
          uRest: { value: rest },
          uStretch: { value: 0 },
          uPx: { value: 0.002 },
          uColor: { value: new Vector3(...tokenRGB('--void', '#050304')) },
          uSheen: { value: new Vector3(...tokenRGB('--moon', '#d9d2bd')) },
        },
      });
      const scene = new Scene();
      scene.add(new Mesh(geometry, material));
      const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const m = material;
      view = {
        el,
        render(renderer, rect, time, dt) {
          const u = m.uniforms;
          u.uTime!.value = time;
          u.uAspect!.value = rect.width / rect.height;
          u.uPx!.value = 1.5 / rect.height;
          // How far the hero's bottom edge has scrolled up the viewport.
          const target = Math.min(Math.max(1 - (rect.top + rect.height * rest) / window.innerHeight, 0), 1);
          stretch += (target - stretch) * Math.min(dt * 4, 1);
          u.uStretch!.value = stretch;
          renderer.render(scene, camera);
        },
        onLost: fallback,
      };
      stage.add(view);
      el.dataset.webgl = 'on';
    },
    unmount() {
      fallback();
      geometry?.dispose();
      material?.dispose();
      geometry = undefined;
      material = undefined;
      host = undefined;
    },
    reducedMotion(el) {
      el.dataset.static = 'true';
    },
  };
};

export default inkEdge;
