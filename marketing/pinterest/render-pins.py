"""Render precise branded layouts from existing editorial assets; no new photo claims.
Requires Python/Pillow and Inkscape. Usage: python marketing/pinterest/render-pins.py OUTPUT_DIRECTORY
"""
from pathlib import Path
import re,json,csv,base64,sys,subprocess,textwrap,io
from html import escape
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
def text_lines(text,x,y,width=25,size=66,color='#294b3c',font='DejaVu Serif',weight='normal'):
 lines=textwrap.wrap(text,width=width);assert len(lines)<=3,(text,lines)
 return ''.join(f'<text x="{x}" y="{y+i*(size*1.18):.1f}" font-family="{font}" font-weight="{weight}" font-size="{size}" fill="{color}">{escape(line)}</text>' for i,line in enumerate(lines))
manifest=[]
for slug,board,titles,notes in rows:
 source=(ROOT/'src/content/articles'/f'{slug}.md').read_text()
 title=re.search(r'^title: "([^"]+)"',source,re.M).group(1)
 desc=re.search(r'^description: "([^"]+)"',source,re.M).group(1)
 cover=re.search(r'^image: "([^"]+)"',source,re.M).group(1)
 detail=re.search(r'src="(/assets/articles/[^"]+)"',source).group(1)
 cover_alt=re.search(r'^imageAlt: "([^"]+)"',source,re.M).group(1)
 detail_alt=re.search(r'<img[^>]+alt="([^"]+)"',source).group(1)
 for v in range(2):
  path=ROOT/'public'/(cover if v==0 else detail).lstrip('/')
  buffer=io.BytesIO()
  with Image.open(path) as photo: photo.convert('RGB').save(buffer,format='PNG')
  encoded=base64.b64encode(buffer.getvalue()).decode()
  data=f'data:image/png;base64,{encoded}'
  bg='#f6f3eb' if v==0 else '#e8eddf'
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="1500" viewBox="0 0 1000 1500"><rect width="1000" height="1500" fill="{bg}"/>'
  svg+='<text x="60" y="76" font-family="DejaVu Sans" font-size="25" fill="#294b3c" letter-spacing="3">LITTLE HOME IDEAS</text><path d="M60 109H940" stroke="#b5c2ae"/>'
  if v==0:
   svg+=text_lines(titles[v],60,220,width=24,size=67)
   svg+=f'<rect x="40" y="453" width="920" height="614" fill="#fffdf8"/><image xlink:href="{data}" x="40" y="453" width="920" height="614" preserveAspectRatio="xMidYMid meet"/>'
   svg+=text_lines(notes[v],60,1160,width=43,size=34,font='DejaVu Sans')
  else:
   svg+=f'<rect x="40" y="150" width="920" height="614" fill="#fffdf8"/><image xlink:href="{data}" x="40" y="150" width="920" height="614" preserveAspectRatio="xMidYMid meet"/>'
   svg+=text_lines(titles[v],60,880,width=24,size=67)
   svg+=text_lines(notes[v],60,1150,width=43,size=34,font='DejaVu Sans')
  svg+='<rect x="60" y="1290" width="400" height="76" rx="6" fill="#294b3c"/><text x="90" y="1339" font-family="DejaVu Sans" font-size="28" fill="white">READ THE GUIDE →</text><text x="60" y="1437" font-family="DejaVu Sans" font-size="26" fill="#294b3c">littlehomeideas.com</text></svg>'
  name=f'{slug}-{v+1:02d}'
  temp=out/f'{name}.svg';temp.write_text(svg)
  png=out/f'{name}.png'
  subprocess.run(['inkscape',str(temp),'--export-type=png',f'--export-filename={png}'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
  with Image.open(png) as im:
   assert im.size==(1000,1500)
   im.convert('RGB').save(out/f'{name}.jpg',quality=90,optimize=True,exif=Image.Exif())
  png.unlink();temp.unlink()
  manifest.append(dict(pin_id=name,image_file=f'{name}.jpg',title=titles[v],description=f'{notes[v]} {desc} Read the full guide at Little Home Ideas.',link=f'https://littlehomeideas.com/articles/{slug}/',board=board,alt_text=f'{cover_alt if v==0 else detail_alt} Text: {titles[v]}'))
# Alternate topics across the first nine days; the second variant follows later.
manifest=manifest[::2]+manifest[1::2]
for i,row in enumerate(manifest):row['suggested_day']=i+1
with (out/'pin-copy.csv').open('w',newline='',encoding='utf-8-sig') as f:
 w=csv.DictWriter(f,fieldnames=list(manifest[0]));w.writeheader();w.writerows(manifest)
(out/'pin-copy.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False))
# Contact sheet for human inspection only.
thumbs=Image.new('RGB',(1500,1125),'#ffffff')
for i,row in enumerate(manifest):
 with Image.open(out/row['image_file']) as im:
  im.thumbnail((250,375));thumbs.paste(im,((i%6)*250,(i//6)*375))
thumbs.save(out/'contact-sheet.jpg',quality=88)
print(f'Rendered {len(manifest)} JPEG Pins, 1000x1500, with 18 distinct article images.')
