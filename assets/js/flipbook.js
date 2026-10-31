// Look Inside flip book: facing spreads with a 3D page turn (one page at a time on phones).
(function () {
  var root = document.querySelector('[data-flipbook]');
  if (!root) return;

  var COUNT = parseInt(root.getAttribute('data-pages'), 10) || 40;
  var BASE = root.getAttribute('data-base') || 'assets/flip/p';
  var SHOP = root.getAttribute('data-shop') || 'https://arielmedia.shop';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DUR = reduce ? 0 : 900;

  // Page list: the sample pages, then a closing card and the cover.
  var pages = [];
  for (var i = 1; i <= COUNT; i++) pages.push({ src: BASE + (i < 10 ? '0' : '') + i + '.webp', alt: 'Sample page ' + i });
  pages.push({ end: true });
  pages.push({ src: 'assets/img/cover.jpg', alt: 'Cover of Jesus and the Temple Mount', cover: true });

  var book = root.querySelector('.fb-book');
  var stage = root.querySelector('.fb-stage');
  var prevBtn = root.querySelector('.fb-prev');
  var nextBtn = root.querySelector('.fb-next');
  var fsBtn = root.querySelector('.fb-full');
  var status = root.querySelector('.fb-status');

  // Hardcover case and page-block edges behind the spread.
  var kase = document.createElement('div'); kase.className = 'fb-case'; kase.setAttribute('aria-hidden', 'true');
  kase.innerHTML = '<div class="fb-board fb-board-l"><div class="fb-art"></div><div class="fb-flap"></div></div>' +
    '<div class="fb-board fb-board-r"><div class="fb-art"></div><div class="fb-flap"></div></div>' +
    '<div class="fb-spine"></div>';
  var stackL = document.createElement('div'); stackL.className = 'fb-stack fb-stack-l'; stackL.setAttribute('aria-hidden', 'true');
  var stackR = document.createElement('div'); stackR.className = 'fb-stack fb-stack-r'; stackR.setAttribute('aria-hidden', 'true');
  book.insertBefore(stackR, stage); book.insertBefore(stackL, stackR); book.insertBefore(kase, stackL);

  // Under the counter: make clear these are hand-picked pages, not the book in order.
  if (status) {
    var info = document.createElement('div'); info.className = 'fb-info';
    status.parentNode.insertBefore(info, status); info.appendChild(status);
    var note = document.createElement('span'); note.className = 'fb-note';
    note.textContent = 'Selected spreads · Not in page order';
    info.appendChild(note);
  }

  var narrow = window.matchMedia('(max-width: 760px)');
  var single = narrow.matches;
  var pos = 0;          // spread index (two-page mode) or page index (single mode)
  var busy = false;

  function face(p) {
    var el = document.createElement('div');
    el.className = 'fb-face';
    if (!p) return el;
    if (p.end) {
      el.classList.add('fb-endcard');
      el.innerHTML = '<p class="eyebrow">There is so much more</p><h3>Preorder to see the rest.</h3>' +
        '<p>370 pages, a fold-out Field Guide, and the E-Book delivered instantly with your preorder.</p>' +
        '<a class="btn btn-gold" href="' + SHOP + '" target="_blank" rel="noopener">Preorder now</a>';
      return el;
    }
    var img = document.createElement('img');
    img.alt = p.alt; img.decoding = 'async'; img.draggable = false; img.src = p.src;
    if (p.cover) el.classList.add('fb-cover');
    el.appendChild(img);
    return el;
  }

  function spreads() { return Math.ceil(pages.length / 2); }
  function total() { return single ? pages.length : spreads(); }
  function L(s) { return pages[s * 2]; }
  function Rr(s) { return pages[s * 2 + 1]; }

  function preload(idx) {
    var list = single ? [idx + 1, idx + 2] : [idx * 2 + 2, idx * 2 + 3, idx * 2 + 4, idx * 2 + 5];
    list.forEach(function (k) { var p = pages[k]; if (p && p.src) { var im = new Image(); im.decoding = 'async'; im.src = p.src; } });
  }

  function slot(cls, p) { var d = document.createElement('div'); d.className = 'fb-page ' + cls; d.appendChild(face(p)); return d; }

  function render() {
    stage.innerHTML = '';
    book.classList.toggle('is-single', single);
    if (single) {
      stage.appendChild(slot('fb-one', pages[pos]));
    } else {
      stage.appendChild(slot('fb-left', L(pos)));
      stage.appendChild(slot('fb-right', Rr(pos)));
    }
    var prog = total() > 1 ? pos / (total() - 1) : 0;
    book.style.setProperty('--sl', (2 + 7 * prog).toFixed(1) + 'px');
    book.style.setProperty('--sr', (2 + 7 * (1 - prog)).toFixed(1) + 'px');
    prevBtn.disabled = pos === 0;
    nextBtn.disabled = pos >= total() - 1;
    if (status) status.textContent = single ? ('Sample ' + (pos + 1) + ' of ' + pages.length) : ('Sample ' + (pos + 1) + ' of ' + spreads());
    preload(pos);
  }

  function turn(dir) {
    if (busy) return;
    var to = pos + dir;
    if (to < 0 || to >= total()) return;
    if (!DUR) { pos = to; render(); return; }
    busy = true;

    if (single) {
      var cur = stage.querySelector('.fb-one');
      var nxt = slot('fb-one fb-under', pages[to]);
      stage.insertBefore(nxt, cur);
      cur.classList.add(dir > 0 ? 'fb-out-next' : 'fb-out-prev');
      setTimeout(function () { pos = to; busy = false; render(); }, DUR * 0.7);
      return;
    }

    // Two-page mode: a leaf hinged on the spine, front and back faces.
    var leaf = document.createElement('div');
    leaf.className = 'fb-leaf';
    var front = face(dir > 0 ? Rr(pos) : Rr(to));
    var back = face(dir > 0 ? L(to) : L(pos));
    front.classList.add('fb-front'); back.classList.add('fb-back');
    var shade = document.createElement('div'); shade.className = 'fb-shade';
    leaf.appendChild(front); leaf.appendChild(back); leaf.appendChild(shade);

    var left = stage.querySelector('.fb-left');
    var right = stage.querySelector('.fb-right');
    if (dir > 0) {
      right.replaceChild(face(Rr(to)), right.firstChild);   // revealed underneath
    } else {
      left.replaceChild(face(L(to)), left.firstChild);       // revealed underneath
      leaf.style.transform = 'rotateY(-180deg)';
    }
    stage.appendChild(leaf);
    leaf.getBoundingClientRect(); // commit start state
    leaf.classList.add('is-turning');
    leaf.style.transform = dir > 0 ? 'rotateY(-180deg)' : 'rotateY(0deg)';
    setTimeout(function () { pos = to; busy = false; render(); }, DUR + 30);
  }

  prevBtn.addEventListener('click', function () { turn(-1); });
  nextBtn.addEventListener('click', function () { turn(1); });
  stage.addEventListener('click', function (e) {
    if (e.target.closest('a')) return;
    var r = stage.getBoundingClientRect();
    turn(e.clientX - r.left < r.width / 2 ? -1 : 1);
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { turn(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { turn(-1); e.preventDefault(); }
  });

  // Swipe
  var sx = null, sy = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null || e.touches.length) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) turn(dx < 0 ? 1 : -1);
    sx = null;
  });
  stage.addEventListener('touchmove', function () {}, { passive: true });

  // Full screen
  if (fsBtn) {
    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fsBtn.hidden = true;
    fsBtn.addEventListener('click', function () {
      var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
      if (fsEl) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
      (root.requestFullscreen || root.webkitRequestFullscreen).call(root);
    });
  }

  // Switch between spreads and single pages when the screen size changes.
  function onMode() {
    var was = single; single = narrow.matches;
    if (was === single) return;
    pos = single ? pos * 2 : Math.floor(pos / 2);
    render();
  }
  if (narrow.addEventListener) narrow.addEventListener('change', onMode); else narrow.addListener(onMode);

  render();
})();
