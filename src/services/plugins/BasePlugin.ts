import { FileItem } from '../../types/file';

export interface ContextMenuAction {
  id: string;
  label: string | ((item: FileItem) => string);
  icon?: string;
  onClick: (item: FileItem) => void | Promise<void>;
}

export interface PluginAPI {
  registerContextMenuAction: (action: ContextMenuAction) => void;
  // 可以根据需要添加更多 API
}

export interface PluginManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags?: string[];
  previewImage?: string;
  icon?: string;
  features?: string[];
}

/**
 * 插件基类定义
 * 所有插件都应该继承此类
 */
export abstract class BasePlugin {
  /**
   * 实例的元数据，从静态 manifest 获取
   */
  get manifest(): PluginManifest {
    return (this.constructor as any).manifest;
  }

  /**
   * 初始化插件
   */
  abstract initialize(api: PluginAPI): void;

  /**
   * 销毁插件
   */
  abstract destroy(): void;

  /**
   * 执行插件功能
   */
  abstract execute(params: any): Promise<any>;
}