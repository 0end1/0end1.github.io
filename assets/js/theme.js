/* 主题切换（暗色/亮色），跟随系统偏好，记忆用户选择 */
(function () {
  'use strict';

  var html = document.documentElement;

  function applyTheme(theme, save) {
    html.setAttribute('data-theme', theme);
    if (save) {
      try { localStorage.setItem('theme', theme); } catch (e) { /* ignore */ }
    }
    // 同步 giscus 评论主题
    var iframe = document.querySelector('iframe.giscus-frame');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({
        giscus: { setConfig: { theme: theme === 'dark' ? 'dark' : 'light' } }
      }, 'https://giscus.app');
    }
  }

  var toggleBtn = document.getElementById('themeToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var current = html.getAttribute('data-theme') || 'dark';
      applyTheme(current === 'dark' ? 'light' : 'dark', true);
    });
  }

  // 系统主题变化时，若用户未手动选择，则跟随系统
  try {
    var stored = localStorage.getItem('theme');
    if (!stored && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: light)')
        .addEventListener('change', function (e) {
          if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'light' : 'dark', false);
          }
        });
    }
  } catch (e) { /* ignore */ }

  window.__applyTheme = applyTheme;
})();
