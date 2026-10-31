/**
 * Image imports, kept apart from the copy so site.ts stays plain text.
 * Swap a file in src/assets/placeholder/ (same name) or point an import at a new file.
 * Astro turns each into AVIF/WebP at several widths at build time.
 */
import eye from '../assets/collage/eye.png';
import hand from '../assets/collage/hand.png';
import keyhole from '../assets/collage/keyhole.png';
import butterfly from '../assets/collage/butterfly.png';
import envelope from '../assets/collage/envelope.png';
import paper from '../assets/collage/paper.png';
import moonPoster from '../assets/collage/moon-poster.jpg';
import newspaper from '../assets/collage/newspaper.png';
import bow from '../assets/design/bow.png';
import hamster from '../assets/design/hamster.png';
import lace from '../assets/design/lace-frame.png';
import tornEdge from '../assets/design/torn-edge.png';
import brush from '../assets/design/brush.png';
import scroll from '../assets/design/scroll.png';
import pastry from '../assets/design/pastry.png';
import gingham from '../assets/design/gingham.jpg';
import archiveFrame from '../assets/design/archive-frame.png';
import peek from '../assets/design/peek.jpg';
import pocketWatch from '../assets/design/pocket-watch.png';
import paperclip from '../assets/collage/paperclip.png';
import archiveMoonpaper from '../assets/placeholder/archive-moonpaper.jpg';
import archiveNapyru from '../assets/placeholder/archive-napyru.jpg';
import archiveMoona from '../assets/placeholder/archive-moona.jpg';
import archiveVisualThemes from '../assets/placeholder/archive-visual-themes.jpg';
import intro1 from '../assets/placeholder/intro-1.jpg';
import intro2 from '../assets/placeholder/intro-2.jpg';
import intro3 from '../assets/placeholder/intro-3.jpg';
import intro4 from '../assets/placeholder/intro-4.jpg';
import intro5 from '../assets/placeholder/intro-5.jpg';

export const casePhotos = {
  'archive-moonpaper': archiveMoonpaper,
  'archive-napyru': archiveNapyru,
  'archive-moona': archiveMoona,
  'archive-visual-themes': archiveVisualThemes,
} as const;

export const introPhotos = { 'intro-1': intro1, 'intro-2': intro2, 'intro-3': intro3, 'intro-4': intro4, 'intro-5': intro5 } as const;


/** Cut-outs supplied by Shiru (Canva collage sheets), cut apart by scripts/ (see README). */
export const collage = { eye, hand, keyhole, butterfly, envelope, paper, moonPoster, newspaper, paperclip } as const;

/** Pieces from Shiru's revised Canva designs (Oct 2026). */
export const design = { bow, hamster, lace, tornEdge, brush, scroll, pastry, gingham, archiveFrame, peek, pocketWatch } as const;
