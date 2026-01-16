import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { BlockMath, InlineMath } from 'react-katex';
import { useTheme } from '../context/ThemeContext';
import { darkTheme } from '../styles/theme';
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
  type: 'title' | 'subtitle' | 'text' | 'bullets' | 'vector' | 'grid' | 'code' | 'quote' | 'image' | 'video' | 'icon' | 'html' | 'math' | 'markdown';
  content: string | string[] | any;
  clickState: number;
  animation?: 'fade' | 'scale' | 'grow' | 'transform' | 'highlight';
  style?: React.CSSProperties;
  children?: SlideElement[];
}

interface SlideTemplateProps {
  slides: SlideContent[];
  onSlideChange?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export const SlideTemplate: React.FC<SlideTemplateProps> = ({
  slides,
  onSlideChange,
  autoPlay = false,
  autoPlayInterval = 5000,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [clickState, setClickState] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const { themeConfig: theme } = useTheme();

  // 计算每个幻灯片的总点击次数
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
      if (e.key === ' ' || e.key === 'ArrowRight') {
        e.preventDefault();
        handleNavigate('next');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNavigate('prev');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, clickState, totalClicks]);

  const renderElement = (el: SlideElement | undefined, slideIndex: number) => {
    // 防御性检查
    if (!el || !el.type) {
      return null;
    }

    const isRevealed = clickState >= (el.clickState || 0);

    const baseStyle: React.CSSProperties = {
      opacity: isRevealed ? 1 : 0,
      transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
      transform: isRevealed ? 'translateY(0)' : 'translateY(10px)',
      ...el.style,
    };

    switch (el.type) {
      case 'title':
        return (
          <h1
            key={el.id}
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
        return (
          <ul
            key={el.id}
            style={{
              listStyle: 'none',
              padding: 0,
              marginBottom: '15px',
              ...baseStyle,
            }}
          >
            {bullets.map((bullet, idx) => (
              <li
                key={`${el.id}-${idx}`}
                style={{
                  marginBottom: '12px',
                  padding: '12px 16px',
                  background: 'rgba(88, 196, 221, 0.08)',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${theme.primaryColor}`,
                  fontSize: 'clamp(15px, 1.8vw, 18px)',
                  lineHeight: 1.6,
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    p: ({ children }) => <span style={{ margin: 0 }}>{children}</span>,
                  }}
                >
                  {bullet}
                </ReactMarkdown>
              </li>
            ))}
          </ul>
        );

      case 'vector':
        return (
          <div
            key={el.id}
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
        return (
          <div
            key={el.id}
            style={{
              background: theme.colors.codeBackground,
              padding: '0',
              borderRadius: '12px',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: 'clamp(12px, 1.5vw, 15px)',
              color: theme.theme === 'dark' ? theme.colors.codeText : '#111827',
              overflow: 'auto',
              maxWidth: '100%',
              marginBottom: '15px',
              border: `2px solid ${theme.primaryColor}`,
              boxShadow: `0 0 20px rgba(58, 130, 246, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)`,
              ...baseStyle,
            }}
          >
            <div style={{
              background: `linear-gradient(90deg, ${theme.primaryColor}22 0%, ${theme.accentColor}22 100%)`,
              padding: '8px 16px',
              borderBottom: `1px solid ${theme.accentColor}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#58C4DD',
                opacity: 0.9
              }}>
                CODE
              </span>
            </div>
            <pre style={{
              margin: 0,
              padding: '16px',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              lineHeight: 1.6,
              color: theme.theme === 'dark' ? '#E2E8F0' : '#111827'
            }}>
              {codeLines}
            </pre>
          </div>
        );

      case 'quote':
        return (
          <blockquote
            key={el.id}
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

      case 'image':
        return (
          <div key={el.id} style={{ ...baseStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
        return (
          <div key={el.id} style={{ ...baseStyle, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <video
              src={el.content as string}
              controls
              style={{
                maxWidth: '100%',
                maxHeight: '500px',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              }}
            />
          </div>
        );

      case 'icon':
        return (
          <div
            key={el.id}
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
            <div key={el.id} style={{ ...baseStyle, textAlign: 'center', margin: '20px 0', fontSize: 'clamp(16px, 2vw, 20px)' }}>
              <BlockMath math={mathContent.latex} />
            </div>
          );
        }
        return (
          <span key={el.id} style={{ ...baseStyle, display: 'inline' }}>
            <InlineMath math={mathContent.latex} />
          </span>
        );

      case 'markdown':
        return (
          <div
            key={el.id}
            className="slide-content"
            style={{
              fontSize: 'clamp(15px, 1.8vw, 18px)',
              lineHeight: 1.8,
              marginBottom: '15px',
              ...baseStyle,
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeKatex]}
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
                ol: ({ children }) => (
                  <ol
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
                  <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '8px', margin: '10px 0' }} />
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
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '40px',
          paddingTop: '30px',
          paddingBottom: '80px',
          opacity: isActive ? 1 : 0,
          pointerEvents: isActive ? 'all' : 'none',
          transition: 'opacity 0.8s ease-in-out',
          boxSizing: 'border-box',
          overflowY: 'auto',
          overflowX: 'hidden',
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
        minHeight: '700px',
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
      <div
        className="nav-controls"
        style={{
          position: 'absolute',
          bottom: '25px',
          right: '25px',
          display: 'flex',
          gap: '15px',
          alignItems: 'center',
          zIndex: 100,
          background: theme === darkTheme ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.8)',
          padding: '8px 16px',
          borderRadius: '12px',
          border: theme === darkTheme ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
          backdropFilter: 'blur(15px)',
          transition: 'opacity 0.3s ease',
        }}
      >
        <button
          onClick={() => handleNavigate('prev')}
          disabled={currentSlideIndex === 0 && clickState === 0}
          style={{
            padding: '5px 12px',
            background: 'transparent',
            border: 'none',
            color: theme.primaryColor,
            cursor: (currentSlideIndex === 0 && clickState === 0) ? 'not-allowed' : 'pointer',
            opacity: (currentSlideIndex === 0 && clickState === 0) ? 0.2 : 1,
            fontSize: '20px',
            fontWeight: 800,
          }}
        >
          ‹
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ color: theme.colors.text, fontSize: '12px', fontWeight: 600 }}>
            {currentSlideIndex + 1} / {slides.length}
          </span>
          <div style={{
            width: '40px',
            height: '2px',
            background: theme === darkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            marginTop: '4px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${((currentSlideIndex + 1) / slides.length) * 100}%`,
              background: theme.primaryColor,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
        <button
          onClick={() => handleNavigate('next')}
          disabled={currentSlideIndex === slides.length - 1 && clickState === totalClicks - 1}
          style={{
            padding: '5px 12px',
            background: 'transparent',
            border: 'none',
            color: theme.primaryColor,
            cursor: (currentSlideIndex === slides.length - 1 && clickState === totalClicks - 1) ? 'not-allowed' : 'pointer',
            opacity: (currentSlideIndex === slides.length - 1 && clickState === totalClicks - 1) ? 0.2 : 1,
            fontSize: '20px',
            fontWeight: 800,
          }}
        >
          ›
        </button>
      </div>

      {/* 提示文字 */}
      {currentSlideIndex === 0 && clickState === 0 && (
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
