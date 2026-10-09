#!/usr/bin/env python3
"""Republish Distribute Press Releases announcements on Action Global News.

Reads https://distributepressreleases.com/syndication/actionglobalnews.json and
writes press-releases/<slug>/index.html for each item: the release in full,
under its paid or affiliated label, with rel=canonical pointing at the original.
Also refreshes the "Latest announcements" list on /press-releases/ and a short
list of headlines from Press Release For Business. Pages are never deleted.
"""
import json, re, html, os, datetime, urllib.request, xml.etree.ElementTree as ET

SRC = 'https://distributepressreleases.com/syndication/actionglobalnews.json'
PRFB = 'https://pressreleaseforbusiness.com/feed.xml'
SITE = 'https://actionglobalnews.com'
UA = 'Mozilla/5.0 (compatible; ActionGlobalNewsFeedBot/1.0; +https://actionglobalnews.com/about/)'
INDEX = 'press-releases/index.html'
A, B = '<!-- dpr:latest:start -->', '<!-- dpr:latest:end -->'


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def esc(s):
    return html.escape(str(s or ''), quote=True)


def long_date(iso):
    try:
        d = datetime.date.fromisoformat(iso[:10])
        return d.strftime('%B %-d, %Y')
    except Exception:
        return iso[:10]


def clean_content(h):
    # only the tags the publisher emits; links forced to sponsored
    h = re.sub(r'<(script|style|iframe)[^>]*>.*?</\1>', '', h, flags=re.S | re.I)
    h = re.sub(r'<a href="(https?://[^"]+)"[^>]*>', r'<a href="\1" rel="sponsored noopener" target="_blank">', h)
    return h


def page(tpl, it):
    x = it.get('_dpr', {})
    slug = re.sub(r'[^a-z0-9-]', '', x.get('slug', ''))
    url = '%s/press-releases/%s/' % (SITE, slug)
    canon = it['url']
    title = it['title']
    t_tag = title if len(title) <= 50 else title[:50].rsplit(' ', 1)[0] + '…'
    t_tag = '%s | Action Global News' % t_tag
    desc = it.get('summary', '')[:158]
    head, rest = tpl.split('<main id="main">', 1)
    foot = rest.split('</main>', 1)[1]
    head = re.sub(r'<title>.*?</title>', '<title>%s</title>' % esc(t_tag), head)
    head = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % esc(desc), head)
    head = re.sub(r'<link rel="canonical" href="[^"]*">', '<link rel="canonical" href="%s">' % esc(canon), head)
    head = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="article">', head)
    for prop in ('og:title', 'twitter:title'):
        attr = 'property' if prop.startswith('og') else 'name'
        head = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, prop), '<meta %s="%s" content="%s">' % (attr, prop, esc(title)), head)
    for prop in ('og:description', 'twitter:description'):
        attr = 'property' if prop.startswith('og') else 'name'
        head = re.sub(r'<meta %s="%s" content="[^"]*">' % (attr, prop), '<meta %s="%s" content="%s">' % (attr, prop, esc(desc)), head)
    head = re.sub(r'<meta property="og:url" content="[^"]*">', '<meta property="og:url" content="%s">' % esc(canon), head)
    graph = {"@context": "https://schema.org", "@graph": [
        {"@type": "NewsArticle", "@id": url + "#article", "headline": title[:110], "description": desc,
         "datePublished": it.get('date_published', ''), "url": url, "isBasedOn": canon,
         "mainEntityOfPage": canon, "creditText": x.get('label', 'Press release'),
         "author": {"@type": "Organization", "name": x.get('company', '')},
         "publisher": {"@id": SITE + "/#org"}, "inLanguage": "en-US",
         "articleSection": "Announcements"},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Front Page", "item": SITE + "/"},
            {"@type": "ListItem", "position": 2, "name": "Announcements", "item": SITE + "/press-releases/"},
            {"@type": "ListItem", "position": 3, "name": title[:80], "item": url}]}]}
    head = re.sub(r'<script type="application/ld\+json">.*?</script>',
                  lambda m: '<script type="application/ld+json">%s</script>' % json.dumps(graph, ensure_ascii=False),
                  head, count=1, flags=re.S)
    head = head.replace('<a href="/" aria-current="page">Front Page</a>', '<a href="/">Front Page</a>')
    contact = x.get('contact') or {}
    import base64
    parts = [esc(contact['name'])] if contact.get('name') else []
    if contact.get('email') and '@' in contact['email']:
        u, d = contact['email'].split('@', 1)
        parts.append('<a href="#" data-mu="%s" data-md="%s">Email the contact</a>'
                     % (base64.b64encode(u.encode()).decode(), base64.b64encode(d.encode()).decode()))
    if contact.get('phone'):
        parts.append(esc(contact['phone']))
    contact_html = '<br>'.join(parts)
    body = '''<main id="main">

<div class="wrap">
  <div class="deskhead"><nav class="crumb" aria-label="Breadcrumb"><a href="/">Front Page</a> <span>/</span> <a href="/press-releases/">Announcements</a> <span>/</span> <span aria-current="page">{company}</span></nav>
    <span class="kicker">{label}</span>
    <h1>{title}</h1>
    <p class="dek">{summary}</p>
  </div>
</div>

<div class="wrap">
  <div class="art-wrap" style="padding:0">
    <div class="art" style="padding-top:8px">
      <div class="callout" style="border-left-color:var(--brand)">
        <strong>{label}</strong>
        {disclosure} Republished from <a href="{canon}">Distribute Press Releases</a>, where it was first published on {date}. This is the company&rsquo;s own statement, not Action Global News reporting.
      </div>
{content}
      <h2>Media contact</h2>
      <p>{contact}</p>
      <p style="font-size:14px;color:var(--ink-3)">Original release: <a href="{canon}">{canon}</a> &middot; <a href="{receipt}">Distribution receipt</a> &middot; <a href="/press-releases/">All announcements</a></p>
    </div>
  </div>
</div>
'''.format(company=esc(x.get('company', '')), label=esc(x.get('label', 'Press release')), title=esc(title),
           summary=esc(it.get('summary', '')), disclosure=esc(x.get('disclosure', '')), canon=esc(canon),
           date=long_date(it.get('date_published', '')), content=clean_content(it.get('content_html', '')),
           contact=contact_html or esc(x.get('company', '')), receipt=esc(x.get('receipt', canon)))
    return slug, head + body + '</main>' + foot


