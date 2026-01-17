# Paper2Slide 优化路线图

## 📋 总体进度

- [x] 制定优化计划
- [ ] 第一阶段：代码质量与基础功能 (1-2周)
- [ ] 第二阶段：用户体验增强 (2-4周)
- [ ] 第三阶段：高级功能 (4-8周)
- [ ] 第四阶段：长期创新 (长期)

---

## 🔴 第一阶段：代码质量与基础功能 (1-2周)

### 1.1 代码重构
- [ ] 拆分 App.tsx (1053行 → ~300行)
  - [ ] 提取 `markdownParser.ts` 到 `src/parser/`
  - [ ] 提取 `formatInlineMarkdown` 到独立文件
  - [ ] 提取文件树组件到 `src/components/FileTree/`
  - [ ] 提取帮助模态框到 `src/components/HelpModal/`
- [ ] 拆分 SlideTemplate.tsx (947行 → ~500行)
  - [ ] 提取 `SlideElementRenderer.tsx` (~300行)
  - [ ] 提取 `NavigationControls.tsx` (~100行)
  - [ ] 提取 `useSlideNavigation.ts` hook (~100行)
  - [ ] 提取全局样式到 `src/styles/global.css`

### 1.2 TypeScript 类型修复
- [ ] 修复 App.tsx:32 的 `theme: any` 类型
- [ ] 为所有组件添加明确的 Props 接口
- [ ] 添加缺失的类型定义
- [ ] 安装缺失的类型包: `@types/react-katex`
- [ ] 修复 remotion.config.ts 的 defineConfig 导入问题

### 1.3 测试框架
- [ ] 安装 Vitest 和相关依赖
  - [ ] `vitest`
  - [ ] `@testing-library/react`
  - [ ] `@testing-library/user-event`
  - [ ] `@vitest/ui`
  - [ ] `@vitest/coverage-v8`
- [ ] 配置 vitest.config.ts
- [ ] 添加测试脚本到 package.json
  - [ ] `test`
  - [ ] `test:ui`
  - [ ] `test:coverage`
- [ ] 编写基础测试用例
  - [ ] Markdown 解析器测试
  - [ ] 主题切换测试
  - [ ] 幻灯片导航测试

### 1.4 导出功能
- [ ] 安装导出依赖
  - [ ] `playwright` 或 `puppeteer` (PDF)
  - [ ] `pptxgenjs` (PPTX)
  - [ ] `html2canvas` (PNG)
- [ ] 实现 PDF 导出
  - [ ] 创建 `src/utils/export/pdf.ts`
  - [ ] 处理多 clickState 页面
  - [ ] 添加 `npm run export:pdf` 脚本
- [ ] 实现 PPTX 导出
  - [ ] 创建 `src/utils/export/pptx.ts`
  - [ ] 保留样式和动画
  - [ ] 添加 `npm run export:pptx` 脚本
- [ ] 实现 PNG 导出
  - [ ] 创建 `src/utils/export/png.ts`
  - [ ] 支持单页和全部导出
  - [ ] 添加 `npm run export:png` 脚本
- [ ] 在 UI 中添加导出按钮

### 1.5 过渡动画系统
- [ ] 定义过渡动画类型
  - [ ] 创建 `src/types/animation.ts`
  - [ ] 支持: fade, slide-left, slide-right, zoom, flip
- [ ] 实现过渡动画组件
  - [ ] 创建 `src/components/transitions/SlideTransition.tsx`
  - [ ] 使用 CSS transforms 实现性能优化
- [ ] 扩展 Markdown 语法
  - [ ] 支持 `transition: type, duration, easing` 元数据
  - [ ] 更新解析器以识别过渡指令
- [ ] 添加过渡设置到帮助文档

---

## 🟡 第二阶段：用户体验增强 (2-4周)

### 2.1 演讲者模式
- [ ] 创建演讲者视图组件
  - [ ] `src/components/PresenterView.tsx`
  - [ ] 当前幻灯片
  - [ ] 下一张幻灯片预览
  - [ ] 演讲者备注编辑器
  - [ ] 计时器
- [ ] 扩展 Markdown 语法支持备注
  - [ ] `### Notes:` 语法
  - [ ] 更新解析器提取备注
- [ ] 添加演讲者模式切换按钮
- [ ] 支持双屏显示
  - [ ] 主窗口：幻灯片
  - [ ] 副窗口：演讲者视图

### 2.2 可访问性 (WCAG 2.1 AA)
- [ ] 添加 ARIA 支持
  - [ ] 幻灯片容器角色标记
  - [ ] 导航按钮 aria-label
  - [ ] 实时区域用于屏幕阅读器
- [ ] 实现焦点管理
  - [ ] `src/utils/accessibility.ts`
  - [ ] 幻灯片切换时焦点转移
  - [ ] 键盘陷阱修复
