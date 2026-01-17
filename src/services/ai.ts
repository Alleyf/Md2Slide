import { AIServiceConfig, AIRequestOptions, AIResponse, AIAssistantCapabilities } from '../types/ai';

/**
 * AI服务类，提供各种AI辅助功能
 */
export class AIService {
  private config: AIServiceConfig;
  private capabilities: AIAssistantCapabilities;

  constructor(config: AIServiceConfig) {
    this.config = config;
    this.capabilities = {
      summarize: true,
      improveText: true,
      extractKeyPoints: true,
      generateSlides: true,
      generateImages: false, // 图片生成功能暂未实现
      translate: true,
    };
  }

  /**
   * 发送请求到AI模型
   */
  async request(options: AIRequestOptions): Promise<AIResponse> {
    // 根据配置的提供商调用相应的API
    switch (this.config.provider) {
      case 'openai':
        return this.callOpenAIAPI(options);
      case 'anthropic':
        return this.callAnthropicAPI(options);
      case 'ollama':
        return this.callOllamaAPI(options);
      case 'local':
        return this.callLocalAPI(options);
      default:
        throw new Error(`不支持的AI提供商: ${this.config.provider}`);
    }
  }

  /**
   * 调用OpenAI API
   */
  private async callOpenAIAPI(options: AIRequestOptions): Promise<AIResponse> {
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('OpenAI API密钥未配置');
    }

    const response = await fetch(this.config.baseURL || 'https://api.openai.com/v1/chat/completions', {
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
    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error('Anthropic API密钥未配置');
    }

    const response = await fetch(this.config.baseURL || 'https://api.anthropic.com/v1/messages', {
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
    const response = await fetch(this.config.baseURL || 'http://localhost:11434/api/generate', {
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
  }
}

// 默认实例
export const aiService = new AIService({
  provider: 'openai',
  model: 'gpt-3.5-turbo'
});