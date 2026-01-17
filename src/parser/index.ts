import { SlideContent, SlideElement } from '../components/SlideTemplate';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  lineIndex: number;
}

/**
 * 格式化行内 Markdown
 * 处理 HTML 转义和粗体标记
 */
export const formatInlineMarkdown = (text: string): string => {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>');
};

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
        elements.push({
          id: `s${index}-e${i}`,
          type: 'title',
          content: formatInlineMarkdown(raw),
          clickState: 0,
        });
      } else if (line.startsWith('## ')) {
        const raw = line.slice(3);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'subtitle',
          content: formatInlineMarkdown(raw),
          clickState: clickState++,
        });
      } else if (line.startsWith('### ')) {
        const raw = line.slice(4);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'subtitle',
          content: formatInlineMarkdown(raw),
          clickState: clickState++,
          style: { fontSize: '24px', marginTop: '10px' },
        });
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // 每个列表项分配独立的 clickState 以实现逐条显示
        const bulletContent = line.slice(2);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'bullets',
          content: [bulletContent],
          clickState: clickState++,
        });
      } else if (line.startsWith('```')) {
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
        });
        i = j;
      } else if (line.startsWith('> ')) {
        elements.push({
          id: `s${index}-e${i}`,
          type: 'quote',
          content: line.slice(2),
          clickState: clickState++,
        });
      } else if (line.startsWith('!icon(')) {
        const match = line.match(/!icon\(([^)]+)\)/);
        if (match)
          elements.push({
            id: `s${index}-e${i}`,
            type: 'icon',
            content: match[1],
            clickState: clickState++,
          });
      } else if (line.startsWith('!grid')) {
        elements.push({
          id: `s${index}-e${i}`,
          type: 'grid',
          content: '',
          clickState: clickState++,
        });
      } else if (line.startsWith('!vector')) {
        elements.push({
          id: `s${index}-e${i}`,
          type: 'vector',
          content: '',
          clickState: clickState++,
        });
      } else if (line.startsWith('!image(')) {
        const match = line.match(/!image\(([^)]+)\)/);
        if (match)
          elements.push({
            id: `s${index}-e${i}`,
            type: 'image',
            content: match[1],
            clickState: clickState++,
          });
      } else if (line.startsWith('!video(')) {
        const match = line.match(/!video\(([^)]+)\)/);
        if (match)
          elements.push({
            id: `s${index}-e${i}`,
            type: 'video',
            content: match[1],
            clickState: clickState++,
          });
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
          clickState: clickState++,
        });

        if (foundEnd) i = j;
      } else {
        // 处理行内公式，将其包装在 rehype-katex 能识别的标签中
        const processedLine = line.replace(/\$([^\$]+)\$/g, '<span class="math-inline">$1</span>');
        elements.push({
          id: `s${index}-e${i}`,
          type: 'markdown',
          content: processedLine,
          clickState: clickState++,
        });
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
