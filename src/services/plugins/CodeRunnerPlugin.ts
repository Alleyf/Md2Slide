import { BasePlugin, PluginManifest, PluginAPI } from './BasePlugin';

/**
 * 代码实时运行插件
 * 允许在幻灯片中直接运行代码块
 */
export class CodeRunnerPlugin extends BasePlugin {
  static manifest: PluginManifest = {
    id: 'code-runner-plugin',
    name: '代码实时运行',
    description: '允许在幻灯片预览中直接运行 JavaScript、HTML 代码块',
    version: '1.0.0',
    author: 'Md2Slide Team',
    tags: ['code', 'runner', 'interactive'],
    previewImage: '/plugins/previews/code-runner.jpg',
    icon: 'PlayCircle',
    features: ['JS 实时运行', 'HTML 预览', '控制台输出重定向']
  };

  initialize(api: PluginAPI): void {
    console.log('CodeRunnerPlugin initialized');
    // 在实际应用中，这里会注册全局的运行函数或者劫持预览区域的渲染
  }

  destroy(): void {
    console.log('CodeRunnerPlugin destroyed');
  }

  async execute(params: any): Promise<any> {
    const { code, language } = params;
    
    if (language === 'javascript' || language === 'js') {
      return this.runJS(code);
    } else if (language === 'html') {
      return this.runHTML(code);
    }
    
    return `不支持的语言: ${language}`;
  }

  private runJS(code: string): string {
    try {
      // 简单的执行逻辑，实际应用中应在沙箱中运行
      const result = eval(code);
      return String(result);
    } catch (e) {
      return `Error: ${(e as Error).message}`;
    }
  }

  private runHTML(code: string): string {
    // 简单的 HTML 返回，实际应用中可能需要渲染到 iframe
    return `HTML 代码已准备好渲染: ${code.substring(0, 50)}...`;
  }
}
