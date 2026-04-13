# R-PaaS 前端

R-PaaS 平台前端，基于 **React + TypeScript + Ant Design** 的 pnpm monorepo，包含管理后台、门户应用、渲染器三个应用及两个共享包。

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.2.x | UI 框架 |
| TypeScript | 5.0.x | 开发语言 |
| Ant Design | 5.22.x | 组件库 |
| Vite | 4.x | 构建工具 |
| Jotai | 2.16.x | 原子化状态管理 |
| React Router | 6.10.x | 路由 |
| ahooks | 3.8.x | React Hooks 工具库 |
| pnpm workspace | 8.x | Monorepo 包管理 |

---

## 项目结构

```
r-paas/
├── app/
│   ├── admin/       # 管理后台 (@r-paas/admin)    开发端口 3003
│   ├── portal/      # 门户应用 (@r-paas/portal)   开发端口 3004
│   └── renderer/    # 渲染器   (@r-paas/renderer)  开发端口 3005
├── packages/
│   ├── meta/        # 元数据核心类型库 (@r-paas/meta)
│   └── shared/      # 共享工具库 (@r-paas/shared)
│       ├── http/    # Axios HTTP 客户端封装（带 Token 拦截器）
│       ├── storage/ # localStorage 封装
│       └── moment/  # dayjs 日期工具
├── pnpm-workspace.yaml
└── package.json     # 根 package，统一管理脚本和公共依赖
```

---

## 应用说明

### Admin 管理后台（端口 3003）

核心配置应用，提供完整的元数据可视化配置能力：

- **字段管理**：创建、编辑、删除字段，支持文本、数字、日期、选择、上传等 18 种字段类型
- **表单设计器**：拖拽式表单布局，支持多容器、多列配置
- **列表设计器**：配置列表展示字段、列宽、排序
- **搜索表单设计器**：配置搜索条件和筛选规则
- **视图配置**：组合搜索表单 + 列表形成完整可用的视图
- **详情页设计器**：配置详情页布局，支持子对象关联
- **功能按钮配置**：配置新建、编辑、删除、批量操作等按钮
- **菜单配置**：配置应用导航菜单，关联视图
- **AI 元数据助手**：通过自然语言一键生成完整业务模块（字段 + 表单 + 列表 + 视图 + 按钮 + 菜单）

### Portal 门户应用（端口 3004）

用户访问入口，展示配置好的应用列表，提供业务数据的增删改查操作界面。

### Renderer 渲染器（端口 3005）

低代码运行时核心，根据元数据配置动态渲染业务页面。

---

## 本地开发

### 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0
- 后端服务已在 `http://localhost:8080` 运行（所有前端应用均代理到此地址）

### 1. 安装依赖

```bash
# 在 r-paas 目录下执行，pnpm 会自动安装所有 workspace 包的依赖
pnpm install
```

### 2. 构建共享包

**首次使用或修改了 packages/ 下的代码后需要执行：**

```bash
pnpm build:shared
pnpm build:meta
```

### 3. 启动开发服务器

```bash
pnpm dev:admin      # 管理后台，访问 http://localhost:3003
pnpm dev:portal     # 门户应用，访问 http://localhost:3004
pnpm dev:renderer   # 渲染器，  访问 http://localhost:3005
```

---

## 完整命令参考

```bash
# ── 开发 ──────────────────────────────────────────────────────────────────
pnpm dev:admin          # 启动管理后台（端口 3003）
pnpm dev:portal         # 启动门户应用（端口 3004）
pnpm dev:renderer       # 启动渲染器（端口 3005）

# ── 构建 ──────────────────────────────────────────────────────────────────
pnpm build:shared       # 构建共享工具库（packages/shared）
pnpm build:meta         # 构建元数据核心库（packages/meta）
pnpm build:admin        # 构建管理后台 → app/admin/dist/
pnpm build:portal       # 构建门户应用 → app/portal/dist/
pnpm build:renderer     # 构建渲染器   → app/renderer/dist/

# ── 代码质量 ──────────────────────────────────────────────────────────────
pnpm lint               # ESLint 检查
pnpm lint:fix           # ESLint 自动修复
pnpm lint:style         # Stylelint 样式检查
pnpm lint:style:fix     # Stylelint 自动修复
pnpm type-check         # TypeScript 类型检查

# ── 测试 ──────────────────────────────────────────────────────────────────
pnpm test               # 运行测试
pnpm test:coverage      # 测试覆盖率报告

# ── 其他 ──────────────────────────────────────────────────────────────────
pnpm clean              # 清理所有 node_modules
pnpm commit             # 规范化 Git 提交（Commitizen）
```

---

## 端口速查

**本地开发：**

| 服务 | 端口 |
|------|------|
| 后端 API | 8080 |
| Admin | 3003 |
| Portal | 3004 |
| Renderer | 3005 |

**生产部署：**

| 服务 | 端口 |
|------|------|
| 后端 API | 8080 |
| Portal | 80 |
| Admin | 8081 |
| Renderer | 8082 |

---

## 共享包

### @r-paas/shared

基础工具，所有应用共用：

```ts
import { HttpRequest } from '@r-paas/shared/http'    // Axios 封装，带 Token 拦截器
import { storage } from '@r-paas/shared/storage'     // localStorage 工具
import { formatDate } from '@r-paas/shared/moment'   // dayjs 日期工具
```

### @r-paas/meta

元数据类型定义与核心工具，供 Admin 和 Renderer 共用。

---

## Git 提交规范

使用 Commitizen 规范化提交信息：

```bash
pnpm commit
```

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式调整（不影响逻辑） |
| `refactor` | 代码重构 |
| `test` | 测试相关 |
| `chore` | 构建 / 工具链相关 |

---

## 生产部署

完整部署流程见根目录 [DEPLOY.md](../DEPLOY.md)。

---

## 许可证

[MIT](./LICENSE)
