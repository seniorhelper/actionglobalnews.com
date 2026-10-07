/* Action Global News core script v2. Declarative: pages carry data-* hooks, this file does the rest. */
(function () {
  'use strict';
  var FEEDS = {"feed-ars":["https://feeds.arstechnica.com/arstechnica/index","Ars Technica","https://arstechnica.com"],"feed-verge":["https://www.theverge.com/rss/index.xml","The Verge","https://www.theverge.com"],"feed-tc":["https://techcrunch.com/feed/","TechCrunch","https://techcrunch.com"],"feed-wired":["https://www.wired.com/feed/rss","WIRED","https://www.wired.com"],"feed-ai":["https://news.google.com/rss/search?q=artificial%20intelligence%20when%3A2d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-aisearch":["https://news.google.com/rss/search?q=%22AI%20search%22%20OR%20%22AI%20Overviews%22%20OR%20%22generative%20engine%20optimization%22%20when%3A7d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-sel":["https://searchengineland.com/feed","Search Engine Land","https://searchengineland.com"],"feed-sej":["https://www.searchenginejournal.com/feed/","Search Engine Journal","https://www.searchenginejournal.com"],"feed-cnbc":["https://www.cnbc.com/id/10001147/device/rss/rss.html","CNBC","https://www.cnbc.com/business/"],"feed-markets":["https://www.cnbc.com/id/15839069/device/rss/rss.html","CNBC Markets","https://www.cnbc.com/markets/"],"feed-mw":["https://feeds.content.dowjones.io/public/rss/mw_topstories","MarketWatch","https://www.marketwatch.com"],"feed-bizwire":["https://news.google.com/rss/search?q=business%20when%3A1d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-econ":["https://news.google.com/rss/search?q=economy%20inflation%20jobs%20report%20Federal%20Reserve%20when%3A3d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-ent":["https://www.entrepreneur.com/latest.rss","Entrepreneur","https://www.entrepreneur.com"],"feed-sba":["https://news.google.com/rss/search?q=small%20business%20owners%20when%3A3d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-ecom":["https://news.google.com/rss/search?q=ecommerce%20retail%20online%20shopping%20when%3A3d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-agentic":["https://news.google.com/rss/search?q=%22agentic%20commerce%22%20OR%20%22AI%20shopping%20agent%22%20when%3A14d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-mr":["https://www.modernretail.co/feed/","Modern Retail","https://www.modernretail.co"],"feed-vr":["https://news.google.com/rss/search?q=virtual%20reality%20OR%20%22spatial%20computing%22%20OR%20%22Meta%20Quest%22%20when%3A7d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-uvr":["https://www.uploadvr.com/rss/","UploadVR","https://www.uploadvr.com"],"feed-bbc":["https://feeds.bbci.co.uk/news/world/rss.xml","BBC News","https://www.bbc.com/news/world"],"feed-ajz":["https://www.aljazeera.com/xml/rss/all.xml","Al Jazeera","https://www.aljazeera.com"],"feed-npr":["https://feeds.npr.org/1001/rss.xml","NPR","https://www.npr.org"],"feed-guard":["https://www.theguardian.com/world/rss","The Guardian","https://www.theguardian.com/world"],"feed-dw":["https://rss.dw.com/rdf/rss-en-all","DW","https://www.dw.com/en/"],"feed-health":["https://feeds.npr.org/1128/rss.xml","NPR Health","https://www.npr.org/sections/health/"],"feed-glp":["https://news.google.com/rss/search?q=GLP-1%20OR%20semaglutide%20OR%20tirzepatide%20when%3A7d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-aging":["https://news.google.com/rss/search?q=%22aging%20in%20place%22%20OR%20%22older%20adults%22%20falls%20when%3A14d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-kff":["https://kffhealthnews.org/feed/","KFF Health News","https://kffhealthnews.org"],"feed-re":["https://news.google.com/rss/search?q=housing%20market%20mortgage%20rates%20home%20prices%20when%3A3d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-cre":["https://news.google.com/rss/search?q=commercial%20real%20estate%20when%3A7d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-travel":["https://news.google.com/rss/search?q=travel%20industry%20airlines%20tourism%20when%3A3d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-trvl2":["https://news.google.com/rss/search?q=Hawaii%20OR%20Belize%20OR%20%22Costa%20Rica%22%20OR%20%22Dominican%20Republic%22%20tourism%20when%3A14d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-cosun":["https://coloradosun.com/feed/","The Colorado Sun","https://coloradosun.com"],"feed-denverite":["https://denverite.com/feed/","Denverite","https://denverite.com"],"feed-cpr":["https://www.cpr.org/feed/","Colorado Public Radio","https://www.cpr.org"],"feed-denbiz":["https://news.google.com/rss/search?q=Denver%20business%20when%3A7d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-out":["https://www.outsideonline.com/feed/","Outside","https://www.outsideonline.com"],"feed-outbiz":["https://news.google.com/rss/search?q=outdoor%20recreation%20economy%20public%20lands%20when%3A14d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-design":["https://www.dezeen.com/feed/","Dezeen","https://www.dezeen.com"],"feed-colossal":["https://www.thisiscolossal.com/feed/","Colossal","https://www.thisiscolossal.com"],"feed-explain":["https://news.google.com/rss/search?q=explainer%20what%20to%20know%20when%3A3d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-science":["https://www.sciencedaily.com/rss/top/science.xml","ScienceDaily","https://www.sciencedaily.com"],"feed-ticker":["https://news.google.com/rss/search?q=business%20technology%20when%3A1d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-wire":["https://news.google.com/rss/search?q=business%20when%3A1d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-econ-2":["https://news.google.com/rss/search?q=economy%20inflation%20interest%20rates%20when%3A2d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-inc":["https://www.inc.com/rss/","Inc.","https://www.inc.com"],"feed-fortune":["https://fortune.com/feed/","Fortune","https://fortune.com"],"feed-ecom-2":["https://news.google.com/rss/search?q=ecommerce%20online%20retail&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-retail":["https://news.google.com/rss/search?q=retail%20sales%20consumer%20spending&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-pay":["https://news.google.com/rss/search?q=payments%20cross-border%20checkout&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-supply":["https://news.google.com/rss/search?q=supply%20chain%20logistics%20shipping&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-vr-2":["https://news.google.com/rss/search?q=virtual%20reality%20headset&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-spatial":["https://news.google.com/rss/search?q=%22spatial%20computing%22%20OR%20%22mixed%20reality%22&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-gamedev":["https://news.google.com/rss/search?q=WebGL%20OR%20WebGPU%20OR%20%22game%20engine%22&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-verge2":["https://www.theverge.com/rss/index.xml","The Verge","https://www.theverge.com"],"feed-out-2":["https://news.google.com/rss/search?q=outdoor%20recreation%20hiking%20camping&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-parks":["https://news.google.com/rss/search?q=national%20park%20service&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-conserve":["https://news.google.com/rss/search?q=conservation%20public%20lands&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-co":["https://news.google.com/rss/search?q=Colorado%20outdoors%20trails&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-inc2":["https://www.inc.com/rss/","Inc.","https://www.inc.com"],"feed-ent2":["https://www.entrepreneur.com/latest.rss","Entrepreneur","https://www.entrepreneur.com"],"feed-sb":["https://news.google.com/rss/search?q=small%20business%20owners&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-mit":["https://www.technologyreview.com/feed/","MIT Technology Review","https://www.technologyreview.com"],"feed-ai-2":["https://news.google.com/rss/search?q=artificial%20intelligence%20search&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-zd":["https://www.zdnet.com/news/rss.xml","ZDNet","https://www.zdnet.com"],"feed-dev":["https://news.google.com/rss/search?q=web%20development%20OR%20WebGL%20OR%20browser%20engine&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-npr-2":["https://feeds.npr.org/1004/rss.xml","NPR","https://www.npr.org"],"feed-gw":["https://news.google.com/rss/search?q=world%20news%20when%3A1d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-eu":["https://news.google.com/rss/search?q=Europe%20when%3A1d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-asia":["https://news.google.com/rss/search?q=Asia%20Pacific%20when%3A1d&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-art":["https://news.google.com/rss/search?q=art%20exhibition%20museum&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-design-2":["https://news.google.com/rss/search?q=graphic%20design%20OR%20%22brand%20identity%22%20OR%20typography&hl=en-US&gl=US&ceid=US:en","Google News","https://news.google.com"],"feed-hyper":["https://hyperallergic.com/feed/","Hyperallergic","https://hyperallergic.com"]};
  var CHN = {"abc":["ABC News","UCBi2mrWuNuyYy4gbM6fU18Q"],"nbc":["NBC News","UCeY0bbntWzzVIaj2z3QigXg"],"cbs":["CBS News","UC8p1vwvWtl6T73JiExfWs1g"],"sky":["Sky News","UCoMdktPbSTixAyNGwb-UYkQ"],"dw":["DW News","UCknLrEdhRCp1aegoMqRaCZg"],"ajz":["Al Jazeera English","UCNye-wNBqNL5ZzHSJj3l8Bg"],"f24":["FRANCE 24 English","UCQfwfsi5VrQ8yKZ-UWmAEFg"],"bbg":["Bloomberg Television","UCIALMKvObZNtJ6AmdCLP7Lg"],"cnbc":["CNBC Television","UCrp_UI8XtuYfpiqluWLD7Lw"],"cnbcx":["CNBC","UCvJJ_dzjViJCoLf5uKUTwoA"],"yf":["Yahoo Finance","UCEAZeUIeJs0IjQiqTCdVSIg"],"wsj":["The Wall Street Journal","UCK7tptUDHh-RYDsdxO1-5QQ"],"pbs":["PBS NewsHour","UC6ZFN9Tx6xh-skXCuRHCDpQ"],"ap":["Associated Press","UC52X5wxOL_s5yw0dQk7NtgA"],"reu":["Reuters","UChqUTb7kYRX8-EiaN3XFrSQ"],"verge":["The Verge","UCddiUEpeqJcYeBxX1IVBKvQ"],"tc":["TechCrunch","UCCjyq_K1Xwfg8Lndy7lKMpA"],"tmp":["Two Minute Papers","UCbfYPyITQ-7l4upoX8nvctg"],"gsc":["Google Search Central","UCWf2ZlNsCGDS89VBF_awNvA"],"nasa":["NASA","UCLA_DiR1FfKNvjuUpBHmylQ"],"natgeo":["National Geographic","UCpVm7bg6pXKo1Pr6k5kxG9A"],"vox":["Vox","UCLXo7UDZvByw2ixzpQCufnA"]};
  var CACHE_MIN = 25, CACHE_PREFIX = 'agn_feed_v4_';
  var d = document;

  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function escapeHTML(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function onIdle(fn) { (window.requestIdleCallback || function (f) { return setTimeout(f, 1200); })(fn); }
  function whenNear(el, fn, margin) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { rootMargin: margin || '300px 0px' });
    io.observe(el);
  }

  /* ---------- 1. data snapshots refreshed by the site's scheduled job ---------- */
  var snap = {};
  function getJSON(url) {
    if (snap[url]) return snap[url];
    snap[url] = fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).catch(function () { return null; });
    return snap[url];
  }

  /* ---------- 2. RSS engine: snapshot first, then three public transports ---------- */
  var TRANSPORTS = [
    { url: function (f) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(f); }, parse: parseXML },
    { url: function (f) { return 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(f); },
      parse: function (txt) {
        var j = JSON.parse(txt);
        if (!j || j.status !== 'ok' || !j.items) throw new Error('bad');
        return j.items.map(function (i) { return { title: i.title, link: i.link, date: i.pubDate }; });
      } },
    { url: function (f) { return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(f); }, parse: parseXML }
  ];
  function parseXML(txt) {
    var doc = new DOMParser().parseFromString(txt, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('xml');
    var nodes = doc.querySelectorAll('item');
    if (!nodes.length) nodes = doc.querySelectorAll('entry');
    if (!nodes.length) throw new Error('empty');
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i], l = n.querySelector('link');
      var link = l ? (l.getAttribute('href') || l.textContent) : '';
      var de = n.querySelector('pubDate') || n.querySelector('updated') || n.querySelector('published') || n.querySelector('date');
      var t = n.querySelector('title');
      out.push({ title: t ? t.textContent.trim() : '', link: (link || '').trim(), date: de ? de.textContent : '' });
    }
    return out;
  }
  function cacheGet(k) {
    try { var o = JSON.parse(localStorage.getItem(CACHE_PREFIX + k)); if (o && Date.now() - o.t < CACHE_MIN * 60000) return o.d; } catch (e) {}
    return null;
  }
  function cacheSet(k, v) { try { localStorage.setItem(CACHE_PREFIX + k, JSON.stringify({ t: Date.now(), d: v })); } catch (e) {} }

  function fetchFeed(key, cb) {
    var cfg = FEEDS[key];
    if (!cfg) { cb(new Error('unknown feed')); return; }
    var c = cacheGet(key);
    if (c) { cb(null, c); return; }
    getJSON('/data/feeds.json').then(function (s) {
      var hit = s && s.feeds && s.feeds[key];
      var fresh = s && s.generated && (Date.now() - new Date(s.generated).getTime() < 12 * 3600000);
      if (hit && hit.length && fresh) { cacheSet(key, hit); cb(null, hit); return; }
      var i = 0;
      (function attempt() {
        if (i >= TRANSPORTS.length) { if (hit && hit.length) { cb(null, hit); } else { cb(new Error('failed')); } return; }
        var t = TRANSPORTS[i++], ctrl = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 8000);
        fetch(t.url(cfg[0]), ctrl ? { signal: ctrl.signal } : {}).then(function (r) {
          if (!r.ok) throw new Error('HTTP'); return r.text();
        }).then(function (txt) {
          clearTimeout(timer);
          var items = t.parse(txt);
          if (!items || !items.length) throw new Error('empty');
          cacheSet(key, items); cb(null, items);
        }).catch(function () { clearTimeout(timer); attempt(); });
      })();
    });
  }
  function relTime(dt) {
    if (!dt) return '';
    var then = new Date(dt); if (isNaN(then)) return '';
    var m = Math.floor((Date.now() - then) / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    var h = Math.floor(m / 60); if (h < 24) return h + (h === 1 ? ' hr ago' : ' hrs ago');
    var dd = Math.floor(h / 24); if (dd < 7) return dd + (dd === 1 ? ' day ago' : ' days ago');
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  function renderFeed(el, items, max) {
    var html = '<ul>' + items.slice(0, max).filter(function (it) { return it.title && it.link; }).map(function (it) {
      return '<li><a href="' + escapeHTML(it.link) + '" target="_blank" rel="noopener nofollow">' + escapeHTML(it.title) +
        '<time>' + relTime(it.date) + '</time></a></li>';
    }).join('') + '</ul>';
    el.innerHTML = html;
  }
  function initFeeds() {
    $$('[data-feed]').forEach(function (el) {
      var key = el.getAttribute('data-feed'), max = +(el.getAttribute('data-max') || 6), cfg = FEEDS[key];
      el.innerHTML = '<div class="feed-loading"><div class="feed-skel"></div><div class="feed-skel"></div><div class="feed-skel"></div><div class="feed-skel"></div></div>';
      whenNear(el, function () {
        fetchFeed(key, function (err, items) {
          if (err) {
            el.innerHTML = '<p class="feed-err">Live headlines from ' + escapeHTML(cfg ? cfg[1] : 'this source') +
              ' are temporarily unavailable. <a href="' + (cfg ? cfg[2] : '#') + '" target="_blank" rel="noopener nofollow">Visit ' +
              escapeHTML(cfg ? cfg[1] : 'the source') + '</a></p>';
            return;
          }
          renderFeed(el, items, max);
        });
      });
    });
  }

  /* ---------- 3. Ticker ---------- */
  function initTicker() {
    var track = $('#ticker-run'); if (!track) return;
    var fallback = [];
    try { fallback = JSON.parse(track.getAttribute('data-fallback') || '[]'); } catch (e) {}
    function paint(list) {
      var h = list.map(function (i) {
        var ext = /^https?:/.test(i.link || '') && (i.link || '').indexOf(location.hostname) === -1;
        return '<a href="' + escapeHTML(i.link || '#') + '"' + (ext ? ' target="_blank" rel="noopener nofollow"' : '') + '>' + escapeHTML(i.title) + '</a>';
      }).join('');
      track.innerHTML = h + h;
    }
    paint(fallback);
    onIdle(function () {
      fetchFeed('feed-ticker', function (err, items) {
        if (err || !items.length) return;
        paint(fallback.slice(0, 4).concat(items.slice(0, 8)));
      });
    });
  }

  /* ---------- 4. Clock ---------- */
  function tickClock() {
    var el = $('#agn-clock'); if (!el) return;
    var n = new Date();
    el.textContent = n.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' \u00b7 ' +
      n.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  }

  /* ---------- 5. YouTube facades ---------- */
  function ytFrame(src, title) {
    var f = d.createElement('iframe');
    f.src = src; f.title = title || 'Video'; f.className = 'vf-frame';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true; f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
    return f;
  }
  function initFacades(root) {
    $$('[data-yt-live],[data-yt-list],[data-vid]', root).forEach(function (b) {
      if (b._agn) return; b._agn = 1;
      b.addEventListener('click', function () {
        var src;
        if (b.hasAttribute('data-yt-live')) src = 'https://www.youtube-nocookie.com/embed/live_stream?channel=' + b.getAttribute('data-yt-live') + '&autoplay=1';
        else if (b.hasAttribute('data-yt-list')) src = 'https://www.youtube-nocookie.com/embed/videoseries?list=' + b.getAttribute('data-yt-list') + '&autoplay=1&rel=0';
        else src = 'https://www.youtube-nocookie.com/embed/' + b.getAttribute('data-vid') + '?autoplay=1&rel=0';
        b.parentNode.replaceChild(ytFrame(src, b.getAttribute('data-title') || b.getAttribute('aria-label')), b);
      });
    });
  }
  function initVideoWalls() {
    $$('[data-vwall]').forEach(function (el) {
      var keys = (el.getAttribute('data-vwall') || '').split(','), limit = +(el.getAttribute('data-limit') || 9);
      whenNear(el, function () {
        getJSON('/data/videos.json').then(function (s) {
          var vids = [];
          if (s && s.videos) {
            keys.forEach(function (k) { (s.videos[k] || []).slice(0, 3).forEach(function (v) { v.k = k; vids.push(v); }); });
          }
          if (vids.length) {
            vids.sort(function (a, b) { return new Date(b.date || 0) - new Date(a.date || 0); });
            el.innerHTML = vids.slice(0, limit).map(function (v) {
              var ch = CHN[v.k] ? CHN[v.k][0] : '';
              return '<article class="vcard"><button class="vthumb" data-vid="' + escapeHTML(v.id) + '" aria-label="Play: ' + escapeHTML(v.title) + '">' +
                '<img loading="lazy" decoding="async" width="480" height="360" alt="" src="https://i.ytimg.com/vi/' + escapeHTML(v.id) + '/hqdefault.jpg">' +
                '<span class="vplay"><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></span></span></button>' +
                '<div class="vmeta"><h4>' + escapeHTML(v.title) + '</h4><span class="vsrc">' + escapeHTML(ch) + ' \u00b7 ' + relTime(v.date) + '</span></div></article>';
            }).join('');
          }
          /* otherwise the server-rendered channel cards stay in place */
          initFacades(el);
        });
      });
    });
    initFacades(d);
  }

  /* ---------- 6. TradingView widgets, loaded only when near the viewport ---------- */
  function initTV() {
    $$('[data-tv]').forEach(function (box) {
      var load = function () {
        var cfg = box.querySelector('script[type="application/json"]');
        var s = d.createElement('script');
        s.src = 'https://s3.tradingview.com/external-embedding/embed-widget-' + box.getAttribute('data-tv') + '.js';
        s.async = true; s.text = cfg ? cfg.textContent : '{}';
        var w = d.createElement('div'); w.className = 'tradingview-widget-container__widget';
        box.innerHTML = ''; box.classList.remove('tvlazy'); box.classList.add('tradingview-widget-container');
        box.appendChild(w); box.appendChild(s);
      };
      if (box.hasAttribute('data-tv-idle')) { window.addEventListener('load', function () { setTimeout(load, 1800); }); }
      else whenNear(box, load, '200px 0px');
    });
  }

  /* ---------- 7. Sections panel ---------- */
  function initPanel() {
    var b = $('#nav-all'), p = $('#sec-panel'); if (!b || !p) return;
    function set(open) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); p.hidden = !open; if (open) { var i = p.querySelector('a'); if (i) i.focus(); } }
    b.addEventListener('click', function () { set(p.hidden); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !p.hidden) { set(false); b.focus(); } });
    d.addEventListener('click', function (e) { if (!p.hidden && !p.contains(e.target) && !b.contains(e.target)) set(false); });
  }

  /* ---------- 8. Contact details assembled in the browser ---------- */
  function addr(el) { try { return atob(el.getAttribute('data-mu')) + '@' + atob(el.getAttribute('data-md')); } catch (e) { return ''; } }
  function initMail() {
    $$('a[data-mu]').forEach(function (a) {
      var e = addr(a); if (!e) return;
      a.href = 'mailto:' + e; if (a.hasAttribute('data-show')) a.textContent = e;
    });
  }

  /* ---------- 9. Forms: FormSubmit with a mail-client fallback ---------- */
  function initForms() {
    $$('form[data-form]').forEach(function (f) {
      f._t = Date.now();
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var to = addr(f), subj = f.getAttribute('data-subject') || 'Action Global News inquiry';
        var ok = f.querySelector('.form-ok'), bad = f.querySelector('.form-err'), btn = f.querySelector('[type=submit]');
        var hp = f.querySelector('input[name="_honey"]');
        var spam = (hp && hp.value) || (Date.now() - (f._t || 0) < 3500);
        var txt = $$('textarea,input[type=text]', f).map(function (x) { return x.value; }).join(' ');
        if ((txt.match(/https?:\/\//g) || []).length > 2 || /\[url=|<a\s/i.test(txt)) spam = true;
        if (spam) { if (ok) ok.style.display = 'block'; f.reset(); return; }
        var data = {}; var lines = [];
        $$('input,select,textarea', f).forEach(function (el) {
          if (!el.name || el.type === 'submit' || el.name === '_honey') return;
          if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) return;
          var lbl = f.querySelector('label[for="' + el.id + '"]'), k = lbl ? lbl.textContent.trim() : el.name;
          data[k] = el.value; lines.push(k + ': ' + el.value);
        });
        data._subject = subj; data._template = 'table'; data._captcha = 'false'; data._blacklist = 'casino,crypto,viagra,loan offer,seo services cheap,backlinks,porn'; data._page = location.href;
        if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Sending\u2026'; }
        fetch('https://formsubmit.co/ajax/' + to, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
          .then(function () { if (ok) ok.style.display = 'block'; if (bad) bad.style.display = 'none'; f.reset(); })
          .catch(function () {
            if (bad) { bad.innerHTML = 'The form could not send just now. <a href="mailto:' + to + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n')) + '">Send it by email instead</a> or call 1-800-481-8638.'; bad.style.display = 'block'; }
          })
          .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; } });
      });
    });
  }

  /* ---------- 10. Article: reading bar + share ---------- */
  function initArticle() {
    var art = $('article.art'); if (!art) return;
    var bar = d.createElement('div'); bar.className = 'readbar'; bar.setAttribute('aria-hidden', 'true'); d.body.appendChild(bar);
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        var r = art.getBoundingClientRect(), h = r.height - innerHeight;
        bar.style.width = Math.max(0, Math.min(100, (-r.top / (h > 0 ? h : 1)) * 100)) + '%'; tick = false;
      });
    }, { passive: true });
    $$('[data-copy]').forEach(function (b) {
      b.addEventListener('click', function () {
        var u = location.href.split('#')[0];
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { b.textContent = 'Link copied'; })
          .catch(function () { prompt('Copy this link', u); });
      });
    });
    $$('[data-share]').forEach(function (b) {
      if (!navigator.share) { b.style.display = 'none'; return; }
      b.addEventListener('click', function () { navigator.share({ title: d.title, url: location.href.split('#')[0] }).catch(function () {}); });
    });
  }

  /* ---------- 11. Site search ---------- */
  function initSearch() {
    var f = $('#sform'), q = $('#sq'), out = $('#sout'), browse = $('#sbrowse'); if (!f || !q || !out) return;
    var IDX = null;
    getJSON('/data/search-index.json').then(function (j) { IDX = j || []; var p = new URLSearchParams(location.search).get('q'); if (p) { q.value = p; run(); } });
    function run() {
      if (!IDX) return;
      var term = q.value.trim().toLowerCase();
      if (!term) { out.innerHTML = ''; if (browse) browse.style.display = ''; return; }
      var words = term.split(/\s+/);
      var hits = IDX.map(function (it) {
        var hay = (it.t + ' ' + it.d + ' ' + it.s + ' ' + (it.k || '')).toLowerCase(), sc = 0;
        words.forEach(function (w) { if (it.t.toLowerCase().indexOf(w) !== -1) sc += 6; if (hay.indexOf(w) !== -1) sc += 2; });
        return { it: it, sc: sc };
      }).filter(function (x) { return x.sc > 0; }).sort(function (a, b) { return b.sc - a.sc; });
      if (browse) browse.style.display = hits.length ? 'none' : '';
      if (!hits.length) { out.innerHTML = '<p style="font-size:17px;color:var(--ink-2);padding:20px 0">Nothing matched \u201c' + escapeHTML(q.value) + '\u201d. Try a broader term, or browse the sections below.</p>'; return; }
      out.innerHTML = '<p style="font-size:13px;color:var(--ink-3);padding:6px 0 4px">' + hits.length + (hits.length === 1 ? ' result' : ' results') + '</p>' +
        hits.slice(0, 40).map(function (h) {
          return '<article class="sresult"><a href="' + h.it.u + '"><h3>' + escapeHTML(h.it.t) + '</h3></a><p>' + escapeHTML(h.it.d) + '</p><span class="sp">' + escapeHTML(h.it.s) + ' \u00b7 ' + h.it.u + '</span></article>';
        }).join('');
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); run(); });
    q.addEventListener('input', run);
  }

  /* ---------- 12. Newsie ---------- */
  var KB = [{"k":["hello","hi ","hey","howdy"],"a":"Newsie here, pleased to meet you. I can point you to our coverage, explain the desks, or help you get a story in front of us. What are you after?"},{"k":["latest","today","headlines","news now","breaking"],"a":"The newest stories are on the <a href='/latest/'>latest wire</a>, with live headlines from the newsrooms we follow."},{"k":["live","stream","tv","watch news","abc","nbc","cbs","bloomberg"],"a":"Eight free 24/7 news streams are on our <a href='/live/'>Live TV page</a>. For clips by topic, try the <a href='/video/'>video desk</a>."},{"k":["video","youtube","clip"],"a":"Video from official newsroom channels is on the <a href='/video/'>video desk</a>, organized by subject."},{"k":["ai ","artificial","chatgpt","super intelligence","agent"],"a":"Start with the <a href='/ai/'>AI desk</a>. Popular right now: <a href='/articles/super-intelligence-executive-order-business/'>what the Super Intelligence order changes</a> and <a href='/articles/agentic-commerce-small-retailers/'>AI shopping agents</a>."},{"k":["seo","search","google","ranking","aio","geo","optimiz"],"a":"Our guide to <a href='/articles/ai-search-optimization-small-business/'>AI search optimization for small businesses</a> is the place to start."},{"k":["market","stock","rates","economy","inflation"],"a":"The <a href='/markets/'>Markets desk</a> has a live dashboard with indices, yields, commodities and the economic calendar."},{"k":["sba","disaster","loan","eidl"],"a":"Here is our plain-English <a href='/articles/sba-disaster-loans-small-business-guide/'>SBA disaster loan guide</a>."},{"k":["job","gallup","workers","layoff"],"a":"See <a href='/articles/gallup-tech-job-fears-2026/'>more than one in four workers fear technology will make their job obsolete</a>."},{"k":["data center","electric","power bill","energy"],"a":"Read <a href='/articles/data-center-backlash-electricity-bills/'>the data center backlash over electricity bills</a>."},{"k":["glp","weight","semaglutide","tirzepatide","protein"],"a":"Health coverage lives on the <a href='/health/'>Health desk</a>, including <a href='/articles/glp1-muscle-loss-protein-strength/'>protein and muscle on GLP-1s</a>."},{"k":["walk in","walk-in","tub","shower","elderly","senior","aging","fall"],"a":"Our guide to <a href='/articles/bathroom-remodel-for-elderly-parents/'>bathroom remodeling for elderly parents</a> covers walk-in tubs, roll-in showers and costs."},{"k":["press release","newswire","announcement","distribute"],"a":"For publishing news, see <a href='/press-release-distribution/'>press release distribution</a>, or read <a href='/articles/machine-readable-press-releases/'>how machine-readable releases work</a>."},{"k":["directory","listing","list my business"],"a":"Read about <a href='/articles/usabusinesssearch-free-business-directory/'>the free national business directory built on open data</a>."},{"k":["website","web design","cost of a website"],"a":"Compare models in <a href='/articles/subscribe-to-own-website-model/'>rent, buy or subscribe to own: the real cost of a website</a>."},{"k":["advertis","sponsor","media kit","rate","banner","promote"],"a":"Advertising options are on <a href='/advertise/'>Advertise</a> and the <a href='/media-kit/'>media kit</a>. Every paid placement is labeled."},{"k":["spotlight","feature my","profile"],"a":"A labeled <a href='/business-spotlight/'>business spotlight</a> profiles one company on its own page."},{"k":["tip","story idea","pitch","contact","email"],"a":"Send it to the desk through the <a href='/news-tips/'>news tips page</a>. Tell us what happened, when, and how we can verify it."},{"k":["correction","mistake","error","wrong"],"a":"Report it on the <a href='/news-tips/'>news tips page</a>; our policy is on the <a href='/corrections/'>corrections page</a>."},{"k":["denver","colorado","boulder","local"],"a":"Our home desk is <a href='/colorado/'>Colorado &amp; Denver</a>, with live headlines from Colorado publishers."},{"k":["travel","hawaii","belize","costa rica","tourism"],"a":"Travel and tourism coverage is on the <a href='/travel/'>Travel desk</a>."},{"k":["house","mortgage","real estate","housing"],"a":"See the <a href='/real-estate/'>Real Estate &amp; Housing desk</a>."},{"k":["vr","virtual","mall","immersive","flight"],"a":"Immersive coverage, including the <a href='/articles/world-vr-mall-launch/'>walk-in VR mall</a>, is on the <a href='/immersive/'>Immersive desk</a>."},{"k":["ecommerce","commerce","retail","shop"],"a":"Global ecommerce is a standing beat: <a href='/global-ecommerce/'>Global Ecommerce desk</a>."},{"k":["newsletter","subscribe","email me"],"a":"Get the weekly <a href='/newsletter/'>AGN Dispatch</a>."},{"k":["who are you","newsie","your name","are you ai"],"a":"I'm Newsie, the AGN reading assistant. I'm a simple navigation helper, not a reporter: I match what you type against the site and point you to the right page."},{"k":["about","who runs","owner","standards","ethics","policy"],"a":"See <a href='/about/'>About</a>, our <a href='/editorial-standards/'>editorial standards</a>, <a href='/ethics-ai-policy/'>ethics &amp; AI policy</a> and <a href='/ownership/'>ownership</a>."}];
  var NEWSIE_FALLBACK = "I didn't catch that one. Try me on the latest news, live TV, AI, markets, small business, advertising or publishing a press release. Or use <a href='/search/'>search</a>.";
  function newsieAnswer(q) {
    var s = ' ' + q.toLowerCase() + ' ', best = null, bs = 0;
    KB.forEach(function (en) { var sc = 0; en.k.forEach(function (kw) { if (s.indexOf(kw) !== -1) sc += kw.length; }); if (sc > bs) { bs = sc; best = en; } });
    return best ? best.a : NEWSIE_FALLBACK;
  }
  function initNewsie() {
    var root = $('#newsie-root'); if (!root) return;
    var panel = $('#newsie-panel'), toggle = $('#newsie-toggle'), log = $('#newsie-log'), form = $('#newsie-form'), input = $('#newsie-input'), badge = $('#newsie-badge');
    if (!panel || !toggle || !log || !form || !input) return;
    function push(who, h) { var m = d.createElement('div'); m.className = 'nw-msg nw-' + who; m.innerHTML = h; log.appendChild(m); log.scrollTop = log.scrollHeight; }
    var opened = false;
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (badge) badge.style.display = 'none';
      if (open && !opened) { opened = true; push('bot', "Newsie here. I know my way round this paper. Ask me where something is and I'll walk you to it."); }
      if (open) setTimeout(function () { input.focus(); }, 180);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var q = input.value.trim(); if (!q) return;
      push('me', escapeHTML(q)); input.value = '';
      var t = d.createElement('div'); t.className = 'nw-msg nw-bot nw-typing'; t.innerHTML = '<i></i><i></i><i></i>'; log.appendChild(t);
      setTimeout(function () { t.remove(); push('bot', newsieAnswer(q)); }, 420 + Math.random() * 300);
    });
    $$('[data-nw-chip]', root).forEach(function (b) { b.addEventListener('click', function () { input.value = b.getAttribute('data-nw-chip'); form.dispatchEvent(new Event('submit', { cancelable: true })); }); });
  }

  function boot() {
    var y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
    tickClock(); setInterval(tickClock, 30000);
    initPanel(); initMail(); initForms(); initNewsie(); initArticle(); initSearch();
    initTicker(); initFeeds(); initVideoWalls(); initTV();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
