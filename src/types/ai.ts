export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'ollama' | 'local' | 'custom';
  apiKey?: string;
  baseURL?: string;
  model?: string;
  imageModel?: string;
}

export interface AIRequestOptions {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
  type?: 'chat' | 'image';
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
  reasoning: boolean;
  toolUse: boolean;
}