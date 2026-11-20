// Brand Library: colour-version switch on logo cards, copy HEX, and remembered language.
(function () {
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };

  // First visit to the English home page from a Spanish browser: go to the Spanish page.
  var lang = document.documentElement.lang;
  if (document.querySelector('meta[name="root"]') && lang === 'en' && !store.get('lang')
      && /^es\b/i.test(navigator.language || '')) { location.replace('index.es.html'); return; }
  document.querySelectorAll('.lang a').forEach(function (a) {
    a.addEventListener('click', function () { store.set('lang', a.getAttribute('data-lang')); });
  });

  var DL = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>';
  document.querySelectorAll('.logo').forEach(function (card) {
    var vs = JSON.parse(card.getAttribute('data-v'));
    var stage = card.querySelector('.logo-stage'), img = stage.querySelector('img'), files = card.querySelector('.files');
    card.querySelectorAll('.ways button').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var v = vs[+btn.getAttribute('data-i')];
        img.src = v.s; stage.style.background = v.bg || '';
        files.innerHTML = '<a href="' + v.s + '" download>' + DL + 'SVG</a>' + v.p.map(function (p) {
          return '<a href="' + p + '" download>' + DL + 'PNG ' + p.match(/-(\d+)w?\.png$/)[1] + '</a>';
        }).join('');
        card.querySelectorAll('.ways button').forEach(function (b) { b.removeAttribute('aria-pressed'); });
        btn.setAttribute('aria-pressed', 'true');
      });
    });
  });

  var sw = document.querySelector('.swatches');
  if (sw) sw.addEventListener('click', function (e) {
    var b = e.target.closest('.swatch'); if (!b) return;
    var hex = b.getAttribute('data-hex'), label = b.querySelector('.sw-hex');
    (navigator.clipboard ? navigator.clipboard.writeText(hex) : Promise.reject()).then(function () {
      label.textContent = sw.getAttribute('data-copied') + ' ✓';
      setTimeout(function () { label.textContent = hex; }, 1200);
    }, function () {});
  });
})();
