"""Fetch the Substack RSS feed and write the three latest posts to data/substack.json."""
import json, re, urllib.request, xml.etree.ElementTree as ET
from email.utils import parsedate_to_datetime
from datetime import date

FEED = 'https://johnenarson.substack.com/feed'
req = urllib.request.Request(FEED, headers={'User-Agent': 'Mozilla/5.0 (johnenarson.com feed updater)'})
root = ET.fromstring(urllib.request.urlopen(req, timeout=30).read())
posts = []
for item in root.iter('item'):
    enc = item.find('enclosure')
    img = enc.get('url') if enc is not None else ''
    if not img:
        m = re.search(r'<img[^>]+src="([^"]+)"', item.findtext('{http://purl.org/rss/1.0/modules/content/}encoded') or '')
        img = m.group(1) if m else ''
    posts.append({
        'title': (item.findtext('title') or '').strip(),
        'subtitle': re.sub('<[^>]+>', '', item.findtext('description') or '').strip(),
        'url': (item.findtext('link') or '').strip(),
        'date': parsedate_to_datetime(item.findtext('pubDate')).date().isoformat(),
        'image': img,
    })
posts.sort(key=lambda p: p['date'], reverse=True)
out = {'updated': date.today().isoformat(), 'posts': posts[:3]}
old = json.load(open('data/substack.json')) if __import__('os').path.exists('data/substack.json') else {}
if old.get('posts') != out['posts']:
    json.dump(out, open('data/substack.json', 'w'), ensure_ascii=False, indent=2)
    print('updated')
else:
    print('no change')
