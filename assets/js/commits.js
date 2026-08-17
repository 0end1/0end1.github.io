/* 提交记录页：通过 GitHub API 拉取仓库最新提交，以 git log 风格展示 */
(function () {
  'use strict';

  var listEl = document.getElementById('commitList');
  var statusEl = document.getElementById('commitStatus');
  if (!listEl) return;

  // 修改仓库地址时，同时更新此处与 pages/commits.md 中的链接
  var repo = '0end1/0end1.github.io';
  var apiUrl = 'https://api.github.com/repos/' + repo + '/commits?per_page=30';

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function fmtDate(iso) {
    try {
      var d = new Date(iso);
      var pad = function (n) { return n < 10 ? '0' + n : n; };
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
        ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    } catch (e) {
      return iso || '';
    }
  }

  function render(commits) {
    var html = commits.map(function (c) {
      var sha = c.sha.slice(0, 7);
      var msg = (c.commit.message || '').split('\n')[0] || '(no message)';
      var author = c.commit.author ? c.commit.author.name : 'unknown';
      var date = c.commit.author ? c.commit.author.date : '';
      return '<div class="commit-item">' +
        '<span class="commit-sha">' +
        '<a href="https://github.com/' + repo + '/commit/' + c.sha + '" target="_blank" rel="noopener">' + sha + '</a>' +
        '</span>' +
        '<span class="commit-msg">' + escapeHtml(msg) + '</span>' +
        '<span class="commit-meta">' + escapeHtml(author) + ' · ' + escapeHtml(fmtDate(date)) + '</span>' +
        '</div>';
    }).join('');
    listEl.innerHTML = html;
  }

  fetch(apiUrl, { headers: { 'Accept': 'application/vnd.github+json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!Array.isArray(data)) {
        throw new Error((data && data.message) || 'unexpected response');
      }
      if (statusEl) {
        statusEl.innerHTML = '<span class="prompt-symbol">$</span> git log --oneline --decorate -' + data.length;
      }
      render(data);
    })
    .catch(function (err) {
      listEl.innerHTML =
        '<div class="search-empty">' +
        '<p class="prompt-symbol">$</p>' +
        '<p>git: failed to fetch commit history</p>' +
        '<p class="search-empty-hint">' + escapeHtml(err.message) + '（稍后刷新重试，或<a href="https://github.com/' + repo + '/commits/main" target="_blank" rel="noopener">前往 GitHub 查看</a>）</p>' +
        '</div>';
    });
})();
