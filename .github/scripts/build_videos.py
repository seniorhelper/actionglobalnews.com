#!/usr/bin/env python3
"""Fetch the newest uploads from each official news channel used on the
video desk and write data/videos.json.

The channel list is read from the CHN map in assets/agn.js so the page and
the snapshot never drift apart. Uses YouTube's public per-channel RSS feed
(no API key). Shorts are skipped. A channel that fails keeps its last good
copy so a module is never blanked.
"""
import json, re, sys, datetime, urllib.request, xml.etree.ElementTree as ET

JS = open('assets/agn.js', encoding='utf-8').read()
CHN = json.loads(re.search(r'var CHN = (\{.*?\});', JS, re.S).group(1))
UA = 'Mozilla/5.0 (compatible; ActionGlobalNewsFeedBot/1.0; +https://actionglobalnews.com/about/)'
NS = {'a': 'http://www.w3.org/2005/Atom', 'yt': 'http://www.youtube.com/xml/schemas/2015',
      'media': 'http://search.yahoo.com/mrss/'}
PER = 8

try:
    previous = json.load(open('data/videos.json', encoding='utf-8')).get('videos', {})
except Exception:
    previous = {}

videos, ok, failed = {}, 0, []
for key, (name, cid) in CHN.items():
    url = 'https://www.youtube.com/feeds/videos.xml?channel_id=' + cid
    try:
        req = urllib.request.Request(url, headers={'User-Agent': UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            root = ET.fromstring(r.read())
        out = []
        for e in root.findall('a:entry', NS):
            vid = e.findtext('yt:videoId', '', NS)
            link = (e.find('a:link', NS).get('href') if e.find('a:link', NS) is not None else '')
            if not vid or '/shorts/' in link:
                continue
            out.append({'id': vid, 'title': (e.findtext('a:title', '', NS) or '').strip(),
                        'date': e.findtext('a:published', '', NS)})
            if len(out) >= PER:
                break
        if not out:
            raise ValueError('no videos')
        videos[key] = out
        ok += 1
    except Exception as ex:
        failed.append('%s: %s' % (key, ex))
        if previous.get(key):
            videos[key] = previous[key]

snap = {'generated': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'videos': videos}
json.dump(snap, open('data/videos.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print('%d/%d channels refreshed' % (ok, len(CHN)))
for f in failed:
    print('  failed', f)
sys.exit(0 if (ok or videos) else 1)
