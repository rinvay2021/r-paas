# ── 构建阶段 ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN npm install -g pnpm

WORKDIR /app

# 复制 workspace 配置和根依赖
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ ./packages/
COPY app/ ./app/

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 先构建共享包（apps 依赖它们）
RUN pnpm build:shared && pnpm build:meta

# 构建三个应用
RUN pnpm build:admin && pnpm build:portal && pnpm build:renderer

# ── 运行阶段（Nginx 静态服务） ────────────────────────────────────────────────
FROM nginx:1.25-alpine AS runner

# 删除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制三个应用的构建产物
COPY --from=builder /app/app/admin/dist    /usr/share/nginx/html/admin
COPY --from=builder /app/app/portal/dist   /usr/share/nginx/html/portal
COPY --from=builder /app/app/renderer/dist /usr/share/nginx/html/renderer

EXPOSE 80 8081 8082
# 80=portal  8081=admin  8082=renderer

CMD ["nginx", "-g", "daemon off;"]
