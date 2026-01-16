import React from 'react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        border: '1px solid',
        borderColor: theme === 'dark' ? '#333' : '#e5e7eb',
        background: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: theme === 'dark' ? '#888' : '#6b7280',
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme === 'dark' ? '#555' : '#d1d5db';
        e.currentTarget.style.color = theme === 'dark' ? '#aaa' : '#4b5563';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme === 'dark' ? '#333' : '#e5e7eb';
        e.currentTarget.style.color = theme === 'dark' ? '#888' : '#6b7280';
      }}
      title={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
    >
      {theme === 'dark' ? (
        // 月亮图标（浅色主题按钮）
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      ) : (
        // 月亮图标（深色模式激活时显示的提示，点击后会切换到深色）
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
};
