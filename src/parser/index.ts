import { SlideContent, SlideElement } from '../types/slide';
import { formatInlineMarkdown } from './markdownHelpers';

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  lineIndex: number;
}

export interface AutoAnimateMetadata {
  autoAnimate?: boolean;
  autoAnimateId?: string;
  autoAnimateType?: 'move' | 'scale' | 'fade' | 'opacity' | 'transform' | 'all';
  autoAnimateDuration?: number;
  autoAnimateEasing?: string;
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
    minHeadingLevel: 1,
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
    // 支持特殊字符后跟标题的情况，如 ⚡### 或 🇨🇳###
    const match = line.match(/^([^#]*?)(#{1,6})\s+/);
    if (!match) {
      return false;
    }
    const level = match[2].length; // match[2] 是 # 号部分
    return level >= resolvedOptions.minHeadingLevel;
  };

  let inCodeFence = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    const isFenceLine = trimmed.startsWith('```');
    if (isFenceLine) {
      inCodeFence = !inCodeFence;
      currentBlockLines.push(rawLine);
      continue;
    }

    if (inCodeFence) {
      currentBlockLines.push(rawLine);
      continue;
    }

    const isDelimiterLine =
      resolvedOptions.useDelimiter && /^---\s*$/.test(trimmed);
    const isHeadingBreak = isHeadingBreakLine(trimmed);

    // 检查是否在行内代码中，通过检查是否有未配对的反引号
    const inlineCodePattern = /`([^`]+)`/g;
    const inlineCodeMatches = [...trimmed.matchAll(inlineCodePattern)];
    
    // 检查标题模式但排除在行内代码中的情况
    // 支持特殊字符后跟标题的情况，如 ⚡### 或 🇨🇳###
    const headingPattern = /^([^#]*?)(#{1,6})\s+(.*)/;
    const headingMatch = trimmed.match(headingPattern);
    
    if (isDelimiterLine) {
      flushBlock();
      continue;
    }

    if (isHeadingBreak && headingMatch) {
      const fullMatch = headingMatch[0];
      let isInInlineCode = false;
      
      // 检查标题匹配部分是否在行内代码中
      for (const match of inlineCodeMatches) {
        if (fullMatch.includes(match[0])) {
          isInInlineCode = true;
          break;
        }
      }
      
      // 如果标题部分不在行内代码中，则按原逻辑处理
      if (!isInInlineCode) {
        if (
          currentBlockLines.length > 0 &&
          currentBlockLines.some((l) => l.trim().length > 0)
        ) {
          flushBlock();
        }
        currentBlockLines.push(rawLine);
        continue;
      }
    }

    currentBlockLines.push(rawLine);
  }

  flushBlock();

  const parsedSlides: SlideContent[] = [];

  slideBlocks.forEach((block, index) => {
    const linesInBlock = block.trim().split(/\r?\n/);
    const elements: SlideElement[] = [];
    let clickState = 0;
    let notes = '';
    let inNotes = false;
    let layout = 'auto';

    for (let i = 0; i < linesInBlock.length; i++) {
      const line = linesInBlock[i].trim();
      if (!line) continue;

      // 检查布局元数据
      const layoutMatch = line.match(/^layout:\s*([a-z-]+)/i);
      if (layoutMatch) {
        layout = layoutMatch[1].toLowerCase();
        continue;
      }

      // 检查是否进入演讲者备注部分
      if (line.toLowerCase().startsWith('### notes:') || line.toLowerCase() === '### notes') {
        inNotes = true;
        continue;
      }

      if (inNotes) {
        notes += (notes ? '\n' : '') + linesInBlock[i];
        continue;
      }

      // 检查是否为标题，支持特殊字符后跟标题的情况
      const titleMatch = line.match(/^([^#]*?)(#{1,6})\s+(.*)/);
      if (titleMatch) {
        const prefix = titleMatch[1] || '';
        const hashes = titleMatch[2];
        const content = titleMatch[3];
        const fullContent = prefix + content; // 包含前缀特殊字符
        const level = hashes.length;
        
        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        
        if (level === 1) {
          elements.push({
            id: `s${index}-e${i}`,
            type: 'title',
            content: formatInlineMarkdown(fullContent),
            clickState: 0,
            ...autoAnimateMetadata,
          });
        } else {
          // H2-H6 都视为 subtitle，但通过样式进行区分
          const fontSize = level === 2 ? undefined : (level === 3 ? '24px' : `${Math.max(18, 24 - (level - 3) * 2)}px`);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'subtitle',
            content: formatInlineMarkdown(fullContent),
            clickState: clickState++,
            style: fontSize ? { fontSize, marginTop: '10px' } : undefined,
            ...autoAnimateMetadata,
          });
        }
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

        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'bullets',
          content: [formatInlineMarkdown(bulletContent)],
          clickState: clickState++,
          listType: isOrdered ? 'ol' : 'ul',
          listStart: listStart,
          ...autoAnimateMetadata,
        });
      } else if (line.startsWith('```')) {
        const language = line.slice(3).trim();
        let code = '';
        let j = i + 1;
        while (j < linesInBlock.length && !linesInBlock[j].trim().startsWith('```')) {
          code += linesInBlock[j] + '\n';
          j++;
        }
        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'code',
          content: code.trim(),
          clickState: clickState++,
          language: language || 'text',
          ...autoAnimateMetadata,
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
        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'quote',
          content: formatInlineMarkdown(quoteContent),
          clickState: clickState++,
          ...autoAnimateMetadata,
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
          const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'table',
            content: tableContent.trim(),
            clickState: clickState++,
            ...autoAnimateMetadata,
          });
          i = j - 1;
        } else {
          const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'markdown',
            content: formatInlineMarkdown(line),
            clickState: clickState++,
            ...autoAnimateMetadata,
          });
        }
      } else if (line.startsWith('!icon(')) {
        const match = line.match(/!icon\(([^)]+)\)/);
        if (match) {
          const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'icon',
            content: match[1],
            clickState: clickState++,
            ...autoAnimateMetadata,
          });
        }
      } else if (line.startsWith('!grid')) {
        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'grid',
          content: '',
          clickState: clickState++,
          ...autoAnimateMetadata,
        });
      } else if (line.startsWith('!vector')) {
        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'vector',
          content: '',
          clickState: clickState++,
          ...autoAnimateMetadata,
        });
      } else if (line.startsWith('!image(')) {
        const match = line.match(/!image\(([^)]+)\)/);
        if (match) {
          const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'image',
            content: match[1],
            clickState: clickState++,
            ...autoAnimateMetadata,
          });
        }
      } else if (line.startsWith('!video(')) {
        const match = line.match(/!video\(([^)]+)\)/);
        if (match) {
          const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'video',
            content: match[1],
            clickState: clickState++,
            ...autoAnimateMetadata,
          });
        }
      } else if (line.startsWith('!audio(')) {
        const match = line.match(/!audio\(([^)]+)\)/);
        if (match) {
          const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
          elements.push({
            id: `s${index}-e${i}`,
            type: 'audio',
            content: match[1],
            clickState: clickState++,
            ...autoAnimateMetadata,
          });
        }
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

        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'html',
          content: htmlContent,
          clickState: clickState++,
          ...autoAnimateMetadata,
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

        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'math',
          content: { latex: latexContent.trim(), displayMode: true },
          clickState: clickState++,
          ...autoAnimateMetadata,
        });

        if (foundEnd) i = j;
      } else {
        const autoAnimateMetadata = parseAutoAnimateMetadata(linesInBlock[i]);
        elements.push({
          id: `s${index}-e${i}`,
          type: 'markdown',
          content: formatInlineMarkdown(line),
          clickState: clickState++,
          ...autoAnimateMetadata,
        });
      }
    }

    if (elements.length > 0) {
      parsedSlides.push({ id: `slide-${index}`, elements, notes: notes.trim(), layout });
    }
  });

  return parsedSlides;
};

