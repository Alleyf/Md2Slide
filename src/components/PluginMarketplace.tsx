import React, { useState, useEffect } from 'react';
import { pluginManager } from '../services/pluginManager';
import { BasePlugin } from '../services/plugins/BasePlugin';

interface PluginMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [plugins, setPlugins] = useState<BasePlugin[]>([]);
  const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enabledPlugins, setEnabledPlugins] = useState<string[]>([]);
  const [selectedPlugin, setSelectedPlugin] = useState<BasePlugin | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlugins();
    }
  }, [isOpen]);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      // 获取当前已启用的插件
      const enabled = pluginManager.getEnabledPlugins();
      setEnabledPlugins(enabled.map((p: BasePlugin) => p.manifest.id));
      
      // 获取所有可用插件
      const allPlugins = [
        {
          id: 'diagram-maker',
          name: '图表制作器',
          description: '创建流程图、架构图和其他图表',
          author: 'Md2Slide Team',
          version: '1.0.0',
          tags: ['diagram', 'visualization', 'flowchart'],
          previewImage: '/plugins/previews/diagram-maker.jpg',
          icon: '📊',
          features: ['流程图', '架构图', 'UML图']
        },
        {
          id: 'math-renderer',
          name: '数学公式渲染器',
          description: '高级数学公式渲染和编辑工具',
          author: 'Math Team',
          version: '1.0.0',
          tags: ['math', 'latex', 'equation'],
          previewImage: '/plugins/previews/math-renderer.jpg',
          icon: '🔢',
          features: ['LaTeX支持', '实时预览', '公式库']
        },
        {
          id: 'code-highlighter',
          name: '代码高亮增强',
          description: '支持更多语言和主题的代码高亮',
          author: 'Dev Team',
          version: '1.0.0',
          tags: ['code', 'syntax', 'highlight'],
          previewImage: '/plugins/previews/code-highlighter.jpg',
          icon: '💻',
          features: ['150+语言', '多种主题', '行号显示']
        },
        {
          id: 'media-embedder',
          name: '媒体嵌入工具',
          description: '轻松嵌入视频、音频和其他媒体内容',
          author: 'Media Team',
          version: '1.0.0',
          tags: ['media', 'video', 'audio'],
          previewImage: '/plugins/previews/media-embedder.jpg',
          icon: '🎬',
          features: ['视频嵌入', '音频播放', '交互式图表']
        },
        {
          id: 'collaboration',
          name: '协作编辑',
          description: '多人实时协作编辑功能',
          author: 'Collab Team',
          version: '1.0.0',
          tags: ['collaboration', 'real-time', 'sharing'],
          previewImage: '/plugins/previews/collaboration.jpg',
          icon: '👥',
          features: ['实时同步', '评论系统', '权限管理']
        },
        {
          id: 'export-enhancer',
          name: '导出增强',
          description: '支持更多格式的导出选项',
          author: 'Export Team',
          version: '1.0.0',
          tags: ['export', 'format', 'pdf'],
          previewImage: '/plugins/previews/export-enhancer.jpg',
          icon: '📤',
          features: ['PDF导出', '视频导出', '多种格式']
        }
      ];
      
      setAvailablePlugins(allPlugins);
      
      // 创建插件实例
      const pluginInstances = allPlugins.map(plugin => {
        return {
          manifest: {
            id: plugin.id,
            name: plugin.name,
            description: plugin.description,
            version: plugin.version,
            author: plugin.author,
            tags: plugin.tags,
            previewImage: plugin.previewImage,
            icon: plugin.icon,
            features: plugin.features
          },
          initialize: () => {},
          destroy: () => {},
          execute: async (params: any) => {
            console.log(`Executing plugin ${plugin.id} with params:`, params);
            return { success: true, message: `Plugin ${plugin.name} executed successfully` };
          }
        };
      });
      
      setPlugins(pluginInstances as unknown as BasePlugin[]);
    } catch (error) {
      console.error('Failed to load plugins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEnablePlugin = async (pluginId: string) => {
    setLoading(true);
    try {
      // 检查插件是否已在插件管理器中注册
      const pluginExists = plugins.some(p => p.manifest.id === pluginId);
      
      if (pluginExists) {
        // 临时创建插件实例以便启用
        const pluginInstance = plugins.find(p => p.manifest.id === pluginId);
        if (pluginInstance) {
          // 尝试启用插件
          pluginManager.registerPlugin(pluginInstance);
          
          // 检查插件是否可以被启用
          const result = await pluginManager.enablePlugin(pluginId);
          if (result.success) {
            // 更新已启用插件列表
            setEnabledPlugins([...enabledPlugins, pluginId]);
            alert(`插件 "${pluginId}" 启用成功！`);
          } else {
            alert(`插件 "${pluginId}" 启用失败：${result.error}`);
          }
        }
      } else {
        alert(`插件 "${pluginId}" 不存在`);
      }
    } catch (error) {
      console.error('Failed to enable plugin:', error);
      alert('插件启用失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleDisablePlugin = async (pluginId: string) => {
    setLoading(true);
    try {
      const result = await pluginManager.disablePlugin(pluginId);
      if (result.success) {
        // 更新已启用插件列表
        setEnabledPlugins(enabledPlugins.filter(id => id !== pluginId));
        alert(`插件 "${pluginId}" 已禁用`);
      } else {
        alert(`插件 "${pluginId}" 禁用失败：${result.error}`);
      }
    } catch (error) {
      console.error('Failed to disable plugin:', error);
      alert('插件禁用失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (plugin: any) => {
    const pluginInstance = plugins.find(p => p.manifest.id === plugin.id);
    if (pluginInstance) {
      setSelectedPlugin(pluginInstance);
      setShowDetails(true);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedPlugin(null);
  };

  const isPluginEnabled = (pluginId: string) => {
    return enabledPlugins.includes(pluginId);
  };

  if (!isOpen) return null;

  // 根据搜索查询过滤插件
  const filteredPlugins = availablePlugins.filter(plugin =>
    plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plugin.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div
        className="plugin-marketplace-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      ></div>

      <div
        className="plugin-marketplace-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '80vh',
          backgroundColor: 'white',
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
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0 }}>插件市场</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div className="plugin-marketplace-search" style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="搜索插件..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div>加载中...</div>
            <div className="spinner" style={{ marginTop: '10px', textAlign: 'center' }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #f3f4f6',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
                marginLeft: '10px'
              }}></div>
            </div>
          </div>
        )}

        {!loading && !showDetails && (
          <div
            className="plugin-marketplace-content"
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            <section>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>可用插件</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {filteredPlugins.map(plugin => (
                  <div
                    key={plugin.id}
                    className="plugin-card"
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#fff',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{plugin.icon}</div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{plugin.name}</h4>
                    </div>
                    
                    {plugin.previewImage && (
                      <img 
                        src={plugin.previewImage} 
                        alt={plugin.name}
                        style={{
                          width: '100%',
                          height: '100px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '12px'
                        }}
                      />
                    )}
                    
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280', flex: 1 }}>
                      {plugin.description}
                    </p>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {plugin.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: '2px 6px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '10px',
                            fontSize: '10px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleViewDetails(plugin)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#f3f4f6',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        详情
                      </button>
                      <button
                        onClick={() => 
                          isPluginEnabled(plugin.id) 
                            ? handleDisablePlugin(plugin.id) 
                            : handleEnablePlugin(plugin.id)
                        }
                        style={{
                          padding: '6px 10px',
                          backgroundColor: isPluginEnabled(plugin.id) ? '#ef4444' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {isPluginEnabled(plugin.id) ? '禁用' : '启用'}
                      </button>
                    </div>
                    
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '12px', 
                      color: isPluginEnabled(plugin.id) ? '#10b981' : '#9ca3af',
                      textAlign: 'center'
                    }}>
                      {isPluginEnabled(plugin.id) ? '✓ 已启用' : '○ 未启用'}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 插件详情视图 */}
        {showDetails && selectedPlugin && (
          <div
            className="plugin-details"
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{selectedPlugin.manifest.icon}</span>
                {selectedPlugin.manifest.name}
              </h3>
              <button
                onClick={handleCloseDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '16px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ← 返回
              </button>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
              <div style={{ flex: '1' }}>
                {selectedPlugin.manifest.previewImage && (
                  <img 
                    src={selectedPlugin.manifest.previewImage} 
                    alt={selectedPlugin.manifest.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                  />
                )}
                <p style={{ margin: '0 0 12px 0' }}>{selectedPlugin.manifest.description}</p>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>功能特性</h4>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    {selectedPlugin.manifest.features?.map((feature: string, idx: number) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{feature}</li>
                    ))}
                  </ul>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>作者:</strong> {selectedPlugin.manifest.author}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>版本:</strong> {selectedPlugin.manifest.version}</p>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>ID:</strong> {selectedPlugin.manifest.id}</p>
                  
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>标签:</strong></p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {selectedPlugin.manifest.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => 
                      isPluginEnabled(selectedPlugin.manifest.id) 
                        ? handleDisablePlugin(selectedPlugin.manifest.id) 
                        : handleEnablePlugin(selectedPlugin.manifest.id)
                    }
                    style={{
                      padding: '10px 16px',
                      backgroundColor: isPluginEnabled(selectedPlugin.manifest.id) ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {isPluginEnabled(selectedPlugin.manifest.id) ? '禁用插件' : '启用插件'}
                  </button>
                </div>
              </div>
              
              <div style={{ flex: '1' }}>
                <h4 style={{ margin: '0 0 12px 0' }}>插件预览</h4>
                <div
                  style={{
                    padding: '20px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    backgroundColor: '#f9fafb',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                      {selectedPlugin.manifest.icon}
                    </div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>{selectedPlugin.manifest.name}</h3>
                    <p style={{ color: '#6b7280', marginBottom: '15px' }}>
                      {selectedPlugin.manifest.description}
                    </p>
                    <div style={{ 
                      padding: '10px', 
                      backgroundColor: '#d5f3ff', 
                      borderRadius: '6px', 
                      border: '1px dashed #7dd3fc',
                      display: 'inline-block'
                    }}>
                      插件功能演示区域
                    </div>
                  </div>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <h4 style={{ margin: '0 0 12px 0' }}>使用说明</h4>
                  <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>启用插件：</strong>点击"启用插件"按钮激活此插件。
                    </p>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>使用插件：</strong>插件启用后，相关功能将在编辑器中可用。
                    </p>
                    <p style={{ margin: '0 0 10px 0' }}>
                      <strong>禁用插件：</strong>如需停用插件，点击"禁用插件"按钮。
                    </p>
                    <p style={{ margin: '0 0 0 0' }}>
                      <strong>注意事项：</strong>某些插件可能需要刷新页面才能完全生效。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .plugin-marketplace-modal {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .plugin-card:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            transition: all 0.2s ease;
          }
        `}
      </style>
    </>
  );
};