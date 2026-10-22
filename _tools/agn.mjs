#!/usr/bin/env node
// Action Global News content tool. Not published (Jekyll skips folders that start with "_").
//
//   node _tools/agn.mjs new _content/articles/<slug>.json   render one article page from a JSON spec
//   node _tools/agn.mjs index                               rebuild home briefs block, desk blocks, /latest/,
//                                                           author pages, sitemap, news sitemap, RSS, JSON feed,
//                                                           search index and llms.txt article list
//   node _tools/agn.mjs all                                 render every spec in _content/articles, then index
//   node _tools/agn.mjs check                               validate links, JSON-LD and required pages
//
// See CONTENT-GUIDE.md in the repo root for the spec format and the daily workflow.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://actionglobalnews.com';
const SPECS = path.join(ROOT, '_content', 'articles');
const P = (...a) => path.join(ROOT, ...a);
const read = f => fs.readFileSync(P(f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(P(f)), { recursive: true }); fs.writeFileSync(P(f), s); };

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = s => String(s ?? '').replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
  .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘').replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&#x27;/g, "'").replace(/&#39;/g, "'")
  .replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const strip = h => unesc(String(h).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = iso => { const [y, m, d] = iso.slice(0, 10).split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const rfc822 = iso => new Date(iso).toUTCString().replace('GMT', '+0000');
const wordsOf = h => strip(h).split(' ').filter(Boolean).length;

const DESKS = {
  'AI': '/ai/', 'AI Agents': '/ai-agents/', 'Arts & Design': '/arts/', 'Business': '/business/', 'Colorado': '/colorado/',
  'Global Ecommerce': '/global-ecommerce/', 'Health': '/health/', 'Health & Wellness': '/health/', 'Immersive': '/immersive/',
  'Markets': '/markets/', 'Outdoors': '/outdoors/', 'Real Estate': '/real-estate/', 'Science': '/science/',
  'Small Business': '/small-business/', 'Technology': '/technology/', 'Travel': '/travel/', 'World': '/world/',
};
const deskOf = section => DESKS[unesc(section)] || '/latest/';

const ORG = {
  '@type': 'NewsMediaOrganization', '@id': `${SITE}/#org`, name: 'Action Global News', alternateName: 'AGN', url: `${SITE}/`,
  logo: { '@type': 'ImageObject', url: `${SITE}/images/agn-logo-600.png`, width: 600, height: 211 },
  address: { '@type': 'PostalAddress', streetAddress: '1001 Bannock St #660', addressLocality: 'Denver', addressRegion: 'CO', postalCode: '80204', addressCountry: 'US' },
  publishingPrinciples: `${SITE}/editorial-standards/`, ethicsPolicy: `${SITE}/ethics-ai-policy/`, correctionsPolicy: `${SITE}/corrections/`,
  ownershipFundingInfo: `${SITE}/ownership/`, actionableFeedbackPolicy: `${SITE}/news-tips/`, masthead: `${SITE}/about/`,
  founder: { '@id': `${SITE}/authors/zach-wennstedt/#person` },
};
const EDITOR = { '@type': 'Person', '@id': `${SITE}/authors/zach-wennstedt/#person`, name: 'Zach Wennstedt', jobTitle: 'Publisher and Editor', url: `${SITE}/authors/zach-wennstedt/`, worksFor: { '@id': `${SITE}/#org` } };
const STAFF = { '@type': 'Organization', name: 'Action Global News Staff', url: `${SITE}/authors/staff/` };
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'Action Global News', publisher: { '@id': `${SITE}/#org` }, inLanguage: 'en-US' };

// ---------- site chrome, taken live from the home page so it never drifts ----------
function chrome() {
  const home = read('index.html');
  const b = home.indexOf('<body>'), m = home.indexOf('<main id="main">'), e = home.indexOf('</main>');
  if (b < 0 || m < 0 || e < 0) throw new Error('index.html chrome markers missing');
  const header = home.slice(b + 6, m).replace(/ aria-current="page"/g, '');
  const footer = home.slice(e + 7, home.indexOf('</body>'));
  const css = (home.match(/<link rel="stylesheet" href="\/assets\/agn\.min\.css\?v=\d+">/) || ['<link rel="stylesheet" href="/assets/agn.min.css">'])[0];
  return { header, footer, css };
}

function head({ title, description, canonical, robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1', ogType = 'website', image = `${SITE}/images/agn-og.jpg`, extraMeta = '', jsonld }) {
  const { css } = chrome();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="${robots}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="Action Global News">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image}">
<meta property="og:locale" content="en_US">
${extraMeta}<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${image}">
<meta name="theme-color" content="#16181c">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap"></noscript>
${css}
<link rel="icon" href="/images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="alternate" type="application/rss+xml" title="Action Global News" href="/feed.xml">
<link rel="alternate" type="application/feed+json" title="Action Global News (JSON)" href="/feed.json">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3561679124556057" crossorigin="anonymous"></script>
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonld }, null, 1)}</script>
</head>
<body>`;
}
const page = (opts, mainHtml) => { const { header, footer } = chrome(); return `${head(opts)}${header}<main id="main">\n${mainHtml}\n</main>${footer}</body>\n</html>\n`; };

// ---------- registry of published articles (parsed from the pages themselves) ----------
function registry() {
  const out = [];
  for (const slug of fs.readdirSync(P('articles'))) {
    const f = P('articles', slug, 'index.html');
    if (!fs.existsSync(f)) continue;
    const s = fs.readFileSync(f, 'utf8');
    if (/<meta name="robots" content="noindex/.test(s)) continue;
    const g = re => (s.match(re) || [])[1] || '';
    const h1 = g(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    const published = g(/<meta property="article:published_time" content="([^"]+)"/);
    if (!h1 || !published) continue;
    out.push({
      slug, url: `/articles/${slug}/`, h1: strip(h1), title: strip(g(/<title>([\s\S]*?)<\/title>/)),
      description: unesc(g(/<meta name="description" content="([^"]*)"/)),
      standfirst: strip(g(/<p class="art-standfirst">([\s\S]*?)<\/p>/)),
      section: unesc(g(/<meta property="article:section" content="([^"]*)"/)),
      kicker: strip(g(/<div class="art-hero">\s*<span class="kicker">([\s\S]*?)<\/span>/)) || unesc(g(/<meta property="article:section" content="([^"]*)"/)),
      published, modified: g(/<meta property="article:modified_time" content="([^"]+)"/) || published,
      keywords: unesc(g(/"keywords":\s*"([^"]*)"/)),
      network: /From our network/i.test(g(/<div class="art-hero">([\s\S]*?)<\/div>/)),
      words: wordsOf((s.match(/<article class="art">([\s\S]*?)<\/article>/) || [, ''])[1]),
    });
  }
  return out.sort((a, b) => new Date(b.published) - new Date(a.published));
}
const mins = w => Math.max(2, Math.round(w / 230));
const card = (a, cls = 'card card-sm') => `<article class="${cls}"><a href="${a.url}"><span class="kicker">${esc(a.kicker)}</span><h3>${esc(a.h1)}</h3><p>${esc(a.description)}</p></a><div class="meta"><time datetime="${a.published.slice(0, 10)}">${longDate(a.published)}</time><span class="dot"></span><span>${mins(a.words)} min read</span></div></article>`;

// ---------- article renderer ----------
function renderArticle(spec) {
  const need = ['slug', 'h1', 'title', 'description', 'section', 'kicker', 'published', 'standfirst', 'body', 'sources'];
  spec.sources.forEach(x => { if (!x.url || !x.publisher || !(x.title || x.note)) throw new Error('source needs url, publisher and title or note'); });
  for (const k of need) if (!spec[k] || (Array.isArray(spec[k]) && !spec[k].length)) throw new Error(`spec ${spec.slug || '?'}: missing ${k}`);
  if (!/^[a-z0-9-]+$/.test(spec.slug)) throw new Error('slug must be lowercase letters, digits and hyphens');
  const url = `${SITE}/articles/${spec.slug}/`;
  const body = Array.isArray(spec.body) ? spec.body.join('\n\n') : spec.body;
  const words = wordsOf(body) + wordsOf(spec.standfirst) + (spec.takeaways || []).reduce((n, t) => n + wordsOf(t), 0);
  const modified = spec.updated || spec.published;
  const desk = deskOf(spec.section);
  const image = spec.image ? `${SITE}${spec.image}` : `${SITE}/images/agn-og.jpg`;
  const faq = spec.faq || [];
  const graph = [ORG, WEBSITE, EDITOR, {
    '@type': 'NewsArticle', '@id': `${url}#article`, headline: spec.h1.slice(0, 110), description: spec.description, url, mainEntityOfPage: url,
    datePublished: spec.published, dateModified: modified, articleSection: spec.section, inLanguage: 'en-US', wordCount: words, isAccessibleForFree: true,
    image: [image], publisher: { '@id': `${SITE}/#org` }, author: STAFF, editor: { '@id': EDITOR['@id'] },
    keywords: spec.keywords || '', citation: spec.sources.map(s => s.url),
    ...(spec.type === 'explainer' ? { genre: 'Explainer' } : {}),
  }, {
    '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Front Page', item: `${SITE}/` },
      { '@type': 'ListItem', position: 2, name: spec.section, item: `${SITE}${desk}` },
      { '@type': 'ListItem', position: 3, name: spec.h1, item: url }],
  }];
  if (faq.length) graph.push({ '@type': 'FAQPage', mainEntity: faq.map(q => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: strip(q.a) } })) });

  const latest = registry().filter(a => a.slug !== spec.slug).slice(0, 5);
  const share = encodeURIComponent(url);
  const update = spec.updateNote ? `<p class="art-update"><strong>Update, ${esc(spec.updateNote.when)}:</strong> ${spec.updateNote.text}</p>` : '';
  const main = `<div class="art-wrap">
  <article class="art">
    <nav class="crumb" aria-label="Breadcrumb"><a href="/">Front Page</a> <span>/</span> <a href="${desk}">${esc(spec.section)}</a></nav>
    <div class="art-hero">
      <span class="kicker">${esc(spec.kicker)}</span>
      <h1>${esc(spec.h1)}</h1>
      <p class="art-standfirst">${spec.standfirst}</p>
    </div>
    <div class="art-byline">
      <span class="byline-av" aria-hidden="true">AGN</span>
      <span class="byline-txt"><strong><a href="/authors/staff/">Action Global News Staff</a></strong>
      <span>Edited by <a href="/authors/zach-wennstedt/">Zach Wennstedt</a> &middot; Published <time datetime="${spec.published}">${longDate(spec.published)}</time>${modified !== spec.published ? ` &middot; Updated <time datetime="${modified}">${longDate(modified)}</time>` : ''} &middot; ${mins(words)} min read</span></span>
    </div>
    <div class="sharebar" aria-label="Share this article"><button type="button" data-copy>Copy link</button><a href="https://www.linkedin.com/sharing/share-offsite/?url=${share}" target="_blank" rel="noopener nofollow">LinkedIn</a><a href="https://x.com/intent/post?url=${share}" target="_blank" rel="noopener nofollow">X</a><a href="mailto:?subject=${encodeURIComponent(spec.h1)}&amp;body=${share}">Email</a></div>
    ${update}
    ${spec.takeaways?.length ? `<section class="takeaways" aria-label="Key takeaways"><h2>Key takeaways</h2><ul>${spec.takeaways.map(t => `<li>${t}</li>`).join('')}</ul></section>` : ''}

${body}

    <section class="sources"><h2>Sources</h2><ol>${spec.sources.map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.publisher)}, ${s.title ? `&ldquo;${esc(s.title)},&rdquo;` : esc(s.note) + ","} ${esc(s.date)}</a></li>`).join('')}</ol>
    <p class="srcnote">Written by Action Global News from the sources above; quotations are attributed to the outlet that published them. See our <a href="/editorial-standards/">editorial standards</a> and <a href="/corrections/">corrections policy</a>.</p></section>
    ${faq.length ? `<section class="faq-block"><h2>Frequently asked</h2>${faq.map(q => `<details class="faq-item"><summary>${esc(q.q)}</summary><p>${q.a}</p></details>`).join('')}</section>` : ''}
  </article>
  <aside class="rail">
    <div class="rail-sec"><h4>Latest from AGN</h4>
      ${latest.map((a, i) => `<div class="rail-item"><span class="n">${String(i + 1).padStart(2, '0')}</span><a href="${a.url}"><h5>${esc(a.h1)}</h5></a></div>`).join('')}
      <div class="rail-item"><span class="n">&rarr;</span><a href="${desk}"><h5>All ${esc(spec.section)} coverage</h5></a></div>
    </div>
    <div class="rail-sec"><h4>The AGN Dispatch</h4><p style="font-size:14px;color:var(--ink-2);line-height:1.55">One email a week with the stories operators need. <a href="/newsletter/" style="color:var(--accent);font-weight:600">Subscribe free</a></p></div>
    <div class="rail-sec"><h4>Got a story?</h4><p style="font-size:14px;color:var(--ink-2);line-height:1.55">Seeing a shift we should cover, or an error we should fix? <a href="/news-tips/" style="color:var(--accent);font-weight:600">Send the desk a tip</a></p></div>
  </aside>
