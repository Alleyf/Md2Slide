import React, { useState, useEffect, useRef, useMemo } from 'react';
import EmojiPicker, { Theme as EmojiTheme } from 'emoji-picker-react';
import {
  ArrowUp,
  Github,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Layout,
  HelpCircle,
  Menu,
  X,
  Settings,
  Puzzle,
  Sparkles,
  Wand2,
  Info,
  GripVertical,
  Monitor,
  ChevronDown,
  Eye,
  FileText,
  Layers,
  Code
} from 'lucide-react';
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
import KeyboardShortcutsPanel from './components/KeyboardShortcutsPanel';
import { downloadPDF } from './utils/export/pdf';
import { downloadPPTX } from './utils/export/pptx';
import { downloadWord } from './utils/export/word';
import { parseMarkdownToSlides, parseTableOfContents, TOCItem } from './parser';
import { PresenterView } from './components/PresenterView';
import { formatInlineMarkdown } from './parser/markdownHelpers';
import { htmlToMarkdown } from './utils/htmlToMarkdown';
import { getStorageItem, setStorageItem, storageKeys } from './utils/storage';
import { AIAssistant } from './components/AIAssistant';
import { SelectionAIAssistant } from './components/SelectionAIAssistant';
import { aiService, DEFAULT_AI_CONFIG } from './services/ai';
import { AIServiceConfig } from './types/ai';
import { ThemeMarketplace } from './components/ThemeMarketplace';
import { TemplateMarketplace } from './components/TemplateMarketplace';
import { Template, templateMarketplaceService } from './services/templateMarketplaceService';
import { themeMarketplaceService } from './services/themeMarketplace';
import { PluginMarketplace } from './components/PluginMarketplace';
import { pluginManager } from './services/pluginManager';
import { ThemePlugin } from './plugins/ThemePlugin';
import { keyboardService } from './services/keyboardService';
import { ShortcutConfig } from './types/keyboard';
import MusicPlayer from './components/MusicPlayer';

interface AppSettings {
  useDelimiterPagination: boolean;
  useHeadingPagination: boolean;
  minHeadingLevel: number;
  enableAutoAnimate: boolean;
  autoAnimateDuration: number;
  autoAnimateEasing: string;
  htmlPreviewBackground?: string;
}

const defaultAppSettings: AppSettings = {
  useDelimiterPagination: true,
  useHeadingPagination: true,
  minHeadingLevel: 1,
  enableAutoAnimate: false,
  autoAnimateDuration: 600,
  autoAnimateEasing: 'ease-in-out',
  htmlPreviewBackground: '', // 默认跟随主题
};

