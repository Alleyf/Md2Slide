import React, { useState, useEffect } from 'react';
import { pluginManager } from '../services/pluginManager';
import { BasePlugin } from '../services/plugins/BasePlugin';
import { Puzzle, Search, X, Info, CheckCircle, PlayCircle, StopCircle, User, Zap, Star } from 'lucide-react';

interface PluginMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ isOpen, onClose }) => {
  const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [, setRefreshCount] = useState(0);

  useEffect(() => {
    // 订阅插件管理器状态变化
    const unsubscribe = pluginManager.subscribe(() => {
      setRefreshCount(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchPlugins = async () => {
      setLoading(true);
      // 模拟从服务器获取可用插件
      const allPlugins = [
        {
          id: 'diagram-maker',
          name: '图表制作器',
          description: '创建流程图、架构图和其他图表',
          author: 'Md2Slide Team',
          version: '1.0.0',
          tags: ['diagram', 'visualization', 'flowchart'],
          previewImage: '/plugins/previews/diagram-maker.jpg',
          icon: <Zap size={24} color="#f59e0b" />,
          features: ['流程图', '架构图', 'UML图']
        },
        {
          id: 'collaboration',
          name: '协作编辑',
          description: '多人实时协作编辑功能',
          author: 'Collab Team',
          version: '1.0.0',
          tags: ['collaboration', 'real-time', 'sharing'],
          previewImage: '/plugins/previews/collaboration.jpg',
          icon: <Zap size={24} color="#8b5cf6" />,
          features: ['实时同步', '评论系统', '权限管理']
        },
        {
          id: 'code-runner-plugin',
          name: '代码实时运行',
          description: '允许在幻灯片预览中直接运行 JavaScript、HTML 代码块',
          author: 'Md2Slide Team',
          version: '1.0.0',
          tags: ['code', 'runner', 'interactive'],
          previewImage: '/plugins/previews/code-runner.jpg',
          icon: <PlayCircle size={24} color="#f97316" />,
          features: ['JS 实时运行', 'HTML 预览', '控制台输出重定向']
        }
      ];
      
      setAvailablePlugins(allPlugins);
      setLoading(false);
    };

    if (isOpen) {
      fetchPlugins();
    }
  }, [isOpen]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleEnablePlugin = async (pluginId: string) => {
    const result = await pluginManager.enablePlugin(pluginId);
    if (result.success) {
      alert(`插件 ${pluginId} 已启用！`);
    } else {
      alert(`启用失败: ${result.error}`);
    }
  };

  const handleDisablePlugin = async (pluginId: string) => {
    const result = await pluginManager.disablePlugin(pluginId);
    if (result.success) {
      alert(`插件 ${pluginId} 已禁用！`);
    } else {
      alert(`禁用失败: ${result.error}`);
    }
  };

  const isPluginEnabled = (pluginId: string) => {
    return pluginManager.isPluginEnabled(pluginId);
  };

  const handleViewDetails = (plugin: any) => {
    setSelectedPlugin(plugin);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedPlugin(null);
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
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 3000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />

      <div
        className="plugin-marketplace-modal"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '85vh',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 3001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        <div
          className="plugin-marketplace-header"
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f9fafb'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Puzzle size={24} color="#4f46e5" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>插件市场</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="plugin-marketplace-search" style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', background: 'white' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="搜索插件、功能或标签..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: '#f9fafb'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#4f46e5';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.backgroundColor = '#f9fafb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flex: '1', overflow: 'hidden' }}>
          {/* 侧边栏 */}
          <div
            className="plugin-marketplace-sidebar"
            style={{
              width: '200px',
              borderRight: '1px solid #f3f4f6',
              padding: '20px 0',
              backgroundColor: '#f9fafb'
            }}
          >
            <div style={{ padding: '0 24px 12px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              插件分类
            </div>
            {[
              { id: 'all', name: '全部插件', icon: <Puzzle size={16} /> },
              { id: 'trending', name: '热门插件', icon: <Star size={16} /> },
              { id: 'installed', name: '已启用', icon: <CheckCircle size={16} /> },
              { id: 'new', name: '最新上架', icon: <Zap size={16} /> }
            ].map(item => (
              <div
                key={item.id}
                style={{
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: item.id === 'all' ? '#4f46e5' : '#4b5563',
                  backgroundColor: item.id === 'all' ? '#f0f9ff' : 'transparent',
                  cursor: 'pointer',
                  borderRight: item.id === 'all' ? '2px solid #4f46e5' : 'none'
                }}
              >
                {item.icon}
                {item.name}
              </div>
            ))}
          </div>

          {/* 主内容区域 */}
          <div className="plugin-marketplace-main" style={{ flex: '1', overflowY: 'auto', padding: '24px' }}>
            {showDetails && selectedPlugin ? (
              <div className="plugin-details">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ 
                      width: '48px', 
                      height: '48px', 
                      borderRadius: '12px', 
                      backgroundColor: '#f3f4f6', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      {selectedPlugin.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                        {selectedPlugin.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} /> {selectedPlugin.author}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>v{selectedPlugin.version}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    style={{
                      background: '#f3f4f6',
                      border: 'none',
                      color: '#4b5563',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    <X size={16} />
                    返回列表
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: '#f3f4f6',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      border: '1px solid #e5e7eb'
                    }}>
                      {selectedPlugin.icon}
                      <span style={{ marginLeft: '10px', color: '#9ca3af' }}>插件预览图占位符</span>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '16px', lineHeight: '1.6', color: '#374151' }}>
                      {selectedPlugin.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {selectedPlugin.tags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: '#f3f4f6',
                            color: '#4b5563',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 500
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => isPluginEnabled(selectedPlugin.id) ? handleDisablePlugin(selectedPlugin.id) : handleEnablePlugin(selectedPlugin.id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: isPluginEnabled(selectedPlugin.id) ? '#fee2e2' : '#f0f9ff',
                          color: isPluginEnabled(selectedPlugin.id) ? '#ef4444' : '#0284c7',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {isPluginEnabled(selectedPlugin.id) ? <StopCircle size={18} /> : <PlayCircle size={18} />}
                        {isPluginEnabled(selectedPlugin.id) ? '禁用插件' : '启用插件'}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ flex: '1' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>功能亮点</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedPlugin.features.map((feature: string) => (
                        <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                          <CheckCircle size={16} color="#10b981" />
                          <span style={{ fontSize: '14px', color: '#4b5563' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="plugin-list">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {filteredPlugins.map(plugin => (
                      <div
                        key={plugin.id}
                        className="plugin-card"
                        style={{
                          border: '1px solid #f3f4f6',
                          borderRadius: '12px',
                          padding: '20px',
                          backgroundColor: '#fff',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {plugin.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{plugin.name}</h4>
                            <span style={{ fontSize: '12px', color: '#9ca3af' }}>by {plugin.author}</span>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280', flex: 1 }}>
                          {plugin.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                          <button
                            onClick={() => handleViewDetails(plugin)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#f3f4f6',
                              color: '#4b5563',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            <Info size={14} />
                            详情
                          </button>
                          <button
                            onClick={() => isPluginEnabled(plugin.id) ? handleDisablePlugin(plugin.id) : handleEnablePlugin(plugin.id)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: isPluginEnabled(plugin.id) ? '#fee2e2' : '#f0f9ff',
                              color: isPluginEnabled(plugin.id) ? '#ef4444' : '#0284c7',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 500,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px'
                            }}
                          >
                            {isPluginEnabled(plugin.id) ? <StopCircle size={14} /> : <PlayCircle size={14} />}
                            {isPluginEnabled(plugin.id) ? '禁用' : '启用'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            transform: translateY(-2px);
          }
        `}
      </style>
    </>
  );
};
