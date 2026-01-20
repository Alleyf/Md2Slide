import { describe, it, expect } from 'vitest';
import { markdownToHtml, htmlToMarkdown } from './converter';

describe('Converter Utils', () => {
  describe('markdownToHtml', () => {
    it('should convert basic markdown to html', async () => {
      const md = '# Hello';
      const html = await markdownToHtml(md);
      // marked might produce <h1 id="hello">Hello</h1> or just <h1>Hello</h1>
      expect(html).toContain('<h1');
      expect(html).toContain('Hello</h1>');
    });

    it('should sanitize html', async () => {
      const md = 'Hello <script>alert(1)</script>';
      const html = await markdownToHtml(md);
      expect(html).not.toContain('<script>');
      expect(html).toContain('Hello');
    });
  });

  describe('htmlToMarkdown', () => {
    it('should convert basic html to markdown', () => {
      const html = '<h1>Hello</h1>';
      const md = htmlToMarkdown(html);
      expect(md).toContain('# Hello');
    });

    it('should handle lists', () => {
      const html = '<ul><li>Item 1</li></ul>';
      const md = htmlToMarkdown(html);
      expect(md).toMatch(/- +Item 1/);
    });
    
    it('should handle code blocks', () => {
      const html = '<pre><code>console.log("test");</code></pre>';
      const md = htmlToMarkdown(html);
      expect(md).toContain('```');
      expect(md).toContain('console.log("test");');
    });
  });
});
