---
title: "AI Agent 学习笔记（二）：上下文工程（上）—— Agent 与大模型的 API 交互"
date: 2026-08-11 09:00:00 +0800
categories: [AI, Agent]
tags: [AI Agent, 上下文工程, LLM, API]
pin: false
---

> 基于李博杰《深入理解 AI Agent：设计原理与工程实践》第2章学习笔记。

---

## 从"眼睛"说起

在上一篇文章中，我们将 AI Agent 归结为一个简洁的公式：

```
现代 Agent = LLM + 上下文 + 工具
```

其中上下文被比作 Agent 的"眼睛"——Agent 只能基于它"看到"的信息来做决策。所谓上下文，就是每次调用模型时，模型实际"看到"的全部信息。它不仅包含对话历史，还包含系统指令、工具定义等各类信息。

在 Harness 工程的视角下，上下文工程是其中"上下文与工具"层面的核心实现——它决定了 Agent 在每个决策点能看到什么信息、以什么样的结构看到这些信息。

---

## 上下文决定 Agent 的能力上限

大语言模型在标准测试中成绩亮眼，但到了实际业务场景却常常让人失望。原因并不神秘：**模型的能力是通用的，但要执行具体任务就需要背景信息**——产品架构、业务规则、内部约定——而这些信息模型根本不知道。

想象一位天才工程师加入你的团队，他具备深厚的理论功底和卓越的编程能力，但对你们的产品架构、业务逻辑、技术债务、团队规范一无所知。更糟的是，关键的架构决策散落在不同团队成员的记忆中，代码库也缺乏文档。这位天才即便智力超群，也难以发挥真正的价值——这恰恰是当前 AI Agent 面临的困境。

以一个 Coding Agent 为例，同样是"帮我修复这个 bug"的指令，Agent 需要三类上下文：

1. **实时代码上下文**：代码库的目录结构、模块职责划分、核心数据结构定义、团队的代码规范
2. **流程规范**：Git 分支策略、代码提交规范、代码审查流程、CI/CD 管线要求
3. **环境信息**：开发环境配置、测试数据库连接地址、staging 部署方式、API 密钥管理方式

**核心洞察**：模型本身的智力只是基础，上下文的质量才是 Agent 能力的真正上限。一个中等能力的模型配上精心组织的上下文，往往能胜过一个顶级模型在信息匮乏下的盲目摸索。

---

## 构建 AI 原生团队：首先是一场文档化运动

上下文工程首先是一个技术问题，但更根本的是一个**组织问题**。大多数团队的关键知识都是隐性的：架构决策只有老员工记得，业务规则靠口口相传，重要的背景信息锁在私聊记录里。

对远程工作友好的团队往往也对 AI Agent 友好。Linux 内核开源项目就是一个很好的范例：分布在全球的开发者协作维护了三十多年，成功的秘诀是高度透明、文档驱动的沟通文化。

OpenAI 研究员翁家翌曾精辟地总结："人和模型一样，最重要的是 Context。"

**AI Agent 就像一个永远的新员工：给足背景信息，它能干得很好；什么都不告诉它，再聪明也是白搭。**

---

## Agent 如何调用大模型：理解 API 的上下文结构

### 消息角色体系

大模型 API 的消息体系定义了四种核心角色：

| 角色 | 来源 | 含义 |
|------|------|------|
| `system` | 开发者编写 | 定义 Agent 的行为规则、身份角色、工作方式 |
| `user` | 用户输入 | 用户的问题或指令 |
| `assistant` | 模型生成 | 模型的历史回复（包括工具调用请求） |
| `tool` | Agent 框架生成 | 工具执行的结果返回 |

这四种角色形成了一个清晰的信息层级：**system** 在最顶层定义大方向，**user** 和 **assistant** 交替构成对话主体，**tool** 穿插其中提供外部信息。

### 一个完整的 API 交互示例

假设用户问："温哥华现在几点了？天气怎么样？"

**第一次 API 调用——Agent 框架构建请求：**

```json
{
  "model": "Qwen3-0.6B",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant. Use the provided tools to get real-time information when needed."
    },
    {
      "role": "user",
      "content": "What's the current time and weather in Vancouver?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_time",
        "description": "Get the current date and time in a specific timezone",
        "parameters": {
          "type": "object",
          "properties": {
            "timezone": {"type": "string", "description": "Timezone name"}
          }
        }
      }
    },
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather for a specific city",
        "parameters": {
          "type": "object",
          "properties": {
            "city": {"type": "string", "description": "City name"},
            "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]}
          }
        }
      }
    }
  ]
}
```

模型判断"当前时间"和"天气"需要通过工具获取，而且两者之间没有依赖关系，可以**并行调用**。

**第二次 API 调用**：Agent 框架执行工具后，将完整对话历史 + 工具结果一起发送给模型：

```json
{
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "What's the current time and weather in Vancouver?"},
    {"role": "assistant", "content": null, "tool_calls": [...]},
    {"role": "tool", "tool_call_id": "call_abc123", "content": "{\"datetime\": \"...\"}"},
    {"role": "tool", "tool_call_id": "call_def456", "content": "{\"temp\": 12, \"conditions\": \"Cloudy\"}"}
  ]
}
```

---

## 理解这个交互循环的关键点

### 1. 模型只负责决策，Agent 框架负责执行

这是理解 Agent 架构的关键：**模型负责决策（调用什么工具、传什么参数），Agent 框架负责执行（实际调用 API、运行代码）**。

### 2. 上下文随循环不断增长

每次 API 调用时，Agent 框架会将完整的对话历史发送给模型。对话越长，上下文越长，直到超出窗口限制。

### 3. 工具定义占据大量上下文空间

在生产环境中，Agent 可能拥有数十个工具，每个工具的参数定义可能很复杂。工具定义本身就是上下文的重要组成部分。

### 4. 结构化格式的重要性

消息中的 system/user/assistant/tool 角色体系、工具定义的 JSON Schema 格式——模型在训练阶段已经学会解析这种结构化格式。**偏离标准格式往往是在给自己挖坑**。

---

## 上下文窗口的概念

所有消息内容最终被序列化为 token 流，由 Transformer 的注意力机制统一处理。这个 token 流的长度受到**上下文窗口**的限制：

| 模型 | 上下文窗口 |
|------|-----------|
| Qwen3 | 32K tokens |
| Claude | 200K tokens |
| Gemini | 2M tokens |

窗口大小决定了 Agent 能"记住"多少信息。但更大的窗口也意味着更高的成本和更慢的响应速度。如何高效利用有限的窗口空间，是上下文工程的核心课题。

---

## 核心原则总结

1. **上下文决定能力上限**：模型的智力只是基础，信息的质量与组织方式才是关键
2. **文档化是前提**：团队必须先做好信息结构化，AI 才有可用的上下文
3. **遵循标准消息格式**：使用 system/user/assistant/tool 角色体系，不要自行拼接消息
4. **理解 API 交互循环**：模型决策 → Agent 框架执行 → 结果回注上下文 → 模型再决策
5. **工具定义要精简**：每个工具的描述和参数定义都占用 token 预算

---

## 下篇预告

下一篇文章将深入探讨提示词设计的艺术——包括系统提示词的结构化设计、提示注入防御、KV Cache 友好的上下文管理，以及动态提示词与 Agent Skills 机制。

---

*本文基于李博杰著《深入理解 AI Agent：设计原理与工程实践》v1.3 第2章学习整理。系列文章同步发布于 [ai-agent-study](https://github.com/0end1/ai-agent-study) 仓库。*
