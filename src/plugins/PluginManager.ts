import { BasePlugin, PluginAPI, PluginCommand } from './BasePlugin';

export class PluginManager implements PluginAPI {
  private plugins: Map<string, BasePlugin> = new Map();
  private registeredCommands: Map<string, PluginCommand> = new Map();
  private syntaxHandlers: Array<{ pattern: RegExp, handler: (match: string[]) => string }> = [];
  private exportProcessors: Array<(content: string) => string> = [];

  async loadPlugin<TConfig = any>(pluginInstance: BasePlugin<TConfig>): Promise<void> {
    const manifest = (pluginInstance.constructor as any).manifest;
    
    if (this.plugins.has(manifest.id)) {
      console.warn(`Plugin with id ${manifest.id} is already loaded`);
      return;
    }
    
    await pluginInstance.initialize(this);
    this.plugins.set(manifest.id, pluginInstance);
    console.log(`Plugin loaded: ${manifest.name} (${manifest.id})`);
  }

  async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin with id ${pluginId} is not loaded`);
      return;
    }
    
    await plugin.destroy();
    this.plugins.delete(pluginId);
    console.log(`Plugin unloaded: ${pluginId}`);
  }

  getPlugin<T extends BasePlugin>(pluginId: string): T | undefined {
    return this.plugins.get(pluginId) as T;
  }

  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }

  // PluginAPI implementation
  registerCommand(command: PluginCommand): void {
    this.registeredCommands.set(command.id, command);
    console.log(`Command registered: ${command.id}`);
  }

  unregisterCommand(commandId: string): void {
    this.registeredCommands.delete(commandId);
    console.log(`Command unregistered: ${commandId}`);
  }

  async executeCommand(commandId: string, params?: any): Promise<any> {
    const command = this.registeredCommands.get(commandId);
    if (!command) {
      throw new Error(`Command not found: ${commandId}`);
    }
    
    try {
      return await command.handler(params);
    } catch (error) {
      console.error(`Error executing command ${commandId}:`, error);
      throw error;
    }
  }

  registerSyntaxHandler(pattern: RegExp, handler: (match: string[]) => string): void {
    this.syntaxHandlers.push({ pattern, handler });
    console.log(`Syntax handler registered for pattern: ${pattern}`);
  }

  getSyntaxHandlers(): Array<{ pattern: RegExp, handler: (match: string[]) => string }> {
    return [...this.syntaxHandlers];
  }

  registerExportProcessor(processor: (content: string) => string): void {
    this.exportProcessors.push(processor);
    console.log('Export processor registered');
  }

  getExportProcessors(): Array<(content: string) => string> {
    return [...this.exportProcessors];
  }

  async processContentForExport(content: string): Promise<string> {
    let processedContent = content;
    for (const processor of this.exportProcessors) {
      processedContent = await Promise.resolve(processor(processedContent));
    }
    return processedContent;
  }

  // Convenience method to initialize built-in plugins
  async initializeBuiltInPlugins(): Promise<void> {
    // Here we would load built-in plugins
    // For now, we'll just log that this is where it would happen
    console.log('Initializing built-in plugins...');
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager();