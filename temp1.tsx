import React, { useState, useEffect } from 'react';
import { themeMarketplaceService } from '../services/themeMarketplace';
import { ThemeMetadata, ThemePackage } from '../types/themePackage';
import { Layout, Search, X, Info, Download, Check, Palette, Star, TrendingUp, User, Image as ImageIcon, Loader2, Sparkles, Wand2, ArrowLeft, Upload } from 'lucide-react';
import { aiService } from '../services/ai';
import { useTheme } from '../context/ThemeContext';
import { downloadImage, processCoverImage } from '../utils/imageUtils';

interface ThemeMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange: (themeId: string) => void;
}

const ThemePreviewImage: React.FC<{ theme: ThemeMetadata; height?: string; coverUrl?: string; currentTheme?: any }> = ({ theme, height = '120px', coverUrl, currentTheme }) => {
  const [imageError, setImageError] = useState(false);

  if (coverUrl && !coverUrl.startsWith('http')) {
    return (
      <div style={{
        width: '100%',
        height: height,
        borderRadius: '8px',
        marginBottom: '12px',
        border: `1px solid ${currentTheme?.colors?.border || '#e5e7eb'}`,
        overflow: 'hidden',
        position: 'relative'
      }}>
        {imageError ? (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: currentTheme?.colors?.background || '#ffffff'
          }}>
            <Palette size={40} color={currentTheme?.colors?.textSecondary || '#64748b'} />
          </div>
        ) : (
          <img 
            src={coverUrl} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => setImageError(true)}
          />
        )}
      </div>
    );
  }

  // 模拟�?ID 获取配色方案
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
  const borderColor = currentTheme?.colors?.border || '#e5e7eb';

  return (
    <div style={{
      width: '100%',
      height: height,
      borderRadius: '8px',
      marginBottom: '12px',
      border: `1px solid ${borderColor}`,
      overflow: 'hidden',
      position: 'relative',
      background: colors.background
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
        {/* 背景 */}
        <rect width="200" height="120" fill={colors.background} />
        
        {/* 标题 */}
        <rect x="20" y="20" width="100" height="12" rx="2" fill={colors.primary} />
        
        {/* 内容�?*/}
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
  const { themeConfig: theme } = useTheme();
  const [themes, setThemes] = useState<ThemeMetadata[]>([]);
  const [trendingThemes, setTrendingThemes] = useState<ThemeMetadata[]>([]);
  const [installedThemes, setInstalledThemes] = useState<ThemeMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ThemePackage | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [generatingCoverId, setGeneratingCoverId] = useState<string | null>(null);
  const [themeCovers, setThemeCovers] = useState<Record<string, string>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'trending' | 'installed' | 'favorites'>('all');

  const handleAIGenerateTheme = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const prompt = `根据以下描述生成一个幻灯片主题配置。描述：${aiPrompt}�?
要求�?
1. 返回一�?JSON 对象，结构必须符�?ThemePackage 接口�?
   {
     "metadata": {
       "id": "自动生成唯一ID",
       "name": "主题名称",
       "version": "1.0.0",
       "description": "主题描述",
       "author": "AI Designer",
       "tags": ["标签1", "标签2"],
       "createdAt": "当前时间ISO格式",
       "updatedAt": "当前时间ISO格式"
     },
     "theme": {
       "colors": {
         "primary": "主色十六进制",
         "secondary": "辅助色十六进�?,
         "background": "背景色十六进�?,
         "text": "文字颜色十六进制",
         "accent": "强调色十六进�?,
         "border": "边框颜色十六进制",
         "surface": "卡片表面颜色十六进制"
       },
       "fonts": {
         "main": "主字体名�?,
         "heading": "标题字体名称"
       }
     },
     "files": {
       "css": "可选的 CSS 覆盖代码字符�?
     }
   }
2. 仅返�?JSON 对象本身，不要有任何其他文字。`;

      const response = await aiService.request({ prompt });
      const jsonStr = response.content.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) throw new Error('AI 返回格式错误');
      
      const generatedPackage: ThemePackage = JSON.parse(jsonStr);
      // 确保 ID 唯一且带�?ai 前缀
      generatedPackage.metadata.id = `ai-theme-${Date.now()}`;
      
      await themeMarketplaceService.addCustomTheme(generatedPackage);
      
      // 刷新所有相关列�?
      const allThemes = await themeMarketplaceService.getAllThemes();
      const trending = await themeMarketplaceService.getTrendingThemes();
      const installed = await themeMarketplaceService.getInstalledThemes();
      
      setThemes([...allThemes]);
      setTrendingThemes([...trending]);
      setInstalledThemes([...installed]);
      
      setAiPrompt('');
      alert('�?AI 主题生成并保存成功！已自动添加到“已安装”列表中�?);
    } catch (error) {
      console.error('AI theme generation failed:', error);
      alert('生成失败，请检�?AI 配置或稍后重�?);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleGenerateCover = async (themeMetadata: ThemeMetadata) => {
    setGeneratingCoverId(themeMetadata.id);
    try {
      const prompt = `为名�?${themeMetadata.name}"的演示文稿主题生成一张现代、优雅的预览封面。主题描述：${themeMetadata.description}。要求：设计感强，配色和谐，适合作为PPT/幻灯片的主题封面预览。`;
      const response = await aiService.request({
        prompt,
        type: 'image'
      });
      
      const match = response.content.match(/!\[.*\]\((.*)\)/);
      if (match && match[1]) {
        // 下载图片并生成本地路�?
        const timestamp = Date.now();
        const extension = 'png';
        const filename = `theme-cover-${timestamp}.${extension}`;
        
        await downloadImage(match[1], filename);
        const localImagePath = `/image/${filename}`;
        
        setThemeCovers(prev => ({ ...prev, [themeMetadata.id]: localImagePath }));
        
        // 同时更新主题元数据中的预览图�?
        const updatedTheme = await themeMarketplaceService.getThemeDetails(themeMetadata.id);
        if (updatedTheme) {
          updatedTheme.metadata.previewImage = localImagePath;
          await themeMarketplaceService.addCustomTheme(updatedTheme);
          
          // 刷新已安装的主题列表
          const installed = await themeMarketplaceService.getInstalledThemes();
          setInstalledThemes([...installed]);
        }
        
        alert(`封面已生成并下载！\n\n请将下载的图片移动到 public/image 目录下，\n然后刷新页面即可看到本地封面。`);
      }
    } catch (error) {
      console.error('Failed to generate cover:', error);
      alert('生成封面失败，请检�?AI 配置');
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleUploadCover = async (themeMetadata: ThemeMetadata, file: File) => {
    setGeneratingCoverId(themeMetadata.id);
    try {
      // 处理上传的图片，自动裁切并保�?
      const processedImagePath = await processCoverImage(file, 400, 300);
      
      setThemeCovers(prev => ({ ...prev, [themeMetadata.id]: processedImagePath }));
      
      // 同时更新主题元数据中的预览图�?
      const updatedTheme = await themeMarketplaceService.getThemeDetails(themeMetadata.id);
      if (updatedTheme) {
        updatedTheme.metadata.previewImage = processedImagePath;
        await themeMarketplaceService.addCustomTheme(updatedTheme);
        
        // 刷新已安装的主题列表
        const installed = await themeMarketplaceService.getInstalledThemes();
        setInstalledThemes([...installed]);
      }
      
      alert(`封面上传成功！图片已自动裁切并保存到: ${processedImagePath}`);
    } catch (error) {
      console.error('Failed to upload cover:', error);
      alert('上传封面失败，请检查图片格式和大小');
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleCoverUpload = (themeMetadata: ThemeMetadata) => {
    // 创建一个隐藏的文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        handleUploadCover(themeMetadata, file);
      }
    };
    input.click();
  };

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
      alert('安装失败，请稍后重试�?);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTheme = async (themeId: string) => {
    if (!isThemeInstalled(themeId)) {
      alert('请先安装该主题再应用�?);
      return;
    }
    setLoading(true);
    try {
      await themeMarketplaceService.applyTheme(themeId);
      onThemeChange(themeId);
      alert(`主题 "${themeId}" 应用成功！`);
    } catch (error) {
      console.error('Apply failed:', error);
      alert('应用失败，请稍后重试�?);
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
          className="theme-marketplace-header"
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
            <Layout size={24} color={theme.primaryColor} />
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: theme.colors.text }}>主题市场</h2>
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
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.border}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div className="theme-marketplace-search" style={{ padding: '16px 24px', borderBottom: `1px solid ${theme.colors.border}`, background: theme.colors.surface }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} color={theme.colors.textSecondary} style={{ position: 'absolute', left: '12px' }} />
            <input
              type="text"
              placeholder="搜索主题风格、名称或作�?.."
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

      {/* AI Generation Input */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: theme.theme === 'dark' ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.02)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${theme.primaryColor}, #60a5fa)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Sparkles size={18} />
        </div>
        <input 
          type="text"
          placeholder="描述您想要的主题风格（例如：复古极简、赛博朋克深�?..�?
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAIGenerateTheme()}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleAIGenerateTheme}
          disabled={isAiGenerating || !aiPrompt.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: theme.primaryColor,
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            opacity: (isAiGenerating || !aiPrompt.trim()) ? 0.6 : 1
          }}
        >
          {isAiGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
          AI 生成
        </button>
      </div>

      <div style={{ display: 'flex', flex: '1', overflow: 'hidden' }}>
          {/* 侧边�?*/}
          <div
            className="theme-marketplace-sidebar"
            style={{
              width: '200px',
              borderRight: `1px solid ${theme.colors.border}`,
              padding: '20px 0',
              backgroundColor: theme.colors.background
            }}
          >
            <div style={{ padding: '0 24px 12px', fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              分类浏览
            </div>
            {[
              { id: 'all', name: '全部主题', icon: <Layout size={16} /> },
              { id: 'trending', name: '热门推荐', icon: <TrendingUp size={16} /> },
              { id: 'installed', name: '已安�?, icon: <Check size={16} /> },
              { id: 'favorites', name: '我的收藏', icon: <Star size={16} /> }
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
                <section>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: theme.colors.text }}>
                    {searchQuery ? `搜索结果: "${searchQuery}"` : '所有主�?}
                  </h3>
                  {loading && themes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: theme.colors.text }}>加载�?..</div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                      {themes.map(t => (
                        <div
                          key={t.id}
                          className="theme-card"
                          style={{
                            border: `1px solid ${theme.colors.border}`,
                            borderRadius: '8px',
                            padding: '12px',
                            textAlign: 'center',
                            backgroundColor: theme.colors.surface
                          }}
                        >
                          <ThemePreviewImage theme={t} coverUrl={themeCovers[t.id]} currentTheme={theme} />
                          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: theme.colors.text }}>{t.name}</h4>
                          <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: theme.colors.textSecondary }}>
                            {t.description.substring(0, 50)}...
                          </p>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleViewDetails(t.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                border: `1px solid ${theme.colors.border}`,
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
                              onClick={() => isThemeInstalled(t.id) ? handleApplyTheme(t.id) : handleInstallTheme(t.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: isThemeInstalled(t.id) ? `${theme.primaryColor}20` : theme.primaryColor,
                                color: isThemeInstalled(t.id) ? theme.primaryColor : 'white',
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
                              {isThemeInstalled(t.id) ? <Check size={14} /> : <Download size={14} />}
                              {isThemeInstalled(t.id) ? '应用' : '安装'}
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
