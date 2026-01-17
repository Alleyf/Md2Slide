import React, { useState } from 'react';
import { ThemeConfig } from '../types/theme';
import { FileItem } from '../types/file';

interface FileTreeItemProps {
  item: FileItem;
  depth: number;
  activeFile: string | null;
  onFileClick: (file: FileItem) => void;
  onDelete: (fileName: string) => void;
  theme: ThemeConfig;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  item, depth, activeFile, onFileClick, onDelete, theme, onContextMenu 
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, item);
  };

  if (item.kind === 'directory') {
    return (
      <>
        <div
          onClick={() => setIsOpen(!isOpen)}
          onContextMenu={handleContextMenu}
          style={{
            padding: '6px 15px',
            paddingLeft: `${15 + depth * 12}px`,
            fontSize: '13px',
            color: theme.colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s',
            fontWeight: 500,
            opacity: 0.9
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
          <span style={{ fontSize: '14px' }}>📁</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
        </div>
        {isOpen && item.children?.map(child => (
          <FileTreeItem
            key={child.name}
            item={child}
            depth={depth + 1}
            activeFile={activeFile}
            onFileClick={onFileClick}
            onDelete={onDelete}
            theme={theme}
            onContextMenu={onContextMenu}
          />
        ))}
      </>
    );
  }

  return (
    <div
      onClick={() => onFileClick(item)}
      onContextMenu={handleContextMenu}
      style={{
        padding: '6px 15px',
        paddingLeft: `${15 + depth * 12 + 16}px`,
        fontSize: '13px',
        color: activeFile === item.name ? theme.primaryColor : theme.colors.textSecondary,
        cursor: 'pointer',
        background: activeFile === item.name ? (theme.theme === 'dark' ? 'rgba(58,134,255,0.1)' : 'rgba(37,99,235,0.05)') : 'transparent',
        borderLeft: `3px solid ${activeFile === item.name ? theme.primaryColor : 'transparent'}`,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        if (activeFile !== item.name) e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
      }}
      onMouseLeave={(e) => {
        if (activeFile !== item.name) e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ fontSize: '14px' }}>{item.isStatic ? '📚' : '📄'}</span>
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {item.name}
      </span>
    </div>
  );
};

interface FileTreeProps {
  files: FileItem[];
  activeFile: string | null;
  onFileClick: (file: FileItem) => void;
  onDelete: (fileName: string) => void;
  onRename: (fileName: string) => void;
  onExport: (file: FileItem) => void;
  onImport: () => void;
  theme: ThemeConfig;
}

export const FileTree: React.FC<FileTreeProps> = ({ 
  files, activeFile, onFileClick, onDelete, onRename, onExport, onImport, theme 
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeMenu = () => setContextMenu(null);

  return (
    <div style={{ padding: '10px 0' }} onClick={closeMenu}>
      {files.map(file => (
        <FileTreeItem
          key={file.name}
          item={file}
          depth={0}
          activeFile={activeFile}
          onFileClick={onFileClick}
          onDelete={onDelete}
          theme={theme}
          onContextMenu={handleContextMenu}
        />
      ))}

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '4px 0',
            zIndex: 1000,
            minWidth: '120px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={() => {
              onFileClick(contextMenu.item);
              closeMenu();
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📖</span> 打开文件
          </div>
          <div
            onClick={() => {
              onExport(contextMenu.item);
              closeMenu();
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📤</span> 导出为 PDF
          </div>
          <div
            onClick={() => {
              onImport();
              closeMenu();
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>📥</span> 导入文件
          </div>
          <div
            onClick={() => {
              onRename(contextMenu.item.name);
              closeMenu();
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>✏️</span> 重命名
          </div>
          <div
            onClick={() => {
              onDelete(contextMenu.item.name);
              closeMenu();
            }}
            style={{
              padding: '8px 12px',
              fontSize: '13px',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>🗑️</span> 删除文件
          </div>
        </div>
      )}
      
      {contextMenu && (
        <div 
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
        />
      )}
    </div>
  );
};
