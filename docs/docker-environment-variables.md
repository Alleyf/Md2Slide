# Docker 环境变量配置指南

本文档详细介绍如何在 Docker 部署中配置和使用环境变量。

## 概述

Md2Slide 支持多种环境变量配置方式，主要分为构建时环境变量和运行时环境变量。由于这是一个前端应用，环境变量主要用于在构建时注入配置信息。

## 支持的环境变量

| 环境变量 | 描述 | 默认值 | 作用范围 |
|----------|------|--------|----------|
| VITE_AI_PROVIDER | AI服务提供商 | openai | 构建时 |
| VITE_AI_MODEL | AI模型名称 | gpt-3.5-turbo | 构建时 |
| VITE_AI_API_KEY | AI服务API密钥 | (无) | 构建时 |
| VITE_AI_BASE_URL | AI服务基础URL | https://api.openai.com/v1 | 构建时 |
| NODE_ENV | Node环境 | production | 构建时 |

## 配置方式

### 1. 构建时配置

构建时环境变量在 `docker build` 过程中注入到应用程序中：

```bash
# 单个变量
docker build -t md2slide \
  --build-arg VITE_AI_PROVIDER=anthropic \
  --build-arg VITE_AI_MODEL=claude-3-haiku-20240307 \
  --build-arg VITE_AI_API_KEY=your_api_key \
  --build-arg VITE_AI_BASE_URL=https://api.anthropic.com/v1 .

# 使用环境变量文件
docker build -t md2slide --build-arg-file=.env .
```

### 2. Docker Compose 配置

使用 Docker Compose 可以同时配置构建时和运行时环境变量：

```yaml
version: '3.8'
services:
  md2slide:
    build:
      context: .
      args:  # 构建时环境变量
        - VITE_AI_PROVIDER=${VITE_AI_PROVIDER:-openai}
        - VITE_AI_MODEL=${VITE_AI_MODEL:-gpt-3.5-turbo}
        - VITE_AI_API_KEY=${VITE_AI_API_KEY}
        - VITE_AI_BASE_URL=${VITE_AI_BASE_URL:-https://api.openai.com/v1}
    environment:  # 运行时环境变量
      - NODE_ENV=production
```

### 3. 运行时配置（有限支持）

对于前端应用，运行时环境变量主要用于构建时已注入的值。要更改这些值，需要重新构建镜像。

## 最佳实践

### 1. 安全性考虑

- **敏感信息**：避免在构建时将敏感信息（如API密钥）硬编码到镜像中
- **公开部署**：如果镜像是公开的，不要包含任何敏感信息
- **多环境**：为不同环境（开发、测试、生产）使用不同的环境变量

### 2. 配置管理

- **环境文件**：使用 `.env.example` 作为模板，创建 `.env` 文件
- **版本控制**：`.env` 文件不应加入版本控制系统
- **默认值**：为所有环境变量提供合理的默认值

### 3. 故障排除

- **检查构建日志**：确认环境变量是否正确注入
- **验证运行时**：检查构建后的文件中是否包含期望的配置
- **重新构建**：更改环境变量后必须重新构建镜像

## 示例配置

### .env 文件示例

```bash
# AI服务配置
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4-turbo
VITE_AI_API_KEY=sk-your-api-key-here
VITE_AI_BASE_URL=https://api.openai.com/v1
```

### Docker Compose 完整示例

```yaml
version: '3.8'
services:
  md2slide:
    build:
      context: .
      args:
        - VITE_AI_PROVIDER=${VITE_AI_PROVIDER:-openai}
        - VITE_AI_MODEL=${VITE_AI_MODEL:-gpt-3.5-turbo}
        - VITE_AI_API_KEY=${VITE_AI_API_KEY}
        - VITE_AI_BASE_URL=${VITE_AI_BASE_URL:-https://api.openai.com/v1}
    ports:
      - "8080:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/nginx
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

## 常见问题

### Q: 为什么更改运行时环境变量不起作用？
A: 前端应用的环境变量在构建时就被注入到JavaScript文件中，运行时更改不会影响已构建的应用。

### Q: 如何在不重新构建的情况下更改配置？
A: 对于需要运行时更改的配置，考虑：
1. 通过API接口动态获取配置
2. 使用配置文件（如JSON文件）在运行时读取
3. 使用反向代理注入配置

### Q: 敏感信息应该如何处理？
A: 建议：
1. 在构建时不包含敏感信息
2. 通过API接口在运行时获取敏感信息
3. 使用后端服务处理敏感操作