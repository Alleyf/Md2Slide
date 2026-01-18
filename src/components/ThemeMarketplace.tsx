import React, { useState, useEffect } from 'react';
import { themeMarketplaceService } from '../services/themeMarketplace';
import { ThemeMetadata, ThemePackage } from '../types/themePackage';
import { Layout, Search, X, Info, Download, Check, Palette, Star, TrendingUp, User } from 'lucide-react';

interface ThemeMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (themeId: string) => void;
}

const ThemePreviewImage: React.FC<{ theme: ThemeMetadata; height?: string }> = ({ theme, height = '120px' }) => {
  // 模拟从 ID 获取配色方案
  const getColors = (id: string) => {
    switch(id) {
      case 'minimal': return { primary: '#2563eb', secondary: '#64748b', background: '#ffffff', text: '#1e293b' };
      case 'dark': return { primary: '#60a5fa', secondary: '#94a3b8', background: '#0f172a', text: '#f1f5f9' };
      case 'cyberpunk': return { primary: '#06b6d4', secondary: '#8b5cf6', background: '#000000', text: '#e2e8f0' };
      case 'academic': return { primary: '#1e40af', secondary: '#475569', background: '#f8fafc', text: '#0f172a' };
      case 'presentation': return { primary: '#3b82f6', secondary: '#6b7280', background: '#ffffff', text: '#111827' };
      case 'creative': return { primary: '#ec4899', secondary: '#8b5cf6', background: '#f9fafb', text: '#111827' };
      default: return { primary: '#3b82f6', secondary: '#6b7280', background: '#ffffff', text: '#111827' };
    }
  };

  const colors = getColors(theme.id);

  return (
    <div style={{
      width: '100%',
      height: height,
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      position: 'relative',
      background: colors.background
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        {/* 背景 */}
        <rect width="200" height="120" fill={colors.background} />
        
        {/* 标题 */}
        <rect x="20" y="20" width="100" height="12" rx="2" fill={colors.primary} />
        
        {/* 内容行 */}
        <rect x="20" y="45" width="160" height="4" rx="1" fill={colors.text} opacity="0.3" />
        <rect x="20" y="55" width="140" height="4" rx="1" fill={colors.text} opacity="0.3" />
        <rect x="20" y="65" width="150" height="4" rx="1" fill={colors.text} opacity="0.3" />
        
        {/* 底部装饰 */}
        <circle cx="170" cy="95" r="15" fill={colors.secondary} opacity="0.2" />
        <rect x="20" y="90" width="40" height="10" rx="2" fill={colors.secondary} opacity="0.4" />
        
        {/* 主题名称标签 */}
        <rect x="0" y="100" width="200" height="20" fill="rgba(0,0,0,0.05)" />
        <text x="100" y="114" textAnchor="middle" fill={colors.text} style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'sans-serif' }}>
          {theme.name}
        </text>
      </svg>
    </div>
  );
};

