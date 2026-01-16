import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { App } from './App';

// 渲染应用
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} else {
  console.error('无法找到root容器');
}

