/**
 * 插件基类定义
 * 所有插件都应该继承此类
 */
export abstract class BasePlugin {
  /**
   * 插件元数据
   */
  static get manifest() {
    return {
      id: '',
      name: '',
      description: '',
      version: '1.0.0',
      author: '',
      tags: [] as string[],
      previewImage: '',
      icon: '🔌',
      features: [] as string[]
    };
  }

  /**
   * 实例的元数据
   */
  get manifest() {
    return (this.constructor as typeof BasePlugin).manifest;
  }

  /**
   * 初始化插件
   */
  abstract initialize(): void;

  /**
   * 销毁插件
   */
  abstract destroy(): void;

  /**
   * 执行插件功能
   */
  abstract execute(params: any): Promise<any>;
}