import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { BlockMath, InlineMath } from 'react-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from '../context/ThemeContext';
import { darkTheme } from '../styles/theme';
import { NavigationControls } from './NavigationControls';
import 'katex/dist/katex.min.css';

// 添加全局样式支持
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    .slide-content strong {
      font-weight: 700;
      color: #E2B026;
    }

    .slide-content em {
      font-style: italic;
      opacity: 0.9;
    }

    .slide-content del {
      text-decoration: line-through;
      opacity: 0.6;
    }

    .slide-content code {
      background: rgba(88, 196, 221, 0.15);
      padding: 0.1em 0.3em;
      border-radius: 4px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9em;
    }

    .slide-content a {
      color: #58C4DD;
      text-decoration: underline;
      text-decoration-color: rgba(88, 196, 221, 0.5);
    }

    .slide-content a:hover {
      color: #7AD8F0;
      text-decoration-color: rgba(88, 196, 221, 0.8);
    }

    .slide-content ul,
    .slide-content ol {
      margin: 0.4em 0;
      padding-left: 1.4em;
    }

    .slide-content ul ul,
    .slide-content ol ol,
    .slide-content ul ol,
    .slide-content ol ul {
      margin-top: 0.15em;
      margin-bottom: 0.15em;
    }

    .slide-content li {
      margin: 0.12em 0;
    }

    .slide-content ul li::marker,
    .slide-content ol li::marker {
      color: #E2B026;
      font-weight: 700;
    }

    .katex {
      font-size: 1em;
    }

    .katex-display {
      margin: 1em 0;
      overflow-x: auto;
      overflow-y: hidden;
    }

    ::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    ::-webkit-scrollbar-track {
      background: transparent;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(88, 196, 221, 0.3);
      border-radius: 2px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(88, 196, 221, 0.5);
    }

    .slide-title {
      text-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }

    .nav-controls {
      pointer-events: auto;
    }

    @media (max-width: 900px) {
      .nav-controls {
        bottom: 12px !important;
        right: 12px !important;
        gap: 8px !important;
        padding: 6px 10px !important;
      }

      .nav-controls button {
        padding: 4px 8px !important;
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// 幻灯片内容类型定义
export interface SlideContent {
  id: string;
  title?: string;
  subtitle?: string;
  elements: SlideElement[];
}

export interface SlideElement {
  id: string;
  type: 'title' | 'subtitle' | 'text' | 'bullets' | 'vector' | 'grid' | 'code' | 'quote' | 'image' | 'video' | 'icon' | 'html' | 'math' | 'markdown' | 'table' | 'audio';
  content: string | string[] | any;
  clickState: number;
  animation?: 'fade' | 'scale' | 'grow' | 'transform' | 'highlight' | 'slide-left' | 'slide-right' | 'slide-up' | 'pop';
  style?: React.CSSProperties;
  children?: SlideElement[];
  listStart?: number;
  listType?: 'ul' | 'ol';
  language?: string;
}

interface SlideTemplateProps {
  slides: SlideContent[];
  activeSlideIndex?: number;
  onSlideChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  exportMode?: boolean;
  onFullscreenToggle?: () => void;
}

export const SlideTemplate: React.FC<SlideTemplateProps> = ({
  slides,
  activeSlideIndex,
  onSlideChange,
  autoPlay = false,
  autoPlayInterval = 5000,
  exportMode = false,
  onFullscreenToggle,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [clickState, setClickState] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [localAutoPlayInterval, setLocalAutoPlayInterval] = useState(autoPlayInterval);
  const autoPlayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 同步外部传入的页码
  useEffect(() => {
    if (activeSlideIndex !== undefined && activeSlideIndex !== currentSlideIndex) {
      setCurrentSlideIndex(activeSlideIndex);
      setClickState(0);
    }
  }, [activeSlideIndex]);

  // 同步外部传入的播放间隔
  useEffect(() => {
    setLocalAutoPlayInterval(autoPlayInterval);
  }, [autoPlayInterval]);
  const { themeConfig: theme } = useTheme();

  // 当幻灯片内容改变时（例如切换文件），重置到第一页
  useEffect(() => {
    setCurrentSlideIndex(0);
    setClickState(0);
  }, [slides]);

  // 计算每个幻灯片的总点击次数
  // 自动播放逻辑
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayIntervalRef.current = setInterval(() => {
        handleNavigate('next');
      }, localAutoPlayInterval);
    } else {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    }

    return () => {
      if (autoPlayIntervalRef.current) {
        clearInterval(autoPlayIntervalRef.current);
      }
    };
  }, [isAutoPlaying, currentSlideIndex, clickState, slides.length, localAutoPlayInterval]);

  const calculateClicks = (slide: SlideContent): number => {
    if (!slide || !slide.elements || slide.elements.length === 0) {
      return 1;
    }
    let maxClick = 0;
    slide.elements.forEach(el => {
      if (el.clickState > maxClick) {
        maxClick = el.clickState;
      }
    });
    return maxClick + 1;
  };

  useEffect(() => {
    const newTotalClicks = calculateClicks(slides[currentSlideIndex]);
    setTotalClicks(newTotalClicks);
  }, [currentSlideIndex, slides]);

  // 自动播放逻辑
  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(() => {
        handleNavigate('next');
      }, autoPlayInterval);
      return () => clearInterval(timer);
    }
  }, [currentSlideIndex, clickState, autoPlay, autoPlayInterval, totalClicks]);

  useEffect(() => {
    const activeSlide = slideRefs.current[currentSlideIndex];
    if (activeSlide) {
      // 找到当前显示的最后一个元素
      const elements = activeSlide.querySelectorAll('.slide-element');
      let lastVisibleElement: Element | null = null;
      
      elements.forEach((el) => {
        const clickAttr = el.getAttribute('data-click-state');
        if (clickAttr !== null && parseInt(clickAttr) <= clickState) {
          lastVisibleElement = el;
        }
      });

      if (lastVisibleElement) {
        (lastVisibleElement as Element).scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
  }, [currentSlideIndex, clickState]);

  const handleNavigate = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      if (clickState < totalClicks - 1) {
        setClickState(prev => prev + 1);
      } else if (currentSlideIndex < slides.length - 1) {
        setCurrentSlideIndex(prev => prev + 1);
        setClickState(0);
      }
    } else {
      if (clickState > 0) {
        setClickState(prev => prev - 1);
      } else if (currentSlideIndex > 0) {
        const prevTotal = calculateClicks(slides[currentSlideIndex - 1]);
        setCurrentSlideIndex(prev => prev - 1);
        setClickState(prevTotal - 1);
      }
    }
    onSlideChange?.(currentSlideIndex);
  };

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 检查焦点是否在输入框或文本域中，如果是则不触发快捷键
      const activeElement = document.activeElement;
      const isInput = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.key === ' ' && !e.shiftKey) || e.key === 'ArrowRight' || e.key === 'Enter' || e.key === 'PageDown') {
        e.preventDefault();
        handleNavigate('next');
      } else if ((e.key === ' ' && e.shiftKey) || e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault();
        handleNavigate('prev');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const activeSlide = slideRefs.current[currentSlideIndex];
        if (activeSlide) {
          activeSlide.scrollBy({ top: -50, behavior: 'smooth' });
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const activeSlide = slideRefs.current[currentSlideIndex];
        if (activeSlide) {
          activeSlide.scrollBy({ top: 50, behavior: 'smooth' });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, clickState, totalClicks]);

  const getBilibiliEmbedUrl = (url: string) => {
    const bvMatch = url.match(/BV[a-zA-Z0-9]+/);
    if (bvMatch) {
      return `//player.bilibili.com/player.html?bvid=${bvMatch[0]}&page=1&high_quality=1`;
    }
    return null;
  };

  const renderElement = (el: SlideElement | undefined, _slideIndex: number) => {
    // 防御性检查
    if (!el || !el.type) {
      return null;
    }

    const isRevealed = exportMode || clickState >= (el.clickState || 0);

    // 根据元素类型定义不同的动画效果
    const getAnimationStyles = (type: string): React.CSSProperties => {
      if (exportMode) return { opacity: 1, transform: 'none' };
      
      const hidden: React.CSSProperties = { opacity: 0 };
      const visible: React.CSSProperties = { opacity: 1, transform: 'translate(0, 0) scale(1)' };

      switch (type) {
        case 'title':
          hidden.transform = 'scale(0.8) translateY(-20px)';
          break;
        case 'subtitle':
          hidden.transform = 'translateY(20px)';
          break;
        case 'bullets':
        case 'quote':
          hidden.transform = 'translateX(-30px)';
          break;
        case 'code':
          hidden.transform = 'translateX(30px)';
          break;
        case 'image':
        case 'video':
        case 'icon':
          hidden.transform = 'scale(0.5)';
          break;
        case 'math':
        case 'table':
        case 'markdown':
        case 'text':
          hidden.transform = 'translateY(30px)';
          break;
        default:
          hidden.transform = 'translateY(10px)';
      }

      return isRevealed ? visible : hidden;
    };

    const animStyle = getAnimationStyles(el.type);

    const baseStyle: React.CSSProperties = {
      ...animStyle,
      transition: exportMode ? 'none' : 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
      ...el.style,
    };

    switch (el.type) {
      case 'title':
        return (
          <h1
            key={el.id}
            className="slide-content slide-title slide-element"
            data-click-state={el.clickState}
            style={{
              fontSize: 'clamp(24px, 3.5vw, 42px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '10px',
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );

      case 'subtitle':
        return (
          <h2
            key={el.id}
            className="slide-content slide-element"
            data-click-state={el.clickState}
            style={{
              fontSize: 'clamp(18px, 2.5vw, 30px)',
              opacity: 0.8,
              marginTop: '5px',
              textAlign: 'center',
              marginBottom: '15px',
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );

      case 'text':
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              fontSize: 'clamp(16px, 2vw, 20px)',
              lineHeight: 1.8,
              marginBottom: '10px',
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );

      case 'bullets':
        // 处理字符串（按换行符分割）或数组格式的 bullets
        const bulletsContent = el.content as string | string[];
        const bullets = Array.isArray(bulletsContent)
          ? bulletsContent
          : bulletsContent.split('\n').filter(line => line.trim());
        
        const ListTag = el.listType === 'ol' ? 'ol' : 'ul';
        
        return (
          <ListTag
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            start={el.listStart}
            style={{
              listStyle: el.listType === 'ol' ? 'decimal' : 'none',
              padding: el.listType === 'ol' ? '0 0 0 1.5em' : 0,
              marginBottom: '15px',
              ...baseStyle,
            }}
          >
            {bullets.map((bullet, idx) => (
              <li
                key={`${el.id}-${idx}`}
                style={{
                  marginBottom: '12px',
                  padding: el.listType === 'ol' ? '8px 12px' : '12px 16px',
                  background: bullet.includes('type="checkbox"') ? 'transparent' : 'rgba(88, 196, 221, 0.08)',
                  borderRadius: '6px',
                  borderLeft: el.listType === 'ol' || bullet.includes('type="checkbox"') ? 'none' : `3px solid ${theme.primaryColor}`,
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  lineHeight: 1.6,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  display: 'flex',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ flex: 1 }}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeKatex]}
                    components={{
                      p: ({ children }) => <span style={{ margin: 0 }}>{children}</span>,
                    }}
                  >
                    {bullet}
                  </ReactMarkdown>
                </div>
              </li>
            ))}
          </ListTag>
        );

      case 'vector':
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              width: '200px',
              height: '200px',
              position: 'relative',
              borderLeft: '2px solid #666',
              borderBottom: '2px solid #666',
              margin: '20px auto',
              ...baseStyle,
            }}
          >
            {/* 向量 */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                background: theme.accentColor,
                width: isRevealed ? '120px' : '0',
                transform: 'rotate(-35deg)',
                transformOrigin: 'bottom left',
                transition: 'width 1s cubic-bezier(0.17, 0.84, 0.44, 1)',
                boxShadow: '0 0 15px rgba(226, 176, 38, 0.6)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%) rotate(45deg)',
                  width: '12px',
                  height: '12px',
                  border: '2px solid',
                  borderColor: `${theme.accentColor} ${theme.accentColor} transparent transparent`,
                }}
              />
            </div>
            {/* 坐标标签 */}
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: 0,
                background: theme.colors.codeBackground,
                padding: '8px 12px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                color: theme.primaryColor,
                opacity: isRevealed ? 1 : 0,
                transition: 'opacity 0.5s ease-in-out',
              }}
            >
              [ 2, 3 ]
            </div>
          </div>
        );

      case 'grid':
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              width: '200px',
              height: '200px',
              position: 'relative',
              margin: '20px auto',
              background: theme === darkTheme ? '#111' : '#f9fafb',
              border: `2px solid ${isRevealed ? theme.primaryColor : theme.colors.border}`,
              overflow: 'hidden',
              transition: 'transform 1s cubic-bezier(0.68, -0.55, 0.27, 1.55), border-color 1s ease-in-out',
              transform: isRevealed ? 'skewX(12deg) scale(1.1) rotate(12deg)' : 'none',
              ...baseStyle,
            }}
          >
            {/* 网格线 */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'repeat(4, 1fr)',
              opacity: 0.3,
            }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} style={{ border: `1px solid ${theme.colors.border}` }} />
              ))}
            </div>
            {/* 基向量 */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '2px',
                width: '40px',
                background: '#22c55e',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: '40px',
                width: '2px',
                background: '#ef4444',
              }}
            />
          </div>
        );

      case 'code':
        const codeLines = el.content as string;
        const language = el.language || 'text';
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              background: theme.colors.codeBackground,
              padding: '0',
              borderRadius: '12px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: 'clamp(12px, 1.4vw, 14px)',
              overflow: 'hidden',
              maxWidth: '100%',
              marginBottom: '15px',
              border: `1px solid ${theme.colors.border}`,
              boxShadow: theme.theme === 'dark' ? '0 10px 30px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.1)',
              ...baseStyle,
            }}
          >
            <div style={{
              background: theme.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              padding: '8px 16px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: theme.primaryColor,
                opacity: 0.9
              }}>
                {language}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f56' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#27c93f' }} />
              </div>
            </div>
            <div style={{ padding: '4px' }}>
              <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  background: 'transparent',
                  fontSize: 'inherit',
                  lineHeight: 1.6,
                }}
                codeTagProps={{
                  style: {
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                  }
                }}
              >
                {codeLines}
              </SyntaxHighlighter>
            </div>
          </div>
        );

      case 'quote':
        return (
          <blockquote
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              fontSize: 'clamp(18px, 2.2vw, 24px)',
              fontStyle: 'italic',
              opacity: 0.7,
              marginTop: '20px',
              marginBottom: '15px',
              textAlign: 'center',
              padding: '20px',
              borderLeft: `4px solid ${theme.accentColor}`,
              background: 'rgba(226, 176, 38, 0.05)',
              borderRadius: '0 8px 8px 0',
              maxWidth: '900px',
              margin: '20px auto 15px',
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );

      case 'table':
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              overflowX: 'auto',
              marginBottom: '20px',
              width: '100%',
              ...baseStyle,
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeKatex, rehypeRaw]}
              components={{
                table: ({ children }) => (
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 'clamp(14px, 1.6vw, 16px)',
                    margin: '10px 0',
                    background: theme.colors.surface,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.colors.border}`
                  }}>
                    {children}
                  </table>
                ),
                thead: ({ children }) => (
                  <thead style={{
                    background: theme.primaryColor,
                    color: '#fff',
                    textAlign: 'left'
                  }}>
                    {children}
                  </thead>
                ),
                th: ({ children }) => (
                  <th style={{
                    padding: '12px 15px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    fontWeight: 600
                  }}>
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td style={{
                    padding: '10px 15px',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textSecondary
                  }}>
                    {children}
                  </td>
                ),
                tr: ({ children }) => (
                  <tr style={{
                    borderBottom: `1px solid ${theme.colors.border}`,
                    transition: 'background 0.2s'
                  }}>
                    {children}
                  </tr>
                )
              }}
            >
              {el.content as string}
            </ReactMarkdown>
          </div>
        );

      case 'image':
        return (
          <div key={el.id} className="slide-element" data-click-state={el.clickState} style={{ ...baseStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img
              src={el.content as string}
              alt={el.id}
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        );

      case 'video':
        const bilibiliUrl = getBilibiliEmbedUrl(el.content as string);
        return (
          <div key={el.id} className="slide-element" data-click-state={el.clickState} style={{ ...baseStyle, display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
            {bilibiliUrl ? (
              <iframe
                src={`${bilibiliUrl}&autoplay=0`}
                scrolling="no"
                frameBorder="no"
                allowFullScreen={true}
                style={{
                  width: '100%',
                  aspectRatio: '16/9',
                  maxWidth: '800px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                  border: 'none'
                }}
              />
            ) : (
              <video
                src={el.content as string}
                controls
                autoPlay={false}
                style={{
                  maxWidth: '100%',
                  maxHeight: '500px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                }}
              />
            )}
          </div>
        );

      case 'audio':
        return (
          <div key={el.id} className="slide-element" data-click-state={el.clickState} style={{ ...baseStyle, display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <audio src={el.content as string} controls />
          </div>
        );

      case 'icon':
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              fontSize: '64px',
              textAlign: 'center',
              margin: '20px 0',
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );

      case 'html':
        return (
          <div
            key={el.id}
            className="slide-element"
            data-click-state={el.clickState}
            style={{
              ...baseStyle,
            }}
            dangerouslySetInnerHTML={{ __html: el.content as string }}
          />
        );

      case 'math':
        const mathContent = el.content as { latex: string; displayMode?: boolean };
        if (mathContent.displayMode) {
          return (
            <div key={el.id} className="slide-element" data-click-state={el.clickState} style={{ ...baseStyle, textAlign: 'center', margin: '20px 0', fontSize: 'clamp(16px, 2vw, 20px)' }}>
              <BlockMath math={mathContent.latex} />
            </div>
          );
        }
        return (
          <span key={el.id} className="slide-element" data-click-state={el.clickState} style={{ ...baseStyle, display: 'inline' }}>
            <InlineMath math={mathContent.latex} />
          </span>
        );

      case 'markdown':
        return (
          <div
            key={el.id}
            className="slide-content slide-element"
            data-click-state={el.clickState}
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              lineHeight: 1.8,
              marginBottom: '15px',
              ...baseStyle,
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeKatex]}
              components={{
                h1: ({ children }) => (
                  <h1 style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 700, marginBottom: '20px', marginTop: '10px' }}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 600, marginBottom: '16px', marginTop: '8px', color: theme.primaryColor }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: 'clamp(18px, 2.2vw, 24px)', fontWeight: 600, marginBottom: '14px', marginTop: '6px' }}>{children}</h3>
                ),
                p: ({ children }) => (
                  <p style={{ marginBottom: '12px', lineHeight: 1.7 }}>{children}</p>
                ),
                span: ({ className, children }) => {
                  if (className === 'math-inline') {
                    // 确保提取出纯文本公式
                    const content = Array.isArray(children) ? children.join('') : String(children);
                    return <InlineMath math={content} />;
                  }
                  return <span>{children}</span>;
                },
                ul: ({ children }) => (
                  <ul
                    style={{
                      paddingLeft: '1.4em',
                      margin: '0.4em 0',
                    }}
                  >
                    {children}
                  </ul>
                ),
                ol: ({ children, start }) => (
                  <ol
                    start={start}
                    style={{
                      paddingLeft: '1.4em',
                      margin: '0.4em 0',
                    }}
                  >
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li
                    style={{
                      margin: '0.12em 0',
                    }}
                  >
                    {children}
                  </li>
                ),
                code: ({ inline, className, children }) => {
                  if (inline) {
                    return (
                      <code
                        style={{
                          background: theme.theme === 'dark' ? 'rgba(88, 196, 221, 0.18)' : 'rgba(37, 99, 235, 0.08)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                          fontSize: '0.9em',
                          color: theme.theme === 'dark' ? '#58C4DD' : '#1D4ED8',
                          fontWeight: 500,
                        }}
                      >
                        {children}
                      </code>
                    );
                  }
                  return (
                    <code
                      className={className}
                      style={{
                        fontFamily: 'JetBrains Mono, Fira Code, Consolas, monospace',
                        fontSize: '0.9em',
                        color: theme.theme === 'dark' ? '#E6EDF7' : '#111827',
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => (
                  <pre
                    style={{
                      background: theme.colors.codeBackground,
                      padding: '16px',
                      borderRadius: '10px',
                      overflow: 'auto',
                      fontSize: 'clamp(12px, 1.4vw, 14px)',
                      border: '1px solid rgba(88, 196, 221, 0.4)',
                      boxShadow: '0 18px 45px rgba(0,0,0,0.6)',
                      margin: '12px 0',
                    }}
                  >
                    {children}
                  </pre>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt}
                    style={{
                      maxWidth: '100%',
                      borderRadius: '8px',
                      margin: '10px auto',
                      display: 'block',
                    }}
                  />
                ),
                blockquote: ({ children }) => (
                  <blockquote style={{
                    borderLeft: `4px solid ${theme.accentColor}`,
                    paddingLeft: '16px',
                    margin: '16px 0',
                    fontStyle: 'italic',
                    opacity: 0.8,
                    background: 'rgba(226, 176, 38, 0.05)',
                    padding: '12px 16px',
                    borderRadius: '0 6px 6px 0',
                  }}>{children}</blockquote>
                ),
                a: ({ children, href }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#58C4DD', textDecoration: 'underline', textDecorationColor: 'rgba(88, 196, 221, 0.5)' }}>{children}</a>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 700, color: '#E2B026' }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={{ fontStyle: 'italic' }}>{children}</em>
                ),
              }}
            >
              {el.content as string}
            </ReactMarkdown>
          </div>
        );

      default:
        return null;
    }
  };

  const renderSlide = (slide: SlideContent, index: number) => {
    const isActive = index === currentSlideIndex;

    // 防御性检查
    if (!slide || !slide.elements) {
      return null;
    }

    return (
      <div
        key={slide.id}
        ref={(el) => (slideRefs.current[index] = el)}
        className={exportMode ? "pdf-slide-page" : ""}
        style={{
          position: exportMode ? 'relative' : 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: exportMode ? '1080px' : '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: 'clamp(16px, 4vw, 40px)',
          paddingTop: 'clamp(12px, 3vw, 30px)',
          paddingBottom: 'clamp(60px, 8vw, 80px)',
          opacity: exportMode || isActive ? 1 : 0,
          pointerEvents: exportMode || isActive ? 'all' : 'none',
          transition: exportMode ? 'none' : 'opacity 0.8s ease-in-out',
          boxSizing: 'border-box',
          overflowY: exportMode ? 'hidden' : 'auto',
          overflowX: 'hidden',
          background: theme.colors.background,
          pageBreakAfter: 'always',
        }}
      >
        {slide.title && (
          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: '10px',
              color: theme.colors.text,
              width: '100%',
              maxWidth: '1100px',
            }}
            dangerouslySetInnerHTML={{ __html: slide.title }}
          />
        )}
        {slide.subtitle && (
          <h2
            style={{
              fontSize: 'clamp(20px, 2.5vw, 32px)',
              opacity: 0.8,
              textAlign: 'center',
              marginBottom: '30px',
              color: theme.primaryColor,
              width: '100%',
              maxWidth: '1100px',
            }}
            dangerouslySetInnerHTML={{ __html: slide.subtitle }}
          />
        )}
        <div
          style={{
            width: '100%',
            maxWidth: '1100px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
          }}
        >
          {slide.elements.map(el => renderElement(el, index))}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 'min(700px, 100%)',
        maxHeight: '90vh',
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.fontFamily,
        overflow: 'hidden',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* 所有幻灯片 */}
      {slides.filter(Boolean).map((slide, index) => renderSlide(slide, index))}

      {/* 导航控制 */}
      {!exportMode && (
        <NavigationControls
          currentSlideIndex={currentSlideIndex}
          clickState={clickState}
          totalClicks={totalClicks}
          slidesCount={slides.length}
          onNext={() => {
            setIsAutoPlaying(false); // 手动操作时停止自动播放
            handleNavigate('next');
          }}
          onPrev={() => {
            setIsAutoPlaying(false);
            handleNavigate('prev');
          }}
          onJump={(index) => {
            setIsAutoPlaying(false);
            setCurrentSlideIndex(index);
            setClickState(0);
            onSlideChange?.(index);
          }}
          onReplay={() => {
            setIsAutoPlaying(false);
            setCurrentSlideIndex(0);
            setClickState(0);
            onSlideChange?.(0);
          }}
          isAutoPlaying={isAutoPlaying}
          onAutoPlayToggle={() => setIsAutoPlaying(!isAutoPlaying)}
          autoPlayInterval={localAutoPlayInterval}
          onAutoPlayIntervalChange={(val) => setLocalAutoPlayInterval(val)}
          onFullscreenToggle={onFullscreenToggle}
        />
      )}

      {/* 提示文字 */}
      {!exportMode && currentSlideIndex === 0 && clickState === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            width: '100%',
            textAlign: 'center',
            opacity: 0.4,
            fontSize: 'clamp(12px, 1.5vw, 14px)',
            color: theme.colors.text,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          按空格键或方向键导航
        </div>
      )}

      {/* 装饰性背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 30%, ${theme.primaryColor}08 0%, transparent 40%),
                       radial-gradient(circle at 80% 70%, ${theme.accentColor}08 0%, transparent 40%)`,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  );
};
