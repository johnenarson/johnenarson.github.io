// Subtle parallax: hero photo and title drift apart; Second Temple band background drifts.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var photo = document.querySelector('.hero-photo');
  var title = document.querySelector('.hero-title');
  var temple = document.querySelector('.temple');
  var templeBg = document.querySelector('.temple-bg');
  var K = 1; // overall strength (0–1)
  var ticking = false;

  function update() {
    ticking = false;
    var y = Math.min(window.scrollY || 0, 1200);
    if (photo) photo.style.transform = 'translate3d(0,' + (y * 0.10 * K).toFixed(1) + 'px,0)';
    if (title) title.style.transform = 'translate3d(0,' + (y * -0.06 * K).toFixed(1) + 'px,0)';
    if (temple && templeBg) {
      var top = temple.getBoundingClientRect().top;
      var shift = Math.max(-140, Math.min(140, -top * 0.18));
      templeBg.style.transform = 'translate3d(0,' + shift.toFixed(1) + 'px,0)';
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