</div>`;
  const extra = `<meta property="article:published_time" content="${spec.published}">\n<meta property="article:modified_time" content="${modified}">\n<meta property="article:section" content="${esc(spec.section)}">\n<meta property="article:author" content="${SITE}/authors/staff/">\n`;
  write(`articles/${spec.slug}/index.html`, page({ title: spec.title, description: spec.description, canonical: url, ogType: 'article', image, extraMeta: extra, jsonld: graph }, main));
  return spec.slug;
}

// ---------- index builders ----------
function replaceBlock(html, name, inner, insertFn) {
  const a = `<!--AGN:${name}-->`, b = `<!--/AGN:${name}-->`;
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i >= 0 && j > i) return html.slice(0, i + a.length) + '\n' + inner + '\n' + html.slice(j);
  return insertFn(html, `${a}\n${inner}\n${b}`);
}
function elementEnd(s, start, tag) {
  const re = new RegExp(`<${tag}\\b|</${tag}\\s*>`, 'gi'); re.lastIndex = start; let d = 0, m;
  while ((m = re.exec(s))) { if (m[0][1] === '/') { d--; if (!d) return m.index + m[0].length; } else d++; }
  return -1;
}

function buildHome(list) {
  let h = read('index.html');
  const today = list[0].published.slice(0, 10);
  const briefs = list.filter(a => !a.network).slice(4, 13);
  const inner = `  <section class="sec" id="todays-briefs"><div class="sec-head"><h2>Latest reporting</h2><a class="more" href="/latest/">All stories</a></div><p class="srcnote" style="margin:0 0 14px">Updated ${longDate(list[0].published)}. Every story is written by Action Global News and lists its sources.</p><div class="grid-3">${briefs.map(a => card(a)).join('')}</div></section>`;
  h = replaceBlock(h, 'BRIEFS', inner, (s, blk) => {
    const lg = s.indexOf('<div class="lead-grid">');
    if (lg < 0) throw new Error('home: lead-grid not found');
    const end = elementEnd(s, lg, 'div');
    return s.slice(0, end) + '\n' + blk + '\n' + s.slice(end);
  });
  // lead story: newest explainer from the newest publishing day, else the newest story
  const day = list[0].published.slice(0, 10);
  const lead = list.find(a => a.published.slice(0, 10) === day && /Explainer|Analysis/i.test(a.kicker) && !a.network) || list.find(a => !a.network);
  const side = list.filter(a => a !== lead && !a.network).slice(0, 4);
  const art = read(`articles/${lead.slug}/index.html`);
  const svg = (art.match(/<figure class=["']chart["']>[\s\S]*?(<svg[\s\S]*?<\/svg>)/) || [])[1];
  const thumb = svg ? `<div class="thumb">${svg.replace('<svg ', '<svg style="width:100%;display:block;background:#f3f5f8;padding:22px 18px 8px;box-sizing:border-box" ')}</div>` : '';
  const leadHtml = `<div class="lead-grid">
    <article class="card card-lead"><a href="${lead.url}">${thumb}<span class="kicker">${esc(lead.kicker)}</span><h2 class="lead-h">${esc(lead.h1)}</h2><p>${esc(lead.description)}</p></a>
      <div class="meta"><span>${esc(lead.section)}</span><span class="dot"></span><time datetime="${lead.published.slice(0, 10)}">${longDate(lead.published)}</time><span class="dot"></span><span>${mins(lead.words)} min read</span></div></article>
    <div class="side-stack">${side.slice(0, 3).map(a => `<article class="card card-med"><a href="${a.url}"><span class="kicker blue">${esc(a.kicker)}</span><h3>${esc(a.h1)}</h3><p>${esc(a.description)}</p></a></article>`).join('')}${side[3] ? `<article class="card card-sm"><a href="${side[3].url}"><span class="kicker slate">${esc(side[3].kicker)}</span><h3>${esc(side[3].h1)}</h3></a></article>` : ''}</div>
  </div>`;
  const lg = h.indexOf('<div class="lead-grid">');
  h = h.slice(0, lg) + leadHtml + h.slice(elementEnd(h, lg, 'div'));
  // the briefs block should not repeat the lead and side stories
  const shown = new Set([lead.url, ...side.map(a => a.url)]);
  const rest = list.filter(a => !a.network && !shown.has(a.url)).slice(0, 9);
  h = replaceBlock(h, 'BRIEFS', `  <section class="sec" id="todays-briefs"><div class="sec-head"><h2>Latest reporting</h2><a class="more" href="/latest/">All stories</a></div><p class="srcnote" style="margin:0 0 14px">Updated ${longDate(list[0].published)}. Every story is written by Action Global News and lists its sources.</p><div class="grid-3">${rest.map(a => card(a)).join('')}</div></section>`, s => s);
  write('index.html', h);
  return today;
}

function buildDesks(list) {
  const byDesk = {};
  for (const a of list) (byDesk[deskOf(a.section)] ||= []).push(a);
  for (const [desk, items] of Object.entries(byDesk)) {
    const f = desk.slice(1) + 'index.html';
    if (desk === '/latest/' || !fs.existsSync(P(f))) continue;
    let h = read(f);
    const inner = `<div class="wrap"><section class="sec" style="margin-top:22px"><div class="sec-head"><h2>Latest from this desk</h2><a class="more" href="/latest/">All stories</a></div><div class="grid-3">${items.slice(0, 6).map(a => card(a)).join('')}</div></section></div>`;
    h = replaceBlock(h, 'DESK', inner, (s, blk) => {
      // drop the old hand-made "Latest from this desk" block, then insert after the desk header wrap
      const old = s.indexOf('<section class="sec" style="margin-top:22px"><div class="sec-head"><h2>Latest from this desk</h2>');
      if (old >= 0) { const e = elementEnd(s, old, 'section'); s = s.slice(0, old) + s.slice(e); }
      const dh = s.indexOf('<div class="deskhead">');
      if (dh < 0) throw new Error(`${f}: deskhead not found`);
      const wrap = s.lastIndexOf('<div class="wrap">', dh);
      const end = elementEnd(s, wrap, 'div');
      return s.slice(0, end) + '\n' + blk + '\n' + s.slice(end);
    });
    write(f, h);
  }
}

function buildLatest(list) {
  const url = `${SITE}/latest/`;
  const groups = {};
  for (const a of list) (groups[a.published.slice(0, 10)] ||= []).push(a);
  const days = Object.keys(groups).sort().reverse();
  const main = `<div class="wrap">
  <div class="deskhead"><nav class="crumb" aria-label="Breadcrumb"><a href="/">Front Page</a> <span>/</span> <span aria-current="page">Latest</span></nav>
    <span class="kicker">Latest</span>
    <h1>Latest reporting</h1>
    <p class="dek">Every Action Global News brief and explainer, newest first. Each story is written by our newsroom and ends with a list of the sources it relied on.</p>
  </div>
