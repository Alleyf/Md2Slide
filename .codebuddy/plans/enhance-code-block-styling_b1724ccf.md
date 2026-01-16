---
name: enhance-code-block-styling
overview: 优化代码块的视觉效果，使其更具 3Blue1Brown 风格，添加边框、阴影和视觉层次。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - 3Blue1Brown
    - Academic Dark Mode
    - Neon Glow
    - Minimalist
  fontSystem:
    fontFamily: Roboto Mono
    heading:
      size: 16px
      weight: 500
    subheading:
      size: 14px
      weight: 400
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#3B82F6"
      - "#60A5FA"
    background:
      - "#111827"
      - "#1F2937"
    text:
      - "#F3F4F6"
      - "#9CA3AF"
    functional:
      - "#10B981"
      - "#EF4444"
todos:
  - id: locate-code-block
    content: 使用 [subagent:code-explorer] 定位渲染代码块的组件文件和样式文件
    status: completed
  - id: define-styles
    content: 定义 3Blue1Brown 风格的 CSS 变量 (背景、边框、阴影颜色)
    status: completed
    dependencies:
      - locate-code-block
  - id: apply-container-style
    content: 应用新的边框样式和发光阴影到代码块容器
    status: completed
    dependencies:
      - define-styles
  - id: optimize-syntax-color
    content: 调整代码高亮颜色以适配深色背景
    status: completed
    dependencies:
      - apply-container-style
  - id: test-visual-effect
    content: 验证代码块在不同幻灯片页面的视觉效果
    status: completed
    dependencies:
      - optimize-syntax-color
---

## Product Overview

优化幻灯片中代码块的视觉呈现，使其符合 3Blue1Brown 的数学与美学风格，提升代码内容的可读性与视觉吸引力。

## Core Features

- 应用 3Blue1Blue 风格配色，使用深邃的蓝黑色调作为背景
- 为代码块添加精致的边框和发光阴影效果，增强立体感
- 优化视觉层次，区分代码块标题栏与内容区域
- 确保语法高亮颜色与深色背景形成良好对比

## Tech Stack

- 目标项目: Paper2Slide (复用现有技术栈，待确认)

## Tech Architecture

### 系统架构

- 修改范围: 现有项目 UI 样式层
- 策略: 首先定位代码块渲染组件及其关联的样式文件，基于现有代码结构进行增强。

### 模块划分

- **代码块组件模块**: 负责代码内容的渲染与 DOM 结构
- **样式定义模块**: 负责边框、阴影、背景色及字样的 CSS/Styled-Components 定义

### 数据流

代码内容 -> 代码块组件渲染 -> 应用增强样式 (3Blue1Blue 主题) -> 最终视觉输出

## Implementation Details

### 核心目录结构

待项目代码探索后确定，预期涉及修改:

```
project-root/
├── src/
│   ├── components/
│   │   └── CodeBlock.tsx        # 代码块主组件
│   └── styles/
│       └── code-theme.css       # 代码高亮与容器样式
```

### 关键代码结构

**样式定义**: 利用 CSS Box-shadow 实现发光效果，Border-radius 实现圆润感。

```css
.code-block-container {
  background-color: #111827; /* 深蓝背景 */
  border: 1px solid #3B82F6; /* 亮蓝边框 */
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); /* 柔和发光 */
}
```

## 设计风格

采用 3Blue1Brown 标志性的学术与数学美感。设计核心在于深邃的背景、清晰的逻辑线条以及微妙的动态光感。

## 设计内容描述

- **整体氛围**: 沉稳、优雅、具有科技感的深色模式。
- **代码块容器**: 使用深蓝灰 (#111827) 作为底色，搭配纤细的青蓝色 (#3B82F6) 边框。
- **光影效果**: 为代码块添加向外扩散的柔和蓝色阴影 (Glow Effect)，模拟屏幕荧光感，使其从深色背景中浮现。
- **层次结构**: 代码块顶部增加轻微的分隔线或渐变标题栏，用于区分代码与正文。
- **响应式**: 确保代码块在不同分辨率下保持边距和比例协调。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在项目中搜索代码块组件及样式文件的当前位置
- Expected outcome: 准确定位需要修改的组件路径 (如 .tsx, .css, .scss 等)