import React, { useState, useEffect, useRef } from 'react';
import { SlideTemplate, SlideContent, SlideElement } from './components/SlideTemplate';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import { darkTheme } from './styles/theme';
import { ThemeConfig } from './types/theme';
import {
  parseMarkdownToSlides,
  parseTableOfContents,
  TOCItem,
} from './parser';

interface FileItem {
  name: string;
  kind: 'file' | 'directory';
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
  isStatic?: boolean;
  content?: string;
  children?: FileItem[];
}

interface FileTreeItemProps {
  item: FileItem;
  depth: number;
  activeFile: string | null;
  onFileClick: (file: FileItem) => void;
  theme: ThemeConfig;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ item, depth, activeFile, onFileClick, theme }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (item.kind === 'directory') {
    return (
      <>
        <div
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '6px 15px',
            paddingLeft: `${15 + depth * 12}px`,
            fontSize: '13px',
            color: theme.colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            fontWeight: 500,
            opacity: 0.9
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
          <span style={{ fontSize: '14px' }}>📁</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
        </div>
        {isOpen && item.children?.map(child => (
          <FileTreeItem
            key={child.name}
            item={child}
            depth={depth + 1}
            activeFile={activeFile}
            onFileClick={onFileClick}
            theme={theme}
          />
        ))}
      </>
    );
  }

  return (
    <div
      onClick={() => onFileClick(item)}
      style={{
        padding: '6px 15px',
        paddingLeft: `${15 + depth * 12 + 16}px`,
        fontSize: '13px',
        color: activeFile === item.name ? theme.primaryColor : theme.colors.textSecondary,
        cursor: 'pointer',
        background: activeFile === item.name ? (theme.theme === 'dark' ? 'rgba(58,134,255,0.1)' : 'rgba(37,99,235,0.05)') : 'transparent',
        borderLeft: `3px solid ${activeFile === item.name ? theme.primaryColor : 'transparent'}`,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        if (activeFile !== item.name) e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
      }}
      onMouseLeave={(e) => {
        if (activeFile !== item.name) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ fontSize: '14px' }}>{item.isStatic ? '📚' : '📄'}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.name}
      </span>
    </div>
  );
};

