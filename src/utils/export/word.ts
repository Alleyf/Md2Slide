import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
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

const createParagraphFromElement = (element: SlideElement): Paragraph | null => {
  const text = getElementText(element);
  if (!text) {
    return null;
  }

  if (element.type === 'title') {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_1,
    });
  }

  if (element.type === 'subtitle') {
    return new Paragraph({
      text,
      heading: HeadingLevel.HEADING_2,
    });
  }

  if (element.type === 'bullets') {
    return new Paragraph({
      children: [new TextRun(text)],
      bullet: {
        level: 0,
      },
    });
  }

  if (element.type === 'quote') {
    return new Paragraph({
      children: [new TextRun({ text, italics: true })],
    });
  }

  if (element.type === 'code') {
    return new Paragraph({
      children: [new TextRun({ text, font: 'Consolas' })],
    });
  }

  if (element.type === 'table') {
    return new Paragraph({
      children: [new TextRun({ text: `表格: ${text}` })],
    });
  }

  if (element.type === 'image') {
    return new Paragraph({
      children: [new TextRun({ text: `图片: ${text || '参见原文档'}` })],
    });
  }

  if (element.type === 'video' || element.type === 'audio') {
    const label = element.type === 'video' ? '视频' : '音频';
    return new Paragraph({
      children: [new TextRun({ text: `${label}: ${text || '参见原文档'}` })],
    });
  }

  return new Paragraph({
    children: [new TextRun(text)],
  });
};

export const exportToWord = async (slides: SlideContent[]): Promise<Blob> => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Word 导出仅在浏览器环境中可用');
  }

  const paragraphs: Paragraph[] = [];

  paragraphs.push(
    new Paragraph({
      text: '文档导出',
      heading: HeadingLevel.TITLE,
    })
  );

  paragraphs.push(
    new Paragraph({
      text: '',
    })
  );

  paragraphs.push(
    new Paragraph({
      text: '目录',
      heading: HeadingLevel.HEADING_1,
    })
  );

  slides.forEach((slide, index) => {
    const title = slide.title ? stripHtml(slide.title) : `第 ${index + 1} 页`;
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: `${index + 1}. ${title}` })],
        bullet: {
          level: 0,
        },
      })
    );
  });

  paragraphs.push(
    new Paragraph({
      text: '',
    })
  );

  slides.forEach((slide, index) => {
    const title = slide.title ? stripHtml(slide.title) : `第 ${index + 1} 页`;
    paragraphs.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
      })
    );

    if (slide.subtitle) {
      paragraphs.push(
        new Paragraph({
          text: stripHtml(slide.subtitle),
          heading: HeadingLevel.HEADING_2,
        })
      );
    }

    slide.elements.forEach(element => {
      if (!element || element.type === 'title' || element.type === 'subtitle') {
        return;
      }
      const paragraph = createParagraphFromElement(element);
      if (paragraph) {
        paragraphs.push(paragraph);
      }
    });

    if (index < slides.length - 1) {
      paragraphs.push(
        new Paragraph({
          text: '',
        })
      );
    }
  });

  const document = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  return blob as Blob;
};

export const downloadWord = async (slides: SlideContent[]) => {
  const blob = await exportToWord(slides);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'document.docx';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

