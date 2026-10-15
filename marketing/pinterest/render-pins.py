"""Export 2:3 portrait source scenes as complete 1000x1500 JPEG Pins.
Usage: python marketing/pinterest/render-pins.py SOURCE_DIRECTORY OUTPUT_DIRECTORY
Sources: generated portrait PNGs, or the JPEGs from the saved launch bundle.
Requires Pillow. Landscape input fails validation; no cropping or padding is used.
"""
from pathlib import Path
import csv,hashlib,json,sys
from PIL import Image
if len(sys.argv)!=3:raise SystemExit(__doc__)
ROOT=Path(__file__).resolve().parents[2]
sources=Path(sys.argv[1]).resolve();out=Path(sys.argv[2]).resolve();out.mkdir(parents=True,exist_ok=True)
rows=json.loads((ROOT/'marketing/pinterest/pin-copy.json').read_text())
prompts={j['pin_id']:j for j in json.loads((ROOT/'marketing/pinterest/portrait-prompts.json').read_text())}
assets=[]
for row in rows:
 pin=row['pin_id'];candidates=[sources/(pin+'.png'),sources/(pin+'.jpg')];src=next((p for p in candidates if p.is_file()),None)
 if not src:raise ValueError('Missing portrait source: '+pin)
 with Image.open(src) as im:
  im.load();w,h=im.size
  if w*3!=h*2:raise ValueError(f'{pin}: expected a 2:3 portrait source, got {w}x{h}')
  metadata={key:im.info[key] for key in ['icc_profile','xmp'] if im.info.get(key)}
  im.convert('RGB').resize((1000,1500),Image.Resampling.LANCZOS).save(out/row['image_file'],quality=91,optimize=True,**metadata)
 row['alt_text']=prompts[pin]['alt_text']
 assets.append(dict(pin_id=pin,image_file=row['image_file'],width=1000,height=1500,bytes=(out/row['image_file']).stat().st_size,sha256=hashlib.sha256((out/row['image_file']).read_bytes()).hexdigest(),generation_mode='built-in image_gen',source_dimensions=[w,h],prompt_id=pin))
with (out/'pin-copy.csv').open('w',newline='',encoding='utf-8-sig') as f:
 writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
(out/'pin-copy.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False))
(out/'portrait-assets.json').write_text(json.dumps(assets,indent=2))
# Review sheet only, not a Pin for publication.
sheet=Image.new('RGB',(1500,1125),'white')
for i,row in enumerate(rows):
 with Image.open(out/row['image_file']) as im:
  im.thumbnail((250,375));sheet.paste(im,((i%6)*250,(i//6)*375))
sheet.save(out/'contact-sheet.jpg',quality=89)
print(f'Exported {len(rows)} portrait JPEGs at 1000x1500; no cropping, padding, borders, or text overlays.')
