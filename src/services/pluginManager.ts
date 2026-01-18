import { BasePlugin, ContextMenuAction, PluginAPI } from './plugins/BasePlugin';
import { CodeRunnerPlugin } from './plugins/CodeRunnerPlugin';
import { DiagramMakerPlugin } from './plugins/DiagramMakerPlugin';
import { CollaborationPlugin } from './plugins/CollaborationPlugin';
import { DownloadPlugin } from './plugins/DownloadPlugin';
import { getStorageItem, setStorageItem, storageKeys } from '../utils/storage';

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
  private listeners: Set<() => void> = new Set();
  private contextMenuActions: Map<string, ContextMenuAction[]> = new Map();

  constructor() {
    this.loadState();
  }

  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      registerContextMenuAction: (action: ContextMenuAction) => {
        const actions = this.contextMenuActions.get(pluginId) || [];
        actions.push(action);
        this.contextMenuActions.set(pluginId, actions);
        this.notify();
      }
    };
  }

  private loadState() {
    const saved = getStorageItem<string[]>(storageKeys.ENABLED_PLUGINS, []);
    saved.forEach(id => this.enabledPlugins.add(id));
  }

  private saveState() {
    setStorageItem(storageKeys.ENABLED_PLUGINS, Array.from(this.enabledPlugins));
  }

  /**
   * 注册监听器
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * 通知所有监听器
   */
  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * 注册插件
   */
  registerPlugin(plugin: BasePlugin): boolean {
    const id = plugin.manifest?.id;
    
    if (!id) {
      console.error('Plugin must have an id in manifest');
      return false;
    }

    if (this.plugins.has(id)) {
      console.warn(`Plugin with id ${id} already registered`);
      return false;
    }

    this.plugins.set(id, plugin);
    
    // 如果插件已在启用列表中，则初始化它
    if (this.enabledPlugins.has(id)) {
      try {
        plugin.initialize(this.createPluginAPI(id));
      } catch (error) {
        console.error(`Failed to auto-initialize plugin ${id}:`, error);
      }
    }

    this.notify();
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
      plugin.initialize(this.createPluginAPI(pluginId));
      this.enabledPlugins.add(pluginId);
      this.saveState();
      this.notify();
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
      this.contextMenuActions.delete(pluginId);
      this.saveState();
      this.notify();
      return { success: true };
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      return { success: false, error: `Failed to destroy plugin: ${(error as Error).message}` };
    }
  }

  /**
   * 获取所有注册的右键菜单项
   */
  getContextMenuActions(): ContextMenuAction[] {
    const allActions: ContextMenuAction[] = [];
    this.enabledPlugins.forEach(id => {
      const actions = this.contextMenuActions.get(id);
      if (actions) {
        allActions.push(...actions);
      }
    });
    return allActions;
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

// 注册内置插件
pluginManager.registerPlugin(new CodeRunnerPlugin());
pluginManager.registerPlugin(new DiagramMakerPlugin());
pluginManager.registerPlugin(new CollaborationPlugin());
pluginManager.registerPlugin(new DownloadPlugin());