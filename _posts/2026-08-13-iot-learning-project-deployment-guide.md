---
title: "实战部署手册：一个 Vue3 + Spring Boot 学习项目的物料、配置、审计、测试与 CI/CD"
date: 2026-08-13 18:00:00 +0800
categories: [部署, 全栈]
tags: [部署, CI/CD, Spring Boot, Vue3, Docker, Nginx, 预生产]
pin: false
---

> 一套跟着「前端学习路径」一起长出来的 IoT 小项目——三个 Vue/UniApp 前端 + 一个 Spring Boot 后端。本文整理出把它从本地跑起来到预生产交付的完整部署手册，覆盖物料清单、配置管理、审计安全、测试策略、预生产环境与持续集成。所有配置文件均可直接复用。

---

## 开篇：学习项目也要按"生产标准"来

很多学习项目止步于 `npm run dev` + 本地 `mvn spring-boot:run`，一旦要给别人演示、要上预生产、要接 CI，就手忙脚乱。其实只要把**配置外部化、产物可复现、质量有门禁**这三件事在一开始定好，后期迁移到生产几乎零成本。

本文以我这个 `frontend-learning-projects` 仓库为例，给出一份可直接复制的部署手册。结构如下：

- **物料清单（BOM）**：服务、依赖、端口、资源
- **配置管理**：分层原则 + 生产必改项
- **审计与安全**：JWT 鉴权、审计日志、安全基线
- **测试策略**：后端单测、前端构建、质量门禁
- **预生产环境**：隔离拓扑、验收清单、回滚预案
- **持续集成**：CI + 自动部署工作流

---

## 一、物料清单：先盘清楚要部署什么

### 1.1 服务与产物

| 服务 | 类型 | 构建产物 | 端口 | 对外 |
|------|------|----------|------|------|
| `backend-server` | Spring Boot 3.3.5 单体 | `iot-backend.jar` / 镜像 | 8080 | API + WS |
| `admin-system` | Vue3 + Vite | 静态 `dist/` | Nginx 托管 | Web UI |
| `monitor-dashboard` | Vue3 + Vite | 静态 `dist/` | Nginx 托管 | 大屏（WS） |
| `patrol-app` | uni-app | H5 `dist/` / 小程序 / App | Nginx 或商店 | 移动端 |

### 1.2 运行依赖

JDK 17（与 `pom.xml` 一致）、Maven 3.9、Node ≥18、MySQL 8、Redis 7、Docker 24+、Nginx 1.25+。

### 1.3 端口规划

后端 HTTP/WS 在 8080；MySQL 容器 `3307→3306`、Redis `6379` 仅内网；前端经 Nginx 暴露 80/443。

> 经验：数据库和缓存**永远不要映射公网端口**，只留在容器/内网。

---

## 二、配置管理：把"会变的东西"都赶到环境变量

### 2.1 分层原则（12-factor）

- 代码内默认（`application.yml`）放开发值；
- 环境差异走 `application-{profile}.yml` + 环境变量；
- **密钥一律环境变量**，禁止入库（JWT secret、DB 密码）。

### 2.2 两个生产必改项

当前 `application.yml` 有两处只适合开发：

1. `spring.sql.init.mode: always` 每次启动重跑建表脚本 —— 生产改 `never`，改用 Flyway 迁移；
2. `jwt.secret` 是硬编码演示值 —— 生产用 `JWT_SECRET` 环境变量覆盖（HS256 ≥ 256 bit）。

### 2.3 后端生产配置模板

```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/iot_backend?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  data:
    redis:
      host: redis
      port: 6379
      password: ${REDIS_PASSWORD:}
  sql:
    init:
      mode: never
jwt:
  secret: ${JWT_SECRET}
  expiration: 86400000
```

启动：`java -jar iot-backend.jar --spring.profiles.active=prod`

### 2.4 前端与 Nginx

前端构建后 `baseURL` 固定为 `/api`，由 Nginx 反代；**WebSocket 要单独配 `Upgrade` 头**：

```nginx
location /api/ {
    proxy_pass http://backend:8080/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
location /ws/ {
    proxy_pass http://backend:8080/ws/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;
}
```

---

## 三、审计与安全：学习项目也要有"留痕"

- **认证**：JWT（HS256）+ Spring Security 过滤器链，登录签发、请求带 `Authorization: Bearer <token>`。
- **授权**：`admin`/`user` 角色，`requestMatchers(...).hasRole(...)` 控制，越权返回 403。
- **登出**：token 写入 Redis 黑名单，有效期内失效。

**审计日志**是本项目的一个亮点：`operation_log` 表由 `OperationLogService.log()` 用 `Propagation.REQUIRES_NEW` 独立事务写入——即使主业务回滚，审计也必留痕。对外查询 `GET /api/logs`（需认证），前端「操作日志」页已接入。

> 生产增强：关键写操作统一用 `@LogOperation` 切面采集，审计表按时间归档，日志接入 Loki/ELK。

---

## 四、测试策略：CI 的第一道门禁

- **后端**（JUnit5 + Mockito，24 用例全绿）：单元（`JwtTokenProvider`/`CacheAsideService`）、服务（`AuthService`/`WorkOrderService` 事务传播）、接口（`@WebMvcTest` 验 401/403/异常）。
- **前端**：`npm run build:*` 失败即阻断，模板/类型错误会暴露。
- **质量门禁**：后端单测全绿 + 前端三端 build 成功 + 依赖漏洞无 High/Critical 才放行。

---

## 五、预生产环境（Staging）：无限接近生产的隔离区

- 独立库、独立命名空间，**不连生产数据**；
- 拓扑：Nginx → backend（profile=staging）→ mysql/redis（均容器内网）；
- 数据库迁移建议上 Flyway，脚本只增不改，保证可重复部署；
- **冒烟清单**：健康检查 UP、登录写审计、日志分页过滤、大屏 WS 101、前端的日志页渲染、巡检 MQTT 收数；
- **回滚预案**：后端保留上一镜像 tag 秒回；前端 Nginx `root` 切上一版 `dist`；进阶可蓝绿/金丝雀。

---

## 六、持续集成：push 一下就有人替你验收

`.github/workflows/ci.yml` 在 push/PR 时跑：后端 `mvn test`（MySQL/Redis 用 service container）+ 前端三端 `npm run build:*`。

`deploy-staging.yml` 在 CI 通过后自动构建后端镜像、推送并同步前端静态包到 Staging 主机（密钥走 `secrets`）。

流水线：

```
push main → ci.yml(后端测试+前端构建) 全绿 → deploy-staging.yml → Staging 自动部署
```

---

## 结语：把"能跑"变成"可交付"

学习项目最容易被低估的一步，恰恰是它最像真实工程的一步：**部署与交付**。把配置外部化、产物容器化、质量门禁化、环境隔离化，这套肌肉记忆比某个具体框架更保值。

完整手册见仓库 `docs/部署指南.md`，配套 `Dockerfile` 与 GitHub Actions 工作流均已提交。欢迎在评论区交流你自己的部署踩坑经验。
