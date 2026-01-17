import { BasePlugin } from './plugins/BasePlugin';

interface PluginResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * 插件管理器类，负责管理所有插件的生命周期
 */
export class PluginManager {
  private plugins: Map<string, BasePlugin> = new Map();
  private enabledPlugins: Set<string> = new Set();

  /**
   * 注册插件
   */
  registerPlugin(plugin: BasePlugin): boolean {
    const id = (plugin.constructor as typeof BasePlugin).manifest.id;
    if (!id) {
      console.error('Plugin must have an id in manifest');
      return false;
    }

    if (this.plugins.has(id)) {
      console.warn(`Plugin with id ${id} already registered`);
      return false;
    }

    this.plugins.set(id, plugin);
    return true;
  }

  /**
   * 启用插件
   */
  async enablePlugin(pluginId: string): Promise<PluginResult> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin ${pluginId} not found` };
    }

    if (this.enabledPlugins.has(pluginId)) {
      return { success: false, error: `Plugin ${pluginId} is already enabled` };
    }

    try {
      plugin.initialize();
      this.enabledPlugins.add(pluginId);
      return { success: true };
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      return { success: false, error: `Failed to initialize plugin: ${(error as Error).message}` };
    }
  }

  /**
   * 禁用插件
   */
  async disablePlugin(pluginId: string): Promise<PluginResult> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin ${pluginId} not found` };
    }

    if (!this.enabledPlugins.has(pluginId)) {
      return { success: false, error: `Plugin ${pluginId} is not enabled` };
    }

    try {
      plugin.destroy();
      this.enabledPlugins.delete(pluginId);
      return { success: true };
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      return { success: false, error: `Failed to destroy plugin: ${(error as Error).message}` };
    }
  }

  /**
   * 执行插件
   */
  async executePlugin(pluginId: string, params: any): Promise<PluginResult> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return { success: false, error: `Plugin ${pluginId} not found` };
    }

    if (!this.enabledPlugins.has(pluginId)) {
      return { success: false, error: `Plugin ${pluginId} is not enabled` };
    }

    try {
      const result = await plugin.execute(params);
      return { success: true, data: result };
    } catch (error) {
      console.error(`Failed to execute plugin ${pluginId}:`, error);
      return { success: false, error: `Failed to execute plugin: ${(error as Error).message}` };
    }
  }

  /**
   * 获取所有插件
   */
  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 获取已启用的插件
   */
  getEnabledPlugins(): BasePlugin[] {
    return Array.from(this.enabledPlugins)
      .map(id => this.plugins.get(id))
      .filter(plugin => plugin !== undefined) as BasePlugin[];
  }

  /**
   * 获取插件实例
   */
  getPlugin(pluginId: string): BasePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * 检查插件是否已启用
   */
  isPluginEnabled(pluginId: string): boolean {
    return this.enabledPlugins.has(pluginId);
  }
}

// 创建全局插件管理器实例
export const pluginManager = new PluginManager();