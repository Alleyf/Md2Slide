import React, { useState, useEffect } from 'react';
import { pluginManager } from '../services/pluginManager';
import { BasePlugin } from '../services/plugins/BasePlugin';
import { Puzzle, Search, X, Info, CheckCircle, PlayCircle, StopCircle, User, Zap, Star, Download, Image as ImageIcon, Loader2, ArrowLeft, Upload } from 'lucide-react';
import { aiService } from '../services/ai';
import { useTheme } from '../context/ThemeContext';
import { downloadImage, processCoverImage } from '../utils/imageUtils';

interface PluginMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({ isOpen, onClose }) => {
  const { themeConfig: theme } = useTheme();
  const [availablePlugins, setAvailablePlugins] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPlugin, setSelectedPlugin] = useState<any | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [generatingCoverId, setGeneratingCoverId] = useState<string | null>(null);
  const [, setRefreshCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trending' | 'installed' | 'new'>('all');

  const handleGenerateCover = async (plugin: any) => {
    setGeneratingCoverId(plugin.id);
    try {
      const prompt = `为插件"${plugin.name}"生成一个现代感、科技感的图标或封面图。插件功能描述：${plugin.description}。要求：简洁、扁平化设计，适合作为软件插件封面。`;
      const response = await aiService.request({
        prompt,
        type: 'image'
      });
      
      // 提取图片URL
      const match = response.content.match(/!\[.*\]\((.*)\)/);
      if (match && match[1]) {
        // 下载图片并生成本地路径
        const timestamp = Date.now();
        const extension = 'png';
        const filename = `plugin-cover-${timestamp}.${extension}`;
        
        await downloadImage(match[1], filename);
        const localImagePath = `/image/${filename}`;
        
        setAvailablePlugins(prev => prev.map(p => 
          p.id === plugin.id ? { ...p, previewImage: localImagePath } : p
        ));
        // 如果当前正在查看详情，也更新详情中的图片
        if (selectedPlugin && selectedPlugin.id === plugin.id) {
          setSelectedPlugin((prev: any) => prev ? { ...prev, previewImage: localImagePath } : null);
        }
        
        alert(`封面已生成并下载！\n\n请将下载的图片移动到 public/image 目录下，\n然后刷新页面即可看到本地封面。`);
      }
    } catch (error) {
      console.error('Failed to generate cover:', error);
      alert('生成封面失败，请检查 AI 配置');
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleUploadCover = async (plugin: any, file: File) => {
    setGeneratingCoverId(plugin.id);
    try {
      // 处理上传的图片，自动裁切并保存
      const processedImagePath = await processCoverImage(file, 400, 300);
      
      setAvailablePlugins(prev => prev.map(p => 
        p.id === plugin.id ? { ...p, previewImage: processedImagePath } : p
      ));
      
      // 如果当前正在查看详情，也更新详情中的图片
      if (selectedPlugin && selectedPlugin.id === plugin.id) {
        setSelectedPlugin((prev: any) => prev ? { ...prev, previewImage: processedImagePath } : null);
      }
      
      alert(`封面上传成功！图片已自动裁切并保存到: ${processedImagePath}`);
    } catch (error) {
      console.error('Failed to upload cover:', error);
      alert('上传封面失败，请检查图片格式和大小');
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleCoverUpload = (plugin: any) => {
    // 创建一个隐藏的文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        handleUploadCover(plugin, file);
      }
    };
    input.click();
  };

  // 图标映射
  const iconMap: Record<string, React.ReactNode> = {
    'Zap': <Zap size={24} color="#f59e0b" />,
    'PlayCircle': <PlayCircle size={24} color="#f97316" />,
    'Download': <Download size={24} color="#10b981" />,
    'Collaboration': <Zap size={24} color="#8b5cf6" />
  };

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
      // 模拟从服务器获取可用插件，并合并本地已注册插件
      const mockPlugins = [
        {
          id: 'diagram-maker',
          name: '图表制作器',
          description: '创建流程图、架构图和其他图表',
          author: 'Md2Slide Team',
          version: '1.0.0',
          tags: ['diagram', 'visualization', 'flowchart'],
          previewImage: '/plugins/previews/diagram-maker.jpg',
          icon: iconMap['Zap'],
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
          icon: iconMap['Collaboration'],
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
          icon: iconMap['PlayCircle'],
          features: ['JS 实时运行', 'HTML 预览', '控制台输出重定向']
        },
        {
          id: 'download-plugin',
          name: '文件下载助手',
          description: '支持通过右键菜单下载单个文件或整个目录的压缩包',
          author: 'Md2Slide',
          version: '1.0.0',
          tags: ['utility', 'file-management', 'download'],
          previewImage: '/plugins/previews/download.jpg',
          icon: iconMap['Download'],
          features: ['单文件下载', '目录压缩下载', '右键菜单集成']
        }
      ];
      
      setAvailablePlugins(mockPlugins);
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
          backgroundColor: theme.colors.surface,
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
            borderBottom: `1px solid ${theme.colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: theme.colors.background
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Puzzle size={24} color={theme.primaryColor} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: theme.colors.text }}>插件市场</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.border}`}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="plugin-marketplace-search" style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="搜索插件、功能或标签..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '10px',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s',
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }}
              onFocus={(e) => {
                e.target.style.borderColor = theme.primaryColor;
                e.target.style.backgroundColor = theme.colors.surface;
                e.target.style.boxShadow = `0 0 0 3px ${theme.primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.colors.border;
                e.target.style.backgroundColor = theme.colors.background;
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
              borderRight: `1px solid ${theme.colors.border}`,
              padding: '20px 0',
              backgroundColor: theme.colors.background
            }}
          >
            <div style={{ padding: '0 24px 12px', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                onClick={() => setSelectedCategory(item.id as any)}
                style={{
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: item.id === selectedCategory ? theme.primaryColor : theme.colors.text,
                  backgroundColor: item.id === selectedCategory ? `${theme.primaryColor}10` : 'transparent',
                  cursor: 'pointer',
                  borderRight: item.id === selectedCategory ? `2px solid ${theme.primaryColor}` : 'none'
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
                      backgroundColor: theme.colors.background, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center'
                    }}>
                      {selectedPlugin.icon}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: theme.colors.text }}>
                        {selectedPlugin.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} /> {selectedPlugin.author}
                        </span>
                        <span style={{ fontSize: '13px', color: theme.colors.textSecondary }}>v{selectedPlugin.version}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetails}
                    style={{
                      background: theme.colors.background,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.border}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.background}
                  >
                    <ArrowLeft size={16} />
                    返回列表
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
                  <div style={{ flex: '1' }}>
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: theme.colors.background,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px',
                      border: `1px solid ${theme.colors.border}`,
                      overflow: 'hidden',
                      position: 'relative'
                    }}>
                      {selectedPlugin.previewImage && !selectedPlugin.previewImage.startsWith('http') ? (
                        <img 
                          src={selectedPlugin.previewImage} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement?.querySelector('.fallback-icon')?.removeAttribute('style');
                          }}
                        />
                      ) : null}
                      <div 
                        className="fallback-icon"
                        style={{ 
                          display: selectedPlugin.previewImage && !selectedPlugin.previewImage.startsWith('http') ? 'none' : 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {selectedPlugin.icon}
                        <span style={{ marginLeft: '10px', color: theme.colors.textSecondary }}>插件预览图</span>
                      </div>
                      
                      <button
                        onClick={() => handleGenerateCover(selectedPlugin)}
                        disabled={generatingCoverId === selectedPlugin.id}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '12px',
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          zIndex: 10
                        }}
                      >
                        {generatingCoverId === selectedPlugin.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ImageIcon size={16} />
                        )}
                        AI 重新生成封面
                      </button>
                      <button
                        onClick={() => handleCoverUpload(selectedPlugin)}
                        disabled={generatingCoverId === selectedPlugin.id}
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          right: '120px',
                          background: 'rgba(0,0,0,0.6)',
                          backdropFilter: 'blur(4px)',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          zIndex: 10
                        }}
                      >
                        <Upload size={16} />
                        上传封面
                      </button>
                    </div>
                    <p style={{ margin: '0 0 12px 0', fontSize: '16px', lineHeight: '1.6', color: theme.colors.text }}>
                      {selectedPlugin.description}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                      {selectedPlugin.tags?.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            padding: '4px 10px',
                            backgroundColor: theme.colors.background,
                            color: theme.colors.textSecondary,
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 500,
                            border: `1px solid ${theme.colors.border}`
                          }}
                        >
                          #{tag}
                        </span>
                      )) || []}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => isPluginEnabled(selectedPlugin.id) ? handleDisablePlugin(selectedPlugin.id) : handleEnablePlugin(selectedPlugin.id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: isPluginEnabled(selectedPlugin.id) ? '#fee2e2' : `${theme.primaryColor}10`,
                          color: isPluginEnabled(selectedPlugin.id) ? '#ef4444' : theme.primaryColor,
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
                    <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text }}>功能亮点</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedPlugin.features?.map((feature: string) => (
                        <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: theme.colors.background, borderRadius: '8px', border: `1px solid ${theme.colors.border}` }}>
                          <CheckCircle size={16} color="#10b981" />
                          <span style={{ fontSize: '14px', color: theme.colors.text }}>{feature}</span>
                        </div>
                      )) || []}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="plugin-list">
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text }}>加载中...</div>
                ) : selectedCategory === 'installed' ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text }}>
                    <p>已启用的插件功能暂未实现，请稍后再试</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {filteredPlugins.map(plugin => (
                      <div
                        key={plugin.id}
                        className="plugin-card"
                        style={{
                          border: `1px solid ${theme.colors.border}`,
                          borderRadius: '12px',
                          padding: '20px',
                          backgroundColor: theme.colors.surface,
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: theme.colors.background, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                          {plugin.previewImage && !plugin.previewImage.startsWith('http') ? (
                            <img 
                              src={plugin.previewImage} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement?.querySelector('.fallback-icon')?.removeAttribute('style');
                              }}
                            />
                          ) : null}
                          <div 
                            className="fallback-icon"
                            style={{ 
                              display: plugin.previewImage && !plugin.previewImage.startsWith('http') ? 'none' : 'flex',
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}
                          >
                            {plugin.icon}
                          </div>
                        </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: theme.colors.text }}>{plugin.name}</h4>
                            <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>by {plugin.author}</span>
                          </div>
                        </div>
                        <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: theme.colors.textSecondary, flex: 1 }}>
                          {plugin.description}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                          <button
                            onClick={() => handleViewDetails(plugin)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: theme.colors.background,
                              color: theme.colors.text,
                              border: `1px solid ${theme.colors.border}`,
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
                              backgroundColor: isPluginEnabled(plugin.id) ? '#fee2e2' : `${theme.primaryColor}10`,
                              color: isPluginEnabled(plugin.id) ? '#ef4444' : theme.primaryColor,
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
