import { ThemeConfig } from '../types/theme';

// 3Blue1Brown 风格深色主题
export const darkTheme: ThemeConfig = {
  theme: 'dark',
  primaryColor: '#3A86FF', // 经典的3B1B蓝色
  secondaryColor: '#FF006E', // 强调粉色
  accentColor: '#8338EC', // 紫色
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    title: 72,
    heading: 48,
    body: 28,
    math: 36,
  },
  animation: {
    defaultDuration: 60, // 帧数
    easing: 'ease-in-out',
  },
  colors: {
    background: '#0a0a0a',
    surface: '#0d0d0d',
    text: '#ffffff',
    textSecondary: '#888888',
    border: '#222222',
    codeBackground: '#1e1e1e',
    codeText: '#d4d4d4',
  },
};

// 保持向后兼容的别名
export const threeBlueOneBrownTheme = darkTheme;

// 学术风格浅色主题
export const lightTheme: ThemeConfig = {
  theme: 'light',
  primaryColor: '#2563EB', // 学术蓝
  secondaryColor: '#DC2626', // 强调红
  accentColor: '#7C3AED', // 紫色
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: {
    title: 72,
    heading: 48,
    body: 28,
    math: 36,
  },
  animation: {
    defaultDuration: 60,
    easing: 'ease-in-out',
  },
  colors: {
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    codeBackground: '#f3f4f6',
    codeText: '#374151',
  },
};

// 数学公式样式
export const mathStyles = {
  color: '#FFBE0B', // 数学公式的黄色
  fontFamily: 'KaTeX_Main, "Times New Roman", serif',
  fontSize: 36,
  fontWeight: 400,
};

// 代码块样式
export const codeStyles = {
  background: '#1e1e1e',
  color: '#d4d4d4',
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  fontSize: 20,
  padding: 20,
  borderRadius: 8,
};

// 图表样式
export const diagramStyles = {
  stroke: '#3A86FF',
  fill: 'transparent',
  strokeWidth: 3,
  fontSize: 24,
  fontFamily: 'Inter, sans-serif',
};

// 动画缓动函数
export const easingFunctions = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
};
