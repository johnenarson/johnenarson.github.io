// Refresh the "Latest on Substack" cards from data/substack.json (kept current by a daily GitHub Action).
(function () {
  var box = document.querySelector('[data-latest]');
  if (!box || !window.fetch) return;
  fetch('data/substack.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.posts || !d.posts.length) return;
    var esc = function (s) { var e = document.createElement('div'); e.textContent = s || ''; return e.innerHTML; };
    box.innerHTML = d.posts.slice(0, 3).map(function (p, i) {
      var dt = new Date(p.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return '<a class="post' + (i === 0 ? ' is-lead' : '') + '" href="' + encodeURI(p.url) + '" target="_blank" rel="noopener"><div class="post-img"><img src="' + esc(p.image) + '" alt="" loading="lazy"></div>' +
        '<div class="post-txt"><span class="post-date">Substack · ' + dt + '</span><b>' + esc(p.title) + '</b><span class="post-sub">' + esc(p.subtitle) + '</span>' +
        (i === 0 ? '<span class="post-more">Read on Substack →</span>' : '') + '</div></a>';
    }).join('');
  }).catch(function () {});
})();