</div>
<div class="wrap">
${days.map(d => `  <section class="sec"><div class="sec-head"><h2>${longDate(d)}</h2></div><div class="grid-3">${groups[d].map(a => card(a)).join('')}</div></section>`).join('\n')}
</div>`;
  const graph = [ORG, WEBSITE, { '@type': 'CollectionPage', '@id': `${url}#page`, url, name: 'Latest reporting', isPartOf: { '@id': `${SITE}/#website` },
    mainEntity: { '@type': 'ItemList', itemListElement: list.slice(0, 30).map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + a.url, name: a.h1 })) } }];
  write('latest/index.html', page({ title: 'Latest News and Briefs | Action Global News', description: 'The newest reporting from Action Global News: daily news briefs and explainers on business, AI, technology, markets, small business, world and Colorado.', canonical: url, jsonld: graph }, main));
}

function buildAuthors(list) {
  const zurl = `${SITE}/authors/zach-wennstedt/`;
  const zmain = `<div class="wrap">
  <div class="deskhead"><nav class="crumb" aria-label="Breadcrumb"><a href="/">Front Page</a> <span>/</span> <a href="/about/">About</a> <span>/</span> <span aria-current="page">Zach Wennstedt</span></nav>
    <span class="kicker">Publisher &amp; Editor</span>
    <h1>Zach Wennstedt</h1>
    <p class="dek">Publisher and editor of Action Global News, based in Denver, Colorado.</p>
  </div>
  <div class="deskintro"><div>
    <p>Zach Wennstedt owns and edits Action Global News. He is responsible for what the site publishes: the choice of stories, the sources they rely on, the labels on commercial content and the corrections when something is wrong.</p>
    <p>He also owns Eye To Ad Media, a Denver marketing and web firm, and other businesses listed on our <a href="/disclosure/">disclosures page</a>. When Action Global News writes about a company connected to him, the article says so at the top and is labeled &ldquo;From our network.&rdquo;</p>
    <h3>How stories reach the site</h3>
    <p>Articles under the <a href="/authors/staff/">Action Global News Staff</a> byline are researched and drafted by the newsroom with the help of AI tools, as our <a href="/ethics-ai-policy/">ethics and AI policy</a> describes, and are edited and approved for publication by Zach. Every factual claim is tied to a linked source listed at the end of the story.</p>
    <h3>Contact</h3>
    <p>Corrections and complaints go through the <a href="/corrections/">corrections page</a>. Story tips go to <a href="/news-tips/">news tips</a>. Anything else: see <a href="/contact/">contact</a>.</p>
  </div><div class="deskside"><h4>Role</h4><ul><li>Publisher</li><li>Editor</li></ul><h4>Based in</h4><ul><li>Denver, Colorado</li></ul></div></div>
</div>
<div class="wrap"><section class="sec"><div class="sec-head"><h2>Recently edited</h2><a class="more" href="/latest/">All stories</a></div><div class="grid-3">${list.slice(0, 12).map(a => card(a)).join('')}</div></section></div>`;
  write('authors/zach-wennstedt/index.html', page({ title: 'Zach Wennstedt, Publisher and Editor | Action Global News', description: 'Zach Wennstedt is the publisher and editor of Action Global News in Denver, Colorado. His role, how stories are edited and how to reach him.', canonical: zurl, ogType: 'profile',
    jsonld: [ORG, WEBSITE, { ...EDITOR, description: 'Publisher and editor of Action Global News; owner of Eye To Ad Media, Denver.' }, { '@type': 'ProfilePage', '@id': `${zurl}#page`, url: zurl, mainEntity: { '@id': EDITOR['@id'] }, isPartOf: { '@id': `${SITE}/#website` } }] }, zmain));

  const surl = `${SITE}/authors/staff/`;
  const smain = `<div class="wrap">
  <div class="deskhead"><nav class="crumb" aria-label="Breadcrumb"><a href="/">Front Page</a> <span>/</span> <a href="/about/">About</a> <span>/</span> <span aria-current="page">Action Global News Staff</span></nav>
    <span class="kicker">Byline</span>
    <h1>Action Global News Staff</h1>
    <p class="dek">What the staff byline means, who stands behind it, and how a story is checked before it goes up.</p>
  </div>
  <div class="deskintro"><div>
    <p>&ldquo;Action Global News Staff&rdquo; is the byline on stories produced by our newsroom rather than by a single named writer. We do not invent reporter names or personas. The newsroom uses AI tools for research assistance and drafting, and every story is edited and approved by our publisher and editor, <a href="/authors/zach-wennstedt/">Zach Wennstedt</a>.</p>
    <h3>The checks every story goes through</h3>
    <ul>
      <li>Each factual claim is tied to a primary document or a named, reputable news organization, linked in the text and listed under Sources.</li>
      <li>Quotations come only from published statements or on-the-record reporting, and say who published them. We never generate quotes.</li>
      <li>Numbers are copied from the organization that published them; when sources disagree, we report the range or say so.</li>
      <li>Stories carry a publication date and, when they change, an update note.</li>
    </ul>
    <p>Errors are fixed under our <a href="/corrections/">corrections policy</a>. Our broader rules are in the <a href="/editorial-standards/">editorial standards</a>.</p>
  </div><div class="deskside"><h4>Edited by</h4><ul><li><a href="/authors/zach-wennstedt/">Zach Wennstedt</a></li></ul><h4>Policies</h4><ul><li><a href="/ethics-ai-policy/">Ethics &amp; AI</a></li><li><a href="/corrections/">Corrections</a></li></ul></div></div>
</div>
<div class="wrap"><section class="sec"><div class="sec-head"><h2>Recent stories</h2><a class="more" href="/latest/">All stories</a></div><div class="grid-3">${list.slice(0, 12).map(a => card(a)).join('')}</div></section></div>`;
  write('authors/staff/index.html', page({ title: 'Action Global News Staff | Action Global News', description: 'What the Action Global News Staff byline means, who edits it, and the checks every story goes through before publication.', canonical: surl,
    jsonld: [ORG, WEBSITE, EDITOR, { '@type': 'AboutPage', '@id': `${surl}#page`, url: surl, name: 'Action Global News Staff', isPartOf: { '@id': `${SITE}/#website` } }] }, smain));
}

