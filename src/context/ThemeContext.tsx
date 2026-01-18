import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeConfig } from '../types/theme';
import { darkTheme, lightTheme } from '../styles/theme';
import { getTheme, setTheme, getStorageItem, setStorageItem, storageKeys } from '../utils/storage';
import { themeMarketplaceService } from '../services/themeMarketplace';

export interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
  setThemeConfig: (config: Partial<ThemeConfig>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [customThemeConfig, setCustomThemeConfig] = useState<Partial<ThemeConfig> | null>(() => {
    return getStorageItem<Partial<ThemeConfig> | null>(storageKeys.CUSTOM_THEME, null);
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const savedCustom = getStorageItem<Partial<ThemeConfig> | null>(storageKeys.CUSTOM_THEME, null);
    if (savedCustom?.theme) {
      return savedCustom.theme;
    }
    return getTheme();
  });

  // 从 storage 读取基础主题设置（仅当没有自定义主题时）
  useEffect(() => {
    if (!customThemeConfig) {
      const savedTheme = getTheme();
      setThemeState(savedTheme);
    }
  }, [customThemeConfig]);

  // 切换主题
  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    
    // 如果有自定义主题（来自市场），我们需要尝试切换其变体
    if (customThemeConfig?.id) {
      try {
        const themePkg = await themeMarketplaceService.getThemeDetails(customThemeConfig.id, newTheme);
        if (themePkg) {
          setThemeConfig(themePkg.theme);
          return;
        }
      } catch (e) {
        console.error('Failed to toggle custom theme variant:', e);
      }
    }

    // 否则切换基础主题
    setTheme(newTheme);
    setThemeState(newTheme);
    setCustomThemeConfig(null); // 切换基础主题时重置自定义配置
    setStorageItem(storageKeys.CUSTOM_THEME, null);
  };

  // 应用主题到 document 根元素（用于全局样式）
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // 更新自定义主题配置
  const setThemeConfig = (config: Partial<ThemeConfig>) => {
    if (config.theme && config.theme !== theme) {
      setTheme(config.theme);
      setThemeState(config.theme);
    }
    
    setCustomThemeConfig(prev => {
      // 深度合并 colors, fontSize, animation
      const newConfig = { 
        ...prev, 
        ...config,
        colors: config.colors ? { ...prev?.colors, ...config.colors } : prev?.colors,
        fontSize: config.fontSize ? { ...prev?.fontSize, ...config.fontSize } : prev?.fontSize,
        animation: config.animation ? { ...prev?.animation, ...config.animation } : prev?.animation
      };
      setStorageItem(storageKeys.CUSTOM_THEME, newConfig);
      return newConfig as Partial<ThemeConfig>;
    });
  };

  // 根据当前主题获取配置
  const baseThemeConfig: ThemeConfig = theme === 'dark' ? darkTheme : lightTheme;
  
  // 合并基础配置和自定义配置
  const themeConfig: ThemeConfig = customThemeConfig 
    ? { 
        ...baseThemeConfig, 
        ...customThemeConfig,
        colors: { ...baseThemeConfig.colors, ...customThemeConfig.colors },
        fontSize: { ...baseThemeConfig.fontSize, ...customThemeConfig.fontSize },
        animation: { ...baseThemeConfig.animation, ...customThemeConfig.animation }
      }
    : baseThemeConfig;

  const value: ThemeContextType = {
    theme,
    themeConfig,
    toggleTheme,
    setThemeConfig,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// 自定义 Hook 用于访问主题上下文
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
