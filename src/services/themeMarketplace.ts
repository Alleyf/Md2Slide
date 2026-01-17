import { ThemePackage, ThemeMetadata, ThemeInstallSource, ThemeMarketplaceConfig, ThemeRepository } from '../types/themePackage';

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

    return themePackage;
  }

  /**
   * 卸载主题
   */
  async uninstallTheme(themeId: string): Promise<boolean> {
    if (this.installedThemes.has(themeId)) {
      this.installedThemes.delete(themeId);
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
    return this.createMockTheme(
      repo.split('/').pop() || 'github-theme',
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
  private createMockTheme(id: string, description: string): ThemePackage {
    const now = new Date().toISOString();

    // 根据主题ID选择不同的配色方案
    let colors = {
      primary: '#007acc',
      secondary: '#6c757d',
      background: '#ffffff',
      text: '#333333',
      highlight: '#ffeb3b'
    };

    // 根据主题ID设置特定配色
    switch(id) {
      case 'minimal':
        colors = {
          primary: '#2563eb',
          secondary: '#64748b',
          background: '#ffffff',
          text: '#1e293b',
          highlight: '#fef3c7'
        };
        break;
      case 'dark':
        colors = {
          primary: '#60a5fa',
          secondary: '#94a3b8',
          background: '#0f172a',
          text: '#f1f5f9',
          highlight: '#fde68a'
        };
        break;
      case 'cyberpunk':
        colors = {
          primary: '#06b6d4',
          secondary: '#8b5cf6',
          background: '#000000',
          text: '#e2e8f0',
          highlight: '#f472b6'
        };
        break;
      case 'academic':
        colors = {
          primary: '#1e40af',
          secondary: '#475569',
          background: '#f8fafc',
          text: '#0f172a',
          highlight: '#fde68a'
        };
        break;
      case 'presentation':
        colors = {
          primary: '#3b82f6',
          secondary: '#6b7280',
          background: '#ffffff',
          text: '#111827',
          highlight: '#fef3c7'
        };
        break;
      case 'creative':
        colors = {
          primary: '#ec4899',
          secondary: '#8b5cf6',
          background: '#f9fafb',
          text: '#111827',
          highlight: '#a7f3d0'
        };
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
        css: `.theme-${id} {
          --primary-color: ${colors.primary};
          --secondary-color: ${colors.secondary};
          --bg-color: ${colors.background};
          --text-color: ${colors.text};
          --highlight-color: ${colors.highlight};
        }
        
        /* 主题: ${id} */
        body {
          background-color: ${colors.background};
          color: ${colors.text};
        }
        
        .slide-container {
          background-color: ${colors.background};
          color: ${colors.text};
        }
        
        h1, h2, h3 {
          color: ${colors.primary};
        }
        
        .highlight {
          color: ${colors.highlight};
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
  async getThemeDetails(themeId: string): Promise<ThemePackage | null> {
    // 检查已安装的主题
    const installed = this.installedThemes.get(themeId);
    if (installed) {
      return installed;
    }

    // 模拟从远程获取主题详情
    await new Promise(resolve => setTimeout(resolve, 500));

    // 返回模拟数据
    const mockTheme = this.createMockTheme(themeId, `主题 ${themeId} 的详细描述`);
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