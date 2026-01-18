import React, { useState, useEffect } from 'react';
import { keyboardService } from '../services/keyboardService';
import { ShortcutConfig } from '../types/keyboard';
import { useTheme } from '../context/ThemeContext';
import { X, RotateCcw, Edit, Keyboard, ChevronRight, Save, XCircle } from 'lucide-react';

interface KeyboardShortcutsPanelProps {
  onClose?: () => void;
  embedded?: boolean; // 是否作为内嵌组件使用（不渲染模态框框架）
}

const KeyboardShortcutsPanel: React.FC<KeyboardShortcutsPanelProps> = ({ onClose, embedded = false }) => {
  const { themeConfig: theme } = useTheme();
  const [shortcuts, setShortcuts] = useState<ShortcutConfig>(keyboardService.getShortcuts());
  const [editingShortcut, setEditingShortcut] = useState<keyof ShortcutConfig | null>(null);
  const [newShortcutValue, setNewShortcutValue] = useState('');
  const [error, setError] = useState('');

  // Load shortcuts on component mount
  useEffect(() => {
    setShortcuts(keyboardService.getShortcuts());
  }, []);

  const handleEditStart = (action: keyof ShortcutConfig) => {
    setEditingShortcut(action);
    const actionShortcuts = shortcuts[action];
    setNewShortcutValue(actionShortcuts && actionShortcuts.length > 0 ? actionShortcuts[0] : '');
    setError('');
  };

  const handleEditCancel = () => {
    setEditingShortcut(null);
    setNewShortcutValue('');
    setError('');
  };

  const handleSaveShortcut = () => {
    if (!editingShortcut) return;

    const isValid = keyboardService.validateShortcut(newShortcutValue);
    if (!isValid) {
      setError('无效的快捷键格式');
      return;
    }

    const isConflict = keyboardService.isShortcutConflict(newShortcutValue, editingShortcut);
    if (isConflict) {
      setError('此快捷键与其他操作冲突');
      return;
    }

    const updatedShortcuts = {
      ...shortcuts,
      [editingShortcut]: [newShortcutValue]
    };
    
    setShortcuts(updatedShortcuts);
    keyboardService.setShortcut(editingShortcut, newShortcutValue);
    setEditingShortcut(null);
    setError('');
  };

  const handleResetAll = () => {
    const defaultShortcuts = keyboardService.getDefaultShortcuts();
    setShortcuts(defaultShortcuts);
    
    Object.keys(defaultShortcuts).forEach((action) => {
      const actionKey = action as keyof ShortcutConfig;
      const actionShortcuts = defaultShortcuts[actionKey];
      if (actionShortcuts && actionShortcuts.length > 0) {
        keyboardService.setShortcut(actionKey, actionShortcuts[0]);
      }
    });
    
    setError('');
  };

  const renderShortcutRow = (action: keyof ShortcutConfig, description: string, icon?: React.ReactNode) => {
    const isEditing = editingShortcut === action;
    const hasShortcut = shortcuts[action] && shortcuts[action]!.length > 0 && shortcuts[action]![0];
    
    return (
      <div
        key={action}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderRadius: '12px',
          backgroundColor: isEditing ? `${theme.primaryColor}08` : 'transparent',
          border: isEditing ? `2px solid ${theme.primaryColor}` : '1px solid transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer'
        }}
        onClick={() => !isEditing && handleEditStart(action)}
        onMouseEnter={(e) => {
          if (!isEditing) {
            e.currentTarget.style.backgroundColor = theme.colors.surface;
          }
        }}
        onMouseLeave={(e) => {
          if (!isEditing) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
          {icon}
          <div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: theme.colors.text, marginBottom: '4px' }}>
              {description}
            </div>
            {hasShortcut && !isEditing && (
              <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                当前快捷键: {hasShortcut}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                border: error ? `2px solid #ef4444` : `2px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.background,
                minWidth: '240px',
                transition: 'all 0.2s ease'
              }}>
                <Keyboard size={16} style={{ color: theme.colors.textSecondary }} />
                <input
                  type="text"
                  value={newShortcutValue}
                  onChange={(e) => setNewShortcutValue(e.target.value)}
                  onKeyDown={(e) => {
                    e.stopPropagation();
                    
                    let shortcut = '';
                    if (e.ctrlKey) shortcut += 'Ctrl+';
                    if (e.shiftKey) shortcut += 'Shift+';
                    if (e.altKey) shortcut += 'Alt+';
                    if (e.metaKey) shortcut += 'Meta+';
                    
                    if (e.key.length === 1 || ['Tab', 'Enter', 'Escape', 'Backspace', 'Delete', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                      shortcut += e.key === ' ' ? 'Space' : e.key;
                      setNewShortcutValue(shortcut);
                    }
                  }}
                  placeholder="按下快捷键组合"
                  autoFocus
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    color: theme.colors.text,
                    fontSize: '14px',
                    fontWeight: 500,
                    width: '100%',
                    padding: 0
                  }}
                />
                {error && (
                  <div style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)'
                  }}>
                    <XCircle size={16} style={{ color: '#ef4444' }} />
                  </div>
                )}
              </div>
              {error && (
                <span style={{ fontSize: '12px', color: '#ef4444', whiteSpace: 'nowrap' }}>{error}</span>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasShortcut ? (
                <kbd style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: theme.colors.text,
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {hasShortcut}
                </kbd>
              ) : (
                <span style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  color: theme.colors.textSecondary,
                  backgroundColor: `${theme.colors.textSecondary}10`,
                  borderRadius: '8px',
                  border: `1px dashed ${theme.colors.border}`
                }}>
                  未设置
                </span>
              )}
              <ChevronRight size={18} style={{ color: theme.colors.textSecondary }} />
            </div>
          )}
        </div>
      </div>
    );
  };

  // 内嵌模式渲染（不包含模态框框架）
  if (embedded) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
        {/* 分类标签 */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          borderBottom: `1px solid ${theme.colors.border}`,
          paddingBottom: '12px'
        }}>
          {[
            { id: 'all', label: '全部' },
            { id: 'navigation', label: '导航' },
            { id: 'editing', label: '编辑' },
            { id: 'file', label: '文件' },
            { id: 'view', label: '视图' }
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: tab.id === 'all' ? `2px solid ${theme.primaryColor}` : 'none',
                backgroundColor: tab.id === 'all' ? `${theme.primaryColor}15` : 'transparent',
                color: tab.id === 'all' ? theme.primaryColor : theme.colors.textSecondary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (tab.id !== 'all') {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                }
              }}
              onMouseLeave={(e) => {
                if (tab.id !== 'all') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 - 可滚动 */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px',
          flex: 1,
          overflow: 'auto',
          paddingRight: '4px'
        }}>
          {renderShortcutRow('duplicateLine', '复制当前行')}
          {renderShortcutRow('deleteLine', '删除当前行')}
          {renderShortcutRow('moveLineUp', '向上移动行')}
          {renderShortcutRow('moveLineDown', '向下移动行')}
          {renderShortcutRow('formatDocument', '格式化全文')}
          {renderShortcutRow('formatContinuation', '格式延续')}
          {renderShortcutRow('saveFile', '保存文件')}
          {renderShortcutRow('newFile', '新建文件')}
          {renderShortcutRow('openFile', '打开文件')}
          {renderShortcutRow('exportPdf', '导出PDF')}
          {renderShortcutRow('exportPptx', '导出PPTX')}
          {renderShortcutRow('toggleTheme', '切换主题')}
          {renderShortcutRow('showHelp', '显示帮助')}
          {renderShortcutRow('showSettings', '显示设置')}
          {renderShortcutRow('undo', '撤销')}
          {renderShortcutRow('redo', '重做')}
          {renderShortcutRow('find', '查找')}
          {renderShortcutRow('findNext', '查找下一个')}
          {renderShortcutRow('findPrev', '查找上一个')}
          {renderShortcutRow('replace', '替换')}
          {renderShortcutRow('selectAll', '全选')}
          {renderShortcutRow('copy', '复制')}
          {renderShortcutRow('cut', '剪切')}
          {renderShortcutRow('paste', '粘贴')}
        </div>

        {/* 底部操作栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          borderTop: `1px solid ${theme.colors.border}`,
          flexShrink: 0
        }}>
          <button
            onClick={handleResetAll}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: `1px solid ${theme.colors.border}`,
              background: 'transparent',
              color: theme.colors.text,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <RotateCcw size={14} />
            重置所有快捷键
          </button>

          {editingShortcut && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleEditCancel}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  background: 'transparent',
                  color: theme.colors.text,
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveShortcut}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor || theme.primaryColor})`,
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: `0 4px 12px -4px ${theme.primaryColor}60`,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 16px -4px ${theme.primaryColor}70`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px -4px ${theme.primaryColor}60`;
                }}
              >
                <Save size={14} />
                保存快捷键
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 完整模态框模式
  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '750px',
          maxHeight: '85vh',
          backgroundColor: theme.colors.surface,
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
        {/* 头部 */}
        <div style={{
          padding: '28px 32px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.surface} 100%)`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor || theme.primaryColor})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 8px 20px -6px ${theme.primaryColor}50`
              }}>
                <Keyboard size={24} style={{ color: 'white' }} />
              </div>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 700,
                  color: theme.colors.text,
                  marginBottom: '4px'
                }}>
                  键盘快捷键设置
                </h2>
                <p style={{
                  margin: 0,
                  fontSize: '13px',
                  color: theme.colors.textSecondary
                }}>
                  自定义编辑器的键盘快捷键以提升效率
                </p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: `1px solid ${theme.colors.border}`,
                  color: theme.colors.textSecondary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.border;
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* 分类标签 */}
        <div style={{
          padding: '16px 32px',
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.background,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'all', label: '全部' },
            { id: 'navigation', label: '导航' },
            { id: 'editing', label: '编辑' },
            { id: 'file', label: '文件' },
            { id: 'view', label: '视图' }
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: tab.id === 'all' ? `2px solid ${theme.primaryColor}` : 'none',
                backgroundColor: tab.id === 'all' ? `${theme.primaryColor}15` : 'transparent',
                color: tab.id === 'all' ? theme.primaryColor : theme.colors.textSecondary,
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (tab.id !== 'all') {
                  e.currentTarget.style.backgroundColor = theme.colors.surface;
                }
              }}
              onMouseLeave={(e) => {
                if (tab.id !== 'all') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容区域 */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px',
          backgroundColor: theme.colors.background
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderShortcutRow('duplicateLine', '复制当前行')}
            {renderShortcutRow('deleteLine', '删除当前行')}
            {renderShortcutRow('moveLineUp', '向上移动行')}
            {renderShortcutRow('moveLineDown', '向下移动行')}
            {renderShortcutRow('formatContinuation', '格式延续')}
            {renderShortcutRow('saveFile', '保存文件')}
            {renderShortcutRow('newFile', '新建文件')}
            {renderShortcutRow('openFile', '打开文件')}
            {renderShortcutRow('exportPdf', '导出PDF')}
            {renderShortcutRow('exportPptx', '导出PPTX')}
            {renderShortcutRow('toggleTheme', '切换主题')}
            {renderShortcutRow('showHelp', '显示帮助')}
            {renderShortcutRow('showSettings', '显示设置')}
            {renderShortcutRow('undo', '撤销')}
            {renderShortcutRow('redo', '重做')}
            {renderShortcutRow('find', '查找')}
            {renderShortcutRow('findNext', '查找下一个')}
            {renderShortcutRow('findPrev', '查找上一个')}
            {renderShortcutRow('replace', '替换')}
            {renderShortcutRow('selectAll', '全选')}
            {renderShortcutRow('copy', '复制')}
            {renderShortcutRow('cut', '剪切')}
            {renderShortcutRow('paste', '粘贴')}
          </div>
        </div>

        {/* 底部操作栏 */}
        <div style={{
          padding: '20px 32px',
          borderTop: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handleResetAll}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: `1px solid ${theme.colors.border}`,
              background: 'transparent',
              color: theme.colors.text,
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <RotateCcw size={16} />
            重置所有快捷键
          </button>

          {editingShortcut && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleEditCancel}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.colors.border}`,
                  background: 'transparent',
                  color: theme.colors.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                取消
              </button>
              <button
                onClick={handleSaveShortcut}
                style={{
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor || theme.primaryColor})`,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: `0 4px 12px -4px ${theme.primaryColor}60`,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = `0 8px 16px -4px ${theme.primaryColor}70`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 12px -4px ${theme.primaryColor}60`;
                }}
              >
                <Save size={16} />
                保存快捷键
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KeyboardShortcutsPanel;