// Refresh the "Latest on Substack" cards from data/substack.json (kept current by a daily GitHub Action).
(function () {
  var box = document.querySelector('[data-latest]');
  if (!box || !window.fetch) return;
  fetch('data/substack.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
    if (!d || !d.posts || !d.posts.length) return;
    var esc = function (s) { var e = document.createElement('div'); e.textContent = s || ''; return e.innerHTML; };
    box.innerHTML = d.posts.slice(0, 3).map(function (p) {
      var dt = new Date(p.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return '<a class="post" href="' + encodeURI(p.url) + '"><div class="post-img"><img src="' + esc(p.image) + '" alt="" loading="lazy"></div>' +
        '<span class="post-date">Substack · ' + dt + '</span><b>' + esc(p.title) + '</b><span class="post-sub">' + esc(p.subtitle) + '</span></a>';
    }).join('');
  }).catch(function () {});
})();
