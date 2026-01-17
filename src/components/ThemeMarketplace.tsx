import React, { useState, useEffect } from 'react';
import { themeMarketplaceService } from '../services/themeMarketplace';
import { ThemeMetadata, ThemePackage } from '../types/themePackage';

interface ThemeMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (themeId: string) => void;
}

export const ThemeMarketplace: React.FC<ThemeMarketplaceProps> = ({ isOpen, onClose, onThemeChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [themes, setThemes] = useState<ThemeMetadata[]>([]);
  const [installedThemes, setInstalledThemes] = useState<ThemeMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingThemes, setTrendingThemes] = useState<ThemeMetadata[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<ThemePackage | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const trending = await themeMarketplaceService.getTrendingThemes();
      const allThemes = await themeMarketplaceService.getAllThemes();
      const installed = await themeMarketplaceService.getInstalledThemes();
      
      setTrendingThemes(trending);
      setThemes(allThemes);
      setInstalledThemes(installed);
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      const allThemes = await themeMarketplaceService.getAllThemes();
      setThemes(allThemes);
    } else {
      const results = await themeMarketplaceService.searchThemes(query);
      setThemes(results);
    }
  };

  const handleInstallTheme = async (themeId: string) => {
    setLoading(true);
    try {
      // 使用GitHub作为模拟源
      await themeMarketplaceService.installTheme({
        type: 'github',
        identifier: `md2slide/theme-${themeId}`
      });
      
      const installed = await themeMarketplaceService.getInstalledThemes();
      setInstalledThemes(installed);
      alert(`主题 "${themeId}" 安装成功！`);
    } catch (error) {
      console.error('Failed to install theme:', error);
      alert('主题安装失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTheme = async (themeId: string) => {
    setLoading(true);
    try {
      await themeMarketplaceService.applyTheme(themeId);
      onThemeChange(themeId);
      alert(`主题 "${themeId}" 应用成功！`);
    } catch (error) {
      console.error('Failed to apply theme:', error);
      alert('主题应用失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (themeId: string) => {
    setLoading(true);
    try {
      const themeDetails = await themeMarketplaceService.getThemeDetails(themeId);
      if (themeDetails) {
        setSelectedTheme(themeDetails);
        setShowDetails(true);
      }
    } catch (error) {
      console.error('Failed to get theme details:', error);
      alert('获取主题详情失败');
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
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      ></div>

      <div
        className="theme-marketplace-modal"
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
          className="theme-marketplace-header"
          style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0 }}>主题市场</h2>
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

        <div className="theme-marketplace-search" style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="搜索主题..."
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
            className="theme-marketplace-content"
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            {/* 热门主题 */}
            <section style={{ marginBottom: '30px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>热门主题</h3>
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
                    {theme.previewImage && (
                      <img 
                        src={theme.previewImage} 
                        alt={theme.name}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '12px'
                        }}
                      />
                    )}
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{theme.name}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280' }}>
                      {theme.description.substring(0, 50)}...
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleViewDetails(theme.id)}
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
                        onClick={() => isThemeInstalled(theme.id) ? handleApplyTheme(theme.id) : handleInstallTheme(theme.id)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: isThemeInstalled(theme.id) ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {isThemeInstalled(theme.id) ? '应用' : '安装'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 所有主题 */}
            <section>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>所有主题</h3>
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
                    {theme.previewImage && (
                      <img 
                        src={theme.previewImage} 
                        alt={theme.name}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          marginBottom: '12px'
                        }}
                      />
                    )}
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{theme.name}</h4>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#6b7280' }}>
                      {theme.description.substring(0, 50)}...
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => handleViewDetails(theme.id)}
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
                        onClick={() => isThemeInstalled(theme.id) ? handleApplyTheme(theme.id) : handleInstallTheme(theme.id)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: isThemeInstalled(theme.id) ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {isThemeInstalled(theme.id) ? '应用' : '安装'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 主题详情视图 */}
        {showDetails && selectedTheme && (
          <div
            className="theme-details"
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{selectedTheme.metadata.name}</h3>
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
                {selectedTheme.metadata.previewImage && (
                  <img 
                    src={selectedTheme.metadata.previewImage} 
                    alt={selectedTheme.metadata.name}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}
                  />
                )}
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
                      padding: '10px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    应用主题
                  </button>
                  <button
                    onClick={() => handleInstallTheme(selectedTheme.metadata.id)}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
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
        )}
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