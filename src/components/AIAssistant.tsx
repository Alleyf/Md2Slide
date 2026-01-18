import React, { useState, useEffect } from 'react';
import { aiService, DEFAULT_AI_CONFIG } from '../services/ai';
import { AIResponse, AIServiceConfig } from '../types/ai';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Sparkles, 
  Wand2, 
  Settings, 
  X, 
  Volume2, 
  Save, 
  Maximize2,
  BrainCircuit,
  Image as ImageIcon,
  Download,
  Languages as TranslateIcon,
  MessageSquareText,
  MousePointer2,
  Copy,
  RotateCcw,
  Sparkle,
  History,
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { downloadImage, extractImageUrls, isNetworkImage } from '../utils/imageUtils';

interface AIAssistantProps {
  editorContent: string;
  onContentUpdate: (newContent: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isSidebar?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ 
  editorContent, 
  onContentUpdate, 
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  isSidebar = false
}) => {
  const { themeConfig: theme } = useTheme();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'improve' | 'slides' | 'translate' | 'suggest' | 'settings'>('general');
  const [inputText, setInputText] = useState(editorContent);
  const [targetLanguage, setTargetLanguage] = useState<'zh' | 'en'>('zh');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // AI 配置状态
  const [config, setConfig] = useState<AIServiceConfig>(() => {
    return getStorageItem<AIServiceConfig>(storageKeys.AI_CONFIG, DEFAULT_AI_CONFIG);
  });

  // 监听存储变化
  useEffect(() => {
    const handleStorageChange = () => {
      const latestConfig = getStorageItem<AIServiceConfig>(storageKeys.AI_CONFIG, DEFAULT_AI_CONFIG);
      setConfig(latestConfig);
      aiService.updateConfig(latestConfig);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ai-config-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ai-config-updated', handleStorageChange);
    };
  }, []);

  const capabilities = aiService.getCapabilities();

  // 初始化时更新服务配置
  useEffect(() => {
    aiService.updateConfig(config);
  }, []);

  // 决定使用哪个isOpen状态
  const effectiveIsOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnClose !== undefined ? externalOnClose : () => setInternalIsOpen(!internalIsOpen);

  useEffect(() => {
    if (editorContent && !inputText) {
      setInputText(editorContent);
    }
  }, [editorContent]);

  const handleAIRequest = async (prompt: string, type: 'chat' | 'image' = 'chat') => {
    setLoading(true);
    setResponse(null);
    try {
      aiService.updateConfig(config);
      const result = await aiService.request({ prompt, type });
      setResponse(result);
    } catch (error) {
      console.error('AI request failed:', error);
      const errorMsg = (error as Error).message || '未知错误';
      setResponse({
        content: `### ❌ AI 服务请求失败\n\n**原因**：${errorMsg}\n\n请检查配置或稍后再试。`,
        usage: undefined,
        model: undefined
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = () => handleAIRequest(`请对以下文本进行简明扼要的总结：\n\n${inputText.substring(0, 2000)}`);
  const handleGenerateImage = () => handleAIRequest(inputText.substring(0, 500), 'image');
  const handleImprove = () => handleAIRequest(`请改进以下文本的表达，使其更清晰、更专业：\n\n${inputText.substring(0, 2000)}`);
  const handleExtractKeyPoints = () => handleAIRequest(`请从以下文本中提取关键点，并以要点形式列出：\n\n${inputText.substring(0, 2000)}`);
  const handleGenerateSlides = () => handleAIRequest(`请将以下内容转换为幻灯片大纲，每张幻灯片应包含标题和要点：\n\n${inputText.substring(0, 2000)}`);
  const handleTranslate = () => handleAIRequest(`请将以下文本翻译成${targetLanguage === 'zh' ? '中文' : '英文'}：\n\n${inputText.substring(0, 2000)}`);
  const handleSuggest = () => handleAIRequest(`请针对以下幻灯片内容，提供演讲建议（包括节奏控制、重点强调和互动建议）：\n\n${inputText.substring(0, 2000)}`);

  const handleTTS = () => {
    if (!response || !response.content) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(response.content);
    utterance.lang = targetLanguage === 'zh' ? 'zh-CN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleApplyResponse = () => {
    if (response) {
      onContentUpdate(response.content);
    }
  };

  const handleDownloadImage = async () => {
    if (!response) return;
    
    const imageUrls = extractImageUrls(response.content);
    if (imageUrls.length === 0) {
      alert('未找到可下载的图片');
      return;
    }

    try {
      await downloadImage(imageUrls[0]);
      alert('图片已下载到浏览器下载文件夹。\n\n请手动将图片移动到项目的 public/image 目录下，\n然后使用相对路径 /image/文件名 引用图片。');
    } catch (error) {
      alert(`下载失败: ${(error as Error).message}`);
    }
  };

  const renderTabButton = (tab: typeof activeTab, icon: React.ReactNode, label: string) => {
    const isActive = activeTab === tab;
    return (
      <button
        onClick={() => setActiveTab(tab)}
        style={{
          padding: '12px 10px',
          border: 'none',
          backgroundColor: isActive ? `${theme.primaryColor}15` : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          color: isActive ? theme.primaryColor : theme.colors.textSecondary,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '12px',
          flex: 1,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ 
          transform: isActive ? 'scale(1.1) translateY(-1px)' : 'scale(1)',
          transition: 'transform 0.3s ease'
        }}>
          {React.cloneElement(icon as React.ReactElement, { size: 20 })}
        </div>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: isActive ? 700 : 500,
          opacity: isActive ? 1 : 0.8
        }}>{label}</span>
        {isActive && (
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: '25%',
            right: '25%',
            height: '3px',
            background: theme.primaryColor,
            borderRadius: '3px 3px 0 0'
          }} />
        )}
      </button>
    );
  };

  const SidebarContent = (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: theme.colors.surface,
        display: 'flex',
        flexDirection: 'column',
        color: theme.colors.text,
        fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        borderLeft: isSidebar ? `1px solid ${theme.colors.border}` : 'none'
      }}
    >
      {/* Header Area */}
      <div style={{
        padding: '20px 16px 16px',
        background: `linear-gradient(to bottom, ${theme.colors.background}, ${theme.colors.surface})`,
        borderBottom: `1px solid ${theme.colors.border}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${theme.primaryColor}40`
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, letterSpacing: '-0.3px' }}>AI 智能助手</h2>
              <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                {capabilities.reasoning && <span style={{ fontSize: '9px', padding: '1px 5px', background: `${theme.primaryColor}20`, color: theme.primaryColor, borderRadius: '4px', fontWeight: 600 }}>REASONING</span>}
                {capabilities.imageGen && <span style={{ fontSize: '9px', padding: '1px 5px', background: `${theme.accentColor}20`, color: theme.accentColor, borderRadius: '4px', fontWeight: 600 }}>IMAGE</span>}
              </div>
            </div>
          </div>
          {!isSidebar && (
            <button onClick={toggleOpen} style={{ background: 'transparent', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          background: theme.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
          padding: '4px',
          borderRadius: '14px'
        }}>
          {renderTabButton('general', <MessageSquareText />, '对话')}
          {renderTabButton('improve', <Wand2 />, '重写')}
          {renderTabButton('slides', <BrainCircuit />, '大纲')}
          {renderTabButton('translate', <TranslateIcon />, '翻译')}
          {renderTabButton('suggest', <Sparkle />, '灵感')}
          {renderTabButton('settings', <Settings />, '设置')}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Input Card */}
        {activeTab !== 'settings' && (
          <div style={{
            background: theme.colors.background,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.border}`,
            padding: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.6 }}>
              <MousePointer2 size={12} />
              <span style={{ fontSize: '11px', fontWeight: 600 }}>当前选区或输入内容</span>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="在这里输入内容，或直接使用文档中选中的文本..."
              style={{
                width: '100%',
                minHeight: '100px',
                border: 'none',
                background: 'transparent',
                color: theme.colors.text,
                fontSize: '14px',
                lineHeight: '1.6',
                outline: 'none',
                resize: 'vertical'
              }}
            />
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '8px', 
              marginTop: '12px',
              paddingTop: '12px',
              borderTop: `1px solid ${theme.colors.border}50`
            }}>
              {activeTab === 'general' && (
                <>
                  <button onClick={handleSummarize} disabled={loading} style={{ 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    background: theme.primaryColor, 
                    color: 'white', 
                    border: 'none', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    cursor: 'pointer',
                    boxShadow: `0 4px 10px ${theme.primaryColor}30`
                  }}>总结内容</button>
                  <button onClick={handleExtractKeyPoints} disabled={loading} style={{ 
                    padding: '8px 16px', 
                    borderRadius: '10px', 
                    background: `${theme.primaryColor}20`, 
                    color: theme.primaryColor, 
                    border: 'none', 
                    fontSize: '12px', 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}>提取重点</button>
                  {capabilities.imageGen && (
                    <button onClick={handleGenerateImage} disabled={loading} style={{ 
                      padding: '8px 12px', 
                      borderRadius: '10px', 
                      background: `${theme.accentColor}20`, 
                      color: theme.accentColor, 
                      border: 'none', 
                      fontSize: '12px', 
                      fontWeight: 600, 
                      cursor: 'pointer' 
                    }}><ImageIcon size={16} /></button>
                  )}
                </>
              )}
              {activeTab === 'improve' && (
                <button onClick={handleImprove} disabled={loading} style={{ padding: '8px 20px', borderRadius: '10px', background: theme.primaryColor, color: 'white', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>智能润色</button>
              )}
              {activeTab === 'slides' && (
                <button onClick={handleGenerateSlides} disabled={loading} style={{ padding: '8px 20px', borderRadius: '10px', background: theme.primaryColor, color: 'white', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>生成大纲</button>
              )}
              {activeTab === 'translate' && (
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <select 
                    value={targetLanguage} 
                    onChange={(e) => setTargetLanguage(e.target.value as any)}
                    style={{ flex: 1, padding: '8px', borderRadius: '10px', background: theme.colors.background, border: `1px solid ${theme.colors.border}`, color: theme.colors.text, fontSize: '12px' }}
                  >
                    <option value="zh">翻译为 中文</option>
                    <option value="en">Translate to English</option>
                  </select>
                  <button onClick={handleTranslate} disabled={loading} style={{ padding: '8px 20px', borderRadius: '10px', background: theme.primaryColor, color: 'white', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>执行翻译</button>
                </div>
              )}
              {activeTab === 'suggest' && (
                <button onClick={handleSuggest} disabled={loading} style={{ padding: '8px 20px', borderRadius: '10px', background: theme.primaryColor, color: 'white', border: 'none', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>获取建议</button>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
            <div className="pulse-loader" style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${theme.primaryColor}, transparent)`,
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            <span style={{ fontSize: '13px', fontWeight: 500, opacity: 0.6 }}>AI 正在构思中...</span>
          </div>
        )}

        {/* Result Area */}
        {response && !loading && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: theme.colors.textSecondary }}>AI 响应结果</span>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {extractImageUrls(response.content).length > 0 && (
                  <button onClick={handleDownloadImage} style={{ padding: '6px', borderRadius: '8px', background: `${theme.accentColor}20`, border: 'none', color: theme.accentColor, cursor: 'pointer' }} title="下载图片">
                    <ImageIcon size={16} />
                  </button>
                )}
                <button onClick={handleTTS} style={{ padding: '6px', borderRadius: '8px', background: isSpeaking ? `${theme.primaryColor}20` : 'transparent', border: 'none', color: isSpeaking ? theme.primaryColor : theme.colors.textSecondary, cursor: 'pointer' }} title="朗读">
                  <Volume2 size={16} />
                </button>
                <button onClick={() => navigator.clipboard.writeText(response.content)} style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', color: theme.colors.textSecondary, cursor: 'pointer' }} title="复制">
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div style={{
              background: theme.colors.background,
              borderRadius: '20px',
              padding: '16px',
              border: `1px solid ${theme.colors.border}`,
              lineHeight: '1.7',
              fontSize: '14px',
              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)'
            }}>
              <div className="markdown-body" style={{ color: theme.colors.text }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ node, ...props }) => (
                      <div style={{ position: 'relative', marginTop: '12px', display: 'flex', justifyContent: 'center' }}>
                        <div style={{ position: 'relative', maxWidth: '100%' }}>
                          <img 
                            {...props} 
                            onClick={() => setPreviewImage(props.src || null)}
                            style={{ maxWidth: '100%', borderRadius: '12px', cursor: 'zoom-in', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'block' }} 
                          />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '8px', color: 'white', cursor: 'pointer' }} onClick={() => setPreviewImage(props.src || null)}>
                            <Maximize2 size={14} />
                          </div>
                        </div>
                      </div>
                    )
                  }}
                >
                  {response.content}
                </ReactMarkdown>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px', paddingTop: '16px', borderTop: `1px solid ${theme.colors.border}50` }}>
                <button onClick={handleApplyResponse} style={{ 
                  flex: 1, 
                  padding: '10px', 
                  borderRadius: '12px', 
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`, 
                  color: 'white', 
                  border: 'none', 
                  fontSize: '13px', 
                  fontWeight: 700, 
                  cursor: 'pointer' 
                }}>应用到文档</button>
                <button onClick={() => setResponse(null)} style={{ 
                  padding: '10px 16px', 
                  borderRadius: '12px', 
                  background: theme.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', 
                  color: theme.colors.textSecondary, 
                  border: 'none', 
                  fontSize: '13px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}><RotateCcw size={16} /></button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ background: `${theme.primaryColor}08`, padding: '16px', borderRadius: '16px', border: `1px dashed ${theme.primaryColor}40` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Info size={14} color={theme.primaryColor} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.primaryColor }}>配置说明</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, lineHeight: '1.5' }}>
                配置您的 AI 模型 API 信息。建议使用支持生图能力的自定义端点以获得最佳体验。
              </p>
            </div>

            {[
              { label: '服务提供商', key: 'provider', type: 'select', options: ['openai', 'anthropic', 'ollama', 'custom'] },
              { label: '对话模型', key: 'model', type: 'text', placeholder: '如: gpt-4o' },
              { label: '绘图模型', key: 'imageModel', type: 'text', placeholder: '如: dall-e-3' },
              { label: 'API Key', key: 'apiKey', type: 'password', placeholder: 'sk-...' },
              { label: 'API 代理地址', key: 'baseURL', type: 'text', placeholder: 'https://...' }
            ].map((field) => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, opacity: 0.6, paddingLeft: '4px' }}>{field.label}</label>
                {field.type === 'select' ? (
                  <select 
                    value={config.provider} 
                    onChange={(e) => setConfig(prev => ({ ...prev, provider: e.target.value as any }))}
                    style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.text, fontSize: '14px', outline: 'none' }}
                  >
                    {field.options?.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                  </select>
                ) : (
                  <input 
                    type={field.type}
                    value={(config as any)[field.key] || ''} 
                    onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    style={{ padding: '12px', borderRadius: '12px', border: `1px solid ${theme.colors.border}`, background: theme.colors.background, color: theme.colors.text, fontSize: '14px', outline: 'none' }}
                  />
                )}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  setStorageItem(storageKeys.AI_CONFIG, config);
                  aiService.updateConfig(config);
                  alert('✅ 配置已保存');
                }}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: theme.primaryColor, color: 'white', border: 'none', fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Save size={18} /> 保存配置
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  try {
                    await aiService.request({ prompt: 'hi', maxTokens: 5 });
                    alert('✨ 连通性测试成功！');
                  } catch (e) {
                    alert(`❌ 测试失败: ${(e as Error).message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{ padding: '12px 20px', borderRadius: '12px', background: `${theme.colors.text}10`, color: theme.colors.text, border: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >测试</button>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.2; }
          100% { transform: scale(0.8); opacity: 0.5; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .pulse-loader {
          box-shadow: 0 0 20px ${theme.primaryColor}40;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; borderRadius: 10px; }
      `}</style>

      {/* Preview Modal */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out', padding: '40px' }}
        >
          <img src={previewImage} style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: '12px', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} />
          <button style={{ position: 'absolute', top: '24px', right: '24px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );

  if (isSidebar) return SidebarContent;

  return (
    <>
      {effectiveIsOpen && (
        <>
          <div onClick={toggleOpen} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', zIndex: 3000 }} />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '420px',
            height: '80vh',
            maxHeight: '700px',
            zIndex: 3001,
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {SidebarContent}
          </div>
        </>
      )}
    </>
  );
};
