import { SlideContent } from '../../components/SlideTemplate';

/**
 * 导出幻灯片为 PNG
 * @param slides - 幻灯片内容数组
 * @param activeSlideIndex - 当前幻灯片索引（可选，默认为0）
 * @returns Promise<Blob> - PNG 图片 Blob
 */
export const exportToPNG = async (
  slides: SlideContent[],
  activeSlideIndex: number = 0
): Promise<Blob> => {
  const html2canvasModule = await import('html2canvas');
  const html2canvas = html2canvasModule.default as any;

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

    // 生成 PNG
    const canvas = await html2canvas(container, {
      scale: 2, // 提高导出质量
      useCORS: true,
      logging: false,
      backgroundColor: '#0a0a0a',
      width: 1920,
      windowWidth: 1920
    });

    // 转换为 Blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob as Blob);
      }, 'image/png', 0.95);
    });
  } finally {
    // 恢复容器状态
    container.style.visibility = originalVisibility;
  }
};

/**
 * 导出为 PNG 并触发下载
 * @param slides - 幻灯片内容数组
 * @param activeSlideIndex - 当前幻灯片索引
 */
export const downloadPNG = async (
  slides: SlideContent[],
  activeSlideIndex: number = 0
) => {
  try {
    const blob = await exportToPNG(slides, activeSlideIndex);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `slide-${activeSlideIndex + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error: unknown) {
    console.error('PNG export failed:', error);
    alert('导出 PNG 失败，请重试');
    throw error as Error;
  }
};