export const App: React.FC = () => {
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<'markdown' | 'html'>('markdown');
  const [slides, setSlides] = useState<SlideContent[]>([]);
  
  // 撤销/重做栈
  const undoStack = useRef<string[]>([]);
  const redoStack = useRef<string[]>([]);
  const isUndoRedoOperation = useRef(false);
  
  const [showEditor, setShowEditor] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [helpTab, setHelpTab] = useState<'usage' | 'shortcuts' | 'about' | 'donate'>('usage');
  const [settingsTab, setSettingsTab] = useState<'general' | 'keyboard'>('general');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showTOC, setShowTOC] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<string | null>('docs/tutorial.md');
  const [toc, setToc] = useState<TOCItem[]>([]);
  const [activePreviewSlideIndex, setActivePreviewSlideIndex] = useState(0);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [fileList, setFileList] = useState<FileItem[]>(() => {
    const defaultFiles: FileItem[] = [
      { name: 'tutorial.md', path: 'docs/tutorial.md', kind: 'file', isStatic: true },
      { name: 'tutorial.html', path: 'docs/tutorial.html', kind: 'file', isStatic: true }
    ];
    return getStorageItem<FileItem[]>(storageKeys.FILE_LIST, defaultFiles);
  });

  // 监听文件列表变化并保存
  useEffect(() => {
    // 保存前克隆并移除 content 属性，以减小 localStorage 负担
    // 因为文件内容已经单独存储在 md2slide_file_${path} 中了
    const cleanFileList = (items: FileItem[]): FileItem[] => {
      return items.map(item => {
        const { content, ...rest } = item;
        if (item.children) {
          return { ...rest, children: cleanFileList(item.children) } as FileItem;
        }
        return rest as FileItem;
      });
    };
    setStorageItem(storageKeys.FILE_LIST, cleanFileList(fileList));
  }, [fileList]);
  const [logoClicks, setLogoClicks] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(220);
  const [editorWidth, setEditorWidth] = useState(550);
  const [editorHeight, setEditorHeight] = useState(0);
  const [previewWidth, setPreviewWidth] = useState(500);
  const [previewHeight, setPreviewHeight] = useState(0); // 0 means 100%
  const [aiWidth, setAIWidth] = useState(300);
  const [aiHeight, setAIHeight] = useState(0);
  const [tocHeight, setTocHeight] = useState(300);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const [isResizingEditor, setIsResizingEditor] = useState(false);
  const [isResizingEditorHeight, setIsResizingEditorHeight] = useState(false);
  const [isResizingPreview, setIsResizingPreview] = useState(false);
  const [isResizingPreviewHeight, setIsResizingPreviewHeight] = useState(false);
  const [isResizingAI, setIsResizingAI] = useState(false);
  const [isResizingAIHeight, setIsResizingAIHeight] = useState(false);
  const [isResizingTOC, setIsResizingTOC] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    position: { x: number; y: number };
  } | null>(null);
  const [showThemeMarketplace, setShowThemeMarketplace] = useState(false);
  const [showTemplateMarketplace, setShowTemplateMarketplace] = useState(false);
  const [showPluginMarketplace, setShowPluginMarketplace] = useState(false);
  const [showAISidebar, setShowAISidebar] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  
  // 撤销/重做辅助函数
  const pushToHistory = (newContent: string) => {
    if (!isUndoRedoOperation.current) {
      // 保存当前状态到撤销栈
      undoStack.current.push(content);
      // 限制撤销栈大小为 50
      if (undoStack.current.length > 50) {
        undoStack.current.shift();
      }
      // 清空重做栈
      redoStack.current = [];
    }
  };
  
  const performUndo = () => {
    if (undoStack.current.length > 0) {
      // 保存当前状态到重做栈
      redoStack.current.push(content);
      // 从撤销栈中恢复上一个状态
      const previousContent = undoStack.current.pop()!;
      isUndoRedoOperation.current = true;
      setContent(previousContent);
      setTimeout(() => {
        isUndoRedoOperation.current = false;
      }, 0);
    }
  };
  
  const performRedo = () => {
    if (redoStack.current.length > 0) {
      // 保存当前状态到撤销栈
      undoStack.current.push(content);
      // 从重做栈中恢复下一个状态
      const nextContent = redoStack.current.pop()!;
      isUndoRedoOperation.current = true;
      setContent(nextContent);
      setTimeout(() => {
        isUndoRedoOperation.current = false;
      }, 0);
    }
  };
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showViewMenu) {
        setShowViewMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showViewMenu]);

  const flexibleSection = useMemo(() => {
    // 优先让预览板块自适应，如果显示的话
    if (showPreview) return 'preview';
    // 其次是编辑器
    if (showEditor) return 'editor';
    // 然后是侧边栏
    if (showSidebar) return 'sidebar';
    // 最后是 AI
    if (showAISidebar) return 'ai';
    return null;
  }, [showPreview, showEditor, showSidebar, showAISidebar]);

  const [inputModal, setInputModal] = useState<{
    show: boolean;
    type: 'link' | 'image' | 'video' | 'audio' | 'rename' | 'confirm' | 'create' | 'create-dir' | 'egg';
    value: string;
    extension?: string;
    titleValue?: string;
    fileType?: 'markdown' | 'html';
    message?: string;
    callback?: (val: string, title?: string, fileType?: 'markdown' | 'html') => void;
  }>({ show: false, type: 'link', value: '' });

  const renderInputModal = () => {
    if (!inputModal.show) return null;

    const getTitle = () => {
      switch (inputModal.type) {
        case 'link': return '插入链接';
        case 'image': return '插入图片';
        case 'video': return '插入视频';
        case 'audio': return '插入音频';
        case 'rename': return '重命名';
        case 'confirm': return '确认操作';
        case 'create': return '新建文件';
        case 'create-dir': return '新建目录';
        case 'egg': return '解锁神秘力量';
        default: return '输入内容';
      }
    };

    const getPlaceholder = () => {
      switch (inputModal.type) {
        case 'create-dir': return '请输入目录名称...';
        case 'create': return '请输入文件名...';
        case 'egg': return '请输入神秘代码...';
        default: return '请输入内容...';
      }
    };

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 5000,
        backdropFilter: 'blur(4px)'
      }} onClick={() => setInputModal(prev => ({ ...prev, show: false }))}>
        <div style={{
          backgroundColor: theme.colors.surface,
          padding: '24px',
          borderRadius: '12px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${theme.colors.border}`
        }} onClick={e => e.stopPropagation()}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600, color: theme.colors.text }}>{getTitle()}</h3>
          
          {inputModal.type === 'confirm' ? (
            <p style={{ color: theme.colors.textSecondary, marginBottom: '20px' }}>{inputModal.message}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                <input
                  autoFocus
                  type="text"
                  value={inputModal.value}
                  onChange={e => setInputModal(prev => ({ ...prev, value: e.target.value }))}
                  placeholder={getPlaceholder()}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    paddingRight: inputModal.extension ? `${inputModal.extension.length * 9 + 20}px` : '12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: theme.colors.text,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      inputModal.callback?.(inputModal.value, inputModal.titleValue, inputModal.fileType);
                      setInputModal(prev => ({ ...prev, show: false }));
                    }
                  }}
                />
                {inputModal.extension && (
                  <span style={{
                    position: 'absolute',
                    right: '12px',
                    color: theme.colors.textSecondary,
                    fontSize: '14px',
                    opacity: 0.6,
                    pointerEvents: 'none',
                    backgroundColor: 'transparent'
                  }}>
                    {inputModal.extension}
                  </span>
                )}
              </div>
              {inputModal.type === 'link' && (
                <input
                  type="text"
                  value={inputModal.titleValue}
                  onChange={e => setInputModal(prev => ({ ...prev, titleValue: e.target.value }))}
                  placeholder="链接标题 (可选)"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                    color: theme.colors.text,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              )}
              {inputModal.type === 'create' && (
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: theme.colors.textSecondary }}>
                    <input 
                      type="radio" 
                      name="fileType" 
                      checked={inputModal.fileType === 'markdown'} 
                      onChange={() => setInputModal(prev => ({ ...prev, fileType: 'markdown' }))}
                    />
                    Markdown
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', color: theme.colors.textSecondary }}>
                    <input 
                      type="radio" 
                      name="fileType" 
                      checked={inputModal.fileType === 'html'} 
                      onChange={() => setInputModal(prev => ({ ...prev, fileType: 'html' }))}
                    />
                    HTML
                  </label>
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              onClick={() => setInputModal(prev => ({ ...prev, show: false }))}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: 'transparent',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              取消
            </button>
            <button
              onClick={() => {
                inputModal.callback?.(inputModal.value, inputModal.titleValue, inputModal.fileType);
                setInputModal(prev => ({ ...prev, show: false }));
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: theme.primaryColor,
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              确认
            </button>
          </div>
        </div>
      </div>
    );
  };

  const createDirectory = (targetItem: FileItem) => {
    setInputModal({
      show: true,
      type: 'create-dir',
      value: '',
      callback: (dirName) => {
        if (dirName && dirName.trim()) {
          // 确定父级目录
          let parentPath = '';
          if (targetItem.path === 'root') {
            parentPath = '';
          } else {
            const pathParts = targetItem.path.split('/');
            if (targetItem.kind === 'file') {
              pathParts.pop(); // 移除文件名
            }
            
            // 如果路径中只剩下一个部分（即隐藏的根目录，如 "docs"），则父路径视为空（根）
            if (pathParts.length <= 1) {
              parentPath = '';
            } else {
              parentPath = pathParts.join('/');
            }
          }

          const rootPrefix = fileList.length > 0 ? fileList[0].path.split('/')[0] : 'docs';
          const fullPath = parentPath 
            ? `${parentPath}/${dirName}` 
            : `${rootPrefix}/${dirName}`;

          // 检查目录是否已存在
          const exists = (items: FileItem[]): boolean => {
            for (const item of items) {
              if (item.path === fullPath && item.kind === 'directory') return true;
              if (item.children && exists(item.children)) return true;
            }
            return false;
          };

          if (exists(fileList)) {
            alert(`目录 ${dirName} 已存在`);
            return;
          }

          const newDir: FileItem = {
            name: dirName,
            path: fullPath,
            kind: 'directory',
            children: []
          };

          const insertInTree = (items: FileItem[]): FileItem[] => {
            // 如果父路径为空，表示在根目录创建
            if (!parentPath) {
              return [...items, newDir];
            }

            return items.map(item => {
              if (item.path === parentPath && item.kind === 'directory') {
                return { ...item, children: [...(item.children || []), newDir] };
              }
              if (item.children) {
                return { ...item, children: insertInTree(item.children) };
              }
              return item;
            });
          };

          setFileList(prev => insertInTree(prev));
        }
      }
    });
  };
  type LayoutSection = 'sidebar' | 'editor' | 'preview' | 'ai';
  const [layoutOrder, setLayoutOrder] = useState<LayoutSection[]>(['sidebar', 'editor', 'preview']);
  const [draggingSection, setDraggingSection] = useState<LayoutSection | null>(null);
  const slideContainerRef = useRef<HTMLDivElement | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    if (typeof window === 'undefined') {
      return defaultAppSettings;
    }
    return getStorageItem<AppSettings>(storageKeys.APP_SETTINGS, defaultAppSettings);
  });
  const { themeConfig: theme, setThemeConfig } = useTheme();

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
        const sidebarActual = showSidebar ? sidebarWidth : (isMobile ? 0 : 30);
        setEditorWidth(Math.max(300, e.clientX - sidebarActual));
      } else if (isResizingEditorHeight) {
        const container = document.getElementById('editor-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = e.clientY - rect.top;
          setEditorHeight(Math.max(200, Math.min(window.innerHeight - 100, newHeight)));
        }
      } else if (isResizingPreview) {
        const sidebarActual = showSidebar ? sidebarWidth : (isMobile ? 0 : 30);
        const editorActual = showEditor ? editorWidth : (isMobile ? 0 : 30);
        setPreviewWidth(Math.max(300, e.clientX - sidebarActual - editorActual));
      } else if (isResizingPreviewHeight) {
        const container = slideContainerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = e.clientY - rect.top;
          setPreviewHeight(Math.max(200, Math.min(window.innerHeight - 100, newHeight)));
        }
      } else if (isResizingAI) {
        const rect = document.getElementById('ai-container')?.getBoundingClientRect();
        if (rect) {
          setAIWidth(Math.max(250, Math.min(600, window.innerWidth - e.clientX)));
        }
      } else if (isResizingAIHeight) {
        const container = document.getElementById('ai-container');
        if (container) {
          const rect = container.getBoundingClientRect();
          const newHeight = e.clientY - rect.top;
          setAIHeight(Math.max(200, Math.min(window.innerHeight - 100, newHeight)));
        }
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
      setIsResizingEditorHeight(false);
      setIsResizingPreview(false);
      setIsResizingPreviewHeight(false);
      setIsResizingAI(false);
      setIsResizingAIHeight(false);
      setIsResizingTOC(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizingSidebar || isResizingEditor || isResizingEditorHeight || isResizingPreview || isResizingPreviewHeight || isResizingAI || isResizingAIHeight || isResizingTOC) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isResizingTOC || isResizingPreviewHeight || isResizingEditorHeight || isResizingAIHeight ? 'row-resize' : 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingSidebar, isResizingEditor, isResizingEditorHeight, isResizingPreview, isResizingPreviewHeight, isResizingAI, isResizingAIHeight, isResizingTOC, sidebarWidth, editorWidth, showSidebar, showEditor, isMobile]);

  const handleLogoClick = () => {
    const newClicks = logoClicks + 1;
    setLogoClicks(newClicks);
    if (newClicks >= 3) {
      setInputModal({
        show: true,
        type: 'egg',
        value: '',
        callback: (code) => {
          if (code.trim().toLowerCase() === 'csdc') {
            setShowEasterEgg(true);
            setStorageItem(storageKeys.AI_CONFIG, DEFAULT_AI_CONFIG);
            aiService.updateConfig(DEFAULT_AI_CONFIG);
            alert('🎉 恭喜！神秘代码正确，内置 AI 配置已解锁');
            setTimeout(() => setShowEasterEgg(false), 5000);
          } else {
            // 输入错误，清除当前配置并提示
            const emptyConfig: AIServiceConfig = {
              provider: 'openai',
              model: '',
              imageModel: '',
              apiKey: '',
              baseURL: 'https://api.openai.com/v1'
            };
            setStorageItem(storageKeys.AI_CONFIG, emptyConfig);
            aiService.updateConfig(emptyConfig);
            alert('❌ 神秘代码错误：无法验证身份。为确保安全，已重置并禁用当前内置 AI 配置。');
          }
        }
      });
      setLogoClicks(0);
    }
    // 3秒后重置点击次数
    const timer = setTimeout(() => setLogoClicks(0), 3000);
    return () => clearTimeout(timer);
  };

  const handleTemplateApply = (template: Template) => {
    // 创建一个新文件来存放模板内容
    const ext = template.type === 'html' ? '.html' : '.md';
    const baseName = template.name.replace(/\.(md|html)$/, '');
    const fileName = `${baseName}_${Date.now()}${ext}`;
    
    // 获取根前缀，确保路径完整
    const rootPrefix = fileList.length > 0 ? fileList[0].path.split('/')[0] : 'docs';
    const fullPath = `${rootPrefix}/${fileName}`;
    
    const newFile: FileItem = {
      name: fileName,
      path: fullPath,
      kind: 'file',
      content: template.content,
      isStatic: false
    };

    setFileList(prev => [...prev, newFile]);
    setActiveFile(fullPath);
    setContent(template.content);
    
    // 保存初始内容到 localStorage
    localStorage.setItem(`md2slide_file_${fullPath}`, template.content);
    
    setEditorMode(template.type === 'md' ? 'markdown' : template.type);
    setShowTemplateMarketplace(false);
  };

  const handleSaveAsTemplate = async (item: FileItem) => {
    try {
      // 1. 获取文件内容
      let fileContent = '';
      const filePath = item.path || item.name;
      const storageKey = `md2slide_file_${filePath}`;
      const savedContent = localStorage.getItem(storageKey);

      if (savedContent !== null) {
        fileContent = savedContent;
      } else if (item.content !== undefined) {
        fileContent = item.content;
      } else if (item.isStatic) {
        const response = await fetch(`/${filePath}`);
        if (response.ok) {
          fileContent = await response.text();
        }
      }

      if (!fileContent) {
        alert('无法获取文件内容，保存失败');
        return;
      }

      // 2. 弹出重命名/描述输入框
      setInputModal({
        show: true,
        type: 'confirm',
        value: '',
        message: `将 "${item.name}" 保存为模板？`,
        callback: () => {
          const type = item.name.endsWith('.html') ? 'html' : 'md';
          const newTemplate: Template = {
            id: `custom-${Date.now()}`,
            name: item.name.replace(/\.(md|html)$/, ''),
            type: type,
            description: '从本地文件保存的自定义模板',
            content: fileContent
          };
          
          templateMarketplaceService.addTemplate(newTemplate);
          alert('🎉 模板保存成功！您可以在模板市场中找到它。');
        }
      });
    } catch (error) {
      console.error('Failed to save as template:', error);
      alert('保存模板时出错');
    }
  };

  const handleModeSwitch = (mode: 'markdown' | 'html') => {
    if (mode === editorMode) return;
    
    // 如果当前内容是默认的 md 教程且要切换到 html，或者反之，则加载对应的默认教程
    if (mode === 'html' && (activeFile === 'docs/tutorial.md' || content.includes('Markdown 教程'))) {
      loadFile({ name: 'docs/tutorial.html', path: 'docs/tutorial.html', kind: 'file', isStatic: true });
    } else if (mode === 'markdown' && (activeFile === 'docs/tutorial.html' || content.includes('HTML 模式指南'))) {
      loadFile({ name: 'docs/tutorial.md', path: 'docs/tutorial.md', kind: 'file', isStatic: true });
    }
    
    setEditorMode(mode);
  };

  const toggleAISidebar = () => {
    const isVisible = layoutOrder.includes('ai');
    if (isVisible) {
      setLayoutOrder(prev => prev.filter(s => s !== 'ai'));
      setShowAISidebar(false);
    } else {
      setLayoutOrder(prev => [...prev, 'ai']);
      setShowAISidebar(true);
    }
  };

  const moveFile = (sourcePath: string, targetPath: string) => {
    if (sourcePath === targetPath) return;

    setFileList(prev => {
      let movedItem: FileItem | null = null;

      // 1. 查找并移除源项
      const removeRecursive = (items: FileItem[]): FileItem[] => {
        const filtered = items.filter(item => {
          const currentPath = item.path || item.name;
          if (currentPath === sourcePath) {
            movedItem = { ...item };
            return false;
          }
          return true;
        });

        return filtered.map(item => {
          if (item.children) {
            const newChildren = removeRecursive(item.children);
            if (newChildren !== item.children) {
              return { ...item, children: newChildren };
            }
          }
          return item;
        });
      };

      const newListWithoutSource = removeRecursive(prev);

      if (!movedItem) return prev;

      // 2. 将项插入目标目录
      const insertRecursive = (items: FileItem[]): FileItem[] => {
        // 如果目标是根目录
        if (targetPath === 'root') {
          // 更新被移动项的路径（顶级项）
          const newItem = {
            ...movedItem!,
            path: movedItem!.name,
            children: movedItem!.children?.map(child => {
              const updatePath = (file: FileItem, parentPath: string): FileItem => {
                const newPath = `${parentPath}/${file.name}`;
                return {
                  ...file,
                  path: newPath,
                  children: file.children?.map(c => updatePath(c, newPath))
                };
              };
              return updatePath(child, movedItem!.name);
            })
          };
          return [...items, newItem];
        }

        return items.map(item => {
          const currentPath = item.path || item.name;
          if (currentPath === targetPath && item.kind === 'directory') {
            // 更新被移动项的路径
            const updatePathRecursive = (file: FileItem, parentPath: string): FileItem => {
              const newPath = `${parentPath}/${file.name}`;
              return {
                ...file,
                path: newPath,
                children: file.children?.map(child => updatePathRecursive(child, newPath))
              };
            };
            
            const newItem = updatePathRecursive(movedItem!, targetPath);
            return {
              ...item,
              children: [...(item.children || []), newItem]
            };
          }
          if (item.children) {
            return { ...item, children: insertRecursive(item.children) };
          }
          return item;
        });
      };

      return insertRecursive(newListWithoutSource);
    });
  };

  const loadFile = async (file: FileItem) => {
    try {
      let text: string | null = null;
      const filePath = file.path || file.name;

      // 优先从 localStorage 读取保存的内容
      const storageKey = `md2slide_file_${filePath}`;
      const savedContent = localStorage.getItem(storageKey);

      if (savedContent !== null) {
        text = savedContent;
      } else if (file.isStatic) {
        const response = await fetch(`/${filePath}`);
        if (response.ok) {
          text = await response.text();
        }
      } else if (file.handle) {
        const fileData = await (file.handle as FileSystemFileHandle).getFile();
        text = await fileData.text();
      } else if (file.content !== undefined) {
        text = file.content;
      }

      if (text !== null) {
        setContent(text);
        setActiveFile(filePath);
        
        // 自动切换模式
        if (filePath.toLowerCase().endsWith('.html') || filePath.toLowerCase().endsWith('.htm')) {
          setEditorMode('html');
        } else {
          setEditorMode('markdown');
        }
      }
    } catch (error) {
      console.error('Failed to load file:', error);
    }
  };

  const deleteFile = (filePath: string) => {
    setInputModal({
      show: true,
      type: 'confirm',
      value: '',
      message: `确定要删除 ${filePath} 吗？`,
      callback: () => {
        // 从 localStorage 中删除文件内容
        localStorage.removeItem(`md2slide_file_${filePath}`);
        
        setFileList(prev => {
          const removeRecursive = (items: FileItem[]): FileItem[] => {
            return items
              .filter(item => (item.path || item.name) !== filePath)
              .map(item => ({
                ...item,
                children: item.children ? removeRecursive(item.children) : undefined
              }));
          };
          return removeRecursive(prev);
        });
        if (activeFile === filePath) {
          setActiveFile(null);
          setContent('');
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
      downloadPPTX(slides, theme);
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
      const fileContent = await file.text();

      const newFile: FileItem = {
        name: file.name,
        path: file.name,
        kind: 'file',
        content: fileContent,
        handle: handle
      };

      // 保存导入的内容到 localStorage
      localStorage.setItem(`md2slide_file_${file.name}`, fileContent);

      setFileList(prev => {
        const existingIndex = prev.findIndex(f => (f.path || f.name) === file.name);
        if (existingIndex !== -1) {
          const newList = [...prev];
          newList[existingIndex] = newFile;
          return newList;
        }
        return [...prev, newFile];
      });

      // 自动保存到模板市场
      const templateType = file.name.endsWith('.html') ? 'html' : 'md';
      const newTemplate: Template = {
        id: `import-${Date.now()}`,
        name: file.name.replace(/\.(md|html)$/, ''),
        type: templateType,
        description: '自动导入的模板',
        content: fileContent
      };
      templateMarketplaceService.addTemplate(newTemplate);

      loadFile(newFile);
    } catch (err) {
      console.error(`${fileType === 'html' ? 'HTML' : 'Markdown'} Import failed:`, err);
    }
  };

  const renameFile = (item: FileItem) => {
    const oldPath = item.path;
    let nameOnly = item.name;
    let extension = '';
    
    if (item.kind === 'file') {
      const lastDotIndex = item.name.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        nameOnly = item.name.substring(0, lastDotIndex);
        extension = item.name.substring(lastDotIndex);
      }
    }
    
    setInputModal({
      show: true,
      type: 'rename',
      value: nameOnly,
      extension: extension,
      callback: (newName) => {
        if (newName && newName.trim()) {
          const finalName = newName + extension;
          const newPath = oldPath.includes('/') 
            ? oldPath.substring(0, oldPath.lastIndexOf('/') + 1) + finalName
            : finalName;

          setFileList(prev => {
            const renameRecursive = (items: FileItem[]): FileItem[] => {
              return items.map(item => {
                const currentPath = item.path || item.name;
                if (currentPath === oldPath) {
                  // 同步迁移 localStorage 中的内容
                  const oldKey = `md2slide_file_${oldPath}`;
                  const newKey = `md2slide_file_${newPath}`;
                  const savedContent = localStorage.getItem(oldKey);
                  if (savedContent) {
                    localStorage.setItem(newKey, savedContent);
                    localStorage.removeItem(oldKey);
                  }
                  return { ...item, name: finalName, path: newPath };
                }
                if (item.children) {
                  return { ...item, children: renameRecursive(item.children) };
                }
                return item;
              });
            };
            return renameRecursive(prev);
          });
          
          if (activeFile === oldPath) {
            setActiveFile(newPath);
          }
        }
      }
    });
  };

  const createFile = (targetItem: FileItem) => {
    setInputModal({
      show: true,
      type: 'create',
      value: '',
      fileType: 'markdown',
      callback: (fileName, _, fileType) => {
        if (fileName && fileName.trim()) {
          const ext = fileType === 'html' ? '.html' : '.md';
          const nameWithExt = fileName.endsWith(ext) ? fileName : `${fileName}${ext}`;
          
          // 确定父级路径
          let parentPath = '';
          if (targetItem.path === 'root') {
            parentPath = '';
          } else {
            const pathParts = targetItem.path.split('/');
            if (targetItem.kind === 'file') {
              pathParts.pop();
            }
            
            if (pathParts.length <= 1) {
              parentPath = '';
            } else {
              parentPath = pathParts.join('/');
            }
          }

          // 获取根前缀（用于保持路径完整性）
          const rootPrefix = fileList.length > 0 ? fileList[0].path.split('/')[0] : 'docs';
          const fullPath = parentPath 
            ? `${parentPath}/${nameWithExt}` 
            : `${rootPrefix}/${nameWithExt}`;
          
          // 检查文件名是否已存在
          const exists = (items: FileItem[]): boolean => {
            for (const item of items) {
              if (item.path === fullPath && item.kind === 'file') return true;
              if (item.children && exists(item.children)) return true;
            }
            return false;
          };
          
          if (exists(fileList)) {
            alert(`文件 ${fullPath} 已存在`);
            return;
          }

          const newFile: FileItem = {
            name: nameWithExt,
            path: fullPath,
            kind: 'file',
            content: '',
            isStatic: false
          };

          const insertInTree = (items: FileItem[]): FileItem[] => {
            if (!parentPath) return [...items, newFile];
            return items.map(item => {
              if (item.path === parentPath && item.kind === 'directory') {
                return { ...item, children: [...(item.children || []), newFile] };
              }
              if (item.children) return { ...item, children: insertInTree(item.children) };
              return item;
            });
          };

          setFileList(prev => insertInTree(prev));
          setContent('');
          setActiveFile(fullPath);
          
          // 初始化 localStorage 中的内容
          localStorage.setItem(`md2slide_file_${fullPath}`, '');
          
          setEditorMode(fileType || 'markdown');
        }
      }
    });
  };

  const openFolder = async () => {
    try {
      // @ts-ignore - File System Access API
      const directoryHandle = await window.showDirectoryPicker();
      
      async function buildTree(handle: FileSystemDirectoryHandle, currentPath: string): Promise<FileItem[]> {
        const items: FileItem[] = [];
        // @ts-ignore
        for await (const entry of handle.values()) {
          const entryPath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
          if (entry.kind === 'file' && (entry.name.endsWith('.md') || entry.name.endsWith('.html'))) {
            items.push({ 
              name: entry.name, 
              path: entryPath,
              kind: 'file', 
              handle: entry as FileSystemFileHandle 
            });
          } else if (entry.kind === 'directory') {
            const children = await buildTree(entry as FileSystemDirectoryHandle, entryPath);
            if (children.length > 0) {
              items.push({ 
                name: entry.name, 
                path: entryPath,
                kind: 'directory', 
                handle: entry as FileSystemDirectoryHandle, 
                children 
              });
            }
          }
        }
        return items.sort((a, b) => {
          if (a.kind !== b.kind) return a.kind === 'directory' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      }

      const tree = await buildTree(directoryHandle, directoryHandle.name);
      
      if (tree.length > 0) {
        // 当打开新文件夹时，完全替换 fileList，只显示选中的文件夹内容
        // 直接将子项作为根列表，实现不显示选中的根目录本身
        setFileList(tree);
        
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
    loadFile({ name: 'tutorial.md', path: 'docs/tutorial.md', kind: 'file', isStatic: true });
  }, []);

  const applySnippet = (beforeStr: string, afterStr: string = '') => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selection = content.slice(start, end);
    
    // 检查是否是行首语法 (标题、列表、引用)
    const isLineStart = beforeStr.startsWith('#') || beforeStr.startsWith('- ') || beforeStr.startsWith('1. ') || beforeStr.startsWith('> ');
    
    if (isLineStart) {
      const lastNewLine = content.lastIndexOf('\n', start - 1);
      const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
      const lineEnd = content.indexOf('\n', start);
      const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;
      const lineText = content.slice(lineStart, actualLineEnd);
      
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
      localStorage.setItem(storageKey, content);

      // 同时更新 fileList 中的内容，确保下载等功能能获取到最新内容
      setFileList(prev => {
        const updateRecursive = (items: FileItem[]): FileItem[] => {
          return items.map(item => {
            const currentPath = item.path || item.name;
            if (currentPath === activeFile && item.kind === 'file') {
              return { ...item, content: content };
            }
            if (item.children) {
              return { ...item, children: updateRecursive(item.children) };
            }
            return item;
          });
        };
        return updateRecursive(prev);
      });

      // 显示保存成功提示
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 2000);
    } catch (error) {
      console.error('保存文件失败:', error);
      alert('保存文件失败，请重试');
    }
  };

    // 复制当前行
    const duplicateLine = () => {
      const textarea = editorRef.current;
      if (!textarea) return;
      
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const lines = content.split('\n');
      
      // 计算当前光标所在的行号
      let currentLineStart = 0;
      let currentLineNum = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineEnd = currentLineStart + lines[i].length;
        if (start <= lineEnd) {
          currentLineNum = i;
          break;
        }
        currentLineStart = lineEnd + 1; // +1 for newline character
      }
      
      // 获取当前行内容
      const currentLine = lines[currentLineNum];
      
      // 在当前行之后插入相同内容
      lines.splice(currentLineNum + 1, 0, currentLine);
      
      // 计算新内容和光标位置
      const newContent = lines.join('\n');
      const newCursorPosition = currentLineStart + currentLine.length + 1; // +1 for newline
      
      // 保存到历史记录
      pushToHistory(newContent);
      
      // 更新内容并设置光标位置
      setContent(newContent);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
    // 删除当前行
  const deleteLine = () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lines = content.split('\n');
    
    // 计算当前光标所在的行号
    let currentLineStart = 0;
    let currentLineNum = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentLineStart + lines[i].length;
      if (start <= lineEnd) {
        currentLineNum = i;
        break;
      }
      currentLineStart = lineEnd + 1; // +1 for newline character
    }
    
    // 删除当前行
    lines.splice(currentLineNum, 1);
    
    // 计算新内容和光标位置
    const newContent = lines.join('\n');
    let newCursorPosition = currentLineStart;
    // 确保光标位置不超过新内容长度
    if (newCursorPosition > newContent.length) {
      newCursorPosition = newContent.length;
    }
    
    // 保存到历史记录
    pushToHistory(newContent);
    
    // 更新内容并设置光标位置
    setContent(newContent);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 0);
  };
  
    // 移动行向上
  const moveLineUp = () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lines = content.split('\n');
    
    // 计算当前光标所在的行号
    let currentLineStart = 0;
    let currentLineNum = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentLineStart + lines[i].length;
      if (start <= lineEnd) {
        currentLineNum = i;
        break;
      }
      currentLineStart = lineEnd + 1; // +1 for newline character
    }
    
    // 如果不是第一行，则向上移动
    if (currentLineNum > 0) {
      // 交换当前行和上一行
      const temp = lines[currentLineNum];
      lines[currentLineNum] = lines[currentLineNum - 1];
      lines[currentLineNum - 1] = temp;
      
      // 计算新内容和光标位置
      const prevLineLength = lines[currentLineNum].length; // 新位置的上一行长度
      const newContent = lines.join('\n');
      const newCursorPosition = start - prevLineLength - 1; // -1 for newline character
      
      // 保存到历史记录
      pushToHistory(newContent);
      
      // 更新内容并设置光标位置
      setContent(newContent);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };
  
  // 移动行向下
  const moveLineDown = () => {
    const textarea = editorRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const lines = content.split('\n');
    
    // 计算当前光标所在的行号
    let currentLineStart = 0;
    let currentLineNum = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentLineStart + lines[i].length;
      if (start <= lineEnd) {
        currentLineNum = i;
        break;
      }
      currentLineStart = lineEnd + 1; // +1 for newline character
    }
    
    // 如果不是最后一行，则向下移动
    if (currentLineNum < lines.length - 1) {
      // 交换当前行和下一行
      const temp = lines[currentLineNum];
      lines[currentLineNum] = lines[currentLineNum + 1];
      lines[currentLineNum + 1] = temp;
      
      // 计算新内容和光标位置
      const currLineLength = lines[currentLineNum + 1].length; // 原位置的当前行长度
      const newContent = lines.join('\n');
      const newCursorPosition = start + currLineLength + 1; // +1 for newline character
      
      // 保存到历史记录
      pushToHistory(newContent);
      
      // 更新内容并设置光标位置
      setContent(newContent);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    }
  };
  

  
  // 处理格式延续
  const handleFormatContinuation = () => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // 获取当前行的格式
    const formatInfo = getCurrentLineFormat(start);
    
    // 如果当前行有格式，则在下一行插入相同的格式
    if (formatInfo.format) {
      const lines = content.split('\n');
      
      let currentLineStart = 0;
      let currentLineNum = 0;
      for (let i = 0; i < lines.length; i++) {
        const lineEnd = currentLineStart + lines[i].length;
        if (start <= lineEnd) {
          currentLineNum = i;
          break;
        }
        currentLineStart = lineEnd + 1; // +1 for newline character
      }
      
      // 插入换行和格式
      const newContent = content.substring(0, start) + '\n' + formatInfo.indent + formatInfo.format + content.substring(end);
      // 保存到历史记录
      pushToHistory(newContent);
      setContent(newContent);
      
      // 设置光标位置
      setTimeout(() => {
        if (textarea) {
          const newCursorPosition = start + 1 + formatInfo.indent.length + formatInfo.format.length; // +1 for newline
          textarea.focus();
          textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }, 0);
    } else {
      // 如果当前行没有特殊格式，则正常插入换行
      const newContent = content.substring(0, start) + '\n' + content.substring(end);
      // 保存到历史记录
      pushToHistory(newContent);
      setContent(newContent);
      
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(start + 1, start + 1); // +1 for newline
        }
      }, 0);
    }
  };
  
  // 获取当前行的缩进和格式
  const getCurrentLineFormat = (cursorPosition: number) => {
    const lines = content.split('\n');
    
    let currentLineStart = 0;
    let currentLineNum = 0;
    for (let i = 0; i < lines.length; i++) {
      const lineEnd = currentLineStart + lines[i].length;
      if (cursorPosition <= lineEnd) {
        currentLineNum = i;
        break;
      }
      currentLineStart = lineEnd + 1; // +1 for newline character
    }
    
    const currentLine = lines[currentLineNum];

    // 检测不同类型的格式（按优先级从高到低）
    const todoMatch = currentLine.match(/^([\s\t]*)((-|\*)[\s\t]+\[[ xX]\][\s\t]+)/); // 任务列表（优先）
    const listMatch = currentLine.match(/^([\s\t]*)((-|\*)\s+)/); // 无序列表
    const orderedListMatch = currentLine.match(/^([\s\t]*)(\d+\.\s+)/); // 有序列表
    const quoteMatch = currentLine.match(/^([\s\t]*)>\s+/); // 引用

    if (todoMatch) {
      // 任务列表：保留列表符号，重置为 [ ]
      return { indent: todoMatch[1], format: todoMatch[2].replace(/\[[ xX]\]/, '[ ] ') };
    } else if (listMatch) {
      return { indent: listMatch[1], format: listMatch[2] };
    } else if (orderedListMatch) {
      // 递增数字
      const nextNum = parseInt(orderedListMatch[2]) + 1;
      return { indent: orderedListMatch[1], format: `${nextNum}. ` };
    } else if (quoteMatch) {
      return { indent: quoteMatch[1], format: '> ' };
    }

    return { indent: '', format: '' };
  };
  
  const handleLinkInsert = () => {
    const textarea = editorRef.current;
    const selection = textarea ? content.slice(textarea.selectionStart, textarea.selectionEnd) : '';
    
    setInputModal({
      show: true,
      type: 'link',
      value: 'https://',
      titleValue: selection || '链接文字',
      callback: (url, title) => applySnippet(`[${title || '链接文字'}](${url})`, '')
    });
  };

  // 格式化文档：自动对齐缩进，去除每行首尾多余空白字符
  const handleFormatDocument = () => {
    if (!content) return;
    
    // 保存当前光标位置
    const textarea = editorRef.current;
    const currentCursorPosition = textarea ? textarea.selectionStart : 0;
    
    // 分割成行并格式化每一行
    const lines = content.split('\n');
    const formattedLines = lines.map(line => {
      // 去除首尾空白字符，但保留行内缩进
      const trimmedLine = line.trimEnd();
      
      // 处理缩进：将制表符转换为空格（4个空格），并将多个空格规范化
      let formattedLine = trimmedLine.replace(/^\t+/g, match => '    '.repeat(match.length)); // 制表符转空格
      
      // 保持行首的缩进一致性
      const leadingWhitespaceMatch = formattedLine.match(/^[ \t]*/);
      const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0] : '';
      const contentWithoutLeadingWhitespace = formattedLine.substring(leadingWhitespace.length);
      
      // 对内容部分进行处理，但保留缩进
      return leadingWhitespace + contentWithoutLeadingWhitespace.trimEnd();
    });
    
    // 合并格式化后的行
    const formattedContent = formattedLines.join('\n');
    
    // 保存到历史记录
    pushToHistory(formattedContent);
    setContent(formattedContent);
    
    // 恢复光标位置（尽量接近原来的位置）
    setTimeout(() => {
      if (textarea) {
        // 计算新内容中的大致光标位置
        let newPosition = currentCursorPosition;
        if (newPosition > formattedContent.length) {
          newPosition = formattedContent.length;
        }
        textarea.focus();
        textarea.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
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

  // 使用 ref 来存储防抖计时器
  const selectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextSelection = (e: React.MouseEvent | React.KeyboardEvent) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    if (selectionTimerRef.current) {
      clearTimeout(selectionTimerRef.current);
    }

    selectionTimerRef.current = setTimeout(() => {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selection = textarea.value.substring(start, end).trim();

      if (selection && selection.length > 0) {
        let x = 0;
        let y = 0;

        if (e && 'clientX' in e) {
          x = (e as React.MouseEvent).clientX;
          y = (e as React.MouseEvent).clientY;
        } else {
          const rect = textarea.getBoundingClientRect();
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }

        setSelectionInfo({
          text: selection,
          position: { x, y }
        });
      } else {
        // 只有在选区真正为空且没有进行 AI 助手操作时才清除
        const currentTextarea = editorRef.current;
        if (currentTextarea && currentTextarea.selectionStart === currentTextarea.selectionEnd) {
          if (!document.activeElement?.closest('.selection-ai-assistant')) {
            setSelectionInfo(null);
          }
        }
      }
    }, 150); // 稍微防抖
  };

  const handleSelectionApply = (newText: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + newText + content.slice(end);
    setContent(newContent);
    setSelectionInfo(null);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + newText.length);
    }, 0);
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
    const isCmd = e.metaKey; // macOS上的Cmd键

    // 获取当前快捷键配置
    const shortcuts = keyboardService.getShortcuts();

    // 检查是否有匹配的快捷键组合
    const matchedActionRaw = keyboardService.getActionForKeyboardEvent(e.nativeEvent);

    // 系统级快捷键，应该让浏览器原生处理
    const systemLevelShortcuts: Array<keyof ShortcutConfig> = [
      'copy', 'cut', 'paste', 'selectAll', 'undo', 'redo'
    ];

    // 导航专用快捷键，不阻止默认行为（让浏览器的原生编辑功能工作）
    const navigationShortcuts: Array<keyof ShortcutConfig> = [
      'nextSlide', 'prevSlide', 'toggleFullscreen', 'toggleEditor'
    ];

    if (matchedActionRaw) {
      const matchedAction = matchedActionRaw as keyof ShortcutConfig;

      // 对于导航类快捷键，不处理（返回）
      if (navigationShortcuts.includes(matchedAction)) {
        return;
      }

      // 对于系统级快捷键，不阻止默认行为
      if (!systemLevelShortcuts.includes(matchedAction)) {
        e.preventDefault();
      }

      switch (matchedAction) {
        case 'duplicateLine':
          duplicateLine();
          break;
        case 'deleteLine':
          deleteLine();
          break;
        case 'moveLineUp':
          moveLineUp();
          break;
        case 'moveLineDown':
          moveLineDown();
          break;
        case 'formatContinuation':
          handleFormatContinuation();
          break;
        case 'insertBold':
          applySnippet('**', '**');
          break;
        case 'insertItalic':
          if (isShift) {
            handleImageInsert();
          } else {
            applySnippet('*', '*');
          }
          break;
        case 'insertStrikethrough':
          applySnippet('~~', '~~');
          break;
        case 'saveFile':
          saveCurrentFile();
          break;
        case 'insertLink':
          handleLinkInsert();
          break;
        case 'insertCodeBlock':
          applySnippet('```\n', '\n```');
          break;
        case 'insertCode':
          applySnippet('`', '`');
          break;
        case 'insertImage':
          handleImageInsert();
          break;
        case 'insertHeading1':
          applySnippet('# ', '');
          break;
        case 'insertHeading2':
          applySnippet('## ', '');
          break;
        case 'insertHeading3':
          applySnippet('### ', '');
          break;
        case 'insertList':
          applySnippet('- ', '');
          break;
        case 'insertOrderedList':
          applySnippet('1. ', '');
          break;
        case 'insertTodo':
          applySnippet('- [ ] ', '');
          break;
        case 'insertQuote':
          applySnippet('> ', '');
          break;
        case 'insertFormula':
          applySnippet('$', '$');
          break;
        case 'insertMathBlock':
          applySnippet('$$\n', '\n$$');
          break;
        case 'insertPageBreak':
          applySnippet('\n---\n', '');
          break;
        case 'insertTable':
          applySnippet('| 列1 | 列2 |\n| :--- | :--- |\n| 内容1 | 内容2 |', '');
          break;
        case 'insertVideo':
          handleVideoInsert();
          break;
        case 'undo':
          performUndo();
          break;
        case 'redo':
          performRedo();
          break;
        case 'formatDocument':
          handleFormatDocument();
          break;
        default:
          // 如果没有匹配到任何操作，继续原有逻辑
          break;
      }
      return;
    }

    // 保留原有的其他 Ctrl 键快捷键
    if (isCtrl) {
      if (isAlt) {
        // 原有的 Ctrl+Alt 快捷键
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

      // 原有的其他 Ctrl 快捷键
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

    // 处理 Enter 键的格式延续功能（如果没有在 switch 中处理）
    if (e.key === 'Enter' && !isCtrl && !isShift && !isAlt && matchedActionRaw !== 'formatContinuation') {
      e.preventDefault();
      handleFormatContinuation();
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
    if (editorMode !== 'markdown') return [];
    const parsed = parseMarkdownToSlides(content, {
      useDelimiter: appSettings.useDelimiterPagination,
      useHeadingPagination: appSettings.useHeadingPagination,
      minHeadingLevel: appSettings.minHeadingLevel,
    });
    localStorage.setItem('md2slide_presenter_slides', JSON.stringify(parsed));
    return parsed;
  }, [content, appSettings, editorMode]);

  useEffect(() => {
    if (editorMode === 'markdown') {
      setSlides(parsedSlides);
      localStorage.setItem('md2slide_presenter_slides', JSON.stringify(parsedSlides));
      setActivePreviewSlideIndex(0);
      setToc(parseTableOfContents(content));
    } else if (editorMode === 'html') {
      // HTML 模式下解析 HTML 的标题作为大纲
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      
      const lines = content.split('\n');
      const htmlToc: TOCItem[] = headings.map((h, i) => {
        // 尝试寻找该标题在源码中的行号
        const tag = h.tagName.toLowerCase();
        const text = h.textContent?.trim() || '';
        let lineIndex = -1;
        
        for (let j = 0; j < lines.length; j++) {
          if (lines[j].toLowerCase().includes(`<${tag}`) && lines[j].includes(text)) {
            lineIndex = j;
            break;
          }
        }
        
        return {
          id: `toc-html-${i}`,
          level: parseInt(h.tagName.substring(1)),
          text: text,
          lineIndex: lineIndex
        };
      });
      setToc(htmlToc);
    }
  }, [parsedSlides, content, editorMode]);

  useEffect(() => {
    if (activeFile) {
      setFileList(prev => {
        const updateRecursive = (items: FileItem[]): FileItem[] => {
          return items.map(item => {
            const currentPath = item.path || item.name;
            if (currentPath === activeFile && item.kind === 'file') {
              // 只有内容确实变化时才更新
              if (item.content !== content) {
                return { ...item, content: content };
              }
              return item;
            }
            if (item.children) {
              const newChildren = updateRecursive(item.children);
              if (newChildren !== item.children) {
                return { ...item, children: newChildren };
              }
            }
            return item;
          });
        };
        const newList = updateRecursive(prev);
        return newList === prev ? prev : newList;
      });
    }
  }, [content, activeFile]);

  useEffect(() => {
    setStorageItem<AppSettings>(storageKeys.APP_SETTINGS, appSettings);
  }, [appSettings]);

  const scrollToLine = (lineIndex: number, tocItem?: TOCItem) => {
    // 1. 同步编辑器位置
    const textarea = editorRef.current;
    if (textarea && lineIndex >= 0) {
      const lines = textarea.value.split('\n');
      let offset = 0;
      for (let i = 0; i < lineIndex; i++) {
        offset += lines[i].length + 1; // +1 for newline
      }

      textarea.focus();
      textarea.setSelectionRange(offset, offset);
      
      const lineHeight = 24;
      textarea.scrollTop = lineIndex * lineHeight - 100;
    }

    // 2. 同步预览区位置
    if (editorMode === 'markdown' && lineIndex >= 0) {
      const mdLines = content.split('\n');
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
    } else if (editorMode === 'html' && tocItem) {
      // HTML 模式下的预览同步：通过 ID 或文本匹配
      const iframe = iframeRef.current;
      if (iframe && iframe.contentDocument) {
        // 在 iframe 中查找包含该文本的标题元素
        const headings = Array.from(iframe.contentDocument.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const target = headings.find(h => h.textContent?.trim() === tocItem.text.trim());
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
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
      
      // 检查是否按下了 Escape 键
      if (e.key === 'Escape') {
        // 关闭所有弹窗和浮层
        setShowHelp(false);
        setShowSettings(false);
        setShowThemeMarketplace(false);
        setShowTemplateMarketplace(false);
        setShowPluginMarketplace(false);
        setMobileMenuOpen(false);
        setShowEmojiPicker(false);
        setShowAIAssistant(false);
        setInputModal(prev => ({ ...prev, show: false }));
        setSelectionInfo(null);
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
        const fileContent = event.target?.result as string;
        setContent(fileContent);
        setActiveFile(file.name);
        
        // 自动切换模式
        if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
          setEditorMode('html');
        } else {
          setEditorMode('markdown');
        }
        
        // 将文件添加到左侧列表（如果不存在则添加，存在则更新内容）
        setFileList(prev => {
          const index = prev.findIndex(f => f.name === file.name);
          if (index !== -1) {
            const newList = [...prev];
            newList[index] = { ...newList[index], content: fileContent };
            return newList;
          }
          return [...prev, { name: file.name, path: file.name, kind: 'file', content: fileContent }];
        });

        // 自动保存到模板市场
        const templateType = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm') ? 'html' : 'md';
        const newTemplate: Template = {
          id: `upload-${Date.now()}`,
          name: file.name.replace(/\.(md|html|htm)$/i, ''),
          type: templateType,
          description: '自动上传的模板',
          content: fileContent
        };
        templateMarketplaceService.addTemplate(newTemplate);
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert(`${editorMode === 'markdown' ? 'Markdown' : 'HTML'} 已复制到剪贴板`);
  };

  return (
    <div style={{ 
      background: theme.colors.background, 
      height: '100vh', 
      width: '100vw',
      overflow: 'hidden',
      color: theme.colors.text, 
      fontFamily: theme.fontFamily, 
      transition: 'background 0.3s ease, color 0.3s ease', 
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    }}>
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
        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.3) translateY(20px); }
          50% { opacity: 1; transform: scale(1.05) translateY(-5px); }
          70% { transform: scale(0.9) translateY(2px); }
          100% { transform: scale(1) translateY(0); }
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
          <h1 
            onClick={handleLogoClick}
            style={{
              margin: 0,
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              textShadow: theme.theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '6px' : '8px',
              cursor: 'pointer',
              userSelect: 'none',
              position: 'relative'
            }}
          >
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
                  : '1px solid rgba(148,163,184,0.4)',
                transform: showEasterEgg ? 'rotate(360deg) scale(1.5)' : 'none',
                transition: 'all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            />
            <span style={{
              background: theme.theme === 'dark'
                ? `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`
                : 'none',
              WebkitBackgroundClip: theme.theme === 'dark' ? 'text' : 'initial',
              WebkitTextFillColor: theme.theme === 'dark' ? 'transparent' : theme.colors.text,
              color: theme.theme === 'dark' ? 'transparent' : theme.colors.text,
              transform: showEasterEgg ? 'translateX(10px) skewX(-10deg)' : 'none',
              transition: 'all 0.5s ease'
            }}>
              Md2Slide
            </span>
            {showEasterEgg && (
              <div style={{
                position: 'absolute',
                top: '40px',
                left: '0',
                background: theme.primaryColor,
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                animation: 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
                zIndex: 1000
              }}>
                ✨ 你发现了神秘彩蛋！
              </div>
            )}
          </h1>
          {!isMobile && (
            <>
              <div style={{ height: '15px', width: '1px', background: theme.colors.border }} />
              <span style={{ color: theme.colors.textSecondary, fontSize: '12px', fontWeight: 500 }}>Elevate Your Markdown into Cinematic Presentations</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: isMobile ? '12px' : '15px', alignItems: 'center' }}>
          {!isMobile && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewMenu(!showViewMenu);
                }}
                title="视图选项"
                style={{
                  background: showViewMenu ? theme.colors.border : 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.text,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  transition: 'all 0.2s',
                  boxShadow: showViewMenu ? 'none' : '0 1px 2px rgba(0,0,0,0.05)'
                }}
              >
                <Layers size={14} />
                <ChevronDown size={12} style={{ position: 'absolute', top: '50%', right: '2px', transform: `translateY(-50%) ${showViewMenu ? 'rotate(180deg)' : ''}`, transition: 'transform 0.2s' }} />
              </button>

              {showViewMenu && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '140px',
                  background: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  padding: '6px',
                  zIndex: 1000,
                  animation: 'fadeIn 0.2s ease-out',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}>
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    title={showSidebar ? '隐藏文件目录' : '显示文件目录'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: showSidebar ? `${theme.primaryColor}15` : 'transparent',
                      color: showSidebar ? theme.primaryColor : theme.colors.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      minWidth: '32px'
                    }}
                  >
                    <PanelLeftClose size={14} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: showSidebar ? theme.primaryColor : 'transparent', flexShrink: 0 }} />
                  </button>
                  <button
                    onClick={() => setShowEditor(!showEditor)}
                    title={showEditor ? '隐藏编辑器' : '显示编辑器'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: showEditor ? `${theme.primaryColor}15` : 'transparent',
                      color: showEditor ? theme.primaryColor : theme.colors.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      minWidth: '32px'
                    }}
                  >
                    <FileText size={14} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: showEditor ? theme.primaryColor : 'transparent', flexShrink: 0 }} />
                  </button>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    title={showPreview ? '隐藏实时预览' : '显示实时预览'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: showPreview ? `${theme.primaryColor}15` : 'transparent',
                      color: showPreview ? theme.primaryColor : theme.colors.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      minWidth: '32px'
                    }}
                  >
                    <Eye size={14} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: showPreview ? theme.primaryColor : 'transparent', flexShrink: 0 }} />
                  </button>
                  <div style={{ height: '1px', background: theme.colors.border, margin: '4px 0' }} />
                  <button
                    onClick={toggleAISidebar}
                    title={showAISidebar ? '隐藏AI助手' : '显示AI助手'}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: showAISidebar ? `${theme.primaryColor}15` : 'transparent',
                      color: showAISidebar ? theme.primaryColor : theme.colors.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      justifyContent: 'center',
                      minWidth: '32px'
                    }}
                  >
                    <Sparkles size={14} />
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: showAISidebar ? theme.primaryColor : 'transparent', flexShrink: 0 }} />
                  </button>
                </div>
              )}
            </div>
          )}
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
              width: '28px',
              height: '28px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = theme.colors.border)}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7', e.currentTarget.style.background = 'transparent')}
            title="插件市场"
          >
            <Puzzle size={16} />
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
              width: '28px',
              height: '28px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = theme.colors.border)}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7', e.currentTarget.style.background = 'transparent')}
            title="主题市场"
          >
            <Layout size={16} />
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
              width: '28px',
              height: '28px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = theme.colors.border)}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7', e.currentTarget.style.background = 'transparent')}
            title="设置"
          >
            <Settings size={16} />
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
              width: '28px',
              height: '28px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = theme.colors.border)}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7', e.currentTarget.style.background = 'transparent')}
            title="帮助文档"
          >
            <HelpCircle size={16} />
          </button>
          
          <button
            onClick={() => window.open('https://github.com/Alleyf/Md2Slide', '_blank')}
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
              width: '28px',
              height: '28px',
              borderRadius: '4px'
            }}
            onMouseEnter={(e) => !isMobile && (e.currentTarget.style.opacity = '1', e.currentTarget.style.background = theme.colors.border)}
            onMouseLeave={(e) => !isMobile && (e.currentTarget.style.opacity = '0.7', e.currentTarget.style.background = 'transparent')}
            title="GitHub 仓库"
          >
            <Github size={16} />
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
                onMove={moveFile}
                onExport={handleExportPDF}
                onExportPPTX={handleExportPPTX}
                onExportWord={handleExportWord}
                onImport={(fileType) => handleImportFile(fileType)}
                onOpenFolder={openFolder}
                onCreate={createFile}
                onCreateDir={createDirectory}
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
                        scrollToLine(item.lineIndex, item);
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
              <button
                onClick={() => setHelpTab('donate')}
                style={{
                  padding: '8px 4px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: helpTab === 'donate' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  color: helpTab === 'donate' ? theme.primaryColor : theme.colors.textSecondary,
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ☕ 请喝咖啡
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
              ) : helpTab === 'donate' ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', padding: '20px 0' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>☕</div>
                    <h2 style={{
                      margin: '0 0 16px 0',
                      fontSize: '28px',
                      fontWeight: 800,
                      color: theme.colors.text,
                      background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColor}dd)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                      请作者喝杯咖啡
                    </h2>
                    <p style={{
                      margin: '0',
                      fontSize: '16px',
                      color: theme.colors.textSecondary,
                      lineHeight: 1.6,
                      maxWidth: '480px'
                    }}>
                      如果 Md2Slide 让你感受到了便捷与美好，
                      <br />
                      如果它为你节省了宝贵的时间和精力，
                      <br />
                      欢迎通过扫码的方式支持作者继续完善这个项目
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '24px',
                    padding: '32px',
                    background: theme.theme === 'dark'
                      ? 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005))'
                      : 'linear-gradient(135deg, rgba(0,0,0,0.01), rgba(0,0,0,0.005))',
                    borderRadius: '20px',
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: theme.theme === 'dark'
                      ? '0 8px 32px rgba(0,0,0,0.3)'
                      : '0 8px 32px rgba(0,0,0,0.08)'
                  }}>
                    <div style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: `2px solid ${theme.primaryColor}40`,
                      background: theme.theme === 'dark' ? '#ffffff' : '#ffffff',
                      boxShadow: `0 8px 24px ${theme.primaryColor}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <img
                        src="/donate-qr.png"
                        alt="赞赏二维码"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>

                    <div style={{ textAlign: 'center', maxWidth: '300px' }}>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: theme.colors.text,
                        marginBottom: '12px'
                      }}>
                        感谢您的支持 💝
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: theme.colors.textSecondary,
                        lineHeight: 1.6
                      }}>
                        每一份支持都是对开源精神的鼓励，
                        <br />
                        都是对创造美好工具的动力源泉。
                        <br />
                        <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                          "开源不易，且行且珍惜"
                        </span>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 20px',
                      background: theme.primaryColor + '08',
                      borderRadius: '12px',
                      border: `1px solid ${theme.primaryColor}20`
                    }}>
                      <span style={{ fontSize: '16px' }}>💡</span>
                      <span style={{
                        fontSize: '13px',
                        color: theme.colors.textSecondary,
                        fontWeight: 500
                      }}>
                        支持支付宝、微信等主流支付方式
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <p style={{
                      margin: '0',
                      fontSize: '14px',
                      color: theme.colors.textSecondary,
                      fontStyle: 'italic'
                    }}>
                      您的每一次点击，都是对开源社区的贡献
                      <br />
                      让我们一起创造更好的工具，服务更多的人
                    </p>
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
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
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
              maxWidth: '800px',
              maxHeight: '85vh',
              background: theme.colors.surface,
              borderRadius: '16px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme === darkTheme ? '0 25px 60px rgba(0,0,0,0.6)' : '0 25px 50px rgba(15,23,42,0.18)',
              padding: '28px 32px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              overflow: 'hidden'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor || theme.primaryColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 8px 20px -6px ${theme.primaryColor}50`
                }}>
                  <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: theme.colors.text, marginBottom: '2px' }}>全局设置</div>
                  <div style={{ fontSize: '13px', color: theme.colors.textSecondary }}>
                    配置应用偏好和快捷键
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  border: `1px solid ${theme.colors.border}`,
                  background: 'transparent',
                  borderRadius: '8px',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  transition: 'all 0.2s ease',
                  fontSize: '18px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.border;
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                ✕
              </button>
            </div>

            {/* 设置选项卡 */}
            <div style={{
              display: 'flex',
              gap: '8px',
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: '0'
            }}>
              <button
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  background: settingsTab === 'general' ? `${theme.primaryColor}12` : 'transparent',
                  color: settingsTab === 'general' ? theme.primaryColor : theme.colors.text,
                  border: settingsTab === 'general' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  borderBottom: settingsTab === 'general' ? `2px solid ${theme.colors.surface}` : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: settingsTab === 'general' ? '600' : '500',
                  transition: 'all 0.2s ease',
                  marginBottom: settingsTab === 'general' ? '-2px' : '0'
                }}
                onClick={() => setSettingsTab('general')}
                onMouseEnter={(e) => {
                  if (settingsTab !== 'general') {
                    e.currentTarget.style.background = `${theme.colors.border}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (settingsTab !== 'general') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                通用设置
              </button>
              <button
                style={{
                  padding: '12px 20px',
                  borderRadius: '8px 8px 0 0',
                  background: settingsTab === 'keyboard' ? `${theme.primaryColor}12` : 'transparent',
                  color: settingsTab === 'keyboard' ? theme.primaryColor : theme.colors.text,
                  border: settingsTab === 'keyboard' ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
                  borderBottom: settingsTab === 'keyboard' ? `2px solid ${theme.colors.surface}` : 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: settingsTab === 'keyboard' ? '600' : '500',
                  transition: 'all 0.2s ease',
                  marginBottom: settingsTab === 'keyboard' ? '-2px' : '0'
                }}
                onClick={() => setSettingsTab('keyboard')}
                onMouseEnter={(e) => {
                  if (settingsTab !== 'keyboard') {
                    e.currentTarget.style.background = `${theme.colors.border}40`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (settingsTab !== 'keyboard') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                键盘快捷键
              </button>
            </div>
            
            {/* 设置内容区域 */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              minHeight: 0
            }}>
              {/* 通用设置内容 */}
              {settingsTab === 'general' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      padding: '20px 24px',
                      borderRadius: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.text, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.primaryColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="12" y1="8" x2="12" y2="16"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                      </svg>
                      分页设置
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        fontSize: '14px', 
                        color: theme.colors.text,
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        marginLeft: '-8px',
                        paddingLeft: '20px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${theme.colors.border}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      >
                        <input
                          type="checkbox"
                          checked={appSettings.useDelimiterPagination}
                          onChange={(e) =>
                            setAppSettings((prev) => ({
                              ...prev,
                              useDelimiterPagination: e.target.checked,
                            }))
                          }
                          style={{
                            marginTop: '2px',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>使用 --- 作为手动分页符</div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '2px' }}>
                            在 Markdown 中使用三个横线分隔符创建新的幻灯片
                          </div>
                        </div>
                      </label>

                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'flex-start', 
                        gap: '12px', 
                        fontSize: '14px', 
                        color: theme.colors.text,
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        transition: 'background 0.2s',
                        marginLeft: '-8px',
                        paddingLeft: '20px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${theme.colors.border}40`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                      >
                        <input
                          type="checkbox"
                          checked={appSettings.useHeadingPagination}
                          onChange={(e) =>
                            setAppSettings((prev) => ({
                              ...prev,
                              useHeadingPagination: e.target.checked,
                            }))
                          }
                          style={{
                            marginTop: '2px',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>根据标题自动分页</div>
                          <div style={{ fontSize: '12px', color: theme.colors.textSecondary, marginTop: '2px' }}>
                            按照指定的标题级别自动创建新的幻灯片
                          </div>
                        </div>
                      </label>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        fontSize: '14px', 
                        color: theme.colors.text,
                        padding: '8px 8px 8px 20px',
                        opacity: appSettings.useHeadingPagination ? 1 : 0.5
                      }}>
                        <span style={{ fontWeight: 500 }}>标题等级阈值：</span>
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
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.colors.border}`,
                            background: theme.colors.surface,
                            color: theme.colors.text,
                            fontSize: '14px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!appSettings.useHeadingPagination) return;
                            e.currentTarget.style.borderColor = theme.primaryColor;
                          }}
                          onMouseLeave={(e) => {
                            if (!appSettings.useHeadingPagination) return;
                            e.currentTarget.style.borderColor = theme.colors.border;
                          }}
                        >
                          <option value={1}>一级标题 (#)</option>
                          <option value={2}>二级标题 (##)</option>
                          <option value={3}>三级标题 (###)</option>
                          <option value={4}>四级标题 (####)</option>
                          <option value={5}>五级标题 (#####)</option>
                          <option value={6}>六级标题 (######)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px',
                      padding: '20px 24px',
                      borderRadius: '12px',
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`
                    }}
                  >
                    <div style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.text, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.primaryColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      预览设置
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ fontSize: '14px', color: theme.colors.text, fontWeight: 500 }}>HTML 预览背景色</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          border: `1px solid ${theme.colors.border}`,
                          background: theme.colors.surface,
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = theme.primaryColor;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = theme.colors.border;
                        }}>
                          <input
                            type="color"
                            value={appSettings.htmlPreviewBackground || theme.colors.background}
                            onChange={(e) =>
                              setAppSettings((prev) => ({
                                ...prev,
                                htmlPreviewBackground: e.target.value,
                              }))
                            }
                            style={{
                              padding: '0',
                              width: '36px',
                              height: '28px',
                              borderRadius: '6px',
                              border: `1px solid ${theme.colors.border}`,
                              background: 'transparent',
                              cursor: 'pointer'
                            }}
                            title="选择 HTML 预览背景色"
                          />
                          <span style={{ 
                            fontSize: '13px', 
                            fontFamily: 'monospace',
                            color: theme.colors.textSecondary,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: theme.colors.background
                          }}>
                            {appSettings.htmlPreviewBackground || '跟随主题'}
                          </span>
                        </div>
                        <button
                          onClick={() => setAppSettings(prev => ({ ...prev, htmlPreviewBackground: '' }))}
                          style={{
                            padding: '8px 16px',
                            fontSize: '13px',
                            fontWeight: 500,
                            borderRadius: '8px',
                            border: `1px solid ${theme.colors.border}`,
                            background: 'transparent',
                            color: theme.colors.text,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = theme.colors.border;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          恢复默认
                        </button>
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        color: theme.colors.textSecondary, 
                        opacity: 0.8,
                        padding: '8px 12px',
                        background: `${theme.colors.textSecondary}10`,
                        borderRadius: '6px',
                        borderLeft: `3px solid ${theme.primaryColor}`
                      }}>
                        💡 提示：HTML 预览模式下，可以使用 <code style={{
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: theme.colors.border,
                          fontFamily: 'monospace',
                          fontSize: '11px'
                        }}>.contrast-text</code> 类确保文字清晰。
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 键盘快捷键设置内容 */}
              {settingsTab === 'keyboard' && (
                <div style={{ padding: '4px 0' }}>
                  <KeyboardShortcutsPanel embedded={true} />
                </div>
              )}
            </div>

            <div style={{ 
              fontSize: '12px', 
              color: theme.colors.textSecondary, 
              padding: '12px 16px',
              background: `${theme.colors.textSecondary}08`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={theme.colors.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
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
                    flex: flexibleSection === 'sidebar' ? 1 : 'none',
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
              onSaveAsTemplate={handleSaveAsTemplate}
              onMove={moveFile}
                    onExport={handleExportPDF}
                  onExportPPTX={handleExportPPTX}
                  onExportWord={handleExportWord}
                    onImport={handleImportFile}
                    onOpenFolder={openFolder}
                    onCreate={createFile}
                    onCreateDir={createDirectory}
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
                            onClick={() => scrollToLine(item.lineIndex, item)}
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
                  id="editor-container"
                  onDragOver={(e) => handleDragOver(e, 'editor')}
                  style={{
                    width: isMobile ? '100%' : `${editorWidth}px`,
                    height: isMobile ? '100%' : (editorHeight > 0 ? `${editorHeight}px` : 'auto'),
                    flex: isResizingEditor || isMobile || editorHeight > 0 ? 'none' : (flexibleSection === 'editor' ? 1 : 'none'),
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: isMobile ? '100%' : '300px',
                    position: 'relative',
                    background: theme.colors.surface,
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          transition: 'all 0.2s',
                          opacity: 0.7
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '1';
                          e.currentTarget.style.background = theme.colors.border;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '0.7';
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="收起编辑器"
                      >
                        <PanelRightClose size={12} />
                      </button>
                      <GripVertical size={14} style={{ opacity: 0.5 }} />
                      {editorMode === 'markdown' ? 'Markdown 编辑器' : 'HTML 编辑器'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px', background: theme.colors.border, padding: '2px', borderRadius: '6px' }}>
                      <button
                        onClick={() => handleModeSwitch('markdown')}
                        title="Markdown 模式"
                        style={{
                          padding: '4px',
                          border: 'none',
                          borderRadius: '4px',
                          background: editorMode === 'markdown' ? theme.primaryColor : 'transparent',
                          color: editorMode === 'markdown' ? '#fff' : theme.colors.textSecondary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <FileText size={12} />
                      </button>
                      <button
                        onClick={() => handleModeSwitch('html')}
                        title="HTML 模式"
                        style={{
                          padding: '4px',
                          border: 'none',
                          borderRadius: '4px',
                          background: editorMode === 'html' ? theme.primaryColor : 'transparent',
                          color: editorMode === 'html' ? '#fff' : theme.colors.textSecondary,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Code size={12} />
                      </button>
                    </div>
                    <button
                      onClick={() => setShowTemplateMarketplace(true)}
                      style={{
                        padding: '4px',
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        background: 'transparent',
                        color: theme.colors.textSecondary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        transition: 'all 0.2s',
                        opacity: 0.7
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.borderColor = theme.primaryColor;
                        e.currentTarget.style.color = theme.primaryColor;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                        e.currentTarget.style.borderColor = theme.colors.border;
                        e.currentTarget.style.color = theme.colors.textSecondary;
                      }}
                      title="模板市场"
                    >
                      <Layout size={12} />
                    </button>
                    {activeFile && (
                    <span style={{ fontSize: '10px', opacity: 0.6, textTransform: 'none' }}>
                      正在编辑: {activeFile}
                    </span>
                  )}
                </div>

                {/* Markdown Toolbar - Only show in markdown mode */}
                {editorMode === 'markdown' ? (
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
                ) : (
                  <div style={{ padding: '6px 10px', borderBottom: `1px solid ${theme.colors.border}`, display: 'flex', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: theme.colors.textSecondary, opacity: 0.8 }}>
                      HTML 编辑模式：支持标准 HTML5 语法及内联样式。
                    </span>
                  </div>
                )}

                {/* Emoji Picker Overlay */}
                {showEmojiPicker && editorMode === 'markdown' && (
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
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    onMouseUp={handleTextSelection}
                    onKeyUp={handleTextSelection}
                    onScroll={handleEditorScroll}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      padding: isMobile ? '16px' : '20px',
                      color: theme.colors.text,
                      fontSize: isMobile ? '13px' : '14px',
                      fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                      resize: 'none',
                      outline: 'none',
                      lineHeight: '1.7',
                      tabSize: 2,
                      WebkitOverflowScrolling: 'touch'
                    }}
                    placeholder={editorMode === 'markdown' ? "在此输入 Markdown 内容..." : "在此输入 HTML 内容..."}
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
                    <span style={{ color: theme.primaryColor }}>技巧:</span> {editorMode === 'markdown' ? (
                      <>使用 <code style={{ color: theme.colors.textSecondary }}>---</code> 分隔幻灯片。</>
                    ) : (
                      <>使用标准 HTML 标签，如 <code style={{ color: theme.colors.textSecondary }}>&lt;div&gt;</code>, <code style={{ color: theme.colors.textSecondary }}>&lt;h1&gt;</code> 等。</>
                    )}
                  </div>

                  {/* Vertical Resize Handle for Editor (Bottom) */}
                  {!isMobile && (
                    <div
                      onMouseDown={() => setIsResizingEditorHeight(true)}
                      onDoubleClick={() => setEditorHeight(0)}
                      style={{
                        height: '6px',
                        width: '100%',
                        cursor: 'row-resize',
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        zIndex: 30,
                        background: isResizingEditorHeight ? theme.primaryColor : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                      onMouseLeave={(e) => !isResizingEditorHeight && (e.currentTarget.style.background = 'transparent')}
                      title="双击恢复默认高度"
                    />
                  )}

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
            if (!showPreview && !isFullscreenMode && !isMobile) {
              return (
                <div 
                  key="preview-collapsed"
                  onClick={() => setShowPreview(true)}
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
                  title="展开预览"
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
                    预览板块
                  </div>
                </div>
              );
            }
            if (!showPreview && isMobile) return null;

            return (
              <React.Fragment key="preview">
                <div 
                  onDragOver={(e) => handleDragOver(e, 'preview')}
                  style={{
                    flex: isFullscreenMode || flexibleSection === 'preview' ? 1 : 'none',
                    width: !isFullscreenMode && flexibleSection !== 'preview' ? `${previewWidth}px` : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: isFullscreenMode ? '100vw' : (isMobile ? '100%' : (flexibleSection === 'preview' ? '0' : '300px')),
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
                        justifyContent: 'space-between',
                        cursor: 'grab',
                        background: theme.colors.surface
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button
                          onClick={() => setShowPreview(false)}
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
                          title="收起预览"
                        >
                          <PanelRightClose size={14} />
                        </button>
                        <GripVertical size={14} style={{ opacity: 0.5 }} />
                        {editorMode === 'markdown' ? '幻灯片预览' : 'HTML 实时预览'}
                      </div>
                    </div>
                  )}
                  <div ref={slideContainerRef} style={{ 
                    flex: previewHeight > 0 ? 'none' : 1,
                    height: previewHeight > 0 ? `${previewHeight}px` : '100%',
                    position: 'relative', 
                    background: theme.colors.background,
                    overflow: editorMode === 'html' ? 'auto' : 'hidden'
                  }}>
                    {editorMode === 'markdown' ? (
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
                    ) : (
                      <div ref={previewRef} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                        <iframe
                          ref={iframeRef}
                          title="HTML Preview"
                          sandbox="allow-popups allow-forms allow-scripts allow-same-origin"
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: 'block',
                            background: theme.colors.background
                          }}
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <style>
                                  body {
                                    margin: 0;
                                    padding: 40px;
                                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                                    color: ${theme.colors.text};
                                    background-color: ${appSettings.htmlPreviewBackground || theme.colors.background};
                                    line-height: 1.6;
                                    font-size: 16px;
                                    word-break: break-word;
                                    transition: background-color 0.3s, color 0.3s;
                                  }
                                  h1, h2, h3 {
                                    margin-top: 1.5em;
                                    margin-bottom: 0.5em;
                                    color: ${theme.primaryColor};
                                    font-weight: 700;
                                  }
                                  h1 { font-size: 2.2em; border-bottom: 2px solid ${theme.colors.border}; padding-bottom: 0.3em; }
                                  h2 { font-size: 1.8em; }
                                  p { margin-bottom: 1.2em; }
                                  ul, ol { margin-bottom: 1.2em; padding-left: 2em; }
                                  li { margin-bottom: 0.5em; }
                                  img { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                                  code { background: ${theme.colors.border}; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; }
                                  
                                  /* 确保文字在高亮主题下清晰可见 */
                                  .contrast-text {
                                    color: ${theme.theme === 'dark' ? '#fff' : '#000'} !important;
                                  }
                                </style>
                              </head>
                              <body>
                                ${content}
                              </body>
                            </html>
                          `}
                        />
                      </div>
                    )}

                    {/* Vertical Resize Handle for Preview (Bottom) */}
                    {!isMobile && !isFullscreenMode && (
                      <div
                        onMouseDown={() => setIsResizingPreviewHeight(true)}
                        onDoubleClick={() => setPreviewHeight(0)}
                        style={{
                          height: '6px',
                          width: '100%',
                          cursor: 'row-resize',
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          zIndex: 30,
                          background: isResizingPreviewHeight ? theme.primaryColor : 'transparent',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                        onMouseLeave={(e) => !isResizingPreviewHeight && (e.currentTarget.style.background = 'transparent')}
                        title="双击恢复默认高度"
                      />
                    )}
                  </div>
                  {!isMobile && index < layoutOrder.length - 1 && (
                    <div
                      onMouseDown={() => {
                        // 如果预览不是自适应板块，则调整预览宽度
                        if (flexibleSection !== 'preview') {
                          setIsResizingPreview(true);
                        } else if (layoutOrder[index + 1] === 'ai') {
                          // 如果预览是自适应的，且下一个是 AI，则调整 AI 宽度
                          setIsResizingAI(true);
                        }
                      }}
                      style={{
                        width: '4px',
                        height: '100%',
                        cursor: 'col-resize',
                        position: 'absolute',
                        right: '-2px',
                        top: 0,
                        zIndex: 20,
                        background: isResizingPreview || isResizingAI ? theme.primaryColor : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                      onMouseLeave={(e) => !isResizingPreview && !isResizingAI && (e.currentTarget.style.background = 'transparent')}
                    />
                  )}
                </div>
              </React.Fragment>
            );
          }

          if (section === 'ai') {
            if (isMobile) return null;
            if (!showAISidebar) {
              return (
                <div 
                  key="ai-collapsed"
                  onClick={() => setShowAISidebar(true)}
                  style={{
                    width: '30px',
                    height: '100%',
                    background: theme.colors.surface,
                    borderLeft: `1px solid ${theme.colors.border}`,
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
                  title="展开 AI 助手"
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
                    AI 助手
                  </div>
                </div>
              );
            }
            return (
              <div
                key="ai"
                id="ai-container"
                onDragOver={(e) => handleDragOver(e, 'ai')}
                style={{
                  width: `${aiWidth}px`,
                  minWidth: '250px',
                  height: aiHeight > 0 ? `${aiHeight}px` : '100%',
                  borderLeft: `1px solid ${theme.colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  background: theme.colors.surface,
                  position: 'relative',
                  opacity: draggingSection === 'ai' ? 0.5 : 1,
                  flex: aiHeight > 0 ? 'none' : (flexibleSection === 'ai' ? 1 : 'none')
                }}
              >
                <div
                  draggable
                  onDragStart={() => handleDragStart('ai')}
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
                    cursor: 'grab'
                  }}
                >
                  <button
                    onClick={() => setShowAISidebar(false)}
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
                    title="收起 AI 助手"
                  >
                    <PanelRightClose size={14} />
                  </button>
                  <GripVertical size={14} style={{ opacity: 0.5 }} />
                  AI 助手
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <AIAssistant
                    isSidebar={true}
                    editorContent={content}
                    onContentUpdate={(newContent) => setContent(newContent)}
                  />
                </div>

                {/* Vertical Resize Handle for AI (Bottom) */}
                {!isMobile && (
                  <div
                    onMouseDown={() => setIsResizingAIHeight(true)}
                    onDoubleClick={() => setAIHeight(0)}
                    style={{
                      height: '6px',
                      width: '100%',
                      cursor: 'row-resize',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      zIndex: 30,
                      background: isResizingAIHeight ? theme.primaryColor : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = theme.primaryColor}
                    onMouseLeave={(e) => !isResizingAIHeight && (e.currentTarget.style.background = 'transparent')}
                    title="双击恢复默认高度"
                  />
                )}
              </div>
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

      {/* Plugin Marketplace Component */}
      <PluginMarketplace 
        isOpen={showPluginMarketplace}
        onClose={() => setShowPluginMarketplace(false)}
      />

      {/* Template Marketplace Component */}
      <TemplateMarketplace
        isOpen={showTemplateMarketplace}
        onClose={() => setShowTemplateMarketplace(false)}
        onApplyTemplate={handleTemplateApply}
        theme={theme}
      />

      {/* Theme Marketplace Component */}
      <ThemeMarketplace
        isOpen={showThemeMarketplace}
        onClose={() => setShowThemeMarketplace(false)}
        onThemeChange={async (themeId) => {
          console.log(`Theme changed to: ${themeId}`);
          try {
            const themePackage = await themeMarketplaceService.getThemeDetails(themeId, theme.theme);
            if (themePackage && themePackage.theme) {
              setThemeConfig(themePackage.theme);
            }
          } catch (error) {
            console.error('Failed to apply theme from marketplace:', error);
          }
        }}
      />

      {/* Selection AI Assistant */}
      {selectionInfo && (
        <SelectionAIAssistant
          selection={selectionInfo.text}
          position={selectionInfo.position}
          onClose={() => setSelectionInfo(null)}
          onApply={handleSelectionApply}
          theme={theme}
        />
      )}

      {renderInputModal()}
      
      {/* Music Player */}
      <MusicPlayer />
    </div>
  );
};
