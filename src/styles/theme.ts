import { StyleConfig } from '../types/paper';

// 3Blue1Brown 风格配色方案
export const threeBlueOneBrownTheme: StyleConfig = {
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
