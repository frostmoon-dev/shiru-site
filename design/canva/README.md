# Teha: Canva files

One PowerPoint file per screen of the site, built from the real rendered pages (desktop, 1440 px wide).
Canva opens each one as an editable design.

| File | Screen |
| --- | --- |
| `01-hero.pptx` | Prologue (hero), following Teha's Canva layout |
| `02-down-the-rabbit-hole.pptx` | Chapter I · About |
| `03-on-the-record.pptx` | Chapter II · On the record (résumé) |
| `04-the-paper-trail.pptx` | Chapter III · The paper trail (employment history), every file shut |
| `05-grimoire-closed.pptx` / `06-grimoire-open.pptx` | Chapter IV · Career, book shut and open |
| `07-tea-at-midnight.pptx` / `08-tea-letter-open.pptx` | Chapter V · Contact, envelope sealed and letter out |
| `09-footer.pptx` | Come back after dark |
| `10-grimoire-chapter-page.pptx` | A grimoire chapter |
| `11-not-found.pptx` | The 404 page |

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
