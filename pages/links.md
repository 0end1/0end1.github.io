---
layout: page
title: 外链
subtitle: 友情链接 & 常用站点
permalink: /pages/links
---

{% if site.data.links.size == 0 %}
<p>还没有添加任何链接，去 <code>_data/links.yml</code> 中添加吧。</p>
{% endif %}

<div class="friend-grid">
  {% for link in site.data.links %}
  <a class="friend-card terminal-card" href="{{ link.url }}" target="_blank" rel="noopener">
    <span class="friend-card-icon">{{ link.name | slice: 0, 1 | upcase }}</span>
    <span class="friend-card-body">
      <span class="friend-card-name">{{ link.name }}</span>
      {% if link.description %}
      <span class="friend-card-desc">{{ link.description }}</span>
      {% endif %}
      <span class="friend-card-url">{{ link.url | remove: "https://" | remove: "http://" }}</span>
    </span>
  </a>
  {% endfor %}
</div>

<hr class="terminal-hr">

<h2>交换链接</h2>

<p>如果你想交换友情链接，欢迎通过 <a href="{{ '/pages/about' | relative_url }}">关于页</a> 中的方式联系我。交换格式如下：</p>

<pre><code>站点名称：你的博客名
站点地址：https://yourname.github.io
一句话简介：这里是一句话简介
</code></pre>
