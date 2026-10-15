"""Audit the actual generated HTML, URLs, assets, and schema without a browser."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit,unquote
import json,sys,xml.etree.ElementTree as ET
root=Path(sys.argv[1] if len(sys.argv)>1 else 'dist');errors=[];documents={}
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=set();self.links=[];self.images=[];self.meta={};self.canonical=[];self.h1=0;self.main=0;self.jsons=[];self.in_json=False;self.buffer='';self.title='';self.in_title=False
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:
   if a['id'] in self.ids:errors.append(f'Duplicate id {a["id"]}')
   self.ids.add(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag in ('img','script','link'):
   u=a.get('src') or (a.get('href') if tag=='link' and a.get('rel') in ('stylesheet','icon') else None)
   if u:self.links.append(u)
  if tag=='img':self.images.append(a)
  if tag=='meta':self.meta[a.get('name') or a.get('property')]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
  if tag=='h1':self.h1+=1
  if tag=='main':self.main+=1
  if tag=='script' and a.get('type')=='application/ld+json':self.in_json=True;self.buffer=''
  if tag=='title':self.in_title=True
 def handle_data(self,s):
  if self.in_json:self.buffer+=s
  if self.in_title:self.title+=s
 def handle_endtag(self,tag):
  if tag=='script' and self.in_json:
   try:self.jsons.append(json.loads(self.buffer))
   except Exception as e:errors.append('Invalid schema: '+str(e))
   self.in_json=False
  if tag=='title':self.in_title=False
for p in root.rglob('*.html'):
 page=Page();page.feed(p.read_text());documents[p.resolve()]=page
 rel=p.relative_to(root).as_posix();url='/' if rel=='index.html' else '/'+rel.removesuffix('index.html')
 if page.h1!=1 or page.main!=1:errors.append(f'{rel}: needs one h1 and one main')
 if not page.meta.get('description'):errors.append(f'{rel}: missing description')
 if page.canonical!=['https://littlehomeideas.com'+url]:errors.append(f'{rel}: wrong canonical {page.canonical}')
 if not page.meta.get('og:image') or not page.jsons:errors.append(f'{rel}: missing social image/schema')
 if len(page.title)>100:errors.append(f'{rel}: excessive title')
 for im in page.images:
  if 'alt' not in im or not im.get('width') or not im.get('height'):errors.append(f'{rel}: image needs alt and dimensions')
 for u in page.links:
  s=urlsplit(u)
  if s.scheme and s.scheme not in ['https','http','mailto']:continue
  if s.netloc and s.netloc!='littlehomeideas.com':continue
  if s.scheme=='mailto':continue
  target=(root/unquote(s.path.lstrip('/'))) if s.path.startswith('/') else (p.parent/unquote(s.path)) if s.path else p
  if s.path.endswith('/') or target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{rel}: missing {u}')
  elif s.fragment and target.suffix=='.html':
   other=documents.get(target.resolve())
   if not other:other=Page();other.feed(target.read_text())
   if unquote(s.fragment) not in other.ids:errors.append(f'{rel}: missing fragment {u}')
 for schema in page.jsons:
  if rel.startswith('articles/') and schema.get('@type')=='Article':
   for key in ['headline','datePublished','dateModified','image','author','publisher','mainEntityOfPage']:
    if key not in schema:errors.append(f'{rel}: missing Article.{key}')
   img=root/urlsplit(schema['image']).path.lstrip('/')
   if not img.exists():errors.append(f'{rel}: missing schema image')
 ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9'}
for name in ['sitemap.xml','sitemap-0.xml','sitemap-index.xml']:
 if not (root/name).exists():errors.append('Missing '+name);continue
 tree=ET.parse(root/name)
 for el in tree.findall('.//s:loc',ns):
  s=urlsplit(el.text);target=root/s.path.lstrip('/');target=target/'index.html' if s.path.endswith('/') else target
  if not target.exists():errors.append('Missing sitemap target '+el.text)
  if s.path in ['/404/','/404.html','/contact/']:errors.append('Nonindexable URL in sitemap '+s.path)
if len(list((root/'articles').glob('*/index.html')))<9:errors.append('Expected existing guide plus eight new guides')
if 'Sitemap: https://littlehomeideas.com/sitemap-index.xml' not in (root/'robots.txt').read_text():errors.append('Robots sitemap mismatch')
# A successful file lookup is insufficient: empty/truncated images also return HTTP 200.
for image in root.rglob('*'):
 if not image.is_file() or image.suffix.lower() not in {'.webp','.png','.jpg','.jpeg','.gif','.svg','.avif','.ico'}:continue
 data=image.read_bytes();rel=image.relative_to(root).as_posix()
 if not data:errors.append(f'{rel}: empty image file');continue
 if image.suffix.lower()=='.webp' and (len(data)<20 or data[:4]!=b'RIFF' or data[8:12]!=b'WEBP' or int.from_bytes(data[4:8],'little')+8!=len(data)):
  errors.append(f'{rel}: invalid or truncated WebP image')
if errors:print('\n'.join(sorted(set(errors))));sys.exit(1)
print(f'PASS: {len(documents)} pages; local links, fragments, image dimensions and file integrity, canonicals, social metadata, Article schema, and 3 sitemap files checked.')
print('Browser layout, accessibility scoring, and Core Web Vitals are not measured by this check.')
