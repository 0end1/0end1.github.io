---
layout: page
title: 分类
subtitle: 按分类浏览全部文章
permalink: /pages/categories
---

<div class="taxonomy-nav">
  {% for category in site.categories %}
    {% assign c = category[0] %}
    <a class="chip" href="#{{ c | slugify }}">{{ c }}<span class="chip-count">{{ category[1].size }}</span></a>
  {% endfor %}
</div>

{% for category in site.categories %}
{% assign c = category[0] %}
{% assign posts = category[1] %}
<section class="taxonomy-group" id="{{ c | slugify }}">
  <h2 class="taxonomy-title">[ {{ c }} ] <span class="taxonomy-count">({{ posts.size }})</span></h2>
  <ul class="taxonomy-list">
    {% for post in posts %}
    <li class="taxonomy-item">
      <span class="taxonomy-date">{{ post.date | date: "%Y-%m-%d" }}</span>
      <a class="taxonomy-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </li>
    {% endfor %}
  </ul>
</section>
{% endfor %}
