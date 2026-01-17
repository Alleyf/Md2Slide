import React, { useState, useEffect, useRef, useMemo } from 'react';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import { ArrowUp, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen, Layout, HelpCircle, Menu, X, Settings, Puzzle } from 'lucide-react';
import { SlideTemplate } from './components/SlideTemplate';
import { SlideContent, SlideElement } from './types/slide';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './context/ThemeContext';
import { darkTheme } from './styles/theme';
import { ThemeConfig } from './types/theme';
import { FileItem } from './types/file';
import { FileTree } from './components/FileTree';
import { Toolbar } from './components/Toolbar';
import { HelpModal } from './components/HelpModal';
import { downloadPDF } from './utils/export/pdf';
import { downloadPPTX } from './utils/export/pptx';
import { downloadWord } from './utils/export/word';
import { parseMarkdownToSlides, parseTableOfContents, TOCItem } from './parser';
import { PresenterView } from './components/PresenterView';
import { formatInlineMarkdown } from './parser/markdownHelpers';
import { htmlToMarkdown } from './utils/htmlToMarkdown';
import { getStorageItem, setStorageItem, storageKeys } from './utils/storage';
import { AIAssistant } from './components/AIAssistant';
import { ThemeMarketplace } from './components/ThemeMarketplace';
import { PluginMarketplace } from './components/PluginMarketplace';
import { pluginManager } from './plugins/PluginManager';
import { ThemePlugin } from './plugins/ThemePlugin';

interface AppSettings {
  useDelimiterPagination: boolean;
  useHeadingPagination: boolean;
  minHeadingLevel: number;
  enableAutoAnimate: boolean;
  autoAnimateDuration: number;
  autoAnimateEasing: string;
}

const defaultAppSettings: AppSettings = {
  useDelimiterPagination: true,
  useHeadingPagination: true,
  minHeadingLevel: 1,
  enableAutoAnimate: false,
  autoAnimateDuration: 600,
  autoAnimateEasing: 'ease-in-out',
};

