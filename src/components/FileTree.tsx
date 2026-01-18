import React, { useState } from 'react';
import { ThemeConfig } from '../types/theme';
import { FileItem } from '../types/file';

import { pluginManager } from '../services/pluginManager';

interface FileTreeItemProps {
  item: FileItem;
  depth: number;
  activeFile: string | null;
  onFileClick: (file: FileItem) => void;
  onDelete: (fileName: string) => void;
  theme: ThemeConfig;
  onContextMenu: (e: React.MouseEvent, item: FileItem) => void;
  onMove?: (sourcePath: string, targetPath: string) => void;
}

const FileTreeItem: React.FC<FileTreeItemProps> = ({ 
  item, depth, activeFile, onFileClick, onDelete, theme, onContextMenu, onMove
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, item);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.path);
    e.stopPropagation();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (item.kind === 'directory') {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const sourcePath = e.dataTransfer.getData('text/plain');
    if (sourcePath && sourcePath !== item.path && onMove) {
      onMove(sourcePath, item.path);
    }
  };

  if (item.kind === 'directory') {
    return (
      <>
        <div
          onClick={() => setIsOpen(!isOpen)}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          draggable
          data-file-item="true"
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
            opacity: 0.9,
            backgroundColor: isDragOver ? (theme.theme === 'dark' ? 'rgba(58,134,255,0.2)' : 'rgba(37,99,235,0.1)') : 'transparent'
          }}
          onMouseEnter={(e) => {
            if (!isDragOver) e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
          }}
          onMouseLeave={(e) => {
            if (!isDragOver) e.currentTarget.style.background = 'transparent';
          }}
        >
          <span style={{ fontSize: '10px', transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
          <span style={{ fontSize: '14px' }}>📁</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.name}
          </span>
        </div>
        {isOpen && item.children?.map(child => (
          <FileTreeItem
            key={child.path || child.name}
            item={child}
            depth={depth + 1}
            activeFile={activeFile}
            onFileClick={onFileClick}
            onDelete={onDelete}
            theme={theme}
            onContextMenu={onContextMenu}
            onMove={onMove}
          />
        ))}
      </>
    );
  }

  return (
    <div
      onClick={() => onFileClick(item)}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      draggable
      data-file-item="true"
      style={{
        padding: '6px 15px',
        paddingLeft: `${15 + depth * 12 + 16}px`,
        fontSize: '13px',
        color: activeFile === item.path ? theme.primaryColor : theme.colors.textSecondary,
        cursor: 'pointer',
        background: activeFile === item.path ? (theme.theme === 'dark' ? 'rgba(58,134,255,0.1)' : 'rgba(37,99,235,0.05)') : 'transparent',
        borderLeft: `3px solid ${activeFile === item.path ? theme.primaryColor : 'transparent'}`,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      onMouseEnter={(e) => {
        if (activeFile !== item.path) e.currentTarget.style.background = theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)';
      }}
      onMouseLeave={(e) => {
        if (activeFile !== item.path) e.currentTarget.style.background = 'transparent';
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
  onMove?: (sourcePath: string, targetPath: string) => void;
  onExport: (file: FileItem) => void;
   onExportPPTX?: (file: FileItem) => void;
   onExportWord?: (file: FileItem) => void;
  onImport: (fileType?: 'markdown' | 'html') => void;
  onOpenFolder: () => void;
  onCreate: (item: FileItem) => void;
  theme: ThemeConfig;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  onFileClick,
  onDelete,
  onRename,
  onMove,
  onExport,
  onExportPPTX,
  onExportWord,
  onImport,
  onOpenFolder,
  onCreate,
  theme,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, item: FileItem } | null>(null);

  const handleContextMenu = (e: React.MouseEvent, item: FileItem) => {
    setContextMenu({ x: e.clientX, y: e.clientY, item });
  };

  const closeMenu = () => setContextMenu(null);

  const pluginActions = pluginManager.getContextMenuActions();

  const handleTreeContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // 如果右键点击在空白处，使用根目录作为默认项
    if (!(e.target as HTMLElement).closest('[data-file-item]')) {
      const dummyItem: FileItem = { name: 'root', path: 'root', kind: 'directory', children: files };
      setContextMenu({ x: e.clientX, y: e.clientY, item: dummyItem });
    }
  };

  return (
    <div 
      style={{ padding: '10px 0' }} 
      onClick={closeMenu}
      onContextMenu={handleTreeContextMenu}
    >
      {files.map(file => (
        <FileTreeItem
          key={file.path || file.name}
          item={file}
          depth={0}
          activeFile={activeFile}
          onFileClick={onFileClick}
          onDelete={onDelete}
          theme={theme}
          onContextMenu={handleContextMenu}
          onMove={onMove}
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
          {typeof window !== 'undefined' && 'showDirectoryPicker' in window && (
            <div
              onClick={() => {
                onOpenFolder();
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
              <span>📂</span> 打开文件夹
            </div>
          )}
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
          {onExportPPTX && (
            <div
              onClick={() => {
                onExportPPTX(contextMenu.item);
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
              <span>📊</span> 导出为 PPTX
            </div>
          )}
          {onExportWord && (
            <div
              onClick={() => {
                onExportWord(contextMenu.item);
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
              <span>📄</span> 导出为 Word
            </div>
          )}
          <div
            onClick={() => {
              onImport('markdown');
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
            <span>📥</span> 导入 Markdown
          </div>
          <div
            onClick={() => {
              onImport('html');
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
            <span>📥</span> 导入 HTML
          </div>
          <div
            onClick={() => {
              onCreate(contextMenu.item);
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
            <span>📝</span> 新建文件
          </div>
          <div
            onClick={() => {
              onRename(contextMenu.item.path);
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
              onDelete(contextMenu.item.path);
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

          {pluginActions.length > 0 && (
            <>
              <div style={{ height: '1px', background: theme.colors.border, margin: '4px 0' }} />
              {pluginActions.map(action => (
                <div
                  key={action.id}
                  onClick={() => {
                    action.onClick(contextMenu.item);
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
                  <span>🔧</span> {typeof action.label === 'function' ? action.label(contextMenu.item) : action.label}
                </div>
              ))}
            </>
          )}
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
