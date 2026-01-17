import { BasePlugin, PluginManifest, PluginAPI } from './BasePlugin';
import { minimalTheme } from '../themes/minimal';

export interface ThemePluginConfig {
  themeId: string;
  themeData: any;
}

export class ThemePlugin extends BasePlugin<ThemePluginConfig> {
  static get manifest(): PluginManifest {
    return {
      id: 'theme-plugin',
      name: 'Theme Plugin',
      version: '1.0.0',
      description: 'Plugin for managing and applying themes',
      author: 'Md2Slide Team',
      homepage: 'https://github.com/md2slide',
      license: 'MIT'
    };
  }

  async initialize(api: PluginAPI): Promise<void> {
    console.log('Theme plugin initialized');
    // 注册主题相关的命令
    api.registerCommand({
      id: 'theme.apply',
      name: 'Apply Theme',
      description: 'Apply a specific theme to the presentation',
      handler: async (params: { themeId: string }) => {
        await this.applyTheme(params.themeId);
        return { success: true, message: `Theme ${params.themeId} applied successfully` };
      }
    });
  }

  async applyTheme(themeId: string): Promise<void> {
    // 这里可以实现应用主题的具体逻辑
    console.log(`Applying theme: ${themeId}`);
    
    // 例如，可以基于themeId加载不同的主题数据
    let themeData;
    switch(themeId) {
      case 'minimal':
        themeData = minimalTheme;
        break;
      default:
        themeData = minimalTheme; // 默认使用minimal主题
    }
    
    // 将主题应用到应用程序
    this.updateTheme(themeData);
  }

  private updateTheme(themeData: any): void {
    // 更新CSS变量或应用主题
    const root = document.documentElement;
    
    // 设置主题相关的CSS变量
    Object.entries(themeData.colors).forEach(([key, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(`--theme-${key}`, value);
      } else if (typeof value === 'object' && value !== null) {
        // 处理嵌套的颜色对象，如code
        Object.entries(value as Record<string, any>).forEach(([subKey, subValue]) => {
          if (typeof subValue === 'string') {
            root.style.setProperty(`--theme-${key}-${subKey}`, subValue);
          }
        });
      }
    });
    
    // 应用其他主题属性
    root.style.setProperty('--theme-font-family', themeData.fontFamily);
    root.style.setProperty('--theme-border-radius', themeData.borderRadius);
  }

  async destroy(): Promise<void> {
    console.log('Theme plugin destroyed');
  }
}