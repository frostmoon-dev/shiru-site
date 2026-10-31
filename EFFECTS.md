# Adding an effect

Effects are self-contained folders in `src/effects/`. Drop one in and use it from any markup.
No section, layout or registry file needs editing.

## 1. Create the folder

```
src/effects/my-effect/index.ts
```

The folder name is the effect's name. Folders starting with `_` (`_webgl`, `_shared`) are
helpers and are never registered.

## 2. Export a factory

```ts
import type { EffectFactory } from '../types';

const myEffect: EffectFactory = () => {
  // state lives in this closure: one instance per element
  let anim: Animation | undefined;

  return {
    name: 'my-effect',

    // Start. `options` is the parsed data-effect-options JSON.
    // `env` tells you: reducedMotion, lowPower, coarsePointer (touch), saveData, small (< 720px).
    mount(el, options, env) {
      if (env.lowPower) return; // do less on weak devices
      anim = el.animate([{ opacity: 0.6 }, { opacity: 1 }], { duration: 2000, iterations: Infinity, direction: 'alternate' });
    },

    // Stop everything. Remove listeners, cancel timers, dispose GPU objects. Must be safe to call twice.
    unmount() {
      anim?.cancel();
      anim = undefined;
    },

    // Called INSTEAD of mount() when the visitor prefers reduced motion.
    // Leave the element looking finished and still. No flicker, no movement.
    reducedMotion(el) {
      el.style.opacity = '1';
    },

    // Optional: the tab was hidden / shown again.
    pause() { anim?.pause(); },
    resume() { anim?.play(); },
  };
};

export default myEffect;
```

## 3. Use it

```html
<div data-effect="my-effect" data-effect-options='{"speed": 2}'>…</div>
```

That's it. The runtime (`src/effects/runtime.ts`):

- **finds** every `[data-effect]` on page load and after every view-transition navigation;
- **waits** until the intro has finished and the browser is idle, so effects never compete with first paint;
- **lazy-loads** the effect's code with `import()` only when its element is within ~60% of a screen of the viewport;
- **unmounts** it again when the element is more than ~1.6 screens away, to free the CPU and GPU;
- **swaps** to `reducedMotion()` if the visitor prefers reduced motion, and remounts everything if they change that setting while the page is open;
- **falls back** to `reducedMotion()` if `mount()` throws (for example, no WebGL);
- **pauses/resumes** effects when the tab is hidden/shown;
- writes `data-effect-state` = `loading | mounted | static | error | idle` on the element. That's handy for CSS and for debugging.

Extra attributes:

| Attribute | Meaning |
| --- | --- |
| `data-effect-eager` | Mount without waiting to be near the viewport, and never unmount (global effects like film grain). |
| `data-effect-priority="high"` | Don't wait for idle (the intro uses this). |

## WebGL effects: share the stage

Don't create a canvas or `WebGLRenderer`. Register a view with the shared stage. It scissors your
element's rectangle out of one fixed, full-screen canvas, so the whole site uses a single WebGL context:

```ts
import { stage, type StageView } from '../_webgl/stage';

const view: StageView = {
  el,
  render(renderer, rect, time, dt) {
    // viewport + scissor are already set to the element's rectangle
    renderer.render(scene, camera);
  },
  onLost() {
    // context lost: show your static fallback
  },
};
stage.add(view);     // throws if WebGL is unavailable: the runtime then calls reducedMotion()
// …in unmount():
stage.remove(view);  // the context is released a few seconds after the last view leaves
geometry.dispose(); material.dispose();
```

Keep `three` out of your effect's entry file if the effect has a non-WebGL mode. Import the WebGL
part dynamically (see `ink-edge/index.ts` → `ink-edge/shader.ts`), so phones never download three.js.

The canvas sits at `z-index: var(--z-webgl)`: above section backgrounds, below section content
(`var(--z-content)`). Text therefore always stays readable on top of WebGL.

## Other kinds of animation

The interface doesn't care what's inside `mount()`:

- **GSAP / ScrollTrigger:** `import { gsap, ScrollTrigger } from '../../lib/motion'` (already synced with Lenis). Wrap your tweens in `gsap.context(() => …, el)` and call `ctx.revert()` in `unmount()`.
- **Lottie:** `npm i lottie-web`, then `const lottie = (await import('lottie-web')).default` inside `mount()`; `anim.destroy()` in `unmount()`.
- **Canvas 2D:** see `lumos` (the motes).
- **Video:** use `ambient-video` (`<video data-effect="ambient-video" data-src="/media/x.mp4" muted loop playsinline preload="none" poster="…">`).
- **React Three Fiber:** for a whole interactive scene, make a React island instead (see `src/islands/GrimoireBook.tsx`).

## Rules every effect must follow

1. **Reduced motion:** implement `reducedMotion()`, or make sure doing nothing leaves the element finished.
2. **Photosensitivity:** never flash more than 3 times per second. The intro burst is the one owner-approved exception.
3. **Text stays text:** never bake words into a canvas or image. Decorate real DOM text instead.
4. **Clean up:** after `unmount()`, the page must be exactly as it was before `mount()`.
5. **Earn its place:** if two effects fight for attention in one viewport, cut one.

## Current effects

| Name | What it does | Static fallback |
| --- | --- | --- |
| `film-grain` | jumps the grain layer around at ~12 fps | still grain |
| `flicker-jitter` | bad-bulb flicker + rare 1–2 frame skew | nothing |
| `ghost-title` | a heading surfaces out of the grain the first time you reach it, then now and then slips into a faint double exposure for a frame | plain title |
| `lantern-reveal` | uncovers a hidden layer only where the light falls (currently unused; the hero follows Shiru's Canva design) | still pool of light |
| `wet-ink` | text swells and smears for a moment | nothing |
| `ink-edge` | liquid ink shader edge, scroll-stretched (desktop); animated SVG on phones (currently unused) | frozen SVG drips |
| `lumos` | the cursor carries a small light: a bright tip, a trailing halo, pale motes; a click flares it (mouse only, system cursor stays) | light follows exactly, no motes/flare |
| `ambient-video` | a silent looping background video, fetched only near the viewport and dropped when far away | poster frame |
| `fall-parallax` | rabbit-hole drift, tumbling props, zoom-in, tilting floor | props at rest |
| `section-wipe` | `tear`, `burn`, `pinstripe`, `ink-rise` chapter transitions | the static edge |
| `typewriter` | types text letter by letter, keeping line breaks; optional one-letter typo that corrects itself; `waitForIntro` and `data-type-early` (stay hidden until typing) | full text |
| `reveal` | entrance animations played once on scroll: `rise`, `settle`, `pin` (polaroids), `pop`, `unfurl` (the scroll), `paint` (brush strokes, gingham), `slide`; options `targets`, `stagger`, `delay`, `start` | everything simply there |
| `hero-entrance` | after the intro: the name sharpens out of a blur, newspaper slides in from its corner (never transparent, so it still counts for LCP), hand rises; the kicker, tagline and "Navigate." are uncovered with a wipe (never half-transparent, so contrast holds at every frame); the eye opens ([data-enter] elements, 8 s CSS fail-safe) | everything simply there |
| `film-dust` | old-film specks, hairs and scratches redrawn ~12×/s on one fixed canvas over the whole site (in the atmosphere layer) | one still frame of dust |
| `intro` | the moon through branches (muted video from 9 s, slow zoom) → TV static → photo burst cut with short static bursts → static → the moon goes dark → hero, ≤ 3 s (hard cap 2.7 s), once per session | the still moon (poster frame), then fade (no static) |
