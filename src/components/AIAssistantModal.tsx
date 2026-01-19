import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Volume2, 
  Copy, 
  RotateCcw, 
  Settings, 
  MessageSquareText,
  Wand2,
  BrainCircuit,
  Languages as TranslateIcon,
  Sparkle,
  History,
  Info,
  Minus
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { aiService, DEFAULT_AI_CONFIG } from '../services/ai';
import { AIResponse, AIServiceConfig } from '../types/ai';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorContent: string;
  onContentUpdate: (newContent: string) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ 
  isOpen, 
  onClose, 
  editorContent, 
  onContentUpdate 
}) => {
  const { themeConfig: theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'chat' | 'improve' | 'outline' | 'translate' | 'suggest' | 'settings'>('chat');
  const [inputText, setInputText] = useState(editorContent);
  const [targetLanguage, setTargetLanguage] = useState<'zh' | 'en'>('zh');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // 初始化时更新服务配置
  useEffect(() => {
    aiService.updateConfig(config);
  }, []);

  // 滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText]);

  // 模拟流式输出
  const simulateStreaming = (fullText: string) => {
    setIsStreaming(true);
    setStreamingText('');
    
    const words = fullText.split('');
    let currentIndex = 0;
    
    const streamNextChunk = () => {
      if (currentIndex < words.length) {
        const chunkSize = Math.floor(Math.random() * 3) + 1; // 每次输出1-3个字符
        const nextIndex = Math.min(currentIndex + chunkSize, words.length);
        const chunk = words.slice(currentIndex, nextIndex).join('');
        setStreamingText(prev => prev + chunk);
        currentIndex = nextIndex;
        
        streamingTimeoutRef.current = setTimeout(streamNextChunk, 30 + Math.random() * 50); // 随机延迟
      } else {
        setIsStreaming(false);
      }
    };
    
    streamNextChunk();
  };

  // 发送消息
  const sendMessage = async (prompt: string, type: 'chat' | 'command' = 'chat') => {
    if (!prompt.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentInput('');
    setLoading(true);

    try {
      // 模拟AI响应 - 实际项目中应替换为真实的AI API调用
      let responseContent = '';

      switch (type) {
        case 'chat':
          responseContent = `这是AI助手对您问题"${prompt}"的回答。AI助手正在模拟流式输出功能，逐字逐句地展示回答内容，提供更加自然和实时的交互体验。`;
          break;
        case 'command':
          if (activeTab === 'improve') {
            responseContent = `以下是改进后的内容：

${prompt}

经过AI优化，这段文本现在更加清晰、专业，结构也得到了改善。`;
          } else if (activeTab === 'outline') {
            responseContent = `## 幻灯片大纲

1. **引言**
   - 概述主题
   - 目标受众

2. **核心内容**
   - 主要观点
   - 支持论据

3. **结论**
   - 总结要点
   - 行动呼吁`;
          } else if (activeTab === 'translate') {
            responseContent = `以下是翻译后的内容：

${prompt}

已成功翻译为${targetLanguage === 'zh' ? '中文' : 'English'}。`;
          } else if (activeTab === 'suggest') {
            responseContent = `## 创意建议

- **角度一**：从用户需求出发，关注用户体验
- **角度二**：利用数据驱动决策，提升效率
- **角度三**：注重创新思维，突破传统框架`;
          }
          break;
        default:
          responseContent = `AI助手收到您的请求："${prompt}"。正在处理中...`;
      }

      // 模拟真实API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      // 开始流式输出
      simulateStreaming(responseContent);
      
      // 完成流式输出后，添加到消息列表
      setTimeout(() => {
        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: responseContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setStreamingText('');
      }, responseContent.length * 40); // 根据内容长度估算总时间
      
    } catch (error) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `### ❌ AI 服务请求失败

**原因**：${(error as Error).message || '未知错误'}

请检查配置或稍后再试。`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // 处理发送
  const handleSend = () => {
    let prompt = currentInput.trim();
    if (!prompt) return;

    // 根据当前标签页添加特定的提示
    if (activeTab === 'improve') {
      prompt = `请改进以下文本的表达，使其更清晰、更专业：\n\n${prompt.substring(0, 2000)}`;
    } else if (activeTab === 'outline') {
      prompt = `请将以下内容转换为幻灯片大纲，每张幻灯片应包含标题和要点：\n\n${prompt.substring(0, 2000)}`;
    } else if (activeTab === 'translate') {
      prompt = `请将以下文本翻译成${targetLanguage === 'zh' ? '中文' : '英文'}：\n\n${prompt.substring(0, 2000)}`;
    } else if (activeTab === 'suggest') {
      prompt = `请针对以下内容，提供创意建议（包括角度、思路和实施方法）：\n\n${prompt.substring(0, 2000)}`;
    }

    sendMessage(prompt, 'command');
  };

  // 处理回车发送
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 清空对话
  const clearChat = () => {
    setMessages([]);
    setStreamingText('');
  };

  // 应用AI生成的内容到编辑器
  const applyToEditor = () => {
    if (messages.length > 0) {
      const lastAssistantMessage = [...messages].reverse().find(msg => msg.role === 'assistant');
      if (lastAssistantMessage) {
        onContentUpdate(lastAssistantMessage.content);
        onClose();
      }
    }
  };

  // 文本转语音
  const handleTTS = () => {
    const textToSpeak = streamingText || (messages.length > 0 ? 
      [...messages].reverse().find(msg => msg.role === 'assistant')?.content || '' : '');
    
    if (!textToSpeak) return;
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLanguage === 'zh' ? 'zh-CN' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 渲染标签按钮
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

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        zIndex: 4000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '90%',
          maxWidth: '800px',
          height: '80vh',
          maxHeight: '700px',
          backgroundColor: theme.colors.surface,
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          color: theme.colors.text,
          fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25), 0 18px 36px -18px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          border: `1px solid ${theme.colors.border}`
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          background: `linear-gradient(to bottom, ${theme.colors.surface}, ${theme.colors.background})`,
          borderBottom: `1px solid ${theme.colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 4px 12px ${theme.primaryColor}40`
            }}>
              <Sparkles size={18} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>AI 智能助手</h2>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme.colors.textSecondary,
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.border;
                e.currentTarget.style.color = theme.colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = theme.colors.textSecondary;
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          padding: '0 16px',
          margin: '12px 0'
        }}>
          <div style={{ 
            display: 'flex', 
            gap: '2px',
            background: theme.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
            padding: '4px',
            borderRadius: '14px',
            width: 'fit-content'
          }}>
            {renderTabButton('chat', <MessageSquareText />, '对话')}
            {renderTabButton('improve', <Wand2 />, '润色')}
            {renderTabButton('outline', <BrainCircuit />, '大纲')}
            {renderTabButton('translate', <TranslateIcon />, '翻译')}
            {renderTabButton('suggest', <Sparkle />, '建议')}
            {renderTabButton('settings', <Settings />, '设置')}
          </div>
        </div>

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: '0 16px 16px'
        }}>
          {/* Messages Container */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginBottom: '16px',
            padding: '12px',
            background: theme.colors.background,
            borderRadius: '16px',
            border: `1px solid ${theme.colors.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {messages.length === 0 && !isStreaming && (
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: theme.colors.textSecondary,
                padding: '20px'
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '20px',
                  background: `${theme.primaryColor}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}>
                  <Sparkles size={28} color={theme.primaryColor} />
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: theme.colors.text, fontWeight: 600 }}>
                  开始与AI助手对话
                </h3>
                <p style={{ margin: 0, fontSize: '14px', maxWidth: '80%' }}>
                  输入您的问题或选择上方功能，AI助手将为您提供智能化帮助
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: message.role === 'user' 
                    ? theme.accentColor 
                    : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {message.role === 'user' ? (
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white' }} />
                  ) : (
                    <Sparkles size={14} color="white" />
                  )}
                </div>
                <div style={{
                  maxWidth: 'calc(100% - 80px)',
                  padding: '12px 16px',
                  borderRadius: message.role === 'user' 
                    ? '18px 4px 18px 18px' 
                    : '4px 18px 18px 18px',
                  background: message.role === 'user' 
                    ? `${theme.accentColor}20` 
                    : `${theme.primaryColor}10`,
                  color: theme.colors.text
                }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p style={{ margin: '8px 0' }} {...props} />,
                      h1: ({ node, ...props }) => <h1 style={{ margin: '12px 0', fontSize: '1.5em', fontWeight: 'bold' }} {...props} />,
                      h2: ({ node, ...props }) => <h2 style={{ margin: '10px 0', fontSize: '1.3em', fontWeight: 'bold' }} {...props} />,
                      h3: ({ node, ...props }) => <h3 style={{ margin: '8px 0', fontSize: '1.2em', fontWeight: 'bold' }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                      ol: ({ node, ...props }) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ margin: '4px 0' }} {...props} />,
                      code: ({ node, ...props }) => (
                        <code 
                          style={{ 
                            background: theme.colors.surface, 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '0.9em',
                            fontFamily: 'monospace'
                          }} 
                          {...props} 
                        />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre 
                          style={{ 
                            background: theme.colors.surface, 
                            padding: '12px', 
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.9em'
                          }} 
                          {...props} 
                        />
                      )
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {isStreaming && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Sparkles size={14} color="white" />
                </div>
                <div style={{
                  maxWidth: 'calc(100% - 80px)',
                  padding: '12px 16px',
                  borderRadius: '4px 18px 18px 18px',
                  background: `${theme.primaryColor}10`,
                  color: theme.colors.text
                }}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p style={{ margin: '8px 0' }} {...props} />,
                      h1: ({ node, ...props }) => <h1 style={{ margin: '12px 0', fontSize: '1.5em', fontWeight: 'bold' }} {...props} />,
                      h2: ({ node, ...props }) => <h2 style={{ margin: '10px 0', fontSize: '1.3em', fontWeight: 'bold' }} {...props} />,
                      h3: ({ node, ...props }) => <h3 style={{ margin: '8px 0', fontSize: '1.2em', fontWeight: 'bold' }} {...props} />,
                      ul: ({ node, ...props }) => <ul style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                      ol: ({ node, ...props }) => <ol style={{ margin: '8px 0', paddingLeft: '20px' }} {...props} />,
                      li: ({ node, ...props }) => <li style={{ margin: '4px 0' }} {...props} />,
                      code: ({ node, ...props }) => (
                        <code 
                          style={{ 
                            background: theme.colors.surface, 
                            padding: '2px 6px', 
                            borderRadius: '4px',
                            fontSize: '0.9em',
                            fontFamily: 'monospace'
                          }} 
                          {...props} 
                        />
                      ),
                      pre: ({ node, ...props }) => (
                        <pre 
                          style={{ 
                            background: theme.colors.surface, 
                            padding: '12px', 
                            borderRadius: '8px',
                            overflowX: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.9em'
                          }} 
                          {...props} 
                        />
                      )
                    }}
                  >
                    {streamingText}
                  </ReactMarkdown>
                  <div style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '16px',
                    background: theme.primaryColor,
                    marginLeft: '4px',
                    animation: 'blink 1s infinite'
                  }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {(activeTab === 'translate') && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 4px'
              }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.text, whiteSpace: 'nowrap' }}>
                  目标语言:
                </label>
                <select 
                  value={targetLanguage} 
                  onChange={(e) => setTargetLanguage(e.target.value as 'zh' | 'en')}
                  style={{ 
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: theme.colors.text,
                    fontSize: '14px',
                    outline: 'none'
                  }}
                >
                  <option value="zh">中文</option>
                  <option value="en">English</option>
                </select>
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                flex: 1,
                position: 'relative'
              }}>
                <textarea
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    activeTab === 'chat' ? '输入您的问题...' :
                    activeTab === 'improve' ? '输入需要润色的文本...' :
                    activeTab === 'outline' ? '输入需要生成大纲的内容...' :
                    activeTab === 'translate' ? '输入需要翻译的文本...' :
                    activeTab === 'suggest' ? '输入需要获取建议的内容...' :
                    '输入内容...'
                  }
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '14px 50px 14px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${theme.colors.border}`,
                    background: theme.colors.background,
                    color: theme.colors.text,
                    fontSize: '14px',
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                  }}
                  rows={2}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !currentInput.trim()}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: loading ? `${theme.primaryColor}80` : theme.primaryColor,
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: loading || !currentInput.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {loading ? <Minus size={16} /> : <Send size={16} />}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={clearChat}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${theme.colors.border}`,
                    background: 'transparent',
                    color: theme.colors.textSecondary,
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.border;
                    e.currentTarget.style.color = theme.colors.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.colors.textSecondary;
                  }}
                >
                  <RotateCcw size={16} /> 清空
                </button>
                
                {messages.some(m => m.role === 'assistant') && (
                  <button 
                    onClick={handleTTS}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      background: isSpeaking ? `${theme.primaryColor}20` : 'transparent',
                      color: isSpeaking ? theme.primaryColor : theme.colors.textSecondary,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSpeaking) {
                        e.currentTarget.style.background = theme.colors.border;
                        e.currentTarget.style.color = theme.colors.text;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSpeaking) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = theme.colors.textSecondary;
                      }
                    }}
                  >
                    <Volume2 size={16} /> {isSpeaking ? '停止' : '朗读'}
                  </button>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {messages.some(m => m.role === 'assistant') && (
                  <button 
                    onClick={() => navigator.clipboard.writeText(
                      streamingText || [...messages].reverse().find(m => m.role === 'assistant')?.content || ''
                    )}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${theme.colors.border}`,
                      background: 'transparent',
                      color: theme.colors.textSecondary,
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.colors.border;
                      e.currentTarget.style.color = theme.colors.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme.colors.textSecondary;
                    }}
                  >
                    <Copy size={16} /> 复制
                  </button>
                )}
                
                <button 
                  onClick={applyToEditor}
                  disabled={!messages.some(m => m.role === 'assistant')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '10px',
                    background: !messages.some(m => m.role === 'assistant') 
                      ? `${theme.colors.text}20` 
                      : `linear-gradient(135deg, ${theme.primaryColor}, ${theme.accentColor})`,
                    color: !messages.some(m => m.role === 'assistant') ? theme.colors.textSecondary : 'white',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: !messages.some(m => m.role === 'assistant') ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s'
                  }}
                >
                  应用到编辑器
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Tab Content - Only shown when activeTab is 'settings' */}
        {activeTab === 'settings' && (
          <div style={{
            padding: '0 24px 24px',
            borderTop: `1px solid ${theme.colors.border}`,
            marginTop: 'auto'
          }}>
            <div style={{ 
              background: `${theme.primaryColor}08`, 
              padding: '16px', 
              borderRadius: '16px', 
              border: `1px dashed ${theme.primaryColor}40`,
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Info size={14} color={theme.primaryColor} />
                <span style={{ fontSize: '13px', fontWeight: 700, color: theme.primaryColor }}>配置说明</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.7, lineHeight: '1.5' }}>
                配置您的 AI 模型 API 信息。建议使用支持生图能力的自定义端点以获得最佳体验。
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: `1px solid ${theme.colors.border}`, 
                        background: theme.colors.background, 
                        color: theme.colors.text, 
                        fontSize: '14px', 
                        outline: 'none' 
                      }}
                    >
                      {field.options?.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                    </select>
                  ) : (
                    <input 
                      type={field.type}
                      value={(config as any)[field.key] || ''} 
                      onChange={(e) => setConfig(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        border: `1px solid ${theme.colors.border}`, 
                        background: theme.colors.background, 
                        color: theme.colors.text, 
                        fontSize: '14px', 
                        outline: 'none' 
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={() => {
                  setStorageItem(storageKeys.AI_CONFIG, config);
                  aiService.updateConfig(config);
                  alert('✅ 配置已保存');
                }}
                style={{ 
                  flex: 1, 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: theme.primaryColor, 
                  color: 'white', 
                  border: 'none', 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px' 
                }}
              >
                <Settings size={18} /> 保存配置
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
                style={{ 
                  padding: '12px 20px', 
                  borderRadius: '12px', 
                  background: `${theme.colors.text}10`, 
                  color: theme.colors.text, 
                  border: 'none', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                测试
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${theme.colors.border}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.primaryColor}; }
      `}</style>
    </div>
  );
};