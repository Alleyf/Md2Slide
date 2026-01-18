import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Wand2, Type, Image as ImageIcon, MessageSquare, X } from 'lucide-react';
import { aiService } from '../services/ai';

interface SelectionAIAssistantProps {
  selection: string;
  position: { x: number; y: number };
  onClose: () => void;
  onApply: (newText: string) => void;
  theme: any;
}

export const SelectionAIAssistant: React.FC<SelectionAIAssistantProps> = ({
  selection,
  position,
  onClose,
  onApply,
  theme
}) => {
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleAction = async (action: string, promptPrefix: string) => {
    setLoading(true);
    setShowResult(true);
    try {
      const response = await aiService.request({
        prompt: `${promptPrefix}\n\n内容：${selection}`
      });
      setResult(response.content);
    } catch (error) {
      setResult('AI 处理失败，请检查配置或稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { id: 'polish', icon: <Wand2 size={14} />, label: '润色', prompt: '请润色以下内容，使其更专业、生动：' },
    { id: 'rewrite', icon: <Type size={14} />, label: '改写', prompt: '请以不同的口吻改写以下内容：' },
    { id: 'image', icon: <ImageIcon size={14} />, label: '生图', prompt: '请根据以下文字描述，生成一段用于 AI 绘图的详细提示词（Prompt）：' },
    { id: 'ask', icon: <MessageSquare size={14} />, label: '提问', prompt: '请针对以下内容进行深度解析并回答可能存在的问题：' },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: position.y + 10,
        left: position.x,
        zIndex: 10000,
        backgroundColor: theme.colors.surface,
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: `1px solid ${theme.colors.border}`,
        display: 'flex',
        flexDirection: 'column',
        minWidth: '120px',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {!showResult ? (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id, action.prompt)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                border: 'none',
                background: 'transparent',
                color: theme.colors.text,
                cursor: 'pointer',
                fontSize: '13px',
                textAlign: 'left',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.colors.border}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: '12px', maxWidth: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.primaryColor, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={12} /> AI 结果
            </span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary }}>
              <X size={14} />
            </button>
          </div>
          
          {loading ? (
            <div style={{ fontSize: '13px', color: theme.colors.textSecondary, padding: '10px 0' }}>AI 正在处理中...</div>
          ) : (
            <>
              <div style={{ 
                fontSize: '13px', 
                color: theme.colors.text, 
                maxHeight: '200px', 
                overflowY: 'auto', 
                marginBottom: '12px',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5'
              }}>
                {result}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => onApply(result)}
                  style={{
                    flex: 1,
                    padding: '6px',
                    backgroundColor: theme.primaryColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  应用替换
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    onClose();
                  }}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: theme.colors.border,
                    color: theme.colors.text,
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  复制
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
