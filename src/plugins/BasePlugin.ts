export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  license?: string;
  dependencies?: string[];
}

export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  handler: (params: any) => Promise<any>;
}

export interface PluginAPI {
  registerCommand(command: PluginCommand): void;
  unregisterCommand(commandId: string): void;
  executeCommand(commandId: string, params?: any): Promise<any>;
  registerSyntaxHandler(pattern: RegExp, handler: (match: string[]) => string): void;
  registerExportProcessor(processor: (content: string) => string): void;
}

export abstract class BasePlugin<TConfig = any> {
  protected config: TConfig;
  
  constructor(config?: TConfig) {
    this.config = config || {} as TConfig;
  }

  abstract initialize(api: PluginAPI): Promise<void>;
  abstract destroy(): Promise<void>;

  /**
   * 实例的元数据，从静态 manifest 获取
   */
  get manifest(): PluginManifest {
    return (this.constructor as any).manifest;
  }
}