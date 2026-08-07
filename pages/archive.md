---
layout: archive
title: 归档
permalink: /pages/archive
---

{% assign posts_by_year = site.posts | group_by_exp: "post", "post.date | date: '%Y'" %}

<p class="archive-summary">
  <span class="prompt-symbol">$</span> 共收录 <strong>{{ site.posts.size }}</strong> 篇文章 ·
  <span class="prompt-symbol">$</span> 累计 <strong>{{ posts_by_year.size }}</strong> 个年度
</p>

{% for year in posts_by_year %}
<section class="archive-year">
  <h2 class="archive-year-title">## {{ year.name }}</h2>
  <ul class="archive-list">
    {% for post in year.items %}
    <li class="archive-item">
      <span class="archive-date">{{ post.date | date: "%m-%d" }}</span>
      <a class="archive-link" href="{{ post.url | relative_url }}">{{ post.title }}</a>
      {% if post.tags.size > 0 %}
      <span class="archive-tags">
        {% for tag in post.tags limit: 2 %}
        <a class="chip" href="{{ '/pages/tags' | relative_url }}#{{ tag | slugify }}">#{{ tag }}</a>
        {% endfor %}
      </span>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</section>
{% endfor %}
