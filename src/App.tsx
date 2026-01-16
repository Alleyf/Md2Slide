import React, { useState, useEffect } from 'react';
import { SlideTemplate, SlideContent, SlideElement } from './components/SlideTemplate';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import { darkTheme } from './styles/theme';

// 初始示例 Markdown
const INITIAL_MARKDOWN = `# 欢迎使用 Markdown2Slide

## 打造 3Blue1Brown 风格的演示文稿

### 核心特性
- 🎨 **3B1B 风格**：深色背景，明亮配色
- ⚡ **动态展示**：支持逐步显示内容
- 📊 **数学公式**：支持 LaTeX 公式
- 💻 **代码支持**：内置语法高亮
- 🎮 **键盘控制**：使用空格或方向键导航

---

# 数学与可视化

## 欧拉公式

$$e^{i\\pi} + 1 = 0$$

## 几何变换

!grid
!vector

!icon(📐)

---

# 代码演示

## Python 快速排序

\`\`\`python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)
\`\`\`

!icon(💻)

---

# 多媒体与引用

## 外部资源

> 每一个伟大的演示都始于一个简洁的 Markdown 文件。

!video(https://www.w3schools.com/html/mov_bbb.mp4)

!icon(✨)
`;

export const App: React.FC = () => {
  const [markdown, setMarkdown] = useState(INITIAL_MARKDOWN);
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [showEditor, setShowEditor] = useState(true);
  const { themeConfig: theme } = useTheme();

  // 解析 Markdown 为幻灯片
  const parseMarkdownToSlides = (md: string): SlideContent[] => {
    const slideBlocks = md.split(/\n---\n/);
    const parsedSlides: SlideContent[] = [];

    slideBlocks.forEach((block, index) => {
      const lines = block.trim().split('\n');
      const elements: SlideElement[] = [];
      let clickState = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('# ')) {
          elements.push({ id: `s${index}-e${i}`, type: 'title', content: line.slice(2), clickState: 0 });
        } else if (line.startsWith('## ')) {
          elements.push({ id: `s${index}-e${i}`, type: 'subtitle', content: line.slice(3), clickState: clickState++ });
        } else if (line.startsWith('### ')) {
          elements.push({ id: `s${index}-e${i}`, type: 'subtitle', content: line.slice(4), clickState: clickState++, style: { fontSize: '24px', marginTop: '10px' } });
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // 每个列表项分配独立的 clickState 以实现逐条显示
          const bulletContent = line.slice(2);
          elements.push({ id: `s${index}-e${i}`, type: 'bullets', content: [bulletContent], clickState: clickState++ });
        } else if (line.startsWith('```')) {
          let code = '';
          let j = i + 1;
          while (j < lines.length && !lines[j].startsWith('```')) {
            code += lines[j] + '\n';
            j++;
          }
          elements.push({ id: `s${index}-e${i}`, type: 'code', content: code.trim(), clickState: clickState++ });
          i = j;
        } else if (line.startsWith('> ')) {
          elements.push({ id: `s${index}-e${i}`, type: 'quote', content: line.slice(2), clickState: clickState++ });
        } else if (line.startsWith('!icon(')) {
          const match = line.match(/!icon\(([^)]+)\)/);
          if (match) elements.push({ id: `s${index}-e${i}`, type: 'icon', content: match[1], clickState: clickState++ });
        } else if (line.startsWith('!grid')) {
          elements.push({ id: `s${index}-e${i}`, type: 'grid', content: '', clickState: clickState++ });
        } else if (line.startsWith('!vector')) {
          elements.push({ id: `s${index}-e${i}`, type: 'vector', content: '', clickState: clickState++ });
        } else if (line.startsWith('!image(')) {
          const match = line.match(/!image\(([^)]+)\)/);
          if (match) elements.push({ id: `s${index}-e${i}`, type: 'image', content: match[1], clickState: clickState++ });
        } else if (line.startsWith('!video(')) {
          const match = line.match(/!video\(([^)]+)\)/);
          if (match) elements.push({ id: `s${index}-e${i}`, type: 'video', content: match[1], clickState: clickState++ });
        } else if (line.startsWith('$$')) {
           let latex = line.replace(/\$\$/g, '');
           if (!latex && i + 1 < lines.length && !lines[i+1].startsWith('$$')) {
              latex = lines[i+1];
              i++;
              if (i + 1 < lines.length && lines[i+1].startsWith('$$')) i++;
           }
           elements.push({ id: `s${index}-e${i}`, type: 'math', content: { latex, displayMode: true }, clickState: clickState++ });
        } else {
          elements.push({ id: `s${index}-e${i}`, type: 'markdown', content: line, clickState: clickState++ });
        }
      }

      if (elements.length > 0) {
        parsedSlides.push({ id: `slide-${index}`, elements });
      }
    });

    return parsedSlides;
  };

  useEffect(() => {
    setSlides(parseMarkdownToSlides(markdown));
  }, [markdown]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setMarkdown(event.target?.result as string);
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    alert('Markdown 已复制到剪贴板');
  };

  return (
    <div style={{ background: theme.colors.background, minHeight: '100vh', color: theme.colors.text, fontFamily: theme.fontFamily, transition: 'background 0.3s ease, color 0.3s ease' }}>
      {/* Header */}
      <header style={{
        padding: '10px 25px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.colors.surface,
        height: '60px',
        boxSizing: 'border-box',
        transition: 'background 0.3s ease, border-color 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 800,
            background: theme.theme === 'dark' ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})` : 'transparent',
            WebkitBackgroundClip: theme.theme === 'dark' ? 'text' : 'initial',
            WebkitTextFillColor: theme.theme === 'dark' ? 'transparent' : theme.colors.text,
            color: theme.theme === 'dark' ? 'transparent' : theme.colors.text,
            letterSpacing: '-0.5px',
            textShadow: theme.theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
          }}>
            Markdown2Slide
          </h1>
          <div style={{ height: '15px', width: '1px', background: theme.colors.border }} />
          <span style={{ color: theme.colors.textSecondary, fontSize: '12px', fontWeight: 500 }}>3Blue1Brown Presentation Tool</span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleCopy}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '6px',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              fontSize: '13px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = theme === darkTheme ? '#555' : '#d1d5db'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.colors.border}
          >
            复制内容
          </button>
          <label style={{
            padding: '6px 12px',
            background: 'transparent',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '6px',
            color: theme.colors.textSecondary,
            cursor: 'pointer',
            fontSize: '13px',
            transition: 'all 0.2s'
          }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = theme === darkTheme ? '#555' : '#d1d5db'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.colors.border}
          >
            导入文件
            <input type="file" accept=".md" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button
            onClick={() => setShowEditor(!showEditor)}
            style={{
              padding: '6px 16px',
              background: showEditor ? theme.primaryColor : theme === darkTheme ? '#222' : '#f3f4f6',
              border: 'none',
              borderRadius: '6px',
              color: showEditor ? 'white' : theme.colors.text,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            {showEditor ? '全屏预览' : '分屏编辑'}
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        display: 'flex',
        height: 'calc(100vh - 60px)',
        overflow: 'hidden',
        background: theme.colors.background,
        transition: 'background 0.3s ease'
      }}>
        {/* Editor Side */}
        {showEditor && (
          <div style={{
            width: '450px',
            minWidth: '350px',
            borderRight: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            background: theme === darkTheme ? '#0a0a0a' : '#ffffff',
            transition: 'all 0.3s ease'
          }}>
            <div style={{
              padding: '10px 20px',
              fontSize: '11px',
              color: theme.colors.textSecondary,
              borderBottom: `1px solid ${theme.colors.border}`,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 700
            }}>
              Markdown 编辑器
            </div>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                padding: '20px',
                color: theme.colors.textSecondary,
                fontSize: '14px',
                fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                resize: 'none',
                outline: 'none',
                lineHeight: '1.7',
                tabSize: 2
              }}
              placeholder="在此输入 Markdown 内容..."
            />
            <div style={{
              padding: '12px 20px',
              fontSize: '12px',
              color: theme.colors.textSecondary,
              borderTop: `1px solid ${theme.colors.border}`,
              background: theme.colors.surface
            }}>
              <span style={{ color: theme.primaryColor }}>技巧:</span> 使用 <code style={{ color: theme.colors.textSecondary }}>---</code> 分隔幻灯片。
            </div>
          </div>
        )}

        {/* Preview Side */}
        <div style={{
          flex: 1,
          padding: showEditor ? '30px' : '0',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          transition: 'padding 0.3s ease'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            maxWidth: showEditor ? 'none' : '100%',
            aspectRatio: '16/9',
            boxShadow: showEditor ? (theme === darkTheme ? '0 20px 50px rgba(0,0,0,0.5)' : '0 20px 50px rgba(0,0,0,0.1)') : 'none',
            borderRadius: showEditor ? '12px' : '0',
            overflow: 'hidden',
            border: showEditor ? `1px solid ${theme.colors.border}` : 'none',
            transition: 'all 0.3s ease',
            background: theme.colors.background
          }}>
            <SlideTemplate slides={slides} />
          </div>
        </div>
      </main>
    </div>
  );
};
