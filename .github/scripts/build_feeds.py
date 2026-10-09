#!/usr/bin/env python3
"""Fetch every headline feed used on the site and write data/feeds.json.

The front end reads this snapshot first and only falls back to public
proxies when it is missing or older than 12 hours.
"""
import json, re, sys, datetime, urllib.request, xml.etree.ElementTree as ET

JS = open('assets/agn.js', encoding='utf-8').read()
m = re.search(r'var FEEDS = (\{.*?\});', JS, re.S)
FEEDS = json.loads(m.group(1))
UA = 'Mozilla/5.0 (compatible; ActionGlobalNewsFeedBot/1.0; +https://actionglobalnews.com/about/)'
MAX = 12


def local(tag):
    return tag.rsplit('}', 1)[-1].lower()


def parse(raw):
    root = ET.fromstring(raw)
    out = []
    for el in root.iter():
        if local(el.tag) not in ('item', 'entry'):
            continue
        title = link = date = ''
        for c in el:
            n = local(c.tag)
            if n == 'title':
                title = (c.text or '').strip()
            elif n == 'link':
                link = (c.get('href') or c.text or '').strip() or link
            elif n in ('pubdate', 'updated', 'published', 'date') and not date:
                date = (c.text or '').strip()
        if title and link:
            out.append({'title': title, 'link': link, 'date': date})
        if len(out) >= MAX:
            break
    return out


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml'})
    with urllib.request.urlopen(req, timeout=20) as r:
        return r.read()


try:
    previous = json.load(open('data/feeds.json', encoding='utf-8')).get('feeds', {})
except Exception:
    previous = {}

feeds, ok, failed = {}, 0, []
for key, cfg in FEEDS.items():
    try:
        items = parse(fetch(cfg[0]))
        if not items:
            raise ValueError('no items')
        feeds[key] = items
        ok += 1
    except Exception as e:  # keep the last good copy rather than blanking a module
        failed.append(f'{key}: {e}')
        if previous.get(key):
            feeds[key] = previous[key]

snapshot = {'generated': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'feeds': feeds}
json.dump(snapshot, open('data/feeds.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(f'{ok}/{len(FEEDS)} feeds refreshed')
for f in failed:
    print('  failed', f)
sys.exit(0 if ok else 1)
