---
title: "IoT 学习项目部署手册：从物料清单到 CI/CD 上线全流程"
date: 2026-08-13 16:00:00 +0800
categories: [IoT, DevOps]
tags: [IoT, 部署, Docker, Nginx, CI/CD, Spring Boot, Vue3]
pin: false
---

> 覆盖 `admin-system`、`monitor-dashboard`、`patrol-app` 三个前端与 `backend-server` 后端。
> 目标环境：开发 → 预生产（Staging）→ 生产（Production）。

---

## 一、物料清单（BOM）

### 服务与产物

| 服务 | 类型 | 构建产物 | 运行端口 | 对外暴露 |
|------|------|----------|----------|----------|
| `backend-server` | Spring Boot 3.3.5 单体应用 | `iot-backend.jar`（或 Docker 镜像） | 8080 | 后端 API + WS |
| `admin-system` | Vue3 + Vite 后台管理 | 静态 `dist/` | 由 Nginx 托管 | Web UI |
| `monitor-dashboard` | Vue3 + Vite 监控大屏 | 静态 `dist/` | 由 Nginx 托管 | Web UI（含 WS） |
| `patrol-app` | uni-app 移动端巡检 | H5 `dist/` / 小程序包 / App 包 | 由 Nginx 或应用商店分发 | 移动端 |

### 运行环境依赖

| 依赖 | 版本 | 用途 | 备注 |
|------|------|------|------|
| JDK | 17（Temurin/Eclipse） | 后端运行/构建 | 与 `pom.xml` 的 `java.version=17` 一致 |
| Maven | 3.9.x | 后端构建 | 本地用 3.9.16 |
| Node.js | ≥ 18 | 前端构建 | 见根 `package.json` `engines` |
| MySQL | 8.0 | 业务库 `iot_backend` | 容器内 `mysql:8.0` |
| Redis | 7 | 缓存/Token 黑名单 | 容器内 `redis:7` |
| Docker | 24+ | 编排与镜像运行 | 提供 mysql/redis/后端镜像 |
| Nginx | 1.25+ | 前端静态托管 + 反向代理 | 仅生产/预生产需要 |

### 端口规划

| 组件 | 开发映射 | 预生产/生产建议 |
|------|----------|-----------------|
| 后端 HTTP | 8080 | 8080（容器网络内，仅 Nginx 可达） |
| 后端 WS | `/ws/monitor`（8080） | 经 Nginx `/ws` 透传 |
| MySQL | 3307→3306 | 仅容器内网（不暴露宿主机） |
| Redis | 6379 | 仅容器内网（不暴露宿主机） |
| admin-system | 5173 | Nginx 80/443 |
| monitor-dashboard | 5174 | Nginx 80/443 |
| patrol-app (H5) | 5175 | Nginx 80/443 |

---

## 二、配置管理

### 配置分层原则

- **代码内默认**：`application.yml`（开发可用，含本地 `localhost`、演示密钥）
- **环境覆盖**：`application-{profile}.yml` + 环境变量（12-factor）
- **敏感信息**：一律走环境变量，禁止提交进仓库（JWT 密钥、DB 密码）
- **前端**：`.env.[mode]` 通过 Vite 注入 `import.meta.env`，生产构建后不可改，需按环境重新构建

### 后端生产关键配置

> ⚠️ 当前 `application.yml` 中有两处**仅适合开发**，生产必须改：

1. `spring.sql.init.mode: always` 会在每次启动重跑 `schema.sql`+`data.sql`，**生产改为 `never`**，改用迁移工具。
2. `jwt.secret` 是硬编码演示密钥，**生产必须用环境变量 `JWT_SECRET` 覆盖**。

### 后端环境示例（`application-prod.yml`）

部署到服务器时新建该文件（不放仓库，或放仓库但**不含密钥**）：

```yaml
spring:
  datasource:
    url: jdbc:mysql://mysql:3306/iot_backend?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&useSSL=true&allowPublicKeyRetrieval=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
  data:
    redis:
      host: redis
      port: 6379
      password: ${REDIS_PASSWORD:}
  sql:
    init:
      mode: never          # 生产关闭自动初始化
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: Asia/Shanghai

jwt:
  secret: ${JWT_SECRET}    # 必须注入，HS256 长度 ≥ 256 bit
  expiration: 86400000

logging:
  level:
    com.iot.backend: info  # 生产从 debug 降到 info
```

启动方式：`java -jar iot-backend.jar --spring.profiles.active=prod`

### 前端环境示例

根 `package.json` 用 npm workspaces，前端按 mode 读取 `.env`：

```ini
# .env.production（生产）
VITE_API_BASE=/api
VITE_WS_BASE=/ws
```

> `admin-system/src/utils/request.js` 当前 `baseURL: '/api'` 已固定；如要按环境切换，改为 `import.meta.env.VITE_API_BASE || '/api'`。monitor-dashboard 的 WS 走 `/ws` 代理（见 Nginx）。

生产构建：`npm run build:admin && npm run build:dashboard && npm run build:patrol`

