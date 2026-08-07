# Security Policy

## Supported Versions

以下版本目前受到安全更新支持：

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

## Reporting a Vulnerability

如果你发现安全漏洞，**请勿公开提交 Issue**（不要写入标题或正文），
以免在修复前被利用。请通过以下方式私密报告：

- 发送邮件至：`yourname@example.com`
- 或通过 GitHub 的 [Security Advisories](https://github.com/0end1/0end1.github.io/security/advisories/new)

报告请包含：

1. 漏洞类型与影响范围
2. 复现步骤（尽量详细）
3. 受影响的环境（Ruby / Jekyll 版本等）
4. 建议的修复方案（可选）

我们会在 **7 天内**回复确认，并尽力在 **30 天内**发布修复。
安全漏洞修复后，会记入 CHANGELOG 并在 Release 中公告。

## Security Considerations

- 本项目为纯静态站点（Jekyll 构建产物），本身无服务端代码
- 评论由 giscus 提供（基于 GitHub Discussions），详见其安全策略
- 投稿内容中的链接可能指向第三方，请谨慎点击
