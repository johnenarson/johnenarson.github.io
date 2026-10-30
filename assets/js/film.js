// Film section: play the trailer silently and dimly behind the content (desktop only, respects reduced motion).
(function () {
  var bg = document.querySelector('.film-bg[data-yt]');
  if (!bg) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(max-width: 760px)').matches) return;
  var id = bg.getAttribute('data-yt');
  var started = false;

  function size() {
    var f = bg.querySelector('iframe'); if (!f) return;
    var w = bg.clientWidth, h = bg.clientHeight;
    var vw = Math.max(w, h * 16 / 9), vh = vw * 9 / 16;   // cover the section at 16:9
    f.style.width = vw + 'px'; f.style.height = vh + 'px';
  }
  function start() {
    if (started) return; started = true;
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&loop=1&playlist=' + id +
      '&controls=0&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&disablekb=1&fs=0';
    f.title = 'I Am Israel trailer (background)';
    f.setAttribute('allow', 'autoplay; encrypted-media');
    f.setAttribute('tabindex', '-1');
    f.addEventListener('load', function () { setTimeout(function () { bg.classList.add('is-on'); }, 1200); });
    bg.appendChild(f); size();
  }
  // Only load the video when the section is about to come into view.
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { start(); o.disconnect(); } }, { rootMargin: '300px' }).observe(bg);
  } else start();
  window.addEventListener('resize', size);
})();
