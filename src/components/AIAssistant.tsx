import React, { useState, useEffect } from 'react';
import { aiService, DEFAULT_AI_CONFIG } from '../services/ai';
import { AIResponse, AIServiceConfig } from '../types/ai';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Sparkles, Wand2, List, FileText, Settings, X, Send, Check, Languages, Volume2, Zap, Info, Save, Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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

  // 监听存储变化（用于彩蛋触发后的自动同步）
  useEffect(() => {
    const handleStorageChange = () => {
      const latestConfig = getStorageItem<AIServiceConfig>(storageKeys.AI_CONFIG, DEFAULT_AI_CONFIG);
      setConfig(latestConfig);
      aiService.updateConfig(latestConfig);
    };

    window.addEventListener('storage', handleStorageChange);
    // 同时也监听自定义事件，因为 setStorageItem 可能不会触发当前窗口的 storage 事件
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
    setResponse(null); // 清除旧响应
    try {
      // 确保服务使用最新配置
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

  const handleSummarize = () => {
    handleAIRequest(`请对以下文本进行简明扼要的总结：\n\n${inputText.substring(0, 2000)}`);
  };

  const handleGenerateImage = () => {
    handleAIRequest(inputText.substring(0, 500), 'image');
  };

  const handleImprove = () => {
    handleAIRequest(`请改进以下文本的表达，使其更清晰、更专业：\n\n${inputText.substring(0, 2000)}`);
  };

  const handleExtractKeyPoints = () => {
    handleAIRequest(`请从以下文本中提取关键点，并以要点形式列出：\n\n${inputText.substring(0, 2000)}`);
  };

  const handleGenerateSlides = () => {
    handleAIRequest(`请将以下内容转换为幻灯片大纲，每张幻灯片应包含标题和要点：\n\n${inputText.substring(0, 2000)}`);
  };

  const handleTranslate = () => {
    handleAIRequest(`请将以下文本翻译成${targetLanguage === 'zh' ? '中文' : '英文'}：\n\n${inputText.substring(0, 2000)}`);
  };

  const handleSuggest = () => {
    handleAIRequest(`请针对以下幻灯片内容，提供演讲建议（包括节奏控制、重点强调和互动建议）：\n\n${inputText.substring(0, 2000)}`);
  };

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

  const renderTabButton = (tab: typeof activeTab, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      style={{
        padding: isSidebar ? '10px 8px' : '12px 16px',
        border: 'none',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 500,
        color: activeTab === tab ? theme.primaryColor : theme.colors.textSecondary,
        display: 'flex',
        flexDirection: isSidebar ? 'column' : 'row',
        alignItems: 'center',
        gap: isSidebar ? '4px' : '8px',
        borderBottom: !isSidebar && activeTab === tab ? `2px solid ${theme.primaryColor}` : '2px solid transparent',
        background: isSidebar && activeTab === tab ? theme.colors.background : 'transparent',
        borderRadius: isSidebar ? '8px' : '0',
        flex: isSidebar ? 1 : 'none'
      }}
    >
      {icon}
      <span style={{ fontSize: isSidebar ? '10px' : '13px' }}>{label}</span>
    </button>
  );

  const content = (
    <>
      <div
        className={`ai-assistant-${isSidebar ? 'sidebar' : 'modal'}`}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.colors.surface,
          borderRadius: isSidebar ? '0' : '12px',
          boxShadow: isSidebar ? 'none' : '0 20px 50px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: theme.colors.text,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
      <div
        className="ai-assistant-header"
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: theme.colors.background
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color={theme.primaryColor} />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: theme.colors.text }}>AI 助手</h2>
          
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            {capabilities.reasoning && <span title="推理能力" style={{ fontSize: '10px', padding: '1px 4px', background: theme.theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', color: theme.theme === 'dark' ? '#a5b4fc' : '#4338ca', borderRadius: '4px' }}>推理</span>}
            {capabilities.toolUse && <span title="工具调用" style={{ fontSize: '10px', padding: '1px 4px', background: theme.theme === 'dark' ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', color: theme.theme === 'dark' ? '#86efac' : '#166534', borderRadius: '4px' }}>工具</span>}
            {capabilities.imageGen && <span title="图像生成" style={{ fontSize: '10px', padding: '1px 4px', background: theme.theme === 'dark' ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3', color: theme.theme === 'dark' ? '#fde047' : '#854d0e', borderRadius: '4px' }}>绘图</span>}
          </div>
        </div>
        {!isSidebar && (
          <button
            onClick={toggleOpen}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="ai-assistant-tabs" style={{ 
        display: 'flex', 
        borderBottom: `1px solid ${theme.colors.border}`, 
        padding: '0 8px',
        overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {renderTabButton('general', <FileText size={isSidebar ? 16 : 18} />, '通用')}
        {renderTabButton('improve', <Wand2 size={isSidebar ? 16 : 18} />, '优化')}
        {renderTabButton('slides', <List size={isSidebar ? 16 : 18} />, '生成')}
        {renderTabButton('translate', <Languages size={isSidebar ? 16 : 18} />, '翻译')}
        {renderTabButton('suggest', <Info size={isSidebar ? 16 : 18} />, '建议')}
        {renderTabButton('settings', <Settings size={isSidebar ? 16 : 18} />, '设置')}
      </div>

      <div
        className="ai-assistant-content"
        style={{
          padding: '12px',
          overflowY: 'auto',
          flex: 1
        }}
      >
        {activeTab === 'general' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={isSidebar ? 6 : 4}
                placeholder="输入文本或使用当前文档内容..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  resize: 'vertical',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSummarize}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: theme.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1
                }}
              >
                总结文本
              </button>
              <button
                onClick={handleExtractKeyPoints}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: theme.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  opacity: loading ? 0.7 : 1
                }}
              >
                提取要点
              </button>
              {capabilities.generateImages && (
                <button
                  onClick={handleGenerateImage}
                  disabled={loading}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: theme.accentColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 500,
                    opacity: loading ? 0.7 : 1
                  }}
                >
                  AI 生图
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'improve' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={isSidebar ? 6 : 4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>
            <button
              onClick={handleImprove}
              disabled={loading}
              style={{
                padding: '6px 12px',
                backgroundColor: theme.theme === 'dark' ? '#059669' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                opacity: loading ? 0.7 : 1
              }}
            >
              改进文本
            </button>
          </div>
        )}

        {activeTab === 'slides' && (
          <div>
            <div style={{ marginBottom: '12px' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={isSidebar ? 6 : 4}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '8px',
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>
            <button
              onClick={handleGenerateSlides}
              disabled={loading}
              style={{
                padding: '6px 12px',
                backgroundColor: theme.theme === 'dark' ? '#7c3aed' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500,
                opacity: loading ? 0.7 : 1
              }}
            >
              生成幻灯片大纲
            </button>
          </div>
        )}

        {activeTab === 'translate' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={isSidebar ? 6 : 4}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: theme.colors.textSecondary }}>目标语言:</span>
              <select 
                value={targetLanguage} 
                onChange={(e) => setTargetLanguage(e.target.value as 'zh' | 'en')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${theme.colors.border}`,
                  fontSize: '12px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
            <button
              onClick={handleTranslate}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: theme.primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '翻译中...' : '开始翻译'}
            </button>
          </div>
        )}

        {activeTab === 'suggest' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={isSidebar ? 6 : 4}
              style={{
                width: '100%',
                padding: '8px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                fontSize: '13px',
                backgroundColor: theme.colors.background,
                color: theme.colors.text
              }}
            />
            <button
              onClick={handleSuggest}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: theme.primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '生成中...' : '获取演讲建议'}
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>提供商</label>
              <select 
                value={config.provider} 
                onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px', 
                  border: `1px solid ${theme.colors.border}`, 
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="local">Custom / Mock</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>对话模型名称</label>
              <input 
                type="text" 
                value={config.model || ''} 
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="例如: gpt-3.5-turbo"
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px', 
                  border: `1px solid ${theme.colors.border}`, 
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>图片模型名称</label>
              <input 
                type="text" 
                value={config.imageModel || ''} 
                onChange={(e) => setConfig({ ...config, imageModel: e.target.value })}
                placeholder="例如: dall-e-3"
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px', 
                  border: `1px solid ${theme.colors.border}`, 
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>API 密钥</label>
              <input 
                type="password" 
                value={config.apiKey || ''} 
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="输入您的 API Key"
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px', 
                  border: `1px solid ${theme.colors.border}`, 
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: theme.colors.textSecondary, fontWeight: 600 }}>API 端点 (可选)</label>
              <input 
                type="text" 
                value={config.baseURL || ''} 
                onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
                placeholder="默认: https://api.openai.com/v1"
                style={{ 
                  padding: '8px', 
                  borderRadius: '6px', 
                  border: `1px solid ${theme.colors.border}`, 
                  fontSize: '13px',
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  setStorageItem(storageKeys.AI_CONFIG, config);
                  aiService.updateConfig(config);
                  alert('配置已保存！');
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  backgroundColor: theme.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Save size={14} />
                保存
              </button>
              <button
                onClick={async () => {
                  setLoading(true);
                  setResponse(null);
                  let chatStatus = '未测试';
                  let imageStatus = '未配置';
                  let combinedContent = '';

                  try {
                    aiService.updateConfig(config);
                    
                    // 1. 测试对话模型
                    const chatPromise = (async () => {
                      try {
                        const res = await aiService.request({ 
                          prompt: '请回复：对话模型测试成功',
                          maxTokens: 20,
                          type: 'chat'
                        });
                        chatStatus = '✅ 成功';
                        return `### 💬 对话模型测试\n状态：${chatStatus}\n结果：${res.content}\n\n`;
                      } catch (e) {
                        chatStatus = '❌ 失败';
                        return `### 💬 对话模型测试\n状态：${chatStatus}\n原因：${(e as Error).message}\n\n`;
                      }
                    })();

                    // 2. 测试图片模型 (如果已配置)
                    const imagePromise = (async () => {
                      if (config.imageModel) {
                        try {
                          const res = await aiService.request({ 
                            prompt: 'A simple test icon',
                            type: 'image'
                          });
                          imageStatus = '✅ 成功';
                          return `### 🎨 图片模型测试\n状态：${imageStatus}\n结果：${res.content}`;
                        } catch (e) {
                          imageStatus = '❌ 失败';
                          return `### 🎨 图片模型测试\n状态：${imageStatus}\n原因：${(e as Error).message}`;
                        }
                      }
                      return `### 🎨 图片模型测试\n状态：${imageStatus}`;
                    })();

                    // 并行执行
                    const results = await Promise.all([chatPromise, imagePromise]);
                    combinedContent = results.join('');
                    
                    setResponse({
                      content: combinedContent,
                      model: 'Test Suite'
                    });

                    alert(`测试完成！\n对话模型: ${chatStatus}\n图片模型: ${imageStatus}`);
                  } catch (error) {
                    alert(`测试流程发生错误: ${(error as Error).message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{
                  padding: '8px',
                  backgroundColor: theme.theme === 'dark' ? '#059669' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  opacity: loading ? 0.7 : 1
                }}
              >
                测试
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: theme.colors.textSecondary }}>AI 正在思考中...</div>
            <div className="spinner" style={{ marginTop: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: `2px solid ${theme.colors.border}`,
                borderTop: `2px solid ${theme.primaryColor}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'inline-block'
              }}></div>
            </div>
          </div>
        )}

        {response && !loading && (
          <div style={{ marginTop: '16px', borderTop: `1px solid ${theme.colors.border}`, paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>响应结果:</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleTTS}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSpeaking ? theme.primaryColor : theme.colors.textSecondary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}
                >
                  <Volume2 size={14} />
                  {isSpeaking ? '停止' : '播放'}
                </button>
              </div>
            </div>
            <div
              style={{
                padding: '10px',
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '8px',
                maxHeight: isSidebar ? '300px' : '400px',
                overflowY: 'auto',
                fontSize: '13px',
                lineHeight: '1.6',
                color: theme.colors.text
              }}
            >
              <div className="markdown-body">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    img: ({ node, ...props }) => (
                      <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
                        <img 
                          {...props} 
                          onClick={() => setPreviewImage(props.src || null)}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px',
                            height: 'auto', 
                            display: 'block', 
                            cursor: 'zoom-in',
                            borderRadius: '8px',
                            objectFit: 'contain'
                          }} 
                          title="点击放大预览，右键另存下载"
                        />
                        <div 
                          onClick={() => setPreviewImage(props.src || null)}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(0,0,0,0.5)',
                            color: 'white',
                            padding: '4px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            opacity: 0.8
                          }}
                        >
                          <Maximize2 size={14} />
                        </div>
                      </div>
                    )
                  }}
                >
                  {response.content}
                </ReactMarkdown>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={handleApplyResponse}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  backgroundColor: theme.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                应用到文档
              </button>
              <button
                onClick={() => setResponse(null)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.textSecondary,
                  border: `1px solid ${theme.colors.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                清除
              </button>
            </div>
          </div>
        )}

        {/* 图片预览 Modal */}
        {previewImage && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '40px',
              cursor: 'zoom-out'
            }}
            onClick={() => setPreviewImage(null)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'white',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              <X size={24} />
            </button>
            <img 
              src={previewImage} 
              alt="Preview" 
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '4px',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                cursor: 'default'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
    </>
  );

  if (isSidebar) {
    return content;
  }

  return (
    <>
      {effectiveIsOpen && (
        <div
          className="ai-assistant-modal-wrapper"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '85vh',
            zIndex: 3001,
          }}
        >
          {content}
        </div>
      )}

      {effectiveIsOpen && (
        <div
          className="ai-assistant-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 3000
          }}
          onClick={toggleOpen}
        ></div>
      )}
    </>
  );
};
