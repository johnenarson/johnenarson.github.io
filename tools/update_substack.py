"""Fetch the Substack feed and write the three latest posts to data/substack.json.

Substack often blocks GitHub's servers (HTTP 403). If the fetch fails, the
existing data is kept and the job exits successfully instead of sending a
failure email.
"""
import json, os, re, sys, urllib.parse, urllib.request, xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import date

FEED = 'https://johnenarson.substack.com/feed'
OUT = 'data/substack.json'
UA = 'Mozilla/5.0 (johnenarson.com feed updater)'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': '*/*'})
    return urllib.request.urlopen(req, timeout=30).read()


def strip_tags(s):
    return re.sub('<[^>]+>', '', s or '').strip()


def first_img(html):
    m = re.search(r'<img[^>]+src="([^"]+)"', html or '')
    return m.group(1) if m else ''


def from_rss():
    root = ET.fromstring(get(FEED))
    posts = []
    for item in root.iter('item'):
        enc = item.find('enclosure')
        img = enc.get('url') if enc is not None else ''
        img = img or first_img(item.findtext('{http://purl.org/rss/1.0/modules/content/}encoded'))
        posts.append({
            'title': (item.findtext('title') or '').strip(),
            'subtitle': strip_tags(item.findtext('description')),
            'url': (item.findtext('link') or '').strip(),
            'date': parsedate_to_datetime(item.findtext('pubDate')).date().isoformat(),
            'image': img,
        })
    return posts


posts = None
for name, fn in (('Substack RSS', from_rss),):
    try:
        posts = fn()
        if posts:
            print(f'Fetched {len(posts)} posts via {name}')
            break
    except Exception as e:
        print(f'::warning::{name} failed: {e}')

if not posts:
    print('::warning::Could not fetch the Substack feed; keeping existing posts.')
    sys.exit(0)

posts.sort(key=lambda p: p['date'], reverse=True)
out = {'updated': date.today().isoformat(), 'posts': posts[:3]}
old = json.load(open(OUT, encoding='utf-8')) if os.path.exists(OUT) else {}
if old.get('posts') != out['posts']:
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print('updated')
else:
    print('no change')
