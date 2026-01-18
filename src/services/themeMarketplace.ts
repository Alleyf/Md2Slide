import { ThemePackage, ThemeMetadata, ThemeInstallSource, ThemeMarketplaceConfig, ThemeRepository } from '../types/themePackage';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';

/**
 * 主题市场服务类，负责管理和安装主题包
 */
export class ThemeMarketplaceService {
  private config: ThemeMarketplaceConfig;
  private installedThemes: Map<string, ThemePackage> = new Map();
  private repositories: Map<string, ThemeRepository> = new Map();

  constructor(config: ThemeMarketplaceConfig) {
    this.config = config;
    this.initRepositories();
    this.loadFromStorage();
  }

  /**
   * 从本地存储加载已安装的主题
   */
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = getStorageItem<Record<string, ThemePackage>>(storageKeys.INSTALLED_THEMES, {});
      Object.entries(data).forEach(([id, pkg]) => {
        this.installedThemes.set(id, pkg);
      });
    } catch (e) {
      console.error('Failed to load installed themes from storage:', e);
    }
  }

  /**
   * 保存已安装的主题到本地存储
   */
  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const data = Object.fromEntries(this.installedThemes);
      setStorageItem(storageKeys.INSTALLED_THEMES, data);
    } catch (e) {
      console.error('Failed to save installed themes to storage:', e);
    }
  }

  /**
   * 初始化预设仓库
   */
  private initRepositories(): void {
    this.config.repositories.forEach(repo => {
      this.repositories.set(repo.id, repo);
    });

    // 添加默认仓库
    if (!this.repositories.has('official')) {
      this.repositories.set('official', {
        id: 'official',
        name: '官方主题仓库',
        url: 'https://github.com/md2slide/themes',
        type: 'github',
        description: 'Md2Slide官方维护的主题包集合'
      });
    }
  }

  /**
   * 搜索主题
   */
  async searchThemes(query: string): Promise<ThemeMetadata[]> {
    // 模拟搜索功能
    console.log(`Searching themes for: ${query}`);

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 500));

    // 返回模拟结果
    return this.getMockThemes().filter(theme =>
      theme.name.toLowerCase().includes(query.toLowerCase()) ||
      theme.description.toLowerCase().includes(query.toLowerCase()) ||
      theme.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }

  /**
   * 获取热门主题列表
   */
  async getTrendingThemes(): Promise<ThemeMetadata[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.getMockThemes().slice(0, 6);
  }

  /**
   * 获取所有可用主题
   */
  async getAllThemes(): Promise<ThemeMetadata[]> {
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 300));

    return this.getMockThemes();
  }

  /**
   * 安装主题
   */
  async installTheme(source: ThemeInstallSource): Promise<ThemePackage> {
    console.log(`Installing theme from: ${source.type} - ${source.identifier}`);

    // 模拟下载和安装过程
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 根据源类型获取主题
    let themePackage: ThemePackage;
    switch (source.type) {
      case 'npm':
        themePackage = await this.installFromNpm(source.identifier);
        break;
      case 'github':
        themePackage = await this.installFromGithub(source.identifier);
        break;
      case 'url':
        themePackage = await this.installFromUrl(source.identifier);
        break;
      case 'local':
        themePackage = await this.installFromLocal(source.identifier);
        break;
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }

    // 保存到已安装主题列表
    this.installedThemes.set(themePackage.metadata.id, themePackage);
    this.saveToStorage();

    return themePackage;
  }

  /**
   * 卸载主题
   */
  async uninstallTheme(themeId: string): Promise<boolean> {
    if (this.installedThemes.has(themeId)) {
      this.installedThemes.delete(themeId);
      this.saveToStorage();
      return true;
    }
    return false;
  }

  /**
   * 获取已安装的主题
   */
  getInstalledThemes(): ThemeMetadata[] {
    return Array.from(this.installedThemes.values()).map(pkg => pkg.metadata);
  }

  /**
   * 应用主题
   */
  async applyTheme(themeId: string): Promise<void> {
    const themePackage = this.installedThemes.get(themeId);
    if (!themePackage) {
      // 如果主题未安装，尝试从模拟数据创建
      const mockTheme = this.createMockTheme(themeId, `主题 ${themeId} 的描述`);
      this.installedThemes.set(themeId, mockTheme);
      console.warn(`Theme not installed, using mock data: ${themeId}`);
    }

    // 重新获取主题包（可能刚创建了模拟数据）
    const finalThemePackage = this.installedThemes.get(themeId)!;

    // 应用主题到应用程序
    console.log(`Applying theme: ${themeId}`, finalThemePackage.theme);

    // 应用CSS样式（如果存在）
    if (finalThemePackage.files.css) {
      this.applyThemeStyles(finalThemePackage.files.css);
    }
    
    // 应用主题配置到DOM
    this.applyThemeConfiguration(finalThemePackage.theme);
  }

  /**
   * 从NPM安装主题
   */
  private async installFromNpm(packageName: string): Promise<ThemePackage> {
    // 模拟NPM包安装
    return this.createMockTheme(
      packageName.replace('@md2slide/theme-', ''),
      `从NPM安装的主题: ${packageName}`
    );
  }

  /**
   * 从GitHub安装主题
   */
  private async installFromGithub(repo: string): Promise<ThemePackage> {
    // 模拟GitHub仓库安装
    const id = repo.split('/').pop()?.replace('theme-', '') || 'github-theme';
    return this.createMockTheme(
      id,
      `从GitHub安装的主题: ${repo}`
    );
  }

  /**
   * 从URL安装主题
   */
  private async installFromUrl(url: string): Promise<ThemePackage> {
    // 模拟从URL安装
    return this.createMockTheme(
      'remote-theme',
      `从URL安装的主题: ${url}`
    );
  }

  /**
   * 从本地安装主题
   */
  private async installFromLocal(path: string): Promise<ThemePackage> {
    // 模拟从本地安装
    return this.createMockTheme(
      'local-theme',
      `从本地安装的主题: ${path}`
    );
  }

  /**
   * 应用主题样式
   */
  private applyThemeStyles(css: string): void {
    // 创建或更新主题样式标签
    let styleElement = document.getElementById('theme-override');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-override';
      document.head.appendChild(styleElement);
    }
    styleElement.textContent = css;
  }

  /**
   * 应用主题配置到DOM
   */
  private applyThemeConfiguration(themeConfig: any): void {
    // 获取文档根元素
    const root = document.documentElement;
    
    // 应用颜色配置
    if (themeConfig.colors) {
      Object.entries(themeConfig.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-color-${key}`, value);
        }
      });
    }
    
    // 应用字体配置
    if (themeConfig.fonts) {
      Object.entries(themeConfig.fonts).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-font-${key}`, value);
        }
      });
    }
    
    // 应用间距配置
    if (themeConfig.spacing) {
      Object.entries(themeConfig.spacing).forEach(([key, value]) => {
        if (typeof value === 'string') {
          root.style.setProperty(`--theme-spacing-${key}`, value);
        }
      });
    }
    
    // 应用其他配置
    root.setAttribute('data-theme', themeConfig.id || 'custom-theme');
  }

  /**
   * 创建模拟主题数据
   */
  private createMockTheme(id: string, description: string, mode: 'light' | 'dark' = 'light'): ThemePackage {
    const now = new Date().toISOString();

    // 基础颜色方案
    let colors: any = {
      primary: '#007acc',
      secondary: '#6c757d',
      background: mode === 'dark' ? '#0f172a' : '#ffffff',
      surface: mode === 'dark' ? '#1e293b' : '#f8fafc',
      text: mode === 'dark' ? '#f1f5f9' : '#333333',
      textSecondary: mode === 'dark' ? '#94a3b8' : '#64748b',
      border: mode === 'dark' ? '#334155' : '#e2e8f0',
      highlight: mode === 'dark' ? '#fde68a' : '#ffeb3b',
      codeBackground: mode === 'dark' ? '#0f172a' : '#f1f5f9',
      codeText: mode === 'dark' ? '#60a5fa' : '#1e293b'
    };

    // 根据主题ID设置特定配色，同时考虑模式
    switch(id) {
      case 'minimal':
        colors.primary = mode === 'dark' ? '#60a5fa' : '#2563eb';
        break;
      case 'cyberpunk':
        colors = {
          primary: '#06b6d4',
          secondary: '#8b5cf6',
          background: mode === 'dark' ? '#000000' : '#f0f9ff',
          surface: mode === 'dark' ? '#111111' : '#ffffff',
          text: mode === 'dark' ? '#e2e8f0' : '#083344',
          textSecondary: mode === 'dark' ? '#94a3b8' : '#0e7490',
          border: mode === 'dark' ? '#333333' : '#bae6fd',
          highlight: '#f472b6',
          codeBackground: mode === 'dark' ? '#1a1a1a' : '#ecfeff',
          codeText: '#06b6d4'
        };
        break;
      case 'academic':
        colors.primary = mode === 'dark' ? '#93c5fd' : '#1e40af';
        break;
      case 'creative':
        colors.primary = mode === 'dark' ? '#f472b6' : '#ec4899';
        break;
    }

    return {
      metadata: {
        id,
        name: `${id.charAt(0).toUpperCase() + id.slice(1)} 主题`,
        version: '1.0.0',
        description,
        author: 'Md2Slide Community',
        tags: ['演示', '幻灯片', '主题'],
        previewImage: `/themes/previews/${id}.jpg`,
        createdAt: now,
        updatedAt: now
      },
      theme: {
        id,
        theme: mode,
        primaryColor: colors.primary,
        secondaryColor: colors.secondary,
        accentColor: colors.highlight,
        fontFamily: 'Arial, sans-serif',
        fontSize: {
          title: 48,
          heading: 32,
          body: 18,
          math: 24
        },
        animation: {
          defaultDuration: 600,
          easing: 'ease-in-out'
        },
        colors,
        fonts: {
          heading: 'Arial, sans-serif',
          body: 'Georgia, serif',
          code: 'Consolas, monospace'
        },
        spacing: {
          small: '0.5rem',
          medium: '1rem',
          large: '2rem'
        }
      },
      files: {
        css: `.theme-${id}-${mode} {
          --primary-color: ${colors.primary};
          --secondary-color: ${colors.secondary};
          --bg-color: ${colors.background};
          --text-color: ${colors.text};
          --highlight-color: ${colors.highlight};
        }`,
        assets: [`/themes/assets/${id}/logo.svg`]
      }
    };
  }

  /**
   * 获取模拟主题列表
   */
  private getMockThemes(): ThemeMetadata[] {
    return [
      {
        id: 'minimal',
        name: '极简主题',
        version: '1.0.0',
        description: '干净、简洁的设计，专注于内容',
        author: 'Md2Slide Team',
        tags: ['minimal', 'clean', 'simple'],
        previewImage: '/themes/previews/minimal.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'cyberpunk',
        name: '赛博朋克主题',
        version: '1.0.0',
        description: '霓虹色彩和未来主义风格',
        author: 'Neon Designer',
        tags: ['cyberpunk', 'neon', 'futuristic'],
        previewImage: '/themes/previews/cyberpunk.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'academic',
        name: '学术主题',
        version: '1.0.0',
        description: '专为学术演示设计的专业主题',
        author: 'Academic Press',
        tags: ['academic', 'professional', 'formal'],
        previewImage: '/themes/previews/academic.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'presentation',
        name: '演示主题',
        version: '1.0.0',
        description: '经典演示风格，适合各类演讲',
        author: 'Presentation Pro',
        tags: ['presentation', 'classic', 'business'],
        previewImage: '/themes/previews/presentation.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'creative',
        name: '创意主题',
        version: '1.0.0',
        description: '富有创意和视觉冲击力的设计',
        author: 'Creative Studio',
        tags: ['creative', 'artistic', 'colorful'],
        previewImage: '/themes/previews/creative.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      },
      {
        id: 'dark',
        name: '深色主题',
        version: '1.0.0',
        description: '护眼深色模式，适合低光环境',
        author: 'Night Owl',
        tags: ['dark', 'night', 'low-light'],
        previewImage: '/themes/previews/dark.jpg',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      }
    ];
  }

  /**
   * 获取主题详情
   */
  async getThemeDetails(themeId: string, mode: 'light' | 'dark' = 'light'): Promise<ThemePackage | null> {
    // 检查已安装的主题
    const installed = this.installedThemes.get(themeId);
    if (installed) {
      // 如果已安装，我们需要根据模式返回正确的配置
      // 在模拟实现中，我们直接调用 createMockTheme
      return this.createMockTheme(themeId, installed.metadata.description, mode);
    }

    // 模拟从远程获取主题详情
    await new Promise(resolve => setTimeout(resolve, 500));

    // 返回模拟数据
    const mockTheme = this.createMockTheme(themeId, `主题 ${themeId} 的详细描述`, mode);
    return mockTheme;
  }
}

// 默认配置
const defaultConfig: ThemeMarketplaceConfig = {
  repositories: [
    {
      id: 'official',
      name: '官方主题仓库',
      url: 'https://github.com/md2slide/themes',
      type: 'github',
      description: 'Md2Slide官方维护的主题包集合'
    }
  ]
};

// 默认实例
export const themeMarketplaceService = new ThemeMarketplaceService(defaultConfig);