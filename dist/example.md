# 完整功能演示

## 支持所有内容类型

---

# 数学公式

## 行内公式

勾股定理：$a^2 + b^2 = c^2$

欧拉公式：$e^{i\pi} + 1 = 0$

## 块级公式

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

# 代码展示

## Python 示例

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## JavaScript 示例

```javascript
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

# 图片展示

## 示例图片

![网络架构图](https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Neural_network_example.svg/1200px-Neural_network_example.svg.png)

## 图片说明

这是神经网络的基本架构示意图

!icon(🖼️)

---

# 视频演示

## 视频播放

!video(https://www.w3schools.com/html/mov_bbb.mp4)

## 视频说明

大熊、兔子和青蛙的可爱动画

!icon(🎬)

---

# 列表展示

## 无序列表

- React 组件化开发
- TypeScript 类型安全
- Vite 快速构建
- 3Blue1Brown 风格主题

## 有序列表

1. 安装依赖包
2. 创建项目结构
3. 编写组件代码
4. 配置构建工具
5. 启动开发服务器

!icon(📋)

---

# 自定义 HTML

## HTML 渲染

!html(<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px; color: white; text-align: center;"><h3>这是自定义 HTML</h3><p>支持任意 HTML 标签和样式</p></div>)

## 说明

可以使用 !html() 语法插入任意 HTML 内容

!icon(🎨)

---

# 引用

## 名言

> "数学是上帝书写宇宙的语言。"
> — 伽利略

> "代码是写给人看的，只是顺便让机器能运行。"
> — Donald Knuth

!icon(💭)

---

# 图标展示

## Emoji 图标

!icon(🎯)
!icon(🚀)
!icon(🔥)
!icon(💡)

## 用途

- 简单明了
- 无需图片文件
- 支持 Unicode 表情

!icon(✨)

---

# Markdown 完整支持

## 标题层级

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

## 文本样式

这是**粗体文本**

这是*斜体文本*

这是`行内代码`

这是~~删除线~~

## 链接

访问 [GitHub](https://github.com) 了解更多信息

访问 [百度](https://www.baidu.com) 搜索内容

!icon(📝)

---

# 分隔符示例

每个幻灯片用 --- 分隔

这是一页

---

这是下一页

使用三个或更多连字符可以分隔幻灯片

!icon(📄)

---

# 综合示例

## 多种元素混合

### 数学公式

二次方程求根公式：

$$
x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

### 代码实现

```python
import numpy as np

def solve_quadratic(a, b, c):
    discriminant = b**2 - 4*a*c
    if discriminant < 0:
        return "无实数根"

    x1 = (-b + np.sqrt(discriminant)) / (2*a)
    x2 = (-b - np.sqrt(discriminant)) / (2*a)
    return x1, x2

# 示例
print(solve_quadratic(1, -5, 6))
```

### 列表总结

- 计算判别式
- 判别式是否非负
- 应用求根公式
- 返回两个根

!icon(🎯)

---

# 总结

## 支持的内容类型

1. ✅ 数学公式（LaTeX）
2. ✅ 代码高亮
3. ✅ 图片展示
4. ✅ 视频播放
5. ✅ 列表
6. ✅ 自定义 HTML
7. ✅ 引用
8. ✅ 图标
9. ✅ 完整 Markdown

## 使用方法

- 使用 --- 分割幻灯片
- 使用 # ## ### 等创建标题
- 使用 - 创建列表项
- 使用 $$ 公式 $$ 创建块级公式
- 使用 $公式$ 创建行内公式

!icon(🎉)
