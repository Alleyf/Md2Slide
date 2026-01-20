import { describe, it, expect } from 'vitest';
import { parseTableOfContents } from './index';

describe('parseTableOfContents', () => {
  it('should parse basic headings', () => {
    const md = '# Title\n## Subtitle\n### Section';
    const toc = parseTableOfContents(md);
    expect(toc).toHaveLength(3);
    expect(toc[0].text).toBe('Title');
    expect(toc[1].text).toBe('Subtitle');
    expect(toc[2].text).toBe('Section');
  });

  it('should handle CRLF line endings', () => {
    const md = '# Title\r\n## Subtitle\r\n### Section';
    const toc = parseTableOfContents(md);
    expect(toc).toHaveLength(3);
    expect(toc[0].text).toBe('Title');
    expect(toc[1].text).toBe('Subtitle');
    expect(toc[2].text).toBe('Section');
  });

  it('should ignore headings inside code blocks', () => {
    const md = '# Title\n```\n# Code comment\n```\n## Subtitle';
    const toc = parseTableOfContents(md);
    // Ideally it should be 2, but current implementation might return 3
    // We will fix this too
    expect(toc).toHaveLength(2);
    expect(toc[0].text).toBe('Title');
    expect(toc[1].text).toBe('Subtitle');
  });
});
