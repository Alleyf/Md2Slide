import { SlideContent } from '../../components/SlideTemplate';

/**
 * 导出幻灯片为 PDF
 * @param slides - 幻灯片内容数组
 * @param clickStates - 每个幻灯片的点击状态数量数组，null 表示只导出最终状态
 * @returns Promise<Blob> - PDF 文件 Blob
 */
export const exportToPDF = async (
  slides: SlideContent[],
  clickStates: number[] | null = null
): Promise<Blob> => {
  // @ts-ignore - html2pdf.js types not perfect
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default as any;

  // 获取当前幻灯片预览容器
  const container = document.querySelector('[class*="slide-"]');
  if (!container) {
    throw new Error('无法找到幻灯片容器');
  }

  // 创建临时容器来生成 PDF
  const tempContainer = document.createElement('div');
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  tempContainer.style.width = '1920px';
  tempContainer.style.height = '1080px';
  tempContainer.style.background = '#0a0a0a';
  document.body.appendChild(tempContainer);

  try {
    // 为每个幻灯片和点击状态生成页面
    const pages: Array<{ html: string }> = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideClickStates = clickStates ? [clickStates[i]] : null;
      const states = slideClickStates
        ? [slideClickStates[0]]
        : null;

      // 如果没有指定点击状态，只导出最终状态
      const statesToExport = states !== null ? states : [Math.max(0, slide.elements.length - 1)];

      for (const state of statesToExport) {
        // 克隆当前幻灯片容器
        const slideElement = container.cloneNode(true) as HTMLElement;

        // 设置点击状态以显示所有元素
        slideElement.querySelectorAll('[style*="opacity"]').forEach((el, idx) => {
          if (idx <= state) {
            (el as HTMLElement).style.opacity = '1';
          }
        });

    // 获取幻灯片 HTML
    const slideHTML = (slideElement as HTMLElement).innerHTML;

    pages.push({
      html: `<div style="width:1920px;height:1080px;background:#0a0a0a;padding:40px;">
            ${slideHTML}
          </div>`,
        });
      }
    }

    // 生成 PDF
    const pdfContent = pages.map((page) => page.html).join('');

    const pdf = await new Promise<Blob>((resolve, reject) => {
      html2pdf(pdfContent, {
        margin: 0,
        filename: 'presentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'px', format: 'a4', orientation: 'landscape' },
      }).then((pdfResult: any) => {
        resolve(pdfResult.output('blob'));
      }).catch((error: any) => {
        reject(error);
      });
    });

    return pdf;
  } finally {
    // 清理临时容器
    document.body.removeChild(tempContainer);
  }
};

/**
 * 导出为 PDF 并触发下载
 */
export const downloadPDF = async (
  slides: SlideContent[],
  clickStates: number[] | null = null
) => {
  try {
    const blob = await exportToPDF(slides, clickStates);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'presentation.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    console.error('PDF export failed:', error);
    throw error as Error;
  }
};
