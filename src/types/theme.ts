// 主题类型定义
export type Theme = 'light' | 'dark';

// 主题配置接口
export interface ThemeConfig {
  id?: string;
  theme: Theme;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: {
    title: number;
    heading: number;
    body: number;
    math: number;
  };
  animation: {
    defaultDuration: number;
    easing: string;
  };
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    codeBackground: string;
    codeText: string;
    primary?: string;
  };
  responsive?: {
    fontSize: {
      mobile: {
        title: string;
        heading: string;
        body: string;
      };
      desktop: {
        title: string;
        heading: string;
        body: string;
      };
    };
    spacing: {
      mobile: {
        padding: string;
        gap: string;
      };
      desktop: {
        padding: string;
        gap: string;
      };
    };
  };
}

// 主题上下文接口
export interface ThemeContextType {
  theme: Theme;
  themeConfig: ThemeConfig;
  toggleTheme: () => void;
}
