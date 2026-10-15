"""Export full, uncropped article scenes as image-only Pinterest JPEGs.
Requires Python/Pillow. Usage: python marketing/pinterest/render-pins.py OUTPUT_DIRECTORY
"""
from pathlib import Path
import re,json,csv,sys
from PIL import Image
ROOT=Path(__file__).resolve().parents[2]
out=Path(sys.argv[1]).resolve();out.mkdir(parents=True,exist_ok=True)
rows=[
('small-patio-furniture-layout','Garden & Patio Ideas',['Plan a patio before you shop','Will your patio chairs fit?'],['Map doors, seating, and the routes you use.','Check the space a pulled-out chair needs.']),
('organize-small-kitchen-drawers','Small Spaces & Storage',['Small drawers. A smarter setup.','Measure before buying drawer organizers'],['Group kitchen tools around everyday tasks.','Start with the drawer and the tools you own.']),
('container-garden-first-three-pots','Garden & Patio Ideas',['Start a garden with three pots','Better drainage starts with the pot'],['Choose plants for your light and daily routine.','Check drainage holes and plan for runoff.']),
('small-entryway-without-a-closet','Small Spaces & Storage',['No entry closet? Start here.','Make room for your everyday shoes'],['Give everyday shoes, keys, and bags a place.','Plan a small landing zone around daily use.']),
('reversible-living-room-updates','DIY & Home Updates',['A living room you can change back','Small living room. Softer details.'],['Try lighting, textiles, and movable furniture.','Use removable layers to refresh your space.']),
('under-sink-storage-around-pipes','Practical Home Solutions',['Work around your sink pipes','Leave room to reach the plumbing'],['Measure the obstacles before choosing storage.','Keep connections and possible leaks visible.']),
('patio-privacy-ideas-for-renters','Garden & Patio Ideas',['More patio privacy. No drilling.','Screen the view that matters'],['Compare movable options and rental limits.','Start with the sightline from your chair.']),
('removable-hooks-rental-wall-checklist','Renter-Friendly Home Ideas',['Before you hang that removable hook','Removable does not mean damage-proof'],['Check your lease, wall finish, and product limits.','Test the surface and follow removal instructions.']),
('window-condensation-checklist-for-renters','Practical Home Solutions',['Water on your windows? Check this.','Keep a simple condensation log'],['Observe moisture, document it, and report concerns.','Record when it happens and which windows change.']),
]
manifest=[]
for slug,board,titles,notes in rows:
 source=(ROOT/'src/content/articles'/f'{slug}.md').read_text()
 desc=re.search(r'^description: "([^"]+)"',source,re.M).group(1)
 cover=re.search(r'^image: "([^"]+)"',source,re.M).group(1)
 detail=re.search(r'src="(/assets/articles/[^"]+)"',source).group(1)
 cover_alt=re.search(r'^imageAlt: "([^"]+)"',source,re.M).group(1)
 detail_alt=re.search(r'<img[^>]+alt="([^"]+)"',source).group(1)
 for v in range(2):
  path=ROOT/'public'/(cover if v==0 else detail).lstrip('/')
  name=f'{slug}-{v+1:02d}'
  with Image.open(path) as photo:
   photo.convert('RGB').save(out/f'{name}.jpg',quality=92,optimize=True)
  manifest.append(dict(pin_id=name,image_file=f'{name}.jpg',title=titles[v],description=f'{notes[v]} {desc} Read the full guide at Little Home Ideas.',link=f'https://littlehomeideas.com/articles/{slug}/',board=board,alt_text=cover_alt if v==0 else detail_alt))
manifest=manifest[::2]+manifest[1::2]
for i,row in enumerate(manifest):row['suggested_day']=i+1
with (out/'pin-copy.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=list(manifest[0]));w.writeheader();w.writerows(manifest)
(out/'pin-copy.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
# Review sheet, not a publishable Pin.
thumbs=Image.new('RGB',(1500,501),'#ffffff')
for i,row in enumerate(manifest):
 with Image.open(out/row['image_file']) as im:
  im.thumbnail((250,167));thumbs.paste(im,((i%6)*250,(i//6)*167))
thumbs.save(out/'contact-sheet.jpg',quality=90)
print(f'Exported {len(manifest)} full-image JPEGs; source dimensions retained; no cropping, overlays, borders, or composited typography.')
