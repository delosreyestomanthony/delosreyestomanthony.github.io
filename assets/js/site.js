// Progressive enhancements. Every page is fully usable without this file:
// image links open the full-size file, the collection shows every project, and email links still work.
(function () {
  document.documentElement.classList.add('js');

  // ── Mobile navigation ──
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    var closeNav = function () {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
    };
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) closeNav(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeNav(); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !e.target.closest('.site-header')) closeNav();
    });
    window.matchMedia('(min-width: 861px)').addEventListener('change', closeNav);
  }

  // ── Header divider and current section ──
  var header = document.querySelector('.site-header');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
  var ticking = false;
  var onScroll = function () {
    ticking = false;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    if (!links.length || !sections.every(Boolean)) return;
    var line = window.innerHeight * 0.35;
    var current = -1;
    sections.forEach(function (s, i) { if (s.getBoundingClientRect().top <= line) current = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections.length - 1;
    links.forEach(function (l, i) {
      if (i === current) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  };
  onScroll();
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });

  // ── Project collection filters ──
  var filterBar = document.querySelector('[data-filters]');
  var grid = document.querySelector('[data-collection]');
  var status = document.querySelector('[data-filter-status]');
  if (filterBar && grid) {
    var items = Array.prototype.slice.call(grid.querySelectorAll('[data-cat]'));
    var chips = Array.prototype.slice.call(filterBar.querySelectorAll('[data-filter]'));
    chips.forEach(function (chip) {
      var f = chip.getAttribute('data-filter');
      var n = f === 'all' ? items.length : items.filter(function (it) { return it.getAttribute('data-cat').split(' ').indexOf(f) > -1; }).length;
      var c = document.createElement('span');
      c.className = 'count';
      c.textContent = n;
      c.setAttribute('aria-hidden', 'true');
      chip.appendChild(c);
    });
    // "All" starts with the first few examples and a "Show all" button, so the page doesn't scroll forever on phones.
    var LIMIT = window.matchMedia('(max-width: 600px)').matches ? 6 : 9;
    var expanded = false;
    var showAll = document.querySelector('[data-show-all]');
    var current = 'all';
    var apply = function (f, announce) {
      var shown = 0;
      var total = 0;
      current = f;
      items.forEach(function (it) {
        var match = f === 'all' || it.getAttribute('data-cat').split(' ').indexOf(f) > -1;
        if (match) total++;
        if (match && f === 'all' && !expanded && total > LIMIT) match = false;
        var wasHidden = it.hidden;
        it.hidden = !match;
        if (match) {
          shown++;
          if (wasHidden) { it.classList.remove('is-entering'); void it.offsetWidth; it.classList.add('is-entering'); }
        }
      });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === f)); });
      if (showAll) {
        showAll.hidden = shown >= total;
        showAll.textContent = 'Show all ' + total + ' examples';
      }
      if (status && announce) {
        var label = filterBar.querySelector('[data-filter="' + f + '"]').firstChild.textContent.trim();
        status.textContent = f === 'all'
          ? 'Showing ' + shown + ' of ' + total + ' examples.'
          : 'Showing ' + shown + ' ' + label.toLowerCase() + ' examples.';
      }
    };
    filterBar.hidden = false;
    filterBar.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-filter]');
      if (chip) apply(chip.getAttribute('data-filter'), true);
    });
    if (showAll) {
      showAll.addEventListener('click', function () {
        var firstNew = items.filter(function (it) { return it.hidden; })[0];
        expanded = true;
        apply(current, true);
        // Move focus to the first newly shown example so keyboard users continue from there.
        var link = firstNew && firstNew.querySelector('a');
        if (link) link.focus({ preventScroll: false });
      });
    }
    // Service cards jump to the collection already filtered to that service
    document.addEventListener('click', function (e) {
      var a = e.target.closest('[data-show-filter]');
      if (a) apply(a.getAttribute('data-show-filter'), true);
    });
    apply('all', false);
  }

  // ── Lightbox for larger views ──
  var triggers = Array.prototype.slice.call(document.querySelectorAll('a[data-lightbox]'));
  if (triggers.length && typeof HTMLDialogElement === 'function') {
    var dlg = document.createElement('dialog');
    dlg.className = 'lightbox';
    dlg.setAttribute('aria-labelledby', 'lightbox-title');
    dlg.innerHTML =
      '<div class="lightbox-inner">' +
        '<div class="lightbox-bar"><p class="lightbox-title" id="lightbox-title"></p>' +
          '<div class="lightbox-controls">' +
            '<button class="icon-btn" type="button" data-lb="prev" aria-label="Previous image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg></button>' +
            '<button class="icon-btn" type="button" data-lb="next" aria-label="Next image"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>' +
            '<button class="icon-btn" type="button" data-lb="close" aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
          '</div></div>' +
        '<div class="lightbox-stage"><img alt=""></div>' +
        '<p class="lightbox-caption"></p>' +
      '</div>';
    document.body.appendChild(dlg);
    var img = dlg.querySelector('img');
    var title = dlg.querySelector('.lightbox-title');
    var caption = dlg.querySelector('.lightbox-caption');
    var prevBtn = dlg.querySelector('[data-lb="prev"]');
    var nextBtn = dlg.querySelector('[data-lb="next"]');
    var group = [];
    var index = 0;
    var opener = null;

    var visibleGroup = function (t) {
      var scope = t.closest('[data-gallery]') || document;
      return Array.prototype.slice.call(scope.querySelectorAll('a[data-lightbox]')).filter(function (a) { return !a.closest('[hidden]'); });
    };
    var show = function (i) {
      index = (i + group.length) % group.length;
      var a = group[index];
      var thumb = a.querySelector('img');
      img.src = a.getAttribute('href');
      img.alt = thumb ? thumb.alt : '';
      title.textContent = a.getAttribute('data-title') || '';
      caption.textContent = a.getAttribute('data-caption') || '';
      var full = document.createElement('a');
      full.href = a.getAttribute('href');
      full.textContent = 'Open original';
      full.target = '_blank';
      full.rel = 'noopener';
      caption.appendChild(full);
      prevBtn.hidden = nextBtn.hidden = group.length < 2;
    };
    triggers.forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        opener = a;
        group = visibleGroup(a);
        show(group.indexOf(a));
        dlg.showModal();
        dlg.querySelector('[data-lb="close"]').focus();
      });
    });
    dlg.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lb]');
      if (b) {
        var act = b.getAttribute('data-lb');
        if (act === 'close') dlg.close();
        if (act === 'prev') show(index - 1);
        if (act === 'next') show(index + 1);
      } else if (e.target === dlg) {
        dlg.close();
      }
    });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft' && group.length > 1) show(index - 1);
      if (e.key === 'ArrowRight' && group.length > 1) show(index + 1);
    });
    dlg.addEventListener('close', function () {
      img.removeAttribute('src');
      if (opener) opener.focus();
    });
  }

  // ── Copy email address ──
  Array.prototype.slice.call(document.querySelectorAll('[data-copy]')).forEach(function (btn) {
    var out = document.getElementById(btn.getAttribute('aria-describedby') || '') || document.querySelector('[data-copy-status]');
    btn.hidden = false;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function (ok) {
        if (out) out.textContent = ok ? 'Copied ' + text + ' to your clipboard.' : 'Copy failed. Select the address and copy it manually.';
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
      } else {
        done(fallbackCopy(text));
      }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
})();
