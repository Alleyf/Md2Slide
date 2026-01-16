# Markdown 幻灯片使用指南

## 功能概述

本项目支持通过 Markdown 文件快速创建幻灯片，支持以下内容类型：

- ✅ 数学公式（LaTeX 语法）
- ✅ 代码高亮显示
- ✅ 图片展示
- ✅ 视频播放
- ✅ 列表（有序/无序）
- ✅ 自定义 HTML
- ✅ 引用块
- ✅ 图标/Emoji
- ✅ 完整 Markdown 语法

## 基础语法

### 幻灯片分隔符

使用 `---` 分割不同的幻灯片：

```markdown
# 第一页

这是第一页的内容

---

# 第二页

这是第二页的内容
```

### 标题

```markdown
# 一级标题（大标题）
## 二级标题（副标题）
### 三级标题（小标题）
```

### 列表

```markdown
- 无序列表项 1
- 无序列表项 2
- 无序列表项 3
```

### 引用

```markdown
> 这是一段引用文字
```

## 高级语法

### 数学公式

**行内公式**（使用 `$`）：

```markdown
勾股定理：$a^2 + b^2 = c^2$
```

**块级公式**（使用 `$$`）：

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

支持的 LaTeX 命令：
- 基础运算：`+`, `-`, `*`, `/`, `^`, `_`
- 函数：`\frac`, `\sqrt`, `\sum`, `\int`
- 矩阵：`\begin{pmatrix} ... \end{pmatrix}`
- 希腊字母：`\alpha`, `\beta`, `\theta`, `\pi`
- 符号：`\infty`, `\partial`, `\nabla`

### 代码块

使用三个反引号包围代码：

```markdown
\`\`\`python
def hello():
    print("Hello, World!")
\`\`\`
```

### 图片

标准 Markdown 图片语法：

```markdown
![图片描述](图片URL)

![网络架构](https://example.com/image.png)
```

### 视频

使用自定义语法：

```markdown
!video(视频URL)

!video(https://www.w3schools.com/html/mov_bbb.mp4)
```

### 图标

使用自定义语法插入 Emoji 或 HTML 图标：

```markdown
!icon(🎯)
!icon(🚀)
!icon(💡)
```

### 自定义 HTML

插入任意 HTML 代码：

```markdown
!html(<div style="color: red;">红色文字</div>)

!html(<div style="background: blue; padding: 10px;">蓝色盒子</div>)
```

### 链接

标准 Markdown 链接语法：

```markdown
[链接文字](链接地址)

[GitHub](https://github.com)
```

### 文本样式

```markdown
**粗体**
*斜体*
`行内代码`
~~删除线~~
```

## 完整示例

```markdown
# 梯度下降算法

## 核心概念

寻找函数最小值的迭代方法

### 公式表示

$$\\theta = \\theta - \\alpha \\cdot \\nabla J(\\theta)$$

其中：
- $\\theta$ 是参数
- $\\alpha$ 是学习率
- $\\nabla J(\\theta)$ 是梯度

!icon(📉)

---

# 代码实现

## Python 版本

\`\`\`python
def gradient_descent(X, y, theta, alpha, iterations):
    m = len(y)
    for i in range(iterations):
        prediction = X.dot(theta)
        errors = prediction - y
        gradients = (1/m) * X.T.dot(errors)
        theta = theta - alpha * gradients
    return theta
\`\`\`

---

# 可视化

## 示例图片

![梯度下降示意图](https://example.com/gradient.png)

## 视频演示

!video(https://www.w3schools.com/html/mov_bbb.mp4)

!icon(🎬)

---

# 总结

> 学习是一个不断优化的过程

关键点：
- 梯度指向增长最快的方向
- 反向移动就是下降
- 学习率控制步长

!icon(✨)
```

## 内容类型详细说明

### 1. 数学公式

- 使用 KaTeX 渲染，速度快、质量高
- 支持几乎所有 LaTeX 数学命令
- 自动适配深色主题

### 2. 代码块

- 自动检测语言并应用语法高亮
- 支持复制粘贴
- 代码行号显示

### 3. 图片

- 支持常见图片格式（PNG, JPG, GIF, SVG）
- 自动调整大小以适应屏幕
- 圆角和阴影效果

### 4. 视频

- 支持常见视频格式（MP4, WebM）
- 原生播放控制
- 响应式尺寸

### 5. 列表

- 逐步显示效果（每个列表项单独一个点击状态）
- 自动缩进和格式化
- 支持嵌套列表

### 6. 自定义 HTML

- 完全支持 HTML5 标签
- 支持内联样式
- 适合创建自定义组件

### 7. 引用块

- 左侧强调线
- 斜体样式
- 适合名言或提示

### 8. 图标

- 支持 Unicode Emoji
- 无需图片文件
- 快速加载

## 交互功能

### 键盘导航

- `空格键` 或 `→`：下一页
- `←`：上一页

### 点击状态

每个元素可以设置 `clickState`，控制显示时机：
- `clickState: 0` - 首次点击后显示
- `clickState: 1` - 第二次点击后显示
- 以此类推

## 最佳实践

### 1. 幻灯片组织

每页内容不宜过多，建议：
- 标题 + 3-5 个要点
- 一页一个主要概念
- 相关内容放在同一页

### 2. 动画时机

合理设置显示顺序：
- 先标题后内容
- 先概念后公式
- 先文字后图片

### 3. 代码展示

- 代码不宜超过 20 行
- 添加必要的注释
- 使用高对比度的语法高亮

### 4. 公式使用

- 复杂公式拆分为多步
- 使用行内公式说明变量
- 块级公式展示完整推导

### 5. 图片和视频

- 使用高质量素材
- 检查 URL 可访问性
- 提供替代文本

## 常见问题

### Q: 公式不显示？

A: 检查 LaTeX 语法是否正确，确保使用了正确的定界符（`$` 或 `$$`）。

### Q: 图片加载失败？

A: 检查 URL 是否正确，确保图片服务器允许跨域访问。

### Q: 视频无法播放？

A: 确认视频格式和编码，建议使用 MP4/H.264 格式。

### Q: HTML 不生效？

A: 确保使用正确的语法 `!html(<html>)`，不要遗漏括号。

### Q: 如何导出幻灯片？

A: 目前仅支持在线演示，导出功能正在开发中。

## 更多资源

- Markdown 基础语法：https://www.markdownguide.org/
- LaTeX 数学公式：https://katex.org/docs/supported.html
- KaTeX 支持：https://katex.org/docs/

## 更新日志

### v1.0.0 (2026-01-16)

- ✨ 新增 Markdown 导入功能
- ✨ 新增数学公式支持（KaTeX）
- ✨ 新增代码高亮
- ✨ 新增图片/视频展示
- ✨ 新增自定义 HTML 支持
- ✨ 新增图标/Emoji 支持
- ✨ 完善键盘导航
- 🐛 修复主题颜色渲染问题
