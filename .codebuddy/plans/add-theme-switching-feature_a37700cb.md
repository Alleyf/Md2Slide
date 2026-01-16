---
name: add-theme-switching-feature
overview: 为 Markdown2Slide 添加主题切换功能，支持深色（3Blue1Brown）和浅色两种主题，并提供 UI 切换器和持久化存储。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Minimalism
    - Smooth Transitions
    - Icon-based Toggle
    - 3Blue1Brown Dark Theme
  fontSystem:
    fontFamily: Inter
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#1F2937"
      - "#2563EB"
    background:
      - "#FFFFFF"
      - "#0F172A"
    text:
      - "#111827"
      - "#F3F4F6"
    functional:
      - "#10B981"
      - "#EF4444"
      - "#F59E0B"
todos:
  - id: explore-project
    content: 使用 [subagent:code-explorer] 探索项目结构，了解现有技术栈
    status: completed
  - id: create-theme-types
    content: 定义主题类型和接口
    status: completed
    dependencies:
      - explore-project
  - id: create-theme-context
    content: 创建 ThemeContext 和 Provider 组件
    status: completed
    dependencies:
      - create-theme-types
  - id: create-storage-utils
    content: 实现 localStorage 持久化工具函数
    status: completed
    dependencies:
      - explore-project
  - id: create-theme-toggle
    content: 设计并实现主题切换按钮组件
    status: completed
    dependencies:
      - create-theme-context
  - id: integrate-provider
    content: 在应用根组件集成 ThemeProvider
    status: completed
    dependencies:
      - create-theme-context
  - id: integrate-toggle
    content: 在 Header 右侧集成 ThemeToggle 组件
    status: completed
    dependencies:
      - create-theme-toggle
---

## Product Overview

为 Markdown2Slide 应用添加主题切换功能，支持深色和浅色两种主题模式，提供便捷的 UI 切换器和持久化存储。

## Core Features

- 支持浅色主题和深色主题（3Blue1Brown 风格）两种模式
- 在 Header 右侧添加主题切换按钮
- 主题状态通过 localStorage 持久化
- 切换时带有平滑的过渡动画
- 全局主题状态管理

## Tech Stack

- 前端框架: React + TypeScript
- 样式方案: Tailwind CSS
- 状态管理: React Context API
- 数据持久化: localStorage

## Tech Architecture

### System Architecture

采用 Context + Hooks 的架构模式，实现全局主题状态管理和切换功能。

### Module Division

- **ThemeContext**: 提供主题状态和切换方法的全局上下文
- **ThemeProvider**: 包装应用根组件，提供主题上下文
- **ThemeToggle**: Header 右侧的主题切换按钮组件
- **useTheme**: 自定义 Hook，便捷访问主题状态

### Data Flow

```mermaid
graph LR
    A[用户点击切换按钮] --> B[ThemeToggle 调用 toggleTheme]
    B --> C[ThemeProvider 更新 theme state]
    C --> D[localStorage 保存主题设置]
    C --> E[Context 通知所有订阅组件]
    E --> F[应用重新渲染更新样式]
```

## Implementation Details

### Core Directory Structure

```
src/
├── components/
│   └── ThemeToggle.tsx       # 新增: 主题切换按钮组件
├── context/
│   └── ThemeContext.tsx      # 新增: 主题上下文和 Provider
├── hooks/
│   └── useTheme.ts           # 新增: 主题状态 Hook
├── types/
│   └── theme.ts              # 新增: 主题类型定义
└── utils/
    └── storage.ts            # 修改: 添加 localStorage 工具函数
```

### Key Code Structures

**ThemeType**: 定义主题类型，支持浅色和深色两种模式。

```typescript
export type Theme = 'light' | 'dark';
```

**ThemeContext**: 提供全局主题状态和切换方法的上下文。

```typescript
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}
```

### Technical Implementation Plan

1. **主题上下文实现**: 创建 ThemeProvider 使用 React Context API 管理全局主题状态
2. **持久化存储**: 初始化时从 localStorage 读取主题设置，切换时自动保存
3. **主题切换组件**: 设计 SVG 图标按钮，点击切换主题，带有平滑过渡动画
4. **Tailwind 配置**: 定义深色和浅色两套配色方案
5. **全局样式应用**: 在根元素动态添加 dark class，触发 Tailwind 的 dark mode

### Integration Points

- Header 组件集成 ThemeToggle 组件
- App 根组件包裹 ThemeProvider
- localStorage 作为持久化存储方案

## Design Style

采用极简现代风格，通过微交互提供流畅的用户体验。主题切换按钮设计为圆形图标按钮，位于 Header 右侧，带有悬停效果和点击动画。深色主题采用 3Blue1Brown 风格，使用深邃的蓝色调；浅色主题采用清爽的白色和浅灰色调。主题切换时，整个应用通过 CSS transition 实现平滑的颜色过渡效果。

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 探索项目结构，了解现有技术栈和代码组织
- Expected outcome: 明确当前项目的技术框架、组件结构和样式配置，为功能集成提供依据