/* 全局交互：移动端导航菜单、站点运行时间等 */
(function () {
  'use strict';

  // 移动端导航切换
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
  }

  // 点击导航链接后自动收起菜单
  if (navLinks) {
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('open');
      }
    });
  }

  // 侧边栏搜索：跳转到搜索页
  var sidebarForm = document.getElementById('sidebarSearchForm');
  if (sidebarForm) {
    sidebarForm.addEventListener('submit', function () {
      var q = sidebarForm.querySelector('input').value.trim();
      var base = (document.querySelector('meta[name="baseurl"]') || {}).content || '';
      window.location.href = base + '/pages/search?q=' + encodeURIComponent(q);
    });
  }
})();