export const ThemeMarketplace: React.FC<ThemeMarketplaceProps> = ({ isOpen, onClose, onThemeChange }) => {
  const [themes, setThemes] = useState<ThemeMetadata[]>([]);
  const [trendingThemes, setTrendingThemes] = useState<ThemeMetadata[]>([]);
  const [installedThemes, setInstalledThemes] = useState<ThemeMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemePackage | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [available, trending, installed] = await Promise.all([
          themeMarketplaceService.searchThemes(''),
          themeMarketplaceService.getTrendingThemes(),
          themeMarketplaceService.getInstalledThemes()
        ]);
        setThemes(available);
        setTrendingThemes(trending);
        setInstalledThemes(installed);
      } catch (error) {
        console.error('Failed to fetch themes:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setLoading(true);
    try {
      const results = await themeMarketplaceService.searchThemes(query);
      setThemes(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInstallTheme = async (themeId: string) => {
    setLoading(true);
    try {
      await themeMarketplaceService.installTheme({
        type: 'github',
        identifier: `md2slide/theme-${themeId}`
      });
      
      const installed = await themeMarketplaceService.getInstalledThemes();
      setInstalledThemes([...installed]);
      alert(`主题 "${themeId}" 安装成功！`);
    } catch (error) {
      console.error('Installation failed:', error);
      alert('安装失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTheme = async (themeId: string) => {
    if (!isThemeInstalled(themeId)) {
      alert('请先安装该主题再应用！');
      return;
    }
    setLoading(true);
    try {
      await themeMarketplaceService.applyTheme(themeId);
      onThemeChange(themeId);
      alert(`主题 "${themeId}" 应用成功！`);
    } catch (error) {
      console.error('Apply failed:', error);
      alert('应用失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (themeId: string) => {
    setLoading(true);
    try {
      const theme = await themeMarketplaceService.getThemeDetails(themeId);
      setSelectedTheme(theme);
      setShowDetails(true);
    } catch (error) {
      console.error('Failed to fetch theme details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTheme(null);
  };

  const isThemeInstalled = (themeId: string) => {
    return installedThemes.some(t => t.id === themeId);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="theme-marketplace-backdrop"
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
        className="theme-marketplace-modal"
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
          className="theme-marketplace-header"
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
            <Layout size={24} color="#3b82f6" />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111827' }}>主题市场</h2>
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

        <div className="theme-marketplace-search" style={{ padding: '16px 24px', borderBottom: '1px solid #f3f4f6', background: 'white' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color="#9ca3af" style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="搜索主题风格、名称或作者..."
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
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = 'white';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
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
            className="theme-marketplace-sidebar"
            style={{
              width: '200px',
              borderRight: '1px solid #f3f4f6',
              padding: '20px 0',
              backgroundColor: '#f9fafb'
            }}
          >
            <div style={{ padding: '0 24px 12px', fontSize: '12px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              分类浏览
            </div>
            {[
              { id: 'all', name: '全部主题', icon: <Layout size={16} /> },
              { id: 'trending', name: '热门推荐', icon: <TrendingUp size={16} /> },
              { id: 'installed', name: '已安装', icon: <Check size={16} /> },
              { id: 'favorites', name: '我的收藏', icon: <Star size={16} /> }
            ].map(item => (
              <div
                key={item.id}
                style={{
                  padding: '10px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '14px',
                  color: item.id === 'all' ? '#3b82f6' : '#4b5563',
                  backgroundColor: item.id === 'all' ? '#eff6ff' : 'transparent',
                  cursor: 'pointer',
                  borderRight: item.id === 'all' ? '2px solid #3b82f6' : 'none'
                }}
              >
                {item.icon}
                {item.name}
              </div>
            ))}
          </div>

          {/* 主内容区域 */}
          <div className="theme-marketplace-main" style={{ flex: '1', overflowY: 'auto', padding: '24px' }}>
            {showDetails && selectedTheme ? (
              <div className="theme-details">
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
                      <Palette size={24} color="#3b82f6" />
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                        {selectedTheme.metadata.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={14} /> {selectedTheme.metadata.author}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>v{selectedTheme.metadata.version}</span>
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
                    <ThemePreviewImage theme={selectedTheme.metadata} height="200px" />
                    <p style={{ margin: '0 0 12px 0' }}>{selectedTheme.metadata.description}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {selectedTheme.metadata.tags?.map(tag => (
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
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>作者:</strong> {selectedTheme.metadata.author}</p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px' }}><strong>版本:</strong> {selectedTheme.metadata.version}</p>
                      <p style={{ margin: '0 0 0 0', fontSize: '14px' }}><strong>ID:</strong> {selectedTheme.metadata.id}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleApplyTheme(selectedTheme.metadata.id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: isThemeInstalled(selectedTheme.metadata.id) ? '#e0f2fe' : '#f3f4f6',
                          color: isThemeInstalled(selectedTheme.metadata.id) ? '#0284c7' : '#9ca3af',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: isThemeInstalled(selectedTheme.metadata.id) ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                        disabled={!isThemeInstalled(selectedTheme.metadata.id)}
                      >
                        <Check size={18} />
                        应用主题
                      </button>
                      <button
                        onClick={() => handleInstallTheme(selectedTheme.metadata.id)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '15px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        <Download size={18} />
                        安装主题
                      </button>
                    </div>
                  </div>
                  
                  <div style={{ flex: '1' }}>
                    <h4 style={{ margin: '0 0 12px 0' }}>主题预览</h4>
                    <div
                      style={{
                        padding: '20px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        backgroundColor: selectedTheme.theme.colors?.background || '#ffffff',
                        color: selectedTheme.theme.colors?.text || '#000000'
                      }}
                    >
                      <h1 style={{ color: selectedTheme.theme.colors?.primary || '#000000', margin: '0 0 10px 0' }}>标题示例</h1>
                      <h2 style={{ color: selectedTheme.theme.colors?.primary || '#000000', margin: '0 0 10px 0' }}>副标题示例</h2>
                      <p style={{ margin: '0 0 10px 0' }}>这是一个段落示例，展示了主题的颜色和字体设置。</p>
                      <ul style={{ margin: '0 0 10px 0', paddingLeft: '20px' }}>
                        <li>列表项 1</li>
                        <li>列表项 2</li>
                        <li>列表项 3</li>
                      </ul>
                      <div
                        style={{
                          padding: '10px',
                          backgroundColor: selectedTheme.theme.colors?.highlight || '#ffff00',
                          borderRadius: '4px',
                          marginTop: '10px'
                        }}
                      >
                        高亮区域示例
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="theme-list">
                {/* 热门主题 */}
                {!searchQuery && (
                  <section style={{ marginBottom: '40px' }}>
                    <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={20} color="#f59e0b" />
                      热门推荐
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {trendingThemes.map(theme => (
                        <div
                          key={theme.id}
                          className="theme-card"
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'center',
                            backgroundColor: '#fff'
                          }}
                        >
                          <ThemePreviewImage theme={theme} />
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{theme.name}</h4>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleViewDetails(theme.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f3f4f6',
                                color: '#4b5563',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Info size={14} />
                              详情
                            </button>
                            <button
                              onClick={() => isThemeInstalled(theme.id) ? handleApplyTheme(theme.id) : handleInstallTheme(theme.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: isThemeInstalled(theme.id) ? '#e0f2fe' : '#3b82f6',
                                color: isThemeInstalled(theme.id) ? '#0284c7' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {isThemeInstalled(theme.id) ? <Check size={14} /> : <Download size={14} />}
                              {isThemeInstalled(theme.id) ? '应用' : '安装'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* 所有主题 */}
                <section>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>
                    {searchQuery ? `搜索结果: "${searchQuery}"` : '所有主题'}
                  </h3>
                  {loading && themes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>加载中...</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {themes.map(theme => (
                        <div
                          key={theme.id}
                          className="theme-card"
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'center',
                            backgroundColor: '#fff'
                          }}
                        >
                          <ThemePreviewImage theme={theme} />
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{theme.name}</h4>
                          <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280' }}>
                            {theme.description.substring(0, 50)}...
                          </p>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleViewDetails(theme.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#f3f4f6',
                                color: '#4b5563',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              <Info size={14} />
                              详情
                            </button>
                            <button
                              onClick={() => isThemeInstalled(theme.id) ? handleApplyTheme(theme.id) : handleInstallTheme(theme.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: isThemeInstalled(theme.id) ? '#e0f2fe' : '#3b82f6',
                                color: isThemeInstalled(theme.id) ? '#0284c7' : 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 500,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                              }}
                            >
                              {isThemeInstalled(theme.id) ? <Check size={14} /> : <Download size={14} />}
                              {isThemeInstalled(theme.id) ? '应用' : '安装'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
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
          .theme-marketplace-modal {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          }
          .theme-card:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
            transition: all 0.2s ease;
          }
        `}
      </style>
    </>
  );
};
