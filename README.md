# MeetReserve

会议室预约管理系统。支持日程网格视图、在线预约/修改/取消、空闲会议室智能推荐，以及管理员对会议室和用户的维护与 Excel 批量导入。

## 功能特性

- **日程视图**：横轴时间（08:00–20:00，30 分钟粒度）、纵轴会议室，甘特图式展示占用情况
- **预约管理**：新建、修改、取消预约，自动冲突检测
- **智能推荐**：按日期和时段推荐空闲会议室，无空闲时提示改时间
- **我的预约**：个人预约列表，支持 Modal 快速新建
- **管理员**：会议室 / 用户 CRUD，Excel 批量导入
- **响应式布局**：适配桌面、平板、手机端

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Spring Boot 2.7、MyBatis-Plus、Spring Security、JWT、MySQL 8、Apache POI |
| 前端 | React 18、TypeScript、Vite、Ant Design 5、Redux Toolkit、dayjs |
| 部署 | Docker、Docker Compose、Nginx |

## 项目结构

```
MeetReserve/
├── backend/                 # Spring Boot 后端
│   ├── src/main/java/       # 业务代码
│   ├── src/main/resources/  # 配置与数据库脚本
│   └── Dockerfile
├── frontend/                # React 前端
│   ├── src/                 # 页面与组件
│   ├── nginx.conf           # 生产环境 Nginx 配置
│   └── Dockerfile
├── docs/                    # 技术方案与界面设计文档
├── deploy/                  # 部署说明
├── docker-compose.yml       # Docker 一键编排
└── .env.example             # 环境变量模板
```

## 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 | 5000 | 开发 / Docker 对外访问 |
| 后端 | 9000 | Spring Boot API |
| MySQL | 3306 | 数据库（Docker 内网，不对外暴露） |

## 快速开始（本地开发）

### 环境要求

- JDK 8+
- Maven 3.6+
- Node.js 18+
- MySQL 8.0+

### 1. 初始化数据库

```bash
mysql -u root -p < backend/src/main/resources/db/schema.sql
```

默认连接配置见 `backend/src/main/resources/application-dev.yml`（`root / 123456`）。

### 2. 启动后端

```bash
cd backend
mvn spring-boot:run
```

后端地址：http://localhost:9000

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端地址：http://localhost:5000（开发模式自动代理 `/api` → `9000`）

### 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | admin123 | 管理员 |
| user | user123 | 普通用户 |

## Docker 部署（推荐）

```bash
# 1. 复制并修改环境变量
cp .env.example .env

# 2. 构建并启动
docker compose up -d --build

# 3. 查看状态
docker compose ps
```

访问：http://服务器IP:5000

常用命令：

```bash
docker compose logs -f backend    # 查看后端日志
docker compose down               # 停止服务
docker compose down -v            # 停止并清空数据库（慎用）
docker compose up -d --build      # 更新后重新构建
```

详细说明见 [deploy/README.md](./deploy/README.md)。

## 主要页面

| 路由 | 说明 | 权限 |
|------|------|------|
| `/schedule` | 日程视图 | 所有用户 |
| `/my-bookings` | 我的预约 | 所有用户 |
| `/admin/rooms` | 会议室管理 | 管理员 |
| `/admin/users` | 用户管理 | 管理员 |

## Excel 导入

管理员可在「会议室管理」「用户管理」页面下载模板并批量导入。

**会议室模板列**：名称、位置、容量、设备、状态(0/1)、备注

**用户模板列**：用户名、密码、姓名、角色(USER/ADMIN)、状态(0/1)

## 文档

- [技术方案](./docs/技术方案.md)
- [界面设计文档](./docs/界面设计文档.md)
- [Docker 部署说明](./deploy/README.md)

## 生产环境建议

1. 修改 `.env` 中的 `MYSQL_ROOT_PASSWORD`、`MYSQL_PASSWORD`、`JWT_SECRET`
2. 修改默认管理员密码
3. 使用 HTTPS（可在宿主机 Nginx 前加一层反向代理）
4. 定期备份 MySQL 数据卷 `mysql_data`
