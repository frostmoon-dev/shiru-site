# Teha: Canva files

One PowerPoint file per screen of the site, built from the real rendered pages (desktop, 1440 px wide).
Canva opens each one as an editable design.

| File | Screen |
| --- | --- |
| `01-hero.pptx` | Personal page · Prologue (hero) |
| `02-down-the-rabbit-hole.pptx` | Personal page · I About |
| `03-a-deck-of-curiosities.pptx` | Personal page · II Hobbies (cards face up) |
| `04-tea-at-midnight.pptx` / `05-tea-letter-open.pptx` | Personal page · Contact, envelope sealed and letter out |
| `06-footer.pptx` | Come back after dark |
| `07-work-top.pptx` | Work page · top (name, résumé, LinkedIn, email) |
| `08-on-the-record.pptx` | Work page · I Résumé |
| `09-the-tool-cabinet.pptx` | Work page · II Tech stack |
| `10-the-paper-trail.pptx` | Work page · III Employment |
| `11-grimoire-closed.pptx` / `12-grimoire-open.pptx` | Work page · IV Career, book shut and open |
| `13-grimoire-chapter-page.pptx` | A grimoire chapter |
| `14-not-found.pptx` | The 404 page |

## Each design has these layers (bottom to top)

1. **Background**: one flattened picture: colours, paper texture, ink drips, gingham, pinstripes,
   borders, props drawn in code (clocks, cards), the moon's still frame.
2. **Images**: each photo and cut-out on its own (newspaper, eye, hand, moth, paperclip, keyhole, the résumé preview).
3. **Text**: every heading, paragraph, label and button label as a real, editable text box.

## Before you import: fonts

Canva can only show the right fonts if they're in your account. Uploading fonts needs Canva Pro,
Teams or a similar plan (Brand Kit → Fonts → Upload; OTF, TTF or WOFF).

- **American Horror Story** (headings): `src/assets/fonts/american-horror-story/AmericanHorrorStory-Regular.otf`.
  ⚠️ It came with no licence. Check you're allowed to use it before publishing anything made with it.
- **Atkinson Hyperlegible Next** (everything else): download the family from Google Fonts and upload the
  Regular, Bold and Italic files.

Without them Canva substitutes similar fonts, and text may wrap a little differently.

## Import

1. Open canva.com in a desktop browser (PowerPoint import doesn't work in the mobile app).
2. Drag a `.pptx` onto the Canva home page, or use **Create a design → Import file**.
3. Each file becomes its own design at the screen's exact size.

## What doesn't come across

Animation and interaction (the light cursor, film dust, typewriter, glitch, ghost titles, the
eye dock menu, page turns, the envelope opening, the intro static) are code. These files show each screen as a still;

## Making them again after the site changes

```bash
npm run build && npx astro preview --port 4322
```

```bash
pip install python-pptx
```

```bash
npm run export:canva
```
