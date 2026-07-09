# MeetReserve Docker 部署

## 环境要求

- Docker 20+
- Docker Compose v2+

## 快速启动

```bash
# 1. 进入项目根目录
cd MeetReserve

# 2. 复制环境变量（可按需修改密码和 JWT 密钥）
cp .env.example .env

# 3. 构建并启动
docker compose up -d --build

# 4. 查看状态
docker compose ps
docker compose logs -f backend
```

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://服务器IP:5000 |
| 后端 API | http://服务器IP:9000/api（一般仅调试，生产走 Nginx 代理） |

## 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 管理员 |
| user | user123 | 普通用户 |

首次启动后后端会自动初始化示例数据。

## 常用命令

```bash
# 停止
docker compose down

# 停止并删除数据卷（会清空数据库）
docker compose down -v

# 仅重建某个服务
docker compose up -d --build backend
docker compose up -d --build frontend

# 查看日志
docker compose logs -f
docker compose logs -f mysql backend frontend
```

## 架构说明

```
浏览器 → frontend(Nginx:5000) → /api 代理 → backend:9000 → mysql:3306
```

- **frontend**：Nginx 托管 React 静态文件，并将 `/api` 转发到后端
- **backend**：Spring Boot，端口 9000
- **mysql**：MySQL 8，数据持久化在 `mysql_data` 卷

## 生产建议

1. 修改 `.env` 中的 `MYSQL_ROOT_PASSWORD`、`MYSQL_PASSWORD`、`JWT_SECRET`
2. 不要将 MySQL 3306 端口映射到公网（当前 compose 未对外暴露）
3. 前端 5000 端口前可加一层宿主机 Nginx / 负载均衡并配置 HTTPS
4. 定期备份 `mysql_data` 数据卷

## 更新发布

```bash
git pull
docker compose up -d --build
```
