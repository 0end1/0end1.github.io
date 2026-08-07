---
title: 用 GitHub Pages 免费部署个人博客（完整指南）
date: 2026-08-05 20:00:00 +0800
categories: [教程]
tags: [GitHub Pages, Jekyll, 部署, Git]
---

GitHub Pages 可以为个人和项目提供**免费、静态**的网站托管，非常适合搭建个人博客。本文将完整介绍部署流程。

## 一、创建仓库

GitHub Pages 有两种站点：

- **用户名站点（User Site）**：仓库名必须是 `<用户名>.github.io`，一个账号只能有一个
- **项目站点（Project Site）**：任意仓库名，通过 `<用户名>.github.io/<仓库名>` 访问

> 推荐使用用户名站点，访问路径最简洁。

## 二、初始化仓库并推送

```bash
# 在博客项目根目录
git init
git add .
git commit -m "init: personal blog"
git branch -M main
git remote add origin https://github.com/<用户名>/<用户名>.github.io.git
git push -u origin main
```

## 三、开启 Pages 服务

1. 进入仓库 **Settings → Pages**
2. Source 选择 `Deploy from a branch`
3. Branch 选择 `main`，目录 `/ (root)`
4. 点击 **Save**，等待 1~2 分钟即可通过 `https://<用户名>.github.io` 访问

## 四、绑定自定义域名（可选）

在仓库 `Settings → Pages` 的 Custom domain 中填入你的域名，并按提示配置 DNS：

| 记录类型 | 主机 | 值 |
| --- | --- | --- |
| A | @ | 185.199.108.153 等四个 IP |
| CNAME | www | `<用户名>.github.io` |

然后在仓库根目录添加 `CNAME` 文件：

```
your-domain.com
```

## 五、本地预览

```bash
bundle install        # 安装依赖
bundle exec jekyll serve   # 启动本地服务
```

打开 <http://localhost:4000> 即可预览。

## 六、开启评论系统

本站评论使用 giscus：

1. 在仓库 **Settings → General → Features** 中开启 **Discussions**
2. 访问 [giscus.app](https://giscus.app)，选择你的仓库
3. 安装 [giscus app](https://github.com/apps/giscus) 授权
4. 将生成的 `repo_id`、`category_id` 填入 `_config.yml` 的 `giscus` 配置中，并将 `enabled` 改为 `true`

## 小贴士

- 每次 push 到 `main` 分支，GitHub 都会**自动重新构建**站点
- 文章写在 `_posts/` 目录，文件名为 `YYYY-MM-DD-标题.md`
- 文章头部（front matter）必须包含 `title` 和 `date`

祝你的博客早日上线！
