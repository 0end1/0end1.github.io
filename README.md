# DevLog · 程序员风个人博客

基于 **Jekyll + GitHub Pages** 的个人博客，采用**终端美学（Terminal Aesthetic）**设计：
深色主题、等宽字体、mac 风格窗口顶栏、`$` 命令提示符，并支持暗色/亮色双主题切换。

## 功能特性

- 程序员风格主题：深色终端质感 + 亮色模式，自动跟随系统并记忆用户选择
- 文章列表 + 分页、按年归档、标签/分类聚合
- 站内全文搜索（实时匹配标题 / 标签 / 分类 / 摘要）
- giscus 评论系统（基于 GitHub Discussions，零成本）
- 友情链接 / 外链展示（侧边栏 + 独立页面）
- 侧边栏广告位（支持文字 / 图片，可一键开关）
- 响应式布局，移动端汉堡菜单
- SEO / RSS / Sitemap 开箱即用

## 快速开始

### 方式一：本地预览（推荐）

需要 Ruby >= 2.7：

```bash
bundle install
bundle exec jekyll serve
```

打开 <http://localhost:4000> 预览。

### 方式二：直接推送到 GitHub Pages

1. 在 GitHub 创建仓库 `<你的用户名>.github.io`
2. 将本项目推送到 `main` 分支
3. 仓库 `Settings → Pages`，Source 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`
4. 等待 1~2 分钟，访问 `https://<你的用户名>.github.io`

## 个性化配置

所有配置集中在根目录的 `_config.yml`：

| 配置项 | 说明 |
| --- | --- |
| `title` / `description` | 站点名称与描述 |
| `author` | 你的名字、邮箱、GitHub、头像 |
| `url` / `baseurl` | 部署地址（项目站点需填 baseurl） |
| `giscus` | 评论系统配置（`enabled` 改为 `true` 开启） |
| `paginate` | 每页文章数 |

- **导航栏**：编辑 `_data/nav.yml` 增删导航项
- **友情链接**：编辑 `_data/links.yml`
- **广告位**：编辑 `_data/ads.yml`（`enabled` 控制显示，支持文字/图片）

## 写文章

在 `_posts/` 目录新建 `YYYY-MM-DD-标题.md`，文件头（front matter）示例：

```yaml
---
title: 文章标题
date: 2026-08-07 09:30:00 +0800
categories: [教程]
tags: [Jekyll, 部署]
---
```

支持 Markdown 语法（代码高亮、表格、引用等），写完后 push 即可自动发布。

## 目录结构

```
.
├── _config.yml          # 站点配置
├── _data/               # 数据：导航 / 外链 / 广告
├── _includes/           # 组件：头部 / 导航 / 侧边栏 / 广告位
├── _layouts/            # 布局：默认 / 首页 / 文章 / 页面 / 归档
├── _posts/              # 文章（Markdown）
├── pages/               # 关于 / 归档 / 标签 / 分类 / 搜索 / 外链
├── assets/              # 样式与脚本
│   ├── css/main.css     # 主题样式（CSS 变量双主题）
│   └── js/              # 主题切换 / 搜索 / 交互
└── index.html           # 首页
```

## 常见问题

**Q：为什么本地 `bundle install` 报错？**
A：GitHub Pages 官方依赖 `github-pages` gem 对 Ruby 版本有要求，建议使用 Ruby 2.7+（macOS 可用 `brew install ruby` 或 rbenv 安装）。也可以直接跳过本地预览，push 到 GitHub 后由云端自动构建。

**Q：如何开启评论？**
A：仓库开启 Discussions → [giscus.app](https://giscus.app) 生成 `repo_id` / `category_id` → 填入 `_config.yml` → 将 `giscus.enabled` 改为 `true`。

**Q：如何更换头像？**
A：将图片放入 `assets/images/`，修改 `_config.yml` 中的 `author.avatar` 路径。

## 许可

MIT License · 自由使用，欢迎 Fork。
