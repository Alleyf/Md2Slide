import React, { useState, useEffect } from 'react';

interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
  previewImage?: string;
  installed: boolean;
}

export const PluginMarketplace: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟从服务器获取插件列表
    const fetchPlugins = async () => {
      setLoading(true);
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPlugins: Plugin[] = [
        {
          id: 'ai-assistant',
          name: 'AI 助手',
          version: '1.0.0',
          description: '智能内容生成与优化建议',
          author: 'Md2Slide Team',
          tags: ['ai', 'content', 'generation'],
          installed: true,
          previewImage: '/plugins/ai-preview.png'
        },
        {
          id: 'chart-generator',
          name: '图表生成器',
          version: '1.2.1',
          description: '从数据生成各种类型的图表',
          author: 'DataViz Inc.',
          tags: ['charts', 'data', 'visualization'],
          installed: false,
          previewImage: '/plugins/chart-preview.png'
        },
        {
          id: 'math-renderer',
          name: '高级数学渲染',
          version: '2.0.3',
          description: '支持更多LaTeX命令和符号',
          author: 'MathPro Ltd.',
          tags: ['math', 'latex', 'rendering'],
          installed: false,
          previewImage: '/plugins/math-preview.png'
        },
        {
          id: 'code-runner',
          name: '代码执行器',
          version: '1.5.0',
          description: '在幻灯片中直接执行代码片段',
          author: 'DevTools Co.',
          tags: ['code', 'execution', 'programming'],
          installed: true,
          previewImage: '/plugins/code-preview.png'
        },
        {
          id: 'animation-pack',
          name: '动画包',
          version: '1.1.2',
          description: '丰富的幻灯片过渡和元素动画',
          author: 'Motion Studio',
          tags: ['animation', 'transitions', 'effects'],
          installed: false,
          previewImage: '/plugins/anim-preview.png'
        },
        {
          id: 'export-enhancer',
          name: '导出增强',
          version: '1.3.4',
          description: '支持更多导出格式和自定义选项',
          author: 'Export Solutions',
          tags: ['export', 'pdf', 'pptx', 'docx'],
          installed: false,
          previewImage: '/plugins/export-preview.png'
        }
      ];
      
      setPlugins(mockPlugins);
      setLoading(false);
    };

    if (isOpen) {
      fetchPlugins();
    }
  }, [isOpen]);

  const filteredPlugins = plugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
    plugin.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = (pluginId: string) => {
    setPlugins(plugins.map(plugin => 
      plugin.id === pluginId ? { ...plugin, installed: true } : plugin
    ));
  };

  const handleUninstall = (pluginId: string) => {
    setPlugins(plugins.map(plugin => 
      plugin.id === pluginId ? { ...plugin, installed: false } : plugin
    ));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="plugin-marketplace-toggle"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: '#10b981',
          color: 'white',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title="插件市场"
      >
        🧩
      </button>

      {isOpen && (
        <div className="plugin-marketplace-modal">
          <div 
            className="plugin-marketplace-backdrop"
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            }}
          />

          <div
            className="plugin-marketplace-container"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              maxWidth: '1000px',
              maxHeight: '85vh',
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              className="plugin-marketplace-header"
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <h2 style={{ margin: 0 }}>插件市场</h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="搜索插件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div
              className="plugin-marketplace-content"
              style={{
                padding: '16px',
                overflowY: 'auto',
                flex: 1
              }}
            >
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <div className="spinner" style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '30px',
                      height: '30px',
                      border: '3px solid #f3f4f6',
                      borderTop: '3px solid #10b981',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      display: 'inline-block'
                    }}></div>
                    <p style={{ marginTop: '10px' }}>加载插件中...</p>
                  </div>
                </div>
              ) : filteredPlugins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  <p>未找到匹配的插件</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {filteredPlugins.map((plugin) => (
                    <div
                      key={plugin.id}
                      className="plugin-card"
                      style={{
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: 'white'
                      }}
                    >
                      <div style={{ height: '140px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {plugin.previewImage ? (
                          <img 
                            src={plugin.previewImage} 
                            alt={plugin.name} 
                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                          />
                        ) : (
                          <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧩</div>
                            <div>{plugin.name}</div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{plugin.name}</h3>
                            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>v{plugin.version} · {plugin.author}</p>
                          </div>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            backgroundColor: plugin.installed ? '#dcfce7' : '#e5e7eb',
                            color: plugin.installed ? '#166534' : '#374151'
                          }}>
                            {plugin.installed ? '已安装' : '未安装'}
                          </span>
                        </div>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280', minHeight: '40px' }}>
                          {plugin.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                          {plugin.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              style={{
                                backgroundColor: '#e5e7eb',
                                padding: '2px 6px',
                                borderRadius: '12px',
                                fontSize: '10px'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {plugin.installed ? (
                            <button
                              onClick={() => handleUninstall(plugin.id)}
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                backgroundColor: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              卸载
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInstall(plugin.id)}
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                backgroundColor: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              安装
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              className="plugin-marketplace-footer"
              style={{
                padding: '12px 24px',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '6px 16px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .plugin-card:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-color: #d1d5db;
          }
        `}
      </style>
    </>
  );
};