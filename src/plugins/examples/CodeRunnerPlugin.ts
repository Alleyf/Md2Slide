import { BasePlugin, PluginContext, PluginMetadata, PluginSyntax } from '../../types/plugin';

/**
 * Code Runner Plugin
 * Allows execution of code snippets within slides
 */
export class CodeRunnerPlugin extends BasePlugin {
  readonly manifest: PluginMetadata = {
    manifest: {
      id: 'code-runner-plugin',
      name: 'Code Runner',
      version: '1.0.0',
      description: 'Allows execution of code snippets within slides',
      author: 'Md2Slide Team',
      homepage: 'https://github.com/md2slide',
      license: 'MIT',
      dependencies: [],
    },
    entryPoint: './CodeRunnerPlugin.js',
    assets: ['runner-worker.js'],
    permissions: ['access-markdown-content', 'network-access'],
  };

  private context!: PluginContext;
  private codeCache: Map<string, { output: string; timestamp: number }> = new Map();

  async init(context: PluginContext): Promise<void> {
    this.context = context;
    
    // Register custom syntax for executable code blocks
    const codeRunnerSyntax: PluginSyntax = {
      type: 'block',
      name: 'executable-code',
      pattern: /^```([a-zA-Z]+)(?:\s*\{(exec|run|execute)\})?\s*\n([\s\S]*?)\n```$/,
      renderer: this.renderExecutableCode.bind(this),
      parser: this.parseExecutableCode.bind(this),
    };
    
    context.registerSyntax(codeRunnerSyntax);
    
    // Register a command to run all code blocks
    context.registerCommand({
      id: 'run-all-code',
      name: 'Run All Code Blocks',
      description: 'Execute all executable code blocks in the presentation',
      handler: this.runAllCodeBlocks.bind(this),
      icon: '▶️',
      shortcut: 'Ctrl+Shift+R',
    });
    
    console.log('CodeRunnerPlugin initialized');
  }

  async destroy?(): Promise<void> {
    // Clean up resources
    this.codeCache.clear();
    console.log('CodeRunnerPlugin destroyed');
  }

  /**
   * Render executable code block
   */
  renderExecutableCode(match: RegExpMatchArray, context: PluginContext): string {
    const [, language, execFlag, code] = match;
    const isExecutable = !!execFlag;
    
    if (!isExecutable) {
      // Just render as normal code block
      return `<pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>`;
    }
    
    // Generate a unique ID for this code block
    const blockId = `code-block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Return HTML for executable code block
    return `
      <div class="executable-code-block" data-block-id="${blockId}">
        <div class="code-header">
          <span class="language-label">${language}</span>
          <button class="run-code-btn" onclick="window.runCodeBlock('${blockId}')">▶ Run</button>
        </div>
        <pre><code class="language-${language}">${this.escapeHtml(code)}</code></pre>
        <div class="code-output" id="output-${blockId}" style="display:none;">
          <div class="output-header">Output:</div>
          <pre class="output-content"></pre>
        </div>
      </div>
    `;
  }

  /**
   * Parse executable code block
   */
  parseExecutableCode(content: string): any {
    // Extract executable code blocks from content
    const executableRegex = /^```([a-zA-Z]+)(?:\s*\{(exec|run|execute)\})?\s*\n([\s\S]*?)\n```$/gm;
    const matches = [];
    let match;
    
    while ((match = executableRegex.exec(content)) !== null) {
      matches.push({
        language: match[1],
        isExecutable: !!match[2],
        code: match[3],
      });
    }
    
    return matches;
  }

  /**
   * Run a specific code block
   */
  async runCodeBlock(blockId: string, code: string, language: string): Promise<string> {
    // Check cache first
    const cacheKey = `${language}:${code}`;
    const cached = this.codeCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return cached.output;
    }
    
    try {
      let result = '';
      
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'js':
          result = await this.executeJavaScript(code);
          break;
        case 'python':
        case 'py':
          result = await this.executePython(code);
          break;
        case 'html':
          result = await this.executeHtml(code);
          break;
        default:
          result = `Language '${language}' execution not supported`;
      }
      
      // Cache the result
      this.codeCache.set(cacheKey, {
        output: result,
        timestamp: Date.now(),
      });
      
      return result;
    } catch (error) {
      return `Error: ${(error as Error).message}`;
    }
  }

  /**
   * Execute JavaScript code (sandboxed)
   */
  private async executeJavaScript(code: string): Promise<string> {
    // In a real implementation, this would run in a secure sandbox
    // For demo purposes, we'll just return a mock result
    try {
      // This is a very simplified and insecure approach - 
      // in a real app, you'd need a proper sandbox
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      const iframeDoc = iframe.contentDocument!;
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head><script>
          window.result = undefined;
          try {
            window.result = (function() {
              ${code}
            })();
          } catch (e) {
            window.result = 'Error: ' + e.message;
          }
        </script></head>
        <body></body>
        </html>
      `);
      iframeDoc.close();
      
      // Wait for execution to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const result = (iframe.contentWindow as any).result;
      document.body.removeChild(iframe);
      
      return result !== undefined ? String(result) : 'Executed successfully (no return value)';
    } catch (error) {
      return `Execution error: ${(error as Error).message}`;
    }
  }

  /**
   * Execute Python code (would typically use Pyodide or server-side execution)
   */
  private async executePython(code: string): Promise<string> {
    // Mock implementation - in reality, you'd use Pyodide or server-side execution
    return `Python execution result for:\n${code}`;
  }

  /**
   * Execute HTML code
   */
  private async executeHtml(code: string): Promise<string> {
    // Mock implementation - would render HTML in a sandboxed iframe
    return `Rendered HTML: ${code.substring(0, 100)}...`;
  }

  /**
   * Run all code blocks in the current markdown
   */
  private async runAllCodeBlocks(context: PluginContext): Promise<void> {
    const parsedCodeBlocks = this.parseExecutableCode(context.markdown);
    
    for (const block of parsedCodeBlocks) {
      if (block.isExecutable) {
        const result = await this.runCodeBlock(
          `temp-${Date.now()}`, 
          block.code, 
          block.language
        );
        console.log(`Executed ${block.language} code block:`, result);
      }
    }
    
    alert(`Executed ${parsedCodeBlocks.filter((b: any) => b.isExecutable).length} code blocks`);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
}

// Make runCodeBlock globally available for the rendered buttons
declare global {
  interface Window {
    runCodeBlock: (blockId: string) => void;
  }
}

// Add the runCodeBlock function to the global window object
if (typeof window !== 'undefined') {
  window.runCodeBlock = (blockId: string) => {
    // This would trigger the actual execution
    console.log(`Running code block: ${blockId}`);
    // Implementation would connect to the actual plugin instance
  };
}