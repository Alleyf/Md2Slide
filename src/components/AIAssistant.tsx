import React, { useState, useEffect } from 'react';
import { aiService } from '../services/ai';
import { AIResponse } from '../types/ai';

interface AIAssistantProps {
  markdownContent: string;
  onContentUpdate: (newContent: string) => void;
  aiConfig?: {
    provider: 'openai' | 'anthropic' | 'ollama' | 'local';
    apiKey?: string;
    model?: string;
    endpoint?: string;
  };
  isOpen?: boolean;
  onClose?: () => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ markdownContent, onContentUpdate, aiConfig, isOpen: externalIsOpen, onClose: externalOnClose }) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState<AIResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'slides' | 'improve' | 'settings'>('general');

  // 决定使用哪个isOpen状态
  const effectiveIsOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const toggleOpen = externalOnClose !== undefined ? externalOnClose : () => setInternalIsOpen(!internalIsOpen);

  useEffect(() => {
    if (markdownContent) {
      setInputText(markdownContent);
    }
  }, [markdownContent]);

  const handleAIRequest = async (prompt: string) => {
    setLoading(true);
    try {
      // 如果提供了AI配置，则更新AI服务配置
      if (aiConfig) {
        aiService.updateConfig({
          provider: aiConfig.provider,
          apiKey: aiConfig.apiKey,
          model: aiConfig.model,
          baseURL: aiConfig.endpoint
        });
      }
      
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

  const handleApplyResponse = () => {
    if (response) {
      onContentUpdate(response.content);
      if (externalOnClose) {
        externalOnClose();
      } else {
        setInternalIsOpen(false);
      }
    }
  };

  return (
    <>
      {!externalIsOpen && (
        <button
          onClick={() => {
            if (externalOnClose) {
              externalOnClose();
            } else {
              setInternalIsOpen(!internalIsOpen);
            }
          }}
          className="ai-assistant-toggle"
          title="AI 助手"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          💡
        </button>
      )}

      {effectiveIsOpen && (
        <div
          className="ai-assistant-modal"
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxWidth: '800px',
            maxHeight: '80vh',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            className="ai-assistant-header"
            style={{
              padding: '16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h2 style={{ margin: 0 }}>AI 助手</h2>
            <button
              onClick={toggleOpen}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          </div>

          <div className="ai-assistant-tabs" style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
            <button
              className={activeTab === 'general' ? 'active-tab' : ''}
              onClick={() => setActiveTab('general')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: activeTab === 'general' ? '#f3f4f6' : 'transparent',
                cursor: 'pointer'
              }}
            >
              通用功能
            </button>
            <button
              className={activeTab === 'improve' ? 'active-tab' : ''}
              onClick={() => setActiveTab('improve')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: activeTab === 'improve' ? '#f3f4f6' : 'transparent',
                cursor: 'pointer'
              }}
            >
              内容优化
            </button>
            <button
              className={activeTab === 'slides' ? 'active-tab' : ''}
              onClick={() => setActiveTab('slides')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: activeTab === 'slides' ? '#f3f4f6' : 'transparent',
                cursor: 'pointer'
              }}
            >
              幻灯片生成
            </button>
            <button
              className={activeTab === 'settings' ? 'active-tab' : ''}
              onClick={() => setActiveTab('settings')}
              style={{
                flex: 1,
                padding: '12px',
                border: 'none',
                backgroundColor: activeTab === 'settings' ? '#f3f4f6' : 'transparent',
                cursor: 'pointer'
              }}
            >
              AI设置
            </button>
          </div>

          <div
            className="ai-assistant-content"
            style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1
            }}
          >
            {activeTab === 'general' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="ai-input" style={{ display: 'block', marginBottom: '8px' }}>
                    输入文本:
                  </label>
                  <textarea
                    id="ai-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleSummarize}
                    disabled={loading}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    总结文本
                  </button>
                  <button
                    onClick={handleExtractKeyPoints}
                    disabled={loading}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    提取要点
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'improve' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="improve-input" style={{ display: 'block', marginBottom: '8px' }}>
                    需要改进的文本:
                  </label>
                  <textarea
                    id="improve-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleImprove}
                    disabled={loading}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    改进文本
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'slides' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="slides-input" style={{ display: 'block', marginBottom: '8px' }}>
                    论文或文档内容:
                  </label>
                  <textarea
                    id="slides-input"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleGenerateSlides}
                    disabled={loading}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#8b5cf6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    生成幻灯片大纲
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>AI 配置测试</h3>
                  <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#6b7280' }}>
                    测试当前的AI配置是否有效
                  </p>
                  <button
                    onClick={async () => {
                      setLoading(true);
                      try {
                        // 如果提供了AI配置，则更新AI服务配置
                        if (aiConfig) {
                          aiService.updateConfig({
                            provider: aiConfig.provider,
                            apiKey: aiConfig.apiKey,
                            model: aiConfig.model,
                            baseURL: aiConfig.endpoint
                          });
                        }
                        
                        const result = await aiService.request({ 
                          prompt: '请回复：AI配置测试成功',
                          maxTokens: 20
                        });
                        
                        setResponse(result);
                        alert('AI配置测试成功！');
                      } catch (error) {
                        console.error('AI配置测试失败:', error);
                        alert('AI配置测试失败，请检查配置信息');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={loading}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    🧪 一键测试AI配置
                  </button>
                </div>
                
                <div style={{ marginTop: '20px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>当前配置</h3>
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    <p style={{ margin: '0 0 8px 0' }}><strong>提供商:</strong> {aiConfig?.provider || '未设置'}</p>
                    <p style={{ margin: '0 0 8px 0' }}><strong>模型:</strong> {aiConfig?.model || '未设置'}</p>
                    <p style={{ margin: '0 0 8px 0' }}><strong>端点:</strong> {aiConfig?.endpoint || '默认'}</p>
                    <p style={{ margin: '0 0 0 0' }}><strong>API密钥:</strong> {aiConfig?.apiKey ? '已设置' : '未设置'}</p>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div>AI 正在思考中...</div>
                <div className="spinner" style={{ marginTop: '10px', textAlign: 'center' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid #f3f4f6',
                    borderTop: '2px solid #3b82f6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    display: 'inline-block',
                    marginLeft: '10px'
                  }}></div>
                </div>
              </div>
            )}

            {response && !loading && (
              <div style={{ marginTop: '16px' }}>
                <h3>AI 响应:</h3>
                <div
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {response.content}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={handleApplyResponse}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    应用到文档
                  </button>
                  <button
                    onClick={toggleOpen}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    关闭
                  </button>
                </div>
              </div>
            )}
          </div>
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
            zIndex: 1000
          }}
          onClick={toggleOpen}
        ></div>
      )}

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .ai-assistant-toggle:hover {
            background-color: #4338ca;
          }
          .active-tab {
            border-bottom: 2px solid #4f46e5;
          }
        `}
      </style>
    </>
  );
};