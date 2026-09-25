/* ============================================================
   ACTION GLOBAL NEWS — core scripts
   Resilient RSS loading, ticker, clock, Newsie assistant.
   No external dependencies.
   ============================================================ */
(function () {
  'use strict';

  /* ---------------------------------------------------------
     1. RSS ENGINE
     Three independent transports, tried in order. Results are
     cached in localStorage so repeat visits and page-to-page
     navigation do not re-hit the proxies.
     --------------------------------------------------------- */

  var CACHE_MIN = 25;
  var CACHE_PREFIX = 'agn_feed_v3_';

  var TRANSPORTS = [
    {
      name: 'allorigins',
      url: function (f) {
        return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(f);
      },
      parse: function (txt) { return parseXML(txt); }
    },
    {
      name: 'rss2json',
      url: function (f) {
        return 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(f);
      },
      parse: function (txt) {
        var d = JSON.parse(txt);
        if (!d || d.status !== 'ok' || !d.items) throw new Error('bad payload');
        return d.items.map(function (i) {
          return { title: i.title, link: i.link, date: i.pubDate };
        });
      }
    },
    {
      name: 'codetabs',
      url: function (f) {
        return 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(f);
      },
      parse: function (txt) { return parseXML(txt); }
    }
  ];

  function parseXML(txt) {
    var doc = new DOMParser().parseFromString(txt, 'text/xml');
    if (doc.querySelector('parsererror')) throw new Error('xml parse error');
    var nodes = doc.querySelectorAll('item');
    if (!nodes.length) nodes = doc.querySelectorAll('entry'); // Atom
    if (!nodes.length) throw new Error('no items');
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var linkEl = n.querySelector('link');
      var link = linkEl ? (linkEl.textContent || linkEl.getAttribute('href')) : '';
      var dateEl = n.querySelector('pubDate') || n.querySelector('updated') ||
                   n.querySelector('published');
      out.push({
        title: txtOf(n.querySelector('title')),
        link: (link || '').trim(),
        date: dateEl ? dateEl.textContent : ''
      });
    }
    return out;
  }

  function txtOf(el) { return el ? (el.textContent || '').trim() : ''; }

  function cacheGet(key) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (Date.now() - o.t > CACHE_MIN * 60000) return null;
      return o.d;
    } catch (e) { return null; }
  }

  function cacheSet(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), d: data }));
    } catch (e) { /* quota or private mode — non-fatal */ }
  }

  function fetchFeed(feedUrl, cb) {
    var cached = cacheGet(feedUrl);
    if (cached) { cb(null, cached); return; }

    var idx = 0;
    function attempt() {
      if (idx >= TRANSPORTS.length) { cb(new Error('all transports failed')); return; }
      var t = TRANSPORTS[idx++];
      var ctrl = new AbortController();
      var timer = setTimeout(function () { ctrl.abort(); }, 9000);

      fetch(t.url(feedUrl), { signal: ctrl.signal })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(function (txt) {
          clearTimeout(timer);
          var items = t.parse(txt);
          if (!items || !items.length) throw new Error('empty');
          cacheSet(feedUrl, items);
          cb(null, items);
        })
        .catch(function () {
          clearTimeout(timer);
          attempt();
        });
    }
    attempt();
  }

  function relTime(d) {
    if (!d) return '';
    var then = new Date(d);
    if (isNaN(then)) return '';
    var mins = Math.floor((Date.now() - then) / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return mins + ' min ago';
    var h = Math.floor(mins / 60);
    if (h < 24) return h + (h === 1 ? ' hr ago' : ' hrs ago');
    var dd = Math.floor(h / 24);
    if (dd < 7) return dd + (dd === 1 ? ' day ago' : ' days ago');
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function renderFeed(el, items, max) {
    var ul = document.createElement('ul');
    items.slice(0, max || 6).forEach(function (it) {
      if (!it.title || !it.link) return;
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = it.link;
      a.target = '_blank';
      a.rel = 'noopener nofollow';
      a.textContent = it.title;
      var t = document.createElement('time');
      t.textContent = relTime(it.date);
      a.appendChild(t);
      li.appendChild(a);
      ul.appendChild(li);
    });
    el.innerHTML = '';
    el.appendChild(ul);
  }

  function skeleton(el) {
    el.innerHTML = '<div class="feed-loading">' +
      '<div class="feed-skel"></div><div class="feed-skel"></div>' +
      '<div class="feed-skel"></div><div class="feed-skel"></div></div>';
  }

  window.AGN = window.AGN || {};

  window.AGN.loadFeeds = function (map) {
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      var cfg = map[id];
      skeleton(el);
      fetchFeed(cfg.url, function (err, items) {
        if (err) {
          el.innerHTML = '<p class="feed-err">Live headlines from ' +
            (cfg.name || 'this source') + ' are temporarily unavailable. ' +
            '<a href="' + cfg.site + '" target="_blank" rel="noopener nofollow">' +
            'Visit ' + (cfg.name || 'source') + ' &rarr;</a></p>';
          return;
        }
        renderFeed(el, items, cfg.max);
      });
    });
  };

  /* ---------------------------------------------------------
     2. TICKER — populated from a live feed, falls back to
     static site headlines if the network is unavailable.
     --------------------------------------------------------- */

  window.AGN.buildTicker = function (feedUrl, fallback) {
    var track = document.getElementById('ticker-run');
    if (!track) return;

    function paint(list) {
      var html = list.map(function (i) {
        var href = i.link || '#';
        var ext = /^https?:/.test(href) && href.indexOf(location.hostname) === -1;
        return '<a href="' + href + '"' +
          (ext ? ' target="_blank" rel="noopener nofollow"' : '') + '>' +
          escapeHTML(i.title) + '</a>';
      }).join('');
      track.innerHTML = html + html; // duplicate for seamless loop
    }

    paint(fallback);
    fetchFeed(feedUrl, function (err, items) {
      if (err || !items.length) return;
      paint(items.slice(0, 9));
    });
  };

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------------------------------------------------
     3. CLOCK
     --------------------------------------------------------- */

  function tickClock() {
    var el = document.getElementById('agn-clock');
    if (!el) return;
    var now = new Date();
    el.textContent = now.toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    }) + ' · ' + now.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
    });
  }

  /* ---------------------------------------------------------
     4. NEWSIE — the AGN reading assistant.
     Keyword-matched over a curated knowledge base. Nothing is
     invented: every answer routes to a real page on this site.
     --------------------------------------------------------- */

  var NEWSIE_KB = [
    {
      k: ['hello', 'hi ', 'hey', 'howdy', 'good morning', 'good evening'],
      a: "Newsie here — pleased to meet you. I can point you to our coverage, " +
         "explain our sections, or help you get a story in front of our desk. " +
         "What are you after?"
    },
    {
      k: ['vr mall', 'shopping mall', 'worldvrmall', 'virtual mall', 'vr shop'],
      a: "That's our lead story this cycle — the launch of World VR Mall, a walk-in " +
         "3D shopping centre where storefronts link through to real ecommerce sites. " +
         "Read it here: <a href='/articles/world-vr-mall-launch.html'>World VR Mall launch</a>."
    },
    {
      k: ['flight', 'flying', 'flight sim', 'simulator', 'aviation', 'pilot'],
      a: "We covered the launch of a browser-based flight simulator built for " +
         "flight-school preparation. See " +
         "<a href='/articles/vr-flight-simulator-launch.html'>the launch report</a>."
    },
    {
      k: ['chatbot', 'conversational', 'ai agent', 'agentic', 'assistant', 'bot'],
      a: "Our technology desk covers conversational AI and agentic systems for " +
         "small business closely. Start with " +
         "<a href='/articles/conversational-ai-small-business.html'>Conversational AI for small business</a>, " +
         "or browse the <a href='/technology.html'>Technology section</a>."
    },
    {
      k: ['glp', 'weight', 'telehealth', 'health', 'semaglutide', 'medical'],
      a: "Health coverage lives in our business-of-healthcare reporting. See " +
         "<a href='/articles/glp1-telehealth-marketing.html'>the GLP-1 telehealth feature</a>."
    },
    {
      k: ['press release', 'pr ', 'submit release', 'distribute', 'newswire', 'wire'],
      a: "Two things there. Editorially, we've written about how the press release " +
         "format is changing for AI search — " +
         "<a href='/articles/press-release-ai-search.html'>read that here</a>. " +
         "Practically, if you want to get an announcement to our desk, use the " +
         "<a href='/news-tips.html'>news tips page</a>."
    },
    {
      k: ['advertis', 'sponsor', 'media kit', 'rate', 'banner', 'promote', 'buy ad'],
      a: "Advertising details, formats and an inquiry form are on the " +
         "<a href='/advertise.html'>Advertise page</a>. We run display, sponsored " +
         "editorial and section takeovers — all sponsored placements are labelled."
    },
    {
      k: ['tip', 'story idea', 'pitch', 'contact', 'reach', 'submit', 'email'],
      a: "Send it to the desk via the <a href='/news-tips.html'>news tips page</a>. " +
         "Tell us what happened, when, and how we can verify it."
    },
    {
      k: ['who are you', 'what are you', 'newsie', 'your name', 'about you'],
      a: "I'm Newsie — the AGN reading assistant. I'm a simple navigational helper, " +
         "not a reporter and not a live AI model. I match what you type against our " +
         "site index and point you at the right page."
    },
    {
      k: ['about', 'who runs', 'editorial', 'standards', 'policy', 'correction', 'trust'],
      a: "Our approach, sourcing rules and corrections policy are set out on the " +
         "<a href='/editorial-standards.html'>Editorial Standards page</a>, and " +
         "there's background on <a href='/about.html'>About</a>."
    },
    {
      k: ['ecommerce', 'commerce', 'retail', 'online shop', 'store'],
      a: "Global ecommerce is one of our standing beats — see the " +
         "<a href='/global-ecommerce.html'>Global Ecommerce section</a>."
    },
    {
      k: ['art', 'culture', 'design', 'creative', 'gallery'],
      a: "Arts and design coverage is at <a href='/arts.html'>the Arts desk</a>."
    },
    {
      k: ['outdoor', 'hiking', 'travel', 'trail', 'park', 'camp'],
      a: "Outdoors coverage lives at <a href='/outdoors.html'>the Outdoors desk</a>."
    },
    {
      k: ['video', 'watch', 'clip', 'youtube'],
      a: "Video briefings are collected on the <a href='/video.html'>Video desk</a>."
    },
    {
      k: ['seo', 'search', 'google', 'ranking', 'aio', 'geo', 'optimi'],
      a: "Search and AI-visibility is a core beat for us. The " +
         "<a href='/technology.html'>Technology section</a> carries most of it."
    },
    {
      k: ['rss', 'feed', 'subscribe', 'follow'],
      a: "We syndicate our own headlines and carry live feeds from external " +
         "newsrooms on each section page, always linked back to the original publisher."
    }
  ];

  var NEWSIE_FALLBACK =
    "I didn't catch that one. Try me on: the VR mall launch, our technology " +
    "coverage, advertising, or sending in a news tip. Or browse the " +
    "<a href='/'>front page</a>.";

  function newsieAnswer(q) {
    var s = ' ' + q.toLowerCase() + ' ';
    var best = null, bestScore = 0;
    NEWSIE_KB.forEach(function (entry) {
      var score = 0;
      entry.k.forEach(function (kw) { if (s.indexOf(kw) !== -1) score += kw.length; });
      if (score > bestScore) { bestScore = score; best = entry; }
    });
    return best ? best.a : NEWSIE_FALLBACK;
  }

  function initNewsie() {
    var root = document.getElementById('newsie-root');
    if (!root) return;
    var panel = document.getElementById('newsie-panel');
    var toggle = document.getElementById('newsie-toggle');
    var log = document.getElementById('newsie-log');
    var form = document.getElementById('newsie-form');
    var input = document.getElementById('newsie-input');
    var badge = document.getElementById('newsie-badge');
    if (!panel || !toggle || !log || !form || !input) return;

    function push(who, html) {
      var d = document.createElement('div');
      d.className = 'nw-msg nw-' + who;
      d.innerHTML = html;
      log.appendChild(d);
      log.scrollTop = log.scrollHeight;
    }

    var opened = false;
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (badge) badge.style.display = 'none';
      if (open && !opened) {
        opened = true;
        push('bot', "Newsie here. I know my way round this paper — ask me " +
          "where something is and I'll walk you to it.");
      }
      if (open) setTimeout(function () { input.focus(); }, 180);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) return;
      push('me', escapeHTML(q));
      input.value = '';
      var typing = document.createElement('div');
      typing.className = 'nw-msg nw-bot nw-typing';
      typing.innerHTML = '<i></i><i></i><i></i>';
      log.appendChild(typing);
      log.scrollTop = log.scrollHeight;
      setTimeout(function () {
        typing.remove();
        push('bot', newsieAnswer(q));
      }, 420 + Math.random() * 320);
    });

    Array.prototype.forEach.call(root.querySelectorAll('[data-nw-chip]'), function (b) {
      b.addEventListener('click', function () {
        input.value = b.getAttribute('data-nw-chip');
        form.dispatchEvent(new Event('submit'));
      });
    });
  }

  /* ---------------------------------------------------------
     5. Forms — client-side validation + mailto handoff so the
     page works with no backend.
     --------------------------------------------------------- */

  function initForms() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-mailto]'), function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var to = f.getAttribute('data-mailto');
        var subj = f.getAttribute('data-subject') || 'Website enquiry';
        var lines = [];
        Array.prototype.forEach.call(f.querySelectorAll('input,select,textarea'), function (el) {
          if (!el.name || el.type === 'submit') return;
          var lbl = f.querySelector('label[for="' + el.id + '"]');
          lines.push((lbl ? lbl.textContent.trim() : el.name) + ': ' + el.value);
        });
        var note = f.querySelector('.form-note');
        if (note) {
          note.textContent = 'Opening your email client…';
          note.style.display = 'block';
        }
        window.location.href = 'mailto:' + to + '?subject=' +
          encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
      });
    });
  }

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */

  function boot() {
    tickClock();
    setInterval(tickClock, 30000);
    initNewsie();
    initForms();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }

})();
