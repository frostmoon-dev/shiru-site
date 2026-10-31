import type { EffectFactory } from '../types';

/**
 * Animated film grain. The grain texture is the static CSS layer (.atmosphere__grain);
 * this just jumps it around at ~12 fps on the compositor, like a projector gate.
 * Low-power devices and reduced motion keep the static grain.
 */
const filmGrain: EffectFactory = () => {
  let anim: Animation | undefined;
  return {
    name: 'film-grain',
    mount(el, _opts, env) {
      const grain = el.querySelector<HTMLElement>('.atmosphere__grain');
      if (!grain || env.lowPower) return;
      grain.style.willChange = 'transform';
      const frames: Keyframe[] = Array.from({ length: 9 }, () => ({
        transform: `translate(${(Math.random() * 30 - 15).toFixed(1)}%, ${(Math.random() * 30 - 15).toFixed(1)}%)`,
        easing: 'steps(1, end)',
      }));
      anim = grain.animate(frames, { duration: 750, iterations: Infinity });
    },
    unmount() {
      anim?.cancel();
      anim = undefined;
    },
    pause() {
      anim?.pause();
    },
    resume() {
      anim?.play();
    },
  };
};
export default filmGrain;
