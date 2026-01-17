import React, { useState, useEffect } from 'react';
import { themeMarketplaceService } from '../services/themeMarketplace';
import { ThemeMetadata } from '../types/themePackage';

interface ThemeMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (themeId: string) => void;
}

export const ThemeMarketplace: React.FC<ThemeMarketplaceProps> = ({ 
  isOpen, 
  onClose, 
  onThemeChange 
}) => {
  const [themes, setThemes] = useState<ThemeMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [installing, setInstalling] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'marketplace' | 'installed'>('marketplace');

  useEffect(() => {
    if (isOpen) {
      loadThemes();
    }
  }, [isOpen, activeTab]);

  const loadThemes = async () => {
    setLoading(true);
    try {
      if (activeTab === 'marketplace') {
        if (searchQuery.trim()) {
          const results = await themeMarketplaceService.searchThemes(searchQuery);
          setThemes(results);
        } else {
          const trending = await themeMarketplaceService.getTrendingThemes();
          setThemes(trending);
        }
      } else {
        // 显示已安装的主题
        const installed = themeMarketplaceService.getInstalledThemes();
        setThemes(installed);
      }
    } catch (error) {
      console.error('Failed to load themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInstall = async (theme: ThemeMetadata) => {
    setInstalling(theme.id);
    try {
      // 模拟安装过程
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 这里实际应该是安装主题的过程
      console.log(`Installing theme: ${theme.id}`);
      
      // 切换到已安装标签页
      setActiveTab('installed');
    } catch (error) {
      console.error('Failed to install theme:', error);
    } finally {
      setInstalling(null);
    }
  };

  const handleApply = (themeId: string) => {
    onThemeChange(themeId);
    onClose();
  };

  const filteredThemes = themes.filter(theme =>
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="theme-marketplace-modal">
      <div 
        className="theme-marketplace-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000
        }}
      />

      <div
        className="theme-marketplace-container"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '85vh',
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
            padding: '16px 24px',
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
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280'
            }}
          >
            ×
          </button>
        </div>

        <div className="theme-marketplace-tabs" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
          <button
            className={activeTab === 'marketplace' ? 'active-tab' : ''}
            onClick={() => setActiveTab('marketplace')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: activeTab === 'marketplace' ? '#f3f4f6' : 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'marketplace' ? 'bold' : 'normal'
            }}
          >
            主题市场
          </button>
          <button
            className={activeTab === 'installed' ? 'active-tab' : ''}
            onClick={() => setActiveTab('installed')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              backgroundColor: activeTab === 'installed' ? '#f3f4f6' : 'transparent',
              cursor: 'pointer',
              fontWeight: activeTab === 'installed' ? 'bold' : 'normal'
            }}
          >
            已安装
          </button>
        </div>

        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <input
            type="text"
            placeholder="搜索主题..."
            value={searchQuery}
            onChange={handleSearch}
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
          className="theme-marketplace-content"
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
                  borderTop: '3px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  display: 'inline-block'
                }}></div>
                <p style={{ marginTop: '10px' }}>加载主题中...</p>
              </div>
            </div>
          ) : filteredThemes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <p>未找到匹配的主题</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {filteredThemes.map((theme) => (
                <div
                  key={theme.id}
                  className="theme-card"
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: selectedTheme?.id === theme.id ? '#dbeafe' : 'white'
                  }}
                >
                  <div style={{ height: '140px', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {theme.previewImage ? (
                      <img 
                        src={theme.previewImage} 
                        alt={theme.name} 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                      />
                    ) : (
                      <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>🎨</div>
                        <div>{theme.name}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '12px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>{theme.name}</h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#6b7280', minHeight: '40px' }}>
                      {theme.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '12px' }}>
                      {theme.tags?.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: '#e5e7eb',
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {activeTab === 'marketplace' ? (
                        <button
                          onClick={() => handleInstall(theme)}
                          disabled={installing === theme.id}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            backgroundColor: installing === theme.id ? '#9ca3af' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: installing === theme.id ? 'not-allowed' : 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          {installing === theme.id ? '安装中...' : '安装'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(theme.id)}
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
                          应用
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
          className="theme-marketplace-footer"
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <button
            onClick={onClose}
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

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .active-tab {
            border-bottom: 2px solid #4f46e5;
          }
          .theme-card:hover {
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-color: #d1d5db;
          }
        `}
      </style>
    </div>
  );
};