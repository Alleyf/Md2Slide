# AGENTS.md - Paper2Slide 代码编写指南

本指南为在该代码库中工作的 AI 编码代理提供必要的信息。

## 构建命令

```bash
# 开发
npm run dev              # 在 localhost:3000 启动开发服务器

# 生产环境
npm run build            # 构建生产版本
npm run preview          # 预览生产构建

# Remotion (视频导出)
npm run remotion:preview # 在 Remotion 中预览
npm run remotion:build   # 使用 Remotion 渲染视频
npm run remotion:serve   # Remotion 播放器运行在 3000 端口
```

**注意**: 当前未配置测试框架。在实现新功能时，使用 Jest 或 Vitest 添加测试。

## 项目结构

```
src/
├── components/      # React 组件 (SlideTemplate, ThemeToggle)
├── context/         # React Context (ThemeContext)
├── styles/          # 主题定义 (darkTheme, lightTheme)
├── types/           # TypeScript 类型定义
├── utils/           # 工具函数 (localStorage 辅助函数)
├── App.tsx          # 主应用组件，包含 Markdown 解析器
├── Root.tsx         # Remotion 入口点（当前未使用）
└── index.tsx        # React 入口点
```

## 代码风格指南

### TypeScript

- **严格模式**: 已启用 (`strict: true` 在 tsconfig.json 中)
- **组件类型注解**: 所有函数组件使用 `React.FC` 类型注解
- **空值安全**: 在访问属性之前始终检查 null/undefined
- **禁止类型抑制**: 永远不要使用 `as any`、`@ts-ignore` 或 `@ts-expect-error`

```typescript
// 推荐
export const MyComponent: React.FC<{ title: string }> = ({ title }) => {
  if (!title) return null;
  return <h1>{title}</h1>;
};

// 不推荐
export const MyComponent: React.FC = ({ title }: any) => {
  return <h1>{title}</h1>;
};
```

### 导入顺序

1. React 导入在前
2. 第三方库
3. 使用 `@/` 别名的内部导入
4. 同目录文件的相对导入

```typescript
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '@/context/ThemeContext';
import { darkTheme } from '@/styles/theme';
```

### 组件模式

- **仅函数组件**: 不使用类组件
- **自定义 Hooks**: 将复杂逻辑提取到自定义 Hooks 中（例如 `useTheme`）
- **Context API**: 用于全局状态管理（当前仅用于主题管理）
- **Props 接口**: 为复杂组件定义 Props 接口

```typescript
interface MyComponentProps {
  title: string;
  isActive?: boolean;
  onToggle?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title, isActive = false, onToggle }) => {
  // 组件逻辑
};
```

### 样式

- **内联样式**: 主要样式方法（不使用 CSS modules 或 Tailwind）
- **主题感知**: 使用 `themeConfig` 中的主题颜色
- **响应式**: 使用 `clamp()` 实现响应式字体大小
- **过渡效果**: 为主题切换添加平滑过渡

```typescript
const { themeConfig: theme } = useTheme();

const style: React.CSSProperties = {
  color: theme.colors.text,
  background: theme.colors.background,
  fontSize: 'clamp(16px, 2vw, 20px)',
  transition: 'all 0.3s ease',
};
```

### 命名约定

- **组件**: PascalCase (`SlideTemplate`, `ThemeToggle`)
- **函数**: camelCase (`parseMarkdownToSlides`, `handleClick`)
- **常量**: UPPER_SNAKE_CASE (`THEME`, `MARKDOWN`)
- **接口**: 使用描述性名称的 PascalCase (`ThemeConfig`, `SlideContent`)
- **类型别名**: PascalCase (`Theme`, `ThemeContextType`)

### 错误处理

- **异步函数**: 使用 try-catch 包装并记录 console.error
- **防御性检查**: 渲染前验证数据
- **用户反馈**: 谨慎使用 alert；优先使用 UI 反馈

```typescript
export const loadFile = async (fileName: string) => {
  try {
    const response = await fetch(`/${fileName}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error('Failed to load file:', error);
    return null;
  }
};
```

### 状态管理

- **React Hooks**: useState、useEffect、useRef、useContext
- **本地状态**: 使用 useState 管理组件级状态
- **全局状态**: 使用 Context API（当前仅 ThemeContext）
- **副作用**: 始终在 useEffect 中包含清理函数

```typescript
const [isOpen, setIsOpen] = useState(false);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  const handleResize = () => console.log('resize');
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

### Markdown 解析

应用使用 `App.tsx` 中的自定义 Markdown 解析器：

- **幻灯片分隔符**: `---`
- **元素解析**: 每行类型都有一个 clickState 用于逐步显示
- **特殊命令**: `!icon()`、`!grid`、`!vector`、`!image()`、`!video()`、`!html()`
- **数学公式**: `$$...$$`（块级）、`$...$`（行内）

### 主题系统

- **浅色/深色模式**: 通过 ThemeContext 切换
- **主题对象**: 包含颜色、字体、动画
- **CSS 变量**: 应用于文档根元素（`data-theme` 属性）
- **默认**: 深色主题为默认

```typescript
const { theme, themeConfig, toggleTheme } = useTheme();
```

### 文件组织

- **单文件组件**: 优先每个文件一个组件
- **类型同置**: 将类型放在 `src/types/` 中，如果是组件特定的则放在同一文件中
- **工具函数**: 共享函数放在 `src/utils/` 中
- **样式**: 主题定义在 `src/styles/theme.ts` 中

### 可访问性

- **键盘导航**: Space/ArrowRight（下一页）、ArrowLeft（上一页）
- **ARIA 标签**: 为仅图标按钮添加 `title` 属性
- **焦点管理**: 使用 refs 进行焦点控制

### 性能

- **懒加载**: 当前未使用，但建议用于大型依赖
- **记忆化**: 对昂贵计算使用 `useMemo`/`useCallback`
- **代码分割**: Vite 通过动态导入自动处理

### Git 工作流

- 未配置 pre-commit hooks
- 提交格式: 自由格式（未强制执行严格模式）
- 分支命名: 无约定

### 添加新功能

1. 在 `src/components/` 中创建组件
2. 如果可复用，在 `src/types/` 中定义类型
3. 如果共享，在 `src/utils/` 中添加工具函数
4. 在开发模式中测试: `npm run dev`
5. 运行构建: `npm run build`（应该成功）
6. 如果添加新的 Markdown 语法，更新 README/MARKDOWN_GUIDE.md

### 测试

**当前未配置测试。** 添加测试时：

1. 选择 Jest 或 Vitest（Vite 原生）
2. 在 `package.json` 脚本中配置
3. 添加测试文件: `Component.test.tsx`
4. 运行测试: `npm test`（待配置）

### 常见模式

**带 Context 的自定义 Hook**:
```typescript
export const useFeature = () => {
  const context = useContext(FeatureContext);
  if (!context) throw new Error('useFeature must be used within FeatureProvider');
  return context;
};
```

**带 Ref 的事件处理程序**:
```typescript
const handleClick = () => {
  const textarea = editorRef.current;
  if (!textarea) return;
  textarea.focus();
};
```

**条件渲染**:
```typescript
{isActive && (
  <div style={{ opacity: 1 }}>
    Content
  </div>
)}
```

---

最后更新: 2026-01-17
