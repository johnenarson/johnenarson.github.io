// Refresh the "Latest on Substack" cards from data/substack.json (kept current by a daily GitHub Action).
(function () {
  var box = document.querySelector('[data-latest]');
  if (!box || !window.fetch) return;
  fetch('data/substack.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.posts || !d.posts.length) return;
    var esc = function (s) { var e = document.createElement('div'); e.textContent = s || ''; return e.innerHTML; };
    box.innerHTML = d.posts.slice(0, 3).map(function (p, i) {
      var dt = new Date(p.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      var img = esc(p.image);
      if (i === 0) {
        return '<a class="post is-lead" href="' + encodeURI(p.url) + '" target="_blank" rel="noopener">' +
          '<span class="post-blur" aria-hidden="true" style="background-image:url(\'' + img + '\')"></span>' +
          '<div class="post-img"><img src="' + img + '" alt="" loading="lazy"></div>' +
          '<div class="post-txt"><span class="post-date">Latest on Substack · ' + dt + '</span><b>' + esc(p.title) + '</b><span class="post-sub">' + esc(p.subtitle) + '</span>' +
          '<span class="post-more"><span class="post-go" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span>Read the latest</span></div></a>';
      }
      return '<a class="post" href="' + encodeURI(p.url) + '" target="_blank" rel="noopener"><div class="post-img"><img src="' + img + '" alt="" loading="lazy"></div>' +
        '<div class="post-txt"><span class="post-date">Substack · ' + dt + '</span><b>' + esc(p.title) + '</b><span class="post-sub">' + esc(p.subtitle) + '</span></div></a>';
    }).join('');
  }).catch(function () {});
})();
