import { describe, it, expect } from 'vitest';
import { markdownToWeChatHtml } from './wechatConverter';

describe('markdownToWeChatHtml', () => {
  it('should convert markdown to wechat styled html', async () => {
    const markdown = '# Hello\n\nThis is a paragraph.\n\n```javascript\nconsole.log("hello");\n```';
    const html = await markdownToWeChatHtml(markdown);
    
    // Check for inline styles
    expect(html).toContain('font-family: -apple-system');
    expect(html).toContain('font-size: 22px'); // H1 style
    expect(html).toContain('text-align: justify'); // Paragraph style
    
    // Check for Mac window style code block
    expect(html).toContain('background: #fc625d'); // Red dot
    expect(html).toContain('background: #fdbc40'); // Yellow dot
    expect(html).toContain('background: #35cd4b'); // Green dot
  });

  it('should handle blockquotes correctly', async () => {
    const markdown = '> This is a quote';
    const html = await markdownToWeChatHtml(markdown);
    expect(html).toContain('border-left: 4px solid #dfe2e5');
  });
});
