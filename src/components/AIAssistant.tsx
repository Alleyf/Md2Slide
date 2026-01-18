import React, { useState, useEffect } from 'react';
import { aiService, DEFAULT_AI_CONFIG } from '../services/ai';
import { AIResponse, AIServiceConfig } from '../types/ai';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';
import { Sparkles, Wand2, List, FileText, Settings, X, Send, Check, Languages, Volume2, Zap, Info, Save } from 'lucide-react';

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
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'improve' | 'slides' | 'translate' | 'suggest' | 'settings'>('general');
  const [inputText, setInputText] = useState(editorContent);
  const [targetLanguage, setTargetLanguage] = useState<'zh' | 'en'>('zh');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // AI 配置状态
  const [config, setConfig] = useState<AIServiceConfig>(() => {
    return getStorageItem<AIServiceConfig>(storageKeys.AI_CONFIG, DEFAULT_AI_CONFIG);
  });

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

  const handleAIRequest = async (prompt: string) => {
    setLoading(true);
    try {
      // 确保服务使用最新配置
      aiService.updateConfig(config);
      const result = await aiService.request({ prompt });
      setResponse(result);
    } catch (error) {
      console.error('AI request failed:', error);
      setResponse({
        content: 'AI服务暂时不可用，请稍后再试。',
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
        color: activeTab === tab ? '#4f46e5' : '#6b7280',
        display: 'flex',
        flexDirection: isSidebar ? 'column' : 'row',
        alignItems: 'center',
        gap: isSidebar ? '4px' : '8px',
        borderBottom: !isSidebar && activeTab === tab ? '2px solid #4f46e5' : '2px solid transparent',
        background: isSidebar && activeTab === tab ? '#f3f4f6' : 'transparent',
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
          backgroundColor: 'white',
          borderRadius: isSidebar ? '0' : '12px',
          boxShadow: isSidebar ? 'none' : '0 20px 50px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
      >
      <div
        className="ai-assistant-header"
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f9fafb'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#4f46e5" />
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#111827' }}>AI 助手</h2>
          
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            {capabilities.reasoning && <span title="推理能力" style={{ fontSize: '10px', padding: '1px 4px', background: '#e0e7ff', color: '#4338ca', borderRadius: '4px' }}>推理</span>}
            {capabilities.toolUse && <span title="工具调用" style={{ fontSize: '10px', padding: '1px 4px', background: '#dcfce7', color: '#166534', borderRadius: '4px' }}>工具</span>}
            {capabilities.imageGen && <span title="图像生成" style={{ fontSize: '10px', padding: '1px 4px', background: '#fef9c3', color: '#854d0e', borderRadius: '4px' }}>绘图</span>}
          </div>
        </div>
        {!isSidebar && (
          <button
            onClick={toggleOpen}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
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
        borderBottom: '1px solid #f3f4f6', 
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
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleSummarize}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                总结文本
              </button>
              <button
                onClick={handleExtractKeyPoints}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500
                }}
              >
                提取要点
              </button>
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
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
              />
            </div>
            <button
              onClick={handleImprove}
              disabled={loading}
              style={{
                padding: '6px 12px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500
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
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '13px'
                }}
              />
            </div>
            <button
              onClick={handleGenerateSlides}
              disabled={loading}
              style={{
                padding: '6px 12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 500
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
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#4b5563' }}>目标语言:</span>
              <select 
                value={targetLanguage} 
                onChange={(e) => setTargetLanguage(e.target.value as 'zh' | 'en')}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px'
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
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
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
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px'
              }}
            />
            <button
              onClick={handleSuggest}
              disabled={loading}
              style={{
                padding: '8px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600
              }}
            >
              {loading ? '生成中...' : '获取演讲建议'}
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>提供商</label>
              <select 
                value={config.provider} 
                onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              >
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="ollama">Ollama (Local)</option>
                <option value="local">Custom / Mock</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>模型名称</label>
              <input 
                type="text" 
                value={config.model || ''} 
                onChange={(e) => setConfig({ ...config, model: e.target.value })}
                placeholder="例如: gpt-3.5-turbo"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>API 密钥</label>
              <input 
                type="password" 
                value={config.apiKey || ''} 
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="输入您的 API Key"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 600 }}>API 端点 (可选)</label>
              <input 
                type="text" 
                value={config.baseURL || ''} 
                onChange={(e) => setConfig({ ...config, baseURL: e.target.value })}
                placeholder="默认: https://api.openai.com/v1"
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '13px' }}
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
                  backgroundColor: '#4f46e5',
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
                  try {
                    aiService.updateConfig(config);
                    const result = await aiService.request({ 
                      prompt: '请回复：AI配置测试成功',
                      maxTokens: 20
                    });
                    setResponse(result);
                    alert('AI配置测试成功！');
                  } catch (error) {
                    alert(`测试失败: ${(error as Error).message}`);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{
                  padding: '8px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                测试
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>AI 正在思考中...</div>
            <div className="spinner" style={{ marginTop: '8px' }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #f3f4f6',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                display: 'inline-block'
              }}></div>
            </div>
          </div>
        )}

        {response && !loading && (
          <div style={{ marginTop: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>响应结果:</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleTTS}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isSpeaking ? '#4f46e5' : '#6b7280',
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
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                maxHeight: isSidebar ? '300px' : '200px',
                overflowY: 'auto',
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}
            >
              {response.content}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                onClick={handleApplyResponse}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  backgroundColor: '#3b82f6',
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
                  backgroundColor: '#f3f4f6',
                  color: '#4b5563',
                  border: '1px solid #e5e7eb',
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