export const App: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [showEditor, setShowEditor] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTOC, setShowTOC] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>('tutorial.md');
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activePreviewSlideIndex, setActivePreviewSlideIndex] = useState(0);
  const [fileList, setFileList] = useState<FileItem[]>([
    { name: 'tutorial.md', kind: 'file', isStatic: true }
  ]);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [editorWidth, setEditorWidth] = useState(550);
  const [tocHeight, setTocHeight] = useState(300);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [isResizingTOC, setIsResizingTOC] = useState(false);
  const [layoutOrder, setLayoutOrder] = useState<('sidebar' | 'editor' | 'preview')[]>(['sidebar', 'editor', 'preview']);
  const [draggingSection, setDraggingSection] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const { themeConfig: theme } = useTheme();

  const handleDragStart = (section: 'sidebar' | 'editor' | 'preview') => {
    setDraggingSection(section);
  };

  const handleDragOver = (e: React.DragEvent, targetSection: 'sidebar' | 'editor' | 'preview') => {
    e.preventDefault();
    if (draggingSection && draggingSection !== targetSection) {
      const newOrder = [...layoutOrder];
      const dragIdx = newOrder.indexOf(draggingSection as any);
      const targetIdx = newOrder.indexOf(targetSection);
      newOrder[dragIdx] = targetSection;
      newOrder[targetIdx] = draggingSection as any;
      setLayoutOrder(newOrder);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizingSidebar) {
        setSidebarWidth(Math.max(150, Math.min(400, e.clientX)));
      } else if (isResizingEditor) {
        const sidebarActual = showSidebar ? sidebarWidth : 0;
        setEditorWidth(Math.max(300, e.clientX - sidebarActual));
      } else if (isResizingTOC) {
        const sidebarElement = document.getElementById('sidebar-container');
        if (sidebarElement) {
          const rect = sidebarElement.getBoundingClientRect();
          const newHeight = rect.bottom - e.clientY;
          setTocHeight(Math.max(100, Math.min(rect.height - 150, newHeight)));
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      setIsResizingEditor(false);
      setIsResizingTOC(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizingSidebar || isResizingEditor || isResizingTOC) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingTOC ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingEditor, isResizingTOC, sidebarWidth, showSidebar]);

  const loadFile = async (file: FileItem) => {
    try {
      let text = '';
      if (file.isStatic) {
        const response = await fetch(`/${file.name}`);
        if (response.ok) {
          text = await response.text();
        }
      } else if (file.handle) {
        const fileData = await file.handle.getFile();
        text = await fileData.text();
      } else if (file.content) {
        text = file.content;
      }
      
      if (text) {
        setMarkdown(text);
        setActiveFile(file.name);
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const openFolder = async () => {
    try {
      // @ts-ignore - File System Access API
      const directoryHandle = await window.showDirectoryPicker();
      
      async function buildTree(handle: FileSystemDirectoryHandle): Promise<FileItem[]> {
        const items: FileItem[] = [];
        // @ts-ignore
        for await (const entry of handle.values()) {
          if (entry.kind === 'file' && entry.name.endsWith('.md')) {
            items.push({ name: entry.name, kind: 'file', handle: entry as FileSystemFileHandle });
          } else if (entry.kind === 'directory') {
            const children = await buildTree(entry as FileSystemDirectoryHandle);
            if (children.length > 0) {
              items.push({ name: entry.name, kind: 'directory', handle: entry as FileSystemDirectoryHandle, children });
            }
          }
        }
        return items.sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      }

      const tree = await buildTree(directoryHandle);
      
      if (tree.length > 0) {
        // 当打开新文件夹时，完全替换 fileList，只显示选中的文件夹内容
        setFileList([
          { name: directoryHandle.name, kind: 'directory', handle: directoryHandle, children: tree }
        ]);
        
        // 尝试加载第一个发现的文件
        const findFirstFile = (items: FileItem[]): FileItem | null => {
          for (const item of items) {
            if (item.kind === 'file') return item;
            if (item.children) {
              const found = findFirstFile(item.children);
              if (found) return found;
            }
          }
          return null;
        };
        const firstFile = findFirstFile(tree);
        if (firstFile) loadFile(firstFile);
      }
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Failed to open folder:', error);
      }
    }
  };

  useEffect(() => {
    loadFile({ name: 'tutorial.md', isStatic: true });
  }, []);

  const applySnippet = (snippet: string) => {
    const textarea = editorRef.current;
    if (!textarea) {
      setMarkdown(prev => `${prev}\n\n${snippet}`);
      return;
    }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = markdown.slice(0, start);
    const after = markdown.slice(end);
    const insertion = (before && !before.endsWith('\n') ? '\n' : '') + snippet;
    const next = before + insertion + (after.startsWith('\n') ? after : `\n${after}`);
    setMarkdown(next);
    requestAnimationFrame(() => {
      const pos = (before + insertion).length;
      textarea.selectionStart = textarea.selectionEnd = pos;
      textarea.focus();
    });
  };

  // 格式化行内 Markdown（如公式、加粗等）
  const formatInlineMarkdown = (text: string) => {
    if (!text) return '';
    // 处理行内公式 $...$ -> <span class="math-inline">...</span>
    return text.replace(/\$([^\$]+)\$/g, '<span class="math-inline">$1</span>');
  };

  // 解析 Markdown 为幻灯片

  const parseMarkdownToSlides = (md: string): SlideContent[] => {
    // 归一化换行符
    const normalizedMd = md.replace(/\r\n/g, '\n');
    // 支持 --- 作为分页符，支持前后空格，以及在文件开头或结尾的情况
    const slideBlocks = normalizedMd.split(/(?:\n|^)\s*---\s*(?:\n|$)/);
    const parsedSlides: SlideContent[] = [];

    slideBlocks.forEach((block, index) => {
      const lines = block.trim().split(/\r?\n/);
      const elements: SlideElement[] = [];
      let clickState = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.startsWith('# ')) {
          const raw = line.slice(2);
          elements.push({ id: `s${index}-e${i}`, type: 'title', content: formatInlineMarkdown(raw), clickState: 0 });
        } else if (line.startsWith('## ')) {
          const raw = line.slice(3);
          elements.push({ id: `s${index}-e${i}`, type: 'subtitle', content: formatInlineMarkdown(raw), clickState: clickState++ });
        } else if (line.startsWith('### ')) {
          const raw = line.slice(4);
          elements.push({ id: `s${index}-e${i}`, type: 'subtitle', content: formatInlineMarkdown(raw), clickState: clickState++, style: { fontSize: '24px', marginTop: '10px' } });
        } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
          // 每个列表项分配独立的 clickState 以实现逐条显示
          const isOrdered = /^\d+\.\s/.test(line);
          const bulletContent = isOrdered ? line.replace(/^\d+\.\s/, '') : line.slice(2);
          const listStart = isOrdered ? parseInt(line.match(/^(\d+)\./)![1]) : undefined;
          
          elements.push({ 
            id: `s${index}-e${i}`, 
            type: 'bullets', 
            content: [formatInlineMarkdown(bulletContent)], 
            clickState: clickState++,
            listType: isOrdered ? 'ol' : 'ul',
            listStart: listStart
          });
        } else if (line.startsWith('```')) {
          const language = line.slice(3).trim();
          let code = '';
          let j = i + 1;
          while (j < lines.length && !lines[j].startsWith('```')) {
            code += lines[j] + '\n';
            j++;
          }
          elements.push({ 
            id: `s${index}-e${i}`, 
            type: 'code', 
            content: code.trim(), 
            clickState: clickState++,
            language: language || 'text'
          });
          i = j;
        } else if (line.startsWith('> ')) {
          let quoteContent = line.slice(2);
          let j = i + 1;
          // 连续的引用行合并为一个 quote 块
          while (j < lines.length && lines[j].trim().startsWith('> ')) {
            quoteContent += '\n' + lines[j].trim().slice(2);
            j++;
          }
          elements.push({ id: `s${index}-e${i}`, type: 'quote', content: formatInlineMarkdown(quoteContent), clickState: clickState++ });
          i = j - 1;
        } else if (line.startsWith('|')) {
          // 检测表格
          let tableContent = line + '\n';
          let j = i + 1;
          while (j < lines.length && (lines[j].trim().startsWith('|') || lines[j].trim().startsWith('+-'))) {
            tableContent += lines[j] + '\n';
            j++;
          }
          // 只有当至少有两行（表头+分隔符）时才视为表格
          if (tableContent.split('\n').length >= 3) {
            elements.push({ id: `s${index}-e${i}`, type: 'table', content: tableContent.trim(), clickState: clickState++ });
            i = j - 1;
          } else {
            elements.push({ id: `s${index}-e${i}`, type: 'markdown', content: formatInlineMarkdown(line), clickState: clickState++ });
          }
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
        } else if (line.startsWith('!html(')) {
          let htmlContent = '';
          let j = i;
          let started = false;

          while (j < lines.length) {
            const rawLine = lines[j];
            let segment = rawLine;

            if (!started) {
              const markerIndex = rawLine.indexOf('!html(');
              if (markerIndex === -1) break;
              segment = rawLine.slice(markerIndex + '!html('.length);
              started = true;
            }

            const trimmed = segment.trimEnd();
            const hasClosing = trimmed.endsWith(')');
            const cleaned = hasClosing ? trimmed.replace(/\)\s*$/, '') : segment;

            htmlContent += htmlContent ? `\n${cleaned}` : cleaned;

            if (hasClosing) {
              break;
            }

            j++;
          }

          elements.push({
            id: `s${index}-e${i}`,
            type: 'html',
            content: htmlContent,
            clickState: clickState++,
          });

          i = j;
        } else if (line.trim().startsWith('$$')) {
          let latexContent = '';
          let j = i;
          let started = false;
          let foundEnd = false;

          while (j < lines.length) {
            let currentLine = lines[j];
            
            if (!started) {
              const startIdx = currentLine.indexOf('$$');
              currentLine = currentLine.slice(startIdx + 2);
              started = true;
            }

            const endIdx = currentLine.indexOf('$$');
            if (endIdx !== -1) {
              latexContent += (latexContent ? '\n' : '') + currentLine.slice(0, endIdx);
              foundEnd = true;
              break;
            } else {
              latexContent += (latexContent ? '\n' : '') + currentLine;
            }
            j++;
          }

          elements.push({ 
            id: `s${index}-e${i}`, 
            type: 'math', 
            content: { latex: latexContent.trim(), displayMode: true }, 
            clickState: clickState++ 
          });
          
          if (foundEnd) i = j;
        } else {
          elements.push({ id: `s${index}-e${i}`, type: 'markdown', content: formatInlineMarkdown(line), clickState: clickState++ });
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
    setActivePreviewSlideIndex(0);
    
    // 使用统一的 parser 解析目录
    setToc(parseTableOfContents(markdown));
  }, [markdown]);

  useEffect(() => {
    if (activeFile) {
      setFileList(prev => {
        const index = prev.findIndex(f => f.name === activeFile);
        if (index !== -1 && prev[index].content !== undefined && prev[index].content !== markdown) {
          const newList = [...prev];
          newList[index] = { ...newList[index], content: markdown };
          return newList;
        }
        return prev;
      });
    }
  }, [markdown, activeFile]);

  const scrollToLine = (lineIndex: number) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const lines = textarea.value.split('\n');
    let offset = 0;
    for (let i = 0; i < lineIndex; i++) {
      offset += lines[i].length + 1; // +1 for newline
    }

    textarea.focus();
    textarea.setSelectionRange(offset, offset);
    
    // 粗略估算滚动位置
    const lineHeight = 24; // 1.7 line-height * 14px font size is roughly 24px
    textarea.scrollTop = lineIndex * lineHeight - 100;

    // 同步幻灯片预览
    const mdLines = markdown.split('\n');
    let slideIndex = 0;
    for (let i = 0; i < lineIndex; i++) {
      if (mdLines[i].trim() === '---') {
        slideIndex++;
      }
    }
    setActivePreviewSlideIndex(slideIndex);
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setMarkdown(content);
        setActiveFile(file.name);
        
        // 将文件添加到左侧列表（如果不存在则添加，存在则更新内容）
        setFileList(prev => {
          const index = prev.findIndex(f => f.name === file.name);
          if (index !== -1) {
            const newList = [...prev];
            newList[index] = { ...newList[index], content };
            return newList;
          }
          return [...prev, { name: file.name, kind: 'file', content }];
        });
      };
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
            letterSpacing: '-0.5px',
            textShadow: theme.theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <img
              src="/logo.jpg"
              alt="Md2Slide logo"
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                objectFit: 'cover',
                boxShadow: theme.theme === 'dark'
                  ? '0 0 16px rgba(58,134,255,0.6)'
                  : '0 0 10px rgba(37,99,235,0.35)',
                border: theme.theme === 'dark'
                  ? '1px solid rgba(148,163,184,0.6)'
                  : '1px solid rgba(148,163,184,0.4)'
              }}
            />
            <span style={{
              background: theme.theme === 'dark'
                ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`
                : 'none',
              WebkitBackgroundClip: theme.theme === 'dark' ? 'text' : 'initial',
              WebkitTextFillColor: theme.theme === 'dark' ? 'transparent' : theme.colors.text,
              color: theme.theme === 'dark' ? 'transparent' : theme.colors.text,
            }}>
              Md2Slide
            </span>
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
            onClick={() => setShowHelp(true)}
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
            帮助文档
          </button>
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

      {showHelp && (
        <div
          onClick={() => setShowHelp(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 50
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '90%',
              maxWidth: '780px',
              maxHeight: '80vh',
              background: theme.colors.surface,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme === darkTheme ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 40px rgba(15,23,42,0.18)',
              padding: '20px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text }}>帮助文档</div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                  快速了解如何使用 Md2Slide 和自定义语法
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  background: 'transparent',
                  borderRadius: '999px',
                  width: 28,
                  height: 28,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            </div>
            <div
              style={{
                marginTop: '4px',
                padding: '10px 0',
                borderTop: `1px solid ${theme.colors.border}`,
                borderBottom: `1px solid ${theme.colors.border}`,
                fontSize: '13px',
                color: theme.colors.textSecondary,
                display: 'flex',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', color: theme.colors.text }}>基础操作</div>
                <div>左侧编辑 Markdown，右侧实时预览幻灯片。</div>
                <div>使用 <code>---</code> 分隔不同的幻灯片。</div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '12px', marginBottom: '4px', color: theme.colors.text }}>快捷键</div>
                <div>空格 / 右方向键：下一步 / 下一页</div>
                <div>左方向键：上一步 / 上一页</div>
              </div>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '4px',
                fontSize: '13px',
                color: theme.colors.textSecondary,
                lineHeight: 1.7
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>标题与分隔</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code># 标题</code>：幻灯片主标题</span>
                  <button
                    onClick={() => applySnippet('# 🧠 **深度学习，不止于理论**')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span><code>## 副标题</code> / <code>---</code>：副标题与分页</span>
                  <button
                    onClick={() => applySnippet('## 学习目标\n\n---')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>列表与引用</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code>- 列表项</code>：支持逐条出现的项目符号列表</span>
                  <button
                    onClick={() => applySnippet('- 优点一：直观形象\n- 优点二：结构清晰\n- 优点三：便于演示')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span><code>&gt; 引用内容</code>：引用块，高亮显示重要语句</span>
                  <button
                    onClick={() => applySnippet('> 所有复杂的概念，都可以被讲清楚。')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>数学公式</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code>$a^2 + b^2 = c^2$</code>：行内公式</span>
                  <button
                    onClick={() => applySnippet('勾股定理：$a^2 + b^2 = c^2$')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span><code>$$E = mc^2$$</code>：块级公式</span>
                  <button
                    onClick={() => applySnippet('$$\nE = mc^2\n$$')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>代码块</div>
                <div>使用三个反引号包裹代码，例如：</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>
                    <code>```python</code> 开头，<code>```</code> 结尾，可以高亮 Python 代码。
                  </span>
                  <button
                    onClick={() => applySnippet('```python\nfor epoch in range(10):\n    print(\"Train\", epoch)\n```')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>内置可视化命令</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code>!icon(✨)</code>：插入大图标装饰</span>
                  <button
                    onClick={() => applySnippet('!icon(🚀)')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code>!grid</code>：显示 3Blue1Brown 风格的网格背景</span>
                  <button
                    onClick={() => applySnippet('!grid')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span><code>!vector</code>：展示示例向量</span>
                  <button
                    onClick={() => applySnippet('!vector')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>媒体与 HTML</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code>!image(url)</code>：插入图片</span>
                  <button
                    onClick={() => applySnippet('!image(https://picsum.photos/800/400)')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span><code>!video(url)</code>：插入视频</span>
                  <button
                    onClick={() => applySnippet('!video(https://www.w3schools.com/html/mov_bbb.mp4)')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span><code>!html(&lt;div&gt;自定义 HTML&lt;/div&gt;)</code>：直接渲染 HTML 片段</span>
                  <button
                    onClick={() => applySnippet('!html(<div style=\"padding:12px;border-radius:8px;background:#111827;color:#F9FAFB\">自定义 HTML 内容</div>)')}
                    style={{
                      padding: '2px 8px',
                      borderRadius: 999,
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      fontSize: 11,
                      cursor: 'pointer',
                      color: theme.colors.textSecondary
                    }}
                  >
                    一键示例
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>建议</div>
                <div>将一页内容控制在 3~6 行，保证演示效果清晰。</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'auto' : 'calc(100vh - 60px)',
        minHeight: 'calc(100vh - 60px)',
        overflow: 'hidden',
        background: theme.colors.background,
        transition: 'background 0.3s ease'
      }}>
        {layoutOrder.map((section, index) => {
          if (section === 'sidebar' && showSidebar && !isMobile && showEditor) {
            return (
              <React.Fragment key="sidebar">
                <div 
                  id="sidebar-container"
                  onDragOver={(e) => handleDragOver(e, 'sidebar')}
                  style={{
                    width: `${sidebarWidth}px`,
                    minWidth: '150px',
                    borderRight: index < layoutOrder.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    background: theme.colors.surface,
                    height: '100%',
                    position: 'relative',
                    opacity: draggingSection === 'sidebar' ? 0.5 : 1
                  }}
                >
                  <div 
                    draggable
                    onDragStart={() => handleDragStart('sidebar')}
                    onDragEnd={() => setDraggingSection(null)}
                    style={{
                      padding: '10px 15px',
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      borderBottom: `1px solid ${theme.colors.border}`,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'grab'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>⠿</span>
                      文件目录
                    </div>
                    {typeof window !== 'undefined' && 'showDirectoryPicker' in window && (
                      <button
                        onClick={openFolder}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: theme.primaryColor,
                          cursor: 'pointer',
                          fontSize: '10px',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          textTransform: 'none',
                          letterSpacing: '0',
                          fontWeight: 600
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        打开文件夹
                      </button>
                    )}
                  </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                  {fileList.map(file => (
                    <FileTreeItem
                      key={file.name}
                      item={file}
                      depth={0}
                      activeFile={activeFile}
                      onFileClick={loadFile}
                      theme={theme}
                    />
                  ))}
                </div>

                {/* Vertical Resize Handle for TOC */}
                <div
                  onMouseDown={() => setIsResizingTOC(true)}
                  style={{
                    height: '4px',
                    width: '100%',
                    cursor: 'row-resize',
                    background: isResizingTOC ? theme.primaryColor : 'transparent',
                    position: 'absolute',
                    bottom: `${showTOC ? tocHeight : 35}px`,
                    zIndex: 10,
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                  onMouseLeave={(e) => !isResizingTOC && (e.currentTarget.style.background = 'transparent')}
                />

                {/* TOC Section */}
                <div style={{
                  borderTop: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  height: showTOC ? `${tocHeight}px` : '35px',
                  minHeight: '35px',
                  background: theme.theme === 'dark' ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
                  transition: isResizingTOC ? 'none' : 'height 0.3s ease'
                }}>
                  <div 
                    onClick={() => setShowTOC(!showTOC)}
                    style={{
                      padding: '10px 15px',
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      height: '35px',
                      flexShrink: 0
                    }}
                  >
                    文章大纲
                    <span style={{ transform: showTOC ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', fontSize: '10px' }}>▶</span>
                  </div>
                  {showTOC && (
                    <div style={{ 
                      flex: 1, 
                      overflowY: 'auto', 
                      padding: '5px 0 15px 0'
                    }}>
                      {toc.length > 0 ? (
                        toc.map(item => (
                          <div
                            key={item.id}
                            onClick={() => scrollToLine(item.lineIndex)}
                            style={{
                              padding: '5px 15px',
                              paddingLeft: `${15 + (item.level - 1) * 12}px`,
                              fontSize: '12px',
                              color: theme.colors.textSecondary,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              transition: 'all 0.2s',
                              opacity: 0.8
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = theme.primaryColor;
                              e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = theme.colors.textSecondary;
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {item.text}
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '10px 15px', fontSize: '12px', color: theme.colors.textSecondary, opacity: 0.5, fontStyle: 'italic' }}>
                          暂无标题内容
                        </div>
                      )}
                    </div>
                  )}
                </div>

                  {/* Horizontal Resize Handle for Sidebar */}
                  {!isMobile && index < layoutOrder.length - 1 && (
                    <div
                      onMouseDown={() => setIsResizingSidebar(true)}
                      style={{
                        width: '4px',
                        height: '100%',
                        cursor: 'col-resize',
                        position: 'absolute',
                        right: '-2px',
                        top: 0,
                        zIndex: 20,
                        background: isResizingSidebar ? theme.primaryColor : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                      onMouseLeave={(e) => !isResizingSidebar && (e.currentTarget.style.background = 'transparent')}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          }

          if (section === 'editor' && showEditor) {
            return (
              <React.Fragment key="editor">
                <div 
                  onDragOver={(e) => handleDragOver(e, 'editor')}
                  style={{
                    width: isMobile ? '100%' : `${editorWidth}px`,
                    flex: isResizingEditor || isMobile ? 'none' : (index === layoutOrder.length - 1 ? 1 : 'none'),
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: isMobile ? '100%' : '300px',
                    position: 'relative',
                    background: theme === darkTheme ? '#0a0a0a' : '#ffffff',
                    borderRight: index < layoutOrder.length - 1 && !isMobile ? `1px solid ${theme.colors.border}` : 'none',
                    opacity: draggingSection === 'editor' ? 0.5 : 1
                  }}
                >
                  <div 
                    draggable
                    onDragStart={() => handleDragStart('editor')}
                    onDragEnd={() => setDraggingSection(null)}
                    style={{
                      padding: '10px 20px',
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      borderBottom: `1px solid ${theme.colors.border}`,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'grab'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>⠿</span>
                      {!isMobile && (
                        <button
                          onClick={() => setShowSidebar(!showSidebar)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: theme.colors.textSecondary,
                            cursor: 'pointer',
                            padding: '2px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          title={showSidebar ? "折叠目录" : "展开目录"}
                        >
                          {showSidebar ? '◀' : '▶'}
                        </button>
                      )}
                      Markdown 编辑器
                    </div>
                    {activeFile && (
                      <span style={{ fontSize: '10px', opacity: 0.6, textTransform: 'none' }}>
                        正在编辑: {activeFile}
                      </span>
                    )}
                  </div>
                  <textarea
                    ref={editorRef}
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

                  {/* Horizontal Resize Handle for Editor */}
                  {!isMobile && index < layoutOrder.length - 1 && (
                    <div
                      onMouseDown={() => setIsResizingEditor(true)}
                      style={{
                        width: '4px',
                        height: '100%',
                        cursor: 'col-resize',
                        position: 'absolute',
                        right: '-2px',
                        top: 0,
                        zIndex: 20,
                        background: isResizingEditor ? theme.primaryColor : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                      onMouseLeave={(e) => !isResizingEditor && (e.currentTarget.style.background = 'transparent')}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          }

          if (section === 'preview') {
            return (
              <React.Fragment key="preview">
                <div 
                  onDragOver={(e) => handleDragOver(e, 'preview')}
                  style={{
                    flex: !showEditor || index === layoutOrder.length - 1 ? 1 : 'none',
                    width: showEditor && index < layoutOrder.length - 1 ? '500px' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: isMobile ? '100%' : '300px',
                    position: 'relative',
                    opacity: draggingSection === 'preview' ? 0.5 : 1,
                    borderRight: index < layoutOrder.length - 1 && !isMobile ? `1px solid ${theme.colors.border}` : 'none'
                  }}
                >
                  <div 
                    draggable
                    onDragStart={() => handleDragStart('preview')}
                    onDragEnd={() => setDraggingSection(null)}
                    style={{
                      padding: '10px 20px',
                      fontSize: '11px',
                      color: theme.colors.textSecondary,
                      borderBottom: `1px solid ${theme.colors.border}`,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'grab',
                      background: theme.colors.surface
                    }}
                  >
                    <span style={{ fontSize: '12px', opacity: 0.5 }}>⠿</span>
                    幻灯片预览
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <SlideTemplate 
                      slides={slides} 
                      activeSlideIndex={activePreviewSlideIndex}
                      onSlideChange={(index) => setActivePreviewSlideIndex(index)}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          }
          return null;
        })}
      </main>
    </div>
  );
};