### Nginx 反向代理（同时转发 `/api` 与 WebSocket `/ws`）

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端静态资源
    location /admin/ {
        alias /srv/www/admin-system/;
        try_files $uri $uri/ /admin/index.html;
    }
    location /dashboard/ {
        alias /srv/www/monitor-dashboard/;
        try_files $uri $uri/ /dashboard/index.html;
    }
    location /patrol/ {
        alias /srv/www/patrol-app-h5/;
        try_files $uri $uri/ /patrol/index.html;
    }

    # 后端 REST API
    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 后端 WebSocket 实时推送（monitor-dashboard 用）
    location /ws/ {
        proxy_pass http://backend:8080/ws/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;
    }
}
```

---

## 三、审计与安全

### 认证与授权

- **机制**：JWT（HS256）+ Spring Security 过滤器链。登录 `/api/auth/login` 签发 token，前端在 `Authorization: Bearer <token>` 携带。
- **角色**：`admin` / `user`，权限在 `SecurityConfig` 用 `requestMatchers(...).hasRole(...)` 控制；越权返回 403。
- **登出**：token 写入 Redis 黑名单（`cache:token:blacklist:<jwt>`），有效期内失效，需 Redis 可用。
- **生产要点**：
  - JWT 密钥长度 ≥ 256 bit，且通过 `JWT_SECRET` 环境变量注入，**绝不入库**。
  - token 有效期按场景收紧（管理后台可短至 30~60 分钟 + 刷新机制）。
  - 生产开启 `useSSL=true`，DB/Redis 密码来自密钥管理（Vault / K8s Secret / CI Secret）。

### 审计日志

- **落库**：`operation_log` 表，由 `OperationLogService.log()` 写入，使用 `Propagation.REQUIRES_NEW` **独立事务**，即使主业务回滚也保留。
- **覆盖动作**：登录（`LOGIN`）、工单（`WORK_ORDER`）、用户（`USER`）、设备（`DEVICE`）等。对外查询接口 `GET /api/logs`（需认证）。
- **生产增强建议**：
  - 关键写操作统一通过切面（`@LogOperation`）采集，避免遗漏。
  - 审计表按时间分表/归档，长期保留用于合规追溯。
  - 接入集中日志（Loki/ELK），`logging.pattern` 已统一格式。

### 安全基线检查清单

- [ ] JWT 密钥来自环境变量，长度合规
- [ ] MySQL/Redis **不暴露公网**，仅容器/内网
- [ ] Nginx 开启 HTTPS（TLS），HTTP 重定向 443
- [ ] `spring.sql.init.mode=never`（生产）
- [ ] 日志级别 `info`（非 `debug`）
- [ ] 依赖漏洞扫描（见 CI）

---

## 四、测试策略

### 后端（JUnit 5 + Mockito）

- 位置：`apps/backend-server/src/test/`
- 分层：
  - 单元：`JwtTokenProviderTest`、`CacheAsideServiceTest`（缓存策略）
  - 服务：`AuthServiceTest`、`WorkOrderServiceTest`（事务传播）
  - 接口：`MonitorControllerTest`、`GlobalExceptionHandlerTest`（@WebMvcTest + MockMvc）
- 运行：`cd apps/backend-server && mvn test`（需 MySQL 3307 + Redis 6379 可用，或 CI service container）
- 当前用例：**24 个，全绿**（CI 在 service container 中跑）。

### 前端

- 构建即校验：`npm run build:*` 失败即阻断（`vue-tsc` / 模板编译错误会暴露）。
- 建议补齐（可选）：Vitest 组件测试 + Playwright E2E，纳入 CI。

### 质量门禁

| 维度 | 门槛 | 执行点 |
|------|------|--------|
| 后端单测 | 全量通过，覆盖率 ≥ 60%（目标） | CI `mvn test` |
| 前端构建 | 三端 build 成功 | CI `npm run build:*` |
| 依赖漏洞 | 无 High/Critical | CI `mvn dependency-check` / `npm audit`（建议加） |
| 接口契约 | 登录→日志链路冒烟通过 | Staging 验收 |

---

## 五、预生产环境（Staging）

### 目标

- 无限接近生产的**隔离**环境，用于发布前验收、回归、演示。
- 数据独立（独立库/独立命名空间），禁止直连生产数据。

### 推荐拓扑（容器编排）

```
                 ┌──────────── Nginx (staging.example.com) ────────────┐
                 │  /admin  /dashboard  /patrol  → 静态                │
                 │  /api/*  → backend:8080     /ws/* → backend:8080    │
                 └───────────────────────┬────────────────────────────┘
                                          │
                 ┌────────────────────────┼───────────────────────────┐
                 │   backend (jar/容器, profile=staging)               │
                 │      │                          │                   │
                 │   mysql:3306 (iot_backend_staging)   redis:6379     │
                 └─────────────────────────────────────────────────────┘
```

### 部署清单（Staging）

| 项 | 值 |
|----|----|
| 镜像/包 | `iot-backend:staging-<git-sha>`；前端 `dist` 按 `<sha>` 落盘 |
| profile | `staging`（`application-staging.yml`，数据源指向 staging 库） |
| DB | 独立库 `iot_backend_staging`，初始化用迁移脚本（非 `sql.init` 自动） |
| 域名 | `staging.example.com`（HTTPS） |
| 触发 | `main` 合并后 CI 自动部署 |

### 数据库迁移

- 当前用 `schema.sql`+`data.sql`（`sql.init.mode: always`）。**生产/Staging 建议引入 Flyway/Liquibase**：
  - 在 `pom.xml` 加 `spring-boot-starter-flyway`，迁移脚本放 `db/migration/V1__init.sql`。
  - 关闭 `sql.init.mode`，由 Flyway 幂等迁移。
- Staging 首次建库后，迁移脚本只增不改，保证可重复部署。

### 验收冒烟清单（Staging）

- [ ] 后端 `/actuator/health`（若启用）返回 UP
- [ ] 登录 `admin/admin123` 拿到 token，写 `LOGIN` 审计日志
- [ ] `GET /api/logs` 返回分页，`bizType` 过滤生效
- [ ] monitor-dashboard WS 握手 101，收到设备状态推送
- [ ] admin-system 菜单「操作日志」数据正常渲染
- [ ] patrol-app 经 MQTT 收到 `iot/device/+/status`（或降级 WS+DB 正常）

### 回滚预案

- 后端：保留上一版镜像 tag，回滚 = 重启上一镜像；DB 迁移需配套 `undo` 脚本（Flyway `undo` 或手动）。
- 前端：Nginx `root` 指向上一版 `dist` 目录，秒级切换。
- 蓝绿/金丝雀（进阶）：两套 backend 副本 + Nginx 权重切换。

---

## 六、持续集成（CI）

> 工作流文件见仓库 `.github/workflows/ci.yml`（前后端）、`.github/workflows/deploy-staging.yml`（自动部署）。

### 前端 + 后端 CI（`ci.yml`）

- 触发：`push` 到 `main`、`pull_request`
- 后端 job：`ubuntu-latest` + MySQL/Redis service container + `mvn -B test`
- 前端 job：`setup-node@18` + `npm ci` + 三端 `build`
- 产物：构建缓存、测试报告

### 预生产自动部署（`deploy-staging.yml`）

- 触发：`main` 推送成功且 `ci.yml` 通过
- 动作（示例）：构建后端镜像并推仓库、SSH 到 Staging 主机 `docker compose pull && up -d`、同步前端 `dist` 到 Nginx 目录
- 密钥：`secrets.DOCKERHUB_USERNAME`、`secrets.SSH_KEY` 等，均在仓库 Settings 配置

### 流水线示意

```
push main ──► ci.yml ──► 后端 mvn test ─┐
                └──────► 前端 npm build ─┴──► 全绿 ──► deploy-staging.yml ──► Staging 自动部署
```

---

## 七、生产上线步骤（Step-by-Step）

### 后端（Docker 镜像，推荐）

```bash
cd apps/backend-server
docker build -t iot-backend:1.0.0 .
# 运行（secrets 来自 env）
docker run -d --name iot-backend --network iot-net -p 8080:8080 \
  -e JWT_SECRET="<256bit>" -e DB_USERNAME=iot -e DB_PASSWORD=*** -e REDIS_PASSWORD= \
  -e SPRING_PROFILES_ACTIVE=prod iot-backend:1.0.0
```

或直接 jar：`java -jar iot-backend.jar --spring.profiles.active=prod`（需宿主机有 JDK17 + MySQL + Redis）。

### 前端（静态托管）

```bash
npm ci
npm run build:admin && npm run build:dashboard && npm run build:patrol
# 将三个 dist/ 同步到 Nginx 对应目录
rsync -a apps/admin-system/dist/  staging:/srv/www/admin-system/
rsync -a apps/monitor-dashboard/dist/ staging:/srv/www/monitor-dashboard/
rsync -a apps/patrol-app/dist/build/h5/ staging:/srv/www/patrol-app-h5/
```

### 启动顺序

1. MySQL / Redis 就绪（healthcheck 通过）
2. 后端（依赖 DB/Redis，建连成功才提供流量）
3. Nginx（反代 `/api`、`/ws` 到后端）
4. 前端静态资源就位

### 健康检查

```bash
curl -f http://localhost:8080/actuator/health || echo "backend not ready"
curl -f https://staging.example.com/admin/       && echo "admin ok"
curl -f https://staging.example.com/dashboard/    && echo "dashboard ok"
```

---

## 八、速查清单

- [ ] JDK17 / Node18 / Docker 就绪
- [ ] MySQL(3306) + Redis(6379) 容器内网可达
- [ ] `JWT_SECRET` 注入，`sql.init.mode=never`
- [ ] 后端 `mvn test` 全绿 → `ci.yml` 通过
- [ ] 前端三端 `build` 成功
- [ ] Nginx 配 `/api`、`/ws` + HTTPS
- [ ] Staging 冒烟清单全过
- [ ] 回滚预案就绪
