import React, { useState } from 'react';
import { 
  Bold, Italic, Strikethrough, Code, Heading1, Heading2, Heading3, 
  SeparatorHorizontal, Quote, List, ListOrdered, CheckSquare, 
  FileCode, Table, Link, Image, Sigma, Variable, Grid3X3, 
  Video, Smile, Globe 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ThemeConfig } from '../types/theme';

interface ToolbarButtonProps {
  icon: React.ReactNode;
  title: string;
  shortcut?: string;
  onClick: () => void;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, title, shortcut, onClick }) => {
  const { themeConfig: theme } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          borderRadius: '4px',
          color: theme.colors.textSecondary,
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
        className="toolbar-button"
      >
        {icon}
      </button>
      
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '-35px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#333',
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '11px',
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          <span style={{ fontWeight: 600 }}>{title}</span>
          {shortcut && (
            <span style={{ fontSize: '9px', opacity: 0.7 }}>{shortcut}</span>
          )}
          <div style={{
            position: 'absolute',
            top: '-4px',
            left: '50%',
            transform: 'translateX(-50%)',
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderBottom: '4px solid #333'
          }} />
        </div>
      )}
    </div>
  );
};

interface ToolbarProps {
  applySnippet: (before: string, after?: string) => void;
  handleLinkInsert: () => void;
  handleImageInsert: () => void;
  handleVideoInsert: () => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  theme: ThemeConfig;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  applySnippet,
  handleLinkInsert,
  handleImageInsert,
  handleVideoInsert,
  showEmojiPicker,
  setShowEmojiPicker,
  theme
}) => {
  return (
    <div style={{
      padding: '6px 10px',
      background: theme.colors.surface,
      borderBottom: `1px solid ${theme.colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      zIndex: 10
    }}>
      <div style={{ display: 'flex', gap: '2px', paddingRight: '10px', borderRight: `1px solid ${theme.colors.border}` }}>
        <ToolbarButton icon={<Bold size={16} />} title="加粗" shortcut="Ctrl + B" onClick={() => applySnippet('**', '**')} />
        <ToolbarButton icon={<Italic size={16} />} title="斜体" shortcut="Ctrl + I" onClick={() => applySnippet('*', '*')} />
        <ToolbarButton icon={<Strikethrough size={16} />} title="删除线" shortcut="Ctrl + Shift + S" onClick={() => applySnippet('~~', '~~')} />
        <ToolbarButton icon={<Code size={16} />} title="行内代码" shortcut="Ctrl + E" onClick={() => applySnippet('`', '`')} />
      </div>

      <div style={{ display: 'flex', gap: '2px', paddingRight: '10px', borderRight: `1px solid ${theme.colors.border}` }}>
        <ToolbarButton icon={<Heading1 size={16} />} title="一级标题" shortcut="Ctrl + 1" onClick={() => applySnippet('# ', '')} />
        <ToolbarButton icon={<Heading2 size={16} />} title="二级标题" shortcut="Ctrl + 2" onClick={() => applySnippet('## ', '')} />
        <ToolbarButton icon={<Heading3 size={16} />} title="三级标题" shortcut="Ctrl + 3" onClick={() => applySnippet('### ', '')} />
        <ToolbarButton icon={<SeparatorHorizontal size={16} />} title="分页符" shortcut="Ctrl + Shift + Enter" onClick={() => applySnippet('\n---\n', '')} />
      </div>

      <div style={{ display: 'flex', gap: '2px', paddingRight: '10px', borderRight: `1px solid ${theme.colors.border}` }}>
        <ToolbarButton icon={<Quote size={16} />} title="引用" shortcut="Ctrl + Shift + Q" onClick={() => applySnippet('> ', '')} />
        <ToolbarButton icon={<List size={16} />} title="无序列表" shortcut="Ctrl + L" onClick={() => applySnippet('- ', '')} />
        <ToolbarButton icon={<ListOrdered size={16} />} title="有序列表" shortcut="Ctrl + Shift + L" onClick={() => applySnippet('1. ', '')} />
        <ToolbarButton icon={<CheckSquare size={16} />} title="任务列表" shortcut="Ctrl + Shift + T" onClick={() => applySnippet('- [ ] ', '')} />
      </div>

      <div style={{ display: 'flex', gap: '2px', paddingRight: '10px', borderRight: `1px solid ${theme.colors.border}` }}>
        <ToolbarButton icon={<FileCode size={16} />} title="代码块" shortcut="Ctrl + Shift + K" onClick={() => applySnippet('```\n', '\n```')} />
        <ToolbarButton icon={<Table size={16} />} title="表格" shortcut="Ctrl + Alt + T" onClick={() => applySnippet('| 列1 | 列2 |\n| :--- | :--- |\n| 内容1 | 内容2 |', '')} />
        <ToolbarButton icon={<Link size={16} />} title="链接" shortcut="Ctrl + K" onClick={handleLinkInsert} />
        <ToolbarButton icon={<Image size={16} />} title="图片" shortcut="Ctrl + Shift + I" onClick={handleImageInsert} />
      </div>

      <div style={{ display: 'flex', gap: '2px', paddingRight: '10px', borderRight: `1px solid ${theme.colors.border}` }}>
        <ToolbarButton icon={<Sigma size={16} />} title="行内公式" shortcut="Ctrl + M" onClick={() => applySnippet('$', '$')} />
        <ToolbarButton icon={<Sigma size={16} strokeWidth={3} />} title="块级公式" shortcut="Ctrl + Shift + M" onClick={() => applySnippet('$$\n', '\n$$')} />
        <ToolbarButton icon={<Variable size={16} />} title="向量" shortcut="Ctrl + Alt + V" onClick={() => applySnippet('!vector', '')} />
        <ToolbarButton icon={<Grid3X3 size={16} />} title="网格" shortcut="Ctrl + Alt + G" onClick={() => applySnippet('!grid', '')} />
      </div>

      <div style={{ display: 'flex', gap: '2px' }}>
        <ToolbarButton icon={<Video size={16} />} title="视频" shortcut="Ctrl + Alt + M" onClick={handleVideoInsert} />
        <ToolbarButton icon={<Smile size={16} />} title="图标" shortcut="Ctrl + Shift + E" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
        <ToolbarButton icon={<Globe size={16} />} title="原生HTML" shortcut="Ctrl + Alt + H" onClick={() => applySnippet('!html(', ')')} />
      </div>
    </div>
  );
};
