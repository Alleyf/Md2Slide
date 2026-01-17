import React from 'react';
import { ThemeConfig } from '../types/theme';
import { darkTheme } from '../styles/theme';

interface HelpModalProps {
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
  helpTab: 'usage' | 'shortcuts' | 'about';
  setHelpTab: (tab: 'usage' | 'shortcuts' | 'about') => void;
  theme: ThemeConfig;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  showHelp,
  setShowHelp,
  helpTab,
  setHelpTab,
  theme
}) => {
  if (!showHelp) return null;

  return (
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
  );
};
