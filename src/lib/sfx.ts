/**
 * Optional sound, OFF by default, never autoplays. Switching it on starts the background music
 * ("The Tea Party That Never Ended", public/media/theme.mp3, looped, faded in) and the small
 * synthesised effects (page turns, the seal, the book's creak, the heartbeat in the wax). The music file is only downloaded the first time sound is switched on.
 * It keeps playing across page navigations, pauses while the tab is hidden, and fades out when
 * switched off (resuming from the same point next time).
 *
 * Components call `sfx('page')`; nothing plays unless the visitor switched sound on.
 */
export type Sfx = 'page' | 'creak' | 'seal' | 'hat' | 'card' | 'paper' | 'heart';

/** Recorded effects (public/media/sfx), fetched the first time sound is switched on. The rest are synthesised. */
const RECORDED: Partial<Record<Sfx, string>> = {
  page: '/media/sfx/page.mp3', // a book page turning (the grimoire)
  card: '/media/sfx/card.mp3', // a playing card picked up and turned (the hobby deck)
  paper: '/media/sfx/paper.mp3', // paper crackling (the letter coming out of the envelope)
};
const buffers = new Map<Sfx, AudioBuffer>();
let loading: Promise<void> | undefined;
function loadRecorded(c: AudioContext) {
  loading ??= Promise.all(
    Object.entries(RECORDED).map(async ([name, url]) => {
      try {
        const res = await fetch(url);
        buffers.set(name as Sfx, await c.decodeAudioData(await res.arrayBuffer()));
      } catch {
        /* a missing sound just stays silent */
      }
    }),
  ).then(() => undefined);
  return loading;
}

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let music: HTMLAudioElement | undefined;
let musicGain: GainNode | undefined;
let pauseTimer = 0;

const MUSIC_SRC = '/media/theme.mp3';
const MUSIC_LEVEL = 0.55;

// Deliberately not persisted: every visit starts silent.
let enabled = false;

export function soundEnabled(): boolean {
  return enabled;
}

function ensureCtx(): AudioContext {
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  return ctx;
}

function noiseBuffer(c: AudioContext, seconds: number): AudioBuffer {
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * seconds), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return buf;
}

function startMusic() {
  const c = ensureCtx();
  if (!music) {
    music = new Audio(MUSIC_SRC);
    music.loop = true;
    music.preload = 'auto';
    musicGain = c.createGain();
    musicGain.gain.value = 0;
    c.createMediaElementSource(music).connect(musicGain).connect(master!);
    document.addEventListener('visibilitychange', () => {
      if (!music || !enabled) return;
      if (document.hidden) music.pause();
      else void music.play().catch(() => undefined);
    });
  }
  window.clearTimeout(pauseTimer);
  const g = musicGain!.gain;
  g.cancelScheduledValues(c.currentTime);
  g.setValueAtTime(g.value, c.currentTime);
  g.linearRampToValueAtTime(MUSIC_LEVEL, c.currentTime + 2.5); // creeps in, never sudden
  void music.play().catch(() => undefined);
}

function stopMusic() {
  if (!music || !musicGain || !ctx) return;
  const g = musicGain.gain;
  g.cancelScheduledValues(ctx.currentTime);
  g.setValueAtTime(g.value, ctx.currentTime);
  g.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  const m = music;
  pauseTimer = window.setTimeout(() => m.pause(), 850);
}

export function setSound(on: boolean) {
  enabled = on;
  if (on) {
    void ensureCtx().resume();
    void loadRecorded(ensureCtx());
    startMusic();
  } else {
    stopMusic();
  }
}

export function sfx(name: Sfx) {
  if (!soundEnabled() || !ctx || !master) return;
  const c = ctx;
  const recorded = buffers.get(name);
  if (recorded) {
    const src = c.createBufferSource();
    src.buffer = recorded;
    const g = c.createGain();
    g.gain.value = 0.9;
    src.connect(g).connect(master);
    src.start();
    return;
  }
  if (name === 'card' || name === 'paper') return; // recorded only
  const t = c.currentTime;
  if (name === 'heart') {
    // lub-dub: two soft, low thumps, timed to the wax seal's beat (felt more than heard)
    [0, 0.19].forEach((at, i) => {
      const o = c.createOscillator();
      o.type = 'triangle';
      o.frequency.setValueAtTime(i ? 78 : 92, t + at);
      o.frequency.exponentialRampToValueAtTime(44, t + at + 0.16);
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 320;
      const og = c.createGain();
      og.gain.setValueAtTime(0.0001, t + at);
      og.gain.exponentialRampToValueAtTime(i ? 0.45 : 0.65, t + at + 0.015);
      og.gain.exponentialRampToValueAtTime(0.0001, t + at + 0.21);
      o.connect(lp).connect(og).connect(master!);
      o.start(t + at);
      o.stop(t + at + 0.23);
    });
    return;
  }
  const g = c.createGain();
  g.connect(master);
  if (name === 'page' || name === 'seal') {
    const src = c.createBufferSource();
    src.buffer = noiseBuffer(c, name === 'page' ? 0.45 : 0.18);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(name === 'page' ? 2600 : 900, t);
    bp.frequency.exponentialRampToValueAtTime(name === 'page' ? 900 : 300, t + 0.4);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(name === 'page' ? 0.35 : 0.5, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (name === 'page' ? 0.45 : 0.18));
    src.connect(bp).connect(g);
    src.start(t);
  } else {
    // creak / hat: a slow, wobbling, filtered squeak
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(name === 'hat' ? 320 : 140, t);
    o.frequency.linearRampToValueAtTime(name === 'hat' ? 210 : 190, t + 0.6);
    const lfo = c.createOscillator();
    lfo.frequency.value = 23;
    const lfoGain = c.createGain();
    lfoGain.gain.value = 18;
    lfo.connect(lfoGain).connect(o.frequency);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = 700;
    bp.Q.value = 6;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.12, t + 0.1);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(bp).connect(g);
    o.start(t);
    lfo.start(t);
    o.stop(t + 0.75);
    lfo.stop(t + 0.75);
  }
}
