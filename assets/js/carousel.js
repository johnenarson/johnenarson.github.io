// Endorsement carousel: two quotes in view, the next peeks in faded; the arrow cycles them endlessly.
(function () {
  var root = document.querySelector('[data-carousel]');
  if (!root) return;
  var viewport = root.querySelector('.q-viewport');
  var track = root.querySelector('.q-track');
  var btn = root.querySelector('.q-next');
  var busy = false;

  function perView() { return window.matchMedia('(max-width: 760px)').matches ? 1 : 2; }

  function layout() {
    var w = root.clientWidth;                         // the content column width
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var n = perView();
    var card = n === 2 ? (w - gap) / 2 : w * 0.82;
    root.style.setProperty('--cardpx', card + 'px');
    // Fade the region beyond the content column out to the screen edge.
    var vw = viewport.clientWidth;
    var off = 20; var mask = 'linear-gradient(90deg, #000 0, #000 ' + (off + w + gap * 0.3) + 'px, rgba(0,0,0,0.85) ' + (off + w + gap) + 'px, transparent ' + vw + 'px)';
    viewport.style.webkitMaskImage = mask; viewport.style.maskImage = mask;
    mark();
  }

  function mark() {
    var n = perView();
    Array.prototype.forEach.call(track.children, function (el, i) { el.classList.toggle('is-peek', i >= n); });
  }

  function next() {
    if (busy) return;
    busy = true;
    var first = track.children[0];
    var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    var step = first.getBoundingClientRect().width + gap;
    // fade the outgoing quote, bring the peeking one to full
    Array.prototype.forEach.call(track.children, function (el, i) { el.classList.toggle('is-peek', i === 0 || i > perView()); });
    track.classList.add('is-sliding');
    track.style.transform = 'translateX(' + (-step) + 'px)';
    var done = function () {
      track.removeEventListener('transitionend', onEnd);
      track.classList.remove('is-sliding');
      track.appendChild(first);
      track.style.transform = 'translateX(0)';
      mark();
      busy = false;
    };
    var onEnd = function (e) { if (e.target === track && e.propertyName === 'transform') done(); };
    track.addEventListener('transitionend', onEnd);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) done();
    else setTimeout(function () { if (busy) done(); }, 900);
  }

  btn.addEventListener('click', next);
  var sx = null;
  viewport.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  viewport.addEventListener('touchend', function (e) { if (sx !== null && sx - e.changedTouches[0].clientX > 40) next(); sx = null; });
  window.addEventListener('resize', layout);
  layout();
})();
