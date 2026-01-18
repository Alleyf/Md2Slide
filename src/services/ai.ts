import { AIServiceConfig, AIRequestOptions, AIResponse, AIAssistantCapabilities } from '../types/ai';
import { getStorageItem, storageKeys } from '../utils/storage';

const ENDPOINTS = {
  OPENAI: '/chat/completions',
  ANTHROPIC: '/messages',
  OLLAMA: '/api/generate'
};

/**
 * AI服务类，提供各种AI辅助功能
 */
export class AIService {
  private config: AIServiceConfig;
  private capabilities: AIAssistantCapabilities;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.capabilities = this.detectCapabilities(config.model || '');
  }

  /**
   * 识别模型能力
   */
  private detectCapabilities(model: string): AIAssistantCapabilities {
    const m = model.toLowerCase();
    
    // 基础能力
    const capabilities: AIAssistantCapabilities = {
      summarize: true,
      improveText: true,
      extractKeyPoints: true,
      generateSlides: true,
      translate: true,
      generateImages: false,
      reasoning: false,
      toolUse: false
    };

    // 推理能力 (Reasoning)
    if (m.includes('o1') || m.includes('o3') || m.includes('reasoning') || m.includes('deepseek-r1')) {
      capabilities.reasoning = true;
    }

    // 工具调用能力 (Tool Use)
    if (m.includes('gpt-4') || m.includes('claude-3') || m.includes('gemini-1.5') || m.includes('deepseek-chat')) {
      capabilities.toolUse = true;
    }

    // 图像生成能力 (Image Generation)
    if (m.includes('dall-e') || m.includes('flux') || m.includes('stable-diffusion')) {
      capabilities.generateImages = true;
    }

    return capabilities;
  }

  /**
   * 发送请求到AI模型
   */
  async request(options: AIRequestOptions): Promise<AIResponse> {
    console.log(`AI Request [${this.config.provider}]:`, options.prompt.substring(0, 50) + '...');
    
    // 根据配置的提供商调用相应的API
    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.callOpenAIAPI(options);
        case 'anthropic':
          return await this.callAnthropicAPI(options);
        case 'ollama':
          return await this.callOllamaAPI(options);
        case 'local':
        case 'custom':
          return await this.callLocalAPI(options);
        default:
          throw new Error(`不支持的AI提供商: ${this.config.provider}`);
      }
    } catch (error) {
      console.error('AI Service Request Error:', error);
      throw error;
    }
  }

  private getFullURL(baseURL: string | undefined, defaultBase: string, endpoint: string): string {
    let base = (baseURL || defaultBase).trim();
    // 移除末尾的所有斜杠
    base = base.replace(/\/+$/, '');
    
    // 如果 base 已经包含了 endpoint (忽略大小写和末尾斜杠)，则直接使用 base
    const lowerBase = base.toLowerCase();
    const lowerEndpoint = endpoint.toLowerCase();
    
    if (lowerBase.endsWith(lowerEndpoint)) {
      return base;
    }
    
    // 否则拼接 endpoint
    return `${base}${endpoint}`;
  }

  /**
   * 调用OpenAI API
   */
  private async callOpenAIAPI(options: AIRequestOptions): Promise<AIResponse> {
    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) {
      throw new Error('OpenAI API密钥未配置');
    }

    const url = this.getFullURL(this.config.baseURL, 'https://api.openai.com/v1', ENDPOINTS.OPENAI);
    console.log('Fetching OpenAI URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: options.prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.choices[0]?.message?.content || '未能获取AI响应',
      usage: data.usage,
      model: data.model
    };
  }

  /**
   * 调用Anthropic API
   */
  private async callAnthropicAPI(options: AIRequestOptions): Promise<AIResponse> {
    const apiKey = this.config.apiKey?.trim();
    if (!apiKey) {
      throw new Error('Anthropic API密钥未配置');
    }

    const url = this.getFullURL(this.config.baseURL, 'https://api.anthropic.com/v1', ENDPOINTS.ANTHROPIC);
    console.log('Fetching Anthropic URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        messages: [{ role: 'user', content: options.prompt }],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API错误: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.content[0]?.text || '未能获取AI响应',
      usage: {
        promptTokens: data.usage?.input_tokens,
        completionTokens: data.usage?.output_tokens,
        totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      },
      model: data.model
    };
  }

  /**
   * 调用Ollama API
   */
  private async callOllamaAPI(options: AIRequestOptions): Promise<AIResponse> {
    const url = this.getFullURL(this.config.baseURL, 'http://localhost:11434', ENDPOINTS.OLLAMA);
    console.log('Fetching Ollama URL:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'llama2',
        prompt: options.prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.maxTokens || 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API错误: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      content: data.response || '未能获取AI响应',
      usage: undefined, // Ollama API通常不返回token使用情况
      model: data.model
    };
  }

  /**
   * 调用本地API（用于测试或其他目的）
   */
  private async callLocalAPI(options: AIRequestOptions): Promise<AIResponse> {
    // 本地API的具体实现可以根据需要定制
    // 这里只是一个占位符实现
    console.warn('使用本地API模式，这通常是用于测试的目的');
    
    // 可以在这里实现一个本地的模拟响应或者连接到本地运行的服务
    return {
      content: `本地API响应：${options.prompt.substring(0, 100)}...`,
      usage: undefined,
      model: this.config.model || 'local-model'
    };
  }

  /**
   * 总结文本内容
   */
  async summarize(text: string): Promise<AIResponse> {
    const prompt = `请对以下文本进行简明扼要的总结：\n\n${text}`;
    return this.request({ prompt });
  }

  /**
   * 改进文本内容
   */
  async improveText(text: string): Promise<AIResponse> {
    const prompt = `请改进以下文本的表达，使其更清晰、更专业：\n\n${text}`;
    return this.request({ prompt });
  }

  /**
   * 提取关键点
   */
  async extractKeyPoints(text: string): Promise<AIResponse> {
    const prompt = `请从以下文本中提取关键点，并以要点形式列出：\n\n${text}`;
    return this.request({ prompt });
  }

  /**
   * 从研究论文生成幻灯片大纲
   */
  async generateSlidesFromPaper(paperContent: string): Promise<AIResponse> {
    const prompt = `请将以下研究论文内容转换为幻灯片大纲，每张幻灯片应包含标题和要点：\n\n${paperContent}`;
    return this.request({ prompt });
  }

  /**
   * 翻译文本
   */
  async translate(text: string, targetLanguage: string = 'zh'): Promise<AIResponse> {
    const prompt = `请将以下文本翻译成${targetLanguage === 'zh' ? '中文' : '英文'}：\n\n${text}`;
    return this.request({ prompt });
  }

  /**
   * 获取AI助手功能支持情况
   */
  getCapabilities(): AIAssistantCapabilities {
    return this.capabilities;
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig: Partial<AIServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.model) {
      this.capabilities = this.detectCapabilities(newConfig.model);
    }
  }
}

// 默认配置从环境变量读取
export const DEFAULT_AI_CONFIG: AIServiceConfig = {
  provider: (import.meta.env.VITE_AI_PROVIDER as 'openai' | 'anthropic' | 'ollama' | 'local' | 'custom') || 'openai',
  model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
  apiKey: import.meta.env.VITE_AI_API_KEY || '',
  baseURL: import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1'
};

// 获取初始配置（优先从存储获取，否则使用环境变量）
const getInitialConfig = (): AIServiceConfig => {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;
  return getStorageItem<AIServiceConfig>(storageKeys.AI_CONFIG, DEFAULT_AI_CONFIG);
};

// 默认实例
export const aiService = new AIService(getInitialConfig());