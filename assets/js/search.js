/* 站内全文搜索：加载 search.json，实时匹配标题/标签/分类/摘要 */
(function () {
  'use strict';

  var input = document.getElementById('searchInput');
  var resultsBox = document.getElementById('searchResults');
  var statusBox = document.getElementById('searchStatus');
  var btn = document.getElementById('searchBtn');
  if (!input || !resultsBox) return;

  var index = [];
  var baseurl = (document.querySelector('meta[name="baseurl"]') || {}).content || '';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function highlight(text, terms) {
    var t = escapeHtml(text);
    terms.forEach(function (term) {
      if (!term) return;
      t = t.split(term).join('<mark>' + term + '</mark>');
    });
    return t;
  }

  function search(query) {
    var terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];

    return index.map(function (post) {
      var title = (post.title || '').toLowerCase();
      var excerpt = (post.excerpt || '').toLowerCase();
      var tags = (post.tags || []).join(' ').toLowerCase();
      var cats = (post.categories || []).join(' ').toLowerCase();
      var score = 0;
      var matched = true;

      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (title.indexOf(t) !== -1) score += 10;
        else if (tags.indexOf(t) !== -1) score += 6;
        else if (cats.indexOf(t) !== -1) score += 6;
        else if (excerpt.indexOf(t) !== -1) score += 3;
        else { matched = false; break; }
      }
      return { post: post, score: matched ? score : 0 };
    })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) {
        return b.score - a.score || (b.post.date || '').localeCompare(a.post.date || '');
      })
      .slice(0, 30)
      .map(function (r) { return r.post; });
  }

  function render(results) {
    if (!results.length) {
      resultsBox.innerHTML =
        '<div class="search-empty">' +
        '<p class="prompt-symbol">$</p>' +
        '<p>grep: no matches found</p>' +
        '<p class="search-empty-hint">换个关键词试试，或浏览 <a href="' + baseurl + '/pages/tags">标签页</a>。</p>' +
        '</div>';
      resultsBox.hidden = false;
      return;
    }

    var terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    var html = results.map(function (post) {
      return '<article class="search-result terminal-card">' +
        '<h3 class="search-result-title"><a href="' + post.url + '">' + highlight(post.title, terms) + '</a></h3>' +
        '<div class="search-result-meta">' +
        '<span>' + escapeHtml(post.date) + '</span>' +
        (post.tags && post.tags.length
          ? '<span>' + post.tags.map(function (t) { return '#' + escapeHtml(t); }).join(' ') + '</span>'
          : '') +
        '</div>' +
        '<p class="search-result-excerpt">' + highlight(post.excerpt, terms) + '</p>' +
        '<a class="text-link" href="' + post.url + '">$ read more &rarr;</a>' +
        '</article>';
    }).join('');

    resultsBox.innerHTML =
      '<div class="search-count"><span class="prompt-symbol">$</span> 找到 ' + results.length + ' 条结果</div>' + html;
    resultsBox.hidden = false;
  }

  function setStatus(text) {
    if (statusBox) statusBox.innerHTML = escapeHtml(text);
  }

  function doSearch() {
    var q = input.value.trim();
    if (!q) { resultsBox.hidden = true; return; }
    setStatus('$ grep -r "' + q + '" ./posts');
    render(search(q));
  }

  function loadIndex() {
    fetch(baseurl + '/search.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        index = data;
        setStatus('$ 索引加载完成，共 ' + index.length + ' 篇文章。输入关键词开始搜索。');
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) { input.value = q; doSearch(); }
      })
      .catch(function () {
        setStatus('$ 搜索索引加载失败，请刷新页面重试。');
      });
  }

  var debounceTimer;
  input.addEventListener('input', function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(doSearch, 150);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') { e.preventDefault(); doSearch(); }
  });
  if (btn) btn.addEventListener('click', doSearch);

  loadIndex();
})();
