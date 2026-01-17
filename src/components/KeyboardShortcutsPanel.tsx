import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

import {
  KeyboardShortcut,
  ShortcutConfig,
  defaultShortcuts,
  shortcutDescriptions,
} from '../types/keyboard';

interface KeyboardShortcutsProps {
  onShortcut: (action: KeyboardShortcut['action']) => void;
}

export const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsProps> = ({ onShortcut }) => {
  const { themeConfig: theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key;

    if (!isOpen) return;

    switch (key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case ':':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        return;
    }
  }, [isOpen]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown, isOpen]);

  const shortcutsList: Array<{
    key: string;
    action: KeyboardShortcut['action'];
    description: string;
    shortcut: string;
  }> = [
    ...defaultShortcuts.nextSlide.map(key => ({
      key,
      action: 'nextSlide',
      description: shortcutDescriptions.nextSlide,
      shortcut: key === ' ' ? '空格' : key,
    })),
    ...defaultShortcuts.prevSlide.map(key => ({
      key,
      action: 'prevSlide',
      description: shortcutDescriptions.prevSlide,
      shortcut: key,
    })),
    ...defaultShortcuts.toggleFullscreen.map(key => ({
      key,
      action: 'toggleFullscreen',
      description: shortcutDescriptions.toggleFullscreen,
      shortcut: key,
    })),
    ...defaultShortcuts.toggleEditor.map(key => ({
      key,
      action: 'toggleEditor',
      description: shortcutDescriptions.toggleEditor,
      shortcut: key,
    })),
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '12px 16px',
          background: theme.colors.surface,
          color: theme.colors.text,
          border: `1px solid ${theme.colors.border}`,
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.2s',
          zIndex: 1000,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.primaryColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = theme.colors.border;
        }}
        title="快捷键设置"
      >
        <span>⌨</span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            style={{
              background: theme.colors.surface,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '12px',
              maxWidth: '600px',
              maxHeight: '80vh',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              padding: '24px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: '0 0 20px 0',
                fontSize: '20px',
                fontWeight: 700,
                color: theme.colors.text,
              }}
            >
              键盘快捷键
            </h2>

            <div
              style={{
                display: 'grid',
                gap: '12px',
                gridTemplateColumns: '120px 1fr',
              }}
            >
              {shortcutsList.map((item, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: '8px',
                    background:
                      activeShortcut === item.action
                        ? `rgba(58, 134, 255, 0.1)`
                        : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 0.2s',
                  }}
                  onClick={() => onShortcut(item.action)}
                  onMouseEnter={(e) => {
                    if (activeShortcut !== item.action) {
                      e.currentTarget.style.background = `rgba(58, 134, 255, 0.2)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      activeShortcut === item.action
                        ? `rgba(58, 134, 255, 0.1)`
                        : 'transparent';
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <kbd
                      style={{
                        padding: '6px 12px',
                        background: theme.colors.codeBackground,
                        border: `1px solid ${theme.colors.border}`,
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        minWidth: '80px',
                        textAlign: 'center',
                      }}
                    >
                      {item.shortcut}
                    </kbd>
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: '14px',
                      color: theme.colors.textSecondary,
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      {item.description}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>
                      {item.action}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button
                style={{
                  padding: '12px 24px',
                  background: theme.primaryColor,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onClick={() => setIsOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.accentColor;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.primaryColor;
                }}
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