export const App: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  const [showEditor, setShowEditor] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<'usage' | 'shortcuts' | 'about'>('usage');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTOC, setShowTOC] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>('tutorial.md');
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activePreviewSlideIndex, setActivePreviewSlideIndex] = useState(0);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [fileList, setFileList] = useState<FileItem[]>([
    { name: 'tutorial.md', kind: 'file', isStatic: true }
  ]);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [editorWidth, setEditorWidth] = useState(550);
  const [tocHeight, setTocHeight] = useState(300);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [isResizingTOC, setIsResizingTOC] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showThemeMarketplace, setShowThemeMarketplace] = useState(false);
  const [showPluginMarketplace, setShowPluginMarketplace] = useState(false);
  const [inputModal, setInputModal] = useState<{
    show: boolean;
    type: 'link' | 'image' | 'video' | 'audio' | 'rename' | 'confirm' | 'create';
    value: string;
    titleValue?: string;
    message?: string;
    callback?: (val: string, title?: string) => void;
  }>({ show: false, type: 'link', value: '' });
  type LayoutSection = 'sidebar' | 'editor' | 'preview';
  const [layoutOrder, setLayoutOrder] = useState<LayoutSection[]>(['sidebar', 'editor', 'preview']);
  const [draggingSection, setDraggingSection] = useState<LayoutSection | null>(null);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') {
      return defaultAppSettings;
    }
    return getStorageItem<AppSettings>(storageKeys.APP_SETTINGS, defaultAppSettings);
  });
  const { themeConfig: theme } = useTheme();

  const isPresenterWindow = typeof window !== 'undefined' && window.location.search.includes('presenter=true');

  if (isPresenterWindow) {
    const savedSlides = localStorage.getItem('md2slide_presenter_slides');
    const presenterSlides = savedSlides ? JSON.parse(savedSlides) : slides;
    return <PresenterView slides={presenterSlides} initialIndex={activePreviewSlideIndex} />;
  }

  const handleDragStart = (section: LayoutSection) => {
    setDraggingSection(section);
  };

  const handleDragOver = (e: React.DragEvent, targetSection: LayoutSection) => {
    e.preventDefault();
    if (draggingSection && draggingSection !== targetSection) {
      const newOrder = [...layoutOrder];
      const dragIdx = newOrder.indexOf(draggingSection);
      const targetIdx = newOrder.indexOf(targetSection);
      newOrder[dragIdx] = targetSection;
      newOrder[targetIdx] = draggingSection;
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

      // 优先从 localStorage 读取保存的内容
      const storageKey = `md2slide_file_${file.name}`;
      const savedContent = localStorage.getItem(storageKey);

      if (savedContent !== null) {
        text = savedContent;
      } else if (file.isStatic) {
        const response = await fetch(`/${file.name}`);
        if (response.ok) {
          text = await response.text();
        }
      } else if (file.handle) {
        const fileData = await (file.handle as FileSystemFileHandle).getFile();
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

  const deleteFile = (fileName: string) => {
    setInputModal({
      show: true,
      type: 'confirm',
      value: '',
      message: `确定要删除 ${fileName} 吗？`,
      callback: () => {
        setFileList(prev => {
          const removeRecursive = (items: FileItem[]): FileItem[] => {
            return items
              .filter(item => item.name !== fileName)
              .map(item => ({
                ...item,
                children: item.children ? removeRecursive(item.children) : undefined
              }));
          };
          return removeRecursive(prev);
        });
        if (activeFile === fileName) {
          setActiveFile(null);
          setMarkdown('');
        }
      }
    });
  };

  const handleExportPDF = (item: FileItem) => {
    // 如果是当前正在编辑的文件，直接用当前的 markdown
    if (activeFile === item.name) {
      downloadPDF(slides);
    } else {
      // 否则需要加载并解析文件内容后再导出
      loadFile(item).then(() => {
        // 由于 setMarkdown 是异步的，这里可能需要一点延迟或更复杂的逻辑
        // 但简单起见，提示用户先打开文件再导出
        alert('请先打开该文件再进行导出');
      });
    }
  };

  const handleExportPPTX = (item: FileItem) => {
    if (activeFile === item.name) {
      downloadPPTX(slides);
    } else {
      loadFile(item).then(() => {
        alert('请先打开该文件再进行导出');
      });
    }
  };

  const handleExportWord = (item: FileItem) => {
    if (activeFile === item.name) {
      downloadWord(slides);
    } else {
      loadFile(item).then(() => {
        alert('请先打开该文件再进行导出');
      });
    }
  };

  const handleImportFile = async (fileType: 'markdown' | 'html' = 'markdown') => {
    try {
      let acceptTypes: { [key: string]: string[] } = { 'text/markdown': ['.md'] };
      
      if (fileType === 'html') {
        acceptTypes = { 'text/html': ['.html', '.htm'] };
      }
      
      // @ts-ignore
      const [handle] = await window.showOpenFilePicker({
        types: [{
          description: fileType === 'html' ? 'HTML Files' : 'Markdown Files',
          accept: acceptTypes,
        }],
      });
      const file = await handle.getFile();
      const content = await file.text();

      if (fileType === 'html') {
        const markdownContent = htmlToMarkdown(content);
        const finalName = file.name.replace(/\.html?$/i, '.md');
        const newFile: FileItem = {
          name: finalName,
          kind: 'file',
          content: markdownContent,
        };
        setFileList(prev => [...prev, newFile]);
        loadFile(newFile);
      } else {
        const newFile: FileItem = {
          name: file.name,
          kind: 'file',
          content,
          handle: handle
        };
        setFileList(prev => [...prev, newFile]);
        loadFile(newFile);
      }
    } catch (err) {
      console.error(`${fileType === 'html' ? 'HTML' : 'Markdown'} Import failed:`, err);
    }
  };

  const renameFile = (oldName: string) => {
    setInputModal({
      show: true,
      type: 'rename',
      value: oldName,
      callback: (newName) => {
        if (newName && newName !== oldName) {
          setFileList(prev => {
            const renameRecursive = (items: FileItem[]): FileItem[] => {
              return items.map(item => {
                if (item.name === oldName) {
                  return { ...item, name: newName };
                }
                if (item.children) {
                  return { ...item, children: renameRecursive(item.children) };
                }
                return item;
              });
            };
            return renameRecursive(prev);
          });
          if (activeFile === oldName) {
            setActiveFile(newName);
          }
        }
      }
    });
  };

  const createFile = (parentItem: FileItem) => {
    setInputModal({
      show: true,
      type: 'create',
      value: '',
      callback: (fileName) => {
        if (fileName && fileName.trim()) {
          // 确保文件名以 .md 结尾
          const finalFileName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;
          
          // 检查文件名是否已存在
          const exists = (items: FileItem[]): boolean => {
            for (const item of items) {
              if (item.name === finalFileName && item.kind === 'file') {
                return true;
              }
              if (item.children) {
                if (exists(item.children)) return true;
              }
            }
            return false;
          };
          
          if (exists(fileList)) {
            alert(`文件 ${finalFileName} 已存在，请选择其他文件名`);
            return;
          }

          // 创建新文件
          const newFile: FileItem = {
            name: finalFileName,
            kind: 'file',
            content: '', // 初始化为空内容
            isStatic: false
          };

          // 如果父项是目录，则在该目录下创建文件；否则在根目录创建
          if (parentItem.kind === 'directory') {
            // 在指定目录下创建新文件
            const createInDir = (items: FileItem[]): FileItem[] => {
              return items.map(item => {
                if (item.name === parentItem.name && item.kind === 'directory') {
                  return {
                    ...item,
                    children: [...(item.children || []), newFile]
                  };
                }
                if (item.children) {
                  return { ...item, children: createInDir(item.children) };
                }
                return item;
              });
            };
            setFileList(prev => createInDir(prev));
          } else {
            // 在根目录创建文件（如果父项不是目录，可能是当前活动文件）
            setFileList(prev => [...prev, newFile]);
          }
          
          // 自动打开新文件并设置初始内容
          setMarkdown('');
          setActiveFile(finalFileName);
        }
      }
    });
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
    loadFile({ name: 'tutorial.md', kind: 'file', isStatic: true });
  }, []);

  const applySnippet = (beforeStr: string, afterStr: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = markdown.slice(start, end);
    
    // 检查是否是行首语法 (标题、列表、引用)
    const isLineStart = beforeStr.startsWith('#') || beforeStr.startsWith('- ') || beforeStr.startsWith('1. ') || beforeStr.startsWith('> ');
    
    if (isLineStart) {
      const lastNewLine = markdown.lastIndexOf('\n', start - 1);
      const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
      const lineEnd = markdown.indexOf('\n', start);
      const actualLineEnd = lineEnd === -1 ? markdown.length : lineEnd;
      const lineText = markdown.slice(lineStart, actualLineEnd);
      
      // 对于行首语法，我们需要替换整行内容以支持 Undo
      // 先选中整行
      textarea.focus();
      textarea.setSelectionRange(lineStart, actualLineEnd);
      
      let newLineText = '';
      if (lineText.startsWith(beforeStr)) {
        newLineText = lineText.slice(beforeStr.length);
      } else {
        newLineText = beforeStr + lineText;
      }
      
      // 使用 execCommand 插入，这样支持 Ctrl+Z
      document.execCommand('insertText', false, newLineText);
      
      // 恢复光标位置
      const offset = newLineText.length - lineText.length;
      const newStart = Math.max(lineStart, start + offset);
      const newEnd = Math.max(lineStart, end + offset);
      
      requestAnimationFrame(() => {
        textarea.setSelectionRange(newStart, newEnd);
      });
    } else {
      const isWrapped = selection.startsWith(beforeStr) && selection.endsWith(afterStr) && (beforeStr !== '' || afterStr !== '');
      
      let insertion = '';
      if (selection && isWrapped) {
        // 移除包裹
        insertion = selection.slice(beforeStr.length, selection.length - afterStr.length);
      } else {
        // 添加包裹
        insertion = beforeStr + selection + afterStr;
      }
      
      // 直接使用 execCommand 替换当前选区
      textarea.focus();
      document.execCommand('insertText', false, insertion);

      // 如果之前没有选区，将光标放在 beforeStr 后面
      if (!selection && !isWrapped) {
        const newPos = start + beforeStr.length;
        textarea.setSelectionRange(newPos, newPos);
      }
    }
  };

  // 保存当前文件到 localStorage
  const saveCurrentFile = () => {
    if (!activeFile) return;

    try {
      // 保存到 localStorage
      const storageKey = `md2slide_file_${activeFile}`;
      localStorage.setItem(storageKey, markdown);

      // 显示保存成功提示
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
    } catch (error) {
      console.error('保存文件失败:', error);
      alert('保存文件失败，请重试');
    }
  };

  const handleLinkInsert = () => {
    const textarea = editorRef.current;
    const selection = textarea ? markdown.slice(textarea.selectionStart, textarea.selectionEnd) : '';
    
    setInputModal({
      show: true,
      type: 'link',
      value: 'https://',
      titleValue: selection || '链接文字',
      callback: (url, title) => applySnippet(`[${title || '链接文字'}](${url})`, '')
    });
  };

  const handleImageInsert = () => {
    setInputModal({
      show: true,
      type: 'image',
      value: 'https://',
      titleValue: '图片描述',
      callback: (url, alt = '图片') => applySnippet(`![${alt}](${url})`, '')
    });
  };

  const handleVideoInsert = () => {
    setInputModal({
      show: true,
      type: 'video',
      value: 'https://',
      callback: (url) => applySnippet(`!video(${url})`, '')
    });
  };

  const handleAudioInsert = () => {
    setInputModal({
      show: true,
      type: 'audio',
      value: 'https://',
      callback: (url) => applySnippet(`!audio(${url})`, '')
    });
  };

  const handleHtmlImport = () => {
    handleImportFile('html');
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    applySnippet(`!icon(${emojiData.emoji})`, '');
    setShowEmojiPicker(false);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handlePresenterModeToggle = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('presenter', 'true');
    window.open(url.toString(), '_blank', 'width=1000,height=700');
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreenMode(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 处理编辑器快捷键
  const handleEditorKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // 常用快捷键映射
    if (isCtrl) {
      if (isAlt) {
        switch (e.key.toLowerCase()) {
          case 't': // 表格
            e.preventDefault();
            applySnippet('| 列1 | 列2 |\n| :--- | :--- |\n| 内容1 | 内容2 |', '');
            break;
          case 'v': // 向量
            e.preventDefault();
            applySnippet('!vector', '');
            break;
          case 'g': // 网格
            e.preventDefault();
            applySnippet('!grid', '');
            break;
          case 'm': // 视频 (Media)
            e.preventDefault();
            handleVideoInsert();
            break;
          case 'h': // HTML
            e.preventDefault();
            applySnippet('!html(', ')');
            break;
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'b': // 加粗
          e.preventDefault();
          applySnippet('**', '**');
          break;
        case 'i': // 斜体
          e.preventDefault();
          if (isShift) {
            handleImageInsert();
          } else {
            applySnippet('*', '*');
          }
          break;
        case 's': // 保存文件 / 删除线
          if (isShift) {
            e.preventDefault();
            applySnippet('~~', '~~');
          } else {
            e.preventDefault();
            saveCurrentFile();
          }
          break;
        case 'k': // 链接/代码块
          e.preventDefault();
          if (isShift) applySnippet('```\n', '\n```');
          else handleLinkInsert();
          break;
        case 'e': // 行内代码 / 表情
          e.preventDefault();
          if (isShift) setShowEmojiPicker(!showEmojiPicker);
          else applySnippet('`', '`');
          break;
        case '1': // H1
          e.preventDefault();
          applySnippet('# ', '');
          break;
        case '2': // H2
          e.preventDefault();
          applySnippet('## ', '');
          break;
        case '3': // H3
          e.preventDefault();
          applySnippet('### ', '');
          break;
        case 'l': // 列表
          e.preventDefault();
          if (isShift) applySnippet('1. ', '');
          else applySnippet('- ', '');
          break;
        case 't': // 任务列表
          if (isShift) {
            e.preventDefault();
            applySnippet('- [ ] ', '');
          }
          break;
        case 'q': // 引用
          if (isShift) {
            e.preventDefault();
            applySnippet('> ', '');
          }
          break;
        case 'm': // 数学公式
          e.preventDefault();
          if (isShift) applySnippet('$$\n', '\n$$');
          else applySnippet('$', '$');
          break;
        case 'enter': // 分页符
          if (isShift) {
            e.preventDefault();
            applySnippet('\n---\n', '');
          }
          break;
      }
    }
  };
 
   const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
     const scrollTop = e.currentTarget.scrollTop;
     setShowScrollTop(scrollTop > 300);
   };

   const scrollToTop = () => {
     if (editorRef.current) {
       editorRef.current.scrollTo({
         top: 0,
         behavior: 'smooth'
       });
     }
   };

   // 格式化行内 Markdown（如公式、加粗、图片等）
  const formatInlineMarkdown = (text: string) => {
    if (!text) return '';
    return text
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/\$([^\$]+)\$/g, '<span class="math-inline">$1</span>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/~~(.+?)~~/g, '<del>$1</del>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: #58c4dd; text-decoration: underline;">$1</a>')
      .replace(/^\[ \]\s+/, '<input type="checkbox" disabled style="margin-right: 8px; vertical-align: middle;" />')
      .replace(/^\[x\]\s+/, '<input type="checkbox" checked disabled style="margin-right: 8px; vertical-align: middle;" />');
  };

  // 解析 Markdown 为幻灯片

  const parsedSlides = useMemo(() => {
    const parsed = parseMarkdownToSlides(markdown, {
      useDelimiter: appSettings.useDelimiterPagination,
      useHeadingPagination: appSettings.useHeadingPagination,
      minHeadingLevel: appSettings.minHeadingLevel,
    });
    localStorage.setItem('md2slide_presenter_slides', JSON.stringify(parsed));
    return parsed;
  }, [markdown, appSettings]);

  useEffect(() => {
    setSlides(parsedSlides);
    localStorage.setItem('md2slide_presenter_slides', JSON.stringify(parsedSlides));
    setActivePreviewSlideIndex(0);
    setToc(parseTableOfContents(markdown));
  }, [parsedSlides, markdown]);

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

  useEffect(() => {
    setStorageItem<AppSettings>(storageKeys.APP_SETTINGS, appSettings);
  }, [appSettings]);

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
    
    const lineHeight = 24;
    textarea.scrollTop = lineIndex * lineHeight - 100;

    const mdLines = markdown.split('\n');
    const slideIndices: number[] = [];
    let currentSlideIndex = 0;
    let hasContentInCurrentSlide = false;

    for (let i = 0; i < mdLines.length; i++) {
      const raw = mdLines[i];
      const trimmed = raw.trim();

      const isDelimiter =
        appSettings.useDelimiterPagination && /^---\s*$/.test(trimmed);

      let isHeadingBreak = false;
      if (appSettings.useHeadingPagination) {
        const match = trimmed.match(/^([^#]*?)(#{1,6})\s+/);
        if (match) {
          const level = match[2].length;
          if (level >= appSettings.minHeadingLevel) {
            isHeadingBreak = true;
          }
        }
      }

      if (isDelimiter) {
        if (hasContentInCurrentSlide) {
          currentSlideIndex++;
        }
        hasContentInCurrentSlide = false;
        slideIndices[i] = currentSlideIndex;
        continue;
      }

      if (isHeadingBreak) {
        if (hasContentInCurrentSlide) {
          currentSlideIndex++;
        }
        hasContentInCurrentSlide = true;
        slideIndices[i] = currentSlideIndex;
        continue;
      }

      if (trimmed.length > 0) {
        hasContentInCurrentSlide = true;
      }

      slideIndices[i] = currentSlideIndex;
    }

    if (lineIndex >= 0 && lineIndex < slideIndices.length) {
      setActivePreviewSlideIndex(slideIndices[lineIndex]);
    } else {
      setActivePreviewSlideIndex(0);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      if (width > 768) {
        setMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 全局键盘事件处理，用于 Ctrl+S 保存功能
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // 检查是否按下了 Ctrl+S 或 Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveCurrentFile();
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreenMode(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
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
    <div style={{ background: theme.colors.background, minHeight: '100vh', color: theme.colors.text, fontFamily: theme.fontFamily, transition: 'background 0.3s ease, color 0.3s ease', position: 'relative' }}>
      <style>{`
        .toolbar-button:hover {
          background: ${theme.theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} !important;
          color: ${theme.primaryColor} !important;
        }
        .EmojiPickerReact {
          --epr-bg-color: ${theme.colors.surface} !important;
          --epr-category-label-bg-color: ${theme.colors.surface} !important;
          --epr-search-input-bg-color: ${theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'} !important;
        }
      `}</style>

      {/* 保存成功提示 */}
      {showSaveNotification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          background: theme.theme === 'dark' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.95)',
          color: '#fff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 1000,
          fontSize: '14px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span>✓</span>
          <span>文件已保存</span>
        </div>
      )}

      {/* Header */}
      <header style={{
        padding: isMobile ? '8px 16px' : '10px 25px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: isFullscreenMode ? 'none' : 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: theme.colors.surface,
        height: isMobile ? '52px' : '60px',
        boxSizing: 'border-box',
        transition: 'background 0.3s ease, border-color 0.3s ease',
        position: 'relative',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '15px' }}>
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
                transition: 'all 0.2s',
              }}
              title="菜单"
            >
              <Menu size={24} />
            </button>
          )}
          <h1 style={{
            margin: 0,
            fontSize: isMobile ? '18px' : '20px',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            textShadow: theme.theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? '6px' : '8px'
          }}>
            <img
              src="/logo.jpg"
              alt="Md2Slide logo"
              style={{
                width: isMobile ? 22 : 26,
                height: isMobile ? 22 : 26,
                borderRadius: isMobile ? 6 : 8,
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
          {!isMobile && (
            <>
              <div style={{ height: '15px', width: '1px', background: theme.colors.border }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '12px', fontWeight: 500 }}>Elevate Your Markdown into Cinematic Presentations</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '12px' : '15px', alignItems: 'center' }}>
          <button
            onClick={() => setShowPluginMarketplace(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: 0.7,
              padding: isMobile ? '4px' : '0'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7')}
            title="插件市场"
          >
            <Puzzle size={isMobile ? 22 : 20} />
          </button>
          <button
            onClick={() => setShowThemeMarketplace(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: 0.7,
              padding: isMobile ? '4px' : '0'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7')}
            title="主题市场"
          >
            <Layout size={isMobile ? 22 : 20} />
          </button>
          <button
            onClick={() => setShowAIAssistant(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: 0.7,
              padding: isMobile ? '4px' : '0'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7')}
            title="AI 助手"
          >
            💡
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: 0.7,
              padding: isMobile ? '4px' : '0'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7')}
            title="设置"
          >
            <Settings size={isMobile ? 22 : 20} />
          </button>
          <button
            onClick={() => setShowHelp(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              opacity: 0.7,
              padding: isMobile ? '4px' : '0'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7')}
            title="帮助文档"
          >
            <HelpCircle size={isMobile ? 22 : 20} />
          </button>
          
          <ThemeToggle />
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 200,
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '80%',
              maxWidth: '300px',
              background: theme.colors.surface,
              boxShadow: '0 0 30px rgba(0,0,0,0.4)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              animation: 'slideIn 0.2s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>菜单</h2>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <FileTree
                files={fileList}
                activeFile={activeFile}
                onFileClick={(file) => {
                  loadFile(file);
                  setMobileMenuOpen(false);
                }}
                onDelete={deleteFile}
                onRename={renameFile}
                onExport={handleExportPDF}
                onExportPPTX={handleExportPPTX}
                onExportWord={handleExportWord}
                onImport={(fileType) => handleImportFile(fileType)}
                onOpenFolder={openFolder}
                onCreate={createFile}
                theme={theme}
              />
            </div>

            {/* TOC Section */}
            <div style={{ borderTop: `1px solid ${theme.colors.border}`, paddingTop: '15px' }}>
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '10px', fontWeight: 600 }}>
                文章大纲
              </div>
              {toc.length > 0 ? (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {toc.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        scrollToLine(item.lineIndex);
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        paddingLeft: `${12 + (item.level - 1) * 8}px`,
                        fontSize: '14px',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'all 0.2s',
                      }}
                    >
                      {item.text}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '10px 12px', fontSize: '14px', color: theme.colors.textSecondary, opacity: 0.5 }}>
                  暂无标题内容
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

            {/* Tab Selector */}
            <div style={{ 
              display: 'flex', 
              gap: '20px', 
              borderBottom: `1px solid ${theme.colors.border}`,
              marginTop: '10px'
            }}>
              <button 
                onClick={() => setHelpTab('usage')}
                style={{
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: helpTab === 'usage' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  color: helpTab === 'usage' ? theme.primaryColor : theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                功能用法
              </button>
              <button 
                onClick={() => setHelpTab('shortcuts')}
                style={{
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: helpTab === 'shortcuts' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  color: helpTab === 'shortcuts' ? theme.primaryColor : theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                快捷键大全
              </button>
              <button 
                onClick={() => setHelpTab('about')}
                style={{
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: helpTab === 'about' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  color: helpTab === 'about' ? theme.primaryColor : theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                关于作者
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                paddingRight: '4px',
                fontSize: '13px',
                color: theme.colors.textSecondary,
                lineHeight: 1.7,
                marginTop: '10px'
              }}
            >
              {helpTab === 'usage' ? (
                <div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '6px', fontSize: '14px' }}>基础排版</div>
                    <ul style={{ paddingLeft: '18px', margin: 0 }}>
                      <li>使用 <code># 标题</code>、<code>## 副标题</code> 定义页面结构。</li>
                      <li>使用 <code>---</code> 分隔不同的幻灯片页。</li>
                      <li>列表项（如 <code>- 列表</code>）会自动分配点击动画，实现逐条弹出。</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '6px', fontSize: '14px' }}>多媒体与交互</div>
                    <ul style={{ paddingLeft: '18px', margin: 0 }}>
                      <li><strong>图片</strong>：使用 <code>!image(url)</code>，工具栏支持弹出输入。</li>
                      <li><strong>视频</strong>：使用 <code>!video(url)</code>，支持 B 站链接自动转换为播放器。</li>
                      <li><strong>超链接</strong>：使用标准 <code>[标题](url)</code> 语法。</li>
                      <li><strong>表情</strong>：使用 <code>!icon(emoji)</code> 或快捷键打开选择器。</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '6px', fontSize: '14px' }}>数学与代码</div>
                    <ul style={{ paddingLeft: '18px', margin: 0 }}>
                      <li><strong>公式</strong>：行内 <code>$E=mc^2$</code>，块级使用 <code>$$</code> 包裹。</li>
                      <li><strong>代码</strong>：使用三个反引号 <code>```</code> 包裹并指定语言。</li>
                      <li><strong>表格</strong>：支持 GFM 标准表格语法，快捷键 <code>Ctrl+Alt+T</code> 快速插入。</li>
                    </ul>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '6px', fontSize: '14px' }}>演示控制</div>
                    <ul style={{ paddingLeft: '18px', margin: 0 }}>
                      <li><strong>自动播放</strong>：预览页右下角点击播放按钮开启。</li>
                      <li><strong>页面跳转</strong>：点击右下角页码可输入数字直接跳转。</li>
                      <li><strong>回到顶部</strong>：编辑器右下角浮动按钮一键置顶。</li>
                    </ul>
                  </div>
                </div>
              ) : helpTab === 'shortcuts' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '8px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '4px' }}>编辑器操作</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>加粗/斜体/删除线</span> <code style={{ color: theme.primaryColor }}>Ctrl + B/I/S</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>一/二/三级标题</span> <code style={{ color: theme.primaryColor }}>Ctrl + 1/2/3</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入超链接</span> <code style={{ color: theme.primaryColor }}>Ctrl + K</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入代码块</span> <code style={{ color: theme.primaryColor }}>Ctrl+Shift+K</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>行内代码</span> <code style={{ color: theme.primaryColor }}>Ctrl + E</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>打开表情库</span> <code style={{ color: theme.primaryColor }}>Ctrl+Shift+E</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>数学公式</span> <code style={{ color: theme.primaryColor }}>Ctrl + M</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入表格</span> <code style={{ color: theme.primaryColor }}>Ctrl+Alt+T</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入分页符</span> <code style={{ color: theme.primaryColor }}>Ctrl+Shift+↵</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>撤销操作</span> <code style={{ color: theme.primaryColor }}>Ctrl + Z</code></div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '8px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '4px' }}>预览演示</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>下一步 / 下一页</span> <code style={{ color: theme.primaryColor }}>Space / →</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>上一步 / 上一页</span> <code style={{ color: theme.primaryColor }}>←</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>进入全屏模式</span> <code style={{ color: theme.primaryColor }}>F11</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>显示大纲</span> <code style={{ color: theme.primaryColor }}>Ctrl + O</code></div>
                    </div>
                    
                    <div style={{ fontWeight: 600, color: theme.colors.text, marginTop: '15px', marginBottom: '8px', borderBottom: `1px solid ${theme.colors.border}`, paddingBottom: '4px' }}>多媒体快捷键</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入图片</span> <code style={{ color: theme.primaryColor }}>Ctrl+Shift+I</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入视频</span> <code style={{ color: theme.primaryColor }}>Ctrl+Alt+M</code></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>插入向量/网格</span> <code style={{ color: theme.primaryColor }}>Ctrl+Alt+V/G</code></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    <div style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      border: `2px solid ${theme.primaryColor}`,
                      boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                      flexShrink: 0
                    }}>
                      <img src="/logo.jpg" alt="Author" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: theme.colors.text }}>糕手小范 (Alleyf)</h2>
                        <span style={{ padding: '2px 8px', borderRadius: '999px', background: `${theme.primaryColor}20`, color: theme.primaryColor, fontSize: '11px', fontWeight: 700 }}>Author</span>
                      </div>
                      <div style={{ fontSize: '14px', color: theme.colors.textSecondary, marginBottom: '12px', fontWeight: 500 }}>
                        华中科技大学 (HUST) · 信息与通信工程
                      </div>
                      <div style={{ 
                        padding: '12px 16px', 
                        background: theme.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', 
                        borderRadius: '10px',
                        borderLeft: `4px solid ${theme.primaryColor}`,
                        fontStyle: 'italic',
                        color: theme.colors.text,
                        fontSize: '14px'
                      }}>
                        "You know more, you will do not know more."
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{ background: theme.theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', padding: '16px', borderRadius: '12px', border: `1px solid ${theme.colors.border}` }}>
                      <div style={{ fontWeight: 700, color: theme.colors.text, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>🔬</span> 研究方向
                      </div>
                      <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li>分布式微服务软件开发设计</li>
                        <li>知识图谱 (Knowledge Graph)</li>
                        <li>自然语言处理 (NLP)</li>
                      </ul>
                    </div>
                    <div style={{ background: theme.theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', padding: '16px', borderRadius: '12px', border: `1px solid ${theme.colors.border}` }}>
                      <div style={{ fontWeight: 700, color: theme.colors.text, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>💻</span> 日常工作
                      </div>
                      <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <li>软件全栈开发</li>
                        <li>算法学习与研究</li>
                        <li>开源项目维护</li>
                      </ul>
                    </div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: theme.primaryColor + '08', border: `1px dashed ${theme.primaryColor}40` }}>
                    <div style={{ fontWeight: 700, color: theme.colors.text, marginBottom: '10px' }}>🍀 个人感悟</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ color: theme.primaryColor }}>•</span>
                        <span>不是牛码，就在成为牛码的路上。</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ color: theme.primaryColor }}>•</span>
                        <span>在每个平庸的日子里，找到属于自己的归属感。</span>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ color: theme.primaryColor }}>•</span>
                        <span>无论做什么事，都要找到支撑自己坚持下去的精神支柱。</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div style={{ 
              marginTop: '4px', 
              paddingTop: '12px', 
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setShowHelp(false)}
                style={{
                  padding: '6px 20px',
                  borderRadius: '6px',
                  background: theme.primaryColor,
                  color: '#fff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
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
              maxWidth: '520px',
              background: theme.colors.surface,
              borderRadius: '12px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme === darkTheme ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 40px rgba(15,23,42,0.18)',
              padding: '20px 24px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text }}>全局设置</div>
                <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
                  配置分页规则等常用偏好
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
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
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: theme.theme === 'dark' ? 'rgba(15,23,42,0.6)' : '#f9fafb',
                border: `1px dashed ${theme.colors.border}`
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.text }}>分页设置</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.colors.textSecondary }}>
                <input
                  type="checkbox"
                  checked={appSettings.useDelimiterPagination}
                  onChange={(e) =>
                    setAppSettings((prev) => ({
                      ...prev,
                      useDelimiterPagination: e.target.checked,
                    }))
                  }
                />
                使用 --- 作为手动分页符
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: theme.colors.textSecondary }}>
                <input
                  type="checkbox"
                  checked={appSettings.useHeadingPagination}
                  onChange={(e) =>
                    setAppSettings((prev) => ({
                      ...prev,
                      useHeadingPagination: e.target.checked,
                    }))
                  }
                />
                根据标题自动分页
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: theme.colors.textSecondary }}>
                <span>标题等级阈值</span>
                <select
                  value={appSettings.minHeadingLevel}
                  disabled={!appSettings.useHeadingPagination}
                  onChange={(e) =>
                    setAppSettings((prev) => ({
                      ...prev,
                      minHeadingLevel: Number(e.target.value),
                    }))
                  }
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${theme.colors.border}`,
                    background: 'transparent',
                    color: theme.colors.text,
                    fontSize: '13px'
                  }}
                >
                  <option value={1}>一级及以上 (#)</option>
                  <option value={2}>二级及以上 (##)</option>
                  <option value={3}>三级及以上 (###)</option>
                  <option value={4}>四级及以上 (####)</option>
                  <option value={5}>五级及以上 (#####)</option>
                  <option value={6}>六级及以上 (######)</option>
                </select>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '4px' }}>
              设置会自动保存到浏览器本地，仅在当前设备生效。
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        height: isMobile ? 'calc(100vh - 52px)' : (isFullscreenMode ? '100vh' : 'calc(100vh - 60px)'),
        width: isFullscreenMode ? '100vw' : '100%',
        minHeight: isFullscreenMode ? '100vh' : 'calc(100vh - 60px)',
        overflow: 'hidden',
        background: theme.colors.background,
        transition: 'background 0.3s ease'
      }}>
        {layoutOrder.map((section, index) => {
          if (isFullscreenMode && section !== 'preview') return null;
          
          if (section === 'sidebar') {
            if (isMobile) return null; // 移动端不显示侧边栏（使用汉堡菜单）
            if (!showSidebar) {
              return (
                <div 
                  key="sidebar-collapsed"
                  onClick={() => setShowSidebar(true)}
                  style={{
                    width: '30px',
                    height: '100%',
                    background: theme.colors.surface,
                    borderRight: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                  onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.surface}
                  title="展开目录"
                >
                  <PanelLeftOpen size={16} color={theme.colors.textSecondary} />
                  <div style={{ 
                    writingMode: 'vertical-rl', 
                    marginTop: '20px', 
                    fontSize: '11px', 
                    color: theme.colors.textSecondary,
                    letterSpacing: '2px',
                    opacity: 0.6
                  }}>
                    文件目录
                  </div>
                </div>
              );
            }
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
                      <button
                        onClick={() => setShowSidebar(false)}
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
                          marginRight: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        title="收起目录"
                      >
                        <PanelLeftClose size={14} />
                      </button>
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
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <FileTree
                    files={fileList}
                    activeFile={activeFile}
                    onFileClick={loadFile}
                    onDelete={deleteFile}
                    onRename={renameFile}
                  onExport={handleExportPDF}
                  onExportPPTX={handleExportPPTX}
                  onExportWord={handleExportWord}
                    onImport={handleImportFile}
                    onOpenFolder={openFolder}
                    onCreate={createFile}
                    theme={theme}
                  />
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

          if (section === 'editor') {
            if (!showEditor && !isMobile) {
              return (
                <div 
                  key="editor-collapsed"
                  onClick={() => setShowEditor(true)}
                  style={{
                    width: '30px',
                    height: '100%',
                    background: theme.colors.surface,
                    borderRight: index < layoutOrder.length - 1 ? `1px solid ${theme.colors.border}` : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = theme.colors.border}
                  onMouseLeave={(e) => e.currentTarget.style.background = theme.colors.surface}
                  title="展开编辑器"
                >
                  <PanelRightOpen size={16} color={theme.colors.textSecondary} />
                  <div style={{ 
                    writingMode: 'vertical-rl', 
                    marginTop: '20px', 
                    fontSize: '11px', 
                    color: theme.colors.textSecondary,
                    letterSpacing: '2px',
                    opacity: 0.6
                  }}>
                    编辑器
                  </div>
                </div>
              );
            }
            if (!showEditor && isMobile) return null;
            return (
              <React.Fragment key="editor">
                <div 
                  onDragOver={(e) => handleDragOver(e, 'editor')}
                  style={{
                    width: isMobile ? '100%' : `${editorWidth}px`,
                    height: isMobile ? '100%' : 'auto',
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
                      <button
                        onClick={() => setShowEditor(false)}
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
                        title="收起编辑器"
                      >
                        <PanelRightClose size={14} />
                      </button>
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>⠿</span>
                      Markdown 编辑器
                  </div>
                  {activeFile && (
                    <span style={{ fontSize: '10px', opacity: 0.6, textTransform: 'none' }}>
                      正在编辑: {activeFile}
                    </span>
                  )}
                </div>

                {/* Markdown Toolbar */}
                <Toolbar 
                  applySnippet={applySnippet}
                  handleLinkInsert={handleLinkInsert}
                  handleImageInsert={handleImageInsert}
                  handleVideoInsert={handleVideoInsert}
                  handleAudioInsert={handleAudioInsert}
                  handleHtmlImport={handleHtmlImport}
                  showEmojiPicker={showEmojiPicker}
                  setShowEmojiPicker={setShowEmojiPicker}
                  theme={theme}
                />

                {/* Emoji Picker Overlay */}
                {showEmojiPicker && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    zIndex: 1000,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    marginTop: '8px'
                  }}>
                    <EmojiPicker 
                      onEmojiClick={handleEmojiClick}
                      theme={theme.theme === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT}
                      autoFocusSearch={true}
                      searchPlaceholder="搜索表情..."
                      width={350}
                      height={400}
                      lazyLoadEmojis={true}
                    />
                    <div 
                      onClick={() => setShowEmojiPicker(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: -1
                      }}
                    />
                  </div>
                )}


                <textarea
                    ref={editorRef}
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onScroll={handleEditorScroll}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      padding: isMobile ? '16px' : '20px',
                      color: theme.colors.textSecondary,
                      fontSize: isMobile ? '13px' : '14px',
                      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                      resize: 'none',
                      outline: 'none',
                      lineHeight: '1.7',
                      tabSize: 2,
                      WebkitOverflowScrolling: 'touch'
                    }}
                    placeholder="在此输入 Markdown 内容..."
                  />

                  {/* Scroll to Top Button */}
                  {showScrollTop && (
                    <button
                      onClick={scrollToTop}
                      style={{
                        position: 'absolute',
                        right: isMobile ? '16px' : '20px',
                        bottom: isMobile ? '100px' : '80px',
                        width: isMobile ? '44px' : '40px',
                        height: isMobile ? '44px' : '40px',
                        borderRadius: '50%',
                        background: theme.primaryColor,
                        color: '#fff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                        zIndex: 100,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: 0.9,
                      }}
                      onMouseEnter={(e) => {
                        !isMobile && (e.currentTarget.style.transform = 'translateY(-3px)');
                        !isMobile && (e.currentTarget.style.opacity = '1');
                        !isMobile && (e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)');
                      }}
                      onMouseLeave={(e) => {
                        !isMobile && (e.currentTarget.style.transform = 'translateY(0)');
                        !isMobile && (e.currentTarget.style.opacity = '0.9');
                        !isMobile && (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)');
                      }}
                      title="回到顶部"
                    >
                      <ArrowUp size={isMobile ? 22 : 20} strokeWidth={2.5} />
                    </button>
                  )}

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
                    flex: isFullscreenMode || !showEditor || index === layoutOrder.length - 1 ? 1 : 'none',
                    width: !isFullscreenMode && showEditor && index < layoutOrder.length - 1 ? '500px' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: isFullscreenMode ? '100vw' : (isMobile ? '100%' : '300px'),
                    position: 'relative',
                    opacity: draggingSection === 'preview' ? 0.5 : 1,
                    borderRight: !isFullscreenMode && index < layoutOrder.length - 1 && !isMobile ? `1px solid ${theme.colors.border}` : 'none'
                  }}
                >
                  {!isFullscreenMode && (
                    <div 
                      draggable
                      onDragStart={(e) => {
                        // 只有当点击的不是按钮时才允许拖动，防止误操作
                        if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).parentElement?.tagName !== 'BUTTON') {
                          handleDragStart('preview');
                        } else {
                          e.preventDefault();
                        }
                      }}
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
                  )}
                  <div ref={slideContainerRef} style={{ flex: 1, position: 'relative', background: theme.colors.background }}>
                    <SlideTemplate 
                      slides={slides} 
                      activeSlideIndex={activePreviewSlideIndex}
                      onSlideChange={(index) => setActivePreviewSlideIndex(index)}
                      onFullscreenToggle={toggleFullscreen}
                      onPresenterModeToggle={handlePresenterModeToggle}
                      isFullscreen={isFullscreenMode}
                      enableAutoAnimate={appSettings.enableAutoAnimate}
                      autoAnimateDuration={appSettings.autoAnimateDuration}
                      autoAnimateEasing={appSettings.autoAnimateEasing}
                    />
                  </div>
                </div>
              </React.Fragment>
            );
          }
          return null;
        })}
      </main>

      {/* Hidden Export Container */}
      <div id="pdf-export-container" style={{ 
        position: 'absolute', 
        top: 0,
        left: 0,
        width: '1920px', 
        zIndex: -2000,
        visibility: 'hidden',
        pointerEvents: 'none'
      }}>
        <SlideTemplate 
          slides={slides} 
          exportMode={true}
          enableAutoAnimate={appSettings.enableAutoAnimate}
          autoAnimateDuration={appSettings.autoAnimateDuration}
          autoAnimateEasing={appSettings.autoAnimateEasing}
        />
      </div>

      {/* AI Assistant Component */}
      <AIAssistant
        markdownContent={markdown}
        onContentUpdate={(newContent) => setMarkdown(newContent)}
      />

      {/* Plugin Marketplace Component */}
      <PluginMarketplace 
        isOpen={showPluginMarketplace}
        onClose={() => setShowPluginMarketplace(false)}
      />

      {/* Theme Marketplace Component */}
      <ThemeMarketplace
        isOpen={showThemeMarketplace}
        onClose={() => setShowThemeMarketplace(false)}
        onThemeChange={(themeId) => {
          console.log(`Theme changed to: ${themeId}`);
          // 这里可以添加实际的主题应用逻辑
        }}
      />

      {/* Global Input Modal Overlay */}
      {inputModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 3000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: theme.colors.surface,
            padding: '24px',
            borderRadius: '12px',
            width: '400px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
            border: `1px solid ${theme.colors.border}`
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.colors.textSecondary }}>
              {inputModal.type === 'link' ? '插入链接' :
               inputModal.type === 'image' ? '插入图片' :
               inputModal.type === 'video' ? '插入视频' :
               inputModal.type === 'audio' ? '插入语音' :
               inputModal.type === 'rename' ? '重命名文件' :
               inputModal.type === 'create' ? '新建文件' : '确认操作'}
            </h3>
            
            {inputModal.type === 'confirm' ? (
              <div style={{ marginBottom: '24px', color: theme.colors.text, fontSize: '14px' }}>
                {inputModal.message}
              </div>
            ) : (
              <>
                {(inputModal.type === 'link' || inputModal.type === 'image' || inputModal.type === 'video' || inputModal.type === 'audio') && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '5px', opacity: 0.8 }}>
                      {inputModal.type === 'link' ? '链接标题' : 
                       inputModal.type === 'audio' ? '语音描述' : '媒体描述'} (可选)
                    </label>
                    <input 
                      type="text"
                      value={inputModal.titleValue || ''}
                      onChange={(e) => setInputModal(prev => ({ ...prev, titleValue: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        border: `1px solid ${theme.colors.border}`,
                        background: theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                        color: theme.colors.textSecondary,
                        fontSize: '14px',
                        outline: 'none'
                      }}
                      placeholder={inputModal.type === 'link' ? "例如：点击查看详情" : 
                                   inputModal.type === 'audio' ? "例如：背景音乐" : "例如：示例媒体"}
                    />
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: theme.colors.textSecondary, marginBottom: '5px', opacity: 0.8 }}>
                    {inputModal.type === 'rename' ? '新文件名' :
                     inputModal.type === 'create' ? '文件名' : 'URL 地址'}
                  </label>
                  <input 
                    autoFocus
                    type="text"
                    value={inputModal.value}
                    onChange={(e) => setInputModal(prev => ({ ...prev, value: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        inputModal.callback?.(inputModal.value, inputModal.titleValue);
                        setInputModal(prev => ({ ...prev, show: false }));
                      } else if (e.key === 'Escape') {
                        setInputModal(prev => ({ ...prev, show: false }));
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                      color: theme.colors.textSecondary,
                      fontSize: '14px',
                      outline: 'none'
                    }}
                    placeholder={inputModal.type === 'rename' ? "请输入新名称" :
                                 inputModal.type === 'create' ? "请输入文件名（可选 .md 扩展名）" : "在此输入 URL 地址..."}
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setInputModal(prev => ({ ...prev, show: false }))}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.border}`,
                  background: 'transparent',
                  color: theme.colors.textSecondary,
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
              <button 
                onClick={() => {
                  inputModal.callback?.(inputModal.value, inputModal.titleValue);
                  setInputModal(prev => ({ ...prev, show: false }));
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: inputModal.type === 'confirm' ? '#ef4444' : theme.primaryColor,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
