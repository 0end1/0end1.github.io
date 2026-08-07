/* 全局交互：导航、阅读进度条、返回顶部、目录、代码复制、懒加载 */
(function () {
  'use strict';

  /* ---------- 移动端导航切换 ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) navLinks.classList.remove('open');
    });
  }

  /* ---------- 侧边栏搜索跳转 ---------- */
  var sidebarForm = document.getElementById('sidebarSearchForm');
  if (sidebarForm) {
    sidebarForm.addEventListener('submit', function () {
      var q = sidebarForm.querySelector('input').value.trim();
      var base = (document.querySelector('meta[name="baseurl"]') || {}).content || '';
      window.location.href = base + '/pages/search?q=' + encodeURIComponent(q);
    });
  }

  /* ---------- 阅读进度条 ---------- */
  var progress = document.getElementById('readingProgress');
  if (progress) {
    function updateProgress() {
      var doc = document.documentElement;
      var total = doc.scrollHeight - doc.clientHeight;
      var pct = total > 0 ? (doc.scrollTop / total) * 100 : 0;
      progress.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  /* ---------- 返回顶部 ---------- */
  var backBtn = document.getElementById('backToTop');
  if (backBtn) {
    window.addEventListener('scroll', function () {
      backBtn.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- 文章目录 TOC（自动生成 + 滚动高亮） ---------- */
  var tocNav = document.getElementById('tocNav');
  var tocCard = document.getElementById('tocCard');
  if (tocNav) {
    var content = document.getElementById('postContent');
    if (content) {
      var headings = content.querySelectorAll('h2, h3');
      if (headings.length) {
        var list = document.createElement('ul');
        list.className = 'toc-list';
        var tocLinks = [];
        headings.forEach(function (h, i) {
          if (!h.id) h.id = 'section-' + i;
          var level = parseInt(h.tagName[1], 10);
          var li = document.createElement('li');
          li.className = 'toc-level-' + level;
          var a = document.createElement('a');
          a.href = '#' + h.id;
          a.textContent = h.textContent;
          a.setAttribute('data-target', h.id);
          li.appendChild(a);
          list.appendChild(li);
          tocLinks.push(a);
        });
        tocNav.appendChild(list);

        function highlightToc() {
          var pos = window.scrollY + 140;
          var current = headings[0];
          headings.forEach(function (h) {
            var top = h.getBoundingClientRect().top + window.scrollY;
            if (top <= pos) current = h;
          });
          tocLinks.forEach(function (a) {
            var active = a.getAttribute('data-target') === current.id;
            a.classList.toggle('active', active);
            if (active) {
              a.setAttribute('aria-current', 'true');
            } else {
              a.removeAttribute('aria-current');
            }
          });
        }
        window.addEventListener('scroll', highlightToc, { passive: true });
        highlightToc();
      } else if (tocCard) {
        tocCard.style.display = 'none';
      }
    }
  }

  /* ---------- 代码块复制按钮 ---------- */
  document.querySelectorAll('.post-content pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.type = 'button';
    btn.textContent = '⧉ 复制';
    btn.setAttribute('aria-label', '复制代码');
    pre.appendChild(btn);

    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      function done() {
        btn.textContent = '✓ 已复制';
        setTimeout(function () { btn.textContent = '⧉ 复制'; }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
      } else {
        fallback(text);
        done();
      }
    });

    function fallback(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  });

  /* ---------- 文章图片懒加载 ---------- */
  document.querySelectorAll('.post-content img').forEach(function (img) {
    if (!img.hasAttribute('loading')) img.setAttribute('loading', 'lazy');
  });

  /* ---------- 外部链接新窗口打开 ---------- */
  document.querySelectorAll('.post-content a').forEach(function (a) {
    if (a.hostname && a.hostname !== window.location.hostname) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
    }
  });
})();
