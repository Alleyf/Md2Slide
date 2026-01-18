# 使用多阶段构建优化镜像大小
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 为构建设置环境变量（如果需要的话）
ARG VITE_AI_PROVIDER
ARG VITE_AI_MODEL
ARG VITE_AI_API_KEY
ARG VITE_AI_BASE_URL

# 构建应用
RUN npm run build

# 生产环境运行阶段
FROM nginx:alpine

# 复制构建产物到nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制自定义nginx配置（如果存在）
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]