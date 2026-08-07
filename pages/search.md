---
layout: page
title: 搜索
subtitle: 站内全文搜索
permalink: /pages/search
---

<div class="search-page">
  <form class="search-form search-form-lg" id="searchForm" role="search" onsubmit="return false;">
    <span class="prompt-symbol">$</span>
    <input
      class="search-input"
      id="searchInput"
      type="search"
      placeholder="输入关键词，回车或实时搜索…"
      autocomplete="off"
      autofocus
      aria-label="搜索关键词"
    >
    <button class="btn btn-primary" type="submit" id="searchBtn">grep</button>
  </form>

  <div class="search-status" id="searchStatus">
    <span class="prompt-symbol">$</span> 正在加载索引…
  </div>

  <div class="search-results" id="searchResults" hidden></div>

  <noscript>
    <p class="search-noscript">你的浏览器未启用 JavaScript，无法使用站内搜索。请直接访问
      <a href="{{ '/pages/archive' | relative_url }}">归档页</a> 浏览全部文章。</p>
  </noscript>
</div>

<script src="{{ '/assets/js/search.js' | relative_url }}"></script>