def prfb_items():
    try:
        root = ET.fromstring(get(PRFB))
    except Exception as e:
        print('PRFB feed unavailable:', e)
        return []
    out = []
    for item in root.iter('item'):
        t, l = item.findtext('title') or '', item.findtext('link') or ''
        if t and l.startswith('https://pressreleaseforbusiness.com/'):
            out.append((t.strip(), l.strip()))
        if len(out) >= 6:
            break
    return out


def main():
    feed = json.loads(get(SRC))
    items = feed.get('items', [])
    tpl = open(INDEX, encoding='utf-8').read()
    # the template must not carry the generated list into release pages
    tpl_clean = re.sub(re.escape(A) + '.*?' + re.escape(B), '', tpl, flags=re.S)
    written = []
    for it in items:
        slug, out = page(tpl_clean, it)
        if not slug:
            continue
        path = 'press-releases/%s/index.html' % slug
        os.makedirs(os.path.dirname(path), exist_ok=True)
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        if old != out:
            open(path, 'w', encoding='utf-8').write(out)
            written.append(slug)
    rows = ''.join('<li><a href="/press-releases/{s}/">{t}</a> <span style="color:var(--ink-3);font-size:13px">&middot; {c} &middot; {d} &middot; {l}</span></li>'.format(
        s=esc(it['_dpr']['slug']), t=esc(it['title']), c=esc(it['_dpr'].get('company', '')),
        d=long_date(it.get('date_published', '')), l=esc(it['_dpr'].get('label', ''))) for it in items[:20])
    prfb = ''.join('<li><a href="%s" rel="sponsored noopener" target="_blank">%s</a></li>' % (esc(l), esc(t)) for t, l in prfb_items())
    block = A + '''
      <h2>Latest announcements</h2>
      <p>Company announcements republished from <a href="https://distributepressreleases.com/">Distribute Press Releases</a>, each under its label, with the original as the canonical source.</p>
      <ul>%s</ul>%s
      ''' % (rows or '<li>No announcements yet.</li>',
             ('\n      <h3>Also from Press Release For Business</h3>\n      <ul>%s</ul>' % prfb) if prfb else '') + B
    if A in tpl:
        new = re.sub(re.escape(A) + '.*?' + re.escape(B), lambda m: block, tpl, flags=re.S)
    else:
        anchor = '<h2>Two different things</h2>'
        new = tpl.replace(anchor, block + '\n\n      ' + anchor, 1)
    if new != tpl:
        open(INDEX, 'w', encoding='utf-8').write(new)
    print('items %d, pages written %d: %s' % (len(items), len(written), ', '.join(written)))


if __name__ == '__main__':
    main()
