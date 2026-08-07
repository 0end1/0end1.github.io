---
title: 程序员风博客设计：把终端美学搬进网页
date: 2026-07-28 18:30:00 +0800
categories: [设计]
tags: [CSS, 设计, 主题, 前端]
---

程序员都喜欢终端：黑底绿字、等宽字体、简洁高效。本期博客的主题正是这种 **终端美学（Terminal Aesthetic）**，聊聊它的几个设计要点。

## 1. 配色：深色 + 终端绿

主题基于 GitHub Dark 配色调整，核心变量：

```css
:root {
  --bg: #0d1117;      /* 背景 */
  --panel: #161b22;   /* 面板 */
  --border: #30363d;  /* 边框 */
  --text: #c9d1d9;    /* 正文 */
  --accent: #3fb950;  /* 终端绿 */
}
```

## 2. 字体：等宽字体贯穿全局

等宽字体让代码与文本的视觉风格统一：

```css
--font-mono: "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace;
```

推荐在本地安装 [JetBrains Mono](https://www.jetbrains.com/lp/mono/)，观感最佳。

## 3. 细节：窗口圆点与提示符

- 页面顶部用红黄绿三个圆点模拟 macOS 终端窗口
- 标题前用 `$` 提示符，像在终端里敲命令
- 光标闪烁动画强化"活着的终端"的感觉

```html
<div class="term-dots">
  <span class="term-dot term-dot-red"></span>
  <span class="term-dot term-dot-yellow"></span>
  <span class="term-dot term-dot-green"></span>
</div>
```

```css
@keyframes blink { 50% { opacity: 0; } }
```

## 4. 暗色模式：一套代码，两套皮肤

通过 CSS 变量 + `data-theme` 属性切换主题：

```css
[data-theme="dark"] { --bg: #0d1117; }
[data-theme="light"] { --bg: #f6f8fa; }
```

用户的选择保存在 `localStorage`，首次访问自动跟随系统设置，体验非常顺滑。

## 5. 代码高亮：Rouge 配色

文章中的代码块由 [Rouge](https://github.com/rouge-ruby/rouge) 高亮，配合自定义的 token 配色，深色下清晰不刺眼：

```ruby
def hello
  puts "Hello from Ruby"
end
```

> 设计不是越复杂越好，克制才是美。

如果你也喜欢这种风格，欢迎 fork 本主题自己定制。
