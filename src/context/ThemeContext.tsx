import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeConfig, ThemeContextType } from '../types/theme';
import { darkTheme, lightTheme } from '../styles/theme';
import { getTheme, setTheme } from '../utils/storage';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  // 从 storage 读取主题设置
  useEffect(() => {
    const savedTheme = getTheme();
    setThemeState(savedTheme);
  }, []);

  // 切换主题
  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    setThemeState(newTheme);
  };

  // 应用主题到 document 根元素（用于全局样式）
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  // 根据当前主题获取配置
  const themeConfig: ThemeConfig = theme === 'dark' ? darkTheme : lightTheme;

  const value: ThemeContextType = {
    theme,
    themeConfig,
    toggleTheme,
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
