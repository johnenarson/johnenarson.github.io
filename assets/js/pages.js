// Forms not yet connected to a form service show an honest notice instead of failing.
document.querySelectorAll('form[data-form]').forEach(function (form) {
  form.addEventListener('submit', function (e) {
    if (form.action.indexOf('REPLACE_ME') === -1) return;
    e.preventDefault();
    var note = form.querySelector('.form-note');
    if (note) {
      note.textContent = 'This form isn’t connected yet. Please reach John through Facebook or Instagram for now.';
      note.classList.add('show');
    }
  });
});

// Media kit: copy buttons.
document.querySelectorAll('[data-copy]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var src = btn.parentElement.querySelector('[data-copy-src]');
    if (!src || !navigator.clipboard) return;
    navigator.clipboard.writeText(src.innerText.trim()).then(function () {
      var old = btn.textContent; btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = old; }, 1600);
    });
  });
});