- [ ] 添加屏幕阅读器公告
  - [ ] 幻灯片编号公告
  - [ ] 内容变化公告
- [ ] 键盘快捷键可配置
  - [ ] 创建快捷键设置面板
  - [ ] 支持自定义快捷键
  - [ ] 快捷键帮助提示
- [ ] 颜色对比度检查
  - [ ] 自动检测对比度
  - [ ] 高对比度模式
- [ ] 添加 "跳到内容" 链接

### 2.3 触摸手势支持
- [ ] 安装手势库
  - [ ] `react-swipeable` 或 `use-gesture`
- [ ] 实现滑动手势
  - [ ] 左滑：下一张
  - [ ] 右滑：上一张
  - [ ] 上滑：缩小
  - [ ] 下滑：放大
- [ ] 实现捏合缩放
  - [ ] 双指缩放幻灯片
- [ ] 优化触摸目标大小
  - [ ] 最小 44x44px
- [ ] 禁用默认触摸行为
  - [ ] 防止意外滚动

### 2.4 智能布局系统
- [ ] 定义布局类型
  - [ ] `src/types/layout.ts`
  - [ ] auto, title-center, two-column, image-left, code-focus
- [ ] 实现布局渲染器
  - [ ] `src/components/layouts/SmartLayout.tsx`
  - [ ] 自动内容位置调整
- [ ] 扩展 Markdown 语法
  - [ ] `layout: type, spacing` 元数据
- [ ] 添加布局选择器到 UI

### 2.5 性能优化
- [ ] 虚拟化幻灯片列表
  - [ ] 安装 `react-window`
  - [ ] 实现 `SlideListVirtualized` 组件
- [ ] 代码分割
  - [ ] 配置 vite.config.ts 的 manualChunks
  - [ ] 懒加载重型组件
- [ ] 记忆化优化
  - [ ] 使用 `React.memo` 包装幻灯片组件
  - [ ] 自定义比较函数
  - [ ] 使用 `useMemo` 和 `useCallback`
- [ ] 防抖和节流
  - [ ] 编辑器输入防抖
  - [ ] 窗口调整节流
- [ ] 图片懒加载
  - [ ] 使用 Intersection Observer
  - [ ] 占位符显示

---

## 🟢 第三阶段：高级功能 (4-8周)

### 3.1 自动动画 (Auto-Animate)
- [ ] 设计元素匹配算法
  - [ ] 按文本内容匹配
  - [ ] 按 data-id 属性匹配
  - [ ] 跨幻灯片元素追踪
- [ ] 实现动画过渡
  - [ ] CSS transforms 平滑移动
  - [ ] 支持属性: position, font-size, color, opacity
- [ ] 扩展 Markdown 语法
  - [ ] `data-auto-animate` 属性支持
  - [ ] `data-id` 自定义匹配
- [ ] 添加动画设置面板

### 3.2 实时协作模式
- [ ] 选择 WebSocket 方案
  - [ ] `socket.io-client` 或原生 WebSocket
- [ ] 实现协作后端 (可选)
  - [ ] Node.js + Socket.io 服务器
  - [ ] 房间管理
  - [ ] 用户状态同步
- [ ] 实现协作前端
  - [ ] `src/hooks/useCollaboration.ts`
  - [ ] 幻灯片同步
  - [ ] 共享光标
  - [ ] 实时标注
- [ ] 添加协作用户列表
- [ ] 实现演讲者权限管理
- [ ] 添加协作设置面板

### 3.3 插件系统
- [ ] 设计插件 API
  - [ ] `src/plugins/types.ts`
  - [ ] 插件生命周期钩子
  - [ ] Markdown 语法扩展
  - [ ] 幻灯片类型扩展
  - [ ] 导出处理器
- [ ] 实现插件加载器
  - [ ] `src/plugins/PluginManager.ts`
  - [ ] 动态导入插件
  - [ ] 插件配置管理
- [ ] 创建示例插件
  - [ ] CodeRunner 插件
  - [ ] Mermaid 图表插件
  - [ ] 音乐播放器插件
- [ ] 添加插件市场 UI

### 3.4 AI 辅助功能
- [ ] 选择 LLM 提供商
  - [ ] OpenAI API
  - [ ] Anthropic Claude API
  - [ ] 本地模型支持 (Ollama)
- [ ] 实现基础 AI 功能
  - [ ] `src/services/ai.ts`
  - [ ] 内容摘要
  - [ ] 文本改进建议
  - [ ] 关键点提取
- [ ] 研究论文转幻灯片
  - [ ] PDF.js 集成
  - [ ] 文本提取
  - [ ] 大纲生成
  - [ ] 自动幻灯片创建
