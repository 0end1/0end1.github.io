---
layout: page
title: 标签
subtitle: 按标签浏览全部文章
permalink: /pages/tags
---

<div class="taxonomy-nav">
  {% for tag in site.tags %}
    {% assign t = tag[0] %}
    <a class="chip" href="#{{ t | slugify }}">#{{ t }}<span class="chip-count">{{ tag[1].size }}</span></a>
  {% endfor %}
</div>

{% for tag in site.tags %}
{% assign t = tag[0] %}
{% assign posts = tag[1] %}
<section class="taxonomy-group" id="{{ t | slugify }}">
  <h2 class="taxonomy-title"># {{ t }} <span class="taxonomy-count">({{ posts.size }})</span></h2>
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
