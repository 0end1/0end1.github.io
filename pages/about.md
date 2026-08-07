---
layout: page
title: 关于
subtitle: 关于我
permalink: /pages/about
---

{% if site.author.avatar %}
<img class="about-avatar" src="{{ site.author.avatar | relative_url }}" alt="{{ site.author.name }}">
{% endif %}

## 你好，我是 {{ site.author.name | default: site.title }}

这是一个用 **Jekyll + GitHub Pages** 搭建的个人博客，采用程序员风格的终端主题。

### 关于我

- 热爱技术，关注 Web 开发、开源与效率工具
- 喜欢把踩过的坑、学到的东西记录下来
- 正在持续输出中…

### 关于本站

- 静态站点，托管于 [GitHub Pages](https://pages.github.com)
- 代码高亮由 [Rouge](https://github.com/rouge-ruby/rouge) 提供
- 评论系统基于 [giscus](https://giscus.app)（GitHub Discussions）

### 联系我

{% if site.author.email %}
- 邮箱：<a href="mailto:{{ site.author.email }}">{{ site.author.email }}</a>
{% endif %}
{% if site.author.github %}
- GitHub：<a href="https://github.com/{{ site.author.github }}" target="_blank" rel="noopener">@{{ site.author.github }}</a>
{% endif %}

> 欢迎通过评论或邮箱交流，也欢迎交换友情链接。
