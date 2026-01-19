import React, { useState } from 'react';
import { Sparkles, MessageSquare, Wand2, BrainCircuit, Languages, Sparkle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AIMenuProps {
  onOpenAIAssistant: () => void;
}

export const AIMenu: React.FC<AIMenuProps> = ({ onOpenAIAssistant }) => {
  const { themeConfig: theme } = useTheme();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const menuItems = [
    {
      id: 'chat',
      label: '对话助手',
      icon: MessageSquare,
      description: '与AI进行智能对话'
    },
    {
      id: 'improve',
      label: '内容润色',
      icon: Wand2,
      description: '优化和改进现有内容'
    },
    {
      id: 'outline',
      label: '生成大纲',
      icon: BrainCircuit,
      description: '将内容转换为结构化大纲'
    },
    {
      id: 'translate',
      label: '智能翻译',
      icon: Languages,
      description: '多语言翻译服务'
    },
    {
      id: 'suggest',
      label: '灵感启发',
      icon: Sparkle,
      description: '获取创意和建议'
    }
  ];

  return (
    <div 
      style={{
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <button
        onClick={onOpenAIAssistant}
        style={{
          background: 'transparent',
          color: theme.colors.textSecondary,
          border: 'none',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          borderRadius: '6px',
          transition: 'all 0.2s ease',
          zIndex: 1000
        }}
        onMouseEnter={(e) => {
          setHoveredItem('main');
          e.currentTarget.style.background = theme.colors.border;
          e.currentTarget.style.color = theme.primaryColor;
        }}
        onMouseLeave={(e) => {
          setHoveredItem(null);
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = theme.colors.textSecondary;
        }}
        title="AI 助手"
      >
        <Sparkles size={18} />
      </button>
      
      {/* 悬浮菜单 */}
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '10px',
          display: 'flex',
          gap: '6px',
          padding: '6px',
          background: theme.colors.surface,
          borderRadius: '12px',
          border: `1px solid ${theme.colors.border}`,
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
          opacity: hoveredItem ? 1 : 0,
          visibility: hoveredItem ? 'visible' : 'hidden',
          transition: 'all 0.3s ease',
          zIndex: 1001
        }}
      >
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                onOpenAIAssistant();
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: hoveredItem === item.id 
                  ? `${theme.primaryColor}20` 
                  : 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: hoveredItem === item.id 
                  ? theme.primaryColor 
                  : theme.colors.textSecondary,
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem('main')}
              title={item.description}
            >
              <IconComponent size={14} />
              <div
                style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: theme.colors.surface,
                  color: theme.colors.text,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  opacity: hoveredItem === item.id ? 1 : 0,
                  visibility: hoveredItem === item.id ? 'visible' : 'hidden',
                  transition: 'all 0.2s ease',
                  pointerEvents: 'none',
                  border: `1px solid ${theme.colors.border}`
                }}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};