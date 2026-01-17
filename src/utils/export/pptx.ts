import { SlideContent, SlideElement } from '../../components/SlideTemplate';

const stripHtml = (value: string): string => {
  return value.replace(/<[^>]*>/g, '');
};

const getElementText = (element: SlideElement): string => {
  if (typeof element.content === 'string') {
    return stripHtml(element.content);
  }
  if (Array.isArray(element.content)) {
    return element.content.map(item => stripHtml(String(item))).join('\n');
  }
  return '';
};

export const exportToPPTX = async (slides: SlideContent[]): Promise<Blob> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('PPTX 导出仅在浏览器环境中可用');
  }

  const pptxModule = await import('pptxgenjs');
  const PptxGenJS = pptxModule.default as any;
  const pptx = new PptxGenJS();

  const titleSlide = pptx.addSlide();
  titleSlide.addText('目录', {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 1,
    fontSize: 32,
    bold: true,
  });

  const tocLines: string[] = [];
  slides.forEach((slide, index) => {
    const title = slide.title ? stripHtml(slide.title) : `第 ${index + 1} 页`;
    tocLines.push(`${index + 1}. ${title}`);
  });

  titleSlide.addText(tocLines.join('\n'), {
    x: 0.7,
    y: 1.5,
    w: 8,
    h: 4,
    fontSize: 18,
    bullet: true,
    lineSpacing: 28,
  });

  slides.forEach((slide, index) => {
    const current = pptx.addSlide();
    const title = slide.title ? stripHtml(slide.title) : `第 ${index + 1} 页`;
    current.addText(title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 1,
      fontSize: 28,
      bold: true,
    });

    const bodyLines: string[] = [];

    slide.elements.forEach(element => {
      if (!element) {
        return;
      }
      if (element.type === 'title' || element.type === 'subtitle') {
        return;
      }
      if (element.type === 'image') {
        const text = `图片: ${getElementText(element) || '参见原文档'}`;
        bodyLines.push(text);
        return;
      }
      if (element.type === 'video' || element.type === 'audio') {
        const text = `${element.type === 'video' ? '视频' : '音频'}: ${getElementText(element) || '参见原文档'}`;
        bodyLines.push(text);
        return;
      }
      if (element.type === 'table') {
        const tableText = getElementText(element);
        if (tableText) {
          bodyLines.push('表格:');
          bodyLines.push(tableText);
        }
        return;
      }
      if (element.type === 'code') {
        const codeText = getElementText(element);
        if (codeText) {
          bodyLines.push('代码片段:');
          bodyLines.push(codeText);
        }
        return;
      }
      const text = getElementText(element);
      if (text) {
        bodyLines.push(text);
      }
    });

    if (bodyLines.length > 0) {
      current.addText(bodyLines.join('\n'), {
        x: 0.7,
        y: 1.5,
        w: 8,
        h: 4.5,
        fontSize: 18,
        lineSpacing: 26,
        bullet: true,
      });
    }
  });

  const blob = await pptx.write('blob');
  return blob as Blob;
};

export const downloadPPTX = async (slides: SlideContent[]) => {
  const blob = await exportToPPTX(slides);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'presentation.pptx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

