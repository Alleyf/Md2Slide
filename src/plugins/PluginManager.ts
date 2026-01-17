import { PluginAPI, BasePlugin, PluginContext, PluginCommand, PluginSyntax, ExportHandler, UIExtension } from '../types/plugin';
import { SlideContent } from '../types/slide';

/**
 * Plugin Manager to handle plugin lifecycle and API
 */
export class PluginManager implements PluginAPI {
  private plugins: Map<string, BasePlugin> = new Map();
  private registeredCommands: Map<string, PluginCommand> = new Map();
  private registeredSyntaxes: PluginSyntax[] = [];
  private registeredExportHandlers: Map<string, ExportHandler> = new Map();
  private uiExtensions: Map<string, UIExtension[]> = new Map();
  
  // Current application state
  private currentMarkdown: string = '';
  private currentSlides: SlideContent[] = [];
  private currentSettings: Record<string, any> = {};

  /**
   * Register a plugin with the manager
   */
  registerPlugin(plugin: BasePlugin): void {
    const pluginId = plugin.manifest.manifest.id;
    
    if (this.plugins.has(pluginId)) {
      console.warn(`Plugin with ID ${pluginId} is already registered`);
      return;
    }
    
    this.plugins.set(pluginId, plugin);
    
    // Initialize the plugin with current context
    const context: PluginContext = this.createContext();
    const initResult = plugin.init(context);
    if (initResult instanceof Promise) {
      initResult.catch(error => {
        console.error(`Failed to initialize plugin ${pluginId}:`, error);
      });
    }
  }

  /**
   * Unregister a plugin
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      console.warn(`Plugin with ID ${pluginId} is not registered`);
      return;
    }
    
    // Call destroy if available
    if (plugin.destroy) {
      const destroyResult = plugin.destroy!();
      if (destroyResult instanceof Promise) {
        destroyResult.catch(error => {
          console.error(`Error destroying plugin ${pluginId}:`, error);
        });
      }
    }
    
    this.plugins.delete(pluginId);
  }

  /**
   * Get a specific plugin
   */
  getPlugin(pluginId: string): BasePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   */
  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get current markdown content
   */
  getMarkdown(): string {
    return this.currentMarkdown;
  }

  /**
   * Set markdown content
   */
  setMarkdown(content: string): void {
    const oldContent = this.currentMarkdown;
    this.currentMarkdown = content;
    
    // Notify plugins of markdown change
    this.notifyMarkdownChange(content, oldContent);
  }

  /**
   * Get current slides
   */
  getSlides(): SlideContent[] {
    return this.currentSlides;
  }

  /**
   * Update a specific slide
   */
  updateSlide(index: number, slide: SlideContent): void {
    if (index < 0 || index >= this.currentSlides.length) {
      console.warn(`Invalid slide index: ${index}`);
      return;
    }
    
    const oldSlides = [...this.currentSlides];
    this.currentSlides[index] = slide;
    
    // Notify plugins of slide change
    this.notifySlideChange(this.currentSlides, oldSlides);
  }

  /**
   * Register a command
   */
  registerCommand(command: PluginCommand): void {
    if (this.registeredCommands.has(command.id)) {
      console.warn(`Command with ID ${command.id} is already registered`);
      return;
    }
    
    this.registeredCommands.set(command.id, command);
  }

  /**
   * Register custom syntax
   */
  registerSyntax(syntax: PluginSyntax): void {
    this.registeredSyntaxes.push(syntax);
  }

  /**
   * Add a UI extension
   */
  addUIElement(element: UIExtension): void {
    const location = element.location;
    if (!this.uiExtensions.has(location)) {
      this.uiExtensions.set(location, []);
    }
    
    const elements = this.uiExtensions.get(location)!;
    elements.push(element);
  }

  /**
   * Register an export handler
   */
  registerExportHandler(handler: ExportHandler): void {
    if (this.registeredExportHandlers.has(handler.format)) {
      console.warn(`Export handler for format ${handler.format} is already registered`);
      return;
    }
    
    this.registeredExportHandlers.set(handler.format, handler);
  }

  /**
   * Run an export operation
   */
  async runExport(format: string, options?: any): Promise<Blob> {
    const handler = this.registeredExportHandlers.get(format);
    if (!handler) {
      throw new Error(`No export handler registered for format: ${format}`);
    }
    
    return handler.handler(this.currentSlides, options);
  }

  /**
   * Get a setting value
   */
  getSetting(key: string): any {
    return this.currentSettings[key];
  }

  /**
   * Set a setting value
   */
  setSetting(key: string, value: any): void {
    const oldValue = this.currentSettings[key];
    this.currentSettings[key] = value;
    
    // Notify plugins of settings change
    this.notifySettingsChange(this.currentSettings, { ...this.currentSettings, [key]: oldValue });
  }

  /**
   * Get all registered commands
   */
  getRegisteredCommands(): PluginCommand[] {
    return Array.from(this.registeredCommands.values());
  }

  /**
   * Get all registered syntax handlers
   */
  getRegisteredSyntaxes(): PluginSyntax[] {
    return [...this.registeredSyntaxes];
  }

  /**
   * Get UI extensions for a specific location
   */
  getUIExtensions(location: 'toolbar' | 'sidebar' | 'modal' | 'settings'): UIExtension[] {
    return this.uiExtensions.get(location) || [];
  }

  /**
   * Update the current state (called by the application)
   */
  updateState(markdown: string, slides: SlideContent[], settings: Record<string, any>): void {
    this.currentMarkdown = markdown;
    this.currentSlides = slides;
    this.currentSettings = settings;
  }

  /**
   * Create a plugin context with current state
   */
  private createContext(): PluginContext {
    return {
      markdown: this.currentMarkdown,
      setMarkdown: (content: string) => this.setMarkdown(content),
      slides: this.currentSlides,
      settings: this.currentSettings,
      updateSetting: (key: string, value: any) => this.setSetting(key, value),
      registerCommand: (command: PluginCommand) => this.registerCommand(command),
      registerSyntax: (syntax: PluginSyntax) => this.registerSyntax(syntax),
      registerExportHandler: (handler: ExportHandler) => this.registerExportHandler(handler),
      addUIElement: (element: UIExtension) => this.addUIElement(element),
    };
  }

  /**
   * Notify all plugins of markdown change
   */
  private notifyMarkdownChange(newContent: string, oldContent: string): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.onMarkdownChange) {
        try {
          plugin.onMarkdownChange(newContent, oldContent);
        } catch (error) {
          console.error(`Error in plugin ${plugin.manifest.manifest.id} onMarkdownChange:`, error);
        }
      }
    }
  }

  /**
   * Notify all plugins of slide change
   */
  private notifySlideChange(newSlides: SlideContent[], oldSlides: SlideContent[]): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.onSlideChange) {
        try {
          plugin.onSlideChange(newSlides, oldSlides);
        } catch (error) {
          console.error(`Error in plugin ${plugin.manifest.manifest.id} onSlideChange:`, error);
        }
      }
    }
  }

  /**
   * Notify all plugins of settings change
   */
  private notifySettingsChange(newSettings: Record<string, any>, oldSettings: Record<string, any>): void {
    for (const plugin of this.plugins.values()) {
      if (plugin.onSettingsChange) {
        try {
          plugin.onSettingsChange(newSettings, oldSettings);
        } catch (error) {
          console.error(`Error in plugin ${plugin.manifest.manifest.id} onSettingsChange:`, error);
        }
      }
    }
  }
}

// Singleton instance
export const pluginManager = new PluginManager();