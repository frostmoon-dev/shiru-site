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
import mapHeart from '../assets/collage/map-heart.png';
import cassette from '../assets/collage/cassette.png';
import mirror from '../assets/collage/mirror.png';
import starChart from '../assets/collage/star-chart.png';
import roses from '../assets/collage/roses.png';
import quail from '../assets/collage/quail.png';
import dragonfly from '../assets/collage/dragonfly.png';
import driedRose from '../assets/collage/dried-rose.png';
import building from '../assets/collage/building.png';
import openBook from '../assets/collage/open-book.png';
import witchHat from '../assets/collage/witch-hat.png';
import keyhole from '../assets/collage/keyhole.png';
import cat from '../assets/collage/cat.png';
import icedCoffee from '../assets/collage/iced-coffee.png';
import cardBack from '../assets/collage/card-back.png';
import moonCutout from '../assets/collage/moon.png';
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

export const introPhotos = { 'intro-1': intro1, 'intro-2': intro2, 'intro-3': intro3, 'intro-4': intro4, 'intro-5': intro5 } as const;

/** Cut-outs supplied by Teha (Canva collage sheets), cut apart by scripts/ (see README). */
export const collage = { hand, envelope, paper, newspaper, paperclip, eye, moth } as const;

/** Teha's vintage cut-outs (Nov 2026): the hobby cards, the hero, the herbarium, the intro and the fall. */
export const cutouts = { mapHeart, cassette, mirror, starChart, roses, quail, dragonfly, driedRose, building, openBook, witchHat, keyhole, cat, icedCoffee, cardBack, moon: moonCutout } as const;
export type CutoutName = keyof typeof cutouts;

/** Pieces from Teha's revised Canva designs (Oct 2026). */
export const design = { lace, gingham, pocketWatch } as const;
