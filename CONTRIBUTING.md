# Contributing to DevLog

感谢你愿意为本项目贡献！请花一分钟阅读以下指南，让协作更顺畅。

## 贡献方式

- 🐛 **报告 Bug**：通过 [Issue](https://github.com/0end1/0end1.github.io/issues) 提交，请包含复现步骤、预期行为与实际行为
- 💡 **提出建议**：通过 Issue 描述你的想法（新功能 / 主题改进 / 阅读体验优化）
- ✏️ **提交代码**：Fork → 修改 → Pull Request，见下方流程
- 📝 **投稿文章**：欢迎投稿技术文章，通过 Issue 或 PR 提交 Markdown 到 `_posts/`

## 开发流程

```bash
# 1. Fork 并克隆
git clone https://github.com/<你的用户名>/0end1.github.io.git
cd 0end1.github.io

# 2. 安装依赖并本地预览
bundle install
bundle exec jekyll serve
# 打开 http://localhost:4000

# 3. 创建分支
git checkout -b feat/my-change

# 4. 提交（使用约定式提交，见下方规范）
git commit -m "feat(theme): add xxx feature"

# 5. 推送并创建 Pull Request
git push origin feat/my-change
```

## 提交信息规范（Conventional Commits）

```
<type>(<scope>): <subject>

type: feat | fix | docs | style | refactor | test | chore
scope: 可选，如 theme / search / config / data
```

示例：

- `feat(search): support pinyin fuzzy search`
- `fix(theme): toc not sticky on mobile`
- `docs: update deployment guide`

## 代码规范

- 文章 front matter 必须包含 `title`、`date`，日期格式 `YYYY-MM-DD HH:MM:SS +0800`
- 文件名格式 `YYYY-MM-DD-标题.md`
- CSS 使用变量定义颜色，新增组件遵循现有终端美学风格
- JS 使用原生 ES5+ 语法，无需构建步骤，保持零依赖
- 新增配置项需在 README 和 `_config.yml` 注释中同步说明

## Pull Request 检查清单

- [ ] 本地 `bundle exec jekyll build` 通过
- [ ] 遵循提交信息规范
- [ ] 已更新相关文档（README / CHANGELOG）
- [ ] 新功能已考虑暗色/亮色主题与移动端适配

## 行为准则

参与本项目即表示同意遵守 [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md)。
