import { WebGLRenderer } from 'three';
import { getEnv } from '../../lib/env';

/**
 * One WebGL context for the whole site.
 *
 * WebGL effects don't create their own canvas. They register a "view": a DOM element whose
 * on-screen rectangle the stage scissors out of a single fixed, full-viewport canvas, then asks
 * the view to draw into it. Views off-screen are skipped. When the last view leaves, the
 * renderer is disposed and the context released, so a page section with no WebGL costs nothing.
 *
 * Layering: the canvas sits at z-index var(--z-webgl), above section backgrounds and below
 * section content (which sits at var(--z-content)).
 */
export interface StageView {
  el: HTMLElement;
  /** Draw this frame. Viewport and scissor are already set to the element's rectangle. */
  render(renderer: WebGLRenderer, rect: DOMRect, time: number, dt: number): void;
  /** The context was lost. Show your static fallback. */
  onLost?(): void;
}

const MAX_LOSSES = 2;

class Stage {
  private canvas?: HTMLCanvasElement;
  private renderer?: WebGLRenderer;
  private views = new Set<StageView>();
  private raf = 0;
  private last = 0;
  private start = 0;
  private disposeTimer = 0;
  private losses = 0;
  private destroying = false;
  private width = 0;
  private height = 0;

  supported(): boolean {
    if (this.losses >= MAX_LOSSES) return false;
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2') ?? c.getContext('webgl');
      const ok = !!gl;
      (gl as WebGLRenderingContext | null)?.getExtension('WEBGL_lose_context')?.loseContext();
      return ok;
    } catch {
      return false;
    }
  }

  /** Returns the renderer, creating the context on first use. Throws if WebGL is unavailable. */
  add(view: StageView): WebGLRenderer {
    window.clearTimeout(this.disposeTimer);
    const renderer = this.ensure();
    this.views.add(view);
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
    return renderer;
  }

  remove(view: StageView) {
    this.views.delete(view);
    if (this.views.size === 0) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.renderer?.clear();
      // Keep the context briefly in case the user scrolls straight back.
      this.disposeTimer = window.setTimeout(() => this.destroy(), 4000);
    }
  }

  private ensure(): WebGLRenderer {
    if (this.renderer) return this.renderer;
    if (!this.supported()) throw new Error('WebGL unavailable');
    const env = getEnv();
    const canvas = document.createElement('canvas');
    canvas.className = 'webgl-stage';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
      position: 'fixed',
      inset: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: 'var(--z-webgl)',
    });
    const renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: env.lowPower ? 'low-power' : 'high-performance',
    });
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, env.lowPower || env.small ? 1 : 1.5));
    canvas.addEventListener('webglcontextlost', this.onLost, false);
    document.body.appendChild(canvas);
    this.canvas = canvas;
    this.renderer = renderer;
    this.start = performance.now();
    this.resize();
    window.addEventListener('resize', this.resize, { passive: true });
    return renderer;
  }

  private resize = () => {
    if (!this.renderer) return;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height, false);
  };

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick);
    const renderer = this.renderer;
    if (!renderer || document.hidden) return;
    const dt = Math.min((now - this.last) / 1000, 0.1);
    this.last = now;
    const time = (now - this.start) / 1000;
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    for (const view of this.views) {
      const rect = view.el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > this.height || rect.width === 0 || rect.height === 0) continue;
      const x = rect.left;
      const y = this.height - rect.bottom;
      renderer.setViewport(x, y, rect.width, rect.height);
      renderer.setScissor(x, y, rect.width, rect.height);
      view.render(renderer, rect, time, dt);
    }
  };

  private onLost = (e: Event) => {
    e.preventDefault();
    if (this.destroying) return;
    this.losses++;
    const views = [...this.views];
    this.views.clear();
    this.destroy();
    views.forEach((v) => v.onLost?.());
  };

  private destroy() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener('resize', this.resize);
    if (this.renderer) {
      this.destroying = true;
      this.renderer.dispose();
      this.renderer.forceContextLoss();
      this.destroying = false;
    }
    this.canvas?.removeEventListener('webglcontextlost', this.onLost);
    this.canvas?.remove();
    this.canvas = undefined;
    this.renderer = undefined;
  }
}

export const stage = new Stage();
