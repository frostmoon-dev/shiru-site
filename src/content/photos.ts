/**
 * Image imports, kept apart from the copy so site.ts stays plain text.
 * Swap a file in src/assets/placeholder/ (same name) or point an import at a new file.
 * Astro turns each into AVIF/WebP at several widths at build time.
 */
import heroPortrait from '../assets/portrait/shiru.jpg';
import eye from '../assets/collage/eye.png';
import hand from '../assets/collage/hand.png';
import hat from '../assets/collage/hat.png';
import keyhole from '../assets/collage/keyhole.png';
import butterfly from '../assets/collage/butterfly.png';
import envelope from '../assets/collage/envelope.png';
import paper from '../assets/collage/paper.png';
import moonPoster from '../assets/collage/moon-poster.jpg';
import caseErp from '../assets/placeholder/case-erp.jpg';
import caseTranslation from '../assets/placeholder/case-translation.jpg';
import caseLore from '../assets/placeholder/case-lore.jpg';
import intro1 from '../assets/placeholder/intro-1.jpg';
import intro2 from '../assets/placeholder/intro-2.jpg';
import intro3 from '../assets/placeholder/intro-3.jpg';
import intro4 from '../assets/placeholder/intro-4.jpg';
import intro5 from '../assets/placeholder/intro-5.jpg';

export const casePhotos = {
  'case-erp': caseErp,
  'case-translation': caseTranslation,
  'case-lore': caseLore,
} as const;

export const introPhotos = { 'intro-1': intro1, 'intro-2': intro2, 'intro-3': intro3, 'intro-4': intro4, 'intro-5': intro5 } as const;

export { heroPortrait };

/** Cut-outs supplied by Shiru (Canva collage sheets), cut apart by scripts/ (see README). */
export const collage = { eye, hand, hat, keyhole, butterfly, envelope, paper, moonPoster } as const;
