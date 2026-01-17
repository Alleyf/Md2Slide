/**
 * Plugin system types and interfaces
 */

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

export interface PluginMetadata {
  manifest: PluginManifest;
  entryPoint: string;
  assets?: string[];
  permissions?: PluginPermission[];
}

export type PluginPermission = 
  | 'access-markdown-content'
  | 'modify-slide-elements'
  | 'export-content'
  | 'access-settings'
  | 'network-access'
  | 'file-system-access';

export interface PluginContext {
  markdown: string;
  setMarkdown: (content: string) => void;
  slides: any[]; // SlideContent[]
  settings: Record<string, any>;
  updateSetting: (key: string, value: any) => void;
  registerCommand: (command: PluginCommand) => void;
  registerSyntax: (syntax: PluginSyntax) => void;
  registerExportHandler: (handler: ExportHandler) => void;
  addUIElement: (element: UIExtension) => void;
}

export interface PluginCommand {
  id: string;
  name: string;
  description: string;
  handler: (context: PluginContext) => void;
  icon?: string;
  shortcut?: string;
}

export interface PluginSyntax {
  type: 'block' | 'inline';
  name: string;
  pattern: RegExp;
  renderer: (match: RegExpMatchArray, context: PluginContext) => string | JSX.Element;
  parser?: (content: string) => any;
}

export interface ExportHandler {
  format: string;
  name: string;
  handler: (slides: any[], options?: any) => Promise<Blob>;
}

export interface UIExtension {
  location: 'toolbar' | 'sidebar' | 'modal' | 'settings';
  component: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface PluginAPI {
  // Core plugin management
  registerPlugin: (plugin: BasePlugin) => void;
  unregisterPlugin: (pluginId: string) => void;
  getPlugin: (pluginId: string) => BasePlugin | undefined;
  getAllPlugins: () => BasePlugin[];

  // Content manipulation
  getMarkdown: () => string;
  setMarkdown: (content: string) => void;
  getSlides: () => any[];
  updateSlide: (index: number, slide: any) => void;

  // UI extensions
  registerCommand: (command: PluginCommand) => void;
  registerSyntax: (syntax: PluginSyntax) => void;
  addUIElement: (element: UIExtension) => void;

  // Export functionality
  registerExportHandler: (handler: ExportHandler) => void;
  runExport: (format: string, options?: any) => Promise<Blob>;

  // Settings management
  getSetting: (key: string) => any;
  setSetting: (key: string, value: any) => void;
}

export abstract class BasePlugin {
  abstract readonly manifest: PluginMetadata;
  abstract init(context: PluginContext): Promise<void> | void;
  abstract destroy?(): Promise<void> | void;
  
  // Optional lifecycle methods
  onMarkdownChange?(newContent: string, oldContent: string): void;
  onSlideChange?(newSlides: any[], oldSlides: any[]): void;
  onSettingsChange?(newSettings: Record<string, any>, oldSettings: Record<string, any>): void;
}

// Built-in plugin types
export interface CodeRunnerPlugin extends BasePlugin {
  runCode: (code: string, language: string) => Promise<any>;
}

export interface MermaidPlugin extends BasePlugin {
  renderMermaid: (diagramCode: string) => Promise<string>;
}

export interface MediaPlugin extends BasePlugin {
  processMedia: (url: string, type: 'image' | 'video' | 'audio') => Promise<string>;
}