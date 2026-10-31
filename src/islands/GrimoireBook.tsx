import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { fit } from './bookLayout';
import type { Turn } from './GrimoireScene';
import './grimoire.css';

const GrimoireScene = lazy(() => import('./GrimoireScene'));

export type BookEntry = { slug: string; numeral: string; title: string; when: string; date?: string; excerpt: string };
export type BookLabels = {
  title: string;
  open: string;
  close: string;
  prev: string;
  next: string;
  hint: string;
  binding: string;
  readEntry: string;
  noWebgl: string;
};
type Props = { entries: BookEntry[]; labels: BookLabels };
type Mode = 'pending' | '3d' | '2d';

const OVERLAY_ID = 'grimoire';

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

function sfx(name: 'page' | 'creak') {
  void import('../lib/sfx').then((m) => m.sfx(name));
}


export default function GrimoireBook({ entries, labels }: Props) {
  const [mode, setMode] = useState<Mode>('pending');
  const [reduced, setReduced] = useState(false);
  const [open, setOpen] = useState(false);
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<Turn>(null);
  const [turning, setTurning] = useState(false);
  // after the first turn, new pages ink in at once (the long delay is only for the cover swinging open)
  const [turned, setTurned] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [aspect, setAspect] = useState(1.6);
  const [status, setStatus] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const openBtn = useRef<HTMLButtonElement>(null);
  const firstPage = useRef<HTMLHeadingElement>(null);
  const turnId = useRef(0);

  // Choose 3D (wide, motion OK, WebGL) or the simpler 2D page-flip.
  useEffect(() => {
    const wide = window.matchMedia('(min-width: 900px)');
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nav = navigator as Navigator & { deviceMemory?: number };
    const decide = () => {
      setReduced(rm.matches);
      setMode(wide.matches && !rm.matches && (nav.deviceMemory ?? 8) > 2 && webglOK() ? '3d' : '2d');
    };
    decide();
    wide.addEventListener('change', decide);
    rm.addEventListener('change', decide);
    return () => {
      wide.removeEventListener('change', decide);
      rm.removeEventListener('change', decide);
    };
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      if (e && e.contentRect.height) setAspect(e.contentRect.width / e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const perSpread = mode === '3d' ? 2 : 1;
  const spreads = Math.ceil(entries.length / perSpread);
  const duration = reduced ? 0 : mode === '3d' ? 950 : 600;
  const current = entries.slice(spread * perSpread, spread * perSpread + perSpread);

  useEffect(() => {
    if (spread >= spreads) setSpread(Math.max(0, spreads - 1));
  }, [spread, spreads]);

  const describe = useCallback(
    (s: number) => {
      const a = s * perSpread + 1;
      const b = Math.min(entries.length, a + perSpread - 1);
      return a === b ? `Page ${a} of ${entries.length}` : `Pages ${a}–${b} of ${entries.length}`;
    },
    [perSpread, entries.length],
  );

  const doOpen = () => {
    if (open) return;
    setOpen(true);
    sfx('creak');
    setStatus(`${labels.title} opened. ${describe(spread)}`);
    window.shiruOverlay?.open(OVERLAY_ID, () => {
      setOpen(false);
      setTurned(false);
      setStatus(`${labels.title} closed.`);
      window.setTimeout(() => openBtn.current?.focus(), 0);
    });
    window.setTimeout(() => {
      // Focus the first page without the browser yanking it under the fixed top bar,
      // then bring the whole book into view below that bar.
      firstPage.current?.focus({ preventScroll: true });
      const stage = stageRef.current;
      if (!stage) return;
      const navH = document.querySelector('.site-nav')?.getBoundingClientRect().height ?? 0;
      const top = stage.getBoundingClientRect().top;
      if (top < navH + 8 || top > window.innerHeight * 0.5) {
        void import('../lib/motion').then(({ getLenis }) => {
          const offset = -(navH + 16);
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(stage, { offset, immediate: reduced });
          else window.scrollTo({ top: window.scrollY + top + offset });
        });
      }
    }, duration + 50);
    void import('../lib/hints').then((m) => m.markHintUsed('grimoire'));
  };
  const doClose = () => window.shiruOverlay?.close(OVERLAY_ID);

  const go = useCallback(
    (dir: 'next' | 'prev') => {
      if (turning || !open) return;
      const target = dir === 'next' ? spread + 1 : spread - 1;
      if (target < 0 || target >= spreads) return;
      sfx('page');
      setTurning(true);
      setTurned(true);
      setTurn({ dir, id: ++turnId.current });
      window.setTimeout(() => {
        setSpread(target);
        setStatus(describe(target));
      }, duration * 0.5);
      window.setTimeout(() => setTurning(false), duration);
    },
    [turning, open, spread, spreads, duration, describe],
  );

  // ← → turn pages while the book is open; Esc closes it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /input|textarea|select/i.test(t.tagName)) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        go('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go('prev');
      } else if (e.key === 'Escape' && !document.querySelector('dialog[open]')) {
        doClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  // Mark the server-rendered table of contents as replaced by the interactive book.
  useEffect(() => {
    stageRef.current?.closest('.grimoire')?.setAttribute('data-book-ready', 'true');
  }, []);

  const layout = fit(aspect);
  const pageStyle = (side: 'left' | 'right' | 'single') =>
    mode === '3d'
      ? {
          width: `${layout.pageWPct}%`,
          height: `${layout.pageHPct}%`,
          top: `${50 - layout.pageHPct / 2}%`,
          left: side === 'left' ? `${50 - layout.pageWPct}%` : '50%',
        }
      : undefined;

  const loading = mode === '3d' && !sceneReady;

  return (
    <div className={`book book--${mode}${open ? ' is-open' : ''}${turning ? ' is-turning' : ''}${turned ? ' has-turned' : ''}`} data-reduced={reduced}>
      <div
        className="book__stage"
        ref={stageRef}
        role="group"
        aria-roledescription="book"
        aria-label={labels.title}
        aria-busy={loading}
      >
        {mode === '3d' && (
          <Suspense fallback={null}>
            <GrimoireScene
              open={open}
              turn={turn}
              aspect={aspect}
              duration={duration}
              onReady={() => setSceneReady(true)}
              onLost={() => setMode('2d')}
            />
          </Suspense>
        )}
        {loading && <p className="book__loading label">{labels.binding}</p>}

        {mode !== '3d' && (
          <div className="book2d" aria-hidden="true">
            <div className="book2d__cover">
              <svg viewBox="0 0 200 280" className="book2d__emblem">
                <path className="book2d__rule" d="M68 20h64M68 260h64" />
                <circle className="book2d__ring" cx="100" cy="140" r="56" />
                <circle className="book2d__ring book2d__ring--thin" cx="100" cy="140" r="61" />
                <path className="book2d__keyhole" d="M100 112a15 15 0 0 1 6.3 28.6L114 172H86l7.7-31.4A15 15 0 0 1 100 112z" />
              </svg>
              <span className="book2d__corner book2d__corner--tl" />
              <span className="book2d__corner book2d__corner--tr" />
              <span className="book2d__corner book2d__corner--bl" />
              <span className="book2d__corner book2d__corner--br" />
            </div>
          </div>
        )}

        {open && (
          <div className="book__pages" aria-live="off">
            {current.map((entry, i) => (
              <article
                key={entry.slug}
                className={`book__page book__page--${perSpread === 1 ? 'single' : i === 0 ? 'left' : 'right'}`}
                style={pageStyle(perSpread === 1 ? 'single' : i === 0 ? 'left' : 'right')}
                aria-labelledby={`gp-${entry.slug}`}
              >
                <p className="book__numeral" aria-hidden="true">
                  {entry.numeral}
                </p>
                <h3 id={`gp-${entry.slug}`} className="book__title" ref={i === 0 ? firstPage : undefined} tabIndex={-1}>
                  <span className="visually-hidden">Chapter {entry.numeral}: </span>
                  {entry.title}
                </h3>
                <p className="book__date label">
                  {entry.date ? <time dateTime={entry.date}>{entry.when}</time> : entry.when}
                </p>
                <p className="book__excerpt">{entry.excerpt}</p>
                <a className="book__read" href={`/grimoire/${entry.slug}/`}>
                  {labels.readEntry}
                  <span className="visually-hidden">: {entry.title}</span>
                </a>
                <p className="book__folio label" aria-hidden="true">
                  {spread * perSpread + i + 1}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="book__controls">
        {!open ? (
          <button ref={openBtn} type="button" className="btn btn--solid" onClick={doOpen} disabled={loading} aria-busy={loading}>
            {labels.open}
          </button>
        ) : (
          <>
            <button type="button" className="icon-btn book__arrow" onClick={() => go('prev')} disabled={spread === 0 || turning} aria-label={labels.prev}>
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M20.4 12.3c-5.5-.4-11 .2-16.4.1M9.3 6.6C7.6 8.6 5.6 10.5 4 12.2c2.2 1.7 4 3.4 5.6 5.3" />
              </svg>
            </button>
            <p className="book__count label">{describe(spread)}</p>
            <button
              type="button"
              className="icon-btn book__arrow"
              onClick={() => go('next')}
              disabled={spread >= spreads - 1 || turning}
              aria-label={labels.next}
            >
              <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M3.6 11.8c5.5.4 11-.2 16.4-.1M14.7 6.5c1.7 2 3.7 3.9 5.3 5.6-2.2 1.7-4 3.4-5.6 5.3" />
              </svg>
            </button>
            <button type="button" className="btn book__close" onClick={doClose}>
              {labels.close}
            </button>
          </>
        )}
      </div>
      {open && <p className="book__hint caption">{labels.hint}</p>}
      <p className="visually-hidden" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
