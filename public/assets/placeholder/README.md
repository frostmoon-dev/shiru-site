# Placeholder assets to replace

Everything below is a stand-in, clearly stamped **PLACEHOLDER**. Replace each file with the real one.
Keep the same file name, or change the import in `src/content/photos.ts`.

Photos live in **`src/assets/placeholder/`**, not here, because Astro can only optimise images it
imports. It converts them to AVIF and WebP at several widths and adds width/height so nothing shifts.
Files that must be served as-is (social card, icons) live in `public/`.

| File | Where it shows | What the real asset should be | Size / format |
| --- | --- | --- | --- |
| `src/assets/placeholder/case-erp.jpg` | Case file No. 365 polaroid + evidence page | A photo for the ERP work: a desk, a ledger, a screen with code (blur anything confidential) | square, ≥ 1000 px, JPG |
| `src/assets/placeholder/case-translation.jpg` | Case file No. 2 | Translation/editing: handwritten pages, two languages side by side | square, ≥ 1000 px, JPG |
| `src/assets/placeholder/case-lore.jpg` | Case file No. 7 | The lore archive: notebooks, index cards, string. No official game art. | square, ≥ 1000 px, JPG |
| `src/assets/placeholder/intro-1.jpg` … `intro-5.jpg` | Intro flash burst (each shown ~50 ms, toned dark sepia automatically) | Photos of Shiru, or her hands, desk, shadows. Cropped and partly hidden works best. | 4:5 portrait, ≥ 840 px, JPG |
| `public/og.png` | Link previews (Open Graph / Twitter) | Designed share card. Regenerate with `node scripts/make-assets.mjs` after editing it there, or replace by hand. | 1200 × 630 PNG |
| `public/favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` | Browser tab, home screen | The hat mark (current) or a real monogram | as named |

## Audio (optional, not needed yet)

Sound is currently synthesised in the browser (`src/lib/sfx.ts`), so there are no audio files.
If you want real recordings, add short, compressed files (`.webm`/Opus plus `.mp3` fallback, < 60 kB each):

| Sound | Used when |
| --- | --- |
| `page-turn` | grimoire page turns |
| `creak` | the grimoire opens |
| `seal-crack` | the wax seal breaks |
| `hat` | the hat tips over |
| `ambient-hum` | low loop while sound is on (≤ 300 kB, seamless loop) |

## Copy

All text is in `src/content/site.ts`. Search the repo for `TODO:` to find every placeholder sentence,
the placeholder email (`hello@shiru.example`) and the placeholder links.
