import { SlideContent, SlideElement } from '../components/SlideTemplate';
import { formatInlineMarkdown } from './markdownHelpers';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  lineIndex: number;
}

/**
 * 解析 Markdown 为幻灯片
 */
export const parseMarkdownToSlides = (md: string): SlideContent[] => {
  // 归一化换行符
  const normalizedMd = md.replace(/\r\n/g, '\n');
  // 支持 --- 作为分页符，支持前后空格，以及在文件开头或结尾的情况
  const slideBlocks = normalizedMd.split(/(?:\n|^)\s*---\s*(?:\n|$)/);
  const parsedSlides: SlideContent[] = [];

  slideBlocks.forEach((block, index) => {
    const lines = block.trim().split(/\r?\n/);
    const elements: SlideElement[] = [];
    let clickState = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.startsWith('# ')) {
        const raw = line.slice(2);
        elements.push({ id: `s${index}-e${i}`, type: 'title', content: formatInlineMarkdown(raw), clickState: 0 });
      } else if (line.startsWith('## ')) {
        const raw = line.slice(3);
        elements.push({ id: `s${index}-e${i}`, type: 'subtitle', content: formatInlineMarkdown(raw), clickState: clickState++ });
      } else if (line.startsWith('### ')) {
        const raw = line.slice(4);
        elements.push({ id: `s${index}-e${i}`, type: 'subtitle', content: formatInlineMarkdown(raw), clickState: clickState++, style: { fontSize: '24px', marginTop: '10px' } });
      } else if (line.startsWith('- ') || line.startsWith('* ') || /^\d+\.\s/.test(line)) {
        // 每个列表项分配独立的 clickState 以实现逐条显示
        const isOrdered = /^\d+\.\s/.test(line);
        const bulletContent = isOrdered ? line.replace(/^\d+\.\s/, '') : line.slice(2);
        const listStart = isOrdered ? parseInt(line.match(/^(\d+)\./)![1]) : undefined;
        
        elements.push({ 
          id: `s${index}-e${i}`, 
          type: 'bullets', 
          content: [formatInlineMarkdown(bulletContent)], 
          clickState: clickState++,
          listType: isOrdered ? 'ol' : 'ul',
          listStart: listStart
        });
      } else if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        let code = '';
        let j = i + 1;
        while (j < lines.length && !lines[j].startsWith('```')) {
          code += lines[j] + '\n';
          j++;
        }
        elements.push({ 
          id: `s${index}-e${i}`, 
          type: 'code', 
          content: code.trim(), 
          clickState: clickState++,
          language: language || 'text'
        });
        i = j;
      } else if (line.startsWith('> ')) {
        let quoteContent = line.slice(2);
        let j = i + 1;
        // 连续的引用行合并为一个 quote 块
        while (j < lines.length && lines[j].trim().startsWith('> ')) {
          quoteContent += '\n' + lines[j].trim().slice(2);
          j++;
        }
        elements.push({ id: `s${index}-e${i}`, type: 'quote', content: formatInlineMarkdown(quoteContent), clickState: clickState++ });
        i = j - 1;
      } else if (line.startsWith('|')) {
        // 检测表格
        let tableContent = line + '\n';
        let j = i + 1;
        while (j < lines.length && (lines[j].trim().startsWith('|') || lines[j].trim().startsWith('+-'))) {
          tableContent += lines[j] + '\n';
          j++;
        }
        // 只有当至少有两行（表头+分隔符）时才视为表格
        if (tableContent.split('\n').length >= 3) {
          elements.push({ id: `s${index}-e${i}`, type: 'table', content: tableContent.trim(), clickState: clickState++ });
          i = j - 1;
        } else {
          elements.push({ id: `s${index}-e${i}`, type: 'markdown', content: formatInlineMarkdown(line), clickState: clickState++ });
        }
      } else if (line.startsWith('!icon(')) {
        const match = line.match(/!icon\(([^)]+)\)/);
        if (match) elements.push({ id: `s${index}-e${i}`, type: 'icon', content: match[1], clickState: clickState++ });
      } else if (line.startsWith('!grid')) {
        elements.push({ id: `s${index}-e${i}`, type: 'grid', content: '', clickState: clickState++ });
      } else if (line.startsWith('!vector')) {
        elements.push({ id: `s${index}-e${i}`, type: 'vector', content: '', clickState: clickState++ });
      } else if (line.startsWith('!image(')) {
        const match = line.match(/!image\(([^)]+)\)/);
        if (match) elements.push({ id: `s${index}-e${i}`, type: 'image', content: match[1], clickState: clickState++ });
      } else if (line.startsWith('!video(')) {
        const match = line.match(/!video\(([^)]+)\)/);
        if (match) elements.push({ id: `s${index}-e${i}`, type: 'video', content: match[1], clickState: clickState++ });
      } else if (line.startsWith('!html(')) {
        let htmlContent = '';
        let j = i;
        let started = false;

        while (j < lines.length) {
          const rawLine = lines[j];
          let segment = rawLine;

          if (!started) {
            const markerIndex = rawLine.indexOf('!html(');
            if (markerIndex === -1) break;
            segment = rawLine.slice(markerIndex + '!html('.length);
            started = true;
          }

          const trimmed = segment.trimEnd();
          const hasClosing = trimmed.endsWith(')');
          const cleaned = hasClosing ? trimmed.replace(/\)\s*$/, '') : segment;

          htmlContent += htmlContent ? `\n${cleaned}` : cleaned;

          if (hasClosing) {
            break;
          }

          j++;
        }

        elements.push({
          id: `s${index}-e${i}`,
          type: 'html',
          content: htmlContent,
          clickState: clickState++,
        });

        i = j;
      } else if (line.trim().startsWith('$$')) {
        let latexContent = '';
        let j = i;
        let started = false;
        let foundEnd = false;

        while (j < lines.length) {
          let currentLine = lines[j];
          
          if (!started) {
            const startIdx = currentLine.indexOf('$$');
            currentLine = currentLine.slice(startIdx + 2);
            started = true;
          }

          const endIdx = currentLine.indexOf('$$');
          if (endIdx !== -1) {
            latexContent += (latexContent ? '\n' : '') + currentLine.slice(0, endIdx);
            foundEnd = true;
            break;
          } else {
            latexContent += (latexContent ? '\n' : '') + currentLine;
          }
          j++;
        }

        elements.push({ 
          id: `s${index}-e${i}`, 
          type: 'math', 
          content: { latex: latexContent.trim(), displayMode: true }, 
          clickState: clickState++ 
        });
        
        if (foundEnd) i = j;
      } else {
        elements.push({ id: `s${index}-e${i}`, type: 'markdown', content: formatInlineMarkdown(line), clickState: clickState++ });
      }
    }

    if (elements.length > 0) {
      parsedSlides.push({ id: `slide-${index}`, elements });
    }
  });

  return parsedSlides;
};

/**
 * 解析目录
 */
export const parseTableOfContents = (md: string): TOCItem[] => {
  const lines = md.split('\n');
  const toc: TOCItem[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      toc.push({
        id: `toc-${index}`,
        level: match[1].length,
        text: match[2].trim(),
        lineIndex: index,
      });
    }
  });

  return toc;
};
