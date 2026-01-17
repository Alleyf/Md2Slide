import React from 'react';
import { useTheme } from '../context/ThemeContext';

import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div 
      onClick={toggleTheme}
      style={{
        width: '56px',
        height: '28px',
        borderRadius: '14px',
        background: theme === 'dark' ? '#2c2c2e' : '#e9e9ea',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
      }}
      title={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
    >
      <div style={{
        position: 'absolute',
        left: theme === 'dark' ? '30px' : '2px',
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 2
      }}>
        {theme === 'dark' ? (
          <Moon size={14} color="#5e5ce6" fill="#5e5ce6" />
        ) : (
          <Sun size={14} color="#ff9500" fill="#ff9500" />
        )}
      </div>
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0 6px',
        opacity: 0.4
      }}>
        <Sun size={12} color={theme === 'dark' ? '#fff' : '#000'} />
        <Moon size={12} color={theme === 'dark' ? '#fff' : '#000'} />
      </div>
    </div>
  );
};