function buildSitemaps(list) {
  const sm = read('sitemap.xml');
  const urls = [...sm.matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?(?:<priority>([^<]*)<\/priority>)?<\/url>/g)].map(m => ({ loc: m[1], lastmod: m[2], pri: m[3] }));
  const map = new Map(urls.filter(u => !/\/(live|video)\/$/.test(u.loc) && !/\/articles\//.test(u.loc)).map(u => [u.loc, u]));
  const top = list[0].modified.slice(0, 10);
  for (const loc of [`${SITE}/`, `${SITE}/latest/`]) map.set(loc, { loc, lastmod: top, pri: loc.endsWith('.com/') ? '1.0' : '0.9' });
  for (const loc of [`${SITE}/authors/zach-wennstedt/`, `${SITE}/authors/staff/`]) map.set(loc, { loc, lastmod: top, pri: '0.5' });
  for (const d of new Set(list.map(a => deskOf(a.section)))) { const loc = SITE + d; if (map.has(loc)) map.get(loc).lastmod = list.find(a => deskOf(a.section) === d).modified.slice(0, 10); }
  const arts = list.map(a => ({ loc: SITE + a.url, lastmod: a.modified.slice(0, 10), pri: '0.8' }));
  const all = [map.get(`${SITE}/`), ...arts, ...[...map.values()].filter(u => u.loc !== `${SITE}/`)];
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${all.map(u => `<url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}${u.pri ? `<priority>${u.pri}</priority>` : ''}</url>`).join('')}</urlset>\n`);

  const newest = new Date(list[0].published).getTime();
  let recent = list.filter(a => newest - new Date(a.published).getTime() <= 2 * 86400000);
  if (recent.length < 5) recent = list.slice(0, 10);
  write('news-sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${recent.map(a => `<url><loc>${SITE}${a.url}</loc><news:news><news:publication><news:name>Action Global News</news:name><news:language>en</news:language></news:publication><news:publication_date>${a.published}</news:publication_date><news:title>${esc(a.h1)}</news:title></news:news></url>`).join('')}</urlset>\n`);
}

