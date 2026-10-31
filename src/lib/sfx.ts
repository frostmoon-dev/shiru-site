/**
 * Optional sound, OFF by default, never autoplays. Everything is synthesised with Web Audio,
 * so there are no audio files to download until real recordings replace these
 * (see public/assets/placeholder/README.md).
 *
 * Components call `sfx('page')`; nothing plays unless the visitor switched sound on.
 */
export type Sfx = 'page' | 'creak' | 'seal' | 'hat';

let ctx: AudioContext | undefined;
let master: GainNode | undefined;
let hum: { stop(): void } | undefined;

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

function startHum() {
  const c = ensureCtx();
  const out = c.createGain();
  out.gain.value = 0;
  out.gain.linearRampToValueAtTime(0.09, c.currentTime + 4); // creeps in late, never sudden
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 180;
  const oscs = [55, 55.4, 82.6].map((f) => {
    const o = c.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = f;
    o.connect(filter);
    o.start();
    return o;
  });
  filter.connect(out).connect(master!);
  hum = {
    stop() {
      out.gain.cancelScheduledValues(c.currentTime);
      out.gain.setTargetAtTime(0, c.currentTime, 0.4);
      window.setTimeout(() => oscs.forEach((o) => o.stop()), 2000);
    },
  };
}

export function setSound(on: boolean) {
  enabled = on;
  if (on) {
    void ensureCtx().resume();
    if (!hum) startHum();
  } else {
    hum?.stop();
    hum = undefined;
  }
}

export function sfx(name: Sfx) {
  if (!soundEnabled() || !ctx || !master) return;
  const c = ctx;
  const t = c.currentTime;
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
