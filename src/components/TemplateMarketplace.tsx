import React, { useState } from 'react';
import { X, Layout, FileText, Globe, Download, Upload, Edit2, Check, Trash2, Image as ImageIcon, Loader2, Sparkles, Wand2, Info, ArrowLeft } from 'lucide-react';
import { templateMarketplaceService, Template } from '../services/templateMarketplaceService';
import { ThemeConfig } from '../types/theme';
import { aiService } from '../services/ai';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadImage, suggestImagePath, processCoverImage } from '../utils/imageUtils';

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [generatingCoverId, setGeneratingCoverId] = useState<string | null>(null);
  const [templateCovers, setTemplateCovers] = useState<Record<string, string>>({});
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleAIGenerateTemplate = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const prompt = `根据以下描述生成一个幻灯片模板。描述：${aiPrompt}。
要求：
1. 返回一个 JSON 对象，包含 name, type ('md' | 'html'), description, content 字段。
2. content 必须是有效的 Markdown 或 HTML 内容。
3. 如果是 HTML，请包含内联样式。
4. 仅返回 JSON 对象本身，不要有任何其他文字。`;

      const response = await aiService.request({ prompt });
      // 提取 JSON
      const jsonStr = response.content.match(/\{[\s\S]*\}/)?.[0];
      if (!jsonStr) throw new Error('AI 返回格式错误');
      
      const generated = JSON.parse(jsonStr);
      const newTemplate: Template = {
        id: `ai-${Date.now()}`,
        name: generated.name || 'AI 生成模板',
        type: generated.type || 'md',
        description: generated.description || aiPrompt,
        content: generated.content,
        isCustom: true
      };
      
      templateMarketplaceService.addTemplate(newTemplate);
      
      // 刷新模板列表
      setTemplates([...templateMarketplaceService.getTemplates()]);
      setAiPrompt('');
      alert('✨ AI 模板生成并保存成功！');
    } catch (error) {
      console.error('AI template generation failed:', error);
      alert('生成失败，请检查 AI 配置或稍后重试');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleGenerateCover = async (template: Template) => {
    setGeneratingCoverId(template.id);
    try {
      const prompt = `为名为"${template.name}"的幻灯片模板生成一张精美的预览图。模板类型：${template.type}，描述：${template.description}。要求：展现出模板的结构感和专业性，配色美观，适合作为PPT模板封面预览。`;
      const response = await aiService.request({
        prompt,
        type: 'image'
      });
      
      const match = response.content.match(/!\[.*\]\((.*)\)/);
      if (match && match[1]) {
        // 生成文件名并下载
        const timestamp = Date.now();
        const extension = 'png';
        const filename = `template-cover-${timestamp}.${extension}`;
        
        await downloadImage(match[1], filename);
        
        // 使用本地路径
        const localImagePath = suggestImagePath(filename);
        
        setTemplateCovers(prev => ({ ...prev, [template.id]: localImagePath }));
        
        // 同时更新模板元数据中的预览图片
        const updatedTemplate = { ...template, previewImage: localImagePath };
        templateMarketplaceService.updateTemplate(updatedTemplate);
        
        alert(`封面已生成并下载！\n\n请将下载的图片移动到 public/image 目录下，\n然后应用模板即可使用本地封面。`);
      }
    } catch (error) {
      console.error('Failed to generate cover:', error);
      alert('生成封面失败，请检查 AI 配置');
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleUploadCover = async (template: Template, file: File) => {
    setGeneratingCoverId(template.id);
    try {
      // 处理上传的图片，自动裁切并保存
      const processedImagePath = await processCoverImage(file, 400, 300);
      
      setTemplateCovers(prev => ({ ...prev, [template.id]: processedImagePath }));
      
      // 同时更新模板元数据中的预览图片
      const updatedTemplate = { ...template, previewImage: processedImagePath };
      templateMarketplaceService.updateTemplate(updatedTemplate);
      
      alert(`封面上传成功！图片已自动裁切并保存到: ${processedImagePath}`);
    } catch (error) {
      console.error('Failed to upload cover:', error);
      alert('上传封面失败，请检查图片格式和大小');
    } finally {
      setGeneratingCoverId(null);
    }
  };

  const handleCoverUpload = (template: Template) => {
    // 创建一个隐藏的文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        handleUploadCover(template, file);
      }
    };
    input.click();
  };

  const handleViewDetails = (template: Template) => {
    setSelectedTemplate(template);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedTemplate(null);
  };

  // 每次打开弹窗时重新加载模板
  React.useEffect(() => {
    if (isOpen) {
      setTemplates(templateMarketplaceService.getTemplates());
    }
  }, [isOpen]);

  const handleRename = (id: string, newName: string) => {
    if (newName.trim()) {
      templateMarketplaceService.updateTemplateName(id, newName);
      setTemplates([...templateMarketplaceService.getTemplates()]);
    }
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个模板吗？')) {
      const success = templateMarketplaceService.deleteTemplate(id);
      if (success) {
        // 使用新数组触发重新渲染
        setTemplates([...templateMarketplaceService.getTemplates()]);
      } else {
        alert('无法删除内置模板');
      }
    }
  };

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
      templateMarketplaceService.addTemplate(newTemplate);
      setTemplates(templateMarketplaceService.getTemplates());
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

      {/* AI Generation Input */}
      <div style={{
        padding: '16px 24px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        background: theme.theme === 'dark' ? 'rgba(124, 58, 237, 0.05)' : 'rgba(124, 58, 237, 0.02)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${theme.primaryColor}, #8b5cf6)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Sparkles size={18} />
        </div>
        <input 
          type="text"
          placeholder="描述您想要的模板（例如：科技感强的发布会模板）..."
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAIGenerateTemplate()}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: `1px solid ${theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text,
            fontSize: '14px',
            outline: 'none'
          }}
        />
        <button
          onClick={handleAIGenerateTemplate}
          disabled={isAiGenerating || !aiPrompt.trim()}
          style={{
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: theme.primaryColor,
            color: 'white',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            opacity: (isAiGenerating || !aiPrompt.trim()) ? 0.6 : 1
          }}
        >
          {isAiGenerating ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
          AI 生成
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flex: '1', overflow: 'hidden' }}>
        {/* Template Grid */}
        <div style={{
          flex: '1',
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
                background: theme.colors.background,
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
                fontSize: '40px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {templateCovers[template.id] ? (
                  <img 
                    src={templateCovers[template.id]} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.querySelector('.fallback-icon')?.removeAttribute('style');
                    }}
                  />
                ) : null}
                <div 
                  className="fallback-icon"
                  style={{ 
                    display: templateCovers[template.id] ? 'none' : 'flex',
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}
                >
                  {template.type === 'md' ? <FileText size={48} opacity={0.3} /> : <Globe size={48} opacity={0.3} />}
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleGenerateCover(template);
                  }}
                  disabled={generatingCoverId === template.id}
                  style={{
                    position: 'absolute',
                    bottom: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                >
                  {generatingCoverId === template.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <ImageIcon size={12} />
                  )}
                  AI 封面
                </button>
              </div>
              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  {editingId === template.id ? (
                    <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                      <input
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(template.id, editName);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        style={{
                          flex: 1,
                          fontSize: '14px',
                          padding: '2px 4px',
                          borderRadius: '4px',
                          border: `1px solid ${theme.primaryColor}`,
                          background: theme.colors.surface,
                          color: theme.colors.text
                        }}
                      />
                      <button
                        onClick={() => handleRename(template.id, editName)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#22c55e' }}
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h3 style={{ margin: 0, fontSize: '16px', color: theme.colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {template.name}
                      </h3>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(template.id);
                            setEditName(template.name);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: theme.colors.textSecondary,
                            opacity: 0.6,
                            padding: '4px'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                          title="修改名称"
                        >
                          <Edit2 size={14} />
                        </button>
                        {template.isCustom && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(template.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#ef4444',
                              opacity: 0.6,
                              padding: '4px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                            title="删除模板"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: theme.colors.textSecondary, flex: 1 }}>
                  {template.description}
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleViewDetails(template)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: `1px solid ${theme.colors.border}`,
                      background: theme.colors.surface,
                      color: theme.colors.text,
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Info size={14} />
                    预览
                  </button>
                  <button
                    onClick={() => onApplyTemplate(template)}
                    style={{
                      flex: 1,
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
                    应用
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Details Modal */}
      {showDetails && selectedTemplate && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 2100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}
          onClick={handleCloseDetails}
        >
          <div
            style={{
              background: theme.colors.surface,
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              borderRadius: '16px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              border: `1px solid ${theme.colors.border}`,
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: `${theme.primaryColor}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {selectedTemplate.type === 'md' ? <FileText size={20} color={theme.primaryColor} /> : <Globe size={20} color={theme.primaryColor} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', color: theme.colors.text, fontWeight: 700 }}>
                    {selectedTemplate.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>
                    {selectedTemplate.type === 'md' ? 'Markdown 模板' : 'HTML 模板'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseDetails}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: theme.colors.textSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.border}`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <ArrowLeft size={16} />
                返回
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: '1', overflowY: 'auto', padding: '24px' }}>
              {/* Description */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  模板描述
                </h4>
                <p style={{ margin: 0, fontSize: '15px', color: theme.colors.text, lineHeight: '1.6' }}>
                  {selectedTemplate.description}
                </p>
              </div>

              {/* Preview */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: theme.colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  内容预览
                </h4>
                <div style={{
                  background: theme.colors.background,
                  borderRadius: '12px',
                  border: `1px solid ${theme.colors.border}`,
                  padding: '20px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {selectedTemplate.type === 'md' ? (
                    <div className="markdown-body" style={{ color: theme.colors.text }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedTemplate.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div 
                      dangerouslySetInnerHTML={{ __html: selectedTemplate.content }}
                      style={{ fontSize: '14px' }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => {
                  handleGenerateCover(selectedTemplate);
                }}
                disabled={generatingCoverId === selectedTemplate.id}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {generatingCoverId === selectedTemplate.id ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ImageIcon size={18} />
                )}
                AI 封面
              </button>
              <button
                onClick={() => {
                  handleCoverUpload(selectedTemplate);
                }}
                disabled={generatingCoverId === selectedTemplate.id}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  background: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Upload size={18} />
                上传封面
              </button>
              <button
                onClick={() => {
                  onApplyTemplate(selectedTemplate);
                  handleCloseDetails();
                }}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: theme.primaryColor,
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Download size={18} />
                应用模板
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
