/**
 * 图片工具函数
 * 提供图片下载和处理功能
 */

/**
 * 从URL下载图片
 * @param imageUrl 图片URL
 * @param filename 保存的文件名（不包含路径）
 * @returns Promise<void>
 */
export const downloadImage = async (imageUrl: string, filename?: string): Promise<void> => {
  try {
    // 如果没有提供文件名，从URL中提取或生成默认文件名
    let finalFilename = filename;
    if (!finalFilename) {
      const url = new URL(imageUrl);
      const pathname = url.pathname;
      const nameFromUrl = pathname.split('/').pop() || 'image';
      
      // 提取文件扩展名
      const extension = nameFromUrl.includes('.') 
        ? nameFromUrl.split('.').pop() 
        : 'png';
      
      // 生成唯一文件名
      const timestamp = Date.now();
      finalFilename = `ai-generated-${timestamp}.${extension}`;
    }

    // 获取图片数据
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 转换为Blob
    const blob = await response.blob();

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error(`下载图片失败: ${(error as Error).message}`);
  }
};

/**
 * 提取Markdown中的图片URL
 * @param markdown Markdown文本
 * @returns 图片URL数组
 */
export const extractImageUrls = (markdown: string): string[] => {
  const imageRegex = /!\[.*?\]\((.*?)\)/g;
  const urls: string[] = [];
  let match;

  while ((match = imageRegex.exec(markdown)) !== null) {
    const url = match[1];
    if (url && !url.startsWith('/')) {
      // 只处理外部URL，不处理本地路径
      urls.push(url);
    }
  }

  return urls;
};

/**
 * 将Markdown中的外部图片URL替换为本地路径
 * @param markdown 原始Markdown文本
 * @param replacements 替换映射 { oldUrl: newPath }
 * @returns 替换后的Markdown
 */
export const replaceImageUrls = (
  markdown: string,
  replacements: Record<string, string>
): string => {
  let result = markdown;

  for (const [oldUrl, newPath] of Object.entries(replacements)) {
    // 使用全局替换
    const regex = new RegExp(`!\\[.*?\\]\\(${escapeRegex(oldUrl)}\\)`, 'g');
    result = result.replace(regex, `![Image](${newPath})`);
  }

  return result;
};

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 检查图片是否为网络图片
 * @param url 图片URL
 * @returns 是否为网络图片
 */
export const isNetworkImage = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * 检查图片是否为本地图片
 * @param url 图片URL
 * @returns 是否为本地图片
 */
export const isLocalImage = (url: string): boolean => {
  return !isNetworkImage(url);
};

/**
 * 生成建议的图片路径
 * @param filename 文件名
 * @returns 建议的路径
 */
export const suggestImagePath = (filename: string): string => {
  return `/image/${filename}`;
};

/**
 * 裁切和调整图片尺寸
 * @param file 图片文件
 * @param width 目标宽度
 * @param height 目标高度
 * @returns Promise<Blob> 处理后的图片blob
 */
export const cropAndResizeImage = (file: File, width: number = 400, height: number = 300): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('无法获取Canvas上下文'));
      return;
    }
    
    const img = new Image();
    img.onload = () => {
      // 设置画布尺寸为目标尺寸
      canvas.width = width;
      canvas.height = height;
      
      // 计算裁切参数以保持宽高比并居中裁切
      const imgAspect = img.width / img.height;
      const targetAspect = width / height;
      
      let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;
      
      if (imgAspect > targetAspect) {
        // 图片更宽，需要裁切左右
        const scaledHeight = img.width / targetAspect;
        sy = (img.height - scaledHeight) / 2;
        sHeight = scaledHeight;
      } else {
        // 图片更高，需要裁切上下
        const scaledWidth = img.height * targetAspect;
        sx = (img.width - scaledWidth) / 2;
        sWidth = scaledWidth;
      }
      
      // 绘制裁切后的图片到画布
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
      
      // 将画布转换为Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('无法将图片转换为Blob'));
        }
      }, 'image/jpeg', 0.85);
    };
    
    img.onerror = () => {
      reject(new Error('无法加载图片'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * 将图片文件保存到指定路径
 * 注意：由于浏览器安全限制，此功能仅适用于本地开发环境或特定场景
 * @param file 图片文件
 * @param filename 文件名
 * @returns Promise<string> 保存后的文件路径
 */
export const saveImageToPublicDir = async (file: File, filename: string): Promise<string> => {
  try {
    // 创建一个临时URL
    const tempUrl = URL.createObjectURL(file);
    
    // 检查是否是图片文件
    if (!file.type.startsWith('image/')) {
      throw new Error('请选择有效的图片文件');
    }
    
    // 生成文件路径（仅用于前端显示）
    const filePath = `/image/${filename}`;
    
    // 在实际应用中，这里应该通过API将文件发送到服务器
    // 但现在我们只是返回一个虚拟路径
    console.log(`图片应保存到: public${filePath}`);
    
    return filePath;
  } catch (error) {
    console.error('保存图片失败:', error);
    throw error;
  }
};

/**
 * 处理用户上传的封面图片，自动裁切并保存
 * @param file 用户上传的图片文件
 * @param targetWidth 目标宽度，默认400
 * @param targetHeight 目标高度，默认300
 * @returns Promise<string> 处理后图片的路径
 */
export const processCoverImage = async (
  file: File, 
  targetWidth: number = 400, 
  targetHeight: number = 300
): Promise<string> => {
  try {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('请选择有效的图片文件');
    }
    
    // 裁切和调整尺寸
    const croppedBlob = await cropAndResizeImage(file, targetWidth, targetHeight);
    
    // 生成唯一的文件名
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFilename = `${file.name.replace(/\.[^/.]+$/, '')}_${timestamp}.${fileExtension}`;
    
    // 创建一个新文件对象
    const processedFile = new File([croppedBlob], uniqueFilename, { type: 'image/jpeg' });
    
    // 保存到公共目录
    const filePath = await saveImageToPublicDir(processedFile, uniqueFilename);
    
    return filePath;
  } catch (error) {
    console.error('处理封面图片失败:', error);
    throw error;
  }
};

/**
 * 批量下载Markdown中的所有网络图片
 * @param markdown Markdown文本
 * @returns Promise<Record<string, string>> 映射 { originalUrl: suggestedFilename }
 */
export const downloadAllImages = async (
  markdown: string
): Promise<Record<string, string>> => {
  const urls = extractImageUrls(markdown);
  const mappings: Record<string, string> = {};

  for (const url of urls) {
    try {
      // 生成文件名
      const timestamp = Date.now();
      const urlObj = new URL(url);
      const extension = urlObj.pathname.split('.').pop() || 'png';
      const filename = `ai-generated-${timestamp}.${extension}`;

      // 下载图片
      await downloadImage(url, filename);

      // 记录映射关系
      mappings[url] = suggestImagePath(filename);
    } catch (error) {
      console.error(`Failed to download image ${url}:`, error);
    }
  }

  return mappings;
};
