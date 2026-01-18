<div align="center">

![md2slide](https://img.shields.io/badge/md2slide-v1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF)
![License](https://img.shields.io/badge/License-MIT-green)



# Md2Slide

<img src="public/logo.jpg" width="30%" height="30%" alt="coverage">

<p align="center">
  <img src="docs/demo.gif" width="600" alt="功能演示"/>
</p>


### 🎨 3Blue1Brown 风格幻灯片生成器

**用 Markdown 快速创建精美的数学与技术演示文稿**

[![GitHub stars](https://img.shields.io/github/stars/alleyf/md2slide?style=social)](https://github.com/alleyf/md2slide)
[![GitHub forks](https://img.shields.io/github/forks/alleyf/md2slide?style=social)](https://github.com/alleyf/md2slide)
[![GitHub issues](https://img.shields.io/github/issues/alleyf/md2slide)](https://github.com/alleyf/md2slide/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/alleyf/md2slide/pulls)

[在线演示](https://md2-slide.vercel.app/) • [快速开始](#-快速开始) • [使用指南](#-使用指南) • [部署指南](#-部署指南)

![Alt](https://repobeats.axiom.co/api/embed/9ceba9cb70a482471450ba7d435104b8582d4d2a.svg "Repobeats analytics image")

</div>


---
## ✨ 特性概览

| 特性 | 描述 | 状态 |
|------|------|------|
| 🎨 **3Blue1Brown 视觉风格** | 深色背景、明亮配色与优雅的排版 | ✅ 已实现 |
| ⚡ **实时预览** | 左侧编辑 Markdown，右侧实时更新幻灯片 | ✅ 已实现 |
| 🌓 **主题切换** | 深色/浅色主题一键切换，持久化保存 | ✅ 已实现 |
| 📊 **数学公式支持** | 完美集成 LaTeX，支持块级和行内公式 | ✅ 已实现 |
| 💻 **代码语法高亮** | 内置多种编程语言的代码展示支持 | ✅ 已实现 |
| 🎬 **视频和图片** | 居中显示，响应式布局 | ✅ 已实现 |
| 🎮 **动态交互** | 支持内容逐步显示（Click-to-reveal）和键盘导航 | ✅ 已实现 |
| 📥 **一键导入** | 支持导入本地 `.md` 和 `.html` 文件 | ✅ 已实现 |
| 🚀 **一键部署** | 支持 Vercel、Netlify 等平台快速部署 | ✅ 已实现 |
| 🎭 **自动动画** | 跨幻灯片元素智能匹配与过渡动画 | ✅ 已实现 |
| 🔌 **插件系统** | 支持第三方插件扩展功能 | ✅ 已实现 |
| 🤖 **AI 助手** | 智能内容生成与优化建议 | ✅ 已实现 |
| 🎨 **主题市场** | 丰富的主题模板选择 | ✅ 已实现 |
| 🎵 **背景音乐** | 沉浸式音频体验与可视化效果 | ✅ 已实现 |
| 🎯 **可拖动播放器** | 音乐播放器可拖动并吸附到屏幕边缘 | ✅ 已实现 |
| ♻️ **循环播放** | 音乐播放结束后自动循环播放 | ✅ 已实现 |
| 🎚️ **简约收起** | 收起状态下只显示音乐图标，简约美观 | ✅ 已实现 |
| 🎶 **播放列表** | 支持播放列表，可切换不同音乐 | ✅ 已实现 |
| 🎨 **UI优化** | 美化的播放器UI，更加小巧精致 | ✅ 已实现 |
| 🖱️ **改进拖动** | 有专用拖动区域，操作更便捷 | ✅ 已实现 |

### 核心功能展示

```markdown
# 梯度下降算法
## 核心概念
寻找函数最小值的迭代方法

### 公式表示
$$\theta = \theta - \alpha \cdot \nabla J(\theta)$$

其中：
- $\theta$ 是参数
- $\alpha$ 是学习率
- $\nabla J(\theta)$ 是梯度

!icon(📉)
```

### HTML 导入示例

你也可以直接导入 HTML 文件并将其嵌入到幻灯片中：

```html
!html(
<div style="text-align: center; padding: 20px;">
  <h2>嵌入的 HTML 内容</h2>
  <p>这是从外部 HTML 文件导入的内容</p>
  <button style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 4px;">
    交互按钮
  </button>
</div>
)
```

> **渲染效果**：
> - 美观的数学公式渲染
> - 列表项逐步显示动画
> - 精致的图标装饰

---

## 📸 预览截图

### 深色主题
![深色主题](https://img.shields.io/badge/主题-深色模式-1a1a2e)

```
┌─────────────────────────────────────┐
│  ☀️ md2slide                        │
├─────────────────┬───────────────────┤
│                 │                   │
│   Markdown 编辑  │   幻灯片预览       │
│                 │                   │
│  # 标题         │  ┌─────────────┐ │
│  ---            │  │   标题      │ │
│  - 列表         │  └─────────────┘ │
│                 │                   │
│                 │  • 列表项1       │
│                 │  • 列表项2       │
└─────────────────┴───────────────────┘
```

### 浅色主题
![浅色主题](https://img.shields.io/badge/主题-浅色模式-f8f9fa)

```
┌─────────────────────────────────────┐
│  🌙 md2slide                        │
├─────────────────┬───────────────────┤
│                 │                   │
│   Markdown 编辑  │   幻灯片预览       │
│                 │   (明亮配色)      │
│                 │                   │
└─────────────────┴───────────────────┘
```

---

## 🚀 快速开始

### 环境要求

- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0 或 **yarn**: >= 1.22.0
- **Git**: >= 2.0.0

### 安装步骤

#### 1. 克隆项目

```bash
# 使用 HTTPS
git clone https://github.com/alleyf/md2slide.git

# 使用 SSH
git clone git@github.com:alleyf/md2slide.git

# 进入项目目录
cd md2slide
```

#### 2. 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

#### 3. 启动开发服务器

```bash
npm run dev
```

启动后，访问 `http://localhost:3000` 即可开始创作！

### 构建生产版本

```bash
# 构建项目
npm run build

# 预览生产构建
npm run preview
```

---

## 📖 使用指南

### Markdown 语法速查

| 语法 | 用途 | 示例 | 渲染效果 |
|------|------|------|----------|
| `# 标题` | 一级标题 | `# 演示标题` | 大标题 |
| `## 标题` | 二级标题 | `## 副标题` | 副标题 |
| `---` | 幻灯片分隔符 | `---` | 新页面 |
| `- 列表` | 无序列表 | `- 第一点` | • 第一点 |
| `$$公式$$` | 块级公式 | `$$a^2+b^2=c^2$$` | 数学公式 |
| `$公式$` | 行内公式 | `$x=1$` | 行内公式 |
| `!icon(😊)` | 图标 | `!icon(🚀)` | 🚀 |
| `!video(url)` | 视频 | `!video(link.mp4)` | 播放器 |
| `![alt](url)` | 图片 | `![img](link.png)` | 图片 |

### 幻灯片结构示例

```markdown
# 第一页幻灯片

这是开场白内容

---

# 第二页幻灯片

## 副标题

- 重点 1
- 重点 2
- 重点 3

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

---

# 第三页幻灯片

## 代码示例

```python
def hello():
    print("Hello, World!")
```

!icon(🎉)
```

### 高级功能

#### 1. 数学公式

**行内公式**：
```markdown
勾股定理：$a^2 + b^2 = c^2$
```

**块级公式**：
```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

**支持的 LaTeX 命令**：
- 基础运算：`+`, `-`, `*`, `/`, `^`, `_`
- 函数：`\frac`, `\sqrt`, `\sum`, `\int`
- 矩阵：`\begin{pmatrix} ... \end{pmatrix}`
- 希腊字母：`\alpha`, `\beta`, `\theta`, `\pi`

#### 2. 代码高亮

```markdown
```python
def gradient_descent(X, y, theta, alpha, iterations):
    m = len(y)
    for i in range(iterations):
        prediction = X.dot(theta)
        errors = prediction - y
        gradients = (1/m) * X.T.dot(errors)
        theta = theta - alpha * gradients
    return theta
```
```

#### 3. 图片和视频

```markdown
# 图片
![网络架构](https://example.com/image.png)

# 视频
!video(https://www.w3schools.com/html/mov_bbb.mp4)
```

#### 4. 自定义 HTML

```markdown
!html(<div style="color: red;">红色文字</div>)
```

#### 5. 自动动画 (Auto-Animation)

在元素上添加注释来启用自动动画，实现跨幻灯片的平滑过渡：

```markdown
<!-- auto-animate -->
# 标题 1

<!-- auto-animate: type=move, duration=800 -->
- 列表项 1
- 列表项 2

<!-- data-id: unique-element -->
这是一个在多个幻灯片间保持连续性的元素
```

支持的参数：
- `type`: move, scale, fade, transform
- `duration`: 动画持续时间（毫秒）
- `easing`: 缓动函数

#### 6. 插件系统

通过插件系统扩展功能，如代码执行、图表生成等：

```markdown
# 可执行代码块示例

```js {run}
console.log('Hello, World!');
```

点击"Run"按钮执行代码并查看结果.
```

#### 7. AI 助手

使用AI助手来优化您的内容、生成摘要或改进建议：

1. 点击顶部菜单栏的 💡 图标打开AI助手
2. 选择功能标签页：通用功能、内容优化、幻灯片生成或AI设置
3. 在AI设置标签页中可以测试AI配置是否有效
4. 输入您的内容或使用当前文档内容
5. 点击相应按钮获取AI生成的结果
6. 点击"应用到文档"将结果插入到编辑器中

AI助手提供以下功能：
- 内容总结：快速提取文本要点
- 要点提取：识别并列出关键信息
- 内容改进：优化表达和专业术语
- 幻灯片生成：将长文本转换为幻灯片大纲
- AI配置测试：一键测试AI配置是否有效

### AI 配置测试

在设置面板或通过顶部菜单栏的AI助手中，在AI设置标签页中，你可以测试当前AI配置是否有效：

- 点击 "🧪 测试配置" 按钮
- 系统会向你配置的AI服务发送一个简单的测试请求
- 如果配置正确，会显示 "AI配置测试成功" 提示
- 如果配置有误，会显示具体的错误信息

#### 8. 主题市场

通过主题市场选择和应用不同的视觉主题：

1. 点击顶部菜单栏的 🧩 图标打开主题市场
2. 浏览可用主题或使用搜索功能
3. 查看主题预览和详细信息（包括可视化预览）
4. 点击"安装"按钮下载主题（市场主题）
5. 在"已安装"标签页中点击"应用"按钮应用所选主题

主题市场提供多种预设主题，包括：
- 极简主题：专注内容的简洁设计
- 学术主题：适合学术演示的专业风格
- 赛博朋克主题：现代科技感的炫酷外观
- 演示主题：经典商务演示风格
- 深色主题：护眼深色模式，适合低光环境
- 创意主题：富有创意和视觉冲击力的设计

主题市场还提供主题详情页面，展示主题的预览效果和使用说明。

#### 9. 插件市场

通过插件市场扩展应用功能：

1. 点击顶部菜单栏的 🧩 拼图图标打开插件市场
2. 浏览可用插件或使用搜索功能
3. 查看插件详情和功能说明（包括可视化预览）
4. 点击"启用"按钮激活插件
5. 点击"禁用"按钮停用插件

插件市场提供多种实用插件，包括：
- 图表制作器：创建流程图、架构图和其他图表
- 数学公式渲染器：高级数学公式渲染和编辑工具
- 代码高亮增强：支持更多语言和主题的代码高亮
- 媒体嵌入工具：轻松嵌入视频、音频和其他媒体内容
- 协作编辑：多人实时协作编辑功能
- 导出增强：支持更多格式的导出选项

插件市场还提供插件详情页面，展示插件的功能特性和使用说明。

---

## 🎮 交互操作

### 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `空格` 或 `→` | 下一步 / 下一页 |
| `←` | 上一步 / 上一页 |
| `点击` | 逐步显示内容 |

### 主题切换

点击右上角的 ☀️/🌙 图标即可切换深色/浅色主题，主题偏好会自动保存到本地存储。

---

## 🔧 技术栈

### 前端框架

```mermaid
graph LR
    A[React 18.2.0] --> B[TypeScript]
    A --> C[React Markdown]
    A --> D[KaTeX]
    E[Vite 7.3.1] --> A
```

### 核心依赖

| 包名 | 版本 | 用途 |
|------|------|------|
| React | ^18.2.0 | UI 框架 |
| Vite | ^7.3.1 | 构建工具 |
| React-Markdown | ^10.1.0 | Markdown 解析 |
| KaTeX | ^0.16.27 | 数学公式渲染 |
| React-Syntax-Highlighter | ^16.1.0 | 代码高亮 |
| Lucide-React | ^0.562.0 | 图标库 |
| Emotion | ^11.14.0 | 样式管理 |
| Remotion | ^4.0.0 | 视频导出 |

### 开发工具

| 包名 | 用途 |
|------|------|
| TypeScript | 类型检查 |
| ESLint | 代码规范 |
| Prettier | 代码格式化 |
| Vitest | 单元测试 |

---

## 🚀 部署指南


[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAlleyf%2FMd2Slide&project-name=Md2Slide&repository-name=Md2Slide)
&nbsp;&nbsp;
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/Alleyf/Md2Slide)


### 一键部署到 Vercel

#### 方式一：通过 GitHub 自动部署（推荐）

1. **推送代码到 GitHub**

```bash
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/alleyf/md2slide.git
git push -u origin main
```

2. **连接到 Vercel**

- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 选择 GitHub 仓库 `md2slide`
- 点击 "Import"

3. **配置部署设置**

```
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. **点击 "Deploy"**

几秒钟后，您的幻灯片应用就会上线！🎉

#### 方式二：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel

# 生产环境部署
vercel --prod
```

---

### 部署到 Netlify

#### 方式一：通过 GitHub 自动部署

1. 访问 [app.netlify.com](https://app.netlify.com)
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 仓库
4. 配置构建设置：

```
Build command: npm run build
Publish directory: dist
```

5. 点击 "Deploy site"

#### 方式二：使用 Netlify CLI

```bash
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 初始化
netlify init

# 部署
netlify deploy --prod
```

---

### 部署到 Cloudflare Pages

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录
wrangler login

# 构建项目
npm run build

# 部署
npx wrangler pages deploy dist --project-name=md2slide
```

---

### 部署到 GitHub Pages

#### 1. 配置 vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/md2slide/', // 替换为你的仓库名
  build: {
    outDir: 'dist'
  }
})
```

#### 2. 构建项目

```bash
npm run build
```

#### 3. 推送到 gh-pages 分支

```bash
# 安装 gh-pages
npm install -D gh-pages

# 部署
npm run deploy
```

或在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

访问：`https://alleyf.github.io/md2slide/`

---

### Docker 部署

我们提供了完整的 Docker 支持，可以方便地将应用打包成镜像进行部署。

#### 1. 构建 Docker 镜像

项目根目录包含预配置的 `Dockerfile` 和 `nginx.conf`，可以直接使用：

```bash
# 构建镜像 (使用多阶段构建优化镜像大小)
docker build -t md2slide .

# 或者使用构建缓存加速构建过程
docker build --no-cache -t md2slide .
```

#### 2. 运行容器

```bash
# 基础运行 (端口映射到 8080)
docker run -d -p 8080:80 --name md2slide-container md2slide

# 或者指定内存限制
docker run -d -p 8080:80 --name md2slide-container --memory=512m md2slide

# 访问应用
open http://localhost:8080
```

#### 3. 使用环境变量配置 (可选)

如果需要配置环境变量（如AI服务API密钥等），可以在构建时或运行时传递。项目支持以下环境变量：

| 环境变量 | 描述 | 默认值 |
|---------|------|--------|
| VITE_AI_PROVIDER | AI服务提供商 | openai |
| VITE_AI_MODEL | AI模型名称 | gpt-3.5-turbo |
| VITE_AI_API_KEY | AI服务API密钥 | (无) |
| VITE_AI_BASE_URL | AI服务基础URL | https://api.openai.com/v1 |

**构建时设置环境变量：**

```bash
# 构建时传入环境变量
docker build -t md2slide \
  --build-arg VITE_AI_PROVIDER=anthropic \
  --build-arg VITE_AI_MODEL=claude-3-haiku-20240307 \
  --build-arg VITE_AI_API_KEY=your_anthropic_api_key \
  --build-arg VITE_AI_BASE_URL=https://api.anthropic.com/v1 .
```

**运行时设置环境变量：**

```bash
# 运行时传入环境变量
docker run -d -p 8080:80 \
  -e VITE_AI_PROVIDER=openai \
  -e VITE_AI_MODEL=gpt-3.5-turbo \
  -e VITE_AI_API_KEY=your_api_key \
  --name md2slide-container md2slide
```

**使用环境变量文件：**

创建 `.env` 文件：

```bash
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-3.5-turbo
VITE_AI_API_KEY=your_api_key
VITE_AI_BASE_URL=https://api.openai.com/v1
```

然后运行容器：

```bash
# 从文件加载环境变量
docker run -d -p 8080:80 --env-file ./.env --name md2slide-container md2slide
```

> **重要注意事项：** 由于这是前端应用，环境变量只在构建时生效，而不是在运行时。这意味着：
>
> 1. **构建时注入**：环境变量在 `npm run build` 时被注入到JavaScript文件中
> 2. **运行时固定**：一旦构建完成，环境变量就成为静态值，无法在容器运行时更改
> 3. **重新构建**：如果需要更改环境变量，必须重新构建镜像
> 4. **安全性**：敏感信息（如API密钥）会暴露在构建产物中，不适合公开部署
> 5. **替代方案**：对于需要运行时更改的配置，考虑使用API接口或配置文件
```

#### 4. Docker Compose 部署 (推荐)

对于更复杂的部署场景，您可以使用 Docker Compose。Docker Compose 配置已经包含在项目中，支持构建时和运行时环境变量：

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
    ports:
      - "8080:80"
    environment:  # 运行时环境变量（主要用于构建时注入的值）
      - NODE_ENV=production
    restart: unless-stopped
    volumes:
      - ./logs:/var/log/nginx  # 挂载日志目录
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

使用方法：

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件填入您的配置
nano .env

# 使用 Docker Compose 启动
docker-compose up -d

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

> **注意：** Docker Compose 会自动从 `.env` 文件加载环境变量，无需手动指定 `--env-file` 参数。

#### 5. 镜像优化说明

- 使用 Alpine Linux 基础镜像减小镜像大小
- 多阶段构建只保留生产环境所需文件
- 启用 Nginx 静态资源缓存和 Gzip 压缩
- 针对 SPA 应用优化路由处理

#### 6. 部署到云平台

您也可以将构建好的镜像推送到云平台容器 registry：

```bash
# 标记镜像
docker tag md2slide your-registry/md2slide:latest

# 推送到 registry
docker push your-registry/md2slide:latest

# 在云平台上运行
docker run -d -p 80:80 your-registry/md2slide:latest
```

#### 7. 环境变量配置

有关环境变量的详细配置说明，请参阅 [Docker 环境变量配置指南](./docs/docker-environment-variables.md)。

#### 8. 健康检查

Dockerfile 包含了基础的健康检查机制，确保服务正常运行：

```bash
# 检查容器运行状态
docker ps

# 检查容器日志
docker logs md2slide-container

# 进入容器调试
docker exec -it md2slide-container sh
```

---

## 📊 部署平台对比

| 平台 | 免费额度 | 自定义域名 | HTTPS | 构建速度 | 推荐指数 |
|------|----------|------------|-------|----------|----------|
| **Vercel** | ✅ 无限 | ✅ 支持 | ✅ 自动 | ⚡⚡⚡⚡⚡ | ⭐⭐⭐⭐⭐ |
| **Netlify** | ✅ 100GB | ✅ 支持 | ✅ 自动 | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ |
| **Cloudflare** | ✅ 无限 | ✅ 支持 | ✅ 自动 | ⚡⚡⚡⚡⭐ | ⭐⭐⭐⭐⭐ |
| **GitHub Pages** | ✅ 1GB | ✅ 支持 | ✅ 自动 | ⚡⚡⚡ | ⭐⭐⭐ |
| **Docker** | 取决于服务器 | ✅ 支持 | ⚡ 手动 | ⚡⚡ | ⭐⭐⭐ |

---

## 🛠️ 开发指南

### 项目结构

```
md2slide/
├── public/              # 静态资源
├── src/
│   ├── components/      # React 组件
│   │   ├── SlideTemplate.tsx    # 幻灯片模板
│   │   ├── ThemeToggle.tsx      # 主题切换
│   │   ├── MusicPlayer.tsx      # 音乐播放器
│   │   └── MusicVisualizer.tsx  # 音乐可视化效果
│   ├── context/         # React Context
│   │   └── ThemeContext.tsx     # 主题上下文
│   ├── styles/          # 样式定义
│   │   └── theme.ts              # 主题配置
│   ├── types/           # TypeScript 类型
│   │   └── theme.ts              # 主题类型
│   ├── utils/           # 工具函数
│   │   └── storage.ts            # 存储工具
│   ├── App.tsx          # 主应用组件
│   ├── Root.tsx         # Remotion 入口
│   └── index.tsx        # React 入口
├── index.html           # HTML 模板
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
├── vite.config.ts       # Vite 配置
└── README.md            # 项目文档
```

### 添加新功能

1. **创建组件**

```bash
# 在 src/components/ 中创建新组件
touch src/components/MyComponent.tsx
```

2. **定义类型**

```typescript
// src/types/myType.ts
export interface MyComponentProps {
  title: string;
  content: string;
}
```

3. **实现组件**

```tsx
// src/components/MyComponent.tsx
import React from 'react';
import { MyComponentProps } from '@/types/myType';

export const MyComponent: React.FC<MyComponentProps> = ({ title, content }) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{content}</p>
    </div>
  );
};
```

4. **测试组件**

```bash
npm run dev
```

### 代码规范

```bash
# 格式化代码
npm run format

# 检查格式
npm run format:check

# 运行测试
npm run test

# 生成覆盖率报告
npm run test:coverage
```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 如何贡献

1. **Fork 本仓库**
2. **创建特性分支** (`git checkout -b feature/AmazingFeature`)
3. **提交更改** (`git commit -m 'Add some AmazingFeature'`)
4. **推送分支** (`git push origin feature/AmazingFeature`)
5. **创建 Pull Request**

### 开发流程

```bash
# 1. Fork 并克隆仓库
git clone https://github.com/alleyf/md2slide.git
cd md2slide

# 2. 创建开发分支
git checkout -b feature/my-feature

# 3. 进行开发
npm run dev

# 4. 提交代码
git add .
git commit -m "feat: add my feature"

# 5. 推送并创建 PR
git push origin feature/my-feature
```

### Commit 规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
style: 代码格式调整
refactor: 重构代码
test: 添加测试
chore: 构建/工具链更新
```

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。


---

## 🙏 致谢

- [3Blue1Brown](https://www.3blue1brown.com/) - 视觉风格灵感来源
- [React](https://react.dev/) - 强大的 UI 框架
- [Vite](https://vitejs.dev/) - 极速的构建工具
- [KaTeX](https://katex.org/) - 快速的数学公式渲染
- [Remotion](https://www.remotion.dev/) - 视频导出支持

---

## 📮 联系方式

- **GitHub Issues**: [提交问题](https://github.com/alleyf/md2slide/issues)
- **Discussions**: [参与讨论](https://github.com/alleyf/md2slide/discussions)
- **Email**: alleyf@qq.com

---

## 🗺️ 路线图

### v1.1.0 (已发布)

- [x] 导出为 PDF
- [x] 导出为视频
- [x] 更多主题模板
- [x] 拖拽式编辑器
- [x] 自动动画 (Auto-Animation)
- [x] 插件系统

### v1.2.0 (规划中)

- [ ] 多语言支持
- [ ] 协作编辑
- [ ] 云端存储
- [ ] 移动端适配

### v1.2.0 (已发布)

- [x] AI 辅助生成
- [x] 主题市场
- [ ] 动画效果库
- [ ] API 开放

### v2.0.0 (愿景)

- [ ] 协作编辑
- [ ] 云端存储
- [ ] 高级动画效果
- [ ] API 开放

---

<div align="center">

**如果这个项目对您有帮助，请给我们一个 ⭐️ Star！**

### ☕ 为爱发电

<div align="center">

**如果你觉得这个项目有用，可以请开发者喝杯咖啡 ☕**

 <img src="public/donate-qr.png" alt="赞赏码" width="200"/> 


</div>


## Star History

<picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Alleyf/Md2Slide&type=Date&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Alleyf/Md2Slide&type=Date" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Alleyf/Md2Slide&type=Date" />
</picture>

### 🏠 [⬆ 回到顶部](https://github.com/Alleyf/Md2Slide#readme)

</div>
