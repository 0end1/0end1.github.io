---
layout: page
title: 提交记录
subtitle: git log --oneline --decorate -30
permalink: /pages/commits
---

<div class="commits-app">
  <p class="search-status" id="commitStatus">
    <span class="prompt-symbol">$</span> git log --oneline --decorate -30
  </p>
  <div class="commit-list" id="commitList"></div>
  <p class="commits-more">
    <a class="text-link" href="https://github.com/0end1/0end1.github.io/commits/main" target="_blank" rel="noopener">
      查看全部提交记录 &rarr;
    </a>
  </p>
</div>

<script src="{{ '/assets/js/commits.js' | relative_url }}"></script>
