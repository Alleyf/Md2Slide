import React, { useState } from 'react';
import { ThemeConfig } from '../types/theme';
import { darkTheme } from '../styles/theme';

interface HelpModalProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  helpTab: 'usage' | 'shortcuts' | 'about' | 'donate';
  setHelpTab: (tab: 'usage' | 'shortcuts' | 'about' | 'donate') => void;
  theme: ThemeConfig;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  showHelp,
  setShowHelp,
  helpTab,
  setHelpTab,
  theme
}) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  if (!showHelp && !previewImage) return null;

  return (
    <>
      {/* Main Help Modal */}
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
          boxShadow: theme.theme === 'dark' ? '0 20px 50px rgba(0,0,0,0.6)' : '0 20px 40px rgba(15,23,42,0.18)',
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
                <div style={{ fontWeight: 600, color: theme.colors.text, marginBottom: '6px', fontSize: '14px' }}>自动动画 (Auto-Animation)</div>
                <ul style={{ paddingLeft: '18px', margin: 0 }}>
                  <li>在元素上添加 <code>&lt;!-- auto-animate --&gt;</code> 注释以启用自动动画。</li>
                  <li>使用 <code>&lt;!-- data-id: unique-id --&gt;</code> 为元素指定唯一ID，实现跨幻灯片元素匹配。</li>
                  <li>支持参数：<code>type=move|scale|fade|transform</code>、<code>duration=600</code>、<code>easing=ease-in-out</code>。</li>
                  <li>示例：<code>&lt;!-- auto-animate: type=move, duration=800, easing=ease-out --&gt;</code></li>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>复制当前行</span> <code style={{ color: theme.primaryColor }}>Ctrl + D</code></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>删除当前行</span> <code style={{ color: theme.primaryColor }}>Ctrl+Shift+D</code></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>向上移动行</span> <code style={{ color: theme.primaryColor }}>Alt + ↑</code></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>向下移动行</span> <code style={{ color: theme.primaryColor }}>Alt + ↓</code></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>撤销操作</span> <code style={{ color: theme.primaryColor }}>Ctrl + Z</code></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontStyle: 'italic', fontSize: '11px', opacity: 0.8 }}><span>💡 提示</span> <span>快捷键可在设置中自定义</span></div>
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
          ) : helpTab === 'about' ? (
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

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', alignItems: 'stretch' }}>
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
                <div style={{ padding: '16px', borderRadius: '12px', background: theme.theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px dashed ${theme.colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontWeight: 700, color: theme.colors.text }}>☕ 打赏作者</div>
                  <div style={{ fontSize: '12px', color: theme.colors.textSecondary, textAlign: 'center' }}>
                    如果这个工具对你有帮助，欢迎扫码请作者喝杯咖啡～
                  </div>
                  <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.theme === 'dark' ? '#050816' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                      <img
                        src="/donate-qr.png"
                        alt="打赏作者二维码"
                        onClick={() => setPreviewImage('/donate-qr.png')}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'zoom-in' }}
                      />
                      <div 
                        onClick={() => setPreviewImage('/donate-qr.png')}
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(0,0,0,0.5)',
                          color: 'white',
                          padding: '2px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0.8
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: theme.colors.textSecondary }}>感谢你的支持与鼓励</div>
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
                  <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                    <img
                      src="/donate-qr.png"
                      alt="赞赏二维码"
                      onClick={() => setPreviewImage('/donate-qr.png')}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        cursor: 'zoom-in'
                      }}
                    />
                    <div 
                      onClick={() => setPreviewImage('/donate-qr.png')}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        padding: '4px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0.8
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                        <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
                        <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                        <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
                      </svg>
                    </div>
                  </div>
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
          ) : null}
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
  
  {/* Image Preview Modal */}
  {previewImage && (
    <div
      onClick={() => setPreviewImage(null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        cursor: 'zoom-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '90vw',
          maxHeight: '90vh',
          padding: '20px',
          borderRadius: '12px',
          background: 'white',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
        }}
      >
        <img
          src={previewImage || ''}
          alt="预览图片"
          style={{
            maxWidth: '100%',
            maxHeight: '80vh',
            display: 'block',
            borderRadius: '8px'
          }}
        />
        <button
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'absolute',
            top: '-40px',
            right: '0',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          ×
        </button>
      </div>
    </div>
  )}
</>)
};