/**
 * Parse auto-animate metadata from a line
 */
export const parseAutoAnimateMetadata = (line: string): AutoAnimateMetadata | null => {
  // Check for auto-animate directives in comments or special syntax
  const autoAnimateRegex = /<!--\s*auto-animate:\s*(.*?)\s*-->/gi;
  const idRegex = /<!--\s*data-id:\s*(.*?)\s*-->/gi;
  
  const autoAnimateMatch = autoAnimateRegex.exec(line);
  const idMatch = idRegex.exec(line);
  
  if (autoAnimateMatch || idMatch) {
    const metadata: AutoAnimateMetadata = {};
    
    if (autoAnimateMatch) {
      const params = autoAnimateMatch[1].split(',').map(p => p.trim());
      
      params.forEach(param => {
        if (param === 'true' || param === 'enable') {
          metadata.autoAnimate = true;
        } else if (param === 'false' || param === 'disable') {
          metadata.autoAnimate = false;
        } else if (param.includes('=')) {
          const [key, value] = param.split('=');
          const cleanKey = key.trim();
          const cleanValue = value.trim();
          
          switch (cleanKey) {
            case 'id':
              metadata.autoAnimateId = cleanValue;
              break;
            case 'type':
              if (['move', 'scale', 'fade', 'opacity', 'transform', 'all'].includes(cleanValue)) {
                metadata.autoAnimateType = cleanValue as any;
              }
              break;
            case 'duration':
              metadata.autoAnimateDuration = parseInt(cleanValue);
              break;
            case 'easing':
              metadata.autoAnimateEasing = cleanValue;
              break;
          }
        }
      });
    }
    
    if (idMatch) {
      metadata.autoAnimateId = idMatch[1].trim();
    }
    
    return metadata;
  }
  
  return null;
};

/**
 * 解析目录
 */
export const parseTableOfContents = (md: string): TOCItem[] => {
  const lines = md.split('\n');
  const toc: TOCItem[] = [];

  lines.forEach((line, index) => {
    const match = line.match(/^([^#]*?)(#{1,6})\s+(.+)$/);
    if (match) {
      const prefix = match[1] || '';
      const content = match[3];
      toc.push({
        id: `toc-${index}`,
        level: match[2].length,
        text: (prefix + content).trim(),
        lineIndex: index,
      });
    }
  });

  return toc;
};
