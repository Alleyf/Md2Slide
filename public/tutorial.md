# Md2Slide 交互式教程
## 开启你的电影级幻灯片演示之旅

---

# 基础入门
## 核心理念与操作

- **Markdown 驱动**：使用你熟悉的 Markdown 语法编写内容。
- **分页逻辑**：使用 `---`（三个连字符）来分隔不同的幻灯片页。
- **逐条显示**：列表项（Bullets）和部分元素会自动分配点击状态，实现点击后逐条弹出的动画效果。

!icon(🚀)

---

# 键盘快捷键
## 高效掌控演示进度

### 向前播放 (Next)
- `Space` (空格) / `Enter` (回车)
- `→` / `↓` 方向键
- `PageDown`

### 向后回退 (Prev)
- `Shift + Space`
- `←` / `↑` 方向键
- `Backspace` (退格)
- `PageUp`

### 其他操作
- `↺` 点击右下角按钮可**重放**（回到首页）
- **点击页码**可直接输入数字进行**快速跳转**

---

# 数学公式支持
## 完美的 LaTeX 渲染

### 行内公式
勾股定理：$a^2 + b^2 = c^2$
欧拉公式：$e^{i\pi} + 1 = 0$

### 块级公式
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
x \\
y
\end{pmatrix}
=
\begin{pmatrix}
ax + by \\
cx + dy
\end{pmatrix}
$$

!icon(🧮)

---

# 代码高亮展示
## 适配 VS Code Dark Plus 主题

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 自动识别语言并高亮
for i in range(5):
    print(f"F({i}) = {fibonacci(i)}")
```

```javascript
// 支持多种主流编程语言
const quickSort = (arr) => {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.filter(x => x < pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
};
```

!icon(💻)

---

# 丰富的内容类型
## 图片、视频与表格

### 媒体嵌入
- **图片**：使用标准格式 `` `![描述](链接)` ``

![Md2Slide Logo](/logo.jpg)

![示例图片](https://yuanqi-1251316161.cos.ap-guangzhou.myqcloud.com/public/2012387237031398656/2012387424248353280/image/QwmziYAUwDStgGhsJVL-2012387425087214080.jpg)

- **视频**：使用 `` `!video(链接)` ``

!audio(https://www.w3schools.com/html/horse.mp3)

- **语音**：使用 `` `!audio(链接)` ``

!video(https://www.bilibili.com/video/BV1rG411j7u9/?spm_id_from=888.80997.embed_other.whitelist&bvid=BV1rG411j7u9)

### 表格渲染 (GFM 标准)
| 功能 | 支持程度 | 备注 |
| :--- | :---: | :--- |
| LaTeX | ✅ | 极致清晰 |
| 代码 | ✅ | 语法高亮 |
| 动画 | ✅ | 自动弹出 |

!icon(🖼️)

---

# 高级自定义语法
## 扩展你的表达能力

### 图标与网格
- **图标**：使用 `!icon(🎯)` 插入任意 Emoji 图标。
- **辅助元素**：`!grid`（网格背景）和 `!vector`（示例向量）。

### 自定义 HTML
!html(<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;"><h3>支持原生 HTML</h3><p>你可以直接嵌入复杂的样式组件</p></div>)

---

# 界面功能概览
## 提升创作效率

- **文件管理**：点击“打开文件夹”管理本地项目，或点击“导入文件”临时加载 MD。
- **文章大纲**：左下角目录支持**点击跳转**，编辑器与预览页会同步滚动。
- **全屏预览**：右上角切换，进入沉浸式演示模式，自动隐藏侧边栏。
- **主题切换**：支持明亮/暗黑模式切换，适配不同光线环境。

!icon(🎨)

---

# 准备好了吗？
## 删掉这些内容，开始你的创作吧！

> "数学是上帝书写宇宙的语言。" —— 伽利略

点击右下角的 **↺** 按钮可以回到本教程的第一页重新查看。

!icon(✨)