- [ ] AI 图片生成
  - [ ] DALL-E 或 Stable Diffusion 集成
  - [ ] 从文本描述生成图表
- [ ] 添加 AI 功能到 UI

### 3.5 主题市场
- [ ] 设计主题包格式
  - [ ] `src/types/themePackage.ts`
  - [ ] 主题元数据
  - [ ] 预览图片
- [ ] 实现主题加载器
  - [ ] NPM 包支持
  - [ ] 本地文件加载
  - [ ] CDN 加载
- [ ] 创建主题分享平台
  - [ ] 简单的 GitHub 仓库列表
  - [ ] 主题预览
  - [ ] 一键安装
- [ ] 创建示例主题包
  - [ ] Minimal 主题
  - [ ] Cyberpunk 主题
  - [ ] 学术主题

---

## 🔵 第四阶段：长期创新 (长期)

### 4.1 可缩放画布导航
- [ ] 设计画布架构
  - [ ] `src/types/canvas.ts`
  - [ ] 视口状态管理
  - [ ] 主题节点系统
- [ ] 实现画布渲染
  - [ ] `src/components/ZoomCanvas.tsx`
  - [ ] 无限画布支持
  - [ ] 缩放和平移
- [ ] 非线性导航
  - [ ] 主题间飞行动画
  - [ ] 缩放路径录制
- [ ] 添加画布编辑器
  - [ ] 拖放排列主题
  - [ ] 连线工具

### 4.2 视频会议集成
- [ ] WebRTC 集成
  - [ ] `simple-peer` 或 `mediasoup`
  - [ ] 实时视频流
  - [ ] 屏幕共享
- [ ] 演讲者视频叠加
  - [ ] 画中画模式
  - [ ] 自定义位置和大小
- [ ] 录制功能
  - [ ] 保存演示视频
  - [ ] 自动生成字幕

### 4.3 高级 AI 功能
- [ ] 多语言支持
  - [ ] 实时翻译
  - [ ] 语音合成 (TTS)
- [ ] 智能图表生成
  - [ ] 自动检测数据
  - [ ] 生成合适图表类型
- [ ] 演讲建议
  - [ ] 节奏分析
  - [ ] 内容优化建议

### 4.4 移动端应用
- [ ] React Native 或 PWA
- [ ] 离线支持
- [ ] 触摸优化
- [ ] 推送通知

---

## 🟠 快速胜利 (Quick Wins)

### 立即可实施
- [ ] 添加代码格式化工具
  - [ ] 安装 Prettier
  - [ ] 配置 `.prettierrc`
  - [ ] 添加格式化脚本
- [ ] 添加 Git hooks
  - [ ] 安装 Husky
  - [ ] 安装 lint-staged
  - [ ] 配置 pre-commit 钩子
  - [ ] 添加 commit-msg 钩子
- [ ] 添加错误边界
  - [ ] 创建 `src/components/ErrorBoundary.tsx`
  - [ ] 包裹应用根组件
  - [ ] 友好的错误 UI
- [ ] 添加加载状态
  - [ ] 使用 React Suspense
  - [ ] 懒加载组件
  - [ ] 加载动画
- [ ] 改进图标系统
  - [ ] 统一图标来源 (lucide-react)
  - [ ] 添加更多图标
- [ ] 添加键盘快捷键提示
  - [ ] 显示当前可用的快捷键
  - [ ] 按 "?" 显示帮助
- [ ] 添加欢迎向导
  - [ ] 首次使用引导
  - [ ] 示例幻灯片教程

---

## 📊 进度统计

### 代码质量
- [ ] 类型覆盖率: 0% → 100%
- [ ] 测试覆盖率: 0% → 80%+
- [ ] 代码分割: 0% → 100%

### 功能完成度
- [ ] 导出功能: 0% (仅 Remotion 视频)
- [ ] 过渡动画: 0%
- [ ] 演讲者模式: 0%
- [ ] 可访问性: 20% → 100%
- [ ] 触摸支持: 0% → 100%
- [ ] 智能布局: 0%
- [ ] 实时协作: 0%
- [ ] 自动动画: 0%
- [ ] 插件系统: 0%
- [ ] AI 功能: 0%

### 性能指标
- [ ] 首屏加载时间: 测量 → < 2s
- [ ] 每秒帧率: 测量 → 60fps
- [ ] 内存使用: 测量 → < 100MB

---

## 📝 更新日志

### 2026-01-17
- [x] 创建优化路线图文档
- [ ] 开始实施第一阶段任务

---

## 🔗 相关资源

- [AGENTS.md](./AGENTS.md) - 代码编写指南
- [README.md](./README.md) - 项目说明
- [MARKDOWN_GUIDE.md](./MARKDOWN_GUIDE.md) - Markdown 语法指南

---

**最后更新**: 2026-01-17
**维护者**: Paper2Slide Team
