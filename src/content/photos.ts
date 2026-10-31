/**
 * Image imports, kept apart from the copy so site.ts stays plain text.
 * Swap a file in src/assets/placeholder/ (same name) or point an import at a new file.
 * Astro turns each into AVIF/WebP at several widths at build time.
 */
import hand from '../assets/collage/hand.png';
import envelope from '../assets/collage/envelope.png';
import paper from '../assets/collage/paper.png';
import newspaper from '../assets/collage/newspaper.png';
import eye from '../assets/collage/eye.png';
import moth from '../assets/collage/butterfly.png';
import lace from '../assets/design/lace-frame.png';
import gingham from '../assets/design/gingham.jpg';
import pocketWatch from '../assets/design/pocket-watch.png';
import paperclip from '../assets/collage/paperclip.png';
import intro1 from '../assets/placeholder/intro-1.jpg';
import intro2 from '../assets/placeholder/intro-2.jpg';
import intro3 from '../assets/placeholder/intro-3.jpg';
import intro4 from '../assets/placeholder/intro-4.jpg';
import intro5 from '../assets/placeholder/intro-5.jpg';

import workBondGarden from '../assets/works/bond-garden.webp';
import workMoonpaper from '../assets/works/moonpaper.webp';
import workNapyru from '../assets/works/napyru.webp';
import workMoona from '../assets/works/moona.webp';
import workTaskBoard from '../assets/works/fo-task-board.webp';
import workThemes from '../assets/works/colour-themes.webp';

/** The archives: screenshots of Teha's projects (the task board is private: its cover is an illustration). */
export const casePhotos = {
  'bond-garden': workBondGarden,
  moonpaper: workMoonpaper,
  napyru: workNapyru,
  moona: workMoona,
  'fo-task-board': workTaskBoard,
  'colour-themes': workThemes,
} as const;

export const introPhotos = { 'intro-1': intro1, 'intro-2': intro2, 'intro-3': intro3, 'intro-4': intro4, 'intro-5': intro5 } as const;

/** Cut-outs supplied by Teha (Canva collage sheets), cut apart by scripts/ (see README). */
export const collage = { hand, envelope, paper, newspaper, paperclip, eye, moth } as const;

/** Pieces from Teha's revised Canva designs (Oct 2026). */
export const design = { lace, gingham, pocketWatch } as const;
