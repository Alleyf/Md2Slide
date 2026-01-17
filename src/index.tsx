import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

// 渲染应用
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  console.error('无法找到root容器');
}

