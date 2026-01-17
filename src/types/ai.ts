export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'local';
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

export interface AIRequestOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface AIFunction {
  name: string;
  description: string;
  handler: (params: any) => Promise<any>;
}

export interface AIAssistantCapabilities {
  summarize: boolean;
  improveText: boolean;
  extractKeyPoints: boolean;
  generateSlides: boolean;
  generateImages: boolean;
  translate: boolean;
}