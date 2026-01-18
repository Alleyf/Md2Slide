import React, { useState } from 'react';
import { X, Layout, FileText, Globe, Download, Upload } from 'lucide-react';
import { templateMarketplaceService, Template } from '../services/templateMarketplaceService';
import { ThemeConfig } from '../types/theme';

interface TemplateMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (template: Template) => void;
  theme: ThemeConfig;
}

export const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  theme
}) => {
  const [filter, setFilter] = useState<'all' | 'md' | 'html'>('all');
  const templates = templateMarketplaceService.getTemplates();

  const filteredTemplates = templates.filter(t => 
    filter === 'all' ? true : t.type === filter
  );

  if (!isOpen) return null;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const type = file.name.endsWith('.html') ? 'html' : 'md';
      const newTemplate: Template = {
        id: `upload-${Date.now()}`,
        name: file.name,
        type: type,
        description: '本地上传的模板',
        content: content
      };
      onApplyTemplate(newTemplate);
      onClose();
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: theme.colors.surface,
        width: '800px',
        maxHeight: '80vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        border: `1px solid ${theme.colors.border}`,
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layout size={24} color={theme.primaryColor} />
            <h2 style={{ margin: 0, fontSize: '20px', color: theme.colors.text }}>模板市场</h2>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textSecondary }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '12px 24px',
          background: theme.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['all', 'md', 'html'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === f ? theme.primaryColor : 'transparent',
                  color: filter === f ? 'white' : theme.colors.textSecondary,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {f === 'all' ? '全部' : f === 'md' ? 'Markdown' : 'HTML'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: theme.colors.textSecondary, opacity: 0.6, marginRight: '8px' }}>
              内置模板存储在: public/template/
            </span>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '6px',
              background: theme.colors.border,
              color: theme.colors.text,
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 600
            }}>
            <Upload size={16} />
            上传本地模板
            <input type="file" accept=".md,.html" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      </div>

      {/* Template Grid */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px'
        }}>
          {filteredTemplates.map(template => (
            <div 
              key={template.id}
              style={{
                background: theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
                borderRadius: '12px',
                border: `1px solid ${theme.colors.border}`,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{
                height: '120px',
                background: theme.theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
                {template.type === 'md' ? <FileText size={48} opacity={0.3} /> : <Globe size={48} opacity={0.3} />}
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: theme.colors.text }}>{template.name}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: theme.colors.textSecondary, flex: 1 }}>
                  {template.description}
                </p>
                <button
                  onClick={() => onApplyTemplate(template)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: 'none',
                    background: theme.primaryColor,
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  应用模板
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
