import { SlideContent } from '../../components/SlideTemplate';

/**
 * 导出幻灯片为 PDF
 * @param slides - 幻灯片内容数组
 * @returns Promise<Blob> - PDF 文件 Blob
 */
export const exportToPDF = async (
  _slides: SlideContent[]
): Promise<Blob> => {
  // @ts-ignore - html2pdf.js types not perfect
  const html2pdfModule = await import('html2pdf.js');
  const html2pdf = html2pdfModule.default as any;

  // 获取预渲染的导出容器
  const container = document.getElementById('pdf-export-container');
  if (!container) {
    throw new Error('无法找到导出容器');
  }

  // 临时显示容器以便捕获
  const originalVisibility = container.style.visibility;
  container.style.visibility = 'visible';

  try {
    // 给一点时间让图片和 Katex 渲染完成
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 生成 PDF
    const pdf = await html2pdf()
      .from(container)
      .set({
        margin: 0,
        filename: 'presentation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 1, // 减小 scale 以防止大文件内存溢出
          useCORS: true,
          logging: false,
          backgroundColor: '#0a0a0a',
          width: 1920,
          windowWidth: 1920
        },
        jsPDF: {
          unit: 'px',
          format: [1920, 1080],
          orientation: 'landscape',
          hotfixes: ['px_scaling']
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          after: '.pdf-slide-page',
          before: '.pdf-slide-element' // 为每个 clickState 元素创建新页
        }
      })
      .outputPdf('blob');

    return pdf;
  } finally {
    // 恢复容器状态
    container.style.visibility = originalVisibility;
  }
};

/**
 * 导出为 PDF 并触发下载
 */
export const downloadPDF = async (
  slides: SlideContent[]
) => {
  try {
    const blob = await exportToPDF(slides);
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
    alert('导出 PDF 失败，请重试');
    throw error as Error;
  }
};
