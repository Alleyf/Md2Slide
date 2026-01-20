import { SlideContent } from '../../components/SlideTemplate';

/**
 * 等待容器内的所有图片和公式渲染完成
 */
const waitForContentRender = async (container: HTMLElement): Promise<void> => {
  // 等待图片加载完成
  const images = container.getElementsByTagName('img');
  const imagePromises: Promise<void>[] = [];
  
  for (const img of images) {
    if (img.complete) {
      continue;
    }
    
    const imagePromise = new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve(); // 即使加载失败也继续
      // 设置超时防止无限等待
      setTimeout(() => resolve(), 3000);
    });
    
    imagePromises.push(imagePromise);
  }

  // 等待所有图片加载完成
  await Promise.all(imagePromises);

  // 额外等待时间确保公式渲染完成
  await new Promise(resolve => setTimeout(resolve, 500));

  // 检查是否有Katex公式需要额外渲染时间
  const katexElements = container.querySelectorAll('.katex, .katex-display');
  if (katexElements.length > 0) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }
};

/**
 * 导出幻灯片为 PDF
 * @param slides - 幻灯片内容数组
 * @returns Promise<Blob> - PDF 文件 Blob
 */
export const exportToPDF = async (
  slides: SlideContent[]
): Promise<Blob> => {
  try {
    // 动态导入 html2pdf.js
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default as any;

    if (!html2pdf) {
      throw new Error('html2pdf.js 库加载失败');
    }

    // 获取预渲染的导出容器
    const container = document.getElementById('pdf-export-container');
    if (!container) {
      throw new Error('无法找到导出容器。请确保页面已正确加载。');
    }

    // 检查容器是否有内容
    if (container.children.length === 0) {
      throw new Error('导出容器为空，无法生成PDF');
    }

    // 临时显示容器以便捕获
    const originalVisibility = container.style.visibility;
    const originalZIndex = container.style.zIndex;
    const originalPosition = container.style.position;
    
    container.style.visibility = 'visible';
    container.style.zIndex = '2000';
    container.style.position = 'relative';

    try {
      // 等待内容完全渲染
      await waitForContentRender(container);

      // 生成 PDF
      const pdf = await html2pdf()
        .from(container)
        .set({
          margin: 0,
          filename: 'presentation.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: {
            scale: 2, // 提高分辨率
            useCORS: true,
            logging: false,
            backgroundColor: '#0a0a0a',
            width: 1920,
            windowWidth: 1920,
            allowTaint: true,
            removeContainer: false
          },
          jsPDF: {
            unit: 'px',
            format: [1920, 1080],
            orientation: 'landscape',
            hotfixes: ['px_scaling']
          },
          pagebreak: {
            mode: ['css', 'legacy']
          },
          enableLinks: false
        })
        .outputPdf('blob');

      if (!pdf) {
        throw new Error('PDF生成失败，返回空结果');
      }

      return pdf;
    } finally {
      // 恢复容器状态
      container.style.visibility = originalVisibility;
      container.style.zIndex = originalZIndex;
      container.style.position = originalPosition;
    }
  } catch (error) {
    console.error('PDF导出错误详情:', error);
    
    // 提供更详细的错误信息
    if (error instanceof Error) {
      if (error.message.includes('无法找到导出容器')) {
        throw new Error('导出容器未找到，请刷新页面后重试');
      } else if (error.message.includes('html2pdf.js')) {
        throw new Error('PDF生成库加载失败，请检查网络连接');
      } else if (error.message.includes('导出容器为空')) {
        throw new Error('没有可导出的内容，请确保幻灯片已正确加载');
      } else {
        throw new Error(`PDF导出失败: ${error.message}`);
      }
    } else {
      throw new Error('PDF导出过程中发生未知错误');
    }
  }
};

/**
 * 导出为 PDF 并触发下载
 */
export const downloadPDF = async (
  slides: SlideContent[]
): Promise<void> => {
  try {
    // 验证slides
    if (!slides || slides.length === 0) {
      throw new Error('没有可导出的幻灯片内容');
    }

    // 显示导出中提示
    const originalAlert = window.alert;
    const exportInProgress = () => {
      // 创建自定义提示框
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        font-family: sans-serif;
      `;
      overlay.innerHTML = `
        <div style="background: #333; padding: 20px 40px; border-radius: 8px; text-align: center;">
          <div style="margin-bottom: 10px;">📄 正在生成 PDF...</div>
          <div style="font-size: 14px; opacity: 0.8;">请稍候，这可能需要几秒钟</div>
        </div>
      `;
      document.body.appendChild(overlay);
      return overlay;
    };

    const loadingOverlay = exportInProgress();

    try {
      const blob = await exportToPDF(slides);
      
      // 移除加载提示
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.parentNode.removeChild(loadingOverlay);
      }

      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'presentation.pdf';
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 延迟释放URL，确保下载开始
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

    } catch (error) {
      // 确保在出错时也移除加载提示
      if (loadingOverlay && loadingOverlay.parentNode) {
        loadingOverlay.parentNode.removeChild(loadingOverlay);
      }
      throw error;
    }

  } catch (error: unknown) {
    console.error('PDF导出失败:', error);
    
    // 提供更友好的错误提示
    let errorMessage = '导出 PDF 失败，请重试';
    
    if (error instanceof Error) {
      if (error.message.includes('没有可导出的幻灯片')) {
        errorMessage = '当前没有可导出的幻灯片内容';
      } else if (error.message.includes('导出容器未找到')) {
        errorMessage = '导出功能初始化失败，请刷新页面后重试';
      } else if (error.message.includes('PDF生成库加载失败')) {
        errorMessage = 'PDF生成库加载失败，请检查网络连接后重试';
      } else if (error.message.includes('导出容器为空')) {
        errorMessage = '幻灯片内容未正确加载，请确保文件已正确解析';
      } else {
        errorMessage = `PDF导出失败: ${error.message}`;
      }
    }

    // 使用更友好的提示方式
    try {
      // 尝试使用现代的Notification API
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('PDF导出失败', {
          body: errorMessage,
          icon: '/favicon.ico'
        });
      } else {
        // 回退到alert，但格式化得更好
        alert(`❌ PDF导出失败\n\n${errorMessage}\n\n请检查控制台获取详细错误信息。`);
      }
    } catch (notificationError) {
      // 如果Notification也失败，使用普通alert
      alert(errorMessage);
    }

    throw new Error(errorMessage);
  }
};
