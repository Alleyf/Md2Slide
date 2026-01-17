import { SlideContent, SlideElement } from '../components/SlideTemplate';
import { formatInlineMarkdown } from './markdownHelpers';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  lineIndex: number;
}

export interface ParserOptions {
  useDelimiter?: boolean;
  useHeadingPagination?: boolean;
  minHeadingLevel?: number;
}

export const parseMarkdownToSlides = (md: string, options?: ParserOptions): SlideContent[] => {
  const normalizedMd = md.replace(/\r\n/g, '\n');
  const resolvedOptions: Required<ParserOptions> = {
    useDelimiter: true,
    useHeadingPagination: true,
    minHeadingLevel: 1, // 只有1级标题才分页
    ...options,
  };

  const lines = normalizedMd.split('\n');
  const slideBlocks: string[] = [];
  let currentBlockLines: string[] = [];

  const flushBlock = () => {
    const block = currentBlockLines.join('\n').trim();
    if (block) {
      slideBlocks.push(block);
    }
    currentBlockLines = [];
  };

  const isHeadingBreakLine = (line: string): boolean => {
    if (!resolvedOptions.useHeadingPagination) {
      return false;
    }
    const match = line.match(/^(#{1,6})\s+/);
    if (!match) {
      return false;
    }
    const level = match[1].length;
    // 只有当标题级别等于最小标题级别时才分页（即只对1级标题分页）
    return level === resolvedOptions.minHeadingLevel;
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    const isDelimiterLine =
      resolvedOptions.useDelimiter && /^---\s*$/.test(trimmed);
    const isHeadingBreak = isHeadingBreakLine(trimmed);

    if (isDelimiterLine) {
      flushBlock();
      continue;
    }

    if (isHeadingBreak) {
      if (
        currentBlockLines.length > 0 &&
        currentBlockLines.some((l) => l.trim().length > 0)
      ) {
        flushBlock();
      }
      currentBlockLines.push(rawLine);
      continue;
    }

    currentBlockLines.push(rawLine);
  }

  flushBlock();

  const parsedSlides: SlideContent[] = [];

  slideBlocks.forEach((block, index) => {
    const linesInBlock = block.trim().split(/\r?\n/);
    const elements: SlideElement[] = [];
    let clickState = 0;

    for (let i = 0; i < linesInBlock.length; i++) {
      const line = linesInBlock[i].trim();
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
      } else if (
        line.startsWith('- ') ||
        line.startsWith('* ') ||
        /^\d+\.\s/.test(line)
      ) {
        const isOrdered = /^\d+\.\s/.test(line);
        const bulletContent = isOrdered
          ? line.replace(/^\d+\.\s/, '')
          : line.slice(2);
        const listStart = isOrdered
          ? parseInt(line.match(/^(\d+)\./)![1])
          : undefined;

        elements.push({
          id: `s${index}-e${i}`,
          type: 'bullets',
          content: [formatInlineMarkdown(bulletContent)],
          clickState: clickState++,
          listType: isOrdered ? 'ol' : 'ul',
          listStart: listStart,
        });
      } else if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        let code = '';
        let j = i + 1;
        while (j < linesInBlock.length && !linesInBlock[j].startsWith('```')) {
          code += linesInBlock[j] + '\n';
          j++;
        }
        elements.push({
          id: `s${index}-e${i}`,
          type: 'code',
          content: code.trim(),
          clickState: clickState++,
          language: language || 'text',
        });
        i = j;
      } else if (line.startsWith('> ')) {
        let quoteContent = line.slice(2);
        let j = i + 1;
        while (
          j < linesInBlock.length &&
          linesInBlock[j].trim().startsWith('> ')
        ) {
          quoteContent += '\n' + linesInBlock[j].trim().slice(2);
          j++;
        }
        elements.push({
          id: `s${index}-e${i}`,
          type: 'quote',
          content: formatInlineMarkdown(quoteContent),
          clickState: clickState++,
        });
        i = j - 1;
      } else if (line.startsWith('|')) {
        let tableContent = line + '\n';
        let j = i + 1;
        while (
          j < linesInBlock.length &&
          (linesInBlock[j].trim().startsWith('|') ||
            linesInBlock[j].trim().startsWith('+-'))
        ) {
          tableContent += linesInBlock[j] + '\n';
          j++;
        }
        if (tableContent.split('\n').length >= 3) {
          elements.push({
            id: `s${index}-e${i}`,
            type: 'table',
            content: tableContent.trim(),
            clickState: clickState++,
          });
          i = j - 1;
        } else {
          elements.push({
            id: `s${index}-e${i}`,
            type: 'markdown',
            content: formatInlineMarkdown(line),
            clickState: clickState++,
          });
        }
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
      } else if (line.startsWith('!audio(')) {
        const match = line.match(/!audio\(([^)]+)\)/);
        if (match)
          elements.push({
            id: `s${index}-e${i}`,
            type: 'audio',
            content: match[1],
            clickState: clickState++,
          });
      } else if (line.startsWith('!html(')) {
        let htmlContent = '';
        let j = i;
        let started = false;

        while (j < linesInBlock.length) {
          const rawLine = linesInBlock[j];
          let segment = rawLine;

          if (!started) {
            const markerIndex = rawLine.indexOf('!html(');
            if (markerIndex === -1) break;
            segment = rawLine.slice(markerIndex + '!html('.length);
            started = true;
          }

          const trimmedLine = segment.trimEnd();
          const hasClosing = trimmedLine.endsWith(')');
          const cleaned = hasClosing
            ? trimmedLine.replace(/\)\s*$/, '')
            : segment;

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

        while (j < linesInBlock.length) {
          let currentLine = linesInBlock[j];

          if (!started) {
            const startIdx = currentLine.indexOf('$$');
            currentLine = currentLine.slice(startIdx + 2);
            started = true;
          }

          const endIdx = currentLine.indexOf('$$');
          if (endIdx !== -1) {
            latexContent +=
              (latexContent ? '\n' : '') + currentLine.slice(0, endIdx);
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
        elements.push({
          id: `s${index}-e${i}`,
          type: 'markdown',
          content: formatInlineMarkdown(line),
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
