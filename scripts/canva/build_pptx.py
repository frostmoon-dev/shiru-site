"""Canva export, step 2: turn the extracted layers into one editable .pptx per screen.

Each slide is the exact size of that screen (1 px = 1/96 in). Layer order, bottom to top:
background picture, then each photo / cut-out, then every text box (real, editable text).

Usage: python3 scripts/canva/build_pptx.py [layersDir] [outDir]
Needs: pip install python-pptx
"""
import json
import sys
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.text import MSO_AUTO_SIZE, PP_ALIGN
from pptx.util import Emu, Pt

LAYERS = Path(sys.argv[1] if len(sys.argv) > 1 else 'design/canva/_layers')
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else 'design/canva')
PX = 9525  # EMU per CSS pixel at 96 dpi
ALIGN = {'left': PP_ALIGN.LEFT, 'center': PP_ALIGN.CENTER, 'right': PP_ALIGN.RIGHT}


def px(v: float) -> Emu:
    return Emu(int(round(v * PX)))


def build(screen: Path) -> Path:
    data = json.loads((screen / 'layers.json').read_text())
    prs = Presentation()
    prs.slide_width = px(data['width'])
    prs.slide_height = px(data['height'])
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # blank

    bg = slide.shapes.add_picture(str(screen / 'background.jpg'), 0, 0, prs.slide_width, prs.slide_height)
    bg.name = 'Background'

    for im in data['images']:
        pic = slide.shapes.add_picture(str(screen / im['file']), px(im['x']), px(im['y']), px(im['w']), px(im['h']))
        pic.rotation = im['rot']
        pic.name = f"Image {im['name']}"

    for t in data['texts']:
        # a little extra width: Canva's text metrics never match the browser's exactly
        w = t['w'] * 1.04 + 2
        x = t['x'] - (w - t['w']) / 2 if t['align'] == 'center' else t['x'] - (w - t['w']) if t['align'] == 'right' else t['x']
        box = slide.shapes.add_textbox(px(x), px(t['y']), px(w), px(t['h']))
        box.rotation = t['rot']
        box.name = f"Text {t['text'][:30]}"
        tf = box.text_frame
        tf.word_wrap = True
        tf.auto_size = MSO_AUTO_SIZE.NONE
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        for i, line in enumerate(t['text'].split('\n')):
            para = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            para.alignment = ALIGN[t['align']]
            para.line_spacing = Pt(t['lineHeight'] * 0.75)
            run = para.add_run()
            run.text = line
            f = run.font
            f.name = t['font']
            f.size = Pt(round(t['size'] * 0.75 * 2) / 2)
            f.bold = t['bold']
            f.italic = t['italic']
            f.color.rgb = RGBColor.from_string(t['color'].upper())
            if t['spacing']:
                run._r.get_or_add_rPr().set('spc', str(int(round(t['spacing'] * 0.75 * 100))))
    out = OUT / f"{data['name']}.pptx"
    prs.save(out)
    return out


OUT.mkdir(parents=True, exist_ok=True)
for screen in sorted(p for p in LAYERS.iterdir() if (p / 'layers.json').exists()):
    path = build(screen)
    print(f'{path}  ({path.stat().st_size // 1024} kB)')
