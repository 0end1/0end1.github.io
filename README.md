<div align="center">

# DevLog

**程序员风格个人博客 · Jekyll + GitHub Pages**

[![Jekyll](https://img.shields.io/badge/Jekyll-3.9-blue)](https://jekyllrb.com)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-ready-1f883d)](https://pages.github.com)
[![License](https://img.shields.io/github/license/0end1/0end1.github.io)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/0end1/0end1.github.io/build.yml?label=build)](https://github.com/0end1/0end1.github.io/actions)

简洁、克制、高效的终端美学博客主题 —— 深色质感、等宽字体、`$` 命令提示符，为记录技术而生。

**在线演示：https://0end1.github.io**

</div>

---

## 特性

- 🎨 **终端美学**：mac 风格窗口顶栏、`$` 提示符、等宽字体
- 🌗 **双主题**：暗色 / 亮色，自动跟随系统并记忆用户选择
- 📚 **内容体系**：文章分页、按年归档、标签 / 分类聚合
- 🔍 **站内搜索**：实时全文匹配，关键词高亮
- 📖 **阅读体验**：阅读进度条、目录吸顶高亮、阅读时长、相关文章推荐
- 📌 **置顶文章**：`pinned: true` 一键置顶
- 💬 **评论系统**：giscus（基于 GitHub Discussions）
- 🔗 **外链 / 广告**：友情链接与侧边栏广告位，数据文件配置化
- ⚡ **零构建步骤**：无 Node 依赖，`bundle` 安装即可本地运行

## 快速开始

需要 Ruby ≥ 2.7：

```bash
git clone https://github.com/0end1/0end1.github.io.git
cd 0end1.github.io
bundle install
bundle exec jekyll serve
```

打开 <http://localhost:4000> 预览。

## 部署

本项目为 GitHub Pages 用户名站点，push 到 `main` 分支后由云端自动构建：

```bash
git push origin main
```

若作为项目站点部署（`<用户名>.github.io/<仓库>`），在 `_config.yml` 修改：

```yaml
url: "https://<用户名>.github.io"
baseurl: "/<仓库名>"
```

## 配置

所有配置集中在 [`_config.yml`](_config.yml)：

| 配置项 | 说明 |
| --- | --- |
| `title` / `description` | 站点名称与描述 |
| `author` | 姓名、邮箱、GitHub、头像 |
| `url` / `baseurl` | 部署地址 |
| `sponsor` | 打赏区（收款码 / 开关） |
| `giscus` | 评论系统（`enabled: true` 开启） |
| `paginate` | 每页文章数 |

其他数据文件：

| 文件 | 作用 |
| --- | --- |
| [`_data/nav.yml`](_data/nav.yml) | 导航菜单 |
| [`_data/links.yml`](_data/links.yml) | 友情链接（外链） |
| [`_data/ads.yml`](_data/ads.yml) | 侧边栏广告位 |

## 写文章

在 `_posts/` 目录新建 `YYYY-MM-DD-标题.md`：

```yaml
---
title: 文章标题
date: 2026-08-07 09:30:00 +0800
categories: [教程]
tags: [Jekyll, 部署]
pinned: false   # 可选，设为 true 置顶
---
```

支持 Markdown（代码高亮、表格、引用等），push 后自动发布。

## 文档

- [贡献指南](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
- [安全说明](SECURITY.md)
- [变更日志](CHANGELOG.md)

## 目录结构

```
.
├── _config.yml          # 站点配置
├── _data/               # 数据：导航 / 外链 / 广告
├── _includes/           # 组件：头部 / 导航 / 侧边栏 / 打赏 / 相关文章
├── _layouts/            # 布局：默认 / 首页 / 文章 / 页面 / 归档
├── _posts/              # 文章（Markdown）
├── pages/               # 关于 / 归档 / 标签 / 分类 / 搜索 / 外链
├── assets/              # 样式与脚本（零依赖）
│   ├── css/main.css
│   ├── js/
│   └── images/
├── .github/             # Issue/PR 模板与 CI
├── index.html           # 首页
└── Gemfile              # Ruby 依赖
```

## 技术栈

| 层 | 选型 |
| --- | --- |
| 静态生成 | [Jekyll 3.9](https://jekyllrb.com) |
| 托管 | [GitHub Pages](https://pages.github.com) |
| 代码高亮 | [Rouge](https://github.com/rouge-ruby/rouge) |
| 评论 | [giscus](https://giscus.app) |
| 搜索 / 交互 | 原生 JavaScript（零依赖） |

## 贡献

欢迎提交 Issue 与 Pull Request！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)，
并遵循约定式提交规范（`feat` / `fix` / `docs` …）。

## 许可

本项目基于 [MIT License](LICENSE) 开源。

Copyright © 2026 [0end1](https://github.com/0end1)

---

<p align="center">用 ♥ 与 ☕ 构建 · 托管于 GitHub Pages</p>