function buildFeeds(list) {
  const items = list.slice(0, 40);
  write('feed.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>Action Global News</title><link>${SITE}/</link><atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/><description>Independent news on AI, business, markets, small business and global ecommerce.</description><language>en-us</language><lastBuildDate>${rfc822(list[0].published)}</lastBuildDate>${items.map(a => `<item><title>${esc(a.h1)}</title><link>${SITE}${a.url}</link><guid isPermaLink="true">${SITE}${a.url}</guid><pubDate>${rfc822(a.published)}</pubDate><category>${esc(a.section)}</category><description>${esc(a.standfirst || a.description)}</description></item>`).join('')}</channel></rss>\n`);
  write('feed.json', JSON.stringify({ version: 'https://jsonfeed.org/version/1.1', title: 'Action Global News', home_page_url: `${SITE}/`, feed_url: `${SITE}/feed.json`, language: 'en-US',
    items: items.map(a => ({ id: SITE + a.url, url: SITE + a.url, title: a.h1, summary: a.standfirst || a.description, date_published: a.published, date_modified: a.modified, tags: [a.section] })) }, null, 1) + '\n');
}

function buildSearch(list) {
  const f = 'data/search-index.json';
  const old = JSON.parse(read(f)).filter(x => !x.u.startsWith('/articles/') && !/^\/(live|video)\/$/.test(x.u));
  const arts = list.map(a => ({ t: a.h1, u: a.url, d: a.standfirst || a.description, s: a.section, k: a.keywords }));
  if (!old.some(x => x.u === '/authors/zach-wennstedt/')) old.push({ t: 'Zach Wennstedt, Publisher and Editor', u: '/authors/zach-wennstedt/', d: 'Who edits Action Global News and how stories are approved.', s: 'The Paper', k: 'editor, publisher, masthead' });
  write(f, JSON.stringify([...arts, ...old]));
}

function buildLlms(list) {
  let s = read('llms.txt');
  s = s.replace(/^- \[(Video desk|Live news streams)\]\([^)]*\)\r?\n/gm, '');
  s = s.replace('live headline modules link to original publishers.', 'every story lists its sources.');
  const block = list.map(a => `- [${a.h1}](${SITE}${a.url}): ${a.standfirst || a.description}`).join('\n');
  s = s.replace(/## Articles\r?\n[\s\S]*?(?=\r?\n## )/, `## Articles\n${block}\n`);
  write('llms.txt', s);
}

function index() {
  const list = registry();
  buildHome(list); buildDesks(list); buildLatest(list); buildAuthors(list);
  buildSitemaps(list); buildFeeds(list); buildSearch(list); buildLlms(list);
  console.log(`indexed ${list.length} articles; newest ${list[0].slug} (${list[0].published})`);
}

// ---------- checks ----------
function check() {
  let bad = 0;
  const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.name.startsWith('.') || e.name.startsWith('_') ? [] : e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []);
  for (const f of walk(ROOT)) {
    const s = fs.readFileSync(f, 'utf8'); const rel = path.relative(ROOT, f).split(path.sep).join('/');
    for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { bad++; console.log('JSON-LD', rel, e.message); } }
    for (const m of s.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
      const u = decodeURIComponent(m[1]); const t = P(u);
      const ok = fs.existsSync(t) && (fs.statSync(t).isFile() || fs.existsSync(path.join(t, 'index.html'))) || fs.existsSync(t + '.html');
      if (!ok) { bad++; console.log('LINK', rel, u); }
    }
    if (/data-feed=|data-yt-|data-tv=|class="adslot"/.test(s)) { bad++; console.log('THIRD-PARTY MODULE', rel); }
  }
  for (const req of ['about/index.html', 'contact/index.html', 'privacy/index.html', 'terms/index.html', 'editorial-standards/index.html', 'corrections/index.html', 'authors/zach-wennstedt/index.html', 'ads.txt', 'robots.txt', 'sitemap.xml'])
    if (!fs.existsSync(P(req))) { bad++; console.log('MISSING', req); }
  if (!/pub-3561679124556057/.test(read('ads.txt'))) { bad++; console.log('ads.txt publisher mismatch'); }
  console.log(bad ? `${bad} problem(s)` : 'check passed'); process.exitCode = bad ? 1 : 0;
}

// ---------- CLI ----------
const [cmd, arg] = process.argv.slice(2);
const loadSpec = f => JSON.parse(fs.readFileSync(path.resolve(f), 'utf8'));
if (cmd === 'new') { console.log('rendered', renderArticle(loadSpec(arg))); }
else if (cmd === 'index') index();
else if (cmd === 'all') { for (const f of fs.readdirSync(SPECS).filter(f => f.endsWith('.json'))) renderArticle(loadSpec(path.join(SPECS, f))); index(); }
else if (cmd === 'check') check();
else console.log('usage: node _tools/agn.mjs new <spec.json> | index | all | check');
